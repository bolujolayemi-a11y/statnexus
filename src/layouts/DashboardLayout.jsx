import { LogIn, Shield, LogOut, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button.jsx';

export default function DashboardLayout({ 
  children, 
  headerActions, 
  isAuthenticated, 
  onLogOut, 
  setView, 
  onBack 
}) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans tracking-tight relative">
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm/5">
        
        {/* Left Side: Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => setView('dashboard')}
        >
          <div className="p-1.5 bg-sky-600 rounded-lg w-2.5 h-2.5" />
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tighter">
            STATNEXUS <span className="text-sky-600">AI</span>
          </h1>
        </div>

        {/* Right Side: Back Button + User Actions */}
        <div className="flex items-center gap-4">
          {headerActions}
          
          {/* Back Button now placed here, closer to the active status */}
          {onBack && (
            <button 
              onClick={onBack} 
              className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-100 rounded-xl transition-all text-slate-500 hover:text-slate-900"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-wider">Back</span>
            </button>
          )}

          {!isAuthenticated ? (
            <Button
              variant="primary"
              onClick={() => setView('auth')}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all"
            >
              <LogIn className="w-3.5 h-3.5" /> Join us
            </Button>
          ) : (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 pl-3 pr-2 py-1.5 rounded-xl">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Shield className="w-3 h-3 text-sky-500" /> Active
              </span>
              <Button 
                variant="ghost"
                onClick={onLogOut} 
                className="p-1.5 hover:text-rose-500 rounded-lg transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}