// server/routes/dailyChallenge.js
const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

const DailyChallenge = require('../../models/dailyChallenge');
const Quiz = require('../../models/quiz');
const News = require('../../models/news');

// @route   GET api/daily-challenge/current
// @desc    Get current daily challenge
// @access  Public
router.get('/current', async (req, res) => {
    try {
        const now = new Date();
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);

        // Find active or scheduled challenge for today
        const challenge = await DailyChallenge.findOne({
            date: { $gte: today },
            date: { $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
            isActive: true
        }).populate('quizId', 'title description totalQuestions timePerQuestion questions');

        if (!challenge) {
            return res.status(404).json({
                success: false,
                error: 'No daily challenge found for today'
            });
        }

        // Calculate time status
        const currentTime = now.getTime();
        const startTime = new Date(challenge.startTime).getTime();
        const endTime = new Date(challenge.endTime).getTime();

        let status = 'scheduled';
        if (currentTime >= startTime && currentTime <= endTime) {
            status = 'active';
        } else if (currentTime > endTime) {
            status = 'completed';
        }

        res.status(200).json({
            success: true,
            challenge: {
                ...challenge._doc,
                status
            }
        });
    } catch (error) {
        console.error('Error fetching daily challenge:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

// @route   GET api/daily-challenge/leaderboard/:id
// @desc    Get leaderboard for a challenge
// @access  Public
router.get('/leaderboard/:id', async (req, res) => {
    try {
        const challenge = await DailyChallenge.findById(req.params.id)
            .populate('participants.userId', 'firstName lastName email')
            .populate('winner.userId', 'firstName lastName');

        if (!challenge) {
            return res.status(404).json({
                success: false,
                error: 'Challenge not found'
            });
        }

        // Sort participants by score (descending) then timeTaken (ascending)
        const sortedParticipants = challenge.participants.sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            }
            return a.timeTaken - b.timeTaken;
        });

        // Add ranks
        sortedParticipants.forEach((participant, index) => {
            participant.rank = index + 1;
        });

        res.status(200).json({
            success: true,
            leaderboard: sortedParticipants.slice(0, 20),
            totalParticipants: sortedParticipants.length,
            challenge: {
                title: challenge.title,
                date: challenge.date,
                winner: challenge.winner
            }
        });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

// @route   POST api/daily-challenge/create
// @desc    Create a daily challenge (Admin only)
// @access  Private
router.post('/create', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'ROLE ADMIN') {
            return res.status(401).json({
                success: false,
                error: 'Not authorized'
            });
        }

        const { title, description, date } = req.body;

        // Set time to 8:30 PM to 8:40 PM
        const challengeDate = new Date(date);
        challengeDate.setHours(0, 0, 0, 0);

        const startTime = new Date(challengeDate);
        startTime.setHours(20, 30, 0, 0); // 8:30 PM

        const endTime = new Date(challengeDate);
        endTime.setHours(20, 40, 0, 0); // 8:40 PM

        // Get news from today
        const todayNews = await News.find({
            isPublished: true,
            publishedDate: { $gte: challengeDate }
        }).limit(20);

        if (todayNews.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No news articles available for today'
            });
        }

        // Create quiz questions from today's news
        const quizQuestions = [];

        todayNews.forEach(news => {
            if (news.questions && news.questions.length > 0) {
                news.questions.forEach(question => {
                    quizQuestions.push({
                        newsId: news._id,
                        question: question.question,
                        options: question.options,
                        correctAnswer: question.correctAnswer,
                        explanation: question.explanation
                    });
                });
            }
        });

        // Limit to 20 questions
        const selectedQuestions = quizQuestions.slice(0, 20);

        if (selectedQuestions.length < 5) {
            return res.status(400).json({
                success: false,
                error: 'Not enough questions available for quiz'
            });
        }

        // Create quiz
        const quiz = new Quiz({
            title: `Daily Challenge - ${challengeDate.toLocaleDateString()}`,
            description: 'Test your knowledge with questions from today\'s news',
            questions: selectedQuestions,
            totalQuestions: selectedQuestions.length,
            timePerQuestion: 10,
            totalTime: selectedQuestions.length * 10,
            isDailyQuiz: true,
            quizDate: challengeDate
        });

        await quiz.save();

        // Create daily challenge
        const challenge = new DailyChallenge({
            date: challengeDate,
            title: title || `Brain Gym Daily Challenge - ${challengeDate.toLocaleDateString()}`,
            description: description || 'Compete with others in today\'s 10-minute challenge!',
            quizId: quiz._id,
            startTime,
            endTime,
            status: 'scheduled'
        });

        await challenge.save();

        res.status(201).json({
            success: true,
            message: 'Daily challenge created successfully',
            challenge
        });
    } catch (error) {
        console.error('Error creating daily challenge:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

// @route   POST api/daily-challenge/participate
// @desc    Participate in daily challenge
// @access  Private
router.post('/participate', auth, async (req, res) => {
    try {
        const { challengeId, answers, timeTaken } = req.body;
        const userId = req.user.id;

        const challenge = await DailyChallenge.findById(challengeId).populate('quizId');
        if (!challenge) {
            return res.status(404).json({
                success: false,
                error: 'Challenge not found'
            });
        }

        // Check if challenge is active
        const now = new Date();
        const startTime = new Date(challenge.startTime);
        const endTime = new Date(challenge.endTime);

        if (now < startTime) {
            return res.status(400).json({
                success: false,
                error: 'Challenge has not started yet'
            });
        }

        if (now > endTime) {
            return res.status(400).json({
                success: false,
                error: 'Challenge has ended'
            });
        }

        // Calculate score
        const quiz = challenge.quizId;
        let score = 0;
        const answerDetails = [];

        quiz.questions.forEach((question, index) => {
            const userAnswer = answers[index];
            const isCorrect = userAnswer === question.correctAnswer;
            const questionTime = timeTaken[index] || 0;

            if (isCorrect) {
                score++;
            }

            answerDetails.push({
                questionIndex: index,
                userAnswer,
                correctAnswer: question.correctAnswer,
                isCorrect,
                timeTaken: questionTime
            });
        });

        const totalQuestions = quiz.questions.length;
        const percentage = (score / totalQuestions) * 100;
        const totalTimeTaken = timeTaken.reduce((a, b) => a + b, 0);

        // Check if user already participated
        const existingIndex = challenge.participants.findIndex(
            p => p.userId.toString() === userId
        );

        const participantData = {
            userId,
            score,
            totalQuestions,
            percentage,
            timeTaken: totalTimeTaken,
            answers: answerDetails,
            submittedAt: now
        };

        if (existingIndex > -1) {
            // Update existing participation
            challenge.participants[existingIndex] = participantData;
        } else {
            // Add new participation
            challenge.participants.push(participantData);
        }

        await challenge.save();

        res.status(200).json({
            success: true,
            message: 'Participation recorded successfully',
            score,
            totalQuestions,
            percentage,
            timeTaken: totalTimeTaken
        });
    } catch (error) {
        console.error('Error participating in challenge:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

module.exports = router;