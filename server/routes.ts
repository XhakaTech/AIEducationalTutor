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

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.get('/api/user/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const user = await storage.getUser(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  });
  
  // For demo purposes - automatically log in as the demo user
  app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    
    // In a real app, we'd verify the password
    const user = await storage.getUserByUsername(username);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Omit password from response
    const { password: _, ...safeUser } = user;
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
  
  // Text-to-speech endpoint
  app.post('/api/speak', async (req, res) => {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }
    
    try {
      // Generate optimized speech text using our enhanced TTS function
      const optimizedText = await GeminiService.generateSpeech(text);
      
      // Send the optimized text to the client
      // The client will use the browser's SpeechSynthesis API with improved text
      res.json({ 
        success: true, 
        message: 'Text-to-speech request processed',
        optimizedText,
        // We could also include additional voice parameters here
        voiceParams: {
          rate: 0.9,        // Slightly slower than default
          pitch: 1.0,       // Default pitch
          volume: 1.0,      // Full volume
          preferredVoice: 'en-US-Neural2-C'  // Recommended voice if available
        }
      });
    } catch (error) {
      console.error('Error generating speech:', error);
      res.status(500).json({ message: 'Failed to process text-to-speech request' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
