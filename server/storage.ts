import {
  User, InsertUser,
  Lesson, Topic, Subtopic, Resource,
  QuizQuestion, FinalTestQuestion,
  UserProgress, InsertUserProgress,
  UserFinalTestResult, InsertUserFinalTestResult,
  users, lessons, topics, subtopics, resources, quizQuestions, finalTestQuestions, userProgress, userFinalTestResults
} from "@shared/schema";
import { db } from "./db";
import { eq, and, asc, desc } from "drizzle-orm";

// Modify the interface with any CRUD methods you might need
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Lesson methods
  getLessons(): Promise<Lesson[]>;
  getLessonById(id: number): Promise<Lesson | undefined>;
  getLessonWithDetails(id: number): Promise<any>; // Full lesson with topics, subtopics
  
  // Topic methods
  getTopicsByLessonId(lessonId: number): Promise<Topic[]>;
  getTopicById(id: number): Promise<Topic | undefined>;
  
  // Subtopic methods
  getSubtopicsByTopicId(topicId: number): Promise<Subtopic[]>;
  getSubtopicById(id: number): Promise<Subtopic | undefined>;
  getSubtopicWithResources(id: number): Promise<any>; // Subtopic with resources
  
  // Resource methods
  getResourcesBySubtopicId(subtopicId: number): Promise<Resource[]>;
  getResourceById(id: number): Promise<Resource | undefined>;
  
  // Quiz methods
  getQuizQuestionsBySubtopicId(subtopicId: number): Promise<QuizQuestion[]>;
  getFinalTestQuestionsByLessonId(lessonId: number): Promise<FinalTestQuestion[]>;
  
  // Progress methods
  getUserProgress(userId: number, subtopicId: number): Promise<UserProgress | undefined>;
  updateUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  getUserProgressByUserId(userId: number): Promise<UserProgress[]>;
  
  // Final test results
  saveFinalTestResult(result: InsertUserFinalTestResult): Promise<UserFinalTestResult>;
  getFinalTestResultByUserAndLesson(userId: number, lessonId: number): Promise<UserFinalTestResult | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Lesson methods
  async getLessons(): Promise<Lesson[]> {
    return await db.select().from(lessons);
  }
  
  async getLessonById(id: number): Promise<Lesson | undefined> {
    const [lesson] = await db.select().from(lessons).where(eq(lessons.id, id));
    return lesson;
  }
  
  async getLessonWithDetails(id: number): Promise<any> {
    const lesson = await this.getLessonById(id);
    if (!lesson) return undefined;
    
    const topics = await this.getTopicsByLessonId(id);
    const topicsWithSubtopics = await Promise.all(
      topics.map(async (topic) => {
        const subtopics = await this.getSubtopicsByTopicId(topic.id);
        const subtopicsWithResources = await Promise.all(
          subtopics.map(async (subtopic) => {
            const resources = await this.getResourcesBySubtopicId(subtopic.id);
            return { ...subtopic, resources };
          })
        );
        return { ...topic, subtopics: subtopicsWithResources };
      })
    );
    
    return { ...lesson, topics: topicsWithSubtopics };
  }
  
  // Topic methods
  async getTopicsByLessonId(lessonId: number): Promise<Topic[]> {
    return await db.select()
      .from(topics)
      .where(eq(topics.lesson_id, lessonId))
      .orderBy(asc(topics.order));
  }
  
  async getTopicById(id: number): Promise<Topic | undefined> {
    const [topic] = await db.select().from(topics).where(eq(topics.id, id));
    return topic;
  }
  
  // Subtopic methods
  async getSubtopicsByTopicId(topicId: number): Promise<Subtopic[]> {
    return await db.select()
      .from(subtopics)
      .where(eq(subtopics.topic_id, topicId))
      .orderBy(asc(subtopics.order));
  }
  
  async getSubtopicById(id: number): Promise<Subtopic | undefined> {
    const [subtopic] = await db.select().from(subtopics).where(eq(subtopics.id, id));
    return subtopic;
  }
  
  async getSubtopicWithResources(id: number): Promise<any> {
    const subtopic = await this.getSubtopicById(id);
    if (!subtopic) return undefined;
    
    const resources = await this.getResourcesBySubtopicId(id);
    return { ...subtopic, resources };
  }
  
  // Resource methods
  async getResourcesBySubtopicId(subtopicId: number): Promise<Resource[]> {
    return await db.select()
      .from(resources)
      .where(eq(resources.subtopic_id, subtopicId));
  }
  
  async getResourceById(id: number): Promise<Resource | undefined> {
    const [resource] = await db.select().from(resources).where(eq(resources.id, id));
    return resource;
  }
  
  // Quiz methods
  async getQuizQuestionsBySubtopicId(subtopicId: number): Promise<QuizQuestion[]> {
    return await db.select()
      .from(quizQuestions)
      .where(eq(quizQuestions.subtopic_id, subtopicId));
  }
  
  async getFinalTestQuestionsByLessonId(lessonId: number): Promise<FinalTestQuestion[]> {
    return await db.select()
      .from(finalTestQuestions)
      .where(eq(finalTestQuestions.lesson_id, lessonId));
  }
  
  // Progress methods
  async getUserProgress(userId: number, subtopicId: number): Promise<UserProgress | undefined> {
    const [progress] = await db.select()
      .from(userProgress)
      .where(
        and(
          eq(userProgress.user_id, userId),
          eq(userProgress.subtopic_id, subtopicId)
        )
      );
    return progress;
  }
  
  async updateUserProgress(progress: InsertUserProgress): Promise<UserProgress> {
    // Check if progress exists
    const existingProgress = await this.getUserProgress(progress.user_id, progress.subtopic_id);
    
    if (existingProgress) {
      // Update existing progress
      const [updatedProgress] = await db.update(userProgress)
        .set({
          ...progress,
          updated_at: new Date()
        })
        .where(eq(userProgress.id, existingProgress.id))
        .returning();
      return updatedProgress;
    } else {
      // Create new progress
      const [newProgress] = await db.insert(userProgress)
        .values({
          ...progress,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning();
      return newProgress;
    }
  }
  
  async getUserProgressByUserId(userId: number): Promise<UserProgress[]> {
    return await db.select()
      .from(userProgress)
      .where(eq(userProgress.user_id, userId));
  }
  
  // Final test results
  async saveFinalTestResult(result: InsertUserFinalTestResult): Promise<UserFinalTestResult> {
    const [newResult] = await db.insert(userFinalTestResults)
      .values({
        ...result,
        completed_at: new Date()
      })
      .returning();
    return newResult;
  }
  
  async getFinalTestResultByUserAndLesson(userId: number, lessonId: number): Promise<UserFinalTestResult | undefined> {
    const [result] = await db.select()
      .from(userFinalTestResults)
      .where(
        and(
          eq(userFinalTestResults.user_id, userId),
          eq(userFinalTestResults.lesson_id, lessonId)
        )
      );
    return result;
  }
}

// Create seed data function which can be used to initialize a new database
export async function seedDatabase() {
  try {
    // Check if database has been seeded already
    const existingUsers = await db.select().from(users);
    if (existingUsers.length > 0) {
      console.log('Database already seeded');
      return;
    }

    // Create demo user
    const [user] = await db.insert(users).values({
      username: 'student',
      password: 'password',
      name: 'Student Name',
      email: 'student@example.com'
    }).returning();
    
    // Create a lesson
    const [lesson] = await db.insert(lessons).values({
      title: 'Environmental Science 101',
      description: 'Introduction to key environmental concepts and systems.',
      icon: '🌎'
    }).returning();
    
    // Create 4 topics for the lesson
    const topicTitles = ['Earth Systems', 'Ecosystems', 'Climate Science', 'Human Impact'];
    const createdTopics: Topic[] = [];
    
    for (let i = 0; i < topicTitles.length; i++) {
      const [topic] = await db.insert(topics).values({
        lesson_id: lesson.id,
        title: topicTitles[i],
        order: i
      }).returning();
      createdTopics.push(topic);
    }
    
    // For each topic, create 4 subtopics
    const subtopicData = [
      [
        { title: 'The Carbon Cycle', objective: 'Understand how carbon moves through Earth\'s systems' },
        { title: 'The Water Cycle', objective: 'Understand how water moves through Earth\'s systems' },
        { title: 'The Nitrogen Cycle', objective: 'Understand how nitrogen moves through Earth\'s systems' },
        { title: 'The Rock Cycle', objective: 'Understand how rocks transform through different processes' }
      ],
      [
        { title: 'Ecosystem Components', objective: 'Identify biotic and abiotic components of ecosystems' },
        { title: 'Energy Flow', objective: 'Understand how energy moves through ecosystems' },
        { title: 'Food Webs', objective: 'Model relationships between organisms in ecosystems' },
        { title: 'Ecosystem Services', objective: 'Understand how ecosystems benefit humans' }
      ],
      [
        { title: 'The Greenhouse Effect', objective: 'Understand how greenhouse gases trap heat' },
        { title: 'Climate vs. Weather', objective: 'Distinguish between climate and weather patterns' },
        { title: 'Climate Change Evidence', objective: 'Analyze evidence for climate change' },
        { title: 'Climate Solutions', objective: 'Evaluate potential solutions to climate change' }
      ],
      [
        { title: 'Pollution Types', objective: 'Categorize different types of pollution' },
        { title: 'Resource Depletion', objective: 'Understand how humans deplete natural resources' },
        { title: 'Conservation Strategies', objective: 'Evaluate strategies for conserving resources' },
        { title: 'Sustainable Development', objective: 'Define and apply principles of sustainability' }
      ]
    ];
    
    for (let topicIndex = 0; topicIndex < createdTopics.length; topicIndex++) {
      const topic = createdTopics[topicIndex];
      
      for (let subtopicIndex = 0; subtopicIndex < subtopicData[topicIndex].length; subtopicIndex++) {
        const data = subtopicData[topicIndex][subtopicIndex];
        
        // Create subtopic
        const [subtopic] = await db.insert(subtopics).values({
          topic_id: topic.id,
          title: data.title,
          objective: data.objective,
          key_concepts: ['concept1', 'concept2', 'concept3'],
          order: subtopicIndex
        }).returning();
        
        // Add resources for each subtopic
        const resourceTypes = ['text', 'image', 'video', 'audio'];
        for (const type of resourceTypes) {
          await db.insert(resources).values({
            subtopic_id: subtopic.id,
            type,
            url: type === 'image' ? 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80' : '',
            description: `${subtopic.title} ${type.charAt(0).toUpperCase() + type.slice(1)}`,
            purpose: `Provides ${type} explanation of ${subtopic.title}`,
            content_tags: [subtopic.title.toLowerCase(), type, 'education'],
            recommended_when: `User needs ${type} explanation`
          });
        }
        
        // Add quiz questions for each subtopic
        for (let i = 0; i < 5; i++) {
          await db.insert(quizQuestions).values({
            subtopic_id: subtopic.id,
            question: `Sample question ${i+1} about ${subtopic.title}?`,
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            answer: Math.floor(Math.random() * 4),
            explanation: `Explanation for sample question ${i+1}`
          });
        }
      }
    }
    
    // Add final test questions for the lesson
    for (let i = 0; i < 10; i++) {
      await db.insert(finalTestQuestions).values({
        lesson_id: lesson.id,
        question: `Final test question ${i+1} about ${lesson.title}?`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        answer: Math.floor(Math.random() * 4),
        explanation: `Explanation for final test question ${i+1}`
      });
    }
    
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Use the DatabaseStorage implementation
export const storage = new DatabaseStorage();
