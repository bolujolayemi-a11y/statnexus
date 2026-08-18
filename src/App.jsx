import { useState, useEffect } from 'react';
import { auth } from './lib/auth.js';
import { ExamProvider } from './context/ExamContext.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import AppRouter from './routes/index.jsx';

export default function App() {
  const [view, setView] = useState('welcome');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeResult, setActiveResult] = useState(null);

  const examDomains = {
    'NCLEX-RN': ['Management of Care', 'Safety & Infection Control', 'Health Promotion & Maintenance', 'Psychosocial Integrity', 'Basic Care & Comfort', 'Pharmacological & Parenteral Therapies', 'Reduction of Risk Potential', 'Physiological Adaptation'],
    'NMCN-RN': ['Fundamental Nursing Sciences', 'Medical-Surgical Nursing', 'Anatomy & Physiology', 'Community Health Nursing', 'Maternal & Child Health Nursing', 'Mental Health Nursing', 'Nursing Ethics & Professionalism'],
    'UK-NMC-CBT': ['Being an Accountable Professional', 'Promoting Health & Preventing Ill Health', 'Assessing Needs & Planning Care', 'Providing & Evaluating Care', 'Leading & Managing Care', 'Care Across Lifespan - Integrated', 'OSCE Skills (Practical Exam Focus)']
  };

  useEffect(() => {
    auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      if (session) setView('dashboard');
      setLoading(false);
    });

    const { data: { subscription } } = auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthenticate = () => {
    setIsAuthenticated(true);
    setView('dashboard');
  };

  const getBackNavigation = () => {
    switch (view) {
      case 'review': return () => setView('history');
      case 'history': return () => setView('dashboard');
      case 'config': return () => setView('dashboard');
      case 'results': return () => setView('dashboard');
      case 'quiz': 
        return () => {
          if (globalThis.confirm("Abandon current simulation? All progress will be cleared.")) {
            setView('dashboard');
          }
        };
      default: return null;
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <ExamProvider>
      <DashboardLayout 
        onBack={getBackNavigation()}
        isAuthenticated={isAuthenticated}
        onLogOut={async () => { 
          await auth.signOut();
          setIsAuthenticated(false); 
          setView('welcome'); 
        }}
        setView={setView}
      >
        <AppRouter 
          currentView={view} 
          setView={setView} 
          examDomains={examDomains} 
          isAuthenticated={isAuthenticated}
          onAuthenticate={handleAuthenticate}
          resetToDashboard={() => setView('dashboard')}
          activeResult={activeResult}
          setActiveResult={setActiveResult}
        />
      </DashboardLayout>
    </ExamProvider>
  );
}
