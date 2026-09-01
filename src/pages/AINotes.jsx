import { useState } from 'react';
import { apiFetch } from '../lib/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';

const SECTION_ICONS = {
  drug_class: '🏷️',
  mechanism: '⚙️',
  indications: '🎯',
  contraindications: '🚫',
  routes: '💉',
  dosage: '💊',
  side_effects: '⚠️',
  toxicity_signs: '☠️',
  antidote: '🧪',
  nursing_responsibilities: '🩺',
  golden_point: '⭐',
  location: '📍',
  anatomy: '🫀',
  functions: '💪',
  blood_supply: '🩸',
  innervation: '🧠',
  physiology: '📊',
  clinical_relevance: '🏥',
  common_disorders: '📋',
  what_it_is: '❓',
  types: '📂',
  parts: '🔧',
  equipment: '🛠️',
  procedure: '📝',
  precautions: '⚡',
  complications: '🚨',
  definition: '📖',
  causative_organism: '🦠',
  transmission: '🔄',
  risk_factors: '⚠️',
  pathophysiology: '🧬',
  signs_symptoms: '🩺',
  investigations: '🔬',
  treatment: '💊',
  prevention: '🛡️',
  nursing_management: '👩‍⚕️',
  preparation: '📋',
  post_procedure_care: '🏥',
  documentation: '📝',
  purpose: '🎯',
  normal_values: '✅',
  abnormal_findings: '❌',
  clinical_significance: '🏥',
  nursing_implications: '👩‍⚕️',
  patient_preparation: '📋',
  recognition: '👀',
  immediate_actions: '🚑',
  secondary_assessment: '🔍',
  medications: '💊',
  monitoring: '📊',
  importance: '⭐',
  principles: '📜',
  application: '💡',
  assessment: '🔍',
  interventions: '🛠️',
  evaluation: '✅'
};

export default function AINotes({ setView }) {
  const [topic, setTopic] = useState('');
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);
    setError('');
    setNote(null);

    try {
      const response = await apiFetch('/ai-notes/generate', {
        method: 'POST',
        body: JSON.stringify({ topic }),
      });

      setNote(response);
    } catch (err) {
      setError('Failed to generate note. Please try again.');
      console.error('AI Notes error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSectionIcon = (sectionTitle) => {
    const sectionKey = sectionTitle.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    return SECTION_ICONS[sectionKey] || '📝';
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-6 md:mb-8">
          <div className="flex items-center gap-3 min-w-0">
            <span className="shrink-0 w-10 h-10 md:w-11 md:h-11 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl md:text-2xl shadow-lg shadow-indigo-500/20">
              📝
            </span>
            <div className="min-w-0">
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-tight">AI Study Notes</h1>
              <p className="text-[11px] md:text-xs font-bold text-indigo-600 uppercase tracking-widest">Visual study posters</p>
            </div>
          </div>
          <button
            onClick={() => setView('dashboard')}
            className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-indigo-700 text-xs md:text-sm font-bold shadow-sm border border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
          >
            ← Back
          </button>
        </div>

        {/* Search Section */}
        <Card className="mb-6 md:mb-8">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
            Topic
          </label>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Magnesium sulfate, Heart, Foley catheter..."
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm md:text-base transition-colors"
                onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
              />
            </div>
            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="sm:w-auto px-6 py-3 text-sm md:text-base whitespace-nowrap"
            >
              {loading ? 'Generating...' : '✨ Generate Note'}
            </Button>
          </div>
          {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader />
            <p className="text-gray-600 mt-4">Creating your study note...</p>
          </div>
        )}

        {/* Generated Note — Infographic Poster */}
        {note && !loading && (
          <div className="bg-[#eef2fb] rounded-3xl shadow-xl overflow-hidden border-2 border-[#c7d2fe] print:shadow-none">
            {/* Poster Header */}
            <div className="relative px-4 md:px-8 pt-6 md:pt-10 pb-4 md:pb-6 text-center">
              <button
                onClick={() => setNote(null)}
                className="absolute left-3 md:left-5 top-4 md:top-6 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 hover:bg-white text-[#4338ca] text-xs md:text-sm font-bold shadow-sm border border-[#c7d2fe] transition-colors"
              >
                ← Back
              </button>
              <span className="text-3xl md:text-4xl">{note.icon}</span>
              <h2 className="font-serif text-3xl md:text-5xl font-black text-[#3730a3] leading-tight tracking-tight mt-1">
                {note.title}
              </h2>
              <p className="text-[#6366f1] text-xs md:text-sm font-semibold uppercase tracking-widest mt-2">
                {note.type} · Study Note
              </p>
            </div>

            {/* Poster Grid — masonry two-column */}
            <div className="px-4 md:px-8 pb-4 md:pb-6">
              <div className="columns-1 md:columns-2 gap-4 md:gap-5 [column-fill:balance]">
                {note.sections.map((section, index) => (
                  <div key={index} className="break-inside-avoid mb-4 md:mb-5 rounded-xl overflow-hidden border-2 border-[#c7d2fe] bg-white shadow-sm">
                    {/* Banner Header */}
                    <div className="bg-[#4f46e5] px-4 py-2.5">
                      <h3 className="text-white font-bold uppercase tracking-wide text-sm md:text-base text-center">
                        {section.title}
                      </h3>
                    </div>
                    {/* Items */}
                    <div className="p-4 md:p-5 space-y-4 md:space-y-5">
                      {Array.isArray(section.content) ? (
                        section.content.map((item, i) => {
                          const heading = typeof item === 'string' ? null : item.heading;
                          const description = typeof item === 'string' ? item : item.description;
                          return (
                            <div key={i} className="flex items-start gap-3">
                              <span className="shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#e0e7ff] border border-[#a5b4fc] flex items-center justify-center text-lg md:text-xl">
                                {getSectionIcon(heading || section.title)}
                              </span>
                              <div className="min-w-0">
                                {heading && (
                                  <p className="font-bold text-[#312e81] text-sm md:text-base leading-snug">{heading}</p>
                                )}
                                <p className={`text-[#4b5563] text-xs md:text-sm leading-relaxed ${heading ? 'mt-0.5' : 'font-semibold text-sm md:text-base'}`}>
                                  {description}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-[#4b5563] text-sm md:text-base">{section.content}</p>
                      )}
                    </div>
                  </div>
                ))}

                {/* Golden Point — bottom banner card */}
                {note.golden_point && (
                  <div className="break-inside-avoid mb-4 md:mb-5 rounded-xl overflow-hidden border-2 border-[#c7d2fe] bg-white shadow-sm">
                    <div className="bg-[#4f46e5] px-4 py-2.5">
                      <h3 className="text-white font-bold uppercase tracking-wide text-sm md:text-base text-center">
                        ⭐ Golden Point
                      </h3>
                    </div>
                    <div className="p-4 md:p-5 flex items-start gap-3">
                      <span className="shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#fef3c7] border border-[#fcd34d] flex items-center justify-center text-lg md:text-xl">
                        ⭐
                      </span>
                      <p className="text-[#312e81] font-semibold text-sm md:text-base leading-relaxed">
                        {note.golden_point}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Poster Footer */}
            <div className="bg-[#e0e7ff] px-4 md:px-6 py-3 md:py-4 border-t border-[#c7d2fe]">
              <p className="text-xs md:text-sm text-[#4338ca] text-center font-medium">
                Generated on {new Date(note.generated_at).toLocaleDateString()} • Topic: {note.topic}
              </p>
            </div>
          </div>
        )}

        {/* Example Topics */}
        {!note && !loading && (
          <Card className="mt-6 md:mt-8">
            <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">💡 Try these topics:</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
              {['Magnesium sulfate', 'Heart', 'Foley catheter', 'Oxytocin', 'Placenta', 'ECG', 'Insulin syringe', 'APGAR score'].map((exampleTopic) => (
                <button
                  key={exampleTopic}
                  onClick={() => setTopic(exampleTopic)}
                  className="px-3 md:px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-xs md:text-sm font-medium"
                >
                  {exampleTopic}
                </button>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}