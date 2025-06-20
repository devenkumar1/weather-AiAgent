//practice

import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { ChatAnthropic } from '@langchain/anthropic';
import { MemorySaver } from '@langchain/langgraph';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

const jsExecutor = tool(
  async ({ code }) => {
    const response = await fetch(process.env.EXECUTOR_URL || '', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    return await response.json();
  },
  {
    name: 'run_javascript_code_tool',
    description: `
      Run general purpose javascript code. 
      This can be used to access Internet or do any computation that you need. 
      The output will be composed of the stdout and stderr. 
      It has the following API Keys as environment variables:
      The code should be written in a way that it can be executed with javascript eval in node environment.
   `,
    schema: z.object({
      code: z.string().describe('The code to run'),
    }),
  }
);

const weatherTool = tool(
  async ({ query }) => {
    console.log('query', query);

    // TODO: Implement the weather tool by fetching an API

    return 'The weather in Tokyo is sunny';
  },
  {
    name: 'weather',
    description: 'Get the weather in a given location',
    schema: z.object({
      query: z.string().describe('The query to use in search'),
    }),
  }
);

const model = new ChatAnthropic({
  model: 'claude-3-5-sonnet-latest',
});

const checkpointSaver = new MemorySaver();

export const agent = createReactAgent({
  llm: model,
  tools: [weatherTool, jsExecutor],
  checkpointSaver,
});