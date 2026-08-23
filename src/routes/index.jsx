// src/routes/index.jsx
import { useState } from 'react';
import Landing from '../pages/Landing.jsx';
import ExamSetup from '../pages/ExamSetup.jsx';
import ExamSession from '../pages/ExamSession.jsx';
import ResultsView from '../pages/Results.jsx';
import Auth from '../pages/Auth.jsx'; 
import AuthLayout from '../layouts/AuthLayout.jsx';
import Dashboard from '../pages/Dashboard.jsx'; 
import Profile from '../pages/Profile.jsx';
import ResultsHistory from '../pages/ResultsHistory.jsx';
import ReviewSession from '../pages/ReviewSession.jsx';
import AINotes from '../pages/AINotes.jsx';
import { useExamSystem } from '../hooks/useExamSystem.js';

export default function AppRouter({ 
  currentView, setView, examDomains, isAuthenticated, 
  onAuthenticate, resetToDashboard, activeResult, setActiveResult 
}) {
  const { 
    config, setConfig, questions, initializeTestSession, 
    userAnswers, setUserAnswers, evaluateFinalAnswers, score 
  } = useExamSystem();

  // Store the navigation parameters in the view state
  const [viewParams, setViewParams] = useState({});

  const navigateTo = (view, params = {}) => {
    setViewParams(params);
    setView(view);
  };

  switch (currentView) {
    case 'welcome':
    case 'landing':
      return <Landing examDomains={examDomains} isAuthenticated={isAuthenticated} onSelectExam={(type) => { setConfig({ ...config, examType: type, topic: examDomains[type][0] }); setView('config'); }} navigateTo={navigateTo} />;

    case 'auth':
      return (
        <AuthLayout onBack={() => setView('landing')}>
          <Auth onAuthenticate={onAuthenticate} setView={setView} initialMode={viewParams.mode || 'register'} />
        </AuthLayout>
      );

    case 'dashboard':
      return <Dashboard examDomains={examDomains} setView={setView} onSelectExam={(type) => { setConfig({ ...config, examType: type, topic: examDomains[type][0] }); setView('config'); }} />;

    case 'profile':
      return <Profile setView={setView} />;

    case 'history':
      return <ResultsHistory setView={setView} onSelectReview={(result) => { setActiveResult(result); setView('review'); }} />;
      
    case 'review':
      return <ReviewSession result={activeResult} setView={setView} />;

    case 'ai-notes':
      return <AINotes setView={setView} />;

    case 'config':
      return <ExamSetup config={config} setConfig={setConfig} examDomains={examDomains} onBack={resetToDashboard} onStartSimulation={() => { initializeTestSession(config.examType, config.topic); setView('quiz'); }} />;

    case 'quiz':
      return (
        <ExamSession 
          questions={questions} 
          userAnswers={userAnswers} 
          setUserAnswers={setUserAnswers} 
          examType={config.examType}
          onCompleteExam={(timeSpent) => { 
            evaluateFinalAnswers(timeSpent); 
            setView('results'); 
          }} 
        />
      );

    case 'results':
      return <ResultsView score={score} questions={questions} userAnswers={userAnswers} examType={config.examType} resetToDashboard={resetToDashboard} />;

    default:
      return <Landing examDomains={examDomains} isAuthenticated={isAuthenticated} />;
  }
}