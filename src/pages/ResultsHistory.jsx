import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api.js';
import { Award, Loader2 } from 'lucide-react';
import Card from '../components/common/Card.jsx';

export default function ResultsHistory({ setView, onSelectReview }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        setLoading(true);
        const data = await apiFetch('/test-results?withQuestions=true');

        const parsedHistory = (data || []).map(item => ({
          ...item,
          questions: typeof item.questions === 'string' ? JSON.parse(item.questions) : item.questions,
          user_answers: typeof item.user_answers === 'string' ? JSON.parse(item.user_answers) : item.user_answers
        }));

        setHistory(parsedHistory);
      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-sky-600" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 text-left">

      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Performance History</h2>
        <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Review your past attempts & corrections</p>
      </div>

      <div className="space-y-4">
        {history.length === 0 ? (
          <p className="text-slate-400 italic">No previous test results found.</p>
        ) : (
          history.map((h) => (
            <Card key={h.id} variant="interactive" className="flex justify-between items-center p-5" onClick={() => onSelectReview(h)}>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-50 text-slate-600 rounded-2xl"><Award className="w-5 h-5" /></div>
                <div>
                  <p className="font-black text-slate-900 uppercase tracking-tight">{h.exam_type}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(h.completed_at).toLocaleDateString()} • {h.duration_minutes || 0} min</p>
                </div>
              </div>
              <div className="text-right"><p className="text-xl font-black text-sky-600">{h.score}%</p></div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
