import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import LessonSidebar from "@/components/lesson/sidebar";
import ContentArea from "@/components/lesson/content-area";
import { useAuth } from "@/hooks/use-auth";
import { Bitcoin, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface LessonProps {
  lessonId: number;
}

export type LessonMode = 'learning' | 'chat' | 'quiz' | 'quiz-results' | 'final-test' | 'final-results';
export type QuizType = 'db' | 'ai';

export default function Lesson({ lessonId }: LessonProps) {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setLocation('/auth');
      }
    });
  };
  const [currentMode, setCurrentMode] = useState<LessonMode>('learning');
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [currentSubtopicIndex, setCurrentSubtopicIndex] = useState(0);
  const [quizType, setQuizType] = useState<QuizType>('db');
  const [quizScore, setQuizScore] = useState(0);
  
  // Fetch lesson data with user progress
  const { data: lesson, isLoading, error } = useQuery<any>({
    queryKey: [`/api/lessons/${lessonId}`, user?.id],
    enabled: !!user,
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
    if (!subtopic || !user) return;

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
          <div className="h-16 w-16 mx-auto border-t-4 border-primary border-solid rounded-full animate-spin"></div>
          <p className="mt-4 text-muted-foreground">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-neutral-50 p-6">
        <div className="max-w-md mx-auto bg-card rounded-lg shadow-md p-6">
          <h1 className="text-xl font-bold text-destructive mb-2">Error</h1>
          <p className="text-muted-foreground">Failed to load lesson. Please try again later.</p>
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
                <Bitcoin className="h-8 w-8 text-primary" />
                <span className="ml-2 text-xl font-heading font-semibold text-foreground">Crypto Academy</span>
              </div>
            </div>
            {user && (
              <div className="flex items-center">
                <span className="text-sm text-muted-foreground mr-4">{user.name}</span>
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium mr-4">
                  {user.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout} disabled={logoutMutation.isPending}>
                  <LogOut className="h-4 w-4 mr-2" />
                  {logoutMutation.isPending ? "Logging out..." : "Logout"}
                </Button>
              </div>
            )}
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
