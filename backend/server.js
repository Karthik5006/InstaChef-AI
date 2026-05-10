import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { runAgentFlow } from './agents/orchestrator.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' })); // For image uploads

app.post('/api/analyze', async (req, res) => {
    try {
        const { prompt, imageBase64 } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: "Prompt is required" });
        }

        // We will implement SSE streaming later. For now, just run the whole flow
        // and return the final cart and diffs.
        const result = await runAgentFlow(prompt, imageBase64);
        
        res.json(result);
    } catch (error) {
        console.error("Error running agent:", error);
        res.status(500).json({ error: error.message || "An error occurred" });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
