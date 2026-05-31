import Landing from '../pages/Landing.jsx';
import ExamSetup from '../pages/ExamSetup.jsx';
import ExamSession from '../pages/ExamSession.jsx';
import ResultsView from '../pages/Results.jsx';
import Auth from '../pages/Auth.jsx'; 
import AuthLayout from '../layouts/AuthLayout.jsx';
import Dashboard from '../pages/Dashboard.jsx'; 
import Profile from '../pages/Profile.jsx';
import { useExamSystem } from '../context/ExamContext.jsx';

export default function AppRouter({ currentView, setView, examDomains, isAuthenticated, onAuthenticate, resetToDashboard }) {
  const { 
    config, setConfig, questions, initializeTestSession, 
    userAnswers, setUserAnswers, evaluateFinalAnswers, score 
  } = useExamSystem();

  switch (currentView) {
    case 'welcome':
    case 'landing':
      return <Landing examDomains={examDomains} isAuthenticated={isAuthenticated} onSelectExam={(type) => { setConfig({ ...config, examType: type, topic: examDomains[type][0] }); setView('config'); }} />;

    case 'auth':
      return (
        <AuthLayout onBack={() => setView('landing')}>
          <Auth onAuthenticate={onAuthenticate} setView={setView} />
        </AuthLayout>
      );

    case 'dashboard':
      return <Dashboard examDomains={examDomains} setView={setView} onSelectExam={(type) => { setConfig({ ...config, examType: type, topic: examDomains[type][0] }); setView('config'); }} />;

    case 'profile':
      return <Profile setView={setView} />;

    case 'config':
      return <ExamSetup config={config} setConfig={setConfig} examDomains={examDomains} onBack={resetToDashboard} onStartSimulation={() => { initializeTestSession(config.examType, config.topic); setView('quiz'); }} />;

    case 'quiz':
      return (
        <ExamSession 
          questions={questions} 
          userAnswers={userAnswers} 
          setUserAnswers={setUserAnswers} 
          onCompleteExam={(timeSpent) => { 
            // Now passing the timeSpent from ExamSession to your evaluation logic
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