import {
  GoogleGenerativeAI,
  GenerativeModel,
  GenerationConfig,
} from "@google/generative-ai";

// Initialize the Google Generative AI with the API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Default generation configuration
const defaultConfig: GenerationConfig = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 1024,
};

// Create a model instance with the Gemini Pro model
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-lite",
  generationConfig: defaultConfig,
});

// Basic chat history for maintaining context in conversations
type Message = {
  role: "user" | "model" | "system";
  content: string;
};

/**
 * Generate content using Gemini based on the provided prompt
 */
export async function generateContent(
  prompt: string,
  systemPrompt?: string,
  formatAsJson: boolean = false,
): Promise<string> {
  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }

    // If we're expecting JSON, add specific formatting instructions
    if (formatAsJson) {
      prompt = `${prompt}\n\nIMPORTANT: Return ONLY valid JSON in your response. Do not include markdown formatting, code blocks, or any explanatory text. The response should contain nothing but the JSON object.`;
    }

    const requestBody = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: formatAsJson ? 0.1 : 0.7, // Lower temperature for JSON to be more precise
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
      ],
    };

    // For now, we'll handle system prompts by prepending them to the user prompt
    // This is because the direct API may have stricter requirements for role formatting
    if (systemPrompt) {
      prompt = `${systemPrompt}\n\n${prompt}`;
    }

    const response = await fetch(`${url}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${errorBody}`);
    }

    const data = await response.json();

    // Extract the generated text from the response
    let generatedContent =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // If this is JSON content, clean it up
    if (formatAsJson) {
      // Remove markdown code blocks if present
      let cleanedContent = generatedContent.trim();

      // Handle ```json code blocks (most common)
      if (cleanedContent.includes("```json")) {
        const jsonStartIndex =
          cleanedContent.indexOf("```json") + "```json".length;
        const jsonEndIndex = cleanedContent.lastIndexOf("```");
        if (jsonEndIndex > jsonStartIndex) {
          cleanedContent = cleanedContent
            .substring(jsonStartIndex, jsonEndIndex)
            .trim();
        }
      }
      // Handle ``` code blocks without language specifier
      else if (cleanedContent.includes("```")) {
        const jsonStartIndex = cleanedContent.indexOf("```") + "```".length;
        const jsonEndIndex = cleanedContent.lastIndexOf("```");
        if (jsonEndIndex > jsonStartIndex) {
          cleanedContent = cleanedContent
            .substring(jsonStartIndex, jsonEndIndex)
            .trim();
        }
      }

      // Final cleanup of any remaining markdown or non-JSON content
      cleanedContent = cleanedContent.replace(/```/g, "").trim();

      console.log(
        "Cleaned JSON content from Gemini (first 100 chars):",
        cleanedContent.substring(0, 100),
      );

      // Attempt to parse and re-stringify to validate and format
      try {
        const parsed = JSON.parse(cleanedContent);
        return JSON.stringify(parsed);
      } catch (error) {
        console.error("Error parsing JSON from Gemini:", error);
        console.error(
          "Raw response preview:",
          cleanedContent.substring(0, 200),
        );
        throw new Error("Generated content is not valid JSON");
      }
    }

    return generatedContent;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
}

/**
 * Process chat messages with conversation history
 */
export async function processChat(messages: Message[]): Promise<string> {
  try {
    // Map our message format to Gemini's format
    const geminiMessages = messages.map((msg) => ({
      role: msg.role === "model" ? "model" : "user", // Gemini API only supports user and model roles
      parts: [{ text: msg.content }],
    }));

    // Generate content using the chat method
    const result = await model.generateContent({
      contents: geminiMessages,
    });

    // Extract and return the response text
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Error processing chat with Gemini:", error);
    throw new Error("Failed to process chat with Gemini API");
  }
}

/**
 * Generate a quiz based on subtopic content
 */
export async function generateQuiz(
  subtopicTitle: string,
  subtopicObjective: string,
  keyConcepts: string[],
  existingQuestions: string[],
): Promise<any> {
  try {
    const prompt = `
      You are an educational quiz generator. Create a quiz for the subtopic "${subtopicTitle}" 
      with the learning objective: "${subtopicObjective}".

      The key concepts are: ${keyConcepts.join(", ")}.

      Please generate 5 multiple-choice questions. Each question should have 4 options with exactly one correct answer.
      The questions should be challenging but fair, and directly related to the key concepts.

      DO NOT repeat these existing questions: ${existingQuestions.join(", ")}

      Format your response as a JSON object with the following structure:
      {
        "questions": [
          {
            "question": "Question text here?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "answer": 0, // Index of the correct answer (0-3)
            "explanation": "Explanation of the correct answer"
          },
          // More questions...
        ]
      }

      Return ONLY the JSON object without any additional text.
    `;

    const response = await generateContent(prompt, undefined, true); // Request JSON response

    return response;
  } catch (error) {
    console.error("Error generating quiz with Gemini:", error);
    throw new Error("Failed to generate quiz with Gemini API");
  }
}

/**
 * Simplify a complex explanation
 */
export async function simplifyExplanation(content: string): Promise<string> {
  try {
    const prompt = `
      Please simplify the following explanation to make it easier to understand.
      Use simpler vocabulary, shorter sentences, and avoid jargon.
      Explain concepts as if speaking to a student who is new to this topic.

      Original explanation:
      ${content}
    `;

    return await generateContent(prompt);
  } catch (error) {
    console.error("Error simplifying explanation with Gemini:", error);
    throw new Error("Failed to simplify explanation with Gemini API");
  }
}

/**
 * Generate personalized feedback based on quiz results
 */
export async function generateFeedback(quizResults: any): Promise<string> {
  try {
    const prompt = `
      Please generate personalized educational feedback based on these quiz results:
      ${JSON.stringify(quizResults)}

      Highlight strengths, areas for improvement, and suggest specific next steps for learning.
      Be encouraging but honest. Keep your response under 200 words and in a friendly, supportive tone.
    `;

    return await generateContent(prompt);
  } catch (error) {
    console.error("Error generating feedback with Gemini:", error);
    throw new Error("Failed to generate feedback with Gemini API");
  }
}

/**
 * Generate detailed content for a subtopic
 */
export async function generateSubtopicContent(
  subtopicTitle: string,
  subtopicObjective: string,
  keyConcepts: string[],
): Promise<string> {
  try {
    const prompt = `
      Generate a comprehensive but concise educational explanation about "${subtopicTitle}".

      Learning objective: ${subtopicObjective}

      Key concepts to cover:
      ${keyConcepts.map((concept) => `- ${concept}`).join("\n")}

      Structure your explanation with:
      1. A brief introduction to the concept
      2. Clear explanations of each key concept
      3. How these concepts relate to each other
      4. Real-world applications or examples
      5. A brief summary

      Keep your explanation educational, accurate, and engaging. Use a friendly, conversational tone appropriate for a learning environment.
      The total length should be approximately 300-500 words.
    `;

    return await generateContent(prompt);
  } catch (error) {
    console.error("Error generating subtopic content with Gemini:", error);
    throw new Error("Failed to generate subtopic content with Gemini API");
  }
}

/**
 * Calculate and provide a final score with personalized feedback
 */
export async function calculateFinalScore(
  quizResults: any[],
  finalTestResults: any,
  lessonTitle: string,
): Promise<any> {
  try {
    const prompt = `
      As an educational AI, analyze these learning results and provide a comprehensive assessment:

      Lesson: "${lessonTitle}"

      Quiz Results: ${JSON.stringify(quizResults)}

      Final Test Results: ${JSON.stringify(finalTestResults)}

      Please provide:
      1. An overall score as a percentage
      2. Identification of strong areas
      3. Areas that need improvement
      4. Specific recommendations for further study
      5. An encouraging message

      Format your response as a JSON object with the following structure:
      {
        "score": 85, // overall percentage
        "strengths": ["Concept A", "Concept B"],
        "improvementAreas": ["Concept C", "Concept D"],
        "recommendations": ["Specific action 1", "Specific action 2"],
        "encouragement": "Encouraging message here"
      }

      Return ONLY the JSON object without any additional text.
    `;

    const response = await generateContent(prompt, undefined, true); // Request JSON response

    return response;
  } catch (error) {
    console.error("Error calculating final score with Gemini:", error);
    throw new Error("Failed to calculate final score with Gemini API");
  }
}

/**
 * Optimize text for text-to-speech processing
 */
export async function generateSpeech(text: string): Promise<string> {
  try {
    const prompt = `
      Optimize the following text for text-to-speech processing:

      ${text}

      Please:
      1. Break long sentences into shorter, clearer ones
      2. Remove any special characters that might cause speech issues
      3. Add natural pauses with commas where appropriate
      4. Spell out abbreviations if needed for clarity
      5. Keep the meaning exactly the same

      Return only the optimized text without additional comments.
    `;

    return await generateContent(prompt);
  } catch (error) {
    console.error("Error optimizing text for speech with Gemini:", error);
    // On error, return the original text
    return text;
  }
}
