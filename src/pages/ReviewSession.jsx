// src/pages/ReviewSession.jsx
import { useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Brain } from 'lucide-react';
import { fetchGroqExplanation } from '../services/ai/groq.js';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';

export default function ReviewSession({ result, setView, examType }) {
  if (!result || !result.questions) return null;

  // Internal Audit Component for each question
  const AuditItem = ({ q, idx, userAnswer }) => {
    const [rationale, setRationale] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFetch = async () => {
      setLoading(true);
      const res = await fetchGroqExplanation({
        examType,
        question: q.question,
        options: q.options,
        correct: q.correct,
        userChoice: userAnswer
      });
      setRationale(res.rationale);
      setLoading(false);
    };

    return (
      <Card className="p-6 space-y-4">
        <p className="font-bold text-slate-800">{q.question}</p>
        <div className="grid gap-2">
          {Object.entries(q.options).map(([key, text]) => {
            const isCorrect = key === q.correct;
            const isSelected = key === userAnswer;
            return (
              <div key={key} className={`p-3 rounded-xl border ${isCorrect ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : isSelected ? 'border-rose-500 bg-rose-50 text-rose-800' : 'border-slate-100'}`}>
                {key}. {text}
                {isCorrect && <CheckCircle className="inline ml-2 w-4 h-4"/>}
              </div>
            );
          })}
        </div>
        
        {/* AI Audit Section */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          {!rationale ? (
            <button onClick={handleFetch} disabled={loading} className="text-[10px] font-black text-sky-600 uppercase tracking-widest hover:text-sky-700">
              {loading ? "Analyzing..." : "Analyze with AI"}
            </button>
          ) : (
            <p className="text-xs text-slate-600 bg-sky-50 p-4 rounded-xl">{rationale}</p>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 text-left">
      <h2 className="text-2xl font-black">Review: {result.exam_type}</h2>
      {result.questions.map((q, idx) => (
        <AuditItem key={idx} q={q} idx={idx} userAnswer={result.user_answers[String(idx)]} />
      ))}
    </div>
  );
}