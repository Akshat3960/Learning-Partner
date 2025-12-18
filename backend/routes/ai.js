const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const sanitizeInput = require('../middleware/sanitize');
const { aiLimiter } = require('../middleware/rateLimiter');
const Document = require('../models/Document');
const llamaService = require('../services/llamaService');

// @route   GET /api/ai/health
// @desc    Check if Ollama is running
// @access  Private
router.get('/health', auth, async (req, res) => {
  try {
    const health = await llamaService.healthCheck();
    res.json(health);
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to check AI service status' 
    });
  }
});

// @route   GET /api/ai/models
// @desc    List available Ollama models
// @access  Private
router.get('/models', auth, async (req, res) => {
  try {
    const models = await llamaService.listModels();
    res.json({ models });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch models' });
  }
});

// @route   POST /api/ai/chat/:documentId
// @desc    Chat with document using AI
// @access  Private
router.post('/chat/:documentId', auth, aiLimiter, sanitizeInput, async (req, res) => {
  try {
    const { question } = req.body;
    const { documentId } = req.params;

    if (!question || question.trim().length === 0) {
      return res.status(400).json({ message: 'Question is required' });
    }

    // Verify document belongs to user
    const document = await Document.findOne({ 
      _id: documentId, 
      userId: req.user.id 
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found or access denied' });
    }

    if (!document.extractedText) {
      return res.status(400).json({ 
        message: 'Document text not available. The PDF might not have extractable text.' 
      });
    }

    const answer = await llamaService.chat(document.extractedText, question);
    
    res.json({ answer, question });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to process question' 
    });
  }
});

// @route   POST /api/ai/summary/:documentId
// @desc    Generate document summary
// @access  Private
router.post('/summary/:documentId', auth, aiLimiter, async (req, res) => {
  try {
    const { documentId } = req.params;

    const document = await Document.findOne({ 
      _id: documentId, 
      userId: req.user.id 
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found or access denied' });
    }

    if (!document.extractedText) {
      return res.status(400).json({ 
        message: 'Document text not available. The PDF might not have extractable text.' 
      });
    }

    // Check if summary already exists (cache)
    if (document.summary) {
      return res.json({ summary: document.summary, cached: true });
    }

    const summary = await llamaService.generateSummary(document.extractedText);
    
    // Cache the summary
    document.summary = summary;
    await document.save();
    
    res.json({ summary, cached: false });
  } catch (error) {
    console.error('Summary error:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to generate summary' 
    });
  }
});

// @route   POST /api/ai/explain/:documentId
// @desc    Explain a concept from document
// @access  Private
router.post('/explain/:documentId', auth, aiLimiter, sanitizeInput, async (req, res) => {
  try {
    const { concept } = req.body;
    const { documentId } = req.params;

    if (!concept || concept.trim().length === 0) {
      return res.status(400).json({ message: 'Concept is required' });
    }

    const document = await Document.findOne({ 
      _id: documentId, 
      userId: req.user.id 
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found or access denied' });
    }

    if (!document.extractedText) {
      return res.status(400).json({ 
        message: 'Document text not available. The PDF might not have extractable text.' 
      });
    }

    const explanation = await llamaService.explainConcept(
      document.extractedText, 
      concept
    );
    
    res.json({ explanation, concept });
  } catch (error) {
    console.error('Explanation error:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to explain concept' 
    });
  }
});

// @route   POST /api/ai/flashcards/:documentId
// @desc    Generate flashcards from document
// @access  Private
router.post('/flashcards/:documentId', auth, aiLimiter, async (req, res) => {
  try {
    const { documentId } = req.params;
    const { count = 10 } = req.body;

    if (count < 1 || count > 20) {
      return res.status(400).json({ 
        message: 'Flashcard count must be between 1 and 20' 
      });
    }

    const document = await Document.findOne({ 
      _id: documentId, 
      userId: req.user.id 
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found or access denied' });
    }

    if (!document.extractedText) {
      return res.status(400).json({ 
        message: 'Document text not available. The PDF might not have extractable text.' 
      });
    }

    const flashcards = await llamaService.generateFlashcards(
      document.extractedText, 
      count
    );
    
    res.json({ flashcards, count: flashcards.length });
  } catch (error) {
    console.error('Flashcard generation error:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to generate flashcards' 
    });
  }
});

// @route   POST /api/ai/quiz/:documentId
// @desc    Generate quiz from document
// @access  Private
router.post('/quiz/:documentId', auth, aiLimiter, async (req, res) => {
  try {
    const { documentId } = req.params;
    const { questionCount = 5 } = req.body;

    if (questionCount < 1 || questionCount > 15) {
      return res.status(400).json({ 
        message: 'Question count must be between 1 and 15' 
      });
    }

    const document = await Document.findOne({ 
      _id: documentId, 
      userId: req.user.id 
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found or access denied' });
    }

    if (!document.extractedText) {
      return res.status(400).json({ 
        message: 'Document text not available. The PDF might not have extractable text.' 
      });
    }

    const questions = await llamaService.generateQuiz(
      document.extractedText, 
      questionCount
    );
    
    res.json({ questions, count: questions.length });
  } catch (error) {
    console.error('Quiz generation error:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to generate quiz' 
    });
  }
});

module.exports = router;