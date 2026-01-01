const mongoose = require('mongoose');

const { Schema } = mongoose;

const QuizSchema = new Schema({
    title: {
        type: String,
        required: true,
        default: 'Daily Brain Challenge'
    },
    description: {
        type: String,
        default: 'Test your knowledge with today\'s news questions'
    },
    questions: [{
        newsId: {
            type: Schema.Types.ObjectId,
            ref: 'News',
            required: true
        },
        question: {
            type: String,
            required: true
        },
        options: [{
            type: String,
            required: true
        }],
        correctAnswer: {
            type: Number,
            required: true,
            min: 0,
            max: 3
        },
        explanation: {
            type: String
        },
        timeLimit: {
            type: Number,
            default: 10 // seconds per question
        }
    }],
    totalQuestions: {
        type: Number,
        default: 10
    },
    timePerQuestion: {
        type: Number,
        default: 10
    },
    totalTime: {
        type: Number,
        default: 100 // 10 questions * 10 seconds
    },
    isDailyQuiz: {
        type: Boolean,
        default: true
    },
    quizDate: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    },
    created: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Quiz', QuizSchema);