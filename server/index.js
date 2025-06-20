import express from 'express';
import cors from 'cors';
import { agent } from './Agent4.js';
import crypto from 'crypto';
import dotenv from 'dotenv'
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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});