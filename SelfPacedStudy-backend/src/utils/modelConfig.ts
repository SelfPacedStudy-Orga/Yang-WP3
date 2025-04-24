import { ChatOpenAI } from "@langchain/openai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

export const model = new ChatOpenAI({
    modelName: 'gpt-4-vision-preview',
    temperature: 0.9,
    openAIApiKey: OPENAI_API_KEY,
    maxTokens: 1000,
    streaming: true,
  });
  
