import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// Import the logout action creator correctly
import { getProfile, logout } from './redux/slices/authSlice'; 
import { analyzeImage, clearCurrentAnalysis, setImage } from './redux/slices/analysisSlice';
import { startConversation, clearConversation } from './redux/slices/chatSlice';

// Icons
import { Camera, Sparkles, Loader } from 'lucide-react';

// Components
import CameraCapture from './components/camera/CameraCapture';
import AnalysisView from './components/analysis/AnalysisView';
import ChatInterface from './components/chat/ChatInterface';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import Header from './components/layout/Header';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { currentAnalysis, analyzing } = useSelector((state) => state.analysis);
  const { currentConversation } = useSelector((state) => state.chat);

  const [showCamera, setShowCamera] = useState(false);
  const [authMode, setAuthMode] = useState('login'); 
  const [view, setView] = useState('home'); 

  // Load User
  useEffect(() => {
    if (isAuthenticated && !user) {
      dispatch(getProfile());
    }
  }, [isAuthenticated, dispatch, user]);

  // Logout Logic
  const handleLogout = () => {
    dispatch(logout()); // Use the imported action creator
    dispatch(clearCurrentAnalysis());
    dispatch(clearConversation());
    localStorage.removeItem('token');
    setView('home'); // Reset view to home so next login starts fresh
  };

  // 1. Capture & Analyze
  const handleImageCapture = async (imageData) => {
    setShowCamera(false);
    dispatch(setImage(imageData));
    
    try {
      await dispatch(analyzeImage(imageData)).unwrap();
      setView('analysis');
    } catch (err) {
      alert("Analysis failed. Please try again.");
      console.error(err);
    }
  };

  // 2. Start Chat
  const handleStartChat = async () => {
    if (!currentAnalysis?.analysisId) return;
    try {
      await dispatch(startConversation(currentAnalysis.analysisId)).unwrap();
      setView('chat');
    } catch (err) {
      console.error(err);
    }
  };

  // --- RENDERING ---

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 animate-fade-in">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Ingredient Co-Pilot</h1>
            <p className="text-gray-500 mt-2">AI-native food intelligence</p>
          </div>
          {authMode === 'login' ? (
            <LoginForm onSwitchToSignup={() => setAuthMode('signup')} />
          ) : (
            <SignupForm onSwitchToLogin={() => setAuthMode('login')} />
          )}
        </div>
      </div>
    );
  }

  // Loading Screen (Analyzing)
  if (analyzing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-center p-4">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-primary-200 rounded-full animate-pulse"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader className="w-10 h-10 text-primary-600 animate-spin" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mt-6">Analyzing Ingredients...</h2>
        <p className="text-gray-500 mt-2">Checking additives, macros, and health impacts</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onNavigate={(v) => {
          if(v === 'home') {
            dispatch(clearCurrentAnalysis());
            setView('home');
          }
        }} 
        onLogout={handleLogout} /* 👈 FIX: Passing the function here */
      />

      <main className="max-w-7xl mx-auto">
        {/* Chat View */}
        {view === 'chat' && currentConversation ? (
          <div className="relative">
            <button 
              onClick={() => setView('analysis')}
              className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-sm border text-sm font-medium hover:bg-gray-50 transition-all"
            >
              ← Back to Analysis
            </button>
            <ChatInterface conversationId={currentConversation.conversationId} />
          </div>
        ) : view === 'analysis' && currentAnalysis ? (
          // Analysis View
          <div className="relative">
            <button 
              onClick={() => {
                dispatch(clearCurrentAnalysis());
                setView('home');
              }}
              className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-sm border text-sm font-medium hover:bg-gray-50 transition-all"
            >
              ← Scan New Item
            </button>
            <AnalysisView 
              analysis={currentAnalysis} 
              onStartChat={handleStartChat} 
            />
          </div>
        ) : (
          // Home / Dashboard View
          <div className="px-4 py-12 text-center animate-fade-in">
            <div className="max-w-md mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Hello, {user?.name} 👋</h2>
              <p className="text-gray-600 mb-10">
                Ready to decode your food? Scan a label to get started.
              </p>
              
              <button 
                onClick={() => setShowCamera(true)}
                className="w-full bg-primary-600 text-white py-6 rounded-2xl shadow-xl shadow-primary-200 hover:bg-primary-700 hover:scale-[1.02] transition-all flex flex-col items-center justify-center gap-3 group"
              >
                <div className="p-3 bg-white/20 rounded-full group-hover:scale-110 transition-transform">
                  <Camera className="w-8 h-8" />
                </div>
                <span className="text-xl font-semibold">Scan Ingredients</span>
              </button>

              <div className="mt-12 grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="text-2xl mb-2">⚡️</div>
                  <h3 className="font-bold">Instant</h3>
                  <p className="text-xs text-gray-500">AI-powered OCR</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="text-2xl mb-2">🧠</div>
                  <h3 className="font-bold">Smart</h3>
                  <p className="text-xs text-gray-500">Contextual Reasoning</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {showCamera && (
        <CameraCapture 
          onImageCapture={handleImageCapture} 
          onCancel={() => setShowCamera(false)} 
        />
      )}
    </div>
  );
}

export default App;