import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { OpenAIEmbeddings, OpenAI } from "@langchain/openai";
import { VectorStoreRetriever } from "@langchain/core/vectorstores";
import { getChunkedDocsFromPDF } from "./pdfLoader.js";
import { BufferMemory } from "langchain/memory";
import { Document } from "@langchain/core/documents";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { SelfQueryRetriever } from "langchain/retrievers/self_query";
import { FunctionalTranslator } from "langchain/retrievers/self_query/functional";
import { AttributeInfo } from "langchain/schema/query_constructor";
import { VectorStore } from "@langchain/core/vectorstores";

/**
 * We define the attributes we want to be able to query on.
 * in this case, we want to be able to query on the genre, year, director, rating, and length of the movie.
 * We also provide a description of each attribute and the type of the attribute.
 * This is used to generate the query prompts.
 */
const attributeInfo: AttributeInfo[] = [
  {
    name: "offset",
    description: "The timestamp in milliseconds of the start of the sentence",
    type: "number",
  },
  {
    name: "duration",
    description: "The duration of the sentence in milliseconds",
    type: "number",
  },
];

class BotMemoryManager {
  private static userSessions: Map<string, UserSession> = new Map();

  /**
   * Retrieves or initializes a session for a given userId.
   */
  private static getSessionForUser(userId: string): UserSession {
    if (!this.userSessions.has(userId)) {
      const newUserSession = new UserSession();
      this.userSessions.set(userId, newUserSession);
      return newUserSession;
    }
    return <UserSession>this.userSessions.get(userId);
  }

  /**
   * Deletes a session for a given userId.
   * @param {string} userId - The userId whose session needs to be deleted.
   * @returns {boolean} - Returns true if the session was successfully deleted, false if no session was found.
   */
  public static deleteSession(userId: string): boolean {
    if (this.userSessions.has(userId)) {
      this.userSessions.delete(userId);
      console.log(`Session for userId ${userId} has been deleted.`);
      return true;
    } else {
      console.log(`No session found for userId ${userId}.`);
      return false;
    }
  }

  public static async setInstance(userId: string, slides: Buffer | null, transcriptDocs: Document[], url: string): Promise<void> {
    const session = this.getSessionForUser(userId);
    await session.setInstance(slides, transcriptDocs, url);
  }

  public static async addHistory(userId: string, timestamp: number, humanMessage: string, aiMessage: string, imageData?: Buffer): Promise<void> {
    const session = this.getSessionForUser(userId);
    session.addHistory(timestamp, humanMessage, aiMessage, imageData);
  }

  public static async getRetrieverInstance(userId: string): Promise<VectorStoreRetriever<HNSWLib> | null> {
    const session = this.getSessionForUser(userId);
    return session.getRetrieverInstance();
  }

  public static getMemoryInstance(userId: string): BufferMemory | null {
    const session = this.getSessionForUser(userId);
    return session.getMemoryInstance();
  }

  public static async getTranscriptRetrieverInstance(userId: string): Promise<SelfQueryRetriever<VectorStore> | null> {
    const session = this.getSessionForUser(userId);
    return session.getTranscriptRetrieverInstance();
  }

  public static getUrl(userId: string): string {
    const session = this.getSessionForUser(userId);
    return session.getUrl();
  }

  public static async getHistory(userId: string): Promise<{ timestamp: number; humanMessage: string; aiMessage: string, imageData?: Buffer;}[]> {
    const session = this.getSessionForUser(userId);
    return session.getHistory();
  }
}

class UserSession {
  private retriever: VectorStoreRetriever<HNSWLib> | null = null;
  private memory: BufferMemory | null = null;
  private transcriptRetriever: SelfQueryRetriever<VectorStore> | null = null;
  private url: string = "";
  private history: { timestamp: number; humanMessage: string; aiMessage: string; imageData?: Buffer; }[] = [];

  public async setInstance(slides: Buffer | null, transcriptDocs: Document[], url: string ): Promise<void> {
    if (slides !== null) {
      const docs = await getChunkedDocsFromPDF(slides);
      const vectorStoreSlides = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());
      this.retriever = vectorStoreSlides.asRetriever();
    }

    this.url = url;

    this.memory = new BufferMemory({
      memoryKey: "chatHistory",
      inputKey: "question", // The key for the input to the chain
      outputKey: "text", // The key for the final conversational output of the chain
      returnMessages: true,
    });

    const llm = new OpenAI();
    const documentContents = "Transcript of the lecture video";
    const vectorStoreTranscript = await MemoryVectorStore.fromDocuments(transcriptDocs, new OpenAIEmbeddings());
    this.transcriptRetriever = await SelfQueryRetriever.fromLLM({
      llm,
      vectorStore: vectorStoreTranscript,
      documentContents,
      attributeInfo,
      structuredQueryTranslator: new FunctionalTranslator(),
    });
  }

  public async addHistory(timestamp: number, humanMessage: string, aiMessage: string, imageData?: Buffer): Promise<void> {
    if (imageData) {
      this.history.push({ timestamp, humanMessage, aiMessage, imageData});
    }
    else {
      this.history.push({ timestamp, humanMessage, aiMessage });
    }
  }

  public getRetrieverInstance(): VectorStoreRetriever<HNSWLib> | null {
    return this.retriever;
  }

  public getMemoryInstance(): BufferMemory | null {
    return this.memory;
  }

  public getTranscriptRetrieverInstance(): SelfQueryRetriever<VectorStore> | null {
    return this.transcriptRetriever;
  }

  public getUrl(): string {
    return this.url;
  }

  public async getHistory(): Promise<{ timestamp: number; humanMessage: string; aiMessage: string; imageData?: Buffer }[]> {
    return this.history;
  }
}

export default BotMemoryManager;
