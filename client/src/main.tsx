import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./index.css";
import { createGeminiClient } from "./services/gemini";

// Create and expose the Gemini client
export const geminiClient = createGeminiClient();

// Expose the speak function globally for Gemini function calling
(window as any).speak = geminiClient.speak;

// Use ReactDOM.render instead of createRoot for now to avoid conflicts
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
