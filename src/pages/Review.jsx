// src/pages/Review.jsx
import Card from '../components/common/Card.jsx';

export default function Review({ historicalAttempts = [] }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 text-left">
      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Review Logs</h2>
        <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Audit historic simulation checkpoints</p>
      </div>
      {historicalAttempts.length === 0 ? (
        <Card className="text-center p-12 text-slate-400 font-bold text-sm">
          No previous assessment history maps detected inside this local workspace instance.
        </Card>
      ) : (
        <div className="space-y-3">
          {historicalAttempts.map((attempt, idx) => (
            <Card key={idx} className="flex justify-between items-center p-5">
              <div>
                <p className="font-black text-slate-800 uppercase text-sm">{attempt.examType}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{attempt.topic}</p>
              </div>
              <span className="text-sm font-black text-sky-600">{attempt.score} / 10</span>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}