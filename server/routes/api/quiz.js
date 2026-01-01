const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

// Bring in Models
const Quiz = require('../../models/quiz');
const News = require('../../models/news');

// @route   GET api/quiz/daily
// @desc    Get today's daily quiz
// @access  Public
router.get('/daily', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        let quiz = await Quiz.findOne({
            isDailyQuiz: true,
            isActive: true,
            quizDate: {
                $gte: today,
                $lt: tomorrow
            }
        }).populate('questions.newsId', 'title category');

        // If no quiz for today, create one automatically
        if (!quiz) {
            quiz = await createDailyQuiz();
        }

        res.status(200).json({
            success: true,
            quiz
        });
    } catch (error) {
        console.error('Error fetching daily quiz:', error);
        res.status(400).json({
            error: 'Your request could not be processed. Please try again.'
        });
    }
});

// @route   GET api/quiz/:id
// @desc    Get quiz by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id)
            .populate('questions.newsId', 'title category');

        if (!quiz) {
            return res.status(404).json({
                error: 'Quiz not found.'
            });
        }

        res.status(200).json({
            success: true,
            quiz
        });
    } catch (error) {
        res.status(400).json({
            error: 'Your request could not be processed. Please try again.'
        });
    }
});

// @route   POST api/quiz
// @desc    Create a quiz
// @access  Private (Admin)
router.post('/', auth, async (req, res) => {
    try {
        const {
            title,
            description,
            questions,
            totalQuestions,
            timePerQuestion,
            isDailyQuiz,
            quizDate
        } = req.body;

        // Check if user is admin
        if (req.user.role !== 'ROLES.Admin') {
            return res.status(401).json({
                error: 'Not authorized to create quizzes.'
            });
        }

        const quiz = new Quiz({
            title,
            description,
            questions,
            totalQuestions,
            timePerQuestion,
            totalTime: totalQuestions * timePerQuestion,
            isDailyQuiz,
            quizDate: quizDate || new Date(),
            isActive: true
        });

        const savedQuiz = await quiz.save();

        res.status(201).json({
            success: true,
            message: 'Quiz created successfully!',
            quiz: savedQuiz
        });
    } catch (error) {
        console.error('Error creating quiz:', error);
        res.status(400).json({
            error: 'Your request could not be processed. Please try again.'
        });
    }
});

// @route   POST api/quiz/submit
// @desc    Submit quiz answers
// @access  Private
router.post('/submit', auth, async (req, res) => {
    try {
        const { quizId, answers } = req.body;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({
                error: 'Quiz not found.'
            });
        }

        // Calculate score
        let score = 0;
        const results = [];

        quiz.questions.forEach((question, index) => {
            const userAnswer = answers[index];
            const isCorrect = userAnswer === question.correctAnswer;

            if (isCorrect) {
                score++;
            }

            results.push({
                question: question.question,
                userAnswer,
                correctAnswer: question.correctAnswer,
                isCorrect,
                explanation: question.explanation
            });
        });

        // Calculate percentage
        const percentage = (score / quiz.totalQuestions) * 100;

        // Save quiz result (you might want to create a QuizResult model)
        const quizResult = {
            userId: req.user.id,
            quizId: quiz._id,
            score,
            totalQuestions: quiz.totalQuestions,
            percentage,
            answers: results,
            submittedAt: new Date()
        };

        res.status(200).json({
            success: true,
            message: 'Quiz submitted successfully!',
            result: {
                score,
                totalQuestions: quiz.totalQuestions,
                percentage: percentage.toFixed(2),
                results
            }
        });
    } catch (error) {
        console.error('Error submitting quiz:', error);
        res.status(400).json({
            error: 'Your request could not be processed. Please try again.'
        });
    }
});
// Backend route (example - Node.js/Express)

// Helper function to create daily quiz
async function createDailyQuiz() {
    try {
        // Get today's date
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get news from last 7 days with questions
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const newsWithQuestions = await News.find({
            isPublished: true,
            publishedDate: { $gte: sevenDaysAgo },
            'questions.0': { $exists: true } // Has at least one question
        })
            .limit(50) // Limit for performance
            .exec();

        // Shuffle and pick 10 news articles
        const shuffledNews = [...newsWithQuestions].sort(() => 0.5 - Math.random());
        const selectedNews = shuffledNews.slice(0, 10);

        // Create quiz questions
        const quizQuestions = selectedNews.map(news => {
            if (news.questions && news.questions.length > 0) {
                // Pick a random question from the news article
                const randomQuestion = news.questions[Math.floor(Math.random() * news.questions.length)];

                return {
                    newsId: news._id,
                    question: randomQuestion.question,
                    options: randomQuestion.options,
                    correctAnswer: randomQuestion.correctAnswer,
                    explanation: randomQuestion.explanation,
                    timeLimit: 10
                };
            }
            return null;
        }).filter(question => question !== null);

        // If we have at least 5 questions, create the quiz
        if (quizQuestions.length >= 5) {
            const quiz = new Quiz({
                title: `Daily Brain Challenge - ${today.toLocaleDateString()}`,
                description: 'Test your knowledge with questions from recent news',
                questions: quizQuestions,
                totalQuestions: quizQuestions.length,
                timePerQuestion: 10,
                totalTime: quizQuestions.length * 10,
                isDailyQuiz: true,
                quizDate: today,
                isActive: true
            });

            return await quiz.save();
        }

        return null;
    } catch (error) {
        console.error('Error creating daily quiz:', error);
        return null;
    }
}

// @route   POST api/quiz/generate/daily
// @desc    Manually generate daily quiz
// @access  Private (Admin)
router.post('/generate/daily', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'ROLES.Admin') {
            return res.status(401).json({
                error: 'Not authorized to generate quizzes.'
            });
        }

        const quiz = await createDailyQuiz();

        if (quiz) {
            res.status(200).json({
                success: true,
                message: 'Daily quiz generated successfully!',
                quiz
            });
        } else {
            res.status(400).json({
                success: false,
                error: 'Not enough questions available to generate quiz.'
            });
        }
    } catch (error) {
        console.error('Error generating daily quiz:', error);
        res.status(400).json({
            error: 'Your request could not be processed. Please try again.'
        });
    }
});

module.exports = router;