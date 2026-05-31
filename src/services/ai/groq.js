
import { getRationale } from '../ai/rationaleService.js';

export async function fetchGroqExplanation(payload) {
  try {
    // We bypass the localhost:8000 fetch and call the service directly
    const rationale = await getRationale({
      examType: payload.examType,
      question: payload.question,
      options: payload.options,
      correct: payload.correct,
      userChoice: payload.userChoice || 'None selected'
    });

    return {
      success: true,
      rationale: rationale || "Analysis compiled successfully."
    };
  } catch (error) {
    console.error("Groq Service Error:", error);
    return {
      success: false,
      rationale: "Network anomaly detected while interfacing with the Groq AI engine core."
    };
  }
}