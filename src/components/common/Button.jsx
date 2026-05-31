
// deno-lint-ignore-file
import { useState } from 'react';

export default function Button({ 
  children, 
  onClick, 
  variant = 'primary', 
  disabled = false, 
  className = '',
  type = 'button' 
}) {
  // Centralized aesthetic style map
  const baseStyles = "w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-[0.98] select-none flex items-center justify-center gap-2 disabled:opacity-20 disabled:scale-100 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800 shadow-xl",
    secondary: "bg-sky-600 text-white hover:bg-sky-700 shadow-lg shadow-sky-600/10",
    outline: "border-2 border-slate-100 bg-white text-slate-600 hover:border-slate-200 hover:text-slate-800 shadow-sm",
    ghost: "bg-slate-100 text-slate-500 hover:bg-slate-200"
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}