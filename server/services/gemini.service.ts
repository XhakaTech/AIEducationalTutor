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
  model: "gemini-2.0-flash",
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
): Promise<string> {
  try {
    const messages: Message[] = [];

    // Add system prompt if provided
    if (systemPrompt) {
      messages.push({
        role: "system",
        content: systemPrompt,
      });
    }

    // Add the user prompt
    messages.push({
      role: "user",
      content: prompt,
    });

    // Generate content using the chat method
    const result = await model.generateContent({
      contents: messages.map((msg) => ({
        role: msg.role === "model" ? "model" : "user", // Gemini API only supports user and model roles
        parts: [{ text: msg.content }],
      })),
    });

    // Extract and return the response text
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating content with Gemini:", error);
    throw new Error("Failed to generate content with Gemini API");
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

    const response = await generateContent(prompt);

    // Extract JSON from response (in case the model returns extra text)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error("Failed to parse quiz JSON from Gemini response");
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

    const response = await generateContent(prompt);

    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error("Failed to parse final score JSON from Gemini response");
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