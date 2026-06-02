// src/utils/shuffle.js

export function shuffleArray(array) {
  const source = [...array];
  for (let i = source.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [source[i], source[j]] = [source[j], source[i]];
  }
  return source;
}

// New helper: Takes your full bank, shuffles it, and picks X amount
export function getQuestionsForSession(bank, count = 20) {
  const shuffled = shuffleArray(bank);
  return shuffled.slice(0, count);
}