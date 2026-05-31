import { useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient.js'; // Added import
import ProgressBar from '../components/exam/ProgressBar.jsx';
import Timer from '../components/exam/Timer.jsx';
import QuestionCard from '../components/exam/QuestionCard.jsx';
import OptionCard from '../components/exam/OptionCard.jsx';
import Button from '../components/common/Button.jsx';

export default function ExamSession({ questions, userAnswers, setUserAnswers, onCompleteExam, examType }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const startTime = useRef(Date.now());

  const handleAnswerSelect = (letter) => {
    setUserAnswers({ ...userAnswers, [currentIndex]: letter });
  };

  const handleComplete = async (timeSpentMins) => {
    // 1. Calculate Score
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correct) correctCount++;
    });
    const finalScore = Math.round((correctCount / questions.length) * 100);

    // 2. Save to Supabase
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('test_results').insert([
          {
            user_id: user.id,
            exam_type: examType || 'General',
            score: finalScore,
            questions_count: questions.length,
            duration_minutes: timeSpentMins
          }
        ]);
      }
    } catch (err) {
      console.error("Failed to save result:", err);
    }

    // 3. Finalize simulation
    onCompleteExam(timeSpentMins);
  };

  const triggerComplete = () => {
    const timeSpentMs = Date.now() - startTime.current;
    const timeSpentMins = Math.max(1, Math.round(timeSpentMs / 60000));
    handleComplete(timeSpentMins);
  };

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const isLastQuestion = currentIndex + 1 === totalQuestions;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 text-left">
      {/* Header and UI components remain the same */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <span className="text-[10px] font-black bg-sky-50 text-sky-600 px-3 py-1.5 rounded-xl uppercase tracking-widest">Live Simulation</span>
        <Timer initialSeconds={600} onTimeUp={triggerComplete} />
      </div>

      <ProgressBar current={currentIndex} total={totalQuestions} />
      <QuestionCard questionText={currentQuestion?.question} />

      <div className="grid gap-3">
        {Object.entries(currentQuestion?.options || {}).map(([key, value]) => (
          <OptionCard key={key} letter={key} text={value} isSelected={userAnswers[currentIndex] === key} onClick={() => handleAnswerSelect(key)} />
        ))}
      </div>

      <div className="flex gap-4 pt-4">
        <Button variant="outline" disabled={currentIndex === 0} onClick={() => setCurrentIndex((c) => c - 1)} className="flex-1">Previous</Button>
        {isLastQuestion ? (
          <Button variant="secondary" disabled={!userAnswers[currentIndex]} onClick={triggerComplete} className="flex-[2.5]">Final Submit</Button>
        ) : (
          <Button variant="primary" disabled={!userAnswers[currentIndex]} onClick={() => setCurrentIndex((c) => c + 1)} className="flex-[2.5]">Next Question</Button>
        )}
      </div>
    </div>
  );
}