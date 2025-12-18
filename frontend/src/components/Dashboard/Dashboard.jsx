import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../utils/api';
import { 
  FileText, 
  CreditCard, 
  BrainCircuit, 
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    documents: 0,
    flashcards: 0,
    quizzes: 0,
    completedQuizzes: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiStatus, setAiStatus] = useState({ status: 'checking', message: '' });

  useEffect(() => {
    fetchDashboardData();
    checkAIStatus();
  }, []);

  const checkAIStatus = async () => {
    try {
      const response = await API.get('/ai/health');
      setAiStatus(response.data);
    } catch (error) {
      setAiStatus({ 
        status: 'error', 
        message: 'Ollama is not running. Start it with: ollama serve' 
      });
    }
  };

  const fetchDashboardData = async () => {
    try {
      const [docsRes, flashcardsRes, quizzesRes] = await Promise.all([
        API.get('/documents'),
        API.get('/flashcards'),
        API.get('/quizzes')
      ]);

      const completedQuizzes = quizzesRes.data.filter(q => q.completedAt).length;

      setStats({
        documents: docsRes.data.length,
        flashcards: flashcardsRes.data.length,
        quizzes: quizzesRes.data.length,
        completedQuizzes
      });

      // Create recent activity from latest items
      const activity = [];
      
      docsRes.data.slice(0, 3).forEach(doc => {
        activity.push({
          type: 'document',
          title: `Uploaded ${doc.originalName}`,
          date: new Date(doc.uploadDate),
          icon: FileText
        });
      });

      quizzesRes.data.slice(0, 3).forEach(quiz => {
        if (quiz.completedAt) {
          activity.push({
            type: 'quiz',
            title: `Completed quiz (${quiz.score}%)`,
            date: new Date(quiz.completedAt),
            icon: BrainCircuit
          });
        }
      });

      // Sort by date and take top 5
      activity.sort((a, b) => b.date - a.date);
      setRecentActivity(activity.slice(0, 5));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, color, link }) => (
    <Link 
      to={link}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`p-4 rounded-xl ${color}`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </Link>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your learning overview.</p>
      </div>

      {/* AI Status Banner */}
      {aiStatus.status === 'error' && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-800">AI Service Offline</p>
            <p className="text-sm text-yellow-700 mt-1">{aiStatus.message}</p>
          </div>
        </div>
      )}

      {aiStatus.status === 'ok' && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-800">AI Service Online</p>
            <p className="text-sm text-green-700 mt-1">
              Llama model ({aiStatus.model}) is ready to assist you
            </p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={FileText}
          label="Total Documents"
          value={stats.documents}
          color="bg-blue-500"
          link="/documents"
        />
        <StatCard
          icon={CreditCard}
          label="Flashcards"
          value={stats.flashcards}
          color="bg-purple-500"
          link="/flashcards"
        />
        <StatCard
          icon={BrainCircuit}
          label="Quizzes"
          value={stats.quizzes}
          color="bg-green-500"
          link="/quizzes"
        />
        <StatCard
          icon={TrendingUp}
          label="Completed"
          value={stats.completedQuizzes}
          color="bg-orange-500"
          link="/quizzes"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
        </div>

        {recentActivity.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No recent activity</p>
            <Link
              to="/documents"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <FileText className="w-5 h-5" />
              Upload Your First Document
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentActivity.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="bg-white p-2 rounded-lg">
                    <Icon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{activity.title}</p>
                    <p className="text-sm text-gray-500">
                      {activity.date.toLocaleDateString()} at{' '}
                      {activity.date.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/documents"
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition group"
        >
          <FileText className="w-8 h-8 text-indigo-600 mb-3 group-hover:scale-110 transition" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Upload Document
          </h3>
          <p className="text-sm text-gray-600">
            Add new PDF documents to analyze and learn from
          </p>
        </Link>

        <Link
          to="/flashcards"
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition group"
        >
          <CreditCard className="w-8 h-8 text-purple-600 mb-3 group-hover:scale-110 transition" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Study Flashcards
          </h3>
          <p className="text-sm text-gray-600">
            Review your AI-generated flashcards
          </p>
        </Link>

        <Link
          to="/quizzes"
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition group"
        >
          <BrainCircuit className="w-8 h-8 text-green-600 mb-3 group-hover:scale-110 transition" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Take Quiz
          </h3>
          <p className="text-sm text-gray-600">
            Test your knowledge with AI quizzes
          </p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;