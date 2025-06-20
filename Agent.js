//practice

import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {z} from 'zod';
import { DynamicTool } from "@langchain/core/tools";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
console.log("Agent.js loaded");

const WEATHER_API_KEY=process.env.OPENWEATHER_API_KEY;

// Weather tool using OpenWeatherMap API
const weatherTool = new DynamicTool({
  name: "getWeather",
  description: "Get real-time weather for a city",
  schema: z.object({
    city: z.string().describe("City name to get weather for"),
  }),
  func: async ({ city }) => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric`
      );
      const data = response.data;
      return `Weather in ${city}: ${data.weather[0].description}, temperature: ${data.main.temp}°C, humidity: ${data.main.humidity}%`;
    } catch (err) {
      return `Could not fetch weather for ${city}.`;
    }
  },
});

// Gemini model setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  temperature: 0,
});

// LangGraph agent definition
// Replace with a simple agent logic using the model and tool directly
const agent = {
  invoke: async (input) => {
    // For demonstration, just call the weather tool if input contains "weather"
    const match = input.match(/weather in ([a-zA-Z\s]+)/i);
    if (match) {
      const city = match[1].trim();
      return await weatherTool.func({ city });
    }
    // Otherwise, use the model to generate a response
    const chatModel = new ChatGoogleGenerativeAI({ model });
    return await chatModel.invoke(input);
  }
};

// Example usage
(async () => {
  const result = await agent.invoke("What's the weather in jalandhar?");
  console.log(result);
})();