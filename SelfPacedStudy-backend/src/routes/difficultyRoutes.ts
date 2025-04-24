import express from 'express';
import { scoreTranscript } from '../services/difficultyModel.js'; // adjust the relative path if needed

const router = express.Router();

// POST /difficulty/score: Accept transcript and slide text, then return a difficulty score
router.post('/score', async (req, res) => {
    try {
        const { transcript, slides, interactionFrequency, preTestAccuracy } = req.body;
        if (!transcript || !slides) {
            return res.status(400).json({ error: 'Transcript and slides are required.' });
        }
        
        // Call the scoring function (which builds a prompt and calls OpenAI)
        const score = await scoreTranscript(transcript, slides, interactionFrequency, preTestAccuracy);
        res.json({ score });
    } catch (error) {
        console.error('Error scoring transcript:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
