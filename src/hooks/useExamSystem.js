// src/hooks/useExamSystem.js
import { useContext } from 'react';
import { ExamContext } from '../context/ExamContext.jsx';

export function useExamSystem() {
  const context = useContext(ExamContext);
  if (!context) {
    throw new Error("useExamSystem must be executed safely underneath an ExamProvider matrix wrapper.");
  }
  return context;
}