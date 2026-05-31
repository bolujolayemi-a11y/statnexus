// src/components/exam/Timer.jsx
import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

export default function Timer({ initialSeconds = 600, onTimeUp }) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds <= 0) {
      if (onTimeUp) onTimeUp();
      return;
    }

    const interval = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [seconds, onTimeUp]);

  const formatTime = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 border border-slate-200 text-slate-700 rounded-xl font-mono text-xs font-black tracking-wider shadow-sm select-none">
      <Clock className="w-3.5 h-3.5 text-slate-500" />
      <span>{formatTime(seconds)}</span>
    </div>
  );
}