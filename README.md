# Learning Partner - AI Powered Learning Assistant

A full-stack web application that helps users learn from PDF documents using AI-powered features with Llama (via Ollama).

## ✨ Features

- 🔐 **User Authentication** - Secure JWT-based authentication
- 📄 **PDF Management** - Upload, view, and manage PDF documents
- 🤖 **AI Chat** - Ask questions about your documents
- 📝 **Auto Summarization** - Generate AI summaries of documents
- 💡 **Concept Explanation** - Get detailed explanations of concepts
- 🃏 **Smart Flashcards** - Auto-generate and create custom flashcards with flip animation
- 🧠 **AI Quizzes** - Generate and take multiple-choice quizzes
- 📊 **Progress Tracking** - Monitor learning progress with analytics
- ⭐ **Favorites System** - Mark important flashcards for quick review
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile

## 🛠️ Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router
- Axios
- React PDF
- Lucide Icons

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Multer (File uploads)
- PDF Parse

### AI
- Ollama (Local AI runtime)
- Llama 3.2 (Language model)

## 📋 Prerequisites

Before running this project, make sure you have:

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- Ollama installed
- npm or yarn

## 🚀 Installation

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/learning-assistant.git
cd learning-assistant
```

### 2. Install Ollama and Llama Model

**On Windows:**
- Download from: https://ollama.ai/download
- Install and run

**On macOS:**
```bash
brew install ollama
```

**On Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

**Pull Llama model:**
```bash
ollama pull llama3.2
```

**Start Ollama:**
```bash
ollama serve
```

### 3. Setup Backend
```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
# Update MongoDB URI, JWT secret, etc.

# Start backend server
npm run dev
```

### 4. Setup Frontend
```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env if needed
# Default API URL is http://localhost:5000/api

# Start frontend
npm run dev
```

### 5. Start MongoDB
```bash
# If MongoDB is not running as a service
mongod

# Or start as service
sudo systemctl start mongodb
```

## 🔧 Configuration

### Backend Environment Variables

Create `backend/.env`:
```env
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb://localhost:27017/learning-assistant

# JWT Secret (use a strong random string)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Ollama Configuration
OLLAMA_URL=http://localhost:11434
LLAMA_MODEL=llama3.2

# File Upload
MAX_FILE_SIZE=10485760
```

### Frontend Environment Variables

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

## 📱 Usage

1. **Register/Login** - Create an account or login
2. **Upload PDFs** - Go to Documents and upload your study materials
3. **Chat with AI** - Ask questions about your documents
4. **Generate Flashcards** - Auto-generate or create custom flashcards
5. **Take Quizzes** - Test your knowledge with AI-generated quizzes
6. **Track Progress** - Monitor your learning on the dashboard

## 🏗️ Project Structure
```
learning-assistant/
├── backend/
│   ├── config/          # Configuration files
│   ├── middleware/      # Express middleware
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── services/        # Business logic (Llama service)
│   ├── uploads/         # Uploaded PDF files
│   ├── .env             # Environment variables
│   └── server.js        # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── context/     # React context
│   │   ├── utils/       # Utilities (API client)
│   │   ├── App.jsx      # Main app component
│   │   └── main.jsx     # Entry point
│   ├── .env             # Environment variables
│   └── index.html       # HTML template
└── README.md
```

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/user` - Get current user

### Documents
- `POST /api/documents/upload` - Upload PDF
- `GET /api/documents` - Get all documents
- `GET /api/documents/:id` - Get single document
- `GET /api/documents/:id/file` - Stream PDF file
- `DELETE /api/documents/:id` - Delete document

### AI Features
- `POST /api/ai/chat/:documentId` - Chat with document
- `POST /api/ai/summary/:documentId` - Generate summary
- `POST /api/ai/explain/:documentId` - Explain concept
- `POST /api/ai/flashcards/:documentId` - Generate flashcards
- `POST /api/ai/quiz/:documentId` - Generate quiz
- `GET /api/ai/health` - Check AI service status

### Flashcards
- `POST /api/flashcards` - Save generated flashcards
- `POST /api/flashcards/create` - Create custom flashcard
- `GET /api/flashcards` - Get all flashcards
- `GET /api/flashcards/favorites` - Get favorite flashcards
- `PUT /api/flashcards/:id` - Update flashcard
- `PUT /api/flashcards/:id/favorite` - Toggle favorite
- `DELETE /api/flashcards/:id` - Delete flashcard

### Quizzes
- `POST /api/quizzes` - Save generated quiz
- `GET /api/quizzes` - Get all quizzes
- `GET /api/quizzes/:id` - Get single quiz
- `POST /api/quizzes/:id/submit` - Submit quiz answers
- `DELETE /api/quizzes/:id` - Delete quiz

## 🐛 Troubleshooting

### Ollama Connection Error
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Restart Ollama
ollama serve
```

### MongoDB Connection Error
```bash
# Check if MongoDB is running
mongosh

# Start MongoDB
mongod
```

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```  





## 📸 Screenshots

### Dashboard
![Dashboard](screenshots/dashboard.png)

### Document Viewer with AI Chat
![Document Viewer](screenshots/document-viewer.png)

### Flashcards
![Flashcards](screenshots/flashcards.png)

### Quiz
![Quiz](screenshots/quiz.png)

---

Made with ❤️ and 🦙
