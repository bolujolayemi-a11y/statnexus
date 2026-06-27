// src/services/exam/questionGenerator.js
import { questionBank } from '../../data/nursingQuestions.js';
import { shuffleArray } from '../../utils/shuffle.js';

export function generateLocalSession(examType, topic) {
  const targetBoard = examType?.trim();
  const targetTopic = topic?.trim().toLowerCase();

  // 1. Get all questions for the board
  const boardPool = questionBank.filter(q => q.examType === targetBoard);

  // 2. Separate into priority (topic) and others
  const priority = boardPool.filter(q => q.topic.toLowerCase() === targetTopic);
  const others = boardPool.filter(q => q.topic.toLowerCase() !== targetTopic);

  // 3. Shuffle both separately to keep them randomized
  const shuffledPriority = shuffleArray(priority);
  const shuffledOthers = shuffleArray(others);

  // 4. Merge and slice - the shuffle happens here by mixing the two randomized pools
  // Then we take the first 10. This guarantees no duplicates for this specific session.
  return [...shuffledPriority, ...shuffledOthers].slice(0, 20);
}