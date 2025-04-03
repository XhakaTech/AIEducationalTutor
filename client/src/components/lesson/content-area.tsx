import { Card } from "@/components/ui/card";
import { LessonMode, QuizType } from "@/pages/lesson";
import LearningMode from "./learning-mode";
import ChatMode from "./chat-mode";
import QuizMode from "./quiz-mode";
import QuizResults from "./quiz-results";
import FinalTest from "./final-test";
import FinalResults from "./final-results";

interface ContentAreaProps {
  lesson: any;
  currentMode: LessonMode;
  currentTopicIndex: number;
  currentSubtopicIndex: number;
  quizType: QuizType;
  quizScore: number;
  user: any;
  onNext: () => void;
  onStartQuiz: () => void;
  onQuizComplete: (score: number) => void;
  onContinueAfterQuiz: () => void;
  onFinalTestComplete: (score: number) => void;
}

export default function ContentArea({
  lesson,
  currentMode,
  currentTopicIndex,
  currentSubtopicIndex,
  quizType,
  quizScore,
  user,
  onNext,
  onStartQuiz,
  onQuizComplete,
  onContinueAfterQuiz,
  onFinalTestComplete
}: ContentAreaProps) {
  
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
  
  return (
    <Card className="flex-1 overflow-hidden">
      {currentMode === 'learning' && (
        <LearningMode 
          currentTopic={getCurrentTopic()}
          currentSubtopic={getCurrentSubtopic()}
          onNext={onNext}
        />
      )}
      
      {currentMode === 'chat' && (
        <ChatMode
          currentTopic={getCurrentTopic()}
          onStartQuiz={onStartQuiz}
        />
      )}
      
      {currentMode === 'quiz' && (
        <QuizMode
          subtopicId={getCurrentSubtopic()?.id}
          quizType={quizType}
          topicTitle={getCurrentTopic()?.title}
          subtopicTitle={getCurrentSubtopic()?.title}
          userId={user.id}
          onComplete={onQuizComplete}
        />
      )}
      
      {currentMode === 'quiz-results' && (
        <QuizResults
          score={quizScore}
          quizType={quizType}
          topicTitle={getCurrentTopic()?.title}
          onContinue={onContinueAfterQuiz}
        />
      )}
      
      {currentMode === 'final-test' && (
        <FinalTest
          lessonId={lesson.id}
          lessonTitle={lesson.title}
          userId={user.id}
          onComplete={onFinalTestComplete}
        />
      )}
      
      {currentMode === 'final-results' && (
        <FinalResults
          score={quizScore}
          lessonTitle={lesson.title}
        />
      )}
    </Card>
  );
}
