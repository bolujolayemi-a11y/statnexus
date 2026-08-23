// src/services/exam/questionGenerator.js
import { questionBank } from '../../data/nursingQuestions.js';
import { shuffleArray } from '../../utils/shuffle.js';

export function generateLocalSession(examType, topic) {
  const targetBoard = examType?.trim();
  const targetTopic = topic?.trim().toLowerCase();

  // 1. Get all questions for the board and topic ONLY
  const topicQuestions = questionBank.filter(q => 
    q.examType === targetBoard && 
    q.topic.toLowerCase() === targetTopic
  );

  // 2. If we don't have enough topic-specific questions, warn and use what we have
  if (topicQuestions.length < 20) {
    console.warn(`Only ${topicQuestions.length} questions available for topic: ${targetTopic}`);
  }

  // 3. Shuffle the topic questions
  const shuffledQuestions = shuffleArray(topicQuestions);

  // 4. Take up to 20 questions (or all available if less than 20)
  const sessionQuestions = shuffledQuestions.slice(0, 20);

  // 5. Ensure no duplicates by filtering out any exact duplicates
  const uniqueQuestions = sessionQuestions.filter((question, index, self) =>
    index === self.findIndex((q) => q.id === question.id)
  );

  return uniqueQuestions;
}