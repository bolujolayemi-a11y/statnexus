import { useState, useEffect } from 'react';
import { ArrowLeft, BadgeCheck, BookOpen, Check, ChevronDown, CircleAlert, Loader2, Save, Shield, Trash2, UserRound } from 'lucide-react';
import { apiFetch } from '../lib/api.js';
import { auth } from '../lib/auth.js';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';

const SYLLABUS_OPTIONS = ['NCLEX-RN', 'NMCN-RN', 'UK-NMC-CBT'];

function normalizeSyllabusFocus(value) {
  const normalized = value?.trim().toUpperCase();
  const aliases = {
    NCLEX: 'NCLEX-RN',
    NMCN: 'NMCN-RN',
    'NMC UK': 'UK-NMC-CBT',
    'UK NMC': 'UK-NMC-CBT',
  };
  const option = aliases[normalized] || normalized;
  return SYLLABUS_OPTIONS.includes(option) ? option : '';
}

export default function Profile({ setView }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', syllabus_focus: '' });
  const [savedData, setSavedData] = useState({ full_name: '', syllabus_focus: '' });
  const [account, setAccount] = useState({ email: '', email_verified: false, account_tier: 'STANDARD' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const hasChanges = formData.full_name !== savedData.full_name || formData.syllabus_focus !== savedData.syllabus_focus;

  useEffect(() => {
    async function loadProfile() {
      try {
        const [profile, userResponse] = await Promise.all([
          apiFetch('/profile'),
          auth.getUser(),
        ]);
        const initialForm = {
          full_name: profile?.full_name || '',
          syllabus_focus: normalizeSyllabusFocus(profile?.syllabus_focus),
        };
        setFormData(initialForm);
        setSavedData(initialForm);
        setAccount({
          email: userResponse.data.user?.email || '',
          email_verified: userResponse.data.user?.email_verified || false,
          account_tier: profile?.account_tier || 'STANDARD',
        });
      } catch (err) {
        console.error('Failed to load profile:', err);
        setStatus({ type: 'error', message: 'Could not load your profile. Please refresh and try again.' });
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const updateField = (field) => (event) => {
    setFormData((current) => ({ ...current, [field]: event.target.value }));
    setStatus({ type: '', message: '' });
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    if (!hasChanges) return;

    setSaving(true);
    setStatus({ type: '', message: '' });
    try {
      const updated = await apiFetch('/profile', {
        method: 'PATCH',
        body: JSON.stringify(formData),
      });
      const nextForm = {
        full_name: updated.full_name || '',
        syllabus_focus: updated.syllabus_focus || '',
      };
      setFormData(nextForm);
      setSavedData(nextForm);
      setAccount((current) => ({ ...current, account_tier: updated.account_tier || current.account_tier }));
      setStatus({ type: 'success', message: 'Your profile has been updated.' });
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Could not save your changes.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Delete your account permanently? Your profile and saved exam data will be removed. This cannot be undone.')) return;
    setDeleting(true);
    try {
      await auth.deleteAccount();
      window.location.reload();
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Could not delete your account.' });
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-72 items-center justify-center" role="status" aria-label="Loading profile">
        <Loader2 className="h-6 w-6 animate-spin text-sky-700" />
      </div>
    );
  }

  const initials = formData.full_name.trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || <UserRound className="h-7 w-7" />;

  return (
    <div className="mx-auto max-w-4xl space-y-7 animate-in fade-in duration-500 text-left">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-black uppercase tracking-widest text-sky-700">Your account</p>
          <h2 className="text-3xl font-black tracking-tight text-slate-950">Profile settings</h2>
          <p className="mt-2 text-sm text-slate-600">Manage your details and exam preparation focus.</p>
        </div>
        <button
          type="button"
          onClick={() => setView('dashboard')}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950"
        >
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </button>
      </div>

      <section className="flex flex-col gap-5 border-y border-slate-200 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-xl font-black text-sky-800" aria-label="Profile avatar">
            {initials}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-xl font-black text-slate-950">{formData.full_name || 'Your profile'}</h3>
            <p className="mt-1 truncate text-sm text-slate-600">{account.email || 'Email unavailable'}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-3 py-2 text-xs font-black uppercase tracking-wider text-slate-700">
            <Shield className="h-3.5 w-3.5 text-sky-700" /> {account.account_tier} tier
          </span>
          <span className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-bold ${account.email_verified ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
            <BadgeCheck className="h-4 w-4" />
            {account.email_verified ? 'Email verified' : 'Email not verified'}
          </span>
        </div>
      </section>

      <form onSubmit={handleUpdate} className="space-y-6">
        <section aria-labelledby="study-profile-heading" className="space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
            <BookOpen className="h-5 w-5 text-sky-700" />
            <div>
              <h3 id="study-profile-heading" className="font-black text-slate-950">Study profile</h3>
              <p className="mt-0.5 text-sm text-slate-600">Keep the details used to personalize your account up to date.</p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="profile-full-name" className="text-xs font-black uppercase tracking-wider text-slate-600">Full name</label>
              <input
                id="profile-full-name"
                autoComplete="name"
                maxLength={120}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-sky-600 focus:ring-2 focus:ring-sky-100"
                value={formData.full_name}
                onChange={updateField('full_name')}
                placeholder="Enter your name"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="profile-syllabus-focus" className="text-xs font-black uppercase tracking-wider text-slate-600">Exam focus</label>
              <div className="relative">
                <select
                  id="profile-syllabus-focus"
                  className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-4 py-3 pr-11 text-sm font-semibold text-slate-900 outline-none transition focus:border-sky-600 focus:ring-2 focus:ring-sky-100"
                  value={formData.syllabus_focus}
                  onChange={updateField('syllabus_focus')}
                >
                  <option value="" disabled>Select an exam board</option>
                  {SYLLABUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <ChevronDown
                  aria-hidden="true"
                  className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                />
              </div>
            </div>
          </div>
        </section>

        {status.message && (
          <div
            role={status.type === 'error' ? 'alert' : 'status'}
            className={`flex items-start gap-2 rounded-lg px-4 py-3 text-sm font-semibold ${status.type === 'error' ? 'bg-rose-50 text-rose-800' : 'bg-emerald-50 text-emerald-800'}`}
          >
            {status.type === 'error' ? <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" /> : <Check className="mt-0.5 h-4 w-4 shrink-0" />}
            {status.message}
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">{hasChanges ? 'You have unsaved changes.' : 'Your profile is up to date.'}</p>
          <Button
            type="submit"
            disabled={saving || !hasChanges}
            className="w-full rounded-lg! py-3! text-sm! sm:w-auto sm:min-w-40"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </form>

      <section aria-labelledby="danger-zone-heading" className="border-t border-rose-200 pt-6">
        <div className="flex flex-col gap-4 rounded-lg border border-rose-200 bg-rose-50/60 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 id="danger-zone-heading" className="font-black text-rose-950">Delete account</h3>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-rose-800">Permanently remove your account and saved data. This action cannot be undone.</p>
          </div>
          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-rose-300 bg-white px-4 py-2.5 text-sm font-bold text-rose-800 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            {deleting ? 'Deleting...' : 'Delete account'}
          </button>
        </div>
      </section>

    </div>
  );
}
