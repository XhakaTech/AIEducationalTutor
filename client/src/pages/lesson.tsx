import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import LessonSidebar from "@/components/lesson/sidebar";
import ContentArea from "@/components/lesson/content-area";

interface LessonProps {
  lessonId: number;
  user: any;
}

export type LessonMode = 'learning' | 'chat' | 'quiz' | 'quiz-results' | 'final-test' | 'final-results';
export type QuizType = 'db' | 'ai';

export default function Lesson({ lessonId, user }: LessonProps) {
  const [currentMode, setCurrentMode] = useState<LessonMode>('learning');
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [currentSubtopicIndex, setCurrentSubtopicIndex] = useState(0);
  const [quizType, setQuizType] = useState<QuizType>('db');
  const [quizScore, setQuizScore] = useState(0);
  
  // Fetch lesson data with user progress
  const { data: lesson, isLoading, error } = useQuery({
    queryKey: [`/api/lessons/${lessonId}?userId=${user.id}`],
  });

  // Reset subtopic index when topic changes
  useEffect(() => {
    setCurrentSubtopicIndex(0);
  }, [currentTopicIndex]);

  const getCurrentTopic = () => {
    if (!lesson || !lesson.topics || lesson.topics.length === 0) {
      return null;
    }
    return lesson.topics[currentTopicIndex];
  };

  const getCurrentSubtopic = () => {
    const topic = getCurrentTopic();
    if (!topic || !topic.subtopics || topic.subtopics.length === 0) {
      return null;
    }
    return topic.subtopics[currentSubtopicIndex];
  };

  const handleNext = () => {
    const topic = getCurrentTopic();
    if (!topic) return;

    // If we're at the last subtopic of the topic
    if (currentSubtopicIndex === topic.subtopics.length - 1) {
      // Open chat before quiz
      setCurrentMode('chat');
    } else {
      // Mark current subtopic as completed and move to next
      markSubtopicAsCompleted();
      setCurrentSubtopicIndex(prev => prev + 1);
    }
  };

  const markSubtopicAsCompleted = async () => {
    const subtopic = getCurrentSubtopic();
    if (!subtopic) return;

    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          subtopicId: subtopic.id,
          completed: true
        })
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const startQuiz = () => {
    setCurrentMode('quiz');
    setQuizType('db');
  };

  const handleQuizComplete = (score: number) => {
    setQuizScore(score);
    setCurrentMode('quiz-results');
  };

  const continueAfterQuiz = () => {
    if (quizType === 'db') {
      // After DB quiz, start AI quiz
      setQuizType('ai');
      setCurrentMode('quiz');
    } else {
      // After AI quiz
      if (quizScore >= 70) {
        const topic = getCurrentTopic();
        
        // Mark current subtopic as completed
        markSubtopicAsCompleted();
        
        // Check if we're at the last subtopic of the last topic
        if (
          currentTopicIndex === lesson.topics.length - 1 && 
          currentSubtopicIndex === topic.subtopics.length - 1
        ) {
          // Start final test
          setCurrentMode('final-test');
        } 
        // Check if we're at the last subtopic of the current topic
        else if (currentSubtopicIndex === topic.subtopics.length - 1) {
          // Move to first subtopic of next topic
          setCurrentTopicIndex(prev => prev + 1);
          setCurrentSubtopicIndex(0);
          setCurrentMode('learning');
        } else {
          // Move to next subtopic
          setCurrentSubtopicIndex(prev => prev + 1);
          setCurrentMode('learning');
        }
      } else {
        // Failed - review subtopic
        setCurrentMode('learning');
      }
    }
  };

  const handleFinalTestComplete = (score: number) => {
    setQuizScore(score);
    setCurrentMode('final-results');
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="h-16 w-16 mx-auto border-t-4 border-primary-600 border-solid rounded-full animate-spin"></div>
          <p className="mt-4 text-neutral-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-neutral-50 p-6">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
          <h1 className="text-xl font-bold text-red-500 mb-2">Error</h1>
          <p className="text-neutral-600">Failed to load lesson. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <svg className="h-8 w-8 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3L1 9L5 11.18V17.18L12 21L19 17.18V11.18L21 10.09V17H23V9L12 3ZM18.82 9L12 12.72L5.18 9L12 5.28L18.82 9ZM17 15.99L12 18.72L7 15.99V12.27L12 15L17 12.27V15.99Z"></path>
                </svg>
                <span className="ml-2 text-xl font-heading font-semibold text-neutral-900">AI Educational Tutor</span>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-neutral-600 mr-4">{user.name}</span>
              <div className="h-8 w-8 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 font-medium">
                {user.name.split(' ').map((n: string) => n[0]).join('')}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          <LessonSidebar 
            lesson={lesson}
            currentTopicIndex={currentTopicIndex}
            setCurrentTopicIndex={setCurrentTopicIndex}
            currentSubtopicIndex={currentSubtopicIndex}
            setCurrentSubtopicIndex={setCurrentSubtopicIndex}
          />
          
          <ContentArea 
            lesson={lesson}
            currentMode={currentMode}
            currentTopicIndex={currentTopicIndex}
            currentSubtopicIndex={currentSubtopicIndex}
            quizType={quizType}
            quizScore={quizScore}
            user={user}
            onNext={handleNext}
            onStartQuiz={startQuiz}
            onQuizComplete={handleQuizComplete}
            onContinueAfterQuiz={continueAfterQuiz}
            onFinalTestComplete={handleFinalTestComplete}
          />
        </div>
      </main>
    </div>
  );
}
