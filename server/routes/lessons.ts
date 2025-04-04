import express from 'express';
import { db } from '../db';
import { lessons, topics } from '@shared/schema';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Get all lessons
router.get('/', async (req, res) => {
  try {
    const allLessons = await db.select().from(lessons);
    res.json(allLessons);
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
 