const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  summary: {
    type: String,
    default: null
  },
  extractedText: {
    type: String,
    default: null
  }
});

// Index for faster queries
documentSchema.index({ userId: 1, uploadDate: -1 });

module.exports = mongoose.model('Document', documentSchema);