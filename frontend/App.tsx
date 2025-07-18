import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Category, FinancialItem, CategoryConfig, GameLevel, GameState, FinancialItemCategoryEntry, AdminUser } from './types';
import { CATEGORIES_CONFIG, ALL_FINANCIAL_ITEMS, LEVEL_CONFIG } from './constants';
import { CheckCircleIcon, XCircleIcon, LightBulbIcon, SparklesIcon, TrophyIcon } from './components/Icons';
import { MsalProvider, useMsal, useIsAuthenticated } from '@azure/msal-react';
import { PublicClientApplication, InteractionStatus } from '@azure/msal-browser';
import { msalConfig } from './src/authConfig';
import { azureAdLogin, checkBackendHealth, saveToLocalStorage, getFromLocalStorage, getAllStudentAttempts, API_BASE_URL } from './src/api';
import axios from 'axios';

// Gemini API key: Vite exposes env vars as import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_API_KEY = (import.meta as any).env.VITE_GEMINI_API_KEY || (import.meta as any).env.GEMINI_API_KEY || (import.meta as any).env.API_KEY;

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

interface LoginScreenProps {
  onLoginSuccess: (email: string, displayName?: string) => void;
  onNavigateToAdminLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onNavigateToAdminLogin }) => {
  const { instance, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [isLoading, setIsLoading] = useState(false);

  const handleMicrosoftLogin = async () => {
    try {
      setIsLoading(true);
      const response = await instance.loginPopup({
        scopes: ["User.Read", "email", "profile"],
        prompt: "select_account"
      });
      
      if (response.account) {
        // Check if backend is available
        const isBackendAvailable = await checkBackendHealth();
        
        if (isBackendAvailable) {
          try {
            // Send Azure AD login to backend
            const loginResponse = await azureAdLogin(
              response.accessToken,
              response.account
            );
            
            if (loginResponse.success) {
              // Store user data and token
              const token = sanitizeToken(loginResponse.data.token);
              saveToLocalStorage('userToken', token);
              saveToLocalStorage('userData', loginResponse.data.user);
              
              const email = response.account.username || '';
              const displayName = response.account.name || '';
              
              onLoginSuccess(email, displayName);
            } else {
              throw new Error(loginResponse.message);
            }
          } catch (apiError) {
            console.error('Backend login error:', apiError);
            // Fallback to demo mode if backend fails
            const email = response.account.username || '';
            const displayName = response.account.name || '';
            onLoginSuccess(email, displayName);
          }
        } else {
          // Backend not available, use demo mode
          console.log('Backend not available, using demo mode');
          const email = response.account.username || '';
          const displayName = response.account.name || '';
          onLoginSuccess(email, displayName);
        }
      }
    } catch (error) {
      console.error('Microsoft login error:', error);
      alert('Microsoft login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    // Use a real backend student for demo
    try {
      const response = await fetch('import.meta.env.VITE_API_URL/auth/student/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobileNumber: '9999999999',
          studentId: 'DEMO',
          password: 'demopass'
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        saveToLocalStorage('userToken', sanitizeToken(data.data.token));
        saveToLocalStorage('userData', data.data.user);
        onLoginSuccess(data.data.user.mobileNumber, data.data.user.studentId);
      } else {
        alert(data.message || 'Demo login failed');
      }
    } catch (error) {
      alert('Demo login failed');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-800 to-slate-950 p-4 text-white">
      <div className="bg-white/10 backdrop-blur-lg p-8 sm:p-12 rounded-xl shadow-2xl text-center max-w-md w-full">
        <SparklesIcon className="w-16 h-16 text-sky-300 mx-auto mb-6" />
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">Student Login</h1>
        <p className="text-slate-300 mb-8">Sign in with your Microsoft Office 365 account to access the game.</p>
        
        <div className="space-y-6">
          {/* Microsoft Login Button */}
          <button
            onClick={handleMicrosoftLogin}
            disabled={isLoading || inProgress !== InteractionStatus.None}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg text-lg shadow-md transition duration-150 ease-in-out transform hover:scale-105 flex items-center justify-center space-x-3"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.5 2.75a.75.75 0 0 1 .75.75v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 .75-.75Z"/>
                  <path d="M11.5 7.75a.75.75 0 0 1 .75.75v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 .75-.75Z"/>
                  <path d="M11.5 12.75a.75.75 0 0 1 .75.75v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 .75-.75Z"/>
                  <path d="M11.5 17.75a.75.75 0 0 1 .75.75v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 .75-.75Z"/>
                </svg>
                <span>Sign in with Microsoft</span>
              </>
            )}
          </button>

          {/* Demo Login Button */}
          <button
            onClick={handleDemoLogin}
            className="w-full bg-slate-600 hover:bg-slate-700 text-white font-semibold py-3 px-6 rounded-lg text-lg shadow-md transition duration-150 ease-in-out transform hover:scale-105"
          >
            Demo Login (For Testing)
          </button>
        </div>
        
        <p className="text-xs text-slate-400 mt-6">
          Use your institutional Microsoft Office 365 account to access the Finance Quiz.
        </p>
        <button 
          onClick={onNavigateToAdminLogin}
          className="mt-4 text-xs text-sky-300 hover:text-sky-200 underline"
        >
          Admin Login
        </button>
      </div>
    </div>
  );
};

interface AdminLoginScreenProps {
  onAdminLoginSuccess: (adminUser: AdminUser) => void;
  onBackToStudentLogin: () => void;
}

const AdminLoginScreen: React.FC<AdminLoginScreenProps> = ({ onAdminLoginSuccess, onBackToStudentLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === '' || password.trim() === '') {
      alert('Please enter both username and password.');
      return;
    }

    try {
      const response = await fetch('import.meta.env.VITE_API_URL/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        // Store admin token
        localStorage.setItem('userToken', sanitizeToken(data.data.token));
        onAdminLoginSuccess(data.data.user);
      } else {
        alert(data.message || 'Admin login failed');
      }
    } catch (error) {
      alert('Admin login failed');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-neutral-700 to-neutral-900 p-4 text-white">
      <div className="bg-white/10 backdrop-blur-lg p-8 sm:p-12 rounded-xl shadow-2xl text-center max-w-md w-full">
        <SparklesIcon className="w-16 h-16 text-amber-300 mx-auto mb-6" />
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">Admin Login</h1>
        <p className="text-slate-300 mb-8">Access the administrator dashboard.</p>
        <form onSubmit={handleAdminLogin} className="space-y-6">
          <div>
            <label htmlFor="adminUsername" className="block text-sm font-medium text-slate-200 text-left mb-1">
              Username
            </label>
            <input
              type="text"
              id="adminUsername"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter admin username (e.g., admin)"
              className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition"
              required
            />
          </div>
          <div>
            <label htmlFor="adminPassword" className="block text-sm font-medium text-slate-200 text-left mb-1">
              Password
            </label>
            <input
              type="password"
              id="adminPassword"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition"
              required
            />
             <p className="text-xs text-slate-400 mt-1 text-left">Password check is conceptual for this demo.</p>
          </div>
          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-6 rounded-lg text-lg shadow-md transition duration-150 ease-in-out transform hover:scale-105"
          >
            Login
          </button>
        </form>
        <button 
          onClick={onBackToStudentLogin}
          className="mt-6 text-xs text-amber-300 hover:text-amber-200 underline"
        >
          Back to Student Login
        </button>
      </div>
    </div>
  );
};


interface AdminDashboardScreenProps {
  adminUser: AdminUser | null;
  onAdminLogout: () => void;
}

const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ adminUser, onAdminLogout }) => {
  const [studentAttempts, setStudentAttempts] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Refactored fetch logic
  const fetchStudentAttempts = useCallback(() => {
    const token = localStorage.getItem('userToken');
    if (token) {
      getAllStudentAttempts(token)
        .then(data => {
          console.log('Admin API response:', data);
          if (data.success && Array.isArray(data.data)) {
            setStudentAttempts(data.data);
            console.log('[ADMIN DASHBOARD] Loaded', data.data.length, 'sessions');
            if (data.data.length > 0) {
              console.log('[ADMIN DASHBOARD] First session:', data.data[0]);
            }
          } else {
            console.log('[ADMIN DASHBOARD] No data or unsuccessful response:', data);
          }
        })
        .catch((err) => { console.error('Admin fetch error', err); });
    } else {
      console.log('[ADMIN DASHBOARD] No userToken found in localStorage');
    }
  }, []);

  useEffect(() => {
    fetchStudentAttempts();
  }, [adminUser, fetchStudentAttempts]);

  const handleViewDetails = async (student: any) => {
    // If sessionId is present, fetch full session report
    if (student.id || student._id || student.sessionId) {
      const sessionId = student.id || student._id || student.sessionId;
      const token = localStorage.getItem('userToken');
      if (token) {
        const sessionReport = await fetchSessionReport(sessionId, token, true); // true = admin
        if (sessionReport) {
          // If sessionReport has session/detailedAnswers, use them; else fallback
          setSelectedStudent({
            ...(sessionReport.session || sessionReport),
            detailedAnswers: sessionReport.detailedAnswers,
            student: sessionReport.student
          });
          setShowStudentDetails(true);
          return;
        }
      }
    }
    // Fallback: show whatever data we have
    setSelectedStudent(student);
    setShowStudentDetails(true);
  };

  const handleBackToDashboard = () => {
    setShowStudentDetails(false);
    setSelectedStudent(null);
    setAiAnalysis('');
  };

  const generateAiAnalysis = async () => {
    setIsAnalyzing(true);
    const student = selectedStudent;
    // Use correct property names
    const studentName = student.studentName || student.studentIdentifier || student.student?.studentName || 'Unknown';
    const level = student.level || '-';
    const score = student.score || 0;
    const totalQuestions = student.totalQuestions || 0;
    const feedback = student.feedback || student.feedbackText || 'No feedback provided';
    const questionResponses = Array.isArray(student.detailedAnswers) && student.detailedAnswers.length > 0
      ? student.detailedAnswers
      : Array.isArray(student.answers) && student.answers.length > 0
        ? student.answers
        : Array.isArray(student.questionResponses) && student.questionResponses.length > 0
          ? student.questionResponses
          : [];

    // Build prompt for Gemini
    let prompt = `You are an expert financial literacy coach. Analyze the following student's quiz performance and provide insights on conceptual difficulties, strengths, and recommendations.\n`;
    prompt += `Student: ${studentName}\nLevel: ${level}\nScore: ${score}/${totalQuestions}\n`;
    prompt += `Feedback: ${feedback}\n`;
    prompt += `\nQuestion-by-question breakdown:\n`;
    questionResponses.forEach((q: any, idx: number) => {
      prompt += `Q${idx + 1}: ${q.questionText || q.question || '(No question text)'}\n`;
      prompt += `  Selected: ${Array.isArray(q.selectedCategories) ? q.selectedCategories.join(', ') : (q.selectedCategories || q.selectedAnswer || '-')}, `;
      prompt += `Correct: ${Array.isArray(q.correctCategories) ? q.correctCategories.join(', ') : (q.correctCategories || q.correctAnswer || '-')}\n`;
      prompt += `  Result: ${q.isCorrect === true ? 'Correct' : q.isCorrect === false ? 'Incorrect' : '-'}\n`;
      if (q.timeSpent !== undefined) prompt += `  Time spent: ${q.timeSpent} sec\n`;
    });
    prompt += `\nPlease summarize the student's conceptual strengths, weaknesses, and suggest targeted learning recommendations. Be concise and actionable.`;

    if (GEMINI_API_KEY) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
        const payload = {
          contents: [
            {
              role: 'user',
              parts: [
                { text: prompt }
              ]
            }
          ]
        };
        // Debug log
        console.log('Gemini API request:', url, payload);
        const response = await axios.post(
          url,
          payload,
          {
            headers: { 'Content-Type': 'application/json' }
          }
        );
        // Debug log
        console.log('Gemini API response:', response.data);
        const aiText = response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'No analysis returned.';
        setAiAnalysis(aiText);
      } catch (err) {
        setAiAnalysis('Failed to generate AI analysis. Please check your Gemini API key and try again.');
        console.error('Gemini AI error:', err);
        if (err.response) {
          console.error('Gemini API error details:', err.response.data);
        }
      }
      setIsAnalyzing(false);
      return;
    }
    // Fallback to mock if no API key
    setTimeout(() => {
      let analysis = `AI Analysis for Student ${studentName} (Level ${level}):\n\n`;
      analysis += `Overall Performance: ${score}/${totalQuestions} (${totalQuestions ? Math.round((score/totalQuestions)*100) : 0}%)\n\n`;
      analysis += `No Gemini API key found. This is a mock analysis.\n`;
      setAiAnalysis(analysis);
      setIsAnalyzing(false);
    }, 2000);
  };

  // Show student details view if a student is selected
  console.log('Rendering AdminDashboardScreen');
  if (showStudentDetails && selectedStudent) {
    return (
      <StudentDetailsView
        student={selectedStudent}
        onBack={handleBackToDashboard}
        onGenerateAnalysis={generateAiAnalysis}
        aiAnalysis={aiAnalysis}
        isAnalyzing={isAnalyzing}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-800 p-4 sm:p-6 text-white">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold">Admin Dashboard</h1>
        <div>
          <span className="text-sm mr-4">Welcome, {adminUser?.username || 'Admin'}!</span>
          <button
            onClick={onAdminLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg text-sm shadow-md transition"
          >
            Logout
          </button>
          <button
            onClick={fetchStudentAttempts}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg text-sm shadow-md transition ml-4"
          >
            Refresh
          </button>
        </div>
      </header>

      <div className="bg-slate-700 p-6 rounded-xl shadow-xl mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-sky-300">Student Performance Overview (Conceptual)</h2>
        <p className="text-sm text-slate-300 mb-4">
          This is a conceptual representation. In a live application, this data would be fetched from a secure backend database
          and would include search, filtering, and pagination. Each row would allow drilling down into specific answers.
        </p>
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="min-w-full divide-y divide-slate-600">
            <thead className="bg-slate-600/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Student ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Mobile</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Level</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Score</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Time (s)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Feedback</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-slate-700 divide-y divide-slate-600">
              {studentAttempts.map((data, index) => (
                <tr key={index} className="hover:bg-slate-600/70 transition-colors">
                  {/* Student Name or Identifier */}
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {data.student?.studentName || data.studentIdentifier || data.studentId}
                  </td>
                  {/* Student ID (if available) */}
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {data.student?.studentId || data.studentId || ""}
                  </td>
                  {/* Level */}
                  <td className="px-4 py-3 whitespace-nowrap text-sm">{data.level}</td>
                  {/* Score */}
                  <td className="px-4 py-3 whitespace-nowrap text-sm">{data.score}/{data.totalQuestions}</td>
                  {/* Time Taken */}
                  <td className="px-4 py-3 whitespace-nowrap text-sm">{data.timeTakenSeconds || data.timeTaken}</td>
                  {/* Feedback */}
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {data.feedbackText ? "Yes" : (data.feedback ? "Yes" : "No")}
                  </td>
                  {/* Actions */}
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <button 
                      onClick={() => handleViewDetails(data)}
                      className="text-sky-400 hover:text-sky-300 underline text-xs"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
         <p className="text-xs text-slate-400 mt-4 text-center">Data shown is for illustrative purposes only.</p>
      </div>

      <div className="bg-slate-700 p-6 rounded-xl shadow-xl">
        <h2 className="text-2xl font-semibold mb-3 text-amber-300">AI-Powered "Difficult Concepts" Analysis (Conceptual)</h2>
        <p className="text-sm text-slate-300 mb-2">
          The backend would enable a feature where, for a selected student or session:
        </p>
        <ol className="list-decimal list-inside space-y-2 text-sm text-slate-300">
          <li>Incorrect answers and student feedback are compiled.</li>
          <li>This data is sent to the Google Gemini API (e.g., <code className="bg-black/30 px-1 rounded">'gemini-2.5-flash-preview-04-17'</code>) with a prompt to analyze conceptual difficulties.</li>
          <li>The AI's textual analysis (e.g., "Student struggles with differentiating current vs. non-current liabilities, or income vs. equity recognition") is returned.</li>
          <li>This summary would be displayed here and included in detailed Excel reports sent to <code className="bg-black/30 px-1 rounded">'taral.pathak@micamail.in'</code>.</li>
        </ol>
        <button 
          onClick={generateAiAnalysis}
          disabled={!selectedStudent || isAnalyzing}
          className="mt-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-lg text-sm shadow-md transition disabled:opacity-50"
        >
          {isAnalyzing ? 'Analyzing...' : 'Trigger AI Analysis'}
        </button>
        
        {aiAnalysis && (
          <div className="mt-6 p-4 bg-slate-600 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-amber-300">AI Analysis Results</h3>
            <pre className="text-sm text-slate-200 whitespace-pre-wrap">{aiAnalysis}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

// Utility to fetch a session report by sessionId
async function fetchSessionReport(sessionId: string, token: string, isAdmin: boolean = false) {
  try {
    const url = isAdmin
      ? `import.meta.env.VITE_API_URL/admin/session/${sessionId}`
      : `import.meta.env.VITE_API_URL/quiz/session/${sessionId}/report`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (data.success && data.data) {
      return data.data;
    }
    return null;
  } catch (e) {
    console.error('[ADMIN] Failed to fetch session report:', e);
    return null;
  }
}

// Student Details View Component
const StudentDetailsView: React.FC<{
  student: any;
  onBack: () => void;
  onGenerateAnalysis: () => void;
  aiAnalysis: string;
  isAnalyzing: boolean;
}> = ({ student, onBack, onGenerateAnalysis, aiAnalysis, isAnalyzing }) => {
  console.log('StudentDetailsView student object:', student);

  const studentName = student.student?.studentName || student.studentName || student.studentIdentifier || "Unknown";
  const studentNumber = student.studentIdentifier || student.student?._id || student.id || "N/A";
  const score = student.score || 0;
  const totalQuestions = student.totalQuestions || 0;
  const timeTaken = student.timeTakenSeconds || 0;
  const percentage = totalQuestions ? Math.round((score / totalQuestions) * 100) : 0;

  // Use detailedAnswers if present and non-empty, else fallback
  const questionResponses = Array.isArray(student.detailedAnswers) && student.detailedAnswers.length > 0
    ? student.detailedAnswers
    : Array.isArray(student.answers) && student.answers.length > 0
      ? student.answers
      : Array.isArray(student.questionResponses) && student.questionResponses.length > 0
        ? student.questionResponses
        : [];

  const incorrectAnswers = questionResponses.filter((q: any) => !q.isCorrect && !q.correct);
  const correctAnswers = questionResponses.filter((q: any) => q.isCorrect || q.correct);

  return (
    <div className="min-h-screen bg-slate-800 p-4 sm:p-6 text-white">
      <header className="flex justify-between items-center mb-8">
        <div>
          <button
            onClick={onBack}
            className="bg-slate-600 hover:bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg text-sm shadow-md transition"
          >
            ← Back to Dashboard
          </button>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold">Student Details</h1>
        <div className="text-right">
          <p className="text-sm text-slate-300">Student ID: {studentNumber}</p>
          <p className="text-sm text-slate-300">Mobile: {student.mobile}</p>
        </div>
      </header>

      {/* Performance Summary */}
      <div className="bg-slate-700 p-6 rounded-xl shadow-xl mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-amber-300">Student: {studentName}</h2>
        <p>Student Number: {studentNumber}</p>
        <p>Score: {score} / {totalQuestions}</p>
        <p>Time: {timeTaken}s</p>
        
        {student.feedback && (
          <div className="mt-6 p-4 bg-slate-600 rounded-lg">
            <h3 className="text-lg font-semibold text-amber-300 mb-2">Student Feedback</h3>
            <p className="text-slate-200">"{student.feedback}"</p>
          </div>
        )}
      </div>

      {/* Question-by-Question Analysis */}
      <div className="bg-slate-700 p-6 rounded-xl shadow-xl mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-amber-300">Question-by-Question Analysis</h2>
        <div className="space-y-4">
          {questionResponses.length === 0 ? (
            <p>No question-by-question data available.</p>
          ) : (
            questionResponses.map((q: any, idx: number) => (
              <div key={idx} className={`mb-4 p-4 rounded-xl shadow border-2 ${q.isCorrect === true ? 'border-green-500 bg-green-900/20' : q.isCorrect === false ? 'border-red-500 bg-red-900/20' : 'border-slate-600 bg-slate-800'}`}> 
                <div className="font-semibold mb-1 text-slate-100 text-lg">Q{idx + 1}: {q.questionText || q.question || "(No question text)"}</div>
                <div className="mb-1">
                  <span className="font-medium text-slate-300">Selected:</span> <span className="text-slate-200">{Array.isArray(q.selectedCategories) ? q.selectedCategories.join(', ') : (q.selectedCategories || q.selectedAnswer || "-")}</span>
                </div>
                <div className="mb-1">
                  <span className="font-medium text-slate-300">Correct:</span> <span className="text-slate-200">{Array.isArray(q.correctCategories) ? q.correctCategories.join(', ') : (q.correctCategories || q.correctAnswer || "-")}</span>
                </div>
                <div className="mb-1 flex items-center">
                  <span className="font-medium text-slate-300 mr-2">Result:</span>
                  {q.isCorrect === true ? (
                    <span className="inline-flex items-center px-2 py-1 rounded bg-green-500 text-white text-xs font-bold">✅ Correct</span>
                  ) : q.isCorrect === false ? (
                    <span className="inline-flex items-center px-2 py-1 rounded bg-red-500 text-white text-xs font-bold">❌ Incorrect</span>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </div>
                {q.timeSpent !== undefined && (
                  <div className="text-xs text-slate-400 mt-1">Time spent: {q.timeSpent} sec</div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* AI Analysis Section */}
      <div className="bg-slate-700 p-6 rounded-xl shadow-xl">
        <h2 className="text-2xl font-semibold mb-3 text-amber-300">AI-Powered Analysis</h2>
        <p className="text-sm text-slate-300 mb-4">
          Generate AI analysis of student performance and conceptual difficulties.
        </p>
        <button 
          onClick={onGenerateAnalysis}
          disabled={isAnalyzing}
          className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-lg text-sm shadow-md transition disabled:opacity-50"
        >
          {isAnalyzing ? 'Analyzing...' : 'Generate AI Analysis'}
        </button>
        
        {aiAnalysis && (
          <div className="mt-6 p-4 bg-slate-600 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-amber-300">AI Analysis Results</h3>
            <pre className="text-sm text-slate-200 whitespace-pre-wrap">{aiAnalysis}</pre>
          </div>
        )}
      </div>
    </div>
  );
};


interface LevelSelectorProps {
  onSelectLevel: (level: GameLevel) => void;
  studentIdentifier: string | null;
  attemptedLevels: any[];
}

const LevelSelector: React.FC<LevelSelectorProps> = ({ onSelectLevel, studentIdentifier, attemptedLevels }) => {
  const getLevelAttemptStatus = (level: GameLevel) => {
    const levelAttempts = attemptedLevels.filter(attempt => attempt.level === level);
    if (levelAttempts.length === 0) return null;
    
    // Get the latest attempt
    const latestAttempt = levelAttempts.sort((a, b) => 
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    )[0];
    
    return {
      attempted: true,
      score: latestAttempt.score,
      totalQuestions: latestAttempt.totalQuestions,
      percentage: latestAttempt.percentage,
      completedAt: latestAttempt.completedAt
    };
  };

  // Add a logout handler at the top level
  const handleStudentLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('attemptedLevels');
    window.location.reload(); // Or setGameState(GameState.Login) if you want a state-based approach
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-700 to-slate-900 p-4 text-white">
      <div className="bg-white/10 backdrop-blur-lg p-8 sm:p-12 rounded-xl shadow-2xl text-center max-w-lg w-full">
        <SparklesIcon className="w-16 h-16 text-sky-300 mx-auto mb-6" />
        <h1 className="text-4xl sm:text-5xl font-bold mb-1">Welcome{studentIdentifier ? `, ${studentIdentifier}` : ''}!</h1>
        <p className="text-lg sm:text-xl text-slate-300 mb-8">Select your difficulty level to start the Financial Literacy Challenge.</p>
        
        {/* Progress Summary */}
        {attemptedLevels.length > 0 && (
          <div className="mb-6 p-4 bg-slate-700/50 rounded-lg">
            <h3 className="text-lg font-semibold text-amber-300 mb-2">Your Progress</h3>
            <p className="text-sm text-slate-300">
              Completed: {attemptedLevels.length} of {LEVEL_CONFIG.length} levels
            </p>
          </div>
        )}
        
        <div className="space-y-4">
          {LEVEL_CONFIG.map(levelInfo => {
            const attemptStatus = getLevelAttemptStatus(levelInfo.level);
            
            return (
              <button
                key={levelInfo.level}
                onClick={() => onSelectLevel(levelInfo.level)}
                className={`w-full ${levelInfo.color} ${levelInfo.hoverColor} text-white font-semibold py-4 px-6 rounded-lg text-xl shadow-md transition duration-150 ease-in-out transform hover:scale-105 focus:ring-4 focus:ring-opacity-50 ${levelInfo.borderColor.replace('border-', 'ring-')} relative`}
                aria-label={`Select Level ${levelInfo.level}: ${levelInfo.name}`}
              >
                <div className="flex justify-between items-center">
                  <div className="text-left">
                    <div className="flex items-center">
                      <span>Level {levelInfo.level}: {levelInfo.name}</span>
                      {attemptStatus && (
                        <span className="ml-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                          ✓ Completed
                        </span>
                      )}
                    </div>
                    <span className="block text-sm font-normal opacity-80 mt-1">{levelInfo.description}</span>
                    {attemptStatus && (
                      <div className="text-xs mt-2 opacity-90">
                        <span>Score: {attemptStatus.score}/{attemptStatus.totalQuestions} ({attemptStatus.percentage}%)</span>
                        <br />
                        <span>Completed: {new Date(attemptStatus.completedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
         <p className="text-xs text-slate-400 mt-10">
          Items are based on terminology from Indian corporate annual reports.
          Total items: {ALL_FINANCIAL_ITEMS.length}.
        </p>
        <button
          onClick={handleStudentLogout}
          className="mt-8 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg text-sm shadow-md transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};


interface StudentFeedbackScreenProps {
  onSubmitFeedback: (feedback: string) => void;
  studentIdentifier: string | null;
  level: GameLevel | null;
}

const StudentFeedbackScreen: React.FC<StudentFeedbackScreenProps> = ({ onSubmitFeedback, studentIdentifier, level }) => {
  const [feedbackText, setFeedbackText] = useState('');
  const levelInfo = level ? LEVEL_CONFIG.find(l => l.level === level) : null;

  // Add a logout handler at the top level
  const handleStudentLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('attemptedLevels');
    window.location.reload(); // Or setGameState(GameState.Login) if you want a state-based approach
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitFeedback(feedbackText);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-teal-600 to-cyan-700 p-4 text-white">
      <div className="bg-white/15 backdrop-blur-xl p-8 sm:p-10 rounded-xl shadow-2xl max-w-lg w-full">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-center">Feedback</h1>
        <p className="text-slate-200 mb-1 text-center">Student: {studentIdentifier || "N/A"}</p>
        {levelInfo && <p className="text-slate-200 mb-6 text-center">Level: {levelInfo.level} ({levelInfo.name})</p>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="feedback" className="block text-sm font-medium text-slate-100 text-left mb-2">
              How was your experience with this level? Any comments or suggestions? (Optional)
            </label>
            <textarea
              id="feedback"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={4}
              placeholder="Enter your feedback here..."
              className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-500 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition text-white"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 px-6 rounded-lg text-lg shadow-md transition duration-150 ease-in-out transform hover:scale-105"
          >
            Submit Feedback & View Report
          </button>
        </form>
        <p className="text-xs text-slate-300 mt-6 text-center">
          Your feedback helps us improve the game!
        </p>
        <button
          onClick={handleStudentLogout}
          className="mt-8 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg text-sm shadow-md transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};


interface ReportPreviewScreenProps {
  studentIdentifier: string | null;
  score: number;
  totalQuestions: number;
  selectedLevel: GameLevel | null;
  studentFeedback: string | null;
  onPlayAgain: () => void;
  onBackToLevels: () => void;
}

const ReportPreviewScreen: React.FC<ReportPreviewScreenProps> = ({
  studentIdentifier, score, totalQuestions, selectedLevel, studentFeedback, onPlayAgain, onBackToLevels
}) => {
  const levelInfo = selectedLevel ? LEVEL_CONFIG.find(l => l.level === selectedLevel) : null;
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  // Add a logout handler at the top level
  const handleStudentLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('attemptedLevels');
    window.location.reload(); // Or setGameState(GameState.Login) if you want a state-based approach
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 p-4 text-white">
      <div className="bg-white/15 backdrop-blur-xl p-8 sm:p-10 rounded-xl shadow-2xl max-w-xl w-full text-left">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-center">Mock Performance Report</h1>
        
        <div className="mb-6 space-y-2 text-lg">
          <p><strong>Student:</strong> {studentIdentifier || "N/A"}</p>
          {levelInfo && <p><strong>Level Completed:</strong> Level {levelInfo.level} ({levelInfo.name})</p>}
          <p><strong>Score:</strong> {score} / {totalQuestions} ({percentage}%)</p>
          {studentFeedback && (
            <div className="mt-2 pt-2 border-t border-white/20">
              <strong>Your Feedback:</strong> <p className="text-sm italic opacity-90">{studentFeedback}</p>
            </div>
          )}
        </div>

        <div className="bg-white/20 p-6 rounded-lg mb-6">
          <h2 className="text-2xl font-semibold mb-3 text-yellow-300">Admin Reporting & AI Insights (Conceptual)</h2>
          <p className="mb-2 text-sm">
            In a complete application with a backend system:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>Your detailed performance (each question, your answer, correct answer, time taken, feedback) would be saved to a secure database.</li>
            <li>An Excel report would be automatically generated for the administrator (taral.pathak@micamail.in).</li>
            <li className="font-semibold">
              AI-Powered "Difficult Concepts" Summary:
              <ul className="list-disc list-inside pl-5 mt-1 space-y-1 text-xs opacity-90">
                <li>The backend would send your incorrect answers and your feedback to the Google Gemini API.</li>
                <li>Using a model like <code className="bg-black/30 px-1 rounded">'gemini-2.5-flash-preview-04-17'</code>, the API would analyze patterns in your mistakes.</li>
                <li>It would generate a summary of financial concepts you might be finding challenging.</li>
                <li>This AI-generated summary would be included in the admin's Excel report to help tailor future learning. The API key for Gemini would be securely managed on the backend.</li>
              </ul>
            </li>
            <li>The admin dashboard would show student-wise, level-wise scores, time taken, session details, and the AI concept analysis.</li>
          </ul>
        </div>
        
        <p className="text-xs text-slate-300 mb-6 text-center">
          Note: Actual report generation, emailing, AI analysis, and persistent storage require backend development. This screen is for demonstration purposes.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onPlayAgain} // This should probably go to LevelSelection
            className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-6 rounded-lg text-lg shadow-md transition duration-150 ease-in-out transform hover:scale-105"
          >
            Play Another Level
          </button>
           <button
            onClick={onBackToLevels} // This is correct for going back to level selection.
            className="w-full bg-slate-600 hover:bg-slate-700 text-white font-semibold py-3 px-6 rounded-lg text-lg shadow-md transition duration-150 ease-in-out transform hover:scale-105"
          >
            Back to Level Selection
          </button>
        </div>
        <button
          onClick={handleStudentLogout}
          className="mt-8 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg text-sm shadow-md transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.Login);
  const [currentUserMobile, setCurrentUserMobile] = useState<string | null>(null);
  const [currentStudentId, setCurrentStudentId] = useState<string | null>(null);
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null); // For admin session

  const [selectedLevel, setSelectedLevel] = useState<GameLevel | null>(null);
  const [gameItems, setGameItems] = useState<FinancialItem[]>([]);
  const [currentItemIndex, setCurrentItemIndex] = useState<number>(0);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [score, setScore] = useState<number>(0);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [studentFeedbackText, setStudentFeedbackText] = useState<string | null>(null);
  const [attemptedLevels, setAttemptedLevels] = useState<{[key: string]: any[]}>({});

  // Add state for sessionId and answers
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [userToken, setUserToken] = useState<string | null>(null);

  const sessionStartTimeRef = useRef<Date | null>(null);
  const sessionEndTimeRef = useRef<Date | null>(null);
  
  const ITEMS_PER_GAME = 10;

  // Load attempted levels from localStorage on component mount
  useEffect(() => {
    const savedAttemptedLevels = localStorage.getItem('attemptedLevels');
    if (savedAttemptedLevels) {
      setAttemptedLevels(JSON.parse(savedAttemptedLevels));
    }
  }, []);

  // Save attempted levels to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('attemptedLevels', JSON.stringify(attemptedLevels));
  }, [attemptedLevels]);

  // On login, retrieve token from localStorage
  useEffect(() => {
    const token = sanitizeToken(localStorage.getItem('userToken'));
    if (token) setUserToken(token);
    // Restore sessionId if present
    const savedSessionId = localStorage.getItem('sessionId');
    if (savedSessionId) setSessionId(savedSessionId);
  }, []);

  // Save sessionId to localStorage whenever it changes
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem('sessionId', sessionId);
    } else {
      localStorage.removeItem('sessionId');
    }
  }, [sessionId]);

  // Start session when game starts
  const loadNewGame = useCallback(async (level: GameLevel) => {
    // Use mock data from constants
    const itemsForLevel = ALL_FINANCIAL_ITEMS.filter(item => item.level === level);
    const shuffledFullList = shuffleArray(itemsForLevel);
    const gameSpecificItems = shuffledFullList.slice(0, Math.min(ITEMS_PER_GAME, shuffledFullList.length));
    
    setGameItems(gameSpecificItems.length > 0 ? gameSpecificItems : shuffledFullList);
    
    setCurrentItemIndex(0);
    setSelectedCategories([]);
    setScore(0);
    setShowFeedback(false);
    setIsCorrect(false);
    setStudentFeedbackText(null);
    sessionStartTimeRef.current = new Date();
    sessionEndTimeRef.current = null;
    setGameState(GameState.Playing);
    setSelectedLevel(level);

    // Start session in backend if token exists
    if (userToken) {
      try {
        console.log('[FRONTEND] Starting session with token:', userToken, 'payload:', { level });
        const response = await fetch(`${API_BASE_URL}/api/quiz/session/start`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`,
          },
          body: JSON.stringify({ level }),
        });
        if (response.status === 401) {
          // Try to parse error message
          let data = { message: '' };
          try { data = await response.json(); } catch {}
          if (data.message && data.message.toLowerCase().includes('token expired')) {
            alert('Your session has expired. Please log in again.');
            localStorage.removeItem('userToken');
            localStorage.removeItem('userData');
            localStorage.removeItem('sessionId');
            localStorage.removeItem('attemptedLevels');
            window.location.reload();
            return;
          }
        }
        const data = await response.json();
        console.log('[FRONTEND] /session/start response:', data);
        if (data.success) {
          setSessionId(data.data.sessionId);
          localStorage.setItem('sessionId', data.data.sessionId);
          console.log('[FRONTEND] sessionId set:', data.data.sessionId);
        } else {
          setSessionId(null);
          localStorage.removeItem('sessionId');
          alert(data.message || 'Failed to start quiz session. Please try again or contact support.');
        }
      } catch (e) {
        console.error('[FRONTEND] /session/start error:', e);
        setSessionId(null);
        localStorage.removeItem('sessionId');
      }
    } else {
      setSessionId(null);
      localStorage.removeItem('sessionId');
    }
    setAnswers([]);
  }, [userToken]);

  // Helper function to get student key
  const getStudentKey = (mobile: string, studentId: string | null) => {
    return `${mobile}_${studentId || 'noId'}`;
  };

  // Helper function to get attempted levels for current student
  const getCurrentStudentAttemptedLevels = () => {
    if (!currentUserMobile) return [];
    const studentKey = getStudentKey(currentUserMobile, currentStudentId);
    return attemptedLevels[studentKey] || [];
  };

  // Utility to fetch student history from backend
  async function fetchStudentHistory(token: string) {
    try {
      if (!token) {
        alert("You are not logged in. Please log in again.");
        // Optionally redirect to login
        return [];
      }
      const response = await fetch(`${API_BASE_URL}/api/quiz/history`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.status === 401) {
        alert("Session expired or unauthorized. Please log in again.");
        localStorage.removeItem('userToken');
        window.location.reload();
        return [];
      }
      const data = await response.json();
      if (data.success && data.data && Array.isArray(data.data.sessions)) {
        return data.data.sessions;
      }
      return [];
    } catch (e) {
      console.error('[FRONTEND] Failed to fetch student history:', e);
      return [];
    }
  }

  // Student Login
  const handleLoginSuccess = async (email: string, displayName?: string) => {
    setCurrentUserMobile(email);
    setCurrentStudentId(displayName || null);
    setGameState(GameState.LevelSelection);

    // After login, fetch backend history and merge with localStorage
    const token = sanitizeToken(localStorage.getItem('userToken'));
    if (token && email) {
      const backendSessions = await fetchStudentHistory(token);
      const studentKey = getStudentKey(email, displayName || null);
      // Convert backend sessions to attemptedLevels format
      const backendAttempts = backendSessions.map((session: any) => ({
        level: session.level,
        score: session.score,
        totalQuestions: session.totalQuestions,
        percentage: session.percentage,
        timeTaken: session.timeTakenSeconds,
        feedback: session.feedbackText,
        completedAt: session.endTime || session.createdAt,
        studentId: displayName || null,
        mobile: email
      }));
      // Merge with localStorage data for this student
      setAttemptedLevels(prev => {
        const localAttempts = prev[studentKey] || [];
        // Merge: keep all unique (by level + completedAt)
        const allAttempts = [...backendAttempts, ...localAttempts].filter((attempt, idx, arr) =>
          arr.findIndex(a => a.level === attempt.level && a.completedAt === attempt.completedAt) === idx
        );
        return {
          ...prev,
          [studentKey]: allAttempts
        };
      });
    }
  };

  // Admin Login
  const handleAdminLoginSuccess = (adminUser: AdminUser) => {
    setCurrentAdmin(adminUser);
    setGameState(GameState.AdminDashboard);
  };

  const handleAdminLogout = () => {
    setCurrentAdmin(null);
    setGameState(GameState.Login); // Or GameState.AdminLogin if preferred
  };
  
  const navigateToAdminLogin = () => {
    setGameState(GameState.AdminLogin);
  }

  const navigateToStudentLogin = () => {
    setGameState(GameState.Login);
  }

  // Add a logout handler at the top level
  const handleStudentLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('attemptedLevels');
    localStorage.removeItem('sessionId');
    window.location.reload(); // Or setGameState(GameState.Login) if you want a state-based approach
  };


  const handleSelectLevel = (level: GameLevel) => {
    loadNewGame(level);
  };

  const currentItem = gameItems[currentItemIndex];
  const isLevel4 = selectedLevel === 4;

  const handleCategorySelect = (category: Category) => {
    if (showFeedback) return;

    setSelectedCategories(prevSelected => {
      if (isLevel4) {
        if (prevSelected.includes(category)) {
          return prevSelected.filter(c => c !== category);
        }
        if (prevSelected.length < 2) {
          return [...prevSelected, category];
        }
        return prevSelected; 
      } else {
        return [category]; 
      }
    });
  };

  // Submit answer to backend if sessionId exists
  const handleSubmit = async () => {
    if (!currentItem) return;
    if (!isLevel4 && selectedCategories.length !== 1) return;

    let correct = false;
    if (isLevel4 && currentItem.multiCategories) {
      const correctAnswers = currentItem.multiCategories.map(mc => mc.category);
      correct = selectedCategories.length === correctAnswers.length && 
                correctAnswers.every(cat => selectedCategories.includes(cat)) &&
                selectedCategories.every(cat => correctAnswers.includes(cat));
    } else if (!isLevel4 && currentItem.category) {
      correct = selectedCategories[0] === currentItem.category;
    }

    setIsCorrect(correct);
    if (correct) {
      setScore(prevScore => prevScore + 1);
    }
    setShowFeedback(true);

    // Submit answer to backend
    if (sessionId && userToken) {
      try {
        console.log('[FRONTEND] Submitting answer with token:', userToken, 'payload:', {
          sessionId,
          questionId: currentItem.id,
          selectedCategories,
          timeSpent: 0
        });
        const response = await fetch(`${API_BASE_URL}/api/quiz/session/answer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`,
          },
          body: JSON.stringify({
            sessionId,
            questionId: currentItem.id,
            selectedCategories,
            timeSpent: 0 // You can track time per question if needed
          }),
        });
        const data = await response.json();
        console.log('[FRONTEND] /session/answer response:', data);
      } catch (e) {
        console.error('[FRONTEND] /session/answer error:', e);
      }
    }
    // Track locally for report
    setAnswers(prev => [...prev, {
      questionId: currentItem.id,
      questionText: currentItem.name,
      selectedCategories,
      correctCategories: isLevel4 && currentItem.multiCategories ? currentItem.multiCategories.map(mc => mc.category) : [currentItem.category],
      isCorrect: correct,
      timeSpent: 0
    }]);
  };

  const handleNextItem = () => {
    setShowFeedback(false);
    setSelectedCategories([]);
    if (currentItemIndex < gameItems.length - 1) {
      setCurrentItemIndex(prevIndex => prevIndex + 1);
    } else {
      sessionEndTimeRef.current = new Date();
      setGameState(GameState.GameOver);
    }
  };
  
  const handleProceedToFeedback = () => {
    setGameState(GameState.StudentFeedback);
  };

  // Complete session in backend on feedback submit
  const handleSubmitFeedback = async (feedback: string) => {
    setStudentFeedbackText(feedback);
    if (!sessionId) {
      alert('Session ID missing! Quiz session may not have started correctly.');
      console.error('[FRONTEND] handleSubmitFeedback: sessionId is missing');
      return;
    }
    if (!userToken) {
      alert('User token missing! Please log in again.');
      console.error('[FRONTEND] handleSubmitFeedback: userToken is missing');
      return;
    }
    try {
      console.log('[FRONTEND] handleSubmitFeedback: sessionId', sessionId, 'userToken', userToken);
      const response = await fetch(`${API_BASE_URL}/api/quiz/session/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          sessionId,
          feedbackText: feedback
        }),
      });
      const data = await response.json();
      console.log('[FRONTEND] /session/complete response:', data);
      if (!data.success) {
        alert(data.message || 'Failed to complete quiz session. Please try again or contact support.');
      }
    } catch (e) {
      alert('Failed to complete quiz session. Please try again or contact support.');
      console.error('[FRONTEND] /session/complete error:', e);
    }
    
    // Save completion data to attempted levels
    if (currentUserMobile && selectedLevel) {
      const studentKey = getStudentKey(currentUserMobile, currentStudentId);
      const completionData = {
        level: selectedLevel,
        score: score,
        totalQuestions: gameItems.length,
        percentage: Math.round((score / gameItems.length) * 100),
        timeTaken: sessionEndTimeRef.current && sessionStartTimeRef.current 
          ? Math.round((sessionEndTimeRef.current.getTime() - sessionStartTimeRef.current.getTime()) / 1000)
          : 0,
        feedback: feedback,
        completedAt: new Date().toISOString(),
        studentId: currentStudentId,
        mobile: currentUserMobile
      };
      
      setAttemptedLevels(prev => ({
        ...prev,
        [studentKey]: [...(prev[studentKey] || []), completionData]
      }));
    }
    
    setGameState(GameState.ReportPreview);
  };
  
  const handlePlayAgainFromReportOrGameOver = () => {
    setGameState(GameState.LevelSelection); 
    setSelectedLevel(null); 
    setSessionId(null);
    localStorage.removeItem('sessionId');
  };

  const getCategoryConfig = (categoryId: Category): CategoryConfig | undefined => {
    return CATEGORIES_CONFIG.find(c => c.id === categoryId);
  };

  // Current student display identifier
  const studentDisplayIdentifier = currentStudentId || currentUserMobile;

  // Screen Rendering Logic
  if (gameState === GameState.Login) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} onNavigateToAdminLogin={navigateToAdminLogin} />;
  }
  if (gameState === GameState.AdminLogin) {
    return <AdminLoginScreen onAdminLoginSuccess={handleAdminLoginSuccess} onBackToStudentLogin={navigateToStudentLogin} />;
  }
  if (gameState === GameState.AdminDashboard) {
    return <AdminDashboardScreen adminUser={currentAdmin} onAdminLogout={handleAdminLogout} />;
  }
  if (gameState === GameState.LevelSelection) {
    return <LevelSelector 
      onSelectLevel={handleSelectLevel} 
      studentIdentifier={studentDisplayIdentifier} 
      attemptedLevels={getCurrentStudentAttemptedLevels()}
    />;
  }
  if (gameState === GameState.StudentFeedback) {
    return <StudentFeedbackScreen 
             onSubmitFeedback={handleSubmitFeedback} 
             studentIdentifier={studentDisplayIdentifier}
             level={selectedLevel}
           />;
  }
  if (gameState === GameState.ReportPreview) {
    return (
      <ReportPreviewScreen
        studentIdentifier={studentDisplayIdentifier}
        score={score}
        totalQuestions={gameItems.length}
        selectedLevel={selectedLevel}
        studentFeedback={studentFeedbackText}
        onPlayAgain={handlePlayAgainFromReportOrGameOver} // This now goes to LevelSelection
        onBackToLevels={handlePlayAgainFromReportOrGameOver} // Consistent navigation
      />
    );
  }
  if (gameState === GameState.GameOver) {
    const totalQuestions = gameItems.length;
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    let message = "Good effort! Keep practicing to improve your financial literacy!";
    if (percentage === 100) message = "Perfect Score! You're a financial statement maestro!";
    else if (percentage >= 80) message = "Excellent! You're a financial whiz!";
    else if (percentage >= 60) message = "Great job! You have a solid understanding.";
    
    const levelInfo = selectedLevel ? LEVEL_CONFIG.find(l => l.level === selectedLevel) : null;

    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-sky-400 to-indigo-600 p-4 text-white">
        <div className="bg-white/20 backdrop-blur-lg p-8 rounded-xl shadow-2xl text-center max-w-md w-full">
          <TrophyIcon className="w-24 h-24 text-yellow-300 mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-2">Game Over!</h1>
          {levelInfo && <p className="text-lg mb-4">(Level {levelInfo.level}: {levelInfo.name})</p>}
          <p className="text-2xl mb-2">Your Final Score: {score} / {totalQuestions}</p>
          <p className="text-xl mb-6">({percentage}%)</p>
          <p className="text-lg mb-8">{message}</p>
          <div className="space-y-4">
            <button
              onClick={handleProceedToFeedback}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-800 font-semibold py-3 px-6 rounded-lg text-lg shadow-md transition duration-150 ease-in-out transform hover:scale-105"
            >
              Provide Feedback & View Report
            </button>
            <button
              onClick={handlePlayAgainFromReportOrGameOver}
              className="w-full bg-slate-600 hover:bg-slate-700 text-white font-semibold py-3 px-6 rounded-lg text-lg shadow-md transition duration-150 ease-in-out transform hover:scale-105"
            >
              Skip Feedback & Play Another Level
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === GameState.Playing && !sessionId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100 text-slate-700">
        <div>
          <h2 className="text-xl font-bold mb-4">Quiz session could not be started.</h2>
          <p className="mb-4">Please return to the level selection and try again.</p>
          <button onClick={handlePlayAgainFromReportOrGameOver} className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg">Back to Level Selection</button>
        </div>
      </div>
    );
  }
  if (gameState === GameState.StudentFeedback && !sessionId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100 text-slate-700">
        <div>
          <h2 className="text-xl font-bold mb-4">Quiz session could not be completed.</h2>
          <p className="mb-4">Session ID is missing. Please return to the level selection and try again.</p>
          <button onClick={handlePlayAgainFromReportOrGameOver} className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg">Back to Level Selection</button>
        </div>
      </div>
    );
  }
  if (gameState === GameState.Playing) {
    if (!currentItem) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100 text-slate-700">
          Loading level or no items found...
        </div>
      );
    }
    
    const levelInfo = selectedLevel ? LEVEL_CONFIG.find(l => l.level === selectedLevel) : null;
    const questionNumber = currentItemIndex + 1;
    const totalQuestionsInGame = gameItems.length;
    const studentDisplayId = studentDisplayIdentifier || "Guest";

    let feedbackMessage = "";
    if (showFeedback) {
      if (isCorrect) {
        feedbackMessage = "Correct!";
      } else {
        if (isLevel4 && currentItem.multiCategories) {
          const correctLabels = currentItem.multiCategories
            .map(mc => getCategoryConfig(mc.category)?.label)
            .filter(Boolean)
            .join(' and ');
          feedbackMessage = `Not quite! The correct answers are ${correctLabels}.`;
        } else if (!isLevel4 && currentItem.category) {
          const correctLabel = getCategoryConfig(currentItem.category)?.label;
          feedbackMessage = `Not quite! The correct answer is ${correctLabel}.`;
        }
      }
    }

    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 selection:bg-sky-200 selection:text-sky-900">
        <header className="w-full max-w-2xl mb-6 text-center">
          <div className="flex justify-between items-center text-xs text-slate-500 mb-2">
              <span>Student: {studentDisplayId}</span>
              <span>Level: {levelInfo?.level} ({levelInfo?.name})</span>
            </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 flex items-center justify-center">
            <SparklesIcon className="w-9 h-9 sm:w-10 sm:h-10 mr-3 text-sky-500" />
            Financial Literacy Challenge
          </h1>
        </header>

        <main className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-2xl">
          <div className="mb-6 pb-4 border-b border-slate-200">
            <div className="flex justify-between items-center text-sm text-slate-600 mb-2">
              <span>Question: {questionNumber} / {totalQuestionsInGame}</span>
              <span>Score: {score}</span>
            </div>
            <div className="bg-slate-100 p-4 rounded-lg min-h-[80px] flex flex-col items-center justify-center">
              <p className="text-xl sm:text-2xl font-semibold text-slate-700 text-center" aria-live="polite">
                {currentItem.name}
              </p>
              {isLevel4 && <p className="text-sm text-sky-600 mt-1 font-medium"> (Select two categories)</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6" role="group" aria-label="Categories">
            {CATEGORIES_CONFIG.map((catConfig) => {
              const isSelected = selectedCategories.includes(catConfig.id);
              let buttonStyle = "";

              if (showFeedback) {
                let isActualCorrectCategory = false;
                if (isLevel4 && currentItem.multiCategories) {
                  isActualCorrectCategory = currentItem.multiCategories.some(mc => mc.category === catConfig.id);
                } else if (!isLevel4 && currentItem.category) {
                  isActualCorrectCategory = currentItem.category === catConfig.id;
                }

                if (isActualCorrectCategory) { 
                  buttonStyle = `ring-4 ring-offset-2 ${catConfig.borderColor} ${catConfig.color}`;
                } else if (isSelected && !isActualCorrectCategory) { 
                  buttonStyle = `ring-4 ring-offset-2 ring-red-500 ${catConfig.color} opacity-70`;
                } else { 
                  buttonStyle = 'opacity-60';
                }
              } else { 
                buttonStyle = `${catConfig.hoverColor} transform hover:scale-105 focus:ring-4 focus:ring-opacity-50`;
                if (isSelected) {
                  buttonStyle += ` ring-4 ring-offset-2 ${catConfig.borderColor} ring-opacity-75`;
                }
              }

              return (
                <button
                  key={catConfig.id}
                  onClick={() => handleCategorySelect(catConfig.id)}
                  disabled={showFeedback || (isLevel4 && selectedCategories.length >= 2 && !isSelected)}
                  aria-pressed={isSelected}
                  className={`
                    p-4 rounded-lg text-white font-medium text-left transition-all duration-150 ease-in-out
                    ${catConfig.color} ${buttonStyle}
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                  `}
                >
                  <span className="text-lg">{catConfig.label}</span>
                </button>
              );
            })}
          </div>

          {!showFeedback && (
            <button
              onClick={handleSubmit}
              disabled={
                (isLevel4 && selectedCategories.length !== 2) ||
                (!isLevel4 && selectedCategories.length !== 1)
              }
              className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-6 rounded-lg text-lg shadow-md transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 focus:ring-4 focus:ring-sky-300"
            >
              Submit Answer
            </button>
          )}

          {showFeedback && (
            <div className={`mt-6 p-4 rounded-lg bg-opacity-80
              ${isCorrect ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' : 'bg-rose-50 text-rose-700 border border-rose-300'}`}
              role="alert"
            >
              <div className="flex items-center mb-2">
                {isCorrect ? (
                  <CheckCircleIcon className="w-7 h-7 mr-2 text-emerald-500 flex-shrink-0" />
                ) : (
                  <XCircleIcon className="w-7 h-7 mr-2 text-rose-500 flex-shrink-0" />
                )}
                <h3 className="text-xl font-semibold">
                  {feedbackMessage}
                </h3>
              </div>
              <div className="flex items-start text-sm mt-1">
                <LightBulbIcon className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                <p>{currentItem.explanation}</p>
              </div>
              <button
                onClick={handleNextItem}
                className={`w-full mt-4 font-semibold py-3 px-6 rounded-lg text-lg shadow-md transition duration-150 ease-in-out transform hover:scale-105 focus:ring-4
                ${isCorrect ? 'bg-emerald-500 hover:bg-emerald-600 text-white focus:ring-emerald-300' : 'bg-rose-500 hover:bg-rose-600 text-white focus:ring-rose-300'}
                `}
              >
                {currentItemIndex < gameItems.length - 1 ? 'Next Question' : 'Show Results'}
              </button>
            </div>
          )}
        </main>
        <footer className="mt-8 text-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} Financial Literacy Game. Focused on Indian Annual Reports.</p>
          <p>Displaying {totalQuestionsInGame > 0 ? totalQuestionsInGame : ITEMS_PER_GAME} questions per game session.</p>
        </footer>
      </div>
    );
  }
  // Fallback for any unhandled game state
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
      Error: Unknown game state or not playing. Current state: {gameState}
      <button onClick={() => setGameState(GameState.Login)} className="ml-4 p-2 bg-sky-500 rounded">Go to Login</button>
    </div>
  );
};

// Utility to sanitize JWT tokens (remove any quotes)
function sanitizeToken(token: string | null): string {
  if (!token) return '';
  return token.replace(/^"+|"+$/g, '').replace(/^'+|'+$/g, '');
}

// MSAL Provider Wrapper
const AppWithMsal: React.FC = () => {
  const msalInstance = new PublicClientApplication(msalConfig);

  return (
    <MsalProvider instance={msalInstance}>
      <App />
    </MsalProvider>
  );
};

export default AppWithMsal;
