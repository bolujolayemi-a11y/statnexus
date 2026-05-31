import { BookOpen, Brain, BarChart3, Clock, ChevronRight } from "lucide-react";
import Button from "../components/common/Button.jsx";
import Card from "../components/common/Card.jsx";

export default function Landing({ examDomains, onSelectExam, isAuthenticated, setView }) {
  
  const scrollToSelection = () => {
    const element = document.getElementById("board-selection-matrix");
    if (element) element.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* --- HERO SECTION --- */}
      <section className="bg-linear-to-r from-slate-950 via-slate-900 to-sky-950 text-white rounded-b-[3.5rem] shadow-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-24 md:py-32 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="text-center md:text-left space-y-6 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/10 border border-sky-400/20 rounded-full text-sky-400 text-[10px] font-black uppercase tracking-widest mx-auto md:mx-0">
              <Brain className="w-3 h-3" /> Nursing Exam Prep
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Pass your nursing exams with <span className="text-sky-400">confidence.</span>
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-slate-300 leading-relaxed font-medium">
              StatNexus helps international and local nursing candidates practice realistic exam scenarios, track progress, and master board-standard requirements.
            </p>

            <div className="pt-4 max-w-xs mx-auto md:mx-0">
              <Button 
                variant="secondary" 
                onClick={isAuthenticated ? scrollToSelection : () => setView('auth')}
                className="py-4 shadow-lg shadow-sky-600/20"
              >
                {isAuthenticated ? "View Exam Boards" : "Get Started Now"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* --- BOARD SELECTION --- */}
      <section id="board-selection-matrix" className="py-20 px-6 max-w-7xl mx-auto space-y-8 scroll-mt-24">
        <div className="text-center md:text-left">
          <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest">Available Syllabi</p>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Select your examination</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.keys(examDomains || {}).map((id) => (
            <Card
              key={id}
              variant="interactive"
              onClick={() => isAuthenticated ? onSelectExam(id) : setView('auth')}
              className="flex items-center justify-between p-6 h-28"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-sky-50 text-sky-600 rounded-2xl">
                  <Brain className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-black text-slate-900 uppercase tracking-tight">{id}</p>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-0.5">Practice Quiz</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300" />
            </Card>
          ))}
        </div>
      </section>

      {/* --- FEATURES --- */}
      <section className="py-16 px-6 max-w-7xl mx-auto space-y-8">
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 text-center">Why students choose StatNexus</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard icon={<BookOpen className="w-5 h-5" />} title="Authentic Questions" description="Study with hundreds of exam-style questions designed to match current nursing standards." />
          <FeatureCard icon={<Brain className="w-5 h-5" />} title="Simple Explanations" description="Get clear, step-by-step explanations for every question so you learn the logic behind the correct answer." />
          <FeatureCard icon={<BarChart3 className="w-5 h-5" />} title="Track Your Growth" description="Monitor your performance over time to see exactly where you are improving." />
          <FeatureCard icon={<Clock className="w-5 h-5" />} title="Timed Simulations" description="Take short, high-yield practice quizzes to improve your speed and confidence." />
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 px-6 text-center border-t border-slate-200">
        <p className="text-xs font-black uppercase text-slate-400">StatNexus AI © 2026</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <Card variant="default" className="flex flex-col gap-4 items-start p-6">
      <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">{icon}</div>
      <div>
        <h3 className="font-bold text-slate-900 text-sm tracking-tight">{title}</h3>
        <p className="text-slate-500 text-xs font-semibold leading-relaxed mt-1">{description}</p>
      </div>
    </Card>
  );
}