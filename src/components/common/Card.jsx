// src/components/common/Card.jsx
// deno-lint-ignore-file
import { useState } from 'react';

export default function Card({ 
  children, 
  variant = 'default', 
  className = '',
  onClick 
}) {
  const baseStyles = "transition-all duration-300";
  
  const variants = {
    default: "bg-white border border-slate-100 rounded-3xl shadow-sm p-6",
    bubble: "bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm",
    info: "p-6 bg-sky-50 rounded-3xl border border-sky-100 flex items-center justify-between",
    interactive: "bg-white border-2 border-slate-100 hover:border-sky-500 rounded-3xl p-6 shadow-sm hover:shadow-md cursor-pointer active:scale-[0.98]"
  };

  return (
    <div 
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </div>
  );
}