import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "../lib/supabaseClient.js";
import Button from "../components/common/Button.jsx";

export default function Auth({ onAuthenticate, setView }) {
  const [mode, setMode] = useState("register");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "register") {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: { data: { full_name: formData.fullName } }
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });
        if (error) throw error;
      }
      onAuthenticate();
      setView('dashboard');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight text-center">
        {mode === "register" ? "Create Account" : "Sign In"}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "register" && (
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400">Full Name</label>
            <input 
              type="text" required placeholder="Enter your full name" 
              className="w-full p-4 border-2 border-slate-100 rounded-xl bg-slate-50/50"
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            />
          </div>
        )}
        
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-slate-400">Email</label>
          <input 
            type="email" required placeholder="name@domain.com" 
            className="w-full p-4 border-2 border-slate-100 rounded-xl bg-slate-50/50"
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-slate-400">Password</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"}
              required placeholder="••••••••" 
              className="w-full p-4 border-2 border-slate-100 rounded-xl bg-slate-50/50 pr-12"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-4 text-slate-400 hover:text-sky-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <Button variant="primary" type="submit" className="w-full py-4" disabled={loading}>
          {loading ? "Processing..." : (mode === "register" ? "Create Account" : "Sign In")}
        </Button>
      </form>

      <p className="text-center text-xs font-bold text-slate-400">
        {mode === "register" ? "Already have an account? " : "New here? "}
        <button 
          type="button"
          onClick={() => setMode(mode === "register" ? "login" : "register")}
          className="text-sky-600 font-black uppercase hover:text-sky-700"
        >
          {mode === "register" ? "Sign In" : "Register"}
        </button>
      </p>
    </div>
  );
}