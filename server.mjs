// server.js
import dotenv from 'dotenv'; 
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

dotenv.config(); 

const app = express();
const port = 3000;

// Enable cors
app.use(cors());

//  parse JSON request bodies
app.use(express.json());

// API endpoint to handle translation requests
app.post('/translate', async (req, res) => {
    const { text, targetLanguage } = req.body;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: 'You are a helpful translation assistant.' },
                    { role: 'user', content: `Translate the following text to ${targetLanguage}: "${text}"` }
                ],
                max_tokens: 100,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed with status: ${response.status}`);
        }

        const data = await response.json();
        res.json({ translation: data.choices[0].message.content });
    } catch (error) {
        console.error('Translation Error:', error);
        res.status(500).json({ error: 'Translation API request failed. Please try again later.' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
