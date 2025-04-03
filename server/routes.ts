import { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  getLessons, 
  getLessonById, 
  getSubtopicById, 
  getResourceById,
  updateUserProgress 
} from './controllers/lesson.controller';
import {
  getQuizBySubtopicId,
  getFinalTestByLessonId,
  submitQuizResults,
  submitFinalTestResults
} from './controllers/quiz.controller';
import * as GeminiService from './services/gemini.service';
import { setupAuth } from './auth';
import { v4 as uuidv4 } from 'uuid';

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);
  
  // User routes
  app.get('/api/user/:id', async (req, res) => {
    // Check if user is authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const id = parseInt(req.params.id);
    const user = await storage.getUser(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Omit password from response
    const { password, ...safeUser } = user;
    res.json(safeUser);
  });
  
  // Lesson routes
  app.get('/api/lessons', getLessons);
  app.get('/api/lessons/:id', getLessonById);
  app.get('/api/subtopics/:id', getSubtopicById);
  app.get('/api/resources/:id', getResourceById);
  
  // Quiz routes
  app.get('/api/quiz/subtopic/:id', getQuizBySubtopicId);
  app.get('/api/quiz/lesson/:id/final', getFinalTestByLessonId);
  app.post('/api/quiz/submit', submitQuizResults);
  app.post('/api/quiz/final/submit', submitFinalTestResults);
  
  // Progress routes
  app.post('/api/progress', updateUserProgress);
  
  // Gemini API endpoints

  // Generate content with Gemini
  app.post('/api/gemini', async (req, res) => {
    try {
      const { text, systemPrompt } = req.body;
      const response = await GeminiService.generateContent(text, systemPrompt);
      res.json({ response, status: "success" });
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      res.status(500).json({ message: 'Failed to call Gemini API' });
    }
  });
  
  // Generate quiz with Gemini
  app.post('/api/gemini/quiz', async (req, res) => {
    try {
      const { subtopicTitle, subtopicObjective, keyConcepts, existingQuestions } = req.body;
      const quiz = await GeminiService.generateQuiz(
        subtopicTitle,
        subtopicObjective,
        keyConcepts,
        existingQuestions
      );
      res.json(quiz);
    } catch (error) {
      console.error('Error generating quiz with Gemini:', error);
      res.status(500).json({ message: 'Failed to generate quiz' });
    }
  });
  
  // Simplify explanation with Gemini
  app.post('/api/gemini/simplify', async (req, res) => {
    try {
      const { content } = req.body;
      const simplified = await GeminiService.simplifyExplanation(content);
      res.json({ response: simplified, status: "success" });
    } catch (error) {
      console.error('Error simplifying content with Gemini:', error);
      res.status(500).json({ message: 'Failed to simplify content' });
    }
  });
  
  // Generate feedback with Gemini
  app.post('/api/gemini/feedback', async (req, res) => {
    try {
      const { quizResults } = req.body;
      const feedback = await GeminiService.generateFeedback(quizResults);
      res.json({ response: feedback, status: "success" });
    } catch (error) {
      console.error('Error generating feedback with Gemini:', error);
      res.status(500).json({ message: 'Failed to generate feedback' });
    }
  });
  
  // Process chat messages with Gemini
  app.post('/api/gemini/chat', async (req, res) => {
    try {
      const { messages } = req.body;
      const response = await GeminiService.processChat(messages);
      res.json({ response, status: "success" });
    } catch (error) {
      console.error('Error processing chat with Gemini:', error);
      res.status(500).json({ message: 'Failed to process chat' });
    }
  });
  
  // Generate subtopic content with Gemini
  app.post('/api/gemini/subtopic', async (req, res) => {
    try {
      const { subtopicTitle, subtopicObjective, keyConcepts } = req.body;
      const content = await GeminiService.generateSubtopicContent(
        subtopicTitle,
        subtopicObjective,
        keyConcepts
      );
      res.json({ response: content, status: "success" });
    } catch (error) {
      console.error('Error generating subtopic content with Gemini:', error);
      res.status(500).json({ message: 'Failed to generate subtopic content' });
    }
  });
  
  // Calculate final score with Gemini
  app.post('/api/gemini/final-score', async (req, res) => {
    try {
      const { quizResults, finalTestResults, lessonTitle } = req.body;
      const scoreData = await GeminiService.calculateFinalScore(
        quizResults,
        finalTestResults,
        lessonTitle
      );
      res.json(scoreData);
    } catch (error) {
      console.error('Error calculating final score with Gemini:', error);
      res.status(500).json({ message: 'Failed to calculate final score' });
    }
  });
  
  // Validate if a topic is crypto-related with Gemini
  app.post('/api/gemini/validate-topic', async (req, res) => {
    try {
      const { topic } = req.body;
      
      if (!topic) {
        return res.status(400).json({ 
          isValid: false, 
          message: 'Topic is required' 
        });
      }
      
      // Call Gemini to validate if topic is cryptocurrency-related
      const prompt = `
        You are a cryptocurrency topic validator. Given a topic, you need to determine if it's related to cryptocurrency.
        
        Topic: "${topic}"
        
        Is this topic related to cryptocurrency, blockchain, digital assets, or finance concepts relevant to crypto?
        Answer with 'yes' or 'no', followed by a short explanation.
      `;
      
      const response = await GeminiService.generateContent(prompt);
      
      // Parse response to determine if topic is valid
      const isValid = response.toLowerCase().includes('yes');
      
      if (isValid) {
        res.json({ 
          isValid: true,
          message: "Topic validated successfully. Creating custom lesson..."
        });
      } else {
        res.json({ 
          isValid: false,
          message: "This topic doesn't appear to be related to cryptocurrency. Please enter a crypto-related topic." 
        });
      }
    } catch (error) {
      console.error('Error validating topic:', error);
      res.status(500).json({ 
        isValid: false,
        message: 'Failed to validate topic. Please try again.' 
      });
    }
  });
  
  // Create custom lesson with Gemini
  app.post('/api/custom-lessons', async (req, res) => {
    try {
      const { userId, topic, difficulty } = req.body;
      
      if (!topic || !difficulty) {
        return res.status(400).json({ message: 'Topic and difficulty are required' });
      }
      
      // Generate lesson content using Gemini
      const lessonTemplate = `
        Create a comprehensive cryptocurrency lesson about "${topic}" at a ${difficulty} level.
        Structure your response in the following JSON format:
        
        {
          "title": "Descriptive title for this lesson",
          "description": "Brief overview of the lesson",
          "topics": [
            {
              "title": "Topic 1 Title",
              "subtopics": [
                {
                  "title": "Subtopic 1 Title",
                  "objective": "Learning objective for this subtopic",
                  "content": "Detailed HTML content with proper formatting",
                  "keyConcepts": ["Key concept 1", "Key concept 2", "Key concept 3"],
                  "resources": [
                    {
                      "title": "Resource Title",
                      "url": "https://example.com",
                      "type": "article/video/document",
                      "description": "Brief description of the resource"
                    }
                  ],
                  "quizQuestions": [
                    {
                      "question": "Quiz question text?",
                      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
                      "correctAnswer": 0,
                      "explanation": "Explanation of the correct answer"
                    }
                  ]
                }
              ]
            }
          ]
        }
        
        Include 2 topics, each with 2 subtopics. Each subtopic should have 2 resources and 3 quiz questions.
        The content should be educational, accurate, and appropriate for the ${difficulty} level.
        All content must be in well-formatted HTML.
      `;
      
      const response = await GeminiService.generateContent(lessonTemplate);
      
      try {
        // Parse the JSON response
        const lessonData = JSON.parse(response);
        
        // Add additional fields
        const customLesson = {
          ...lessonData,
          id: uuidv4(),
          userId,
          difficulty,
          createdAt: new Date().toISOString()
        };
        
        res.json(customLesson);
      } catch (parseError) {
        console.error('Error parsing Gemini response:', parseError);
        res.status(500).json({ message: 'Failed to create custom lesson. Invalid response format.' });
      }
    } catch (error) {
      console.error('Error creating custom lesson:', error);
      res.status(500).json({ message: 'Failed to create custom lesson' });
    }
  });
  
  // Text-to-speech endpoint using Gemini for speech-friendly optimization
  app.post('/api/speak', async (req, res) => {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }
    
    try {
      // Use Gemini to optimize the text for speech
      const optimizedText = await GeminiService.generateSpeech(text);
      
      // Return the optimized text and default voice parameters
      res.json({ 
        success: true, 
        message: 'Text-to-speech request processed',
        optimizedText,
        voiceParams: {
          rate: 0.9,
          pitch: 1.0,
          volume: 1.0,
          preferredVoice: 'en-US'
        }
      });
    } catch (error) {
      console.error('Error processing text:', error);
      res.status(500).json({ message: 'Failed to process text-to-speech request' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
