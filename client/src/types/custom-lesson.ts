export interface CustomLessonResource {
  id?: string; // Optional ID for reference
  title: string;
  url: string;
  type: 'article' | 'video' | 'document';
  description: string;
}

export interface CustomLessonQuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface CustomLessonSubtopic {
  id?: string; // Optional ID for reference
  title: string;
  objective: string;
  content: string;
  keyConcepts: string[];
  resources: CustomLessonResource[];
  quizQuestions: CustomLessonQuizQuestion[];
  completed?: boolean;
}

export interface CustomLessonTopic {
  id?: string; // Optional ID for reference
  title: string;
  subtopics: CustomLessonSubtopic[];
}

export interface CustomLesson {
  id: string;
  userId: number;
  title: string;
  description: string;
  topics: CustomLessonTopic[];
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  createdAt: string;
  currentTopic?: number;
  currentSubtopic?: number;
  completed?: boolean;
}