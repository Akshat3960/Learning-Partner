const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Flashcard = require('../models/Flashcard');
const Document = require('../models/Document');

// @route   POST /api/flashcards
// @desc    Save generated flashcards
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { documentId, flashcards } = req.body;

    if (!documentId || !flashcards || !Array.isArray(flashcards)) {
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

    // Create flashcard documents
    const flashcardDocs = flashcards.map(fc => ({
      userId: req.user.id,
      documentId: documentId,
      question: fc.question,
      answer: fc.answer,
      isFavorite: false
    }));

    const savedFlashcards = await Flashcard.insertMany(flashcardDocs);

    res.json({ 
      message: 'Flashcards saved successfully',
      flashcards: savedFlashcards
    });
  } catch (err) {
    console.error('Save flashcards error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/flashcards/create
// @desc    Create a single flashcard manually
// @access  Private
router.post('/create', auth, async (req, res) => {
  try {
    const { documentId, question, answer } = req.body;

    if (!documentId || !question || !answer) {
      return res.status(400).json({ message: 'Document, question, and answer are required' });
    }

    // Verify document belongs to user
    const document = await Document.findOne({
      _id: documentId,
      userId: req.user.id
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found or access denied' });
    }

    // Create flashcard
    const flashcard = new Flashcard({
      userId: req.user.id,
      documentId: documentId,
      question: question.trim(),
      answer: answer.trim(),
      isFavorite: false
    });

    await flashcard.save();

    // Populate document info
    await flashcard.populate('documentId', 'originalName');

    res.json({ 
      message: 'Flashcard created successfully',
      flashcard
    });
  } catch (err) {
    console.error('Create flashcard error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/flashcards
// @desc    Get all flashcards for current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const flashcards = await Flashcard.find({ userId: req.user.id })
      .populate('documentId', 'originalName')
      .sort({ createdAt: -1 });

    res.json(flashcards);
  } catch (err) {
    console.error('Get flashcards error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/flashcards/document/:documentId
// @desc    Get flashcards for specific document
// @access  Private
router.get('/document/:documentId', auth, async (req, res) => {
  try {
    const flashcards = await Flashcard.find({
      userId: req.user.id,
      documentId: req.params.documentId
    }).sort({ createdAt: -1 });

    res.json(flashcards);
  } catch (err) {
    console.error('Get document flashcards error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/flashcards/favorites
// @desc    Get favorite flashcards
// @access  Private
router.get('/favorites', auth, async (req, res) => {
  try {
    const flashcards = await Flashcard.find({
      userId: req.user.id,
      isFavorite: true
    })
      .populate('documentId', 'originalName')
      .sort({ createdAt: -1 });

    res.json(flashcards);
  } catch (err) {
    console.error('Get favorites error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/flashcards/:id
// @desc    Update a flashcard
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { question, answer } = req.body;

    const flashcard = await Flashcard.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!flashcard) {
      return res.status(404).json({ message: 'Flashcard not found' });
    }

    // Update fields
    if (question !== undefined) {
      flashcard.question = question.trim();
    }
    if (answer !== undefined) {
      flashcard.answer = answer.trim();
    }

    await flashcard.save();
    await flashcard.populate('documentId', 'originalName');

    res.json(flashcard);
  } catch (err) {
    console.error('Update flashcard error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/flashcards/:id/favorite
// @desc    Toggle favorite status
// @access  Private
router.put('/:id/favorite', auth, async (req, res) => {
  try {
    const flashcard = await Flashcard.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!flashcard) {
      return res.status(404).json({ message: 'Flashcard not found' });
    }

    flashcard.isFavorite = !flashcard.isFavorite;
    await flashcard.save();

    res.json(flashcard);
  } catch (err) {
    console.error('Toggle favorite error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/flashcards/:id
// @desc    Delete a flashcard
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const flashcard = await Flashcard.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!flashcard) {
      return res.status(404).json({ message: 'Flashcard not found' });
    }

    await Flashcard.deleteOne({ _id: req.params.id });

    res.json({ message: 'Flashcard deleted successfully' });
  } catch (err) {
    console.error('Delete flashcard error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/flashcards/document/:documentId
// @desc    Delete all flashcards for a document
// @access  Private
router.delete('/document/:documentId', auth, async (req, res) => {
  try {
    await Flashcard.deleteMany({
      userId: req.user.id,
      documentId: req.params.documentId
    });

    res.json({ message: 'All flashcards deleted successfully' });
  } catch (err) {
    console.error('Delete document flashcards error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;