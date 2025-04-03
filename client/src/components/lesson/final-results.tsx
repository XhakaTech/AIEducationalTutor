import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Award, Home, RefreshCw } from "lucide-react";
import { useLocation } from "wouter";
import { DiplomaDialog } from '../diploma/diploma-dialog';
import confetti from 'canvas-confetti';

interface FinalResultsProps {
  lessonTitle: string;
  score: number;
  feedback: string;
  onRestart: () => void;
}

export default function FinalResults({ lessonTitle, score, feedback, onRestart }: FinalResultsProps) {
  const [, navigate] = useLocation();
  const [showDiploma, setShowDiploma] = useState(false);
  
  // Format the current date for the diploma
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  useEffect(() => {
    // Only trigger confetti if the score is good (>= 70%)
    if (score >= 70) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      
      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };
      
      const interval: NodeJS.Timeout = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        
        if (timeLeft <= 0) {
          return clearInterval(interval);
        }
        
        const particleCount = 50 * (timeLeft / duration);
        
        // Create confetti from both sides
        confetti({
          particleCount: Math.floor(randomInRange(particleCount, particleCount * 2)),
          angle: randomInRange(55, 125),
          spread: randomInRange(50, 70),
          origin: {
            x: randomInRange(0.1, 0.3),
            y: randomInRange(0.1, 0.3)
          }
        });
        
        confetti({
          particleCount: Math.floor(randomInRange(particleCount, particleCount * 2)),
          angle: randomInRange(55, 125),
          spread: randomInRange(50, 70),
          origin: {
            x: randomInRange(0.7, 0.9),
            y: randomInRange(0.1, 0.3)
          }
        });
      }, 250);
      
      return () => clearInterval(interval);
    }
  }, [score]);
  
  // Show diploma automatically if score is 100%
  useEffect(() => {
    if (score === 100) {
      const timer = setTimeout(() => {
        setShowDiploma(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [score]);
  
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-heading font-bold text-center mb-2">{lessonTitle} Complete!</h1>
      
      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center mb-6 mt-4">
        <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-sm">
          <div className="text-3xl font-bold text-primary">
            {score}%
          </div>
        </div>
      </div>
      
      <div className="mb-8 text-center">
        {score >= 90 ? (
          <div className="flex items-center text-green-600 font-medium mb-2">
            <Award className="h-5 w-5 mr-2" />
            Excellent! You're an expert!
          </div>
        ) : score >= 70 ? (
          <div className="text-blue-600 font-medium mb-2">
            Good job! You've learned a lot.
          </div>
        ) : (
          <div className="text-amber-600 font-medium mb-2">
            You've completed the course, but might want to review some topics.
          </div>
        )}
      </div>
      
      <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6 mb-8 w-full">
        <h3 className="text-lg font-medium mb-3">Feedback</h3>
        <div className="prose prose-neutral" dangerouslySetInnerHTML={{ __html: feedback }} />
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <Button variant="outline" className="flex-1" onClick={() => navigate("/")}>
          <Home className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        
        <Button variant="outline" className="flex-1" onClick={onRestart}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Restart Lesson
        </Button>
        
        {score >= 70 && (
          <Button className="flex-1" onClick={() => setShowDiploma(true)}>
            <Award className="mr-2 h-4 w-4" />
            View Diploma
          </Button>
        )}
      </div>
      
      {/* Diploma Dialog */}
      <DiplomaDialog
        lessonTitle={lessonTitle}
        completionDate={currentDate}
        score={score}
        open={showDiploma}
        onOpenChange={setShowDiploma}
      />
    </div>
  );
}