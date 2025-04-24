import OpenAI from 'openai';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

// Create proxy
const proxyAgent = new HttpsProxyAgent('http://127.0.0.1:33210');

// Initialize OpenAI instance
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  httpAgent: proxyAgent,
});

/**
 * Generate difficulty scores and questions.
 */
export async function scoreTranscript(
  transcript: string,
  slides: string,
  interactionFrequency: 'high' | 'medium' | 'low',
  preTestAccuracy: number
): Promise<any> {
  const prompt = `
You are an experienced educational expert. Please process the following transcript and slides content:
1. First, split the transcript into segments based on punctuation and line breaks, ensuring that each segment is easy to read.
2. Generate a short title for each segment (summarize the main content of the paragraph).
3. Rate the difficulty of each segment (0-100). 0 means very easy, 100 means very difficult.
4. Adjust the difficulty score based on the student's interaction frequency:
   - High frequency interaction: increase difficulty score by 10%;
   - Medium frequency interaction: increase difficulty score by 5%;
   - Low frequency interaction: no adjustment to score.
5. Adjust the difficulty score based on pre-test accuracy (currently ${preTestAccuracy}%); lower the score if accuracy is high.
6. Use the provided slides content as additional context.
7. Return the results in JSON format, with the key being the segment title and the value being an object containing:
   - "difficulty": the final difficulty score for each segment;
   - "interaction": optional content or an empty string.

Transcript:
${transcript}

Slides:
${slides}

Interaction Frequency: ${interactionFrequency}
Pre-test Accuracy: ${preTestAccuracy}%
`;

  const messages: ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: 'You are an experienced educational expert.',
    },
    {
      role: 'user',
      content: prompt,
    },
  ];

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 800,
      temperature: 0.7,
    });

    let result = response?.choices?.[0]?.message?.content?.trim();
    if (!result) throw new Error('Failed to generate a valid difficulty score result.');

    // Try extracting JSON code block
    const match = result.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match) {
      result = match[1]; // Extract the JSON content
    }

    console.debug("Raw difficulty JSON:\n", result);

    const difficultyData = JSON.parse(result);

    for (const segmentTitle in difficultyData) {
      const segment = difficultyData[segmentTitle];
      if (segment.difficulty > 50) {
        const questions = await generateMultipleChoiceQuestions(segmentTitle, 1);
        segment.questions = questions;

        // Log the generated questions to the terminal
        console.log(`Generated Questions for Segment: ${segmentTitle}`);
        console.log(JSON.stringify(questions, null, 2));
      }
    }

    return difficultyData;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw new Error('Error generating difficulty scores.');
  }
}

/**
 * Generate MCQ questions based on text.
 */
async function generateMultipleChoiceQuestions(text: string, questionCount: number = 5): Promise<any[]> {
  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: "You are an experienced educational expert, skilled in generating multiple-choice questions based on text content.",
    },
    {
      role: "user",
      content: `Please generate ${questionCount} multiple-choice questions based on the following content, with the following requirements:
1. Each question should have a clear question body.
2. Each question should include 4 options (with only one correct answer).
3. The output must strictly follow JSON format, with no additional explanation or Markdown symbols.
Example:
[
  {
    "question": "Question content",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "A"
  }
]
Content:
${text}`
    },
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      temperature: 0.7,
    });

    let result = completion.choices[0].message.content?.trim() || "";
    result = result.replace(/```json\s*/i, "").replace(/\s*```$/, "").trim();

    return JSON.parse(result);
  } catch (error) {
    console.error("Error generating multiple-choice questions:", error);
    throw new Error("Failed to generate multiple-choice questions.");
  }
}
