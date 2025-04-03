import { Button } from "@/components/ui/button";
import { QuizType } from "@/pages/lesson";

interface QuizResultsProps {
  score: number;
  quizType: QuizType;
  topicTitle: string;
  onContinue: () => void;
}

export default function QuizResults({
  score,
  quizType,
  topicTitle,
  onContinue
}: QuizResultsProps) {
  const isPassing = score >= 70;
  
  const getNextText = () => {
    if (quizType === 'db') {
      return 'Continue to AI Quiz';
    } else {
      return isPassing ? 'Continue to Next Subtopic' : 'Review Subtopic';
    }
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="bg-neutral-50 border-b border-neutral-100 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-sm font-medium text-neutral-900">Quiz Results</span>
          <span className="ml-2 text-xs bg-primary-100 text-primary-800 rounded-full px-2 py-0.5">
            {topicTitle}
          </span>
        </div>
        
        <div className={`text-sm font-medium ${isPassing ? 'text-secondary-600' : 'text-accent-600'}`}>
          Score: {score}%
        </div>
      </div>
      
      <div className="p-6 flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto">
          {/* Results summary */}
          <div className="bg-white border border-neutral-200 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-heading font-semibold text-neutral-900">Quiz Performance</h2>
              <div className={`h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold ${
                isPassing ? 'bg-secondary-100 text-secondary-700' : 'bg-accent-100 text-accent-700'
              }`}>
                {score}%
              </div>
            </div>
            
            <div className="prose prose-sm max-w-none">
              {isPassing ? (
                <>
                  <p>Great job! You've demonstrated a good understanding of this subtopic. Here's a summary of your performance:</p>
                  <ul>
                    <li>You correctly answered <strong>{Math.round(score / 20)} out of 5</strong> questions.</li>
                    <li>You showed excellent understanding of the key concepts.</li>
                    <li>Ready to move forward with confidence!</li>
                  </ul>
                </>
              ) : (
                <>
                  <p>You're making progress in understanding this subtopic, but there are some areas that need more review:</p>
                  <ul>
                    <li>You correctly answered <strong>{Math.round(score / 20)} out of 5</strong> questions.</li>
                    <li>You showed good understanding of basic concepts.</li>
                    <li>I recommend reviewing the content again before proceeding to ensure you have a solid foundation.</li>
                  </ul>
                </>
              )}
            </div>
          </div>
          
          {/* Continue button */}
          <div className="mt-8 flex justify-end">
            <Button onClick={onContinue}>
              <span>{getNextText()}</span>
              <svg className="w-5 h-5 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
