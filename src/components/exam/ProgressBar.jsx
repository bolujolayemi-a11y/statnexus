// src/components/exam/ProgressBar.jsx
export default function ProgressBar({ current, total }) {
  const progressPercentage = ((current + 1) / total) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end px-2">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assessment Progress</p>
        <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest">{current + 1} / {total}</p>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-sky-500 transition-all duration-500 ease-out" 
          style={{ width: `${progressPercentage}%` }} 
        />
      </div>
    </div>
  );
}