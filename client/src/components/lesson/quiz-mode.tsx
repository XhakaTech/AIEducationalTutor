import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { geminiClient } from "@/main";
import { apiRequest } from "@/lib/queryClient";
import { QuizType } from "@/pages/lesson";

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
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [quiz, setQuiz] = useState<{ questions: QuizQuestion[] }>({ questions: [] });
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch DB quiz questions
  const { data: dbQuiz, isLoading: isDbQuizLoading } = useQuery({
    queryKey: [`/api/quiz/subtopic/${subtopicId}`],
    enabled: quizType === 'db' && !!subtopicId,
  });
  
  // For AI quiz, get subtopic details to generate questions
  const { data: subtopicDetails } = useQuery({
    queryKey: [`/api/subtopics/${subtopicId}`],
    enabled: quizType === 'ai' && !!subtopicId,
  });
  
  // Initialize quiz
  useEffect(() => {
    const initQuiz = async () => {
      setIsLoading(true);
      
      if (quizType === 'db' && dbQuiz) {
        setQuiz(dbQuiz);
        setUserAnswers(Array(dbQuiz.questions.length).fill(null));
        setIsLoading(false);
      } else if (quizType === 'ai' && subtopicDetails) {
        try {
          // Generate AI quiz
          const existingQuestions = dbQuiz?.questions?.map((q: QuizQuestion) => q.question) || [];
          const generatedQuiz = await geminiClient.generateQuiz(
            subtopicDetails.title,
            subtopicDetails.objective,
            subtopicDetails.key_concepts,
            existingQuestions
          );
          
          setQuiz(generatedQuiz);
          setUserAnswers(Array(generatedQuiz.questions.length).fill(null));
        } catch (error) {
          console.error('Error generating AI quiz:', error);
          // Fallback
          setQuiz({
            questions: [
              {
                question: `What is the main focus of ${subtopicDetails.title}?`,
                options: ["Option A", "Option B", "Option C", "Option D"],
                answer: 0,
                explanation: "This is the correct answer based on the content."
              }
            ]
          });
          setUserAnswers([null]);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    initQuiz();
  }, [quizType, dbQuiz, subtopicDetails]);
  
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
      
      // Submit quiz results
      try {
        await apiRequest('POST', '/api/quiz/submit', {
          userId,
          subtopicId,
          score,
          quizType
        });
      } catch (error) {
        console.error('Error submitting quiz results:', error);
      }
      
      // Notify parent component
      onComplete(score);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(userAnswers[currentQuestionIndex + 1]);
    }
  };
  
  const question = getCurrentQuestion();
  
  if (isLoading || isDbQuizLoading || !question) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 mx-auto border-t-4 border-primary-600 border-solid rounded-full animate-spin"></div>
          <p className="mt-4 text-neutral-600">Loading quiz...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col">
      {/* Quiz header */}
      <div className="bg-neutral-50 border-b border-neutral-100 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-sm font-medium text-neutral-900">
            {quizType === 'db' ? 'Database Quiz' : 'AI-Generated Quiz'}
          </span>
          <span className="ml-2 text-xs bg-primary-100 text-primary-800 rounded-full px-2 py-0.5">
            {topicTitle}
          </span>
        </div>
        
        <div className="text-sm text-neutral-600">
          <span>Question {currentQuestionIndex + 1}/{quiz.questions.length}</span>
        </div>
      </div>
      
      <div className="p-6 flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto">
          {/* Question */}
          <div className="mb-8">
            <h2 className="text-xl font-heading font-semibold text-neutral-900 mb-6">
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
                      : 'border-neutral-300 hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-start">
                    <span className={`h-5 w-5 flex items-center justify-center border rounded-full mr-3 mt-0.5 ${
                      selectedAnswer === index 
                        ? 'border-primary-500 bg-primary-500 text-white' 
                        : 'border-neutral-400 text-transparent'
                    }`}>
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 12 12">
                        <circle cx="6" cy="6" r="3"></circle>
                      </svg>
                    </span>
                    <span className="text-neutral-800">{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Quiz navigation */}
          <div className="flex justify-between mt-8">
            <Button 
              variant="outline"
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0}
              className={currentQuestionIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}
            >
              <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Previous
            </Button>
            
            <Button 
              onClick={nextQuestion}
              disabled={selectedAnswer === null}
              className={selectedAnswer === null ? 'opacity-50 cursor-not-allowed' : ''}
            >
              <span>{isLastQuestion() ? 'Submit' : 'Next'}</span>
              {!isLastQuestion() ? (
                <svg className="w-5 h-5 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
