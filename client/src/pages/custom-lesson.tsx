import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { CustomLesson, CustomLessonSubtopic, CustomLessonTopic } from '@/types/custom-lesson';
import { ArrowLeft, BookOpen, Menu, X, AlertCircle, Volume2, VolumeX, BookMarked, Home, CheckCircle2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { apiRequest } from '@/lib/queryClient';
import { speak, stopSpeaking } from '@/services/speech';

interface CustomLessonPageProps {
  lessonId: string;
}

export default function CustomLessonPage({ lessonId }: CustomLessonPageProps) {
  const [lesson, setLesson] = useState<CustomLesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [currentSubtopicIndex, setCurrentSubtopicIndex] = useState(0);
  const [mode, setMode] = useState<'learning' | 'quiz' | 'quiz-results'>('learning');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizResults, setQuizResults] = useState<{ correct: boolean; explanation: string }[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Load lesson from localStorage
  useEffect(() => {
    const loadLesson = () => {
      setIsLoading(true);
      try {
        const storedLessons = localStorage.getItem('customLessons');
        if (storedLessons) {
          const allStoredLessons = JSON.parse(storedLessons);
          const foundLesson = allStoredLessons.find((l: CustomLesson) => l.id === lessonId);
          
          if (foundLesson && foundLesson.userId === user?.id) {
            setLesson(foundLesson);
            
            // Set current topic and subtopic if they exist in the lesson
            if (foundLesson.currentTopic !== undefined) {
              setCurrentTopicIndex(foundLesson.currentTopic);
            }
            
            if (foundLesson.currentSubtopic !== undefined) {
              setCurrentSubtopicIndex(foundLesson.currentSubtopic);
            }
          } else {
            toast({
              title: "Lesson not found",
              description: "The requested lesson was not found or doesn't belong to you.",
              variant: "destructive"
            });
            navigate('/');
          }
        }
      } catch (error) {
        console.error('Error loading custom lesson:', error);
        toast({
          title: "Error",
          description: "Failed to load the lesson. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadLesson();
    }
  }, [lessonId, user, navigate, toast]);

  // Save lesson progress to localStorage
  const saveProgress = () => {
    if (!lesson) return;
    
    try {
      const storedLessons = localStorage.getItem('customLessons');
      if (storedLessons) {
        const allStoredLessons = JSON.parse(storedLessons);
        const updatedLessons = allStoredLessons.map((l: CustomLesson) => {
          if (l.id === lesson.id) {
            return {
              ...lesson,
              currentTopic: currentTopicIndex,
              currentSubtopic: currentSubtopicIndex
            };
          }
          return l;
        });
        
        localStorage.setItem('customLessons', JSON.stringify(updatedLessons));
      }
    } catch (error) {
      console.error('Error saving lesson progress:', error);
    }
  };

  // Save lesson completion to localStorage
  const saveSubtopicCompletion = (topicIndex: number, subtopicIndex: number) => {
    if (!lesson) return;
    
    try {
      const updatedLesson = { ...lesson };
      const topics = [...updatedLesson.topics];
      const topic = { ...topics[topicIndex] };
      const subtopics = [...topic.subtopics];
      subtopics[subtopicIndex] = { ...subtopics[subtopicIndex], completed: true };
      
      topic.subtopics = subtopics;
      topics[topicIndex] = topic;
      
      // Check if all subtopics are completed
      const allSubtopicsCompleted = topics.every(topic => 
        topic.subtopics.every(subtopic => subtopic.completed)
      );
      
      const newLesson = {
        ...updatedLesson,
        topics,
        completed: allSubtopicsCompleted
      };
      
      setLesson(newLesson);
      
      // Update in localStorage
      const storedLessons = localStorage.getItem('customLessons');
      if (storedLessons) {
        const allStoredLessons = JSON.parse(storedLessons);
        const updatedLessons = allStoredLessons.map((l: CustomLesson) => {
          if (l.id === lesson.id) {
            return newLesson;
          }
          return l;
        });
        
        localStorage.setItem('customLessons', JSON.stringify(updatedLessons));
      }
    } catch (error) {
      console.error('Error saving subtopic completion:', error);
    }
  };

  // Navigate to the next subtopic
  const goToNextSubtopic = () => {
    if (!lesson) return;
    
    // Mark current subtopic as completed
    saveSubtopicCompletion(currentTopicIndex, currentSubtopicIndex);
    
    // Check if there are more subtopics in the current topic
    if (currentSubtopicIndex < lesson.topics[currentTopicIndex].subtopics.length - 1) {
      setCurrentSubtopicIndex(currentSubtopicIndex + 1);
    } else {
      // Check if there are more topics
      if (currentTopicIndex < lesson.topics.length - 1) {
        setCurrentTopicIndex(currentTopicIndex + 1);
        setCurrentSubtopicIndex(0);
      } else {
        // End of lesson
        toast({
          title: "Congratulations!",
          description: "You've completed this custom lesson."
        });
      }
    }
    
    // Reset mode and scroll to top
    setMode('learning');
    contentRef.current?.scrollTo(0, 0);
    saveProgress();
  };

  // Handle quiz submissions
  const handleQuizSubmit = () => {
    if (!lesson) return;
    
    const currentSubtopic = lesson.topics[currentTopicIndex].subtopics[currentSubtopicIndex];
    const results = quizAnswers.map((answer, index) => {
      const question = currentSubtopic.quizQuestions[index];
      return {
        correct: answer === question.correctAnswer,
        explanation: question.explanation
      };
    });
    
    setQuizResults(results);
    setMode('quiz-results');
    
    // Calculate score
    const score = results.filter(r => r.correct).length / results.length * 100;
    
    // If score is good enough, mark as completed
    if (score >= 70) {
      saveSubtopicCompletion(currentTopicIndex, currentSubtopicIndex);
    }
  };

  // Handle quiz option selection
  const handleQuizOptionSelect = (questionIndex: number, optionIndex: number) => {
    setQuizAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[questionIndex] = optionIndex;
      return newAnswers;
    });
  };

  // Start quiz
  const startQuiz = () => {
    if (!lesson) return;
    
    // Initialize quiz answers array
    const currentSubtopic = lesson.topics[currentTopicIndex].subtopics[currentSubtopicIndex];
    setQuizAnswers(Array(currentSubtopic.quizQuestions.length).fill(-1));
    setQuizResults([]);
    setMode('quiz');
    contentRef.current?.scrollTo(0, 0);
  };

  // Toggle speech
  const toggleSpeech = async () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    
    if (!lesson) return;
    
    const currentSubtopic = lesson.topics[currentTopicIndex].subtopics[currentSubtopicIndex];
    
    try {
      setIsSpeaking(true);
      
      // Use the API to optimize the text for speech
      const response = await apiRequest('POST', '/api/speak', {
        text: currentSubtopic.content.replace(/<[^>]*>/g, ' ')
      });
      
      const data = await response.json();
      
      // Speak the optimized text
      await speak(data.optimizedText);
    } catch (error) {
      console.error('Error with text-to-speech:', error);
      toast({
        title: "Speech Error",
        description: "Failed to convert text to speech. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSpeaking(false);
    }
  };

  // Navigate to home
  const goToHome = () => {
    stopSpeaking();
    saveProgress();
    navigate('/');
  };

  // Navigate to specific topic and subtopic
  const navigateTo = (topicIndex: number, subtopicIndex: number) => {
    if (!lesson) return;
    
    setCurrentTopicIndex(topicIndex);
    setCurrentSubtopicIndex(subtopicIndex);
    setMode('learning');
    contentRef.current?.scrollTo(0, 0);
    saveProgress();
    setIsSidebarOpen(false);
  };

  if (isLoading || !lesson) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="h-16 w-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  const currentTopic = lesson.topics[currentTopicIndex];
  const currentSubtopic = currentTopic.subtopics[currentSubtopicIndex];
  
  // Calculate overall progress
  const totalSubtopics = lesson.topics.reduce((sum, topic) => sum + topic.subtopics.length, 0);
  const completedSubtopics = lesson.topics.reduce(
    (sum, topic) => sum + topic.subtopics.filter(subtopic => subtopic.completed).length, 
    0
  );
  const progressPercentage = totalSubtopics === 0 ? 0 : Math.round((completedSubtopics / totalSubtopics) * 100);

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      {/* Mobile Sidebar Toggle */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full bg-white shadow-md"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>
      
      {/* Sidebar */}
      <div 
        className={`fixed inset-0 z-40 bg-black/50 md:hidden transition-opacity duration-200 ${
          isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />
      
      <div 
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-white shadow-lg md:sticky md:shadow-none transition-transform duration-300 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 border-b">
          <div className="flex items-center mb-4">
            <BookMarked className="h-6 w-6 text-primary mr-2" />
            <h1 className="text-lg font-semibold">Course Content</h1>
          </div>
          
          <Button variant="outline" size="sm" className="w-full justify-start mb-2" onClick={goToHome}>
            <Home className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="text-sm text-muted-foreground mb-4">
            <p>Progress: {progressPercentage}%</p>
            <Progress value={progressPercentage} className="h-2 mt-1" />
          </div>
        </div>
        
        <ScrollArea className="h-[calc(100vh-180px)] pb-6">
          <div className="p-4">
            <Accordion type="multiple" defaultValue={[`topic-${currentTopicIndex}`]} className="w-full">
              {lesson.topics.map((topic, topicIndex) => (
                <AccordionItem key={topicIndex} value={`topic-${topicIndex}`} className="border-b-0">
                  <AccordionTrigger className={`${topicIndex === currentTopicIndex ? 'font-medium text-primary' : ''}`}>
                    <div className="text-left">
                      <div className="text-sm">{topic.title}</div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="ml-2 border-l-2 border-muted pl-2 space-y-1">
                      {topic.subtopics.map((subtopic, subtopicIndex) => (
                        <div 
                          key={subtopicIndex}
                          className={`text-sm py-2 px-2 rounded-md cursor-pointer flex items-center justify-between ${
                            topicIndex === currentTopicIndex && subtopicIndex === currentSubtopicIndex
                              ? 'bg-primary/10 text-primary'
                              : 'hover:bg-muted/50'
                          }`}
                          onClick={() => navigateTo(topicIndex, subtopicIndex)}
                        >
                          <span className="line-clamp-1">{subtopic.title}</span>
                          {subtopic.completed && (
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </ScrollArea>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm p-4 border-b z-10 sticky top-0">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" onClick={goToHome} className="mr-2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <div className="hidden md:block">
                <span className="text-sm text-muted-foreground">
                  {lesson.title} / {currentTopic.title} / {currentSubtopic.title}
                </span>
              </div>
            </div>
            
            {mode === 'learning' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleSpeech}
                className="gap-1"
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="h-4 w-4" />
                    Mute
                  </>
                ) : (
                  <>
                    <Volume2 className="h-4 w-4" />
                    Listen
                  </>
                )}
              </Button>
            )}
          </div>
        </header>
        
        {/* Content Area */}
        <ScrollArea className="flex-1" ref={contentRef}>
          <div className="max-w-4xl mx-auto p-6">
            {mode === 'learning' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold mb-2">{currentSubtopic.title}</h1>
                  <p className="text-muted-foreground">{currentSubtopic.objective}</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div 
                    className="prose prose-blue max-w-none" 
                    dangerouslySetInnerHTML={{ __html: currentSubtopic.content }} 
                  />
                </div>
                
                {currentSubtopic.keyConcepts.length > 0 && (
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-800 mb-3">Key Concepts</h3>
                    <ul className="space-y-2">
                      {currentSubtopic.keyConcepts.map((concept, index) => (
                        <li key={index} className="text-blue-700">
                          {concept}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {currentSubtopic.resources.length > 0 && (
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">Additional Resources</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentSubtopic.resources.map((resource, index) => (
                        <a 
                          key={index}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-4 border rounded-lg hover:shadow-md transition-shadow"
                        >
                          <h4 className="font-medium mb-1">{resource.title}</h4>
                          <p className="text-sm text-muted-foreground">{resource.description}</p>
                          <span className="text-xs text-primary mt-2 inline-block">
                            {resource.type}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between pt-4">
                  <Button 
                    variant="outline" 
                    onClick={goToHome}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                  
                  <Button onClick={startQuiz}>
                    Test Your Knowledge
                  </Button>
                </div>
              </div>
            )}
            
            {mode === 'quiz' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold mb-2">Quiz: {currentSubtopic.title}</h1>
                  <p className="text-muted-foreground">Test your understanding of the key concepts.</p>
                </div>
                
                <div className="space-y-8">
                  {currentSubtopic.quizQuestions.map((question, qIndex) => (
                    <div key={qIndex} className="bg-white p-6 rounded-lg shadow-sm">
                      <h3 className="text-lg font-medium mb-4">
                        Question {qIndex + 1}: {question.question}
                      </h3>
                      
                      <div className="space-y-3">
                        {question.options.map((option, oIndex) => (
                          <div 
                            key={oIndex}
                            onClick={() => handleQuizOptionSelect(qIndex, oIndex)}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                              quizAnswers[qIndex] === oIndex 
                                ? 'border-primary bg-primary/5' 
                                : 'hover:border-muted-foreground/50'
                            }`}
                          >
                            <div className="flex items-start">
                              <div className={`h-5 w-5 rounded-full border flex-shrink-0 flex items-center justify-center mr-3 ${
                                quizAnswers[qIndex] === oIndex ? 'border-primary' : 'border-muted-foreground'
                              }`}>
                                {quizAnswers[qIndex] === oIndex && (
                                  <div className="h-3 w-3 rounded-full bg-primary" />
                                )}
                              </div>
                              <span>{option}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                <Alert variant="default" className="bg-blue-50 border-blue-200">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-800">Quiz Tips</AlertTitle>
                  <AlertDescription className="text-blue-700">
                    Select the best answer for each question. You can review your answers before submitting.
                  </AlertDescription>
                </Alert>
                
                <div className="flex justify-between pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setMode('learning');
                      contentRef.current?.scrollTo(0, 0);
                    }}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Lesson
                  </Button>
                  
                  <Button 
                    onClick={handleQuizSubmit}
                    disabled={quizAnswers.some(ans => ans === -1)}
                  >
                    Submit Answers
                  </Button>
                </div>
              </div>
            )}
            
            {mode === 'quiz-results' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold mb-2">Quiz Results: {currentSubtopic.title}</h1>
                  <p className="text-muted-foreground">Review your answers and explanations.</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-4">Your Score</h3>
                  
                  <div className="text-3xl font-bold mb-2 flex items-center">
                    {quizResults.filter(r => r.correct).length} / {quizResults.length}
                    <span className="ml-2 text-lg text-muted-foreground font-normal">
                      ({Math.round(quizResults.filter(r => r.correct).length / quizResults.length * 100)}%)
                    </span>
                  </div>
                  
                  <Progress 
                    value={quizResults.filter(r => r.correct).length / quizResults.length * 100} 
                    className="h-3"
                  />
                  
                  {quizResults.filter(r => r.correct).length / quizResults.length >= 0.7 ? (
                    <Alert className="mt-4 bg-green-50 border-green-200">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertTitle className="text-green-800">Great job!</AlertTitle>
                      <AlertDescription className="text-green-700">
                        You've passed this quiz. Feel free to continue to the next subtopic.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert className="mt-4 bg-amber-50 border-amber-200">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <AlertTitle className="text-amber-800">Keep practicing</AlertTitle>
                      <AlertDescription className="text-amber-700">
                        Review the content and try again to improve your score.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
                
                <div className="space-y-8">
                  <h3 className="text-lg font-semibold mt-4">Detailed Results</h3>
                  
                  {currentSubtopic.quizQuestions.map((question, qIndex) => (
                    <div key={qIndex} className={`bg-white p-6 rounded-lg shadow-sm ${
                      quizResults[qIndex]?.correct ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'
                    }`}>
                      <h4 className="text-lg font-medium mb-3">
                        Question {qIndex + 1}: {question.question}
                      </h4>
                      
                      <div className="mb-4 space-y-3">
                        {question.options.map((option, oIndex) => (
                          <div 
                            key={oIndex}
                            className={`p-3 rounded-md ${
                              oIndex === question.correctAnswer && oIndex === quizAnswers[qIndex]
                                ? 'bg-green-100'
                                : oIndex === question.correctAnswer
                                  ? 'bg-green-50 border border-green-200'
                                  : oIndex === quizAnswers[qIndex]
                                    ? 'bg-red-50 border border-red-200'
                                    : 'bg-gray-50'
                            }`}
                          >
                            <div className="flex items-start">
                              <div className={`h-5 w-5 rounded-full flex-shrink-0 flex items-center justify-center mr-3 ${
                                oIndex === question.correctAnswer
                                  ? 'bg-green-500 text-white'
                                  : oIndex === quizAnswers[qIndex]
                                    ? 'bg-red-500 text-white'
                                    : 'bg-gray-200'
                              }`}>
                                {oIndex === question.correctAnswer && (
                                  <Check className="h-3 w-3" />
                                )}
                                {oIndex === quizAnswers[qIndex] && oIndex !== question.correctAnswer && (
                                  <X className="h-3 w-3" />
                                )}
                              </div>
                              <span>{option}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4 p-4 bg-blue-50 rounded-md">
                        <h5 className="text-sm font-medium text-blue-800 mb-1">Explanation:</h5>
                        <p className="text-sm text-blue-700">{question.explanation}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setMode('learning');
                      contentRef.current?.scrollTo(0, 0);
                    }}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Lesson
                  </Button>
                  
                  <Button onClick={goToNextSubtopic}>
                    {quizResults.filter(r => r.correct).length / quizResults.length >= 0.7
                      ? 'Continue to Next Subtopic'
                      : 'Retry Quiz'
                    }
                  </Button>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}