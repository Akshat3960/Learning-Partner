const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Quiz = require('../models/Quiz');
const Document = require('../models/Document');

// @route   POST /api/quizzes
// @desc    Save generated quiz
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { documentId, questions } = req.body;

    if (!documentId || !questions || !Array.isArray(questions)) {
      return res.status(400).json({ message: 'Invalid request data' });
    }

    // Verify document belongs to user
    const document = await Document.findOne({
      _id: documentId,
      userId: req.user.id
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found or access denied' });
    }

    // Create quiz
    const quiz = new Quiz({
      userId: req.user.id,
      documentId: documentId,
      questions: questions,
      totalQuestions: questions.length
    });

    await quiz.save();

    res.json({ 
      message: 'Quiz saved successfully',
      quiz
    });
  } catch (err) {
    console.error('Save quiz error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/quizzes
// @desc    Get all quizzes for current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const quizzes = await Quiz.find({ userId: req.user.id })
      .populate('documentId', 'originalName')
      .sort({ createdAt: -1 });

    res.json(quizzes);
  } catch (err) {
    console.error('Get quizzes error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/quizzes/:id
// @desc    Get single quiz
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).populate('documentId', 'originalName');

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    res.json(quiz);
  } catch (err) {
    console.error('Get quiz error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/quizzes/document/:documentId
// @desc    Get quizzes for specific document
// @access  Private
router.get('/document/:documentId', auth, async (req, res) => {
  try {
    const quizzes = await Quiz.find({
      userId: req.user.id,
      documentId: req.params.documentId
    }).sort({ createdAt: -1 });

    res.json(quizzes);
  } catch (err) {
    console.error('Get document quizzes error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/quizzes/:id/submit
// @desc    Submit quiz answers
// @access  Private
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Invalid answers format' });
    }

    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    if (quiz.completedAt) {
      return res.status(400).json({ message: 'Quiz already completed' });
    }

    // Calculate score
    let correctCount = 0;
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / quiz.totalQuestions) * 100);

    // Save answers and score
    quiz.userAnswers = answers;
    quiz.score = score;
    quiz.completedAt = new Date();
    await quiz.save();

    res.json({
      message: 'Quiz submitted successfully',
      score,
      correctCount,
      totalQuestions: quiz.totalQuestions,
      quiz
    });
  } catch (err) {
    console.error('Submit quiz error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/quizzes/:id
// @desc    Delete a quiz
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    await Quiz.deleteOne({ _id: req.params.id });

    res.json({ message: 'Quiz deleted successfully' });
  } catch (err) {
    console.error('Delete quiz error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/quizzes/document/:documentId
// @desc    Delete all quizzes for a document
// @access  Private
router.delete('/document/:documentId', auth, async (req, res) => {
  try {
    await Quiz.deleteMany({
      userId: req.user.id,
      documentId: req.params.documentId
    });

    res.json({ message: 'All quizzes deleted successfully' });
  } catch (err) {
    console.error('Delete document quizzes error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;