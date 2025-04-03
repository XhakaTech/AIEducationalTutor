import { Request, Response } from 'express';
import { storage } from '../storage';

export const getLessons = async (req: Request, res: Response) => {
  try {
    const lessons = await storage.getLessons();
    
    // Add progress information if user ID is provided
    if (req.query.userId) {
      const userId = parseInt(req.query.userId as string);
      const userProgress = await storage.getUserProgressByUserId(userId);
      
      // Map through lessons and calculate progress based on completed subtopics
      const lessonsWithProgress = await Promise.all(lessons.map(async (lesson) => {
        const lessonDetails = await storage.getLessonWithDetails(lesson.id);
        let totalSubtopics = 0;
        let completedSubtopics = 0;
        
        lessonDetails.topics.forEach((topic: any) => {
          totalSubtopics += topic.subtopics.length;
          topic.subtopics.forEach((subtopic: any) => {
            const isCompleted = userProgress.some(
              progress => progress.subtopic_id === subtopic.id && progress.completed
            );
            if (isCompleted) {
              completedSubtopics++;
            }
          });
        });
        
        const progress = totalSubtopics > 0 
          ? Math.round((completedSubtopics / totalSubtopics) * 100) 
          : 0;
        
        return { 
          ...lesson, 
          progress,
          topics: lessonDetails.topics.map((topic: any) => ({ 
            ...topic, 
            subtopics: topic.subtopics.map((subtopic: any) => {
              const subtopicProgress = userProgress.find(
                progress => progress.subtopic_id === subtopic.id
              );
              return { 
                ...subtopic, 
                completed: subtopicProgress?.completed || false,
                db_quiz_score: subtopicProgress?.db_quiz_score,
                ai_quiz_score: subtopicProgress?.ai_quiz_score
              };
            })
          })) 
        };
      }));
      
      return res.json(lessonsWithProgress);
    }
    
    res.json(lessons);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ message: 'Failed to fetch lessons' });
  }
};

export const getLessonById = async (req: Request, res: Response) => {
  try {
    const lessonId = parseInt(req.params.id);
    const lesson = await storage.getLessonWithDetails(lessonId);
    
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    
    // Add progress information if user ID is provided
    if (req.query.userId) {
      const userId = parseInt(req.query.userId as string);
      const userProgress = await storage.getUserProgressByUserId(userId);
      
      const lessonWithProgress = {
        ...lesson,
        topics: lesson.topics.map((topic: any) => ({
          ...topic,
          subtopics: topic.subtopics.map((subtopic: any) => {
            const subtopicProgress = userProgress.find(
              progress => progress.subtopic_id === subtopic.id
            );
            return {
              ...subtopic,
              completed: subtopicProgress?.completed || false,
              db_quiz_score: subtopicProgress?.db_quiz_score,
              ai_quiz_score: subtopicProgress?.ai_quiz_score
            };
          })
        }))
      };
      
      return res.json(lessonWithProgress);
    }
    
    res.json(lesson);
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({ message: 'Failed to fetch lesson' });
  }
};

export const getSubtopicById = async (req: Request, res: Response) => {
  try {
    const subtopicId = parseInt(req.params.id);
    const subtopic = await storage.getSubtopicWithResources(subtopicId);
    
    if (!subtopic) {
      return res.status(404).json({ message: 'Subtopic not found' });
    }
    
    res.json(subtopic);
  } catch (error) {
    console.error('Error fetching subtopic:', error);
    res.status(500).json({ message: 'Failed to fetch subtopic' });
  }
};

export const getResourceById = async (req: Request, res: Response) => {
  try {
    const resourceId = parseInt(req.params.id);
    const resource = await storage.getResourceById(resourceId);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    res.json(resource);
  } catch (error) {
    console.error('Error fetching resource:', error);
    res.status(500).json({ message: 'Failed to fetch resource' });
  }
};

export const updateUserProgress = async (req: Request, res: Response) => {
  try {
    const { userId, subtopicId, completed, db_quiz_score, ai_quiz_score } = req.body;
    
    if (!userId || !subtopicId) {
      return res.status(400).json({ message: 'User ID and subtopic ID are required' });
    }
    
    const progress = await storage.updateUserProgress({
      user_id: userId,
      subtopic_id: subtopicId,
      completed: completed ?? false,
      db_quiz_score,
      ai_quiz_score
    });
    
    res.json(progress);
  } catch (error) {
    console.error('Error updating user progress:', error);
    res.status(500).json({ message: 'Failed to update user progress' });
  }
};
