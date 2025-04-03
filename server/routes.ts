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
  
  // Gemini API proxy to avoid CORS issues
  app.post('/api/gemini', async (req, res) => {
    try {
      const { text, systemPrompt } = req.body;
      
      // In a real implementation, this would call the Gemini API
      // For now, just return a success response
      res.json({ 
        response: "This is a simulated response from the Gemini API. In a production environment, this would contain the actual AI-generated content based on your input.",
        status: "success" 
      });
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      res.status(500).json({ message: 'Failed to call Gemini API' });
    }
  });
  
  // Text-to-speech endpoint
  app.post('/api/speak', (req, res) => {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }
    
    // In a real implementation, this would integrate with a TTS service
    // For now, just return success
    res.json({ success: true, message: 'Text-to-speech request processed' });
  });

  const httpServer = createServer(app);
  return httpServer;
}
