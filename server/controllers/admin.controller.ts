import { Request, Response } from "express";
import { storage } from "../storage";
import { 
  InsertLesson, InsertTopic, InsertSubtopic, 
  InsertResource, InsertQuizQuestion, InsertFinalTestQuestion
} from "../../shared/schema";

// Authentication middleware for admin routes
export const adminAuth = (req: Request, res: Response, next: Function) => {
  const { adminPassword } = req.body;
  
  // Check against environment variable or hard-coded password (for demo)
  const correctPassword = process.env.ADMIN_PASSWORD || "admin123456";
  
  if (adminPassword !== correctPassword) {
    return res.status(401).json({ message: "Unauthorized access to admin area" });
  }
  
  next();
};

// Get all lessons with full details (topics, subtopics, resources, etc.)
export const getAllLessonsAdmin = async (req: Request, res: Response) => {
  try {
    const lessons = await storage.getLessons();
    
    // Enhance with full details for each lesson
    const detailedLessons = await Promise.all(
      lessons.map(async (lesson) => {
        return await storage.getLessonWithDetails(lesson.id);
      })
    );
    
    res.json(detailedLessons);
  } catch (error) {
    console.error("Error fetching admin lessons:", error);
    res.status(500).json({ message: "Failed to fetch lessons" });
  }
};

// Create a new lesson
export const createLesson = async (req: Request, res: Response) => {
  try {
    const lessonData: InsertLesson = req.body.lesson;
    
    // Add validation if needed
    if (!lessonData.title || !lessonData.description) {
      return res.status(400).json({ message: "Title and description are required" });
    }
    
    // Insert the lesson
    const newLesson = await storage.createLesson(lessonData);
    
    res.status(201).json(newLesson);
  } catch (error) {
    console.error("Error creating lesson:", error);
    res.status(500).json({ message: "Failed to create lesson" });
  }
};

// Update an existing lesson
export const updateLesson = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const lessonData: Partial<InsertLesson> = req.body.lesson;
    
    // Add validation if needed
    if (Object.keys(lessonData).length === 0) {
      return res.status(400).json({ message: "No update data provided" });
    }
    
    // Update the lesson
    const updatedLesson = await storage.updateLesson(parseInt(id), lessonData);
    
    if (!updatedLesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }
    
    res.json(updatedLesson);
  } catch (error) {
    console.error("Error updating lesson:", error);
    res.status(500).json({ message: "Failed to update lesson" });
  }
};

// Delete a lesson
export const deleteLesson = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Delete the lesson
    const success = await storage.deleteLesson(parseInt(id));
    
    if (!success) {
      return res.status(404).json({ message: "Lesson not found" });
    }
    
    res.json({ message: "Lesson deleted successfully" });
  } catch (error) {
    console.error("Error deleting lesson:", error);
    res.status(500).json({ message: "Failed to delete lesson" });
  }
};

// Topic operations
export const createTopic = async (req: Request, res: Response) => {
  try {
    const topicData: InsertTopic = req.body.topic;
    
    // Add validation if needed
    if (!topicData.lesson_id || !topicData.title) {
      return res.status(400).json({ message: "Lesson ID and title are required" });
    }
    
    // Insert the topic
    const newTopic = await storage.createTopic(topicData);
    
    res.status(201).json(newTopic);
  } catch (error) {
    console.error("Error creating topic:", error);
    res.status(500).json({ message: "Failed to create topic" });
  }
};

export const updateTopic = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const topicData: Partial<InsertTopic> = req.body.topic;
    
    // Add validation if needed
    if (Object.keys(topicData).length === 0) {
      return res.status(400).json({ message: "No update data provided" });
    }
    
    // Update the topic
    const updatedTopic = await storage.updateTopic(parseInt(id), topicData);
    
    if (!updatedTopic) {
      return res.status(404).json({ message: "Topic not found" });
    }
    
    res.json(updatedTopic);
  } catch (error) {
    console.error("Error updating topic:", error);
    res.status(500).json({ message: "Failed to update topic" });
  }
};

export const deleteTopic = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Delete the topic
    const success = await storage.deleteTopic(parseInt(id));
    
    if (!success) {
      return res.status(404).json({ message: "Topic not found" });
    }
    
    res.json({ message: "Topic deleted successfully" });
  } catch (error) {
    console.error("Error deleting topic:", error);
    res.status(500).json({ message: "Failed to delete topic" });
  }
};

// Subtopic operations
export const createSubtopic = async (req: Request, res: Response) => {
  try {
    const subtopicData: InsertSubtopic = req.body.subtopic;
    
    // Add validation if needed
    if (!subtopicData.topic_id || !subtopicData.title) {
      return res.status(400).json({ message: "Topic ID and title are required" });
    }
    
    // Insert the subtopic
    const newSubtopic = await storage.createSubtopic(subtopicData);
    
    res.status(201).json(newSubtopic);
  } catch (error) {
    console.error("Error creating subtopic:", error);
    res.status(500).json({ message: "Failed to create subtopic" });
  }
};

export const updateSubtopic = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const subtopicData: Partial<InsertSubtopic> = req.body.subtopic;
    
    // Add validation if needed
    if (Object.keys(subtopicData).length === 0) {
      return res.status(400).json({ message: "No update data provided" });
    }
    
    // Update the subtopic
    const updatedSubtopic = await storage.updateSubtopic(parseInt(id), subtopicData);
    
    if (!updatedSubtopic) {
      return res.status(404).json({ message: "Subtopic not found" });
    }
    
    res.json(updatedSubtopic);
  } catch (error) {
    console.error("Error updating subtopic:", error);
    res.status(500).json({ message: "Failed to update subtopic" });
  }
};

export const deleteSubtopic = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Delete the subtopic
    const success = await storage.deleteSubtopic(parseInt(id));
    
    if (!success) {
      return res.status(404).json({ message: "Subtopic not found" });
    }
    
    res.json({ message: "Subtopic deleted successfully" });
  } catch (error) {
    console.error("Error deleting subtopic:", error);
    res.status(500).json({ message: "Failed to delete subtopic" });
  }
};

// Resource operations
export const createResource = async (req: Request, res: Response) => {
  try {
    const resourceData: InsertResource = req.body.resource;
    
    // Add validation if needed
    if (!resourceData.subtopic_id || !resourceData.type) {
      return res.status(400).json({ message: "Subtopic ID and type are required" });
    }
    
    // Insert the resource
    const newResource = await storage.createResource(resourceData);
    
    res.status(201).json(newResource);
  } catch (error) {
    console.error("Error creating resource:", error);
    res.status(500).json({ message: "Failed to create resource" });
  }
};

export const updateResource = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const resourceData: Partial<InsertResource> = req.body.resource;
    
    // Add validation if needed
    if (Object.keys(resourceData).length === 0) {
      return res.status(400).json({ message: "No update data provided" });
    }
    
    // Update the resource
    const updatedResource = await storage.updateResource(parseInt(id), resourceData);
    
    if (!updatedResource) {
      return res.status(404).json({ message: "Resource not found" });
    }
    
    res.json(updatedResource);
  } catch (error) {
    console.error("Error updating resource:", error);
    res.status(500).json({ message: "Failed to update resource" });
  }
};

export const deleteResource = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Delete the resource
    const success = await storage.deleteResource(parseInt(id));
    
    if (!success) {
      return res.status(404).json({ message: "Resource not found" });
    }
    
    res.json({ message: "Resource deleted successfully" });
  } catch (error) {
    console.error("Error deleting resource:", error);
    res.status(500).json({ message: "Failed to delete resource" });
  }
};

// Quiz question operations
export const createQuizQuestion = async (req: Request, res: Response) => {
  try {
    const questionData: InsertQuizQuestion = req.body.question;
    
    // Add validation if needed
    if (!questionData.subtopic_id || !questionData.question || !questionData.options || !questionData.answer) {
      return res.status(400).json({ message: "Subtopic ID, question, options, and answer are required" });
    }
    
    // Insert the quiz question
    const newQuestion = await storage.createQuizQuestion(questionData);
    
    res.status(201).json(newQuestion);
  } catch (error) {
    console.error("Error creating quiz question:", error);
    res.status(500).json({ message: "Failed to create quiz question" });
  }
};

export const updateQuizQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const questionData: Partial<InsertQuizQuestion> = req.body.question;
    
    // Add validation if needed
    if (Object.keys(questionData).length === 0) {
      return res.status(400).json({ message: "No update data provided" });
    }
    
    // Update the quiz question
    const updatedQuestion = await storage.updateQuizQuestion(parseInt(id), questionData);
    
    if (!updatedQuestion) {
      return res.status(404).json({ message: "Quiz question not found" });
    }
    
    res.json(updatedQuestion);
  } catch (error) {
    console.error("Error updating quiz question:", error);
    res.status(500).json({ message: "Failed to update quiz question" });
  }
};

export const deleteQuizQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Delete the quiz question
    const success = await storage.deleteQuizQuestion(parseInt(id));
    
    if (!success) {
      return res.status(404).json({ message: "Quiz question not found" });
    }
    
    res.json({ message: "Quiz question deleted successfully" });
  } catch (error) {
    console.error("Error deleting quiz question:", error);
    res.status(500).json({ message: "Failed to delete quiz question" });
  }
};

// Final test question operations
export const createFinalTestQuestion = async (req: Request, res: Response) => {
  try {
    const questionData: InsertFinalTestQuestion = req.body.question;
    
    // Add validation if needed
    if (!questionData.lesson_id || !questionData.question || !questionData.options || !questionData.answer) {
      return res.status(400).json({ message: "Lesson ID, question, options, and answer are required" });
    }
    
    // Insert the final test question
    const newQuestion = await storage.createFinalTestQuestion(questionData);
    
    res.status(201).json(newQuestion);
  } catch (error) {
    console.error("Error creating final test question:", error);
    res.status(500).json({ message: "Failed to create final test question" });
  }
};

export const updateFinalTestQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const questionData: Partial<InsertFinalTestQuestion> = req.body.question;
    
    // Add validation if needed
    if (Object.keys(questionData).length === 0) {
      return res.status(400).json({ message: "No update data provided" });
    }
    
    // Update the final test question
    const updatedQuestion = await storage.updateFinalTestQuestion(parseInt(id), questionData);
    
    if (!updatedQuestion) {
      return res.status(404).json({ message: "Final test question not found" });
    }
    
    res.json(updatedQuestion);
  } catch (error) {
    console.error("Error updating final test question:", error);
    res.status(500).json({ message: "Failed to update final test question" });
  }
};

export const deleteFinalTestQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Delete the final test question
    const success = await storage.deleteFinalTestQuestion(parseInt(id));
    
    if (!success) {
      return res.status(404).json({ message: "Final test question not found" });
    }
    
    res.json({ message: "Final test question deleted successfully" });
  } catch (error) {
    console.error("Error deleting final test question:", error);
    res.status(500).json({ message: "Failed to delete final test question" });
  }
};