import { ArrowLeft } from "lucide-react";

export default function AuthLayout({ children, onBack }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300">
      {/* 
        Changed to mx-auto w-full max-w-sm 
        'max-w-sm' (24rem/384px) is often more visually balanced for auth forms 
        than the standard 'max-w-md' (28rem/448px)
      */}
      <div className="mx-auto w-full max-w-sm relative">
        {/* Back Button */}
        {onBack && (
          <button 
            type="button"
            onClick={onBack}
            className="absolute -top-12 left-0 flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors text-xs font-black uppercase tracking-widest"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        )}
        
        <div className="bg-white py-8 px-6 border-2 border-slate-100 shadow-sm rounded-4xl">
          {children}
        </div>
      </div>
    </div>
  );
}