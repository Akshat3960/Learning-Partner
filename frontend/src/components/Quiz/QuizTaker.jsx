import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../utils/api';
import { 
  ArrowLeft, 
  Check,
  Loader2,
  AlertCircle
} from 'lucide-react';

const QuizTaker = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  const fetchQuiz = async () => {
    try {
      const response = await API.get(`/quizzes/${id}`);
      
      if (response.data.completedAt) {
        navigate(`/quizzes/${id}/results`);
        return;
      }
      
      setQuiz(response.data);
      setAnswers(new Array(response.data.questions.length).fill(null));
    } catch (error) {
      console.error('Error fetching quiz:', error);
      setError('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answerIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    if (answers.includes(null)) {
      if (!window.confirm('You have unanswered questions. Submit anyway?')) {
        return;
      }
    }

    setSubmitting(true);

    try {
      await API.post(`/quizzes/${id}/submit`, { answers });
      navigate(`/quizzes/${id}/results`);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      setError('Failed to submit quiz');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-xl text-gray-800 mb-4">{error}</p>
          <button
            onClick={() => navigate('/quizzes')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to exit? Progress will be lost.')) {
                navigate('/quizzes');
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Exit
          </button>
          
          <div className="bg-white px-6 py-3 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">
              Question <span className="font-bold text-indigo-600">{currentQuestion + 1}</span> of{' '}
              <span className="font-bold">{quiz.questions.length}</span>
            </p>
          </div>

          <div className="bg-white px-6 py-3 rounded-lg shadow-sm">
            <p className="text-sm">
              <span className="font-bold text-green-600">{answers.filter(a => a !== null).length}</span>
              {' '}/ {quiz.questions.length} answered
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-full h-3 mb-8 overflow-hidden shadow-sm">
          <div
            className="bg-indigo-600 h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-8">
            {question.question}
          </h2>

          <div className="space-y-4">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className={`w-full text-left p-5 rounded-xl border-2 transition ${
                  answers[currentQuestion] === index
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    answers[currentQuestion] === index
                      ? 'border-indigo-600 bg-indigo-600'
                      : 'border-gray-300'
                  }`}>
                    {answers[currentQuestion] === index && (
                      <Check className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <span className={`text-lg ${
                    answers[currentQuestion] === index
                      ? 'text-indigo-900 font-medium'
                      : 'text-gray-700'
                  }`}>
                    {option}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="px-6 py-3 bg-white rounded-lg shadow-sm hover:shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Previous
          </button>

          {currentQuestion === quiz.questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-8 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition disabled:opacity-50 font-medium flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Submit Quiz
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition font-medium"
            >
              Next
            </button>
          )}
        </div>

        {/* Question Navigator */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-600 mb-4">Question Navigator</h3>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {quiz.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-10 h-10 rounded-lg font-medium transition ${
                  currentQuestion === index
                    ? 'bg-indigo-600 text-white'
                    : answers[index] !== null
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizTaker;