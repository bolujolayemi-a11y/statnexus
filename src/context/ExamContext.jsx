// src/context/ExamContext.jsx
import { createContext, useContext } from 'react';
import { useExam } from '../hooks/useExam.js';

const ExamContext = createContext(null);

export function ExamProvider({ children }) {
  const examLifecycle = useExam();

  return (
    <ExamContext.Provider value={examLifecycle}>
      {children}
    </ExamContext.Provider>
  );
}

export function useExamSystem() {
  const context = useContext(ExamContext);
  if (!context) {
    throw new Error("useExamSystem must be executed safely underneath an ExamProvider matrix wrapper.");
  }
  return context;
}