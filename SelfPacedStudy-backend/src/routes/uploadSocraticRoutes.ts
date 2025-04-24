import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import {generateMultipleChoiceQuestions} from '../services/socraticModel.js'; // 你需要确保这个模块存在并导出 generateQuestions 函数

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/uploadSocratic', upload.single('transcript'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ 
      success: false,
      message: "No file uploaded.",
      transcript: null,
      questionnaire: []
    });
  }

  const filePath = path.join(process.cwd(), req.file.path);
  try {
    const transcriptData = await fs.promises.readFile(filePath, 'utf8');
    await fs.promises.unlink(filePath); // 删除上传临时文件

    // 🔁 调用你定义的苏格拉底模型逻辑
    const dynamicQuestionnaire = await generateMultipleChoiceQuestions(transcriptData);

    return res.json({
      success: true,
      transcript: transcriptData,
      questionnaire: dynamicQuestionnaire,
    });
  } catch (error) {
    console.error("Error processing uploaded file:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      transcript: null,
      questionnaire: []
    });
  }
});

export default router;
