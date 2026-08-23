import { BookOpen, Brain, BarChart3, Clock, Sparkles, Zap, Shield, Users, ArrowRight, CheckCircle, Star } from "lucide-react";
import Button from "../components/common/Button.jsx";
import Card from "../components/common/Card.jsx";

export default function Landing({ examDomains, onSelectExam, isAuthenticated, setView, navigateTo }) {
  
  const scrollToSelection = () => {
    const element = document.getElementById("board-selection-matrix");
    if (element) element.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToFeatures = () => {
    const element = document.getElementById("features-section");
    if (element) element.scrollIntoView({ behavior: "smooth" });
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      scrollToSelection();
    } else if (navigateTo) {
      navigateTo('auth', { mode: 'register' });
    } else {
      setView('auth');
    }
  };
  
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* --- HERO SECTION --- */}
      <section className="relative overflow-hidden">
        {/* Royal Blue Background Gradient */}
        <div className="absolute inset-0 bg-linear-to-br from-blue-700 via-indigo-700 to-blue-900"></div>
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-size-[16px_16px]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-xs font-bold uppercase tracking-widest">
                <Sparkles className="w-4 h-4" /> AI-Powered Nursing Prep
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                Master Nursing Exams with <span className="text-transparent bg-clip-text bg-linear-to-r from-yellow-300 to-amber-300">AI Intelligence</span>
              </h1>

              <p className="text-lg sm:text-xl text-blue-100 leading-relaxed font-medium max-w-2xl mx-auto lg:mx-0">
                Practice realistic exam scenarios, generate AI-powered study notes, and track your progress with StatNexus's advanced learning platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                <Button 
                  variant="secondary" 
                  onClick={handleGetStarted}
                  className="py-4 px-8 bg-blue-600 text-white hover:bg-blue-700 font-bold shadow-xl shadow-blue-950/30"
                >
                  {isAuthenticated ? "View Exam Boards" : "Get Started Free"}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  variant="default"
                  onClick={scrollToFeatures}
                  className="py-4 px-8 bg-transparent border-2 border-white/30 text-white hover:bg-white/10 font-bold"
                >
                  Learn More
                </Button>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">500+</div>
                  <div className="text-xs text-blue-200 font-medium">Questions</div>
                </div>
                <div className="w-px h-8 bg-white/20"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">95%</div>
                  <div className="text-xs text-blue-200 font-medium">Success Rate</div>
                </div>
                <div className="w-px h-8 bg-white/20"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">24/7</div>
                  <div className="text-xs text-blue-200 font-medium">AI Support</div>
                </div>
              </div>
            </div>

            {/* Hero Illustration */}
            <div className="hidden lg:block relative">
              <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
                <div className="bg-linear-to-br from-blue-800 to-indigo-800 rounded-2xl p-6 mb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Brain className="w-8 h-8 text-white" />
                    <span className="text-white font-bold">AI-Powered Learning</span>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white/20 rounded-lg p-3 flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-300" />
                      <span className="text-white text-sm">Smart Question Analysis</span>
                    </div>
                    <div className="bg-white/20 rounded-lg p-3 flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-300" />
                      <span className="text-white text-sm">AI Study Notes Generation</span>
                    </div>
                    <div className="bg-white/20 rounded-lg p-3 flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-300" />
                      <span className="text-white text-sm">Progress Tracking</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-white/60 text-sm">
                  <span>Latest Feature</span>
                  <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-300" /> AI Notes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- AI NOTES FEATURE HIGHLIGHT --- */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles className="w-4 h-4" /> New Feature
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">
            AI-Powered Study Notes
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Generate beautiful, structured study notes for any nursing topic instantly
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 border-2 border-blue-100 hover:border-blue-400 transition-colors">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-blue-700" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Smart Classification</h3>
            <p className="text-sm text-slate-600">AI automatically identifies topics as drugs, organs, diseases, or procedures</p>
          </Card>

          <Card className="p-6 border-2 border-blue-100 hover:border-blue-400 transition-colors">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-blue-700" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Structured Content</h3>
            <p className="text-sm text-slate-600">Get organized sections with clinical relevance and exam-focused points</p>
          </Card>

          <Card className="p-6 border-2 border-blue-100 hover:border-blue-400 transition-colors">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Star className="w-6 h-6 text-blue-700" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Golden Points</h3>
            <p className="text-sm text-slate-600">Memorable exam tips and clinical pearls for every topic</p>
          </Card>
        </div>
      </section>

      {/* --- BOARD SELECTION --- */}
      <section id="board-selection-matrix" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-100">
        <div className="text-center mb-12">
          <p className="text-xs font-black text-blue-700 uppercase tracking-widest mb-2">Available Syllabi</p>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Select your examination</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.keys(examDomains || {}).map((id) => (
            <Card
              key={id}
              variant="interactive"
              onClick={() => isAuthenticated ? onSelectExam(id) : (typeof setView === 'function' && setView('auth'))}
              className="group flex items-center justify-between p-6 h-32 border-2 border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="p-4 bg-linear-to-br from-blue-700 to-indigo-700 text-white rounded-2xl group-hover:scale-110 transition-transform">
                  <Brain className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-black text-slate-900 uppercase tracking-tight text-lg">{id}</p>
                  <p className="text-blue-700 text-xs font-bold uppercase tracking-widest mt-1">Practice Quiz</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-700 group-hover:translate-x-1 transition-all" />
            </Card>
          ))}
        </div>
      </section>

      {/* --- FEATURES --- */}
      <section id="features-section" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Why students choose StatNexus</p>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Everything you need to succeed</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard icon={<BookOpen className="w-6 h-6" />} title="Authentic Questions" description="Study with hundreds of exam-style questions designed to match current nursing standards." color="blue" />
          <FeatureCard icon={<Brain className="w-6 h-6" />} title="AI Explanations" description="Get clear, step-by-step AI-powered explanations for every question to understand the logic." color="blue" />
          <FeatureCard icon={<BarChart3 className="w-6 h-6" />} title="Track Your Growth" description="Monitor your performance over time to see exactly where you are improving." color="blue" />
          <FeatureCard icon={<Clock className="w-6 h-6" />} title="Timed Simulations" description="Take short, high-yield practice quizzes to improve your speed and confidence." color="blue" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <FeatureCard icon={<Shield className="w-6 h-6" />} title="Secure Platform" description="Your data is protected with enterprise-grade security and privacy measures." color="blue" />
          <FeatureCard icon={<Users className="w-6 h-6" />} title="Community Support" description="Join thousands of nursing students preparing for their exams together." color="blue" />
          <FeatureCard icon={<Zap className="w-6 h-6" />} title="Instant Results" description="Get immediate feedback on your performance with detailed analytics." color="blue" />
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-linear-to-r from-blue-700 to-indigo-700 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-black mb-4">Ready to ace your nursing exam?</h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of nursing students who trust StatNexus for their exam preparation
          </p>
          <Button 
            variant="secondary" 
            onClick={handleGetStarted}
            className="py-4 px-8 bg-white text-blue-700 hover:bg-blue-50 font-bold shadow-xl"
          >
            {isAuthenticated ? "Start Practicing" : "Get Started Free"}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-6 h-6 text-blue-400" />
                <span className="font-bold text-lg">StatNexus</span>
              </div>
              <p className="text-slate-400 text-sm">AI-powered nursing exam preparation platform designed for success.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Features</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>AI Study Notes</li>
                <li>Practice Quizzes</li>
                <li>Progress Tracking</li>
                <li>Performance Analytics</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>Study Guides</li>
                <li>Exam Tips</li>
                <li>Nursing Blog</li>
                <li>Community</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Contact Us</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center">
            <p className="text-slate-400 text-sm">StatNexus AI © 2026. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, color = "blue" }) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-700",
  };

  return (
    <Card variant="default" className="flex flex-col gap-4 items-start p-6 hover:shadow-lg transition-shadow">
      <div className={`p-4 rounded-xl ${colorClasses[color] || colorClasses.blue}`}>{icon}</div>
      <div>
        <h3 className="font-bold text-slate-900 text-base tracking-tight">{title}</h3>
        <p className="text-slate-600 text-sm font-semibold leading-relaxed mt-2">{description}</p>
      </div>
    </Card>
  );
}