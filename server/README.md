# Weather AI Agent Server

This project is an Express.js server that exposes an AI-powered agent via a REST API. The agent leverages Google Gemini (via LangChain) and several custom tools to answer user queries, fetch real-time weather, generate jokes, and perform calculations such as factorials.

---

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Agent Tools](#agent-tools)
- [How It Works](#how-it-works)
- [Extending the Agent](#extending-the-agent)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Features

- **AI Chat Agent**: Uses Google Gemini via LangChain for natural language understanding and reasoning.
- **Weather Tool**: Fetches real-time weather data for any city using the OpenWeatherMap API.
- **Joke Generator**: Returns a joke on a given topic using JokeAPI.
- **Factorial Calculator**: Computes the factorial of a given number.
- **Threaded Conversations**: Supports thread IDs for multi-turn conversations.
- **REST API**: Simple HTTP interface for integration with frontends or other services.

---

## Project Structure

```
weather-ai-agent/
│
├── Agent.js
├── Agent2.js
├── Agent3.js
└── server/
    ├── .env
    ├── .gitignore
    ├── Agent4.js      # Main agent logic and tool definitions
    ├── index.js       # Express server entry point
    └── package.json
```

- [`server/Agent4.js`](server/Agent4.js): Defines the AI agent, tools, and model configuration.
- [`server/index.js`](server/index.js): Sets up the Express server and API endpoints.
- [`server/.env`](server/.env): Stores API keys and secrets (not committed to version control).
- [`server/package.json`](server/package.json): Node.js dependencies and scripts.

---

## Setup & Installation

1. **Clone the Repository**
   ```sh
   git clone <your-repo-url>
   cd weather-ai-agent/server
   ```

2. **Install Dependencies**
   ```sh
   npm install
   ```

3. **Configure Environment Variables**

   Create a `.env` file in the `server/` directory with the following content:

   ```
   GEMINI_API_KEY=your_google_gemini_api_key
   OPENWEATHER_API_KEY=your_openweathermap_api_key
   ```

   Replace the values with your actual API keys.

4. **Start the Server**
   ```sh
   node index.js
   ```
   The server will run on [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable              | Description                                 |
|-----------------------|---------------------------------------------|
| `GEMINI_API_KEY`      | API key for Google Gemini (Google GenAI)    |
| `OPENWEATHER_API_KEY` | API key for OpenWeatherMap weather service  |

These must be set in the `.env` file in the `server/` directory.

---

## API Endpoints

### `POST /generate`

**Description:**  
Invoke the AI agent with a user prompt.

**Request Body:**
```json
{
  "prompt": "What's the weather in Tokyo?",
  "thread_id": "optional-unique-thread-id"
}
```

- `prompt` (string, required): The user's question or command.
- `thread_id` (string, optional): Unique identifier for conversation threading.

**Response:**
```json
"The weather in Tokyo is sunny"
```
or, for more complex queries:
```json
"Weather in Tokyo: clear sky, temperature: 28°C, humidity: 60%"
```

**Example cURL:**
```sh
curl -X POST http://localhost:3000/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Tell me a joke about computers"}'
```

---

## Agent Tools

The agent is equipped with the following tools, defined in [`server/Agent4.js`](server/Agent4.js):

### 1. Weather Tool

- **Name:** `weather`
- **Description:** Get the weather in a given location.
- **Input:** `{ "city": "CityName" }`
- **Output:** Weather description, temperature, and humidity.

### 2. Joke Generator

- **Name:** `Joke`
- **Description:** Generates a joke on a given topic.
- **Input:** `{ "topic": "TopicName" }`
- **Output:** A joke string.

### 3. Factorial Calculator

- **Name:** `factorial`
- **Description:** Calculates the factorial of a given number.
- **Input:** `{ "num": 5 }`
- **Output:** The factorial result.

---

## How It Works

1. **User sends a prompt** to the `/generate` endpoint.
2. **Express server** receives the request and forwards it to the AI agent.
3. **Agent** uses Google Gemini for reasoning and may invoke one or more tools based on the prompt.
4. **Tools** (weather, joke, factorial) are called as needed, and their results are incorporated into the agent's response.
5. **Final response** is returned to the user.

---

## Extending the Agent

To add new tools or capabilities:

1. Define a new tool using the `tool` function from `@langchain/core/tools` in [`server/Agent4.js`](server/Agent4.js).
2. Add the tool to the `tools` array when creating the agent.
3. Update the agent's prompt or documentation as needed.

---

## Troubleshooting

- **API Keys Not Set:**  
  Ensure your `.env` file is present and contains valid API keys.

- **Weather Not Returned:**  
  Check your OpenWeatherMap API key and city spelling.

- **Joke Not Returned:**  
  JokeAPI may not have a joke for the given topic.

- **Server Not Starting:**  
  Ensure all dependencies are installed and Node.js version is compatible.

- **CORS Issues:**  
  The server is configured with `cors({ origin: '*' })` for development. Adjust as needed for production.

---

## License

This project is licensed under the ISC License. See [`server/package.json`](server/package.json) for