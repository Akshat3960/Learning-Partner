const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const Document = require('../models/Document');
const pdfParse = require('pdf-parse');

// @route   POST /api/documents/upload
// @desc    Upload a PDF document
// @access  Private
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF file' });
    }

    // Extract text from PDF
    let extractedText = '';
    try {
      const dataBuffer = fs.readFileSync(req.file.path);
      const pdfData = await pdfParse(dataBuffer);
      extractedText = pdfData.text;
      console.log('✅ PDF text extracted successfully');
    } catch (error) {
      console.error('PDF text extraction error:', error.message);
      // Continue without text extraction
    }

    // Create document record
    const document = new Document({
      userId: req.user.id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      filePath: req.file.path,
      extractedText: extractedText
    });

    await document.save();

    res.json({
      message: 'File uploaded successfully',
      document: {
        id: document._id,
        filename: document.filename,
        originalName: document.originalName,
        fileSize: document.fileSize,
        uploadDate: document.uploadDate
      }
    });
  } catch (err) {
    console.error('Upload error:', err.message);
    
    // Clean up file if document save fails
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkErr) {
        console.error('Error deleting file:', unlinkErr.message);
      }
    }
    
    res.status(500).json({ message: 'Server error during upload' });
  }
});

// @route   GET /api/documents
// @desc    Get all documents for current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.user.id })
      .select('-extractedText -filePath')
      .sort({ uploadDate: -1 });

    res.json(documents);
  } catch (err) {
    console.error('Get documents error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/documents/:id
// @desc    Get single document
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(document);
  } catch (err) {
    console.error('Get document error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/documents/:id/file
// @desc    Download/stream PDF file
// @access  Private
router.get('/:id/file', auth, async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if file exists
    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({ message: 'File not found on disk' });
    }

    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', `inline; filename="${document.originalName}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(document.filePath);
    fileStream.on('error', (err) => {
      console.error('File stream error:', err);
      res.status(500).json({ message: 'Error streaming file' });
    });
    
    fileStream.pipe(res);
  } catch (err) {
    console.error('File download error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/documents/:id
// @desc    Delete a document
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Delete file from disk
    if (fs.existsSync(document.filePath)) {
      try {
        fs.unlinkSync(document.filePath);
        console.log('✅ File deleted from disk');
      } catch (unlinkErr) {
        console.error('Error deleting file:', unlinkErr.message);
      }
    }

    // Delete document record
    await Document.deleteOne({ _id: req.params.id });

    res.json({ message: 'Document deleted successfully' });
  } catch (err) {
    console.error('Delete document error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;