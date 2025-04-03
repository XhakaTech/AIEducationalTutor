import { apiRequest } from "@/lib/queryClient";

interface GeminiResponse {
  response: string;
  status: string;
}

interface GeminiClient {
  generateContent: (text: string, systemPrompt?: string) => Promise<string>;
  generateQuiz: (
    subtopicTitle: string, 
    subtopicObjective: string, 
    keyConcepts: string[], 
    existingQuestions: string[]
  ) => Promise<any>;
  simplifyExplanation: (content: string) => Promise<string>;
  generateFeedback: (quizResults: any) => Promise<string>;
  startChat: () => void;
  sendChatMessage: (message: string) => Promise<string>;
  speak: (text: string) => Promise<void>;
}

export const createGeminiClient = (): GeminiClient => {
  // Current chat session context
  let chatMessages: { role: string; content: string }[] = [];

  const generateContent = async (text: string, systemPrompt?: string): Promise<string> => {
    try {
      const response = await apiRequest('POST', '/api/gemini', {
        text,
        systemPrompt
      });
      
      const data: GeminiResponse = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error generating content with Gemini:', error);
      throw new Error('Failed to generate content');
    }
  };

  const generateQuiz = async (
    subtopicTitle: string, 
    subtopicObjective: string, 
    keyConcepts: string[], 
    existingQuestions: string[]
  ): Promise<any> => {
    try {
      const prompt = `
        Generate a quiz for the subtopic "${subtopicTitle}" with the learning objective: "${subtopicObjective}".
        The key concepts are: ${keyConcepts.join(', ')}.
        
        Please generate 5 multiple-choice questions. Each question should have 4 options with exactly one correct answer.
        
        DO NOT repeat these existing questions: ${existingQuestions.join(', ')}
        
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
      `;
      
      const response = await generateContent(prompt);
      
      // Extract JSON from response (in case the AI includes extra text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback if JSON parsing fails
      return {
        questions: [
          {
            question: "What is the purpose of this subtopic?",
            options: ["To confuse students", "To entertain", `To teach about ${subtopicTitle}`, "To waste time"],
            answer: 2,
            explanation: `This subtopic is designed to help you understand ${subtopicTitle}.`
          }
        ]
      };
    } catch (error) {
      console.error('Error generating quiz with Gemini:', error);
      throw new Error('Failed to generate quiz');
    }
  };

  const simplifyExplanation = async (content: string): Promise<string> => {
    try {
      const prompt = `
        Please simplify the following explanation to make it easier to understand.
        Use simpler vocabulary, shorter sentences, and avoid jargon.
        
        Original explanation:
        ${content}
      `;
      
      return await generateContent(prompt);
    } catch (error) {
      console.error('Error simplifying explanation with Gemini:', error);
      throw new Error('Failed to simplify explanation');
    }
  };

  const generateFeedback = async (quizResults: any): Promise<string> => {
    try {
      const prompt = `
        Please generate personalized feedback based on these quiz results:
        ${JSON.stringify(quizResults)}
        
        Highlight strengths, areas for improvement, and suggest specific next steps for learning.
        Be encouraging but honest.
      `;
      
      return await generateContent(prompt);
    } catch (error) {
      console.error('Error generating feedback with Gemini:', error);
      throw new Error('Failed to generate feedback');
    }
  };

  const startChat = (): void => {
    // Reset chat context
    chatMessages = [
      { 
        role: "system", 
        content: "You are an educational AI tutor. Help the student understand the topic they're studying. Be helpful, encouraging, and clear. If they say they're ready for a quiz, acknowledge that and encourage them to proceed." 
      }
    ];
  };

  const sendChatMessage = async (message: string): Promise<string> => {
    try {
      // Add user message to context
      chatMessages.push({ role: "user", content: message });
      
      // Send entire conversation context to maintain coherence
      const response = await generateContent(
        JSON.stringify(chatMessages),
        "You are responding as part of an ongoing conversation. Respond to the most recent message from the user."
      );
      
      // Add AI response to context
      chatMessages.push({ role: "assistant", content: response });
      
      return response;
    } catch (error) {
      console.error('Error sending chat message to Gemini:', error);
      throw new Error('Failed to process chat message');
    }
  };

  const speak = async (text: string): Promise<void> => {
    try {
      await apiRequest('POST', '/api/speak', { text });
      
      // In a real implementation with browser APIs:
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error with text-to-speech:', error);
    }
  };

  return {
    generateContent,
    generateQuiz,
    simplifyExplanation,
    generateFeedback,
    startChat,
    sendChatMessage,
    speak
  };
};

export default createGeminiClient;
