export interface OpenAIEmbeddingResponse {
    data: {
      embedding: number[];
    }[];
  }
  
  export interface OpenAIChatResponse {
    choices: {
      message: {
        content: string;
      };
    }[];
  }
  