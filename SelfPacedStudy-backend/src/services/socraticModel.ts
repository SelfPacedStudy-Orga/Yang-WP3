
// Import OpenAI and HTTPS Proxy Agent
import OpenAI from 'openai';
import { HttpsProxyAgent } from 'https-proxy-agent';

// Create proxy agent
const proxyAgent = new HttpsProxyAgent('http://127.0.0.1:33210');

// Initialize OpenAI instance
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  httpAgent: proxyAgent, // Add proxy
});

/**
 * Generate multiple-choice questions based on the provided text.
 * Each question includes a stem, 4 options, and one correct answer (represented by a letter).
 * Output must strictly be in JSON format without any extra explanations or markdown symbols.
 *
 * @param text - The input text (e.g., lecture transcript or article)
 * @param questionCount - The number of questions to generate (default 5)
 * @returns Returns an array of questions parsed from the JSON response.
 */
export async function generateMultipleChoiceQuestions(
  text: string,
  questionCount: number = 5
): Promise<any[]> {
  // Construct messages for OpenAI
  const messages: { role: "system" | "user" | "assistant", content: string }[] = [
    {
      role: "system",
      content: "You are a seasoned educational expert skilled at converting text content into multiple-choice questions."
    },
    {
      role: "user",
      content: `Please generate ${questionCount} multiple-choice questions based on the following text. Requirements:
1. Each question should have a clear stem.
2. Each question must include 4 options (provided as an array), with only one option as the correct answer.
3. Output strictly in JSON format with no additional explanations or markdown symbols.
For example:
[
  {
    "question": "Question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "A"
  },
  ... // Total ${questionCount} questions
]
Text:
${text}`
    },
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      temperature: 0.7,
    });
    let result = completion.choices[0].message.content;
    if (!result) {
      throw new Error("No response received");
    }
    // Remove any markdown code block markers like ```json and ```
    result = result.replace(/```json\s*/i, "").replace(/\s*```$/, "").trim();
    // Parse the result into a JSON array
    const questions = JSON.parse(result);
    return questions;
  } catch (error) {
    console.error("Error generating multiple-choice questions via OpenAI API:", error);
    throw new Error("Failed to generate multiple-choice questions.");
  }
}
