// src/context/ExamContext.jsx
import { createContext } from 'react';
import { useExam } from '../hooks/useExam.js';

export const ExamContext = createContext(null);

export function ExamProvider({ children }) {
  const examLifecycle = useExam();

  return (
    <ExamContext.Provider value={examLifecycle}>
      {children}
    </ExamContext.Provider>
  );
}