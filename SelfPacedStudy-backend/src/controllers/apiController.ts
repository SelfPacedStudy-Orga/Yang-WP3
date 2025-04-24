// file: src/controllers/apiController.ts
import axios from 'axios';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();  // 这一步会加载 .env 文件中的所有变量

// 获取环境变量
const API_BASE_URL = process.env.OPENAI_API_BASE_URL;
const API_KEY = process.env.OPENAI_API_KEY;

if (!API_BASE_URL || !API_KEY) {
  throw new Error('OPENAI_API_BASE_URL 和 OPENAI_API_KEY 环境变量未配置');
}

// 导入类型
import { OpenAIEmbeddingResponse, OpenAIChatResponse } from '../types/openaiTypes';  // 根据你的路径修改导入

// 请求超时设置
const TIMEOUT = 60000;  // 设置超时为 60 秒
const MAX_RETRIES = 3;  // 最大重试次数
const BASE_DELAY_MS = 2000;  // 每次重试的延迟时间（单位：毫秒）

// 获取文本嵌入向量
export const getSentenceEmbedding = async (text: string, attempt = 1): Promise<number[]> => {
  try {
    const response = await axios.post<OpenAIEmbeddingResponse>(
      `${API_BASE_URL}/embeddings`,
      {
        input: text,
        model: 'text-embedding-3-small',
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: TIMEOUT,  // 设置超时时间为 60 秒
      }
    );

    return response.data.data[0].embedding;
  } catch (err: any) {
    if (attempt <= MAX_RETRIES) {
      const delay = BASE_DELAY_MS * attempt;  // 每次重试时延迟增加
      console.warn(`[Retry ${attempt}] 请求失败，${delay}ms 后重试...`);
      await new Promise(resolve => setTimeout(resolve, delay));  // 等待延迟时间
      return getSentenceEmbedding(text, attempt + 1);  // 递归重试
    }
    console.error('API 请求最终失败:', err.message);
    throw new Error('无法获取文本嵌入');
  }
};

// 用于判断是否为介绍性内容
export const getIntroductionFlag = async (text: string, attempt = 1): Promise<boolean> => {
  try {
    const response = await axios.post<OpenAIChatResponse>(
      `${API_BASE_URL}/chat/completions`,
      {
        model: 'gpt-4',
        messages: [
          { role: 'system', content: '你是一个内容分析助手。只需要用 true 或 false 回答。' },
          { role: 'user', content: `以下文本是否包含课程介绍、概述或开场白？直接回答 true/false:\n\n${text}` },
        ],
        temperature: 0.1,
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: TIMEOUT,  // 设置超时时间为 60 秒
      }
    );

    const answer = response.data.choices[0].message.content.toLowerCase();
    return answer.includes('true');
  } catch (error: any) {
    if (attempt <= MAX_RETRIES) {
      const delay = BASE_DELAY_MS * attempt;  // 每次重试时延迟增加
      console.warn(`[Retry ${attempt}] 请求失败，${delay}ms 后重试...`);
      await new Promise(resolve => setTimeout(resolve, delay));  // 等待延迟时间
      return getIntroductionFlag(text, attempt + 1);  // 递归重试
    }
    console.error('分类失败:', error?.response?.data || error.message);
    return false;
  }
};
