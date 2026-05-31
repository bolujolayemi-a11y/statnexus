// src/components/analytics/ScoreChart.jsx
import Card from '../common/Card.jsx';

export default function ScoreChart({ history = [] }) {
  // Safe calculation parameters for baseline trends
  const safeHistory = history.length > 0 ? history : [
    { label: 'Settle Run 1', score: 60 },
    { label: 'Settle Run 2', score: 70 },
    { label: 'Settle Run 3', score: 90 }
  ];

  return (
    <Card variant="bubble" className="space-y-6">
      <div className="space-y-1">
        <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest">Performance Trends</p>
        <h4 className="text-lg font-black text-slate-900 tracking-tight">Historical Progression Tracker</h4>
      </div>

      <div className="space-y-4 pt-2">
        {safeHistory.map((item, idx) => {
          const percentage = item.score;
          const isPassing = percentage >= 70;

          return (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-500">{item.label || `Simulation Run #${idx + 1}`}</span>
                <span className={isPassing ? 'text-emerald-600 font-black' : 'text-rose-600 font-black'}>
                  {percentage}%
                </span>
              </div>
              
              {/* Native Graphical Timeline Meter */}
              <div className="h-3 w-full bg-slate-100 rounded-lg overflow-hidden relative border border-slate-200/40">
                {/* 70% Passing Threshold Layout Pin */}
                <div className="absolute top-0 bottom-0 left-[70%] w-0.5 bg-slate-300 z-10 linestyle-dashed" title="70% Passing Key Marker" />
                
                <div 
                  className={`h-full transition-all duration-1000 ease-out rounded-lg ${isPassing ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                  style={{ width: `${percentage}%` }} 
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-50">
        <div className="w-2 h-2 rounded-full bg-slate-300" />
        <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Vertical Line Represents 70% Board Pass Mark</span>
      </div>
    </Card>
  );
}