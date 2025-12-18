import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../utils/api';
import FlashcardModal from './FlashcardModal';
import { 
  CreditCard, 
  Star, 
  Trash2, 
  Eye,
  FileText,
  Loader2,
  AlertCircle,
  Plus,
  Edit
} from 'lucide-react';

const FlashcardList = () => {
  const [flashcards, setFlashcards] = useState([]);
  const [groupedFlashcards, setGroupedFlashcards] = useState({});
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFlashcard, setEditingFlashcard] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFlashcards();
    fetchDocuments();
  }, [filter]);

  const fetchDocuments = async () => {
    try {
      const response = await API.get('/documents');
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const fetchFlashcards = async () => {
    try {
      const endpoint = filter === 'favorites' ? '/flashcards/favorites' : '/flashcards';
      const response = await API.get(endpoint);
      setFlashcards(response.data);
      
      // Group by document
      const grouped = response.data.reduce((acc, card) => {
        const docId = card.documentId?._id || 'unknown';
        const docName = card.documentId?.originalName || 'Unknown Document';
        
        if (!acc[docId]) {
          acc[docId] = {
            documentName: docName,
            cards: []
          };
        }
        acc[docId].cards.push(card);
        return acc;
      }, {});
      
      setGroupedFlashcards(grouped);
    } catch (error) {
      console.error('Error fetching flashcards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFlashcard = async (data) => {
    await API.post('/flashcards/create', data);
    fetchFlashcards();
  };

  const handleEditFlashcard = async (data) => {
    await API.put(`/flashcards/${editingFlashcard._id}`, {
      question: data.question,
      answer: data.answer
    });
    fetchFlashcards();
  };

  const openCreateModal = () => {
    setEditingFlashcard(null);
    setIsModalOpen(true);
  };

  const openEditModal = (flashcard) => {
    setEditingFlashcard(flashcard);
    setIsModalOpen(true);
  };

  const toggleFavorite = async (cardId, currentStatus) => {
    try {
      await API.put(`/flashcards/${cardId}/favorite`);
      fetchFlashcards();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const deleteFlashcard = async (cardId) => {
    if (!window.confirm('Are you sure you want to delete this flashcard?')) return;

    try {
      await API.delete(`/flashcards/${cardId}`);
      fetchFlashcards();
    } catch (error) {
      console.error('Error deleting flashcard:', error);
    }
  };

  const deleteDocumentFlashcards = async (docId) => {
    if (!window.confirm('Delete all flashcards for this document?')) return;

    try {
      await API.delete(`/flashcards/document/${docId}`);
      fetchFlashcards();
    } catch (error) {
      console.error('Error deleting flashcards:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">My Flashcards</h1>
            <p className="text-gray-600">Review and study your AI-generated flashcards</p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-md"
          >
            <Plus className="w-5 h-5" />
            Create Flashcard
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Flashcards ({flashcards.length})
          </button>
          <button
            onClick={() => setFilter('favorites')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
              filter === 'favorites'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Star className="w-4 h-4" />
            Favorites
          </button>
        </div>
      </div>

      {/* Flashcards by Document */}
      {Object.keys(groupedFlashcards).length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No flashcards yet
          </h3>
          <p className="text-gray-600 mb-6">
            Create flashcards manually or generate them from your documents
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <Plus className="w-5 h-5" />
              Create Flashcard
            </button>
            <button
              onClick={() => navigate('/documents')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              <FileText className="w-5 h-5" />
              Go to Documents
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedFlashcards).map(([docId, { documentName, cards }]) => (
            <div key={docId} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {/* Document Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{documentName}</h2>
                    <p className="text-sm text-gray-500">{cards.length} flashcards</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/flashcards/study/${docId}`)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  >
                    <Eye className="w-4 h-4" />
                    Study
                  </button>
                  <button
                    onClick={() => deleteDocumentFlashcards(docId)}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Flashcard Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cards.map((card) => (
                  <div
                    key={card._id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded">
                        QUESTION
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(card)}
                          className="text-gray-400 hover:text-indigo-600 transition"
                          title="Edit flashcard"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleFavorite(card._id, card.isFavorite)}
                          className="text-gray-400 hover:text-yellow-500 transition"
                          title="Toggle favorite"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              card.isFavorite ? 'fill-yellow-500 text-yellow-500' : ''
                            }`}
                          />
                        </button>
                        <button
                          onClick={() => deleteFlashcard(card._id)}
                          className="text-gray-400 hover:text-red-500 transition"
                          title="Delete flashcard"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-800 mb-2 line-clamp-3">
                      {card.question}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {card.answer.substring(0, 100)}...
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <FlashcardModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingFlashcard(null);
        }}
        onSave={editingFlashcard ? handleEditFlashcard : handleCreateFlashcard}
        flashcard={editingFlashcard}
        documents={documents}
      />
    </div>
  );
};

export default FlashcardList;