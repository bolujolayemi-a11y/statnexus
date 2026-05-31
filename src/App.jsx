// src/App.jsx
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { ExamProvider } from './context/ExamContext.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import AppRouter from './routes/index.jsx';

export default function App() {
  const [view, setView] = useState('welcome');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const examDomains = {
    'NCLEX-RN': ['Management of Care', 'Safety & Infection Control', 'Health Promotion & Maintenance', 'Psychosocial Integrity', 'Basic Care & Comfort', 'Pharmacological & Parenteral Therapies', 'Reduction of Risk Potential', 'Physiological Adaptation'],
    'NMCN-RN': ['General Nursing Principles', 'Medical-Surgical Nursing', 'Anatomy & Physiology', 'Community Health Nursing', 'Maternal & Child Health', 'Mental Health Nursing', 'Pharmacology & Nutrition'],
    'UK-NMC-CBT': ['Professional Values & Ethics (The Code)', 'Communication & Interpersonal Skills', 'Nursing Practice & Decision Making', 'Leadership, Management & Teamwork', 'Pharmacology & Numeracy', 'Adult Nursing (Clinical)', 'Mental Health Nursing (Clinical)']
  };

  const handleAuthenticate = () => {
    setIsAuthenticated(true);
    setView('dashboard');
  };

  const handleGoBack = () => {
    if (view === 'quiz' && !globalThis.confirm("Abandon current simulation? All progress will be cleared.")) return;
    setView('dashboard');
  };

  const renderHeaderActions = () => {
    if (view === 'welcome' || view === 'landing' || view === 'auth') return null;
    return (
      <button 
        type="button" 
        onClick={handleGoBack} 
        className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-slate-100 bg-white hover:border-slate-200 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back
      </button>
    );
  };

  return (
    <ExamProvider>
      <DashboardLayout 
        headerActions={renderHeaderActions()}
        isAuthenticated={isAuthenticated}
        onAuthenticate={handleAuthenticate}
        onLogOut={() => { setIsAuthenticated(false); setView('welcome'); }}
        setView={setView}
      >
        <AppRouter 
          currentView={view} 
          setView={setView} 
          examDomains={examDomains} 
          isAuthenticated={isAuthenticated}
          onAuthenticate={handleAuthenticate}
          resetToDashboard={() => setView('dashboard')}
        />
      </DashboardLayout>
    </ExamProvider>
  );
}