// src/components/exam/OptionCard.jsx
import { CheckCircle2, XCircle } from 'lucide-react';

export default function OptionCard({ 
  letter, 
  text, 
  isSelected, 
  onClick, 
  disabled = false,
  isReviewMode = false,
  isCorrectAnswer = false
}) {
  let statusStyle = "border-transparent bg-white shadow-sm hover:border-slate-200 text-slate-700";
  
  if (isSelected && !isReviewMode) {
    statusStyle = "border-sky-500 bg-sky-50 text-sky-900 shadow-sm";
  }
  
  if (isReviewMode) {
    if (isCorrectAnswer) {
      statusStyle = "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm opacity-100 ring-2 ring-emerald-500/20";
    } else if (isSelected) {
      statusStyle = "bg-rose-50 border-rose-200 text-rose-700 opacity-100 ring-2 ring-rose-500/20";
    } else {
      statusStyle = "bg-white border-slate-100 text-slate-400 opacity-60";
    }
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all ${statusStyle}`}
    >
      <span className={`w-11 h-11 shrink-0 flex items-center justify-center rounded-xl font-black ${
        isReviewMode && isCorrectAnswer ? 'bg-emerald-500 text-white' : 
        isReviewMode && isSelected ? 'bg-rose-500 text-white' : 
        isSelected ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-400'
      }`}>
        {letter}
      </span>
      <span className="font-bold tracking-tight text-sm flex-1 leading-tight">{text}</span>
      
      {isReviewMode && isCorrectAnswer && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
      {isReviewMode && isSelected && !isCorrectAnswer && <XCircle className="w-5 h-5 text-rose-500 shrink-0" />}
    </button>
  );
}