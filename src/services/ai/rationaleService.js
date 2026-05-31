// src/services/ai/rationaleService.js
import { Groq } from 'groq-sdk';

// Ensure your key is in your .env file as VITE_GROQ_API_KEY
const groq = new Groq({ 
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true // Necessary if calling from the frontend directly
});

export async function getRationale(reqData) {
  const optionsString = Object.entries(reqData.options)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");

  const prompt = `You are a Senior Nursing Board Examiner. 
  Explain why the correct answer is safest. Keep under 90 words.
  QUESTION: ${reqData.question}
  OPTIONS: ${optionsString}
  CORRECT: ${reqData.correct}
  STUDENT: ${reqData.userChoice}`;

  const chatCompletion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.1-8b-instant",
    temperature: 0.2,
  });

  return chatCompletion.choices[0]?.message?.content;
}