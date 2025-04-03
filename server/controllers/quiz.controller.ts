import { Request, Response } from 'express';
import { storage } from '../storage';

export const getQuizBySubtopicId = async (req: Request, res: Response) => {
  try {
    const subtopicId = parseInt(req.params.id);
    const questions = await storage.getQuizQuestionsBySubtopicId(subtopicId);
    
    if (!questions || questions.length === 0) {
      return res.status(404).json({ message: 'No quiz questions found for this subtopic' });
    }
    
    res.json({ subtopic_id: subtopicId, questions });
  } catch (error) {
    console.error('Error fetching quiz questions:', error);
    res.status(500).json({ message: 'Failed to fetch quiz questions' });
  }
};

export const getFinalTestByLessonId = async (req: Request, res: Response) => {
  try {
    const lessonId = parseInt(req.params.id);
    const questions = await storage.getFinalTestQuestionsByLessonId(lessonId);
    
    if (!questions || questions.length === 0) {
      return res.status(404).json({ message: 'No final test questions found for this lesson' });
    }
    
    res.json({ lesson_id: lessonId, questions });
  } catch (error) {
    console.error('Error fetching final test questions:', error);
    res.status(500).json({ message: 'Failed to fetch final test questions' });
  }
};

export const submitQuizResults = async (req: Request, res: Response) => {
  try {
    const { userId, subtopicId, score, quizType } = req.body;
    
    if (!userId || !subtopicId || score === undefined || !quizType) {
      return res.status(400).json({ 
        message: 'User ID, subtopic ID, score, and quiz type are required' 
      });
    }
    
    // Get existing progress if any
    let progress = await storage.getUserProgress(userId, subtopicId);
    
    // Prepare update data
    const updateData: any = {
      user_id: userId,
      subtopic_id: subtopicId
    };
    
    // Update specific quiz score
    if (quizType === 'db') {
      updateData.db_quiz_score = score;
    } else if (quizType === 'ai') {
      updateData.ai_quiz_score = score;
      
      // If AI quiz score is satisfactory (>= 70%), mark subtopic as completed
      if (score >= 70) {
        updateData.completed = true;
      }
    }
    
    // Update progress
    progress = await storage.updateUserProgress(updateData);
    
    res.json(progress);
  } catch (error) {
    console.error('Error submitting quiz results:', error);
    res.status(500).json({ message: 'Failed to submit quiz results' });
  }
};

export const submitFinalTestResults = async (req: Request, res: Response) => {
  try {
    const { userId, lessonId, score, feedback } = req.body;
    
    if (!userId || !lessonId || score === undefined) {
      return res.status(400).json({ 
        message: 'User ID, lesson ID, and score are required' 
      });
    }
    
    const result = await storage.saveFinalTestResult({
      user_id: userId,
      lesson_id: lessonId,
      score,
      feedback
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error submitting final test results:', error);
    res.status(500).json({ message: 'Failed to submit final test results' });
  }
};
