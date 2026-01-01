// server/cron/dailyChallenge.js
const cron = require('node-cron');
const DailyChallenge = require('../models/dailyChallenge');
const Quiz = require('../models/quiz');
const News = require('../models/news');

// Run at 8:25 PM every day to create challenge
cron.schedule('25 20 * * *', async () => {
    try {
        console.log('Creating daily challenge...');

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if challenge already exists for today
        const existingChallenge = await DailyChallenge.findOne({
            date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
        });

        if (existingChallenge) {
            console.log('Daily challenge already exists for today');
            return;
        }

        // Get news from today
        const todayNews = await News.find({
            isPublished: true,
            publishedDate: { $gte: today }
        }).limit(20);

        if (todayNews.length === 0) {
            console.log('No news articles for today');
            return;
        }

        // Create quiz from today's news
        const quizQuestions = [];

        todayNews.forEach(news => {
            if (news.questions && news.questions.length > 0) {
                news.questions.forEach(question => {
                    quizQuestions.push({
                        newsId: news._id,
                        ...question
                    });
                });
            }
        });

        // Limit to 20 questions
        const selectedQuestions = quizQuestions.slice(0, 20);

        if (selectedQuestions.length < 5) {
            console.log('Not enough questions for daily challenge');
            return;
        }

        // Create quiz
        const quiz = new Quiz({
            title: `Daily Challenge - ${today.toLocaleDateString()}`,
            description: 'Test your knowledge with questions from today\'s news',
            questions: selectedQuestions,
            totalQuestions: selectedQuestions.length,
            timePerQuestion: 10,
            totalTime: selectedQuestions.length * 10,
            isDailyQuiz: true,
            quizDate: today
        });

        await quiz.save();

        // Create daily challenge
        const startTime = new Date();
        startTime.setHours(20, 30, 0, 0); // 8:30 PM

        const endTime = new Date();
        endTime.setHours(20, 40, 0, 0); // 8:40 PM

        const challenge = new DailyChallenge({
            date: today,
            title: `Brain Gym Daily Challenge - ${today.toLocaleDateString()}`,
            description: 'Compete with others in today\'s 10-minute challenge!',
            quizId: quiz._id,
            startTime,
            endTime,
            status: 'scheduled'
        });

        await challenge.save();

        console.log('Daily challenge created successfully:', challenge._id);

    } catch (error) {
        console.error('Error creating daily challenge:', error);
    }
});

// Run at 8:41 PM to finalize challenge
cron.schedule('41 20 * * *', async () => {
    try {
        console.log('Finalizing daily challenge...');

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const challenge = await DailyChallenge.findOne({
            date: { $gte: today },
            status: 'active'
        });

        if (challenge) {
            // Determine winner
            const sortedParticipants = challenge.participants.sort((a, b) => {
                if (b.score !== a.score) {
                    return b.score - a.score;
                }
                return a.timeTaken - b.timeTaken;
            });

            if (sortedParticipants.length > 0) {
                const winner = sortedParticipants[0];
                challenge.winner = {
                    userId: winner.userId,
                    score: winner.score,
                    timeTaken: winner.timeTaken
                };
                challenge.status = 'completed';

                await challenge.save();

                console.log('Daily challenge finalized. Winner:', winner.userId);
            }
        }
    } catch (error) {
        console.error('Error finalizing daily challenge:', error);
    }
});