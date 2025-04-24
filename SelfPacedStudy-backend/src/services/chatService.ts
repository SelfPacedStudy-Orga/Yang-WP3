import { formatDocumentsAsString } from "langchain/util/document";
import { HumanMessage } from "@langchain/core/messages";
import { BaseMessage } from "@langchain/core/messages";
import takeScreenshot from "../utils/takeScreenshot.js";
import { model } from "../utils/modelConfig.js";
import BotMemoryManager from "../utils/BotMemoryManager.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';
import { createObjectCsvStringifier } from 'csv-writer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SCREENSHOTS_OUTPUT_DIR = '../../screenshots';

/**
 * Function to serialize chat history into a string.
 * 
 * @param {BaseMessage[]} chatHistory - Array of chat messages.
 * @returns {string} - Serialized chat history.
 */
const serializeChatHistory = (chatHistory:BaseMessage[]): string => 
  chatHistory
    .map((chatMessage) => {
      if (chatMessage._getType() === "human") {
        return `Human: ${chatMessage.content}`;
      } else if (chatMessage._getType() === "ai") {
        return `Assistant: ${chatMessage.content}`;
      } else {
        return `${chatMessage.content}`;
      }
    })
    .join("\n");

/**
 * Function to initialize the bot's context.
 * 
 * @async
 * @param {Buffer|null} slides - Slides data.
 * @param {any} transcriptDocs - Transcript documents.
 */
async function initializeContext(slides: Buffer|null, transcriptDocs: any, url: string, userId: string) {
    await BotMemoryManager.setInstance(userId, slides, transcriptDocs, url);
}

/**
 * Function to ask a question to the bot.
 *
 * @async
 * @param {string} question - The question to ask.
 * @param {number} timestamp - The timestamp of the question.
 * @param userId - ID of the current user.
 * @param {Buffer} [imageData] - Optional image data.
 * @returns {Promise<string>} - The bot's response.
 * @throws Will throw an error if the call chain method fails to execute.
 */
async function askQuestion(question: string, timestamp: number,userId: string, imageData?: Buffer) {
    try {

      const sanitizedQuestion = question.trim().replace("\n", " "); // Remove newlines from the question

      const retriever = await BotMemoryManager.getRetrieverInstance(userId);
      const memory = BotMemoryManager.getMemoryInstance(userId);
      const transcriptRetriever = await BotMemoryManager.getTranscriptRetrieverInstance(userId);

      console.log("retriever 实例:", retriever);
      console.log("memory 实例:", memory);
      console.log("transcriptRetriever 实例:", transcriptRetriever);

      if ( memory && transcriptRetriever) { // If the bot's context has been initialized
        let startOffset = 0;
        if (timestamp > 3000) startOffset = timestamp - 3000;
        const stringWithTimestamp = `Before starting my question: Find between offsets ${startOffset} and ${timestamp + 30000}, and my question is: ` + sanitizedQuestion;
        const relevantDocsTranscript = await transcriptRetriever.getRelevantDocuments(stringWithTimestamp); // Get the relevant documents from the transcript
        const serializedTranscript = formatDocumentsAsString(relevantDocsTranscript); // Serialize the transcript documents
        console.log("序列化的视频文档：", serializedTranscript);

        // Load the bot's memory variables
        const savedMemory = await memory.loadMemoryVariables({});
        const hasHistory = savedMemory.chatHistory.length > 0;
        const chatHistory = hasHistory ? savedMemory.chatHistory : null;

        const chatHistoryString = chatHistory
        ? serializeChatHistory(chatHistory)
        : null;

        let prompt = "";

        if ( retriever !== null ) {
          const relevantDocs = await retriever.getRelevantDocuments(sanitizedQuestion);
          console.log("相关文档（Lecture Slides）：", JSON.stringify(relevantDocs, null, 2));
          const serialized = formatDocumentsAsString(relevantDocs);
          console.log("序列化后的文档（Lecture Slides）：", serialized);

          prompt = 
            `The user is currently watching a lecture video and will ask you questions about the lecture and the lecture slides. 
            Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.
            ----------------
            CONTEXT OF VIDEO TRANSCRIPT: ${serializedTranscript}
            ----------------
            CONTEXT OF LECTURE SLIDES: ${serialized}
            ----------------
            CHAT HISTORY: ${chatHistoryString}
            ----------------
            QUESTION: ${question}
            ----------------
            Helpful Answer:`;
        }
        else {
          prompt = 
            `The user is currently watching a lecture video and will ask you questions about the lecture and the lecture slides. 
            Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.
            ----------------
            CONTEXT OF VIDEO TRANSCRIPT: ${serializedTranscript}
            ----------------
            CHAT HISTORY: ${chatHistoryString}
            ----------------
            QUESTION: ${question}
            ----------------
            Helpful Answer:`;
        }

        // Construct the message to send to the bot in GPT-4 vision format
        const message = new HumanMessage({
            content: [
                {
                    type: "text",
                    text: prompt
                },
            ],
        });

        // Add the image data to the message if it exists
        if (imageData) {
            const base64Image = imageData.toString('base64');
            (message.content as any[]).push({
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${base64Image}`
              }
            });
        }

        if ( question.includes("slide") ) {
          const url = BotMemoryManager.getUrl(userId);

          const filename = `slide-${timestamp}.png`;
          const screenshotPath = path.join(__dirname, SCREENSHOTS_OUTPUT_DIR, filename);

          await takeScreenshot(url, timestamp, screenshotPath);

          const screenshot = fs.readFileSync(screenshotPath);
          const base64Image = screenshot.toString('base64');

          (message.content as any[]).push({
            type: "image_url",
            image_url: {
              url: `data:image/png;base64,${base64Image}`
            }
          });

          // Delete the screenshot
          fs.unlinkSync(screenshotPath);
        }

        let response;
        try {
            response = await model.invoke([message]);
        } catch (invokeError) {
            console.error("模型调用失败：", invokeError);
            return "🤖 抱歉，我暂时无法生成回答，请稍后再试。";
        }

        console.log("模型响应：", response);
      
    

        // Save the bot's response to the context to be used in the next question
        await memory.saveContext(
            {
              question: question,
            },
            {
              text: response.content,
            }
          );

        if (imageData) {
          await BotMemoryManager.addHistory(userId, timestamp, question, response.content.toString(), imageData);
        }
        else {
          await BotMemoryManager.addHistory(userId,timestamp, question, response.content.toString());
        }

        if (response?.content && typeof response.content === 'string') {
          await memory.saveContext({ question }, { text: response.content });
          await BotMemoryManager.addHistory(userId, timestamp, question, response.content.toString(), imageData);
          return response.content;
        } else {
          const fallback = "🤖 抱歉，我暂时无法生成回答，请稍后再试。";
          await memory.saveContext({ question }, { text: fallback });
          await BotMemoryManager.addHistory(userId, timestamp, question, fallback, imageData);
          return fallback;
        }
        
      }
    } catch (error) {
        console.error(error);
        throw new Error("Call chain method failed to execute!!");
      }
}

async function writeChatHistory(userId: string) {
  try {
    const doc = await createPdfData(userId);
    const pdfPath = path.join(__dirname, 'chat_history.pdf');
    doc.pipe(fs.createWriteStream(pdfPath));
    
    const csvData = await createCsvData(userId);

    if (!csvData) {
      throw new Error("Failed to generate history data");
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          user: process.env.EMAIL_ADDRESS,
          pass: process.env.EMAIL_PASSWORD
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_ADDRESS,
      to: process.env.EMAIL_ADDRESS,
      subject: '1 New Chat!',
      text: 'Here is the chat history.',
      attachments: [
        {
          filename: 'chat_history.pdf',
          path: pdfPath
        },
        {
          filename: 'chat_history.csv',
          content: csvData
        }
      ]
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
          console.log(error);
      } else {
          console.log('Email sent: ' + info.response);
          BotMemoryManager.deleteSession(userId);
      }
    });
    
  } catch (error) {
      console.error(error);
      throw new Error("Failed to retrieve context from memory.");
  }
}

async function createPdfData(userId: string) {
  try {
    const doc = new PDFDocument;
    const chatHistory = await BotMemoryManager.getHistory(userId);
    const videoUrl = BotMemoryManager.getUrl(userId);
    const slideUploaded = await BotMemoryManager.getRetrieverInstance(userId) !== null;

    doc.font('Helvetica-Bold').fontSize(12).text(`Video URL: ${videoUrl}`, {link: videoUrl});
    doc.font('Helvetica-Bold').fontSize(12).text('Slide uploaded: ', { continued: true });
    doc.font('Helvetica').text(slideUploaded ? "Yes" : "No");

    for (const message of chatHistory) {
      doc.moveDown();
      doc.font('Helvetica-Bold').fontSize(11).text(`Timestamp: ${message.timestamp}`, { width: 450 });

      doc.font('Helvetica-Bold').fontSize(11).text('Human message: ', { continued: true, width: 450});
      doc.font('Helvetica').fontSize(11).text(`${message.humanMessage}` , { width: 450 });
      const remainingPageHeight = doc.page.height - doc.y - doc.page.margins.bottom;

      if (message.imageData) {
        if (250 > remainingPageHeight) {
            doc.addPage();
        }
        doc.image(message.imageData, {
          height: 250,
          width: 500,
        });
        doc.y = doc.y + 250;
      }

      doc.font('Helvetica-Bold').fontSize(11).text('AI message: ', { continued: true, width: 450});
      doc.font('Helvetica').fontSize(11).text(`${message.aiMessage}`, { width: 450 });
    }

    doc.end();

    return doc;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to retrieve context from memory.");
  }
}

 async function createCsvData(userId: string) : Promise<string | null> {
  const chatHistory = await BotMemoryManager.getHistory(userId);
  const writer = createObjectCsvStringifier({
        header: [
            {id: 'timestamp', title: 'TIMESTAMP'},
            {id: 'humanMessage', title: 'HUMAN MESSAGE'},
            {id: 'aiMessage', title: 'AI MESSAGE'},
        ]
    });

    let csvData = writer.getHeaderString();
    csvData += writer.stringifyRecords(chatHistory);

    return csvData;
 }

export { askQuestion, initializeContext, writeChatHistory, createPdfData};