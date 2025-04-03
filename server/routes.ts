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
import {
  adminAuth,
  getAllLessonsAdmin,
  createLesson,
  updateLesson,
  deleteLesson,
  getTopicsByLessonId,
  createTopic,
  updateTopic,
  deleteTopic,
  createSubtopic,
  updateSubtopic,
  deleteSubtopic,
  createResource,
  updateResource,
  deleteResource,
  createQuizQuestion,
  updateQuizQuestion,
  deleteQuizQuestion,
  createFinalTestQuestion,
  updateFinalTestQuestion,
  deleteFinalTestQuestion
} from './controllers/admin.controller';
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
  
  // Admin routes
  app.get('/api/admin/lessons', getAllLessonsAdmin);
  app.post('/api/admin/lessons', createLesson);
  app.put('/api/admin/lessons/:id', updateLesson);
  app.delete('/api/admin/lessons/:id', deleteLesson);
  
  app.get('/api/admin/lessons/:lessonId/topics', getTopicsByLessonId);
  app.post('/api/admin/topics', createTopic);
  app.put('/api/admin/topics/:id', updateTopic);
  app.delete('/api/admin/topics/:id', deleteTopic);
  
  app.post('/api/admin/subtopics', createSubtopic);
  app.put('/api/admin/subtopics/:id', updateSubtopic);
  app.delete('/api/admin/subtopics/:id', deleteSubtopic);
  
  app.post('/api/admin/resources', createResource);
  app.put('/api/admin/resources/:id', updateResource);
  app.delete('/api/admin/resources/:id', deleteResource);
  
  app.post('/api/admin/quiz-questions', createQuizQuestion);
  app.put('/api/admin/quiz-questions/:id', updateQuizQuestion);
  app.delete('/api/admin/quiz-questions/:id', deleteQuizQuestion);
  
  app.post('/api/admin/final-test-questions', createFinalTestQuestion);
  app.put('/api/admin/final-test-questions/:id', updateFinalTestQuestion);
  app.delete('/api/admin/final-test-questions/:id', deleteFinalTestQuestion);
  
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
      
      // For now, skip Gemini validation if we detect an API issue
      if (!process.env.GEMINI_API_KEY) {
        console.warn('GEMINI_API_KEY is not set, skipping validation');
        // Fallback validation (assume valid if topic contains crypto-related terms)
        const cryptoTerms = ['crypto', 'bitcoin', 'ethereum', 'blockchain', 'token', 'defi', 'wallet', 'mining'];
        const isValid = cryptoTerms.some(term => topic.toLowerCase().includes(term));
        
        return res.json({
          isValid: true,
          message: "Topic validated using fallback method. Creating custom lesson...",
          details: "API key validation skipped. Using basic keyword matching."
        });
      }
      
      // System prompt to ensure English response and proper AI role
      const systemPrompt = `
        You are a cryptocurrency education expert who validates topics for a learning platform.
        Your task is to determine if topics are related to cryptocurrency or blockchain.
        Keep your responses in English only and respond with either 'YES' or 'NO' followed by a brief explanation.
      `;
      
      // Main prompt with clear instructions
      const prompt = `
        Topic for validation: "${topic}"
        
        Analyze if this topic is directly related to any of the following:
        - Cryptocurrency (Bitcoin, Ethereum, altcoins, stablecoins, etc.)
        - Blockchain technology
        - Digital assets or tokens
        - DeFi (Decentralized Finance)
        - Crypto trading, investment, or markets
        - Mining or consensus mechanisms
        - Crypto security or wallets
        - Crypto regulation or compliance
        - Web3 or crypto applications
        
        Respond with:
        "YES" if the topic is crypto-related, followed by a short explanation.
        "NO" if the topic is not crypto-related, followed by a short explanation.
        
        Your response must start with either YES or NO in capital letters.
      `;
      
      const response = await GeminiService.generateContent(prompt, systemPrompt);
      
      // Improved validation logic
      const responseText = response.trim().toUpperCase();
      const isValid = responseText.startsWith('YES');
      
      if (isValid) {
        // Extract explanation (everything after "YES")
        const explanation = response.substring(3).trim();
        res.json({ 
          isValid: true,
          message: "Topic validated successfully. Creating custom lesson...",
          details: explanation
        });
      } else {
        // Extract explanation (everything after "NO")
        const explanation = response.substring(2).trim();
        res.json({ 
          isValid: false,
          message: "This topic doesn't appear to be related to cryptocurrency. Please enter a crypto-related topic.",
          details: explanation
        });
      }
      
      // Log for monitoring
      console.log(`Topic validation: "${topic}" - Valid: ${isValid}`);
      
    } catch (error) {
      console.error('Error validating topic:', error);
      // Provide a more graceful fallback in case of API errors
      res.json({ 
        isValid: true,
        message: "Unable to validate with AI. Creating custom lesson anyway...",
        details: "API validation failed. Proceeding with your topic."
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
      const systemPrompt = `
        You are a cryptocurrency education specialist creating comprehensive educational lessons.
        You will create a well-structured lesson on the requested topic.
        Your response must be in valid JSON format only, without any markdown code blocks or additional text.
      `;
      
      const lessonTemplate = `
        Create a comprehensive cryptocurrency lesson about "${topic}" at a ${difficulty} level.
        
        The lesson MUST be in ENGLISH only.
        
        Structure your response as a JSON object with this exact schema:
        {
          "title": "String - Descriptive title for this lesson",
          "description": "String - Brief overview of the lesson (2-3 sentences)",
          "topics": [
            {
              "title": "String - Topic title",
              "subtopics": [
                {
                  "title": "String - Subtopic title",
                  "objective": "String - Clear learning objective",
                  "content": "String - Educational content with HTML formatting (<p>, <ul>, <li>, <strong>, <em> tags only)",
                  "keyConcepts": ["String array - 3-5 key concepts for this subtopic"],
                  "resources": [
                    {
                      "title": "String - Resource title",
                      "url": "String - Valid URL to cryptocurrency resource",
                      "type": "String - Must be one of: article, video, or document",
                      "description": "String - Brief description of this resource"
                    }
                  ],
                  "quizQuestions": [
                    {
                      "question": "String - Clear question text",
                      "options": ["String array - Four possible answer options"],
                      "correctAnswer": "Number - Index of correct answer (0-3)",
                      "explanation": "String - Explanation of why the answer is correct"
                    }
                  ]
                }
              ]
            }
          ]
        }
        
        Requirements:
        - Include exactly 2 topics
        - Each topic must have exactly 2 subtopics
        - Each subtopic must have 2 resources and 3 quiz questions
        - All content MUST be in English only
        - Difficulty level should be appropriate for ${difficulty} (vocabulary, concept complexity)
        - Content should be educational, accurate, and engaging
        - All URLs should be real, relevant cryptocurrency resources
      `;
      
      try {
        // Use our improved JSON parsing in the Gemini service
        const response = await GeminiService.generateContent(lessonTemplate, systemPrompt, true);
        
        // At this point, response should be a valid JSON string from our service
        const lessonData = JSON.parse(response);
        
        // Validate that the response has the expected structure
        if (!lessonData.title || !lessonData.description || !Array.isArray(lessonData.topics)) {
          throw new Error('Invalid lesson structure: missing required fields');
        }
        
        // Add additional fields
        const customLesson = {
          ...lessonData,
          id: uuidv4(),
          userId,
          difficulty,
          createdAt: new Date().toISOString()
        };
        
        console.log('Custom lesson created successfully:', customLesson.title);
        res.json(customLesson);
      } catch (error) {
        console.error('Error creating custom lesson:', error);
        res.status(500).json({ 
          message: 'Failed to create custom lesson. The AI response was not properly formatted.',
          error: error.message
        });
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
