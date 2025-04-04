import { Router } from 'express';
import { db } from '../db';
import { lessons, topics, resources, subtopics } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { verifyToken } from './auth';

const router = Router();

// Apply authentication middleware to all admin routes
router.use(verifyToken);

// Lessons routes
router.get('/lessons', async (req, res) => {
  try {
    const allLessons = await db.select().from(lessons);
    res.json(allLessons);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
});

router.post('/lessons', async (req, res) => {
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
    res.json(newLesson[0]);
  } catch (error) {
    console.error('Error creating lesson:', error);
    res.status(500).json({ error: 'Failed to create lesson' });
  }
});

router.put('/lessons/:id', async (req, res) => {
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

router.delete('/lessons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(lessons).where(eq(lessons.id, parseInt(id)));
    res.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    res.status(500).json({ error: 'Failed to delete lesson' });
  }
});

// Topics routes
router.get('/topics/:lessonId', async (req, res) => {
  try {
    const { lessonId } = req.params;
    const lessonTopics = await db.select()
      .from(topics)
      .where(eq(topics.lesson_id, parseInt(lessonId)))
      .orderBy(topics.order);
    res.json(lessonTopics);
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
});

router.post('/topics', async (req, res) => {
  try {
    const { lesson_id, title, order } = req.body;
    const newTopic = await db.insert(topics).values({
      lesson_id: parseInt(lesson_id),
      title,
      order: order || 0
    }).returning();
    res.json(newTopic[0]);
  } catch (error) {
    console.error('Error creating topic:', error);
    res.status(500).json({ error: 'Failed to create topic' });
  }
});

router.put('/topics/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { lesson_id, title, order } = req.body;
    const updatedTopic = await db.update(topics)
      .set({
        lesson_id: parseInt(lesson_id),
        title,
        order
      })
      .where(eq(topics.id, parseInt(id)))
      .returning();
    res.json(updatedTopic[0]);
  } catch (error) {
    console.error('Error updating topic:', error);
    res.status(500).json({ error: 'Failed to update topic' });
  }
});

router.delete('/topics/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(topics).where(eq(topics.id, parseInt(id)));
    res.json({ message: 'Topic deleted successfully' });
  } catch (error) {
    console.error('Error deleting topic:', error);
    res.status(500).json({ error: 'Failed to delete topic' });
  }
});

// Subtopics routes
router.get('/topics/:topicId/subtopics', async (req, res) => {
  try {
    const { topicId } = req.params;
    const topicSubtopics = await db.select()
      .from(subtopics)
      .where(eq(subtopics.topic_id, parseInt(topicId)))
      .orderBy(subtopics.order);
    res.json(topicSubtopics);
  } catch (error) {
    console.error('Error fetching subtopics:', error);
    res.status(500).json({ error: 'Failed to fetch subtopics' });
  }
});

router.post('/subtopics', async (req, res) => {
  try {
    const { topic_id, title, objective, key_concepts, order } = req.body;
    const newSubtopic = await db.insert(subtopics).values({
      topic_id: parseInt(topic_id),
      title,
      objective,
      key_concepts: key_concepts || [],
      order: order || 0
    }).returning();
    res.json(newSubtopic[0]);
  } catch (error) {
    console.error('Error creating subtopic:', error);
    res.status(500).json({ error: 'Failed to create subtopic' });
  }
});

router.put('/subtopics/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { topic_id, title, objective, key_concepts, order } = req.body;
    const updatedSubtopic = await db.update(subtopics)
      .set({
        topic_id: parseInt(topic_id),
        title,
        objective,
        key_concepts,
        order
      })
      .where(eq(subtopics.id, parseInt(id)))
      .returning();
    res.json(updatedSubtopic[0]);
  } catch (error) {
    console.error('Error updating subtopic:', error);
    res.status(500).json({ error: 'Failed to update subtopic' });
  }
});

router.delete('/subtopics/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(subtopics).where(eq(subtopics.id, parseInt(id)));
    res.json({ message: 'Subtopic deleted successfully' });
  } catch (error) {
    console.error('Error deleting subtopic:', error);
    res.status(500).json({ error: 'Failed to delete subtopic' });
  }
});

// Resources routes
router.get('/resources/:topicId', async (req, res) => {
  try {
    const { topicId } = req.params;
    const topicResources = await db.select()
      .from(resources)
      .where(eq(resources.subtopic_id, parseInt(topicId)))
      .orderBy(resources.id);
    res.json(topicResources);
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

router.post('/resources', async (req, res) => {
  try {
    const { subtopic_id, type, url, title, description, purpose, content_tags, recommended_when, is_optional } = req.body;
    const newResource = await db.insert(resources).values({
      subtopic_id: parseInt(subtopic_id),
      type,
      url,
      title,
      description,
      purpose,
      content_tags: content_tags || [],
      recommended_when,
      is_optional: is_optional ?? true
    }).returning();
    res.json(newResource[0]);
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).json({ error: 'Failed to create resource' });
  }
});

router.put('/resources/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { subtopic_id, type, url, title, description, purpose, content_tags, recommended_when, is_optional } = req.body;
    const updatedResource = await db.update(resources)
      .set({
        subtopic_id: parseInt(subtopic_id),
        type,
        url,
        title,
        description,
        purpose,
        content_tags,
        recommended_when,
        is_optional
      })
      .where(eq(resources.id, parseInt(id)))
      .returning();
    res.json(updatedResource[0]);
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(500).json({ error: 'Failed to update resource' });
  }
});

router.delete('/resources/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(resources).where(eq(resources.id, parseInt(id)));
    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({ error: 'Failed to delete resource' });
  }
});

export default router; 
 