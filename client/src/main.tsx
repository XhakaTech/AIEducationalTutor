
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { createGeminiClient } from "./services/gemini";

// Create and expose the Gemini client
export const geminiClient = createGeminiClient();

// Expose the speak function globally for Gemini function calling
(window as any).speak = geminiClient.speak;

// Use createRoot instead of ReactDOM.render
const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
