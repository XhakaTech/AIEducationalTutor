import express from 'express';
import { db } from '../db';
import { lessons } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from './auth';
import { storage } from '../storage';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

// Get all lessons
router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Use the existing storage interface if available
    if (typeof storage?.getLessons === 'function') {
      const lessons = await storage.getLessons();
      
      if (!lessons || lessons.length === 0) {
        console.log('No lessons found in database');
        return res.json([]);
      }
      
      console.log(`Found ${lessons.length} lessons in database`);
      
      // Add progress information
      const userProgressId = parseInt(userId as string);
      const userProgress = await storage.getUserProgressByUserId(userProgressId);
      
      console.log(`Found ${userProgress?.length || 0} progress entries for user ${userProgressId}`);
      
      // Map through lessons and calculate progress based on completed subtopics
      const lessonsWithProgress = await Promise.all(lessons.map(async (lesson) => {
        try {
          const lessonDetails = await storage.getLessonWithDetails(lesson.id);
          let totalSubtopics = 0;
          let completedSubtopics = 0;
          
          if (lessonDetails && lessonDetails.topics) {
            lessonDetails.topics.forEach((topic: any) => {
              if (topic.subtopics) {
                totalSubtopics += topic.subtopics.length;
                topic.subtopics.forEach((subtopic: any) => {
                  const isCompleted = userProgress?.some(
                    progress => progress.subtopic_id === subtopic.id && progress.completed
                  );
                  if (isCompleted) {
                    completedSubtopics++;
                  }
                });
              }
            });
          }
          
          const progress = totalSubtopics > 0 
            ? Math.round((completedSubtopics / totalSubtopics) * 100) 
            : 0;
          
          return { 
            ...lesson, 
            progress
          };
        } catch (err) {
          console.error(`Error processing lesson ${lesson.id}:`, err);
          return {
            ...lesson,
            progress: 0
          };
        }
      }));
      
      return res.json(lessonsWithProgress);
    }
    
    // Fallback to drizzle if storage interface is not available
    const allLessons = await db
      .select()
      .from(lessons);

    // Add default progress of 0
    const lessonsWithProgress = allLessons.map(lesson => ({
      ...lesson,
      progress: 0
    }));

    res.json(lessonsWithProgress);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
});

// Get a single lesson by ID
router.get('/:id', async (req, res) => {
  try {
    const lesson = await db.select().from(lessons).where(eq(lessons.id, parseInt(req.params.id)));
    if (!lesson.length) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    res.json(lesson[0]);
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({ error: 'Failed to fetch lesson' });
  }
});

// Create a new lesson
router.post('/', async (req, res) => {
  try {
    const { title, description, level, language, icon, is_active } = req.body;
    const newLesson = await db.insert(lessons).values({
      title,
      description,
      level,
      language,
      icon: icon || 'book',
      is_active: is_active ?? true
    }).returning();
    res.status(201).json(newLesson[0]);
  } catch (error) {
    console.error('Error creating lesson:', error);
    res.status(500).json({ error: 'Failed to create lesson' });
  }
});

// Update a lesson
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, level, language, icon, is_active } = req.body;
    const updatedLesson = await db.update(lessons)
      .set({
        title,
        description,
        level,
        language,
        icon,
        is_active
      })
      .where(eq(lessons.id, parseInt(id)))
      .returning();
    res.json(updatedLesson[0]);
  } catch (error) {
    console.error('Error updating lesson:', error);
    res.status(500).json({ error: 'Failed to update lesson' });
  }
});

// Delete a lesson
router.delete('/:id', async (req, res) => {
  try {
    await db.delete(lessons).where(eq(lessons.id, parseInt(req.params.id)));
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting lesson:', error);
    res.status(500).json({ error: 'Failed to delete lesson' });
  }
});

export default router; 
 
 
 