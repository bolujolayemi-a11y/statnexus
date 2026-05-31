

/**
 * Audits session tracking maps to derive raw correct calculations
 * @param {Array} questions - Active question dataset
 * @param {Object} userAnswers - Keyed map of indices to choices { 0: 'A', 1: 'C' }
 * @returns {number} - Count of raw right items
 */
export function calculateSessionScore(questions, userAnswers) {
  let correctCount = 0;
  
  questions.forEach((q, idx) => {
    if (userAnswers[idx] === q.correct) {
      correctCount++;
    }
  });

  return correctCount;
}