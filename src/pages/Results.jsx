// src/pages/Results.jsx
// deno-lint-ignore-file no-unused-vars
import { useState } from 'react';
import { Brain, CheckCircle2, XCircle, Award } from 'lucide-react';
import { useExamSystem } from '../hooks/useExamSystem.js';
import { fetchGroqExplanation } from '../services/ai/groq.js';
import OptionCard from '../components/exam/OptionCard.jsx';
import Button from '../components/common/Button.jsx';

// --- SUB-COMPONENT: SELF-CONTAINED AUDIT CARD ---
function AuditCard({ q, idx, userChoice, examType }) {
  const [rationale, setRationale] = useState('');
  const [loading, setLoading] = useState(false);
  const isUserCorrect = userChoice === q.correct;

  const handleFetchRationale = async () => {
    if (rationale) return;
    setLoading(true);
    
    // Call our decoupled Groq AI service layer
    const result = await fetchGroqExplanation({
      examType,
      question: q.question,
      options: q.options,
      correct: q.correct,
      userChoice
    });

    setRationale(result.rationale);
    setLoading(false);
  };

  return (
    <div className={`bg-white rounded-4xl border-2 transition-all shadow-sm overflow-hidden ${isUserCorrect ? 'border-emerald-100' : 'border-rose-100'}`}>
      {/* Top Status Header */}
      <div className="p-6 border-b border-slate-50 bg-white">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[10px] font-black text-slate-300 uppercase">Item {idx + 1}</span>
          <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md ${isUserCorrect ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
            {isUserCorrect ? "Correct" : "Incorrect"}
          </span>
        </div>
        <p className="font-bold text-slate-800 leading-relaxed italic">"{q.question}"</p>
      </div>

      {/* Choice Verification Container */}
      <div className="p-6 space-y-3 bg-slate-50/30">
        {Object.entries(q.options || {}).map(([key, value]) => (
          <OptionCard
            key={key}
            letter={key}
            text={value}
            isSelected={userChoice === key}
            isReviewMode={true}
            isCorrectAnswer={key === q.correct}
            disabled={true} // Non-clickable during review states
          />
        ))}
      </div>

      {/* Groq AI Rationale Interface */}
      <div className="p-6 bg-sky-50/50 border-t border-sky-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-sky-600" />
            <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest">Clinical Audit</p>
          </div>
          {!rationale && (
            <button
              type="button"
              disabled={loading}
              onClick={handleFetchRationale}
              className="text-[10px] bg-sky-600 hover:bg-sky-700 text-white font-black px-3 py-1 rounded-lg uppercase tracking-wider transition-all disabled:opacity-50 shadow-sm"
            >
              {loading ? "Analyzing..." : "Analyze Choice with AI"}
            </button>
          )}
        </div>
        {rationale && (
          <p className="text-xs text-slate-600 leading-relaxed font-semibold bg-white p-4 rounded-xl border border-sky-100/40 animate-in fade-in duration-300">
            {rationale}
          </p>
        )}
      </div>
    </div>
  );
}

// --- MAIN RESULTS COMPONENT ---
export default function ResultsView({ resetToDashboard }) {
  const { score, questions, userAnswers, config, clearExamState } = useExamSystem();
  const [showReview, setShowReview] = useState(false);

  const totalQuestions = questions.length;
  const scorePercent = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const isPassing = scorePercent >= 70; // 70% passing threshold indicator

  const handleReturnToDashboard = () => {
    clearExamState();
    resetToDashboard(); // Triggers your App.jsx router view swap back to welcome/landing
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-center">
      {/* Percentage Score Metric Bubble */}
      <div className="py-4">
        <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full border-8 border-white shadow-2xl ${isPassing ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          <span className="text-4xl font-black">{scorePercent}%</span>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Assessment Complete</h2>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
          Final Score: {score} out of {totalQuestions} correct answers
        </p>
      </div>

      {/* Controller Buttons */}
      <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
        <Button variant="outline" onClick={() => setShowReview(!showReview)}>
          {showReview ? "Hide Answers" : "Review Answers"}
        </Button>
        <Button variant="primary" onClick={handleReturnToDashboard}>
          Dashboard
        </Button>
      </div>
      
      {/* --- INTEGRATED REVIEW TIMELINE TRAIL --- */}
      {showReview && (
        <div className="space-y-8 pt-8 text-left animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Clinical Audit Trail</h3>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-md uppercase tracking-wider">
              {totalQuestions} Items Evaluated
            </span>
          </div>

          <div className="space-y-6">
            {questions.map((q, idx) => (
              <AuditCard 
                key={q.id || idx} 
                q={q} 
                idx={idx} 
                userChoice={userAnswers[idx]} 
                examType={config.examType} 
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}