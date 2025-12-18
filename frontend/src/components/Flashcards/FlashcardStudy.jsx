import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../utils/api';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  RotateCw,
  Star,
  Loader2
} from 'lucide-react';

const FlashcardStudy = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlashcards();
  }, [documentId]);

  const fetchFlashcards = async () => {
    try {
      const response = await API.get(`/flashcards/document/${documentId}`);
      setFlashcards(response.data);
    } catch (error) {
      console.error('Error fetching flashcards:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    try {
      await API.put(`/flashcards/${flashcards[currentIndex]._id}/favorite`);
      const updatedCards = [...flashcards];
      updatedCards[currentIndex].isFavorite = !updatedCards[currentIndex].isFavorite;
      setFlashcards(updatedCards);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-xl text-gray-800 mb-4">No flashcards found</p>
          <button
            onClick={() => navigate('/flashcards')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/flashcards')}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          
          <div className="bg-white px-6 py-3 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">
              Card <span className="font-bold text-indigo-600">{currentIndex + 1}</span> of{' '}
              <span className="font-bold">{flashcards.length}</span>
            </p>
          </div>

          <button
            onClick={toggleFavorite}
            className="p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition"
          >
            <Star
              className={`w-6 h-6 ${
                currentCard.isFavorite ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400'
              }`}
            />
          </button>
        </div>

        {/* Flashcard */}
        <div className="mb-8">
          <div
            className={`flip-card ${isFlipped ? 'flipped' : ''} cursor-pointer`}
            onClick={handleFlip}
          >
            <div className="flip-card-inner" style={{ minHeight: '400px' }}>
              {/* Front */}
              <div className="flip-card-front">
                <div className="bg-white rounded-2xl shadow-2xl p-8 h-full flex flex-col justify-center items-center">
                  <span className="text-sm font-semibold text-purple-600 bg-purple-100 px-4 py-2 rounded-full mb-6">
                    QUESTION
                  </span>
                  <p className="text-2xl font-semibold text-gray-800 text-center mb-8">
                    {currentCard.question}
                  </p>
                  <div className="flex items-center gap-2 text-gray-400">
                    <RotateCw className="w-5 h-5" />
                    <span className="text-sm">Click to reveal answer</span>
                  </div>
                </div>
              </div>

              {/* Back */}
              <div className="flip-card-back">
                <div className="bg-indigo-600 rounded-2xl shadow-2xl p-8 h-full flex flex-col justify-center items-center">
                  <span className="text-sm font-semibold text-indigo-200 bg-indigo-500 px-4 py-2 rounded-full mb-6">
                    ANSWER
                  </span>
                  <p className="text-xl text-white text-center">
                    {currentCard.answer}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-6 py-3 bg-white rounded-lg shadow-sm hover:shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          <button
            onClick={handleFlip}
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition flex items-center gap-2"
          >
            <RotateCw className="w-5 h-5" />
            Flip Card
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === flashcards.length - 1}
            className="flex items-center gap-2 px-6 py-3 bg-white rounded-lg shadow-sm hover:shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-8">
          <div className="bg-white rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardStudy;