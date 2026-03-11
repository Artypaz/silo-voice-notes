/**
 * AI Service — Mock implementations for local-first AI features.
 * Replace these with real on-device AI calls (e.g., llama.cpp, whisper.cpp) later.
 */

export interface AISummary {
  overview: string;
  actionItems: string[];
}

/**
 * Summarize a transcript into an overview and action items.
 * Mock: returns a canned summary after a simulated delay.
 */
export async function summarizeTranscript(transcript: string): Promise<AISummary> {
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return {
    overview: `A reflective note covering key themes from the transcript. The speaker discusses: "${transcript.slice(0, 60)}..."`,
    actionItems: [
      "Review the key points mentioned",
      "Follow up on any action items discussed",
      "Schedule time to revisit this topic",
    ],
  };
}

/**
 * Generate a chat response given a user message and optional context (notes).
 * Mock: returns a canned response after a simulated delay.
 */
export async function generateChatResponse(
  userMessage: string,
  _context?: { notes?: string[] }
): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const lower = userMessage.toLowerCase();

  if (lower.includes("summarize")) {
    return "Here's a summary of your recent notes:\n\n• Personal reflection on slowing down and appreciating life\n• Daily workflow using voice memos while walking\n• Winter preparation and garden maintenance planning\n• Product launch meeting — designs due Friday, manufacturing by month end";
  }

  if (lower.includes("recent")) {
    return "You have several voice notes from the last few days. Would you like me to summarize them or search for something specific?";
  }

  return `I've processed your message: "${userMessage.slice(0, 80)}". How can I help you further with your notes?`;
}

/**
 * Transcribe audio (mock).
 * In production, replace with whisper.cpp or a Capacitor speech plugin.
 */
export async function transcribeAudio(_audioPath: string): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return "This is a mock transcription. Replace with real on-device speech-to-text.";
}
