import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { createGeminiClient } from "./services/gemini";

// Create and expose the Gemini client
export const geminiClient = createGeminiClient();

// Expose the speak function globally for Gemini function calling
(window as any).speak = geminiClient.speak;

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}