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
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">📝 AI Study Notes</h1>
          <Button onClick={() => setView('dashboard')} variant="secondary" className="text-sm md:text-base">
            ← Back
          </Button>
        </div>

        {/* Search Section */}
        <Card className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a topic (e.g., Magnesium sulfate, Heart, Foley catheter...)"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm md:text-base"
              onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
            />
            <Button 
              onClick={handleGenerate} 
              disabled={loading}
              className="px-4 md:px-6 py-3 text-sm md:text-base"
            >
              {loading ? 'Generating...' : 'Generate Note'}
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

        {/* Generated Note */}
        {note && !loading && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-indigo-100">
            {/* Note Header */}
            <div className="bg-linear-to-r from-indigo-600 to-purple-600 text-white p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3">
                  <span className="text-3xl md:text-4xl">{note.icon}</span>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold">{note.title}</h2>
                    <p className="text-indigo-200 text-xs md:text-sm capitalize">{note.type}</p>
                  </div>
                </div>
                <Button 
                  onClick={() => setNote(null)} 
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 text-sm md:text-base px-3 md:px-4 py-2"
                >
                  ← Back
                </Button>
              </div>
            </div>

            {/* Note Sections */}
            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
              {note.sections.map((section, index) => (
                <div key={index} className="bg-linear-to-br from-gray-50 to-blue-50 rounded-xl p-4 md:p-5 border-l-4 border-indigo-400">
                  <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-2 md:mb-3 flex items-center gap-2">
                    <span>{getSectionIcon(section.title)}</span>
                    {section.title}
                  </h3>
                  <ul className="space-y-1 md:space-y-2">
                    {Array.isArray(section.content) ? (
                      section.content.map((item, i) => (
                        <li key={i} className="text-gray-700 flex items-start gap-2 text-sm md:text-base">
                          <span className="text-indigo-500 mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-700 text-sm md:text-base">{section.content}</li>
                    )}
                  </ul>
                </div>
              ))}

              {/* Golden Point */}
              {note.golden_point && (
                <div className="bg-linear-to-r from-yellow-50 to-orange-50 rounded-xl p-4 md:p-5 border-2 border-yellow-300">
                  <h3 className="text-base md:text-lg font-semibold text-orange-800 mb-2 flex items-center gap-2">
                    <span>⭐</span>
                    Golden Point
                  </h3>
                  <p className="text-orange-900 font-medium text-sm md:text-base">{note.golden_point}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 md:px-6 py-3 md:py-4 border-t">
              <p className="text-xs md:text-sm text-gray-500 text-center">
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