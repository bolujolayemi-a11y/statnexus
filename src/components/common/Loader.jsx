// src/components/common/Loader.jsx
// deno-lint-ignore-file
import { useState } from 'react';
import { Activity } from 'lucide-react';

export default function Loader({ 
  message = "Loading...", 
  subMessage = "Building your personalized study guide..." 
}) {
  return (
    <div className="py-20 text-center space-y-6 animate-in fade-in duration-500">
      <div className="relative inline-flex">
        {/* Soft layout background radar pulse */}
        <div className="absolute inset-0 rounded-full bg-sky-500/20 animate-ping scale-150 opacity-75"></div>
        <div className="p-4 bg-sky-50 text-sky-600 rounded-2xl relative shadow-sm">
          <Activity className="w-8 h-8 animate-pulse" />
        </div>
      </div>
      <div className="space-y-1">
        <h3 className="text-xl font-black text-slate-900 italic tracking-tighter">{message}</h3>
        {subMessage && <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{subMessage}</p>}
      </div>
    </div>
  );
}