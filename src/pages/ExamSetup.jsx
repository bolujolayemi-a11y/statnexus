// src/pages/ExamSetup.jsx
import { Stethoscope } from 'lucide-react';
import { useExamSystem } from '../context/ExamContext.jsx';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';

export default function ExamSetup({ examDomains, onBack, onStartSimulation }) {
  const { config, setConfig } = useExamSystem();

  // Ensure a default topic is set if none is selected
  const handleTopicChange = (e) => {
    setConfig({ ...config, topic: e.target.value });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 text-left">
      <Card variant="info" className="flex justify-between items-center">
        <div>
          <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest">Selected Syllabus</p>
          <p className="text-xl font-black text-sky-900">{config.examType}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest">Item Limit</p>
          <p className="text-xl font-black text-sky-900">10</p>
        </div>
      </Card>

      <div className="space-y-3">
        <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2 tracking-wider">
          <Stethoscope className="w-3 h-3 text-sky-500" /> Focus Domain
        </label>
        
        <select 
          value={config.topic || ''} 
          onChange={handleTopicChange} 
          className="w-full p-5 rounded-2xl border-2 border-slate-100 bg-white font-bold text-slate-700 focus:border-sky-500 focus:outline-none transition-all cursor-pointer"
        >
          <option value="" disabled>Select a focus domain...</option>
          {examDomains[config.examType]?.map((topic) => (
            <option key={topic} value={topic}>{topic}</option>
          ))}
        </select>
      </div>

      <div className="space-y-3 pt-4">
        <Button 
          variant="primary" 
          onClick={onStartSimulation} 
          disabled={!config.topic} // Disable until a topic is chosen
        >
          Start Assessment
        </Button>
        
        <Button variant="outline" onClick={onBack}>
          Change Examination Board
        </Button>
      </div>
    </div>
  );
}