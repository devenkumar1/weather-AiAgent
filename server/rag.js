import fs from "fs";
import path from "path";
import extract from "pdf-text-extract";
import multer from "multer";
import { ChromaClient } from "chromadb";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { fileURLToPath } from "url";
import dotenv from 'dotenv';
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { MemorySaver } from "@langchain/langgraph";
import crypto from "crypto";

dotenv.config();

// Set up multer for file uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const upload = multer({ dest: path.join(__dirname, "uploads/") });

const client = new ChromaClient({
  ssl: false,
  host: "localhost", // fixed typo from "localost"
  port: 8000
});
console.log("[RAG] ChromaClient initialized with host: localhost, port: 8000, ssl: false");
const COLLECTION_NAME = "user_pdfs";

const thread_id = crypto.randomUUID();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
console.log("[RAG] GEMINI_API_KEY loaded:", !!GEMINI_API_KEY);

const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey: GEMINI_API_KEY,
});

const checkpointSaver = new MemorySaver();

// PDF upload and embedding function
export const uploadAndEmbedPDF = async (filePath, userId = "default-user") => {
  console.log(`[RAG] uploadAndEmbedPDF called for userId: ${userId}, filePath: ${filePath}`);
  const collection = await client.getOrCreateCollection({ name: COLLECTION_NAME });
  console.log("[RAG] Collection ready for upsert");
  return new Promise((resolve, reject) => {
    extract(filePath, async (err, pages) => {
      if (err) {
        console.error("[RAG] PDF extract error:", err);
        return reject(err);
      }
      const text = pages.join("\n");
      const chunks = text.match(/(.|\n){1,1000}/g) || [];
      const ids = chunks.map((_, i) => `${userId}-${Date.now()}-${i}`);
      try {
        await collection.upsert({
          documents: chunks,
          ids,
          metadatas: chunks.map((_, i) => ({ userId, chunk: i })),
        });
        console.log(`[RAG] Upserted ${chunks.length} chunks for userId: ${userId}`);
        resolve({ message: "PDF processed and embedded successfully." });
      } catch (upsertErr) {
        console.error("[RAG] Chroma upsert error:", upsertErr);
        reject(upsertErr);
      }
    });
  });
};

// RAG retriever tool
export const ragRetriever = tool(
  async ({ query, userId = "default-user781" }) => {
    console.log(`[RAG] ragRetriever called for userId: ${userId}, query: ${query}`);
    const collection = await client.getOrCreateCollection({ name: COLLECTION_NAME });
    console.log("[RAG] Collection ready for query");
    try {
      const results = await collection.query({
        queryTexts: [query],
        nResults: 3,
        where: { userId },
      });
      console.log("[RAG] Query results:", results);
      if (!results.documents || !results.documents[0].length) {
        return "No relevant information found in your uploaded PDFs.";
      }
      return results.documents[0].join("\n---\n");
    } catch (queryErr) {
      console.error("[RAG] Chroma query error:", queryErr);
      return "Error querying vector database.";
    }
  },
  {
    name: "RAG",
    description: "Retrieves relevant information from the user's uploaded PDFs using vector search.",
    schema: z.object({
      query: z.string().describe("The question to search in the uploaded PDFs"),
      userId: z.string().optional().describe("The user's unique identifier"),
    }),
  }
);

let ragAgent;
try {
  ragAgent = await createReactAgent({
    llm: model,
    tools: [ragRetriever],
    checkpointSaver,
    streamRunnable: false,
  });
  console.log("[RAG AGENT] Agent created successfully");
} catch (err) {
  console.error("[RAG AGENT] Error creating agent:", err);
}

// Optional: export a function to answer questions using the agent
export async function answerWithRagAgent({ query }) {
  console.log("[RAG AGENT] Received query:", query);
  try {
    const result = await ragAgent.invoke(
      {
        messages: [
          {
            role: 'user',
            content: query,
          },
        ],
      },
       {
          configurable: { thread_id },
          streamRunnable: false, 
        }
    );
    console.log("[RAG AGENT] Raw agent result:", result);
    const reply = result.output || result.response || result.result || result;
    console.log("[RAG AGENT] Reply being sent:", reply);
    return reply;
  } catch (err) {
    console.error("[RAG AGENT] Error during invoke:", err);
    return "Sorry, there was an error processing your request.";
  }
}

export { upload };


