import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import LessonSidebar from "@/components/lesson/sidebar";
import ContentArea from "@/components/lesson/content-area";
import { useAuth } from "@/hooks/use-auth";
import { Bitcoin, LogOut, Menu, ChevronLeft, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { Progress } from "@/components/ui/progress";

interface LessonProps {
  lessonId: number;
}

export type LessonMode = 'learning' | 'chat' | 'quiz' | 'quiz-results' | 'final-test' | 'final-results';
export type QuizType = 'db' | 'ai';

export default function Lesson({ lessonId }: LessonProps) {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
  const [progress, setProgress] = useState<{ completed: number, total: number }>({ completed: 0, total: 0 });
  
  // Fetch lesson data with user progress
  const { data: lesson, isLoading, error } = useQuery<any>({
    queryKey: [`/api/lessons/${lessonId}`, user?.id],
    enabled: !!user,
  });

  // Reset subtopic index when topic changes
  useEffect(() => {
    setCurrentSubtopicIndex(0);
  }, [currentTopicIndex]);

  // Calculate lesson progress
  useEffect(() => {
    if (lesson && lesson.topics) {
      let total = 0;
      let completed = 0;
      
      // Count total subtopics and completed ones
      lesson.topics.forEach((topic: any) => {
        if (topic.subtopics) {
          total += topic.subtopics.length;
          
          topic.subtopics.forEach((subtopic: any) => {
            if (subtopic.progress && subtopic.progress.completed) {
              completed++;
            }
          });
        }
      });
      
      setProgress({ completed, total });
    }
  }, [lesson]);

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
      
      // Update local progress
      setProgress(prev => ({
        ...prev,
        completed: prev.completed + 1
      }));
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

  const goToDashboard = () => {
    setLocation('/');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-b from-background to-muted">
        <div className="text-center animate-fade-in">
          <div className="h-16 w-16 mx-auto border-t-4 border-primary border-solid rounded-full animate-spin"></div>
          <p className="mt-4 text-muted-foreground">Loading your lesson...</p>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted p-6">
        <div className="max-w-md mx-auto bg-white/90 rounded-xl shadow-md p-6 animate-fade-in">
          <h1 className="text-xl font-bold text-destructive mb-2">Error</h1>
          <p className="text-muted-foreground">Failed to load lesson. Please try again later.</p>
          <Button variant="outline" className="mt-4" onClick={goToDashboard}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const progressPercentage = progress.total > 0 
    ? Math.round((progress.completed / progress.total) * 100) 
    : 0;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-background to-muted overflow-hidden">
      {/* Fixed Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-md z-10 flex-shrink-0 sticky top-0 border-b border-border/40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              {isMobile ? (
                <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="mr-2">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 w-[300px]">
                    <div className="bg-white p-4 border-b flex items-center">
                      <div className="bg-primary/10 p-2 rounded-full mr-3 animate-float">
                        <Bitcoin className="h-6 w-6 text-primary" />
                      </div>
                      <span className="text-lg font-heading font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                        Crypto Academy
                      </span>
                    </div>
                    <div className="overflow-y-auto h-[calc(100vh-65px)]">
                      <LessonSidebar 
                        lesson={lesson}
                        currentTopicIndex={currentTopicIndex}
                        setCurrentTopicIndex={(index) => {
                          setCurrentTopicIndex(index);
                          setSidebarOpen(false);
                        }}
                        currentSubtopicIndex={currentSubtopicIndex}
                        setCurrentSubtopicIndex={(index) => {
                          setCurrentSubtopicIndex(index);
                          setSidebarOpen(false);
                        }}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              ) : (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="mr-2" 
                  onClick={goToDashboard}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              )}
              <div className="flex-shrink-0 flex items-center animate-float">
                <div className="bg-primary/10 p-2 rounded-full mr-3">
                  <Bitcoin className="h-6 w-6 text-primary" />
                </div>
                <span className="text-lg font-heading font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                  Crypto Academy
                </span>
              </div>
            </div>
            
            <div className="flex-1 mx-4 max-w-md hidden md:block">
              <div className="flex items-center">
                <div className="flex-shrink-0 mr-3">
                  <div className="p-2 bg-secondary/10 rounded-full">
                    <BookOpen className="h-5 w-5 text-secondary" />
                  </div>
                </div>
                <div className="w-full">
                  <div className="flex justify-between text-sm font-medium mb-1">
                    <span>{lesson.title}</span>
                    <span>{progressPercentage}% Complete</span>
                  </div>
                  <Progress 
                    value={progressPercentage} 
                    className="h-2 bg-muted" 
                  />
                </div>
              </div>
            </div>

            {user && (
              <div className="flex items-center">
                <span className="text-sm font-medium text-muted-foreground mr-4 hidden md:block">{user.name}</span>
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-medium shadow-md mr-4">
                  {user.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout} 
                  disabled={logoutMutation.isPending}
                  className="shadow-sm hover:shadow-md transition-all"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span className="hidden md:inline">
                    {logoutMutation.isPending ? "Logging out..." : "Logout"}
                  </span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <div className="flex-1 flex overflow-hidden animate-fade-in">
        {/* Sidebar - desktop only */}
        {!isMobile && (
          <div className="w-[300px] border-r border-border/40 bg-white/80 backdrop-blur-sm overflow-y-auto hidden md:block">
            <LessonSidebar 
              lesson={lesson}
              currentTopicIndex={currentTopicIndex}
              setCurrentTopicIndex={setCurrentTopicIndex}
              currentSubtopicIndex={currentSubtopicIndex}
              setCurrentSubtopicIndex={setCurrentSubtopicIndex}
            />
          </div>
        )}
        
        {/* Content area */}
        <div className="flex-1 overflow-hidden bg-white/50">
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
      </div>
    </div>
  );
}
