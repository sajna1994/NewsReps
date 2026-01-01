// server/models/dailyChallenge.js
const mongoose = require('mongoose');

const dailyChallengeSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        unique: true,
        index: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz'
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['scheduled', 'active', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    participants: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        score: {
            type: Number,
            required: true
        },
        totalQuestions: {
            type: Number,
            required: true
        },
        percentage: {
            type: Number,
            required: true
        },
        timeTaken: {
            type: Number,
            required: true
        },
        answers: [{
            questionIndex: Number,
            userAnswer: Number,
            correctAnswer: Number,
            isCorrect: Boolean,
            timeTaken: Number
        }],
        submittedAt: {
            type: Date,
            default: Date.now
        },
        rank: Number
    }],
    winner: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        score: Number,
        timeTaken: Number
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('DailyChallenge', dailyChallengeSchema);