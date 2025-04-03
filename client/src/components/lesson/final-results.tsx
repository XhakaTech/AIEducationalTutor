import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { geminiClient } from "@/main";

interface FinalResultsProps {
  score: number;
  lessonTitle: string;
}

export default function FinalResults({
  score,
  lessonTitle
}: FinalResultsProps) {
  const [_, setLocation] = useLocation();
  const [feedback, setFeedback] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  
  const isPassing = score >= 70;
  const grade = getGrade(score);
  
  // Generate personalized feedback
  useEffect(() => {
    const generateFeedback = async () => {
      setIsLoading(true);
      try {
        const feedbackText = await geminiClient.generateFeedback({
          lessonTitle,
          score,
          isPassing
        });
        setFeedback(feedbackText);
      } catch (error) {
        console.error('Error generating feedback:', error);
        setFeedback("Congratulations on completing the lesson! Your results show areas of strength and some opportunities for further learning.");
      } finally {
        setIsLoading(false);
      }
    };
    
    generateFeedback();
  }, [score, lessonTitle, isPassing]);
  
  const getGrade = (score: number): string => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };
  
  const returnToDashboard = () => {
    setLocation('/');
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="bg-neutral-50 border-b border-neutral-100 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-sm font-medium text-neutral-900">Lesson Completed</span>
          <span className="ml-2 text-xs bg-primary-100 text-primary-800 rounded-full px-2 py-0.5">
            {lessonTitle}
          </span>
        </div>
        
        <div className={`text-sm font-medium ${isPassing ? 'text-secondary-600' : 'text-accent-600'}`}>
          Final Score: {score}%
        </div>
      </div>
      
      <div className="p-6 flex-1 overflow-auto bg-neutral-50">
        <div className="max-w-3xl mx-auto">
          {/* Certificate/Achievement card */}
          <Card className="mb-8 overflow-hidden">
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-8 text-center">
              <h1 className="text-3xl font-heading font-bold mb-2">Course Completion Certificate</h1>
              <p className="text-primary-100">AI Educational Tutor</p>
            </div>
            
            <div className="p-8 text-center">
              <div className="font-heading text-neutral-800 mb-6">
                <p className="text-sm uppercase tracking-wider">This certifies that</p>
                <h2 className="text-2xl font-bold my-2">Student Name</h2>
                <p className="text-sm uppercase tracking-wider">has successfully completed</p>
                <h3 className="text-xl font-semibold my-2">{lessonTitle}</h3>
              </div>
              
              <div className="flex justify-center items-center mb-6">
                <div className={`h-24 w-24 rounded-full flex items-center justify-center text-3xl font-bold ${
                  isPassing 
                    ? 'bg-secondary-100 text-secondary-700' 
                    : 'bg-accent-100 text-accent-700'
                }`}>
                  {grade}
                </div>
              </div>
              
              <p className="text-neutral-600 text-sm">
                {isPassing 
                  ? "Great job! You've demonstrated a solid understanding of the key concepts."
                  : "You've completed the course. Consider reviewing some topics to strengthen your understanding."}
              </p>
            </div>
          </Card>
          
          {/* Feedback card */}
          <Card className="mb-8">
            <div className="p-6">
              <h2 className="text-lg font-heading font-semibold text-neutral-900 mb-4">
                Personalized Feedback
              </h2>
              
              {isLoading ? (
                <div className="flex flex-col items-center py-10">
                  <div className="h-10 w-10 border-t-4 border-primary-600 border-solid rounded-full animate-spin mb-4"></div>
                  <p className="text-neutral-500">Generating personalized feedback...</p>
                </div>
              ) : (
                <div className="prose prose-neutral max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: feedback.replace(/\n/g, '<br/>') }} />
                </div>
              )}
            </div>
          </Card>
          
          {/* Next steps */}
          <Card className="mb-8">
            <div className="p-6">
              <h2 className="text-lg font-heading font-semibold text-neutral-900 mb-4">
                What's Next?
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-primary-100 text-primary-600 p-2 rounded-full mr-4">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-neutral-900">Explore More Courses</h3>
                    <p className="text-sm text-neutral-600">Continue your learning journey with our other courses.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary-100 text-primary-600 p-2 rounded-full mr-4">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-neutral-900">Apply Your Knowledge</h3>
                    <p className="text-sm text-neutral-600">Use what you've learned in real-world scenarios.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary-100 text-primary-600 p-2 rounded-full mr-4">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-neutral-900">Share Your Achievement</h3>
                    <p className="text-sm text-neutral-600">Let others know about your accomplishment.</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
          
          {/* Back to dashboard button */}
          <div className="flex justify-center mt-8">
            <Button size="lg" onClick={returnToDashboard}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
