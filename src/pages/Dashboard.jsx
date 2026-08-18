import { useState, useEffect } from 'react';
import { Activity, ChevronRight, Loader2, User, History } from 'lucide-react';
import Card from '../components/common/Card.jsx';
import { apiFetch } from '../lib/api.js';

export default function Dashboard({ examDomains, onSelectExam, setView }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ name: '', tier: '' });
  const [stats, setStats] = useState({ avg: 0, sprints: 0, time: 0 });

  useEffect(() => {
    async function fetchData() {
      try {
        const [profileData, results] = await Promise.all([
          apiFetch('/profile'),
          apiFetch('/test-results'),
        ]);

        if (profileData) {
          setProfile({ name: profileData.full_name, tier: profileData.account_tier });
        }

        if (results && results.length > 0) {
          const totalScore = results.reduce((acc, curr) => acc + (Number(curr.score) || 0), 0);
          const totalTime = results.reduce((acc, curr) => acc + (Number(curr.duration_minutes) || 0), 0);

          setStats({ 
            avg: Math.round(totalScore / results.length), 
            sprints: results.length, 
            time: totalTime 
          });
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-left">
      {/* User Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Welcome, {profile.name || 'Candidate'}!</h2>
          <p className="text-sky-600 text-xs font-black uppercase tracking-widest">{profile.tier || 'STANDARD'} Tier Active</p>
        </div>
        <button type="button" onClick={() => setView('profile')} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white transition-colors">
          <User className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="flex justify-center p-10"><Loader2 className="animate-spin text-sky-600" /></div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Average</p>
            <p className="text-xl font-black text-sky-600">{stats.avg}%</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Attempts</p>
            <p className="text-xl font-black text-slate-900">{stats.sprints}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Time</p>
            <p className="text-xl font-black text-emerald-600">{stats.time}m</p>
          </div>
        </div>
      )}

      {/* History Entry Point */}
      <Card 
        variant="interactive" 
        onClick={() => setView('history')} 
        className="flex items-center justify-between p-5 border-sky-100 bg-sky-50/50"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white text-sky-600 rounded-2xl shadow-sm">
            <History className="w-5 h-5" />
          </div>
          <div>
            <p className="font-black text-slate-900 uppercase tracking-tight">Performance History</p>
            <p className="text-[10px] font-bold text-sky-600 uppercase">Review past questions & corrections</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-sky-400" />
      </Card>

      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Available Simulators</h3>
        <div className="grid gap-4">
          {Object.keys(examDomains || {}).map((domain) => (
            <Card key={domain} variant="interactive" onClick={() => onSelectExam(domain)} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-50 text-slate-600 rounded-2xl"><Activity className="w-5 h-5" /></div>
                <div><p className="font-black text-slate-900 uppercase tracking-tight">{domain}</p></div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300" />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
