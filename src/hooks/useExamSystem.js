// src/hooks/useExamSystem.js
import { useContext } from 'react';
import { ExamContext } from '../context/ExamContext.jsx'; 

export function useExamSystem() {
  const context = useContext(ExamContext);
  if (!context) {
    throw new Error("useExamSystem must be used within an ExamProvider");
  }
  return context;
}