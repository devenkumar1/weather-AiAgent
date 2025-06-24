import express from 'express';
import cors from 'cors';
import { agent } from './Agent4.js';
import crypto from 'crypto';
import dotenv from 'dotenv'
import { uploadAndEmbedPDF, answerWithRagAgent } from './rag.js';
import path from 'path';
import { upload } from './rag.js';

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors({ origin: '*' }));

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.post('/generate', async (req, res) => {
const { prompt} = req.body;
const thread_id = req.body.thread_id || crypto.randomUUID();
  const result = await agent.invoke(
    {
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    },
     {
        configurable: { thread_id },
        streamRunnable: false, 
      }
  );

  res.json(result.messages.at(-1)?.content);
});

// PDF upload route
app.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    const filePath = req.file.path;
    // Use a fixed userId for all uploads (single-user mode)
    const userId = 'default-user78';
    const result = await uploadAndEmbedPDF(filePath, userId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Direct RAG query endpoint
app.post('/rag-query', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'query is required' });
    }
    // Use the same fixed userId
    const userId = 'default-user781';
    const result = await answerWithRagAgent({ query, userId });
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});