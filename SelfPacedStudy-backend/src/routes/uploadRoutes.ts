import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { generateMultipleChoiceQuestions } from '../services/socraticModel.js'; // 根据实际目录调整路径

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// POST /api/uploadSocratic: 上传 transcript 文件，并生成多选题问卷
router.post('/uploadSocratic', upload.single('transcript'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }
  
  // 构建文件绝对路径
  const filePath = path.join(process.cwd(), req.file.path);
  
  try {
    // 异步读取文件内容
    const data = await fs.promises.readFile(filePath, 'utf8');
    // 文件读取完成后删除临时文件
    await fs.promises.unlink(filePath);
    
    // 调用生成多选题的函数，控制数量（默认5题，可根据需要调整）
    const questions = await generateMultipleChoiceQuestions(data, 5);
    
    // 构造完整结果数据，包含原始 transcript 内容和生成的问卷题目
    const result = {
      transcript: data,
      questionnaire: questions,
    };
    
    // 将结果返回给前端
    res.json(result);
  } catch (error) {
    console.error("Error generating multiple-choice questions:", error);
    res.status(500).json({ error: "Failed to generate questionnaire." });
  }
});

export default router;
