// src/services/exam/questionGenerator.js
import { questionBank } from '../../data/nursingQuestions.js';
import { shuffleArray } from '../../utils/shuffle.js';

export function generateLocalSession(examType, topic, count = 20) {
  const targetBoard = examType?.trim();
  const targetTopic = topic?.trim().toLowerCase();

  console.log(`Generating session for: ${targetBoard} - ${targetTopic} (count: ${count})`);

  // 1. Get questions from the selected board and topic first
  const primaryQuestions = questionBank.filter(q => 
    q.examType === targetBoard && 
    q.topic.toLowerCase() === targetTopic
  );

  console.log(`Found ${primaryQuestions.length} questions in ${targetBoard} for topic: ${targetTopic}`);

  // 2. If we need more questions, get from other boards for the same topic
  let finalQuestions = [...primaryQuestions];
  
  if (primaryQuestions.length < count) {
    const needed = count - primaryQuestions.length;
    console.log(`Need ${needed} more questions, looking in other boards...`);
    
    const otherBoardQuestions = questionBank.filter(q => 
      q.examType !== targetBoard && 
      q.topic.toLowerCase() === targetTopic
    );
    
    console.log(`Found ${otherBoardQuestions.length} questions in other boards for topic: ${targetTopic}`);
    
    // Shuffle and take needed questions from other boards
    const shuffledOthers = shuffleArray(otherBoardQuestions);
    finalQuestions = [...primaryQuestions, ...shuffledOthers.slice(0, needed)];
  }

  // 3. If still not enough, get questions from the same board (different topics)
  if (finalQuestions.length < count) {
    const needed = count - finalQuestions.length;
    console.log(`Still need ${needed} more questions, looking in ${targetBoard} other topics...`);
    
    const sameBoardOtherTopics = questionBank.filter(q => 
      q.examType === targetBoard && 
      q.topic.toLowerCase() !== targetTopic
    );
    
    console.log(`Found ${sameBoardOtherTopics.length} questions in ${targetBoard} other topics`);
    
    const shuffledOtherTopics = shuffleArray(sameBoardOtherTopics);
    finalQuestions = [...finalQuestions, ...shuffledOtherTopics.slice(0, needed)];
  }

  console.log(`Total questions gathered: ${finalQuestions.length}`);

  // 4. Shuffle all questions for randomness
  const shuffledQuestions = shuffleArray(finalQuestions);

  // 5. Take exactly the requested count
  const sessionQuestions = shuffledQuestions.slice(0, count);

  // 6. Ensure no duplicates by filtering out any exact duplicates
  const uniqueQuestions = sessionQuestions.filter((question, index, self) =>
    index === self.findIndex((q) => q.id === question.id)
  );

  console.log(`Returning ${uniqueQuestions.length} unique questions`);
  return uniqueQuestions;
}