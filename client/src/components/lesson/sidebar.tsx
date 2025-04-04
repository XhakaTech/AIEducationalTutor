import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Check, ChevronRight, Lock, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LessonSidebarProps {
  lesson: any;
  currentTopicIndex: number;
  setCurrentTopicIndex: (index: number) => void;
  currentSubtopicIndex: number;
  setCurrentSubtopicIndex: (index: number) => void;
}

export default function LessonSidebar({
  lesson,
  currentTopicIndex,
  setCurrentTopicIndex,
  currentSubtopicIndex,
  setCurrentSubtopicIndex
}: LessonSidebarProps) {
  
  const isTopicCompleted = (topicIndex: number) => {
    if (!lesson.topics[topicIndex]) return false;
    
    return lesson.topics[topicIndex].subtopics.every((subtopic: any) => subtopic.completed);
  };
  
  const isSubtopicCompleted = (topicIndex: number, subtopicIndex: number) => {
    if (!lesson.topics[topicIndex] || !lesson.topics[topicIndex].subtopics[subtopicIndex]) return false;
    
    return lesson.topics[topicIndex].subtopics[subtopicIndex].completed;
  };
  
  const isSubtopicAvailable = (topicIndex: number, subtopicIndex: number) => {
    // First subtopic of first topic is always available
    if (topicIndex === 0 && subtopicIndex === 0) return true;
    
    // If it's not the first subtopic, the previous one must be completed
    if (subtopicIndex > 0) {
      return isSubtopicCompleted(topicIndex, subtopicIndex - 1);
    }
    
    // If it's the first subtopic of a topic (but not the first topic),
    // the previous topic must be completed
    return isTopicCompleted(topicIndex - 1);
  };
  
  const getCompletedSubtopics = (topicIndex: number) => {
    if (!lesson.topics[topicIndex]) return 0;
    
    return lesson.topics[topicIndex].subtopics.filter((s: any) => s.completed).length;
  };
  
  const calculateOverallProgress = () => {
    if (!lesson.topics) return 0;
    
    let completed = 0;
    let total = 0;
    
    lesson.topics.forEach((topic: any) => {
      topic.subtopics.forEach((subtopic: any) => {
        total++;
        if (subtopic.completed) completed++;
      });
    });
    
    return Math.round((completed / total) * 100);
  };
  
  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="font-heading font-bold text-lg mb-2 text-foreground">{lesson.title}</h2>
        <div className="flex gap-2 mb-4">
          <Badge variant="outline" className="bg-primary/10 text-primary hover:bg-primary/20 capitalize">
            {lesson.level}
          </Badge>
          <Badge variant="outline" className="bg-secondary/10 text-secondary hover:bg-secondary/20 uppercase">
            {lesson.language}
          </Badge>
        </div>
      </div>
      
      <div className="space-y-3 mb-6">
        {lesson.topics.map((topic: any, topicIndex: number) => {
          const isActive = currentTopicIndex === topicIndex;
          const isCompleted = isTopicCompleted(topicIndex);
          const subtopicsTotal = topic.subtopics.length;
          const subtopicsCompleted = getCompletedSubtopics(topicIndex);
          
          return (
            <div key={topic.id} className="animate-fade-in" style={{animationDelay: `${topicIndex * 50}ms`}}>
              <button 
                onClick={() => setCurrentTopicIndex(topicIndex)}
                className={`w-full flex items-center justify-between p-3 rounded-md text-left transition-all ${
                  isActive 
                    ? 'bg-primary/10 text-primary shadow-sm' 
                    : isCompleted
                      ? 'bg-secondary/5 text-foreground hover:bg-secondary/10'
                      : 'text-foreground hover:bg-muted'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                    isCompleted
                      ? 'bg-secondary/20 text-secondary'
                      : isActive
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : isActive ? (
                      <ChevronRight className="w-3.5 h-3.5" />
                    ) : (
                      topicIndex + 1
                    )}
                  </div>
                  <span className="text-sm font-medium truncate">{topic.title}</span>
                </div>
                <span className="text-xs bg-background text-muted-foreground rounded-full px-2 py-0.5 ml-2 flex-shrink-0">
                  {subtopicsCompleted}/{subtopicsTotal}
                </span>
              </button>
              
              {isActive && (
                <div className="ml-6 mt-2 space-y-1.5 pl-2 border-l border-border/60">
                  {topic.subtopics.map((subtopic: any, subtopicIndex: number) => {
                    const isSubtopicActive = currentTopicIndex === topicIndex && currentSubtopicIndex === subtopicIndex;
                    const isCompleted = isSubtopicCompleted(topicIndex, subtopicIndex);
                    const isAvailable = isSubtopicAvailable(topicIndex, subtopicIndex);
                    
                    return (
                      <button 
                        key={subtopic.id}
                        onClick={() => isAvailable && setCurrentSubtopicIndex(subtopicIndex)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-left text-sm transition-all ${
                          isSubtopicActive 
                            ? 'bg-primary/10 text-primary' 
                            : isCompleted
                              ? 'text-secondary hover:bg-secondary/5'
                              : isAvailable
                                ? 'text-foreground hover:bg-muted/60'
                                : 'text-muted-foreground opacity-60 cursor-not-allowed'
                        }`}
                        disabled={!isAvailable}
                      >
                        {isCompleted ? (
                          <Check className="h-3.5 w-3.5 flex-shrink-0 text-secondary" />
                        ) : !isAvailable ? (
                          <Lock className="h-3.5 w-3.5 flex-shrink-0" />
                        ) : (
                          <div className="w-3.5 h-3.5 flex-shrink-0"></div>
                        )}
                        <span className={`truncate ${isCompleted ? 'font-medium' : ''}`}>
                          {subtopic.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="bg-muted/30 rounded-lg p-4 mt-auto">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Course progress</span>
          <span className="font-medium">{calculateOverallProgress()}%</span>
        </div>
        <Progress value={calculateOverallProgress()} className="h-1.5" />
        
        <div className="flex justify-between items-center text-xs mt-4 text-muted-foreground">
          <span>Lessons completed: {getCompletedSubtopics(currentTopicIndex)}</span>
          <span>Total: {lesson.topics.reduce((total: number, topic: any) => total + topic.subtopics.length, 0)}</span>
        </div>
      </div>
    </div>
  );
}
