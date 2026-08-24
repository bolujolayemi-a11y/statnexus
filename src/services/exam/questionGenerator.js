// src/services/exam/questionGenerator.js
import { questionBank } from '../../data/nursingQuestions.js';
import { shuffleArray } from '../../utils/shuffle.js';

export function generateLocalSession(examType, topic, count = 20) {
  const targetBoard = examType?.trim();
  const targetTopic = topic?.trim().toLowerCase();

  console.log(`Generating session for: ${targetBoard} - ${targetTopic} (count: ${count})`);

  // 1. Get all questions for the board and topic ONLY
  const topicQuestions = questionBank.filter(q => 
    q.examType === targetBoard && 
    q.topic.toLowerCase() === targetTopic
  );

  console.log(`Found ${topicQuestions.length} questions for topic: ${targetTopic}`);

  // 2. If we don't have enough topic-specific questions, warn and use what we have
  if (topicQuestions.length === 0) {
    console.error(`No questions found for topic: ${targetTopic}`);
    return [];
  }

  if (topicQuestions.length < count) {
    console.warn(`Only ${topicQuestions.length} questions available for topic: ${targetTopic} (requested: ${count})`);
  }

  // 3. Shuffle the topic questions
  const shuffledQuestions = shuffleArray(topicQuestions);

  // 4. Take the requested number of questions (or all available if less)
  const sessionQuestions = shuffledQuestions.slice(0, count);

  // 5. Ensure no duplicates by filtering out any exact duplicates
  const uniqueQuestions = sessionQuestions.filter((question, index, self) =>
    index === self.findIndex((q) => q.id === question.id)
  );

  console.log(`Returning ${uniqueQuestions.length} unique questions`);
  return uniqueQuestions;
}