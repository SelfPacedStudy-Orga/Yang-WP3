
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { logger } from './utils/logger.js';
import transcriptRouter from "./routes/transcriptRouter.js";
import chatRouter from './routes/chatRouter.js';
import uploadRouter from './routes/uploadRoutes.js';
import difficultyRouter from './routes/difficultyRoutes.js'; 
import uploadSocraticRouter from './routes/uploadSocraticRoutes.js';
import multer from 'multer';
import { scoreTranscript } from '@services/difficultyModel.js';
import { extractTextFromPPT } from './utils/extractTextFromPPT.js';  // 提取PPT的文本函数
import fs from 'fs';
import { Request } from 'express';

interface CustomRequest extends Request {
    files?: { [key: string]: Express.Multer.File[] };
}


// 设置上传文件大小限制
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 },
    }).fields([
  { name: 'transcript', maxCount: 1 },
  { name: 'slides', maxCount: 1 },
  ]);

const PORT = process.env.PORT || 3001;

// Create an instance of express
const app = express();
app.use(express.json());

// Enable All CORS Requests
// In production, you might want to configure this to allow requests only from certain origins
app.use(cors());
app.use('/transcript', transcriptRouter);
// 上传文件相关接口，前缀设置为 /api/upload
app.use('/api/upload', uploadRouter); 
// 难度分析接口
app.use('/difficulty', difficultyRouter);
// 苏格拉底式提问接口，前缀设置为 /api/socratic
app.use('/api/socratic', uploadSocraticRouter);


app.use('/chats', chatRouter);


// Define a route
app.get('/', (req, res) => {
    res.send('Hello, Express');
});

// Start the server
app.listen(PORT, () => {
    logger.info(`Server running at port: ${PORT}`);
});


app.post('/transcriptExperiment', async (req, res) => {
    const { userId, fromExperiment, lectureNumber, isTest } = req.body;
    try {
        // 这里可以根据传递的参数做一些额外的处理，比如查询数据库或计算
        console.log(`Received data: userId=${userId}, fromExperiment=${fromExperiment}, lectureNumber=${lectureNumber}, isTest=${isTest}`);

        // 根据实验条件返回不同的视频链接
        const videoUrl = 'https://www.youtube.com/watch?v=dLc-lfEEYss&list=PLkDaE6sCZn6FNC6YRfRQc_FbeQrF8BwGI&index=9';

        // 返回视频链接作为响应
        res.json({ videoUrl });
    } catch (error) {
        console.error('Error processing transcript experiment:', error);
        res.status(500).json({ error: '生成视频链接失败' });
    }
});



app.post('/api/score-difficulty', upload, async (req, res) => {
    const { interactionFrequency, preTestAccuracy } = req.body;

    // 校验必需字段
    if (!interactionFrequency || !preTestAccuracy) {
        return res.status(400).json({ error: 'Missing interactionFrequency or preTestAccuracy' });
    }

    const files = req.files as { [key: string]: Express.Multer.File[] };  // 类型断言
    const transcriptFile = files?.['transcript']?.[0];
    const slidesFile = files?.['slides']?.[0];

    try {
        if (!transcriptFile || !slidesFile) {
            return res.status(400).json({ error: 'Both transcript and slides files are required' });
        }

        const transcriptContent = transcriptFile.buffer.toString('utf8');
        const slidesContent = await extractTextFromPPT(slidesFile.buffer);

        // 调用 difficulty 模块并返回难度评分与选择题
        const difficultyScoreResult = await scoreTranscript(
            transcriptContent,
            slidesContent,
            interactionFrequency,
            preTestAccuracy
        );

        console.log(difficultyScoreResult)

        // 返回格式：难度评分和选择题
        res.json({
            difficultyScoreResult, // 返回难度评分
            // 例如：{ "Segment 1": { difficulty: 60, questions: [...]} }
        });

    } catch (error) {
        console.error('Error generating difficulty score:', error);
        res.status(500).json({ error: '生成难度评分失败' });
    }
});