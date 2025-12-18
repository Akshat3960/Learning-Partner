import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../utils/api';
import { 
  Trophy, 
  Check, 
  X,
  Home,
  RefreshCw,
  Loader2
} from 'lucide-react';

const QuizResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  const fetchQuiz = async () => {
    try {
      const response = await API.get(`/quizzes/${id}`);
      
      if (!response.data.completedAt) {
        navigate(`/quizzes/${id}/take`);
        return;
      }
      
      setQuiz(response.data);
    } catch (error) {
      console.error('Error fetching quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'from-green-50 to-green-100';
    if (score >= 60) return 'from-yellow-50 to-yellow-100';
    return 'from-red-50 to-red-100';
  };

  const getMessage = (score) => {
    if (score >= 90) return 'Outstanding! 🎉';
    if (score >= 80) return 'Great job! 👏';
    if (score >= 70) return 'Good work! 👍';
    if (score >= 60) return 'Not bad! 💪';
    return 'Keep practicing! 📚';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  const correctCount = quiz.questions.filter(
    (q, idx) => quiz.userAnswers[idx] === q.correctAnswer
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Score Card */}
        <div className={`bg-gradient-to-br ${getScoreBgColor(quiz.score)} rounded-2xl shadow-2xl p-8 mb-8 text-center`}>
          <Trophy className={`w-20 h-20 mx-auto mb-4 ${getScoreColor(quiz.score)}`} />
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {getMessage(quiz.score)}
          </h1>
          <p className={`text-6xl font-bold ${getScoreColor(quiz.score)} mb-4`}>
            {quiz.score}%
          </p>
          <p className="text-xl text-gray-700">
            {correctCount} out of {quiz.totalQuestions} correct
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <p className="text-sm text-gray-600 mb-1">Total Questions</p>
            <p className="text-3xl font-bold text-gray-800">{quiz.totalQuestions}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <p className="text-sm text-gray-600 mb-1">Correct</p>
            <p className="text-3xl font-bold text-green-600">{correctCount}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <p className="text-sm text-gray-600 mb-1">Incorrect</p>
            <p className="text-3xl font-bold text-red-600">
              {quiz.totalQuestions - correctCount}
            </p>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Detailed Results</h2>
          
          <div className="space-y-6">
            {quiz.questions.map((question, index) => {
              const userAnswer = quiz.userAnswers[index];
              const isCorrect = userAnswer === question.correctAnswer;
              
              return (
                <div
                  key={index}
                  className={`border-2 rounded-xl p-6 ${
                    isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  {/* Question Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`p-2 rounded-full flex-shrink-0 ${
                      isCorrect ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      {isCorrect ? (
                        <Check className="w-5 h-5 text-white" />
                      ) : (
                        <X className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-600 mb-2">
                        Question {index + 1}
                      </p>
                      <p className="text-lg font-semibold text-gray-800 mb-4">
                        {question.question}
                      </p>

                      {/* Options */}
                      <div className="space-y-2 mb-4">
                        {question.options.map((option, optIndex) => {
                          const isUserAnswer = userAnswer === optIndex;
                          const isCorrectAnswer = question.correctAnswer === optIndex;
                          
                          return (
                            <div
                              key={optIndex}
                              className={`p-3 rounded-lg border-2 ${
                                isCorrectAnswer
                                  ? 'border-green-500 bg-green-100'
                                  : isUserAnswer && !isCorrect
                                  ? 'border-red-500 bg-red-100'
                                  : 'border-gray-200 bg-white'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                {isCorrectAnswer && (
                                  <Check className="w-5 h-5 text-green-600" />
                                )}
                                {isUserAnswer && !isCorrect && (
                                  <X className="w-5 h-5 text-red-600" />
                                )}
                                <span className={`${
                                  isCorrectAnswer
                                    ? 'text-green-900 font-medium'
                                    : isUserAnswer && !isCorrect
                                    ? 'text-red-900 font-medium'
                                    : 'text-gray-700'
                                }`}>
                                  {option}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <p className="text-sm font-semibold text-gray-700 mb-2">
                          Explanation:
                        </p>
                        <p className="text-sm text-gray-600">
                          {question.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/quizzes')}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-700 rounded-xl shadow-md hover:shadow-lg transition font-semibold"
          >
            <Home className="w-5 h-5" />
            Back to Quizzes
          </button>
          <button
            onClick={() => navigate('/documents')}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 transition font-semibold"
          >
            <RefreshCw className="w-5 h-5" />
            Study More
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;