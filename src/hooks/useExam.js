// src/hooks/useExam.js
import { useState } from 'react';
import { generateLocalSession } from '../services/exam/questionGenerator.js';
import { calculateSessionScore } from '../services/exam/scoreCalculator.js';

export function useExam() {
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [config, setConfig] = useState({
    examType: 'NCLEX-RN',
    topic: 'Management of Care',
    count: 20
  });

  const initializeTestSession = (examType, topic) => {
    const activeQuestions = generateLocalSession(examType, topic);
    setQuestions(activeQuestions);
    setUserAnswers({});
    setScore(0);
    setConfig((prev) => ({ ...prev, examType, topic }));
  };

  const evaluateFinalAnswers = () => {
    const finalScore = calculateSessionScore(questions, userAnswers);
    setScore(finalScore);
    return finalScore;
  };

  const clearExamState = () => {
    setQuestions([]);
    setUserAnswers({});
    setScore(0);
  };

  return {
    config,
    setConfig,
    questions,
    userAnswers,
    setUserAnswers,
    score,
    initializeTestSession,
    evaluateFinalAnswers,
    clearExamState
  };
}