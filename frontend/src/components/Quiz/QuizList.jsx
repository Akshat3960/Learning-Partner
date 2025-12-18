import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../utils/api';
import { 
  BrainCircuit, 
  Play, 
  CheckCircle2, 
  Clock,
  Trash2,
  FileText,
  Trophy,
  Loader2
} from 'lucide-react';

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await API.get('/quizzes');
      setQuizzes(response.data);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;

    try {
      await API.delete(`/quizzes/${quizId}`);
      fetchQuizzes();
    } catch (error) {
      console.error('Error deleting quiz:', error);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">My Quizzes</h1>
        <p className="text-gray-600">Test your knowledge with AI-generated quizzes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Quizzes</p>
              <p className="text-3xl font-bold text-gray-800">{quizzes.length}</p>
            </div>
            <div className="p-4 bg-blue-100 rounded-xl">
              <BrainCircuit className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Completed</p>
              <p className="text-3xl font-bold text-gray-800">
                {quizzes.filter(q => q.completedAt).length}
              </p>
            </div>
            <div className="p-4 bg-green-100 rounded-xl">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Avg Score</p>
              <p className="text-3xl font-bold text-gray-800">
                {quizzes.filter(q => q.score !== null).length > 0
                  ? Math.round(
                      quizzes
                        .filter(q => q.score !== null)
                        .reduce((acc, q) => acc + q.score, 0) /
                        quizzes.filter(q => q.score !== null).length
                    )
                  : 0}
                %
              </p>
            </div>
            <div className="p-4 bg-purple-100 rounded-xl">
              <Trophy className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quizzes List */}
      {quizzes.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <BrainCircuit className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No quizzes yet
          </h3>
          <p className="text-gray-600 mb-6">
            Generate quizzes from your documents to test your knowledge
          </p>
          <button
            onClick={() => navigate('/documents')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            <FileText className="w-5 h-5" />
            Go to Documents
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div
              key={quiz._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
            >
              {/* Quiz Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    quiz.completedAt ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    {quiz.completedAt ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    ) : (
                      <Clock className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 line-clamp-1">
                      {quiz.documentId?.originalName || 'Quiz'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {quiz.totalQuestions} questions
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => deleteQuiz(quiz._id)}
                  className="text-gray-400 hover:text-red-500 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Quiz Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Created</span>
                  <span className="text-gray-800">
                    {new Date(quiz.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                {quiz.completedAt && (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Completed</span>
                      <span className="text-gray-800">
                        {new Date(quiz.completedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Score</span>
                      <span className={`text-lg font-bold px-3 py-1 rounded-full ${getScoreColor(quiz.score)}`}>
                        {quiz.score}%
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Action Button */}
              {quiz.completedAt ? (
                <button
                  onClick={() => navigate(`/quizzes/${quiz._id}/results`)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                >
                  <Trophy className="w-4 h-4" />
                  View Results
                </button>
              ) : (
                <button
                  onClick={() => navigate(`/quizzes/${quiz._id}/take`)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                >
                  <Play className="w-4 h-4" />
                  Start Quiz
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizList;