import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { geminiClient } from "@/main";
import { apiRequest } from "@/lib/queryClient";
import { QuizType } from "@/pages/lesson";
import { Loader2 } from "lucide-react";
import { UseQueryOptions } from '@tanstack/react-query';

interface QuizModeProps {
  subtopicId: number;
  quizType: QuizType;
  topicTitle: string;
  subtopicTitle: string;
  userId: number;
  onComplete: (score: number) => void;
}

interface QuizQuestion {
  id?: number;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

interface Quiz {
  questions: QuizQuestion[];
}

interface SubtopicDetails {
  id: number;
  title: string;
  objective: string;
  key_concepts: string[];
}

export default function QuizMode({
  subtopicId,
  quizType,
  topicTitle,
  subtopicTitle,
  userId,
  onComplete
}: QuizModeProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [quiz, setQuiz] = useState<Quiz>({ questions: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  
  // Fetch DB quiz questions with caching
  const { data: dbQuiz, isLoading: isDbQuizLoading } = useQuery<Quiz>({
    queryKey: [`/api/quiz/subtopic/${subtopicId}`],
    enabled: quizType === 'db' && !!subtopicId,
    staleTime: 300000, // 5 minutes
    gcTime: 1800000, // 30 minutes
  } as UseQueryOptions<Quiz>);
  
  // For AI quiz, get subtopic details
  const { data: subtopicDetails } = useQuery<SubtopicDetails>({
    queryKey: [`/api/subtopics/${subtopicId}`],
    enabled: (quizType === 'ai' || (dbQuiz && (!dbQuiz.questions || dbQuiz.questions.length === 0))) && !!subtopicId,
    staleTime: 300000,
    gcTime: 1800000,
  } as UseQueryOptions<SubtopicDetails>);

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setUserAnswers([]);
    setShowResults(false);
    setQuizScore(0);
    initQuiz();
  };
  
  const initQuiz = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // If DB quiz is available and we're in DB quiz mode, use it
      if (quizType === 'db' && dbQuiz && dbQuiz.questions && dbQuiz.questions.length > 0) {
        setQuiz({ ...dbQuiz }); // Create a new object to avoid reference issues
        setUserAnswers(Array(dbQuiz.questions.length).fill(null));
      } 
      // Otherwise generate AI quiz
      else if (subtopicDetails) {
        // Generate AI quiz
        const existingQuestions = dbQuiz?.questions?.map((q: QuizQuestion) => q.question) || [];
        const generatedQuiz = await geminiClient.generateQuiz(
          subtopicDetails.title,
          subtopicDetails.objective,
          subtopicDetails.key_concepts,
          existingQuestions
        ) as Quiz;
        
        // Validate generated quiz
        if (!generatedQuiz.questions || !Array.isArray(generatedQuiz.questions) || generatedQuiz.questions.length === 0) {
          throw new Error('Failed to generate valid quiz questions');
        }
        
        // Ensure all questions have required fields
        const validQuestions = generatedQuiz.questions.every((q: QuizQuestion) => 
          q.question && 
          Array.isArray(q.options) && 
          q.options.length === 4 &&
          typeof q.answer === 'number' &&
          q.answer >= 0 && 
          q.answer <= 3 &&
          q.explanation
        );
        
        if (!validQuestions) {
          throw new Error('Generated quiz questions are not in the correct format');
        }
        
        setQuiz(generatedQuiz);
        setUserAnswers(Array(generatedQuiz.questions.length).fill(null));
      } else {
        throw new Error('Could not load quiz questions or generate new ones');
      }
    } catch (error) {
      console.error('Error initializing quiz:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while preparing the quiz');
      // Set a fallback question
      setQuiz({
        questions: [
          {
            question: `What is the main focus of ${subtopicDetails?.title || 'this topic'}?`,
            options: [
              "Understanding core concepts",
              "Memorizing definitions",
              "Taking notes",
              "Reading documentation"
            ],
            answer: 0,
            explanation: "Understanding core concepts is essential for mastering any topic."
          }
        ]
      });
      setUserAnswers([null]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initialize quiz
  useEffect(() => {
    if (!isDbQuizLoading) {
      // If DB quiz is not available, switch to AI quiz
      if (quizType === 'db' && dbQuiz && (!dbQuiz.questions || dbQuiz.questions.length === 0)) {
        console.log('No DB quiz available, switching to AI quiz');
      }
      initQuiz();
    }
  }, [quizType, dbQuiz, subtopicDetails, isDbQuizLoading]);
  
  const getCurrentQuestion = () => {
    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
      return null;
    }
    return quiz.questions[currentQuestionIndex];
  };
  
  const isLastQuestion = () => {
    return currentQuestionIndex === quiz.questions.length - 1;
  };
  
  const selectAnswer = (index: number) => {
    setSelectedAnswer(index);
    
    // Update user answers
    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentQuestionIndex] = index;
    setUserAnswers(newUserAnswers);
  };
  
  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedAnswer(userAnswers[currentQuestionIndex - 1]);
    }
  };
  
  const nextQuestion = async () => {
    if (isLastQuestion()) {
      // Calculate score
      let correct = 0;
      for (let i = 0; i < quiz.questions.length; i++) {
        if (userAnswers[i] === quiz.questions[i].answer) {
          correct++;
        }
      }
      const score = Math.round((correct / quiz.questions.length) * 100);
      setQuizScore(score);
      setShowResults(true);
      
      // Submit quiz results
      try {
        await apiRequest('POST', '/api/quiz/submit', {
          userId,
          subtopicId,
          score,
          quizType,
          answers: userAnswers.map(a => a ?? -1), // Convert null to -1 for API
          questions: quiz.questions
        });
      } catch (error) {
        console.error('Error submitting quiz results:', error);
      }
      
      // Only notify parent if score is passing
      if (score >= 70) {
        onComplete(score);
      }
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(userAnswers[currentQuestionIndex + 1]);
    }
  };
  
  if (isLoading || isDbQuizLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 mx-auto animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">
            {quizType === 'ai' ? 'Generating quiz questions...' : 'Loading quiz...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <p className="text-red-500 mb-4">{error}</p>
          <p className="text-muted-foreground">
            Don't worry - we've prepared a backup question so you can continue learning.
          </p>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="h-full flex flex-col">
        <div className="bg-white/70 backdrop-blur-sm border-b border-border/40 px-6 py-3 sticky top-0 z-10">
          <h2 className="text-lg font-semibold">Quiz Results</h2>
        </div>
        
        <div className="flex-1 p-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className={`text-2xl font-bold mb-4 ${quizScore >= 70 ? 'text-green-600' : 'text-red-600'}`}>
              Your Score: {quizScore}%
            </div>
            
            {quizScore >= 70 ? (
              <div className="space-y-4">
                <p className="text-green-600">Congratulations! You've passed the quiz.</p>
                <Button onClick={() => onComplete(quizScore)}>Continue to Next Section</Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  You need a score of 70% or higher to proceed. Would you like to try again?
                </p>
                <Button onClick={resetQuiz}>Retry Quiz</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  const question = getCurrentQuestion();
  
  if (!question) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">No questions available</p>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col">
      {/* Quiz header */}
      <div className="bg-white/70 backdrop-blur-sm border-b border-border/40 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {quizType === 'db' ? 'Practice Quiz' : 'Challenge Quiz'}
          </span>
          <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">
            {topicTitle}
          </span>
        </div>
        
        <div className="text-sm text-muted-foreground">
          Question {currentQuestionIndex + 1} of {quiz.questions.length}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          {/* Question */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              {question.question}
            </h2>
            
            {/* Answer options */}
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <button 
                  key={index}
                  onClick={() => selectAnswer(index)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                    selectedAnswer === index 
                      ? 'bg-primary-50 border-primary-300 ring-2 ring-primary-200' 
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-start">
                    <span className={`h-5 w-5 flex items-center justify-center border rounded-full mr-3 mt-0.5 ${
                      selectedAnswer === index 
                        ? 'border-primary bg-primary text-primary-foreground' 
                        : 'border-border text-transparent'
                    }`}>
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 12 12">
                        <circle cx="6" cy="6" r="3"></circle>
                      </svg>
                    </span>
                    <span className="text-foreground">{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Quiz navigation */}
          <div className="flex items-center justify-between pt-4">
            <Button 
              variant="outline"
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>
            
            <Button 
              onClick={nextQuestion}
              disabled={selectedAnswer === null}
            >
              {isLastQuestion() ? 'Submit Quiz' : 'Next Question'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
