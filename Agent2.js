//practice

import axios from "axios";
import { z } from 'zod';
import { DynamicTool } from "@langchain/core/tools";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AgentExecutor, createReactAgent } from "langchain/agents";
import { PromptTemplate } from "@langchain/core/prompts"; // Import PromptTemplate

console.log("Agent.js loaded");

// --- Environment Variable Setup & Checks ---
const WEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Your specific env var name

console.log("\n--- Checking Environment Variables ---");
console.log("OPENWEATHER_API_KEY is:", WEATHER_API_KEY ? "SET" : "NOT SET");
console.log("GEMINI_API_KEY is:", GEMINI_API_KEY ? "SET" : "NOT SET");
console.log("------------------------------------\n");

if (!WEATHER_API_KEY) {
    console.error("OPENWEATHER_API_KEY is not set. Please set it in your environment variables.");
    process.exit(1);
}
// Re-enabled check to ensure GEMINI_API_KEY is truly present
if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not set. Please set it in your environment variables and ensure it's loaded.");
    process.exit(1);
}

// --- Weather Tool Definition ---
const weatherTool = new DynamicTool({
    name: "getWeather",
    description: "Get real-time weather for a specified city. Input should be the city name (string). For example: 'New York', 'London', 'Tokyo'.",
    schema: z.string().describe("City name to get weather for"), // <--- Change schema to z.string()
    func: async (city) => { // <--- Change to directly accept 'city'
        try {
            const response = await axios.get( // Changed to axios.get for weather API
                `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}&units=metric`
            );
            const data = response.data;
            return `Weather in ${city}: ${data.weather[0].description}, temperature: ${data.main.temp}°C, humidity: ${data.main.humidity}%`;
        } catch (err) {
            if (axios.isAxiosError(err) && err.response && err.response.status === 404) {
                return `City "${city}" not found by OpenWeatherMap. Please check the spelling.`;
            }
            console.error(`Error fetching weather for ${city}:`, err.message);
            return `Could not fetch weather for ${city} due to an API error: ${err.message}.`; // More descriptive error
        }
    },
});

const sum= new DynamicTool({
    name: "sum",
    description: "Calculate the sum of two numbers.",
    schema: z.object({
        a: z.number().describe("First number"),
        b: z.number().describe("Second number"),
    }),
    func: async ({ a, b }) => {
        return a + b;
    },
});

// --- Gemini Model Setup ---
const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    temperature: 0,
    apiKey: GEMINI_API_KEY, // Explicitly pass the API key
    // You can add a timeout if you suspect connection issues, e.g., timeout: 60000 // 60 seconds
});

// --- Define Tools for the Agent ---
const tools = [weatherTool, sum];

// --- Custom ReAct Prompt Definition ---
// This prompt is designed to guide the LLM to follow the ReAct pattern strictly,
// preventing it from generating fake 'Observation' or 'Final Answer' prematurely.
const customReactPrompt = PromptTemplate.fromTemplate(`
Answer the following questions as best you can. You have access to the following tools:

{tools}

Use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [{tool_names}]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Remember, when you decide to use a tool, only provide a single Thought, followed by a single Action and its Action Input.
**DO NOT generate the Observation or Final Answer yourself. Wait for the tool's result.**

Begin!

Question: {input}
Thought:{agent_scratchpad}
`);

// --- Create the Agent ---
const agent = await createReactAgent({
    llm: model,
    tools: tools,
    prompt: customReactPrompt, // Use the custom prompt
});

// --- Agent Executor Setup ---
const agentExecutor = new AgentExecutor({
    agent: agent,
    tools: tools,
    verbose: false, // Set to true to see the agent's thought process
    handleParsingErrors: true, // Helps in debugging if the model outputs malformed tool calls
});

// --- Example Usage ---
(async () => {
    console.log("\n--- Agent Invocation: Weather Query for Jalandhar (Expected Tool Use) ---");
    try {
        const weatherResultPiro = await agentExecutor.invoke({
            input: "What's the weather in jalandhar?",
        });
        console.log("Result (Jalandhar):", weatherResultPiro.output);
    } catch (error) {
        console.error("Error during Jalandhar weather query:", error);
    }

    try {
        console.log("\n--- Agent Invocation: Sum Calculation (Expected Tool Use) ---");
        const sumResult = await agentExecutor.invoke({
            input: "What is the sum of 5 and 10?",
        });
        console.log("Result (Sum):", sumResult.output);
    } catch (error) {
        console.error("Error during sum calculation:", error);
    }
})();