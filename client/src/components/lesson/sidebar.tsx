import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

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
    <Card className="w-full md:w-64 flex-shrink-0 h-fit">
      <CardContent className="p-4">
        <h2 className="font-heading font-semibold text-lg mb-4 text-neutral-900">{lesson.title}</h2>
        
        <div className="space-y-1">
          {lesson.topics.map((topic: any, topicIndex: number) => (
            <div key={topic.id}>
              <button 
                onClick={() => setCurrentTopicIndex(topicIndex)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left ${
                  currentTopicIndex === topicIndex 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <div className="flex items-center">
                  {isTopicCompleted(topicIndex) && (
                    <span className="mr-2 text-secondary-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </span>
                  )}
                  {currentTopicIndex === topicIndex && !isTopicCompleted(topicIndex) && (
                    <span className="mr-2 text-primary-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </span>
                  )}
                  {currentTopicIndex !== topicIndex && !isTopicCompleted(topicIndex) && (
                    <span className="mr-2 text-neutral-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                      </svg>
                    </span>
                  )}
                  <span className="text-sm font-medium">{topic.title}</span>
                </div>
                <span className="text-xs bg-neutral-100 text-neutral-600 rounded-full px-2 py-0.5">
                  {getCompletedSubtopics(topicIndex)}/4
                </span>
              </button>
              
              {currentTopicIndex === topicIndex && (
                <div className="ml-6 mt-1 space-y-1">
                  {topic.subtopics.map((subtopic: any, subtopicIndex: number) => (
                    <button 
                      key={subtopic.id}
                      onClick={() => setCurrentSubtopicIndex(subtopicIndex)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-left text-sm ${
                        currentTopicIndex === topicIndex && currentSubtopicIndex === subtopicIndex 
                          ? 'bg-primary-50 text-primary-700' 
                          : 'text-neutral-600 hover:bg-neutral-50'
                      }`}
                      disabled={!isSubtopicAvailable(topicIndex, subtopicIndex)}
                    >
                      <div className="flex items-center">
                        {isSubtopicCompleted(topicIndex, subtopicIndex) && (
                          <span className="mr-2 text-secondary-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                          </span>
                        )}
                        <span>{subtopic.title}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t border-neutral-100">
          <div className="flex justify-between text-sm text-neutral-600 mb-2">
            <span>Overall progress</span>
            <span>{calculateOverallProgress()}%</span>
          </div>
          <Progress value={calculateOverallProgress()} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
