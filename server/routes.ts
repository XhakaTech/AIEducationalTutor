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
  
  // Text-to-speech endpoint (simplified version without actual speech generation)
  app.post('/api/speak', async (req, res) => {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }
    
    try {
      // Just log the text instead of generating actual speech
      console.log('Text for narration:', text);
      
      // Return a simple success message
      res.json({ 
        success: true, 
        message: 'Text-to-speech request processed',
        text
      });
    } catch (error) {
      console.error('Error processing text:', error);
      res.status(500).json({ message: 'Failed to process text-to-speech request' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
