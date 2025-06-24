# PDF RAG Chat App (React + Vite + Tailwind)

A modern, responsive chat application that allows users to upload PDFs, stores their content as vector embeddings in ChromaDB, and chat with an AI agent (Gemini) that answers questions based on the uploaded PDFs.

## Features
- Upload PDF files and extract their content
- Store and search PDF content using ChromaDB vector database
- Chat with an AI agent (Gemini) that uses Retrieval-Augmented Generation (RAG)
- Responsive, full-screen UI built with React and Tailwind CSS
- Modern chat bubbles, loading indicators, and smooth UX

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- ChromaDB running locally (default: `localhost:8000`)
- Gemini API key (set as `GEMINI_API_KEY` in your environment)

### Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```
2. **Start the frontend:**
   ```bash
   npm run dev
   ```
   The app will be available at [http://localhost:5173](http://localhost:5173)

3. **Start the backend:**
   ```bash
   cd ../server
   npm install
   node index.js
   ```
   The backend runs on [http://localhost:3000](http://localhost:3000)

4. **Upload PDFs and chat!**

## Project Structure
- `frontend/` — React app (Vite, Tailwind CSS)
- `server/` — Node.js/Express backend, ChromaDB, Gemini integration

## Customization
- UI is fully responsive and adapts to all screen sizes
- Chatbox is scrollable and uses most of the screen
- Easily extend for multi-user support or authentication

## Credits
- [Vite](https://vitejs.dev/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [ChromaDB](https://www.trychroma.com/)
- [Gemini (Google Generative AI)](https://ai.google.dev/)

---

For any issues or feature requests, please open an issue or contact the maintainer.
