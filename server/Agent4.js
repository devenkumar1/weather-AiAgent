import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { tool } from "@langchain/core/tools";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { z } from "zod";
import { AgentExecutor } from "langchain/agents";
import { MemorySaver } from "@langchain/langgraph";
import dotenv from 'dotenv'

import axios from "axios";
dotenv.config();

const WEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 

function fact(num){
    if(num==0){
        return 1;
    }
    return fact(num-1)*num;
}



const calculateFactorial=tool(
    async({num})=>{
     const result=fact(num);
     console.log("this tool is used");

     return result;
    },{
    name: 'factorial',
    description: 'calculate the factorial of a given number',
    schema: z.object({
    num: z.number().describe('The num to use for calculating factorial'),
    }),
}
)

const genrateJoke=tool(
    async({topic})=>{
try{
        const response= await axios.get(`https://v2.jokeapi.dev/joke/Any?contains=${topic}`);
        console.log("your joke tool is called");
        const joke= response.data.setup+' ' + response.data.delivery;
        console.log(joke);
        return joke;
}catch(err){
    console.log(err);
}
    },{
        name:"Joke",
        description:"generates a joke on a given topic",
        schema:z.object({
            topic: z.string().describe("the topic for which joke will be generated")
        })
    }
)


const weatherTool=tool(
async({city})=>{

    try{
        const response= await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}&units=metric`);
            const data = response.data;
                return `Weather in ${city}: ${data.weather[0].description}, temperature: ${data.main.temp}°C, humidity: ${data.main.humidity}%`;
    }catch (err) {
      console.error(`[❌ Weather API Error] City: ${city}`);
      if (axios.isAxiosError(err)) {
         console.error("❗ Axios Error Status:", err.response?.status);
        console.error("❗ Axios Error Response:", JSON.stringify(err.response?.data, null, 2));
        return `City "${city}" not found or weather data unavailable.`;
      } else {
       console.error("❗ Non-Axios Error:", err.message);
        console.error("Unexpected Error:", err.message);
        return `Unexpected error while fetching weather for ${city}.`;
      }
    }
},
  {
    name: 'weather',
    description: 'Get the weather in a given location',
    schema: z.object({
      city: z.string().describe('The city to use in search'),
    }),
  }




)

const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey: GEMINI_API_KEY, 
});

const checkpointSaver = new MemorySaver();

export const agent = await createReactAgent({
  llm: model,
  tools: [weatherTool,calculateFactorial,genrateJoke],
  checkpointSaver,
  streamRunnable: false, 
});
