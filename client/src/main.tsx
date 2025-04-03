
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { createGeminiClient } from "./services/gemini";

// Create and expose the Gemini client
export const geminiClient = createGeminiClient();

// Expose the speak function globally for Gemini function calling
(window as any).speak = geminiClient.speak;

// Clean up any existing DOM before mounting
const cleanupDOM = () => {
  // Make sure we start with a clean DOM
  const oldRoot = document.getElementById("root");
  if (oldRoot) {
    oldRoot.remove();
  }
};

// Find or create the new mounting point
cleanupDOM();
const mountingPoint = document.getElementById("root-mounting-point");

if (mountingPoint) {
  // Create a fresh root element for React
  const rootElement = document.createElement("div");
  rootElement.id = "root";
  mountingPoint.appendChild(rootElement);

  // Render the app to the new root element
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("Root mounting point not found");
}
