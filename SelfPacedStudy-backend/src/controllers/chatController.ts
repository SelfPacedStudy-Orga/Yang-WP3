import { Request, Response } from 'express';
import {askQuestion, createPdfData, writeChatHistory} from '../services/chatService.js';
import { logger } from '../utils/logger.js';

/**
 * Asynchronously handles incoming chat messages.
 * 
 * @async
 * @function handleIncomingMessage
 * @param {Request} req - Express.js request object.
 * @param {Response} res - Express.js response object.
 * @returns {Promise<void>} - A Promise that resolves when the function has completed.
 * 
 * @throws Will throw an error if the message is not included in the request body.
 */
async function handleIncomingMessage(req: Request, res: Response): Promise<void> {
    try {

        const { message, videoPosition, userId } = req.body;

        const imageData = req.file ? req.file.buffer : undefined;

        if (!message) {
            res.status(400).json({ error: 'No message in the request' });
            return;
        }
        
        const timestamp = videoPosition * 1000;
        const result = await askQuestion(message, timestamp, userId, imageData);
        console.log("askQuestion 返回的结果:", result);  // 打印结果
        console.log(result)
        res.status(200).json({ reply: result || "🤖 抱歉，我无法理解你的问题或回答失败。" });

    } catch (error) {
        res.status(500).json({ error });
        logger.error(error);
    }
}

async function handleSave(req: Request, res: Response) {
    try {
        const userId = req.body.userId;
        await writeChatHistory(userId);
        res.status(200).json({ message: 'Chat history written successfully' });
    } catch (error) {
        res.status(500).json({ error });
        logger.error(error);
    }
}

async function handleReturnHistory(req: Request, res: Response) {
    try {
        const userId = req.body.userId;
        const pdfData = await createPdfData(userId);
        // Set the Content-Type header
        res.setHeader('Content-Type', 'application/pdf');
        pdfData.pipe(res);
    } catch (error) {
        res.status(500).json({ error });
        logger.error(error);
    }
}

export default {
    handleIncomingMessage,
    handleSave,
    handleReturnHistory
};