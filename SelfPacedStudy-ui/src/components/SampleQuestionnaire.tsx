import React, { useState } from 'react';
import { Button, TextField, RadioGroup, FormControlLabel, Radio, Typography, FormControl, FormLabel, Box } from '@mui/material';

const SampleQuestionnaire = () => {
    // 保存每个问题的答案
    const [answers, setAnswers] = useState({
        knowledgeLevel: '',
        conceptUnderstanding: '',
        confidenceLevel: '',
        preferredInteraction: '',
        feedback: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setAnswers(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        // 这里可以把答案提交给后端或进行其他处理
        console.log('Submitted Answers:', answers);
        
        // 模拟提交后的操作，比如显示成功消息
        alert("Your responses have been submitted!");
    };

    return (
        <Box sx={{ maxWidth: 600, margin: '0 auto', padding: '20px' }}>
            <Typography variant="h4" gutterBottom>
                Pre-Lecture Questionnaire
            </Typography>
            
            {/* 问题 1: 你对主题的了解程度 */}
            <FormControl fullWidth sx={{ marginBottom: 2 }}>
                <FormLabel>How would you rate your knowledge of the topic?</FormLabel>
                <RadioGroup
                    name="knowledgeLevel"
                    value={answers.knowledgeLevel}
                    onChange={handleChange}
                >
                    <FormControlLabel value="beginner" control={<Radio />} label="Beginner" />
                    <FormControlLabel value="intermediate" control={<Radio />} label="Intermediate" />
                    <FormControlLabel value="advanced" control={<Radio />} label="Advanced" />
                </RadioGroup>
            </FormControl>

            {/* 问题 2: 你对关键概念的理解 */}
            <FormControl fullWidth sx={{ marginBottom: 2 }}>
                <TextField
                    label="How well do you understand the key concepts?"
                    name="conceptUnderstanding"
                    value={answers.conceptUnderstanding}
                    onChange={handleChange}
                    multiline
                    rows={4}
                    variant="outlined"
                />
            </FormControl>

            {/* 问题 3: 你的自信心 */}
            <FormControl fullWidth sx={{ marginBottom: 2 }}>
                <FormLabel>On a scale of 1 to 10, how confident are you in your understanding of this topic?</FormLabel>
                <TextField
                    type="number"
                    name="confidenceLevel"
                    value={answers.confidenceLevel}
                    onChange={handleChange}
                    inputProps={{ min: 1, max: 10 }}
                    variant="outlined"
                />
            </FormControl>

            {/* 问题 4: 你喜欢的互动频率 */}
            <FormControl fullWidth sx={{ marginBottom: 2 }}>
                <FormLabel>What is your preferred frequency of interaction?</FormLabel>
                <RadioGroup
                    name="preferredInteraction"
                    value={answers.preferredInteraction}
                    onChange={handleChange}
                >
                    <FormControlLabel value="low" control={<Radio />} label="Low" />
                    <FormControlLabel value="medium" control={<Radio />} label="Medium" />
                    <FormControlLabel value="high" control={<Radio />} label="High" />
                </RadioGroup>
            </FormControl>

            {/* 问题 5: 反馈 */}
            <FormControl fullWidth sx={{ marginBottom: 2 }}>
                <TextField
                    label="Any feedback or concerns?"
                    name="feedback"
                    value={answers.feedback}
                    onChange={handleChange}
                    multiline
                    rows={4}
                    variant="outlined"
                />
            </FormControl>

            {/* 提交按钮 */}
            <Button variant="contained" color="primary" onClick={handleSubmit}>
                Submit
            </Button>
        </Box>
    );
};

export default SampleQuestionnaire;
