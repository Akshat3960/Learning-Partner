import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/Layout/PrivateRoute';

// Auth Components
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

// Main Components
import Dashboard from './components/Dashboard/Dashboard';
import DocumentList from './components/Documents/DocumentList';
import DocumentViewer from './components/Documents/DocumentViewer';
import FlashcardList from './components/Flashcards/FlashcardList';
import FlashcardStudy from './components/Flashcards/FlashcardStudy';
import QuizList from './components/Quiz/QuizList';
import QuizTaker from './components/Quiz/QuizTaker';
import QuizResults from './components/Quiz/QuizResults';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/documents"
            element={
              <PrivateRoute>
                <DocumentList />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/documents/:id"
            element={
              <PrivateRoute>
                <DocumentViewer />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/flashcards"
            element={
              <PrivateRoute>
                <FlashcardList />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/flashcards/study/:documentId"
            element={
              <PrivateRoute>
                <FlashcardStudy />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/quizzes"
            element={
              <PrivateRoute>
                <QuizList />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/quizzes/:id/take"
            element={
              <PrivateRoute>
                <QuizTaker />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/quizzes/:id/results"
            element={
              <PrivateRoute>
                <QuizResults />
              </PrivateRoute>
            }
          />
          
          {/* Default Route */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;