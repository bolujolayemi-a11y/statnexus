// src/utils/date.js
export function getLocalizedTimestamp() {
  return new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}