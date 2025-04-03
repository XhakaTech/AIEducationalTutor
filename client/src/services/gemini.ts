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
  generateSubtopicContent: (
    subtopicTitle: string,
    subtopicObjective: string,
    keyConcepts: string[]
  ) => Promise<string>;
  calculateFinalScore: (
    quizResults: any[],
    finalTestResults: any,
    lessonTitle: string
  ) => Promise<any>;
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
      // Use the dedicated endpoint for quiz generation
      const response = await apiRequest('POST', '/api/gemini/quiz', {
        subtopicTitle,
        subtopicObjective,
        keyConcepts,
        existingQuestions
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error generating quiz with Gemini:', error);
      throw new Error('Failed to generate quiz');
    }
  };

  const simplifyExplanation = async (content: string): Promise<string> => {
    try {
      // Use the dedicated endpoint for simplifying explanations
      const response = await apiRequest('POST', '/api/gemini/simplify', {
        content
      });
      
      const data: GeminiResponse = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error simplifying explanation with Gemini:', error);
      throw new Error('Failed to simplify explanation');
    }
  };

  const generateFeedback = async (quizResults: any): Promise<string> => {
    try {
      // Use the dedicated endpoint for generating feedback
      const response = await apiRequest('POST', '/api/gemini/feedback', {
        quizResults
      });
      
      const data: GeminiResponse = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error generating feedback with Gemini:', error);
      throw new Error('Failed to generate feedback');
    }
  };

  const generateSubtopicContent = async (
    subtopicTitle: string,
    subtopicObjective: string,
    keyConcepts: string[]
  ): Promise<string> => {
    try {
      // Use the dedicated endpoint for generating subtopic content
      const response = await apiRequest('POST', '/api/gemini/subtopic', {
        subtopicTitle,
        subtopicObjective,
        keyConcepts
      });
      
      const data: GeminiResponse = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error generating subtopic content with Gemini:', error);
      throw new Error('Failed to generate subtopic content');
    }
  };

  const calculateFinalScore = async (
    quizResults: any[],
    finalTestResults: any,
    lessonTitle: string
  ): Promise<any> => {
    try {
      // Use the dedicated endpoint for calculating final scores
      const response = await apiRequest('POST', '/api/gemini/final-score', {
        quizResults,
        finalTestResults,
        lessonTitle
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error calculating final score with Gemini:', error);
      throw new Error('Failed to calculate final score');
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
      
      // Use the dedicated endpoint for chat
      const response = await apiRequest('POST', '/api/gemini/chat', {
        messages: chatMessages
      });
      
      const data: GeminiResponse = await response.json();
      
      // Add AI response to context
      chatMessages.push({ role: "assistant", content: data.response });
      
      return data.response;
    } catch (error) {
      console.error('Error sending chat message to Gemini:', error);
      throw new Error('Failed to process chat message');
    }
  };

  const speak = async (text: string): Promise<void> => {
    try {
      await apiRequest('POST', '/api/speak', { text });
      
      // Use the browser's SpeechSynthesis API for text-to-speech
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
      } else {
        console.log('Text-to-speech is not supported in this browser');
      }
    } catch (error) {
      console.error('Error with text-to-speech:', error);
    }
  };

  return {
    generateContent,
    generateQuiz,
    simplifyExplanation,
    generateFeedback,
    generateSubtopicContent,
    calculateFinalScore,
    startChat,
    sendChatMessage,
    speak
  };
};

export default createGeminiClient;
