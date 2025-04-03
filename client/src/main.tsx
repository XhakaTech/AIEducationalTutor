
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { createGeminiClient } from "./services/gemini";

// Create and expose the Gemini client
export const geminiClient = createGeminiClient();

// Expose the speak function globally for Gemini function calling
(window as any).speak = geminiClient.speak;

// Use the updated root ID from index.html
const rootElement = document.getElementById("crypto-academy-root");

if (rootElement) {
  try {
    // Simple render approach - no strict mode to avoid double-rendering issues
    ReactDOM.createRoot(rootElement).render(<App />);
  } catch (error) {
    console.error("Error rendering application:", error);
  }
} else {
  console.error("Root element not found - make sure 'crypto-academy-root' exists in index.html");
}
