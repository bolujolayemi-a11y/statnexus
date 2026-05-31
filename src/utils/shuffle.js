// src/utils/shuffle.js
export function shuffleArray(array) {
  const source = [...array];
  for (let i = source.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [source[i], source[j]] = [source[j], source[i]];
  }
  return source;
}