// src/components/analytics/WeakAreas.jsx
import { AlertCircle, ArrowRight } from 'lucide-react';
import Card from '../common/Card.jsx';

export default function WeakAreas({ analyticsData, onTriggerRevision }) {
  // Fallback map listing core disciplines requiring immediate remediation
  const weakDisciplines = analyticsData?.length > 0 ? analyticsData : [
    { subject: "Pharmacological & Parenteral Therapies", performance: 40, condition: "Critical Review Needed" },
    { subject: "Reduction of Risk Potential", performance: 55, condition: "Below Benchmark" },
    { subject: "Physiological Adaptation", performance: 65, condition: "Marginal Polish" }
  ];

  return (
    <Card variant="default" className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="p-2.5 bg-rose-50 text-rose-500 rounded-xl shrink-0">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Diagnostic Warning</p>
          <h4 className="text-lg font-black text-slate-900 tracking-tight">System Weak Areas Identified</h4>
        </div>
      </div>

      <div className="space-y-3">
        {weakDisciplines.map((item, idx) => (
          <div 
            key={idx} 
            onClick={onTriggerRevision}
            className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 border-2 border-slate-100 hover:border-rose-200 rounded-2xl bg-white transition-all cursor-pointer shadow-sm/5 gap-3"
          >
            <div className="space-y-1 max-w-xs">
              <p className="font-bold text-slate-800 text-sm leading-tight group-hover:text-rose-900 transition-colors">
                {item.subject}
              </p>
              <span className="inline-flex text-[9px] font-black bg-rose-50 text-rose-600 px-2 py-0.5 rounded uppercase tracking-wider">
                {item.condition}
              </span>
            </div>

            <div className="flex items-center gap-3 justify-between sm:justify-end shrink-0">
              <div className="text-right">
                <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Accuracy</p>
                <p className="text-sm font-black text-rose-600">{item.performance}%</p>
              </div>
              <div className="p-2 bg-slate-50 group-hover:bg-rose-500 group-hover:text-white rounded-xl transition-colors text-slate-400 shrink-0">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}