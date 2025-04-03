import {
  User, InsertUser,
  Lesson, Topic, Subtopic, Resource,
  QuizQuestion, FinalTestQuestion,
  UserProgress, InsertUserProgress,
  UserFinalTestResult, InsertUserFinalTestResult
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private lessons: Map<number, Lesson>;
  private topics: Map<number, Topic>;
  private subtopics: Map<number, Subtopic>;
  private resources: Map<number, Resource>;
  private quizQuestions: Map<number, QuizQuestion>;
  private finalTestQuestions: Map<number, FinalTestQuestion>;
  private userProgress: Map<number, UserProgress>;
  private userFinalTestResults: Map<number, UserFinalTestResult>;
  
  currentUserId: number;
  currentLessonId: number;
  currentTopicId: number;
  currentSubtopicId: number;
  currentResourceId: number;
  currentQuizQuestionId: number;
  currentFinalTestQuestionId: number;
  currentUserProgressId: number;
  currentUserFinalTestResultId: number;

  constructor() {
    this.users = new Map();
    this.lessons = new Map();
    this.topics = new Map();
    this.subtopics = new Map();
    this.resources = new Map();
    this.quizQuestions = new Map();
    this.finalTestQuestions = new Map();
    this.userProgress = new Map();
    this.userFinalTestResults = new Map();
    
    this.currentUserId = 1;
    this.currentLessonId = 1;
    this.currentTopicId = 1;
    this.currentSubtopicId = 1;
    this.currentResourceId = 1;
    this.currentQuizQuestionId = 1;
    this.currentFinalTestQuestionId = 1;
    this.currentUserProgressId = 1;
    this.currentUserFinalTestResultId = 1;
    
    this.seedData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, created_at: new Date() };
    this.users.set(id, user);
    return user;
  }
  
  // Lesson methods
  async getLessons(): Promise<Lesson[]> {
    return Array.from(this.lessons.values());
  }
  
  async getLessonById(id: number): Promise<Lesson | undefined> {
    return this.lessons.get(id);
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
    return Array.from(this.topics.values())
      .filter(topic => topic.lesson_id === lessonId)
      .sort((a, b) => a.order - b.order);
  }
  
  async getTopicById(id: number): Promise<Topic | undefined> {
    return this.topics.get(id);
  }
  
  // Subtopic methods
  async getSubtopicsByTopicId(topicId: number): Promise<Subtopic[]> {
    return Array.from(this.subtopics.values())
      .filter(subtopic => subtopic.topic_id === topicId)
      .sort((a, b) => a.order - b.order);
  }
  
  async getSubtopicById(id: number): Promise<Subtopic | undefined> {
    return this.subtopics.get(id);
  }
  
  async getSubtopicWithResources(id: number): Promise<any> {
    const subtopic = await this.getSubtopicById(id);
    if (!subtopic) return undefined;
    
    const resources = await this.getResourcesBySubtopicId(id);
    return { ...subtopic, resources };
  }
  
  // Resource methods
  async getResourcesBySubtopicId(subtopicId: number): Promise<Resource[]> {
    return Array.from(this.resources.values())
      .filter(resource => resource.subtopic_id === subtopicId);
  }
  
  async getResourceById(id: number): Promise<Resource | undefined> {
    return this.resources.get(id);
  }
  
  // Quiz methods
  async getQuizQuestionsBySubtopicId(subtopicId: number): Promise<QuizQuestion[]> {
    return Array.from(this.quizQuestions.values())
      .filter(question => question.subtopic_id === subtopicId);
  }
  
  async getFinalTestQuestionsByLessonId(lessonId: number): Promise<FinalTestQuestion[]> {
    return Array.from(this.finalTestQuestions.values())
      .filter(question => question.lesson_id === lessonId);
  }
  
  // Progress methods
  async getUserProgress(userId: number, subtopicId: number): Promise<UserProgress | undefined> {
    return Array.from(this.userProgress.values()).find(
      progress => progress.user_id === userId && progress.subtopic_id === subtopicId
    );
  }
  
  async updateUserProgress(progress: InsertUserProgress): Promise<UserProgress> {
    // Check if progress exists
    const existingProgress = await this.getUserProgress(progress.user_id, progress.subtopic_id);
    
    if (existingProgress) {
      // Update existing progress
      const updatedProgress = {
        ...existingProgress,
        ...progress,
        updated_at: new Date()
      };
      this.userProgress.set(existingProgress.id, updatedProgress);
      return updatedProgress;
    } else {
      // Create new progress
      const id = this.currentUserProgressId++;
      const newProgress: UserProgress = {
        ...progress,
        id,
        created_at: new Date(),
        updated_at: new Date()
      };
      this.userProgress.set(id, newProgress);
      return newProgress;
    }
  }
  
  async getUserProgressByUserId(userId: number): Promise<UserProgress[]> {
    return Array.from(this.userProgress.values())
      .filter(progress => progress.user_id === userId);
  }
  
  // Final test results
  async saveFinalTestResult(result: InsertUserFinalTestResult): Promise<UserFinalTestResult> {
    const id = this.currentUserFinalTestResultId++;
    const newResult: UserFinalTestResult = {
      ...result,
      id,
      completed_at: new Date()
    };
    this.userFinalTestResults.set(id, newResult);
    return newResult;
  }
  
  async getFinalTestResultByUserAndLesson(userId: number, lessonId: number): Promise<UserFinalTestResult | undefined> {
    return Array.from(this.userFinalTestResults.values()).find(
      result => result.user_id === userId && result.lesson_id === lessonId
    );
  }
  
  // Seed data for development
  private seedData() {
    // Create demo user
    const user: User = {
      id: this.currentUserId++,
      username: 'student',
      password: 'password',
      name: 'Student Name',
      email: 'student@example.com',
      created_at: new Date()
    };
    this.users.set(user.id, user);
    
    // Create a lesson
    const lesson: Lesson = {
      id: this.currentLessonId++,
      title: 'Environmental Science 101',
      description: 'Introduction to key environmental concepts and systems.',
      icon: '🌎'
    };
    this.lessons.set(lesson.id, lesson);
    
    // Create 4 topics for the lesson
    const topicTitles = ['Earth Systems', 'Ecosystems', 'Climate Science', 'Human Impact'];
    const topics: Topic[] = topicTitles.map((title, index) => {
      const topic: Topic = {
        id: this.currentTopicId++,
        lesson_id: lesson.id,
        title,
        order: index
      };
      this.topics.set(topic.id, topic);
      return topic;
    });
    
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
    
    topics.forEach((topic, topicIndex) => {
      subtopicData[topicIndex].forEach((data, subtopicIndex) => {
        const subtopic: Subtopic = {
          id: this.currentSubtopicId++,
          topic_id: topic.id,
          title: data.title,
          objective: data.objective,
          key_concepts: ['concept1', 'concept2', 'concept3'],
          order: subtopicIndex
        };
        this.subtopics.set(subtopic.id, subtopic);
        
        // Add resources for each subtopic
        const resourceTypes = ['text', 'image', 'video', 'audio'];
        resourceTypes.forEach(type => {
          const resource: Resource = {
            id: this.currentResourceId++,
            subtopic_id: subtopic.id,
            type,
            url: type === 'image' ? 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80' : '',
            description: `${subtopic.title} ${type.charAt(0).toUpperCase() + type.slice(1)}`,
            purpose: `Provides ${type} explanation of ${subtopic.title}`,
            content_tags: [subtopic.title.toLowerCase(), type, 'education'],
            recommended_when: `User needs ${type} explanation`
          };
          this.resources.set(resource.id, resource);
        });
        
        // Add quiz questions for each subtopic
        for (let i = 0; i < 5; i++) {
          const quizQuestion: QuizQuestion = {
            id: this.currentQuizQuestionId++,
            subtopic_id: subtopic.id,
            question: `Sample question ${i+1} about ${subtopic.title}?`,
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            answer: Math.floor(Math.random() * 4),
            explanation: `Explanation for sample question ${i+1}`
          };
          this.quizQuestions.set(quizQuestion.id, quizQuestion);
        }
      });
    });
    
    // Add final test questions for the lesson
    for (let i = 0; i < 10; i++) {
      const finalTestQuestion: FinalTestQuestion = {
        id: this.currentFinalTestQuestionId++,
        lesson_id: lesson.id,
        question: `Final test question ${i+1} about ${lesson.title}?`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        answer: Math.floor(Math.random() * 4),
        explanation: `Explanation for final test question ${i+1}`
      };
      this.finalTestQuestions.set(finalTestQuestion.id, finalTestQuestion);
    }
  }
}

export const storage = new MemStorage();
