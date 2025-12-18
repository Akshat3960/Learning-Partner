import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import API from '../../utils/api';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  MessageSquare,
  FileText,
  Lightbulb,
  CreditCard,
  BrainCircuit,
  Loader2,
  AlertCircle
} from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const DocumentViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [document, setDocument] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [pdfData, setPdfData] = useState(null);
  const [activeTab, setActiveTab] = useState('chat');
  
  // AI Features States
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [concept, setConcept] = useState('');
  const [explanation, setExplanation] = useState('');
  const [summary, setSummary] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDocument();
  }, [id]);

  const fetchDocument = async () => {
    try {
      const response = await API.get(`/documents/${id}`);
      setDocument(response.data);
      
      // Fetch PDF file as blob with authentication
      const pdfResponse = await API.get(`/documents/${id}/file`, {
        responseType: 'blob'
      });
      
      // Create object URL from blob
      const blob = new Blob([pdfResponse.data], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(blob);
      setPdfData(pdfUrl);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching document:', error);
      setError('Failed to load document');
      setLoading(false);
    }
  };

  // Cleanup object URL when component unmounts
  useEffect(() => {
    return () => {
      if (pdfData) {
        URL.revokeObjectURL(pdfData);
      }
    };
  }, [pdfData]);

  const handleChat = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setProcessing(true);
    setError('');

    try {
      const response = await API.post(`/ai/chat/${id}`, { question });
      
      setChatHistory([
        ...chatHistory,
        { type: 'user', text: question },
        { type: 'ai', text: response.data.answer }
      ]);
      
      setQuestion('');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to get response');
    } finally {
      setProcessing(false);
    }
  };

  const handleGenerateSummary = async () => {
    setProcessing(true);
    setError('');

    try {
      const response = await API.post(`/ai/summary/${id}`);
      setSummary(response.data.summary);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to generate summary');
    } finally {
      setProcessing(false);
    }
  };

  const handleExplainConcept = async (e) => {
    e.preventDefault();
    if (!concept.trim()) return;

    setProcessing(true);
    setError('');

    try {
      const response = await API.post(`/ai/explain/${id}`, { concept });
      setExplanation(response.data.explanation);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to explain concept');
    } finally {
      setProcessing(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    setProcessing(true);
    setError('');

    try {
      const response = await API.post(`/ai/flashcards/${id}`, { count: 10 });
      
      // Save flashcards
      await API.post('/flashcards', {
        documentId: id,
        flashcards: response.data.flashcards
      });
      
      alert('Flashcards generated successfully!');
      navigate('/flashcards');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to generate flashcards');
    } finally {
      setProcessing(false);
    }
  };

  const handleGenerateQuiz = async () => {
    setProcessing(true);
    setError('');

    try {
      const response = await API.post(`/ai/quiz/${id}`, { questionCount: 5 });
      
      // Save quiz
      await API.post('/quizzes', {
        documentId: id,
        questions: response.data.questions
      });
      
      alert('Quiz generated successfully!');
      navigate('/quizzes');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to generate quiz');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error && !document) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-xl text-gray-800">{error}</p>
          <button
            onClick={() => navigate('/documents')}
            className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Documents
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/documents')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                {document?.originalName}
              </h1>
              <p className="text-sm text-gray-500">
                {new Date(document?.uploadDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleGenerateFlashcards}
              disabled={processing}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
            >
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Generate Flashcards</span>
            </button>
            <button
              onClick={handleGenerateQuiz}
              disabled={processing}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              <BrainCircuit className="w-4 h-4" />
              <span className="hidden sm:inline">Generate Quiz</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* PDF Viewer */}
        <div className="flex-1 bg-gray-100 overflow-auto p-4">
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-4xl mx-auto">
            {pdfData ? (
              <Document
                file={pdfData}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                onLoadError={(error) => {
                  console.error('PDF load error:', error);
                  setError('Failed to load PDF file');
                }}
                loading={
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                  </div>
                }
                error={
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                      <p className="text-gray-800">Failed to load PDF</p>
                    </div>
                  </div>
                }
              >
                <Page 
                  pageNumber={pageNumber}
                  width={Math.min(window.innerWidth * 0.5, 800)}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                />
              </Document>
            ) : (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            )}

            {/* Page Navigation */}
            {numPages && (
              <div className="flex items-center justify-center gap-4 mt-4">
                <button
                  onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                  disabled={pageNumber === 1}
                  className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-600">
                  Page {pageNumber} of {numPages}
                </span>
                <button
                  onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
                  disabled={pageNumber === numPages}
                  className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* AI Features Sidebar */}
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium transition ${
                activeTab === 'chat'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Chat</span>
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium transition ${
                activeTab === 'summary'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Summary</span>
            </button>
            <button
              onClick={() => setActiveTab('explain')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium transition ${
                activeTab === 'explain'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Lightbulb className="w-4 h-4" />
              <span className="hidden sm:inline">Explain</span>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="m-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Tab Content */}
          <div className="flex-1 overflow-auto p-4">
            {activeTab === 'chat' && (
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-auto mb-4 space-y-4">
                  {chatHistory.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center mt-8">
                      Ask questions about your document
                    </p>
                  ) : (
                    chatHistory.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg ${
                          msg.type === 'user'
                            ? 'bg-indigo-50 ml-8'
                            : 'bg-gray-50 mr-8'
                        }`}
                      >
                        <p className="text-sm font-medium text-gray-800 mb-1">
                          {msg.type === 'user' ? 'You' : 'AI Assistant'}
                        </p>
                        <p className="text-sm text-gray-700">{msg.text}</p>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleChat} className="flex gap-2">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask a question..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    disabled={processing}
                  />
                  <button
                    type="submit"
                    disabled={processing || !question.trim()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                  >
                    {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send'}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'summary' && (
              <div>
                {!summary ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500 mb-4">
                      Generate an AI summary of this document
                    </p>
                    <button
                      onClick={handleGenerateSummary}
                      disabled={processing}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2 mx-auto"
                    >
                      {processing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        'Generate Summary'
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-3">Summary</h3>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{summary}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'explain' && (
              <div>
                <form onSubmit={handleExplainConcept} className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter a concept to explain
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={concept}
                      onChange={(e) => setConcept(e.target.value)}
                      placeholder="e.g., photosynthesis"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      disabled={processing}
                    />
                    <button
                      type="submit"
                      disabled={processing || !concept.trim()}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                    >
                      {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Explain'}
                    </button>
                  </div>
                </form>

                {explanation && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-3">Explanation</h3>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{explanation}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;