// src/services/exam/questionGenerator.js
import {questionBank} from '../../data/nursingQuestions.js';
import { shuffleArray } from '../../utils/shuffle.js';

/**
 * Filters and compiles exactly 10 questions based on active criteria
 * Handles automatic board fallback pools if a specific sub-topic is under-populated.
 * @param {string} examType - e.g., 'NCLEX-RN', 'NMCN-RN'
 * @param {string} topic - Focus sub-domain area
 * @returns {Array} - Exactly 10 structured question tokens
 */
export function generateLocalSession(examType, topic) {
  // Normalize comparison parameters to prevent whitespace or case mismatches
  const targetBoard = examType?.trim();
  const targetTopic = topic?.trim().toLowerCase();

  // 1. Filter out exact matches (Correct Board AND Correct Topic)
  const exactMatches = questionBank.filter(
    (q) => q.examType === targetBoard && q.topic.toLowerCase() === targetTopic
  );

  // 2. Gather broader pool elements (Same Board, different topics) as safety reserves
  const boardReserves = questionBank.filter(
    (q) => q.examType === targetBoard && q.topic.toLowerCase() !== targetTopic
  );

  // Randomize both decks independently to preserve maximum simulation entropy
  const randomizedExact = shuffleArray(exactMatches);
  const randomizedReserves = shuffleArray(boardReserves);

  // Combine arrays—exact topic matches go first, filled up by broader board items
  const combinedDeck = [...randomizedExact, ...randomizedReserves];

  // Secure exactly 10 high-yield items for the practice sprint safely
  return combinedDeck.slice(0, 10);
}