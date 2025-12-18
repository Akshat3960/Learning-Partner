const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true,
    index: true
  },
  questions: [{
    question: {
      type: String,
      required: true
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: function(v) {
          return v.length === 4;
        },
        message: 'Must have exactly 4 options'
      }
    },
    correctAnswer: {
      type: Number,
      required: true,
      min: 0,
      max: 3
    },
    explanation: {
      type: String,
      required: true
    }
  }],
  userAnswers: {
    type: [Number],
    default: []
  },
  score: {
    type: Number,
    default: null
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  completedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
quizSchema.index({ userId: 1, createdAt: -1 });
quizSchema.index({ userId: 1, documentId: 1 });

module.exports = mongoose.model('Quiz', quizSchema);