import { useState, useEffect } from 'react';
import { User, Save, Loader2, CheckCircle2, Trash2 } from 'lucide-react';
import { apiFetch } from '../lib/api.js';
import { auth } from '../lib/auth.js';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';

export default function Profile({ setView }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ full_name: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await apiFetch('/profile');
        if (data) setFormData({ full_name: data.full_name || '' });
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await apiFetch('/profile', {
        method: 'PATCH',
        body: JSON.stringify(formData),
      });
      setMessage('Profile updated!');
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you absolutely sure? This will permanently delete your data.")) return;
    try {
      await auth.deleteAccount();
      window.location.reload();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-sky-600" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 text-left">
      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Account Settings</h2>
      </div>

      <Card variant="bubble" className="space-y-6 p-6">
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase text-slate-400">Full Name</label>
          <input 
            className="w-full p-4 border-2 border-slate-100 rounded-xl bg-slate-50 font-bold"
            value={formData.full_name}
            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
          />
        </div>

        <Button onClick={handleUpdate} className="w-full flex items-center justify-center gap-2">
          {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>

        {message && (
          <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold justify-center">
            <CheckCircle2 className="w-4 h-4" /> {message}
          </div>
        )}
      </Card>

      <div className="pt-6 border-t border-slate-100 space-y-4">
        <p className="text-[10px] font-black uppercase text-slate-400">Danger Zone</p>
        
        <button 
          onClick={handleDeleteAccount}
          className="w-full p-4 flex items-center justify-center gap-2 text-red-600 font-black text-sm uppercase tracking-widest border-2 border-red-100 rounded-xl hover:bg-red-50 transition-all"
        >
          <Trash2 className="w-4 h-4" /> Delete Account
        </button>
      </div>
    </div>
  );
}
