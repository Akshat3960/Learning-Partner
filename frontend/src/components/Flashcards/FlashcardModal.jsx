import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

const FlashcardModal = ({ isOpen, onClose, onSave, flashcard, documents }) => {
  const [documentId, setDocumentId] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (flashcard) {
        // Edit mode
        setDocumentId(flashcard.documentId?._id || flashcard.documentId);
        setQuestion(flashcard.question);
        setAnswer(flashcard.answer);
      } else {
        // Create mode - set first document as default
        if (documents && documents.length > 0) {
          setDocumentId(documents[0]._id);
        }
        setQuestion('');
        setAnswer('');
      }
      setError('');
    }
  }, [isOpen, flashcard, documents]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!question.trim() || !answer.trim()) {
      setError('Both question and answer are required');
      return;
    }

    if (!flashcard && !documentId) {
      setError('Please select a document');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSave({
        documentId,
        question: question.trim(),
        answer: answer.trim()
      });
      
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save flashcard');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            {flashcard ? 'Edit Flashcard' : 'Create New Flashcard'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Document Selection (only for new flashcards) */}
          {!flashcard && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Document *
              </label>
              <select
                value={documentId}
                onChange={(e) => setDocumentId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                required
              >
                <option value="">Choose a document...</option>
                {documents?.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    {doc.originalName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Question */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question *
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter the question for this flashcard..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
              rows="3"
              required
            />
          </div>

          {/* Answer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Answer *
            </label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Enter the answer for this flashcard..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
              rows="5"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                flashcard ? 'Update Flashcard' : 'Create Flashcard'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FlashcardModal;