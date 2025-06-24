import React, { useState, useRef } from "react";
import './App.css'

function App() {
  const [pdfStatus, setPdfStatus] = useState("");
  const [chat, setChat] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef();

  // Upload PDF handler
  const handleUpload = async (e) => {
    e.preventDefault();
    setUploading(true);
    setPdfStatus("Uploading...");
    const formData = new FormData();
    formData.append("pdf", fileInput.current.files[0]);
    const res = await fetch("http://localhost:3000/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setPdfStatus(data.message || data.error || "Done");
    setUploading(false);
  };

  // Chat handler
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setChat((c) => [...c, { role: "user", text: input }]);
    setInput("");
    setLoading(true);
    const res = await fetch("http://localhost:3000/rag-query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: input }),
    });
    const data = await res.json();
    
    // Extract the actual AI reply from the response
    let aiText = data.result;
    if (typeof aiText === "object" && aiText.messages && Array.isArray(aiText.messages)) {
      // Find the last AIMessage in the messages array
      const lastAI = [...aiText.messages].reverse().find(
        m => m.kwargs && m.kwargs.content && m.id && m.id.includes("AIMessage")
      );
      aiText = lastAI ? lastAI.kwargs.content : "Sorry, I couldn't process that response.";
    }
    setChat((c) => [...c, { role: "user", text: input }, { role: "ai", text: aiText }]);
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto mt-10 font-sans bg-gray-50 min-h-screen p-4 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">PDF RAG Chat</h2>
      <form onSubmit={handleUpload} className="flex flex-col sm:flex-row items-center gap-2 mb-6">
        <input type="file" accept="application/pdf" ref={fileInput} required className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition">
          {uploading ? (
            <span className="flex items-center gap-2"><span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>Uploading...</span>
          ) : "Upload PDF"}
        </button>
        <span className="ml-2 text-sm text-gray-600">{pdfStatus}</span>
      </form>
      <div className="border border-gray-300 bg-white p-4 mb-4 rounded overflow-y-auto min-h-[480px]">
        {chat.length === 0 && (
          <div className="text-gray-400 text-center">No messages yet. Ask a question about your PDF!</div>
        )}
        {chat.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} mb-2`}>
            <div className={`rounded-lg px-4 py-2 max-w-[80%] whitespace-pre-line shadow-sm ${msg.role === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-900"}`}>
              <span className="block text-xs font-semibold mb-1">{msg.role === "user" ? "You" : "AI"}</span>
              {typeof msg.text === 'string' ? msg.text : JSON.stringify(msg.text)}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start mb-2">
            <div className="rounded-lg px-4 py-2 bg-gray-200 text-gray-800 max-w-[80%] flex items-center gap-2">
              <span className="animate-spin h-4 w-4 border-2 border-purple-400 border-t-transparent rounded-full"></span>
              <span>AI is thinking...</span>
            </div>
          </div>
        )}
      </div>
      <form onSubmit={handleSend} className="flex gap-2 items-center">
        <input
          className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your PDF..."
        />
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition">Send</button>
      </form>
    </div>
  );
}

export default App;
