import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { geminiClient } from "@/main";
import { VolumeX, Volume2, Lightbulb, BookOpen, Check } from "lucide-react";
import RaiseHandDialog from "./raise-hand-dialog";

interface Resource {
  id: number;
  subtopic_id: number;
  type: string;
  description: string;
  url?: string;
  purpose?: string;
}

interface SubtopicDetails {
  id: number;
  topic_id: number;
  title: string;
  order: number;
  objective: string;
  key_concepts: string[];
  resources?: Resource[];
  progress?: {
    completed: boolean;
  };
}

interface Topic {
  id: number;
  lesson_id: number;
  title: string;
  order: number;
  subtopics: any[];
}

interface LearningModeProps {
  currentTopic: Topic;
  currentSubtopic: any;
  onNext: () => void;
}

export default function LearningMode({ 
  currentTopic,
  currentSubtopic,
  onNext
}: LearningModeProps) {
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [showResource, setShowResource] = useState(false);
  const [currentResource, setCurrentResource] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const { data: subtopicDetails } = useQuery<SubtopicDetails>({
    queryKey: [`/api/subtopics/${currentSubtopic?.id}`],
    enabled: !!currentSubtopic,
  });
  
  useEffect(() => {
    if (subtopicDetails) {
      generateContent();
      // Select first resource as default
      if (subtopicDetails.resources && subtopicDetails.resources.length > 0) {
        setCurrentResource(subtopicDetails.resources[0]);
      }
      
      // Check if this subtopic is already completed
      setIsCompleted(subtopicDetails.progress?.completed || false);
    }
  }, [subtopicDetails]);
  
  const generateContent = async () => {
    if (!subtopicDetails) return;
    
    setIsLoading(true);
    try {
      const prompt = `
        Generate educational content about "${subtopicDetails.title}".
        
        Learning objective: ${subtopicDetails.objective}
        
        Key concepts to cover: ${subtopicDetails.key_concepts.join(', ')}
        
        Format the content with headings, paragraphs, lists, and other HTML elements as appropriate.
        The content should be comprehensive but concise, suitable for a 5-minute lesson.
        Use clear language appropriate for high school or early college students.
        Use English language only.
      `;
      
      const content = await geminiClient.generateContent(prompt);
      setGeneratedContent(content);
      
      // Import the speech service here to avoid circular dependencies
      const { speak, stopSpeaking } = await import('../../services/speech');
      
      // Only narrate if not muted
      if (!isMuted) {
        // Narrate the content
        const plainText = content.replace(/<[^>]*>?/gm, ' ');
        geminiClient.speak(plainText);
      }
    } catch (error) {
      console.error('Error generating content:', error);
      setGeneratedContent("<p>Sorry, I couldn't generate content for this subtopic. Please try again later.</p>");
    } finally {
      setIsLoading(false);
    }
  };
  
  const simplifyExplanation = async () => {
    if (!generatedContent) return;
    
    try {
      const simplified = await geminiClient.simplifyExplanation(generatedContent);
      setGeneratedContent(simplified);
      
      if (!isMuted) {
        // Narrate the simplified content
        const plainText = simplified.replace(/<[^>]*>?/gm, ' ');
        geminiClient.speak(plainText);
      }
    } catch (error) {
      console.error('Error simplifying explanation:', error);
    }
  };
  
  const showRandomResource = () => {
    if (!subtopicDetails?.resources || subtopicDetails.resources.length === 0) return;
    
    // Show a random resource
    const randomIndex = Math.floor(Math.random() * subtopicDetails.resources.length);
    setCurrentResource(subtopicDetails.resources[randomIndex]);
    setShowResource(true);
  };
  
  const toggleMute = async () => {
    const { stopSpeaking } = await import('../../services/speech');
    
    if (!isMuted) {
      // If turning mute on, stop any ongoing speech
      stopSpeaking();
    }
    
    setIsMuted(!isMuted);
  };

  const handleComplete = () => {
    setIsCompleted(true);
    onNext();
  };

  if (!currentTopic || !currentSubtopic || !subtopicDetails) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-neutral-500">No content available</p>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col">
      {/* Top navigation bar */}
      <div className="bg-neutral-50 border-b border-neutral-100 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-sm text-neutral-600">Topic</span>
          <span className="mx-2 text-neutral-400">/</span>
          <span className="text-sm font-medium text-neutral-900">{currentTopic.title}</span>
          <span className="mx-2 text-neutral-400">/</span>
          <span className="text-sm font-medium text-primary-600">{currentSubtopic.title}</span>
          {isCompleted && (
            <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">
              <Check className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 rounded-full" 
            onClick={toggleMute}
            title={isMuted ? "Unmute narration" : "Mute narration"}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          <div className="text-sm text-neutral-600">
            <span>Subtopic {currentSubtopic.order + 1}/{currentTopic.subtopics?.length || 4}</span>
          </div>
        </div>
      </div>
      
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto relative">
        <div className="p-6">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-heading font-bold text-neutral-900 mb-2">{currentSubtopic.title}</h1>
            <p className="text-sm text-neutral-600 mb-6">{subtopicDetails.objective}</p>
            
            {/* AI Generated Content */}
            <div className="prose prose-neutral max-w-none mb-8">
              {isLoading ? (
                <div className="flex flex-col items-center py-10">
                  <div className="h-10 w-10 border-t-4 border-primary border-solid rounded-full animate-spin mb-4"></div>
                  <p className="text-neutral-500">Generating content...</p>
                </div>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: generatedContent }} />
              )}
            </div>
            
            {/* Resource Box */}
            {showResource && currentResource && (
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 mb-8">
                <div className="flex items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-neutral-900 mb-2">{currentResource.description}</h3>
                    
                    {/* Resource content (based on type) */}
                    {currentResource.type === 'image' && (
                      <div className="mt-3">
                        <img 
                          src={currentResource.url} 
                          alt={currentResource.description} 
                          className="w-full rounded-lg"
                        />
                      </div>
                    )}
                    
                    {currentResource.type === 'text' && (
                      <div className="mt-3 text-sm text-neutral-700">
                        <p>{currentResource.purpose}</p>
                      </div>
                    )}
                    
                    {currentResource.type === 'video' && (
                      <div className="mt-3 aspect-video bg-neutral-200 rounded-lg flex items-center justify-center">
                        <div className="text-neutral-500 flex flex-col items-center">
                          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          <span className="mt-2 text-sm">{currentResource.description}</span>
                        </div>
                      </div>
                    )}
                    
                    {currentResource.type === 'audio' && (
                      <div className="mt-3 bg-neutral-100 rounded-lg p-3 flex items-center">
                        <Button className="w-8 h-8 rounded-full p-0" size="sm">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path>
                          </svg>
                        </Button>
                        <div className="ml-3 flex-1">
                          <div className="text-sm font-medium">{currentResource.description}</div>
                          <div className="text-xs text-neutral-500">Audio resource</div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <button onClick={() => setShowResource(false)} className="ml-4 text-neutral-400 hover:text-neutral-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Raise Hand Dialog Button */}
        <RaiseHandDialog 
          topicTitle={currentTopic.title} 
          subtopicTitle={currentSubtopic.title} 
        />
      </div>
      
      {/* Fixed Action Buttons */}
      <div className="border-t border-neutral-200 p-4 bg-white flex-shrink-0">
        <div className="max-w-3xl mx-auto flex flex-wrap gap-3 justify-between">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={showRandomResource}
              className="flex items-center"
              disabled={isLoading}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              <span>Show Resource</span>
            </Button>
            
            <Button 
              variant="outline"
              onClick={simplifyExplanation}
              title="Simplify the explanation to make it easier to understand"
              disabled={isLoading}
              className="flex items-center"
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              <span>Explain Simply</span>
            </Button>
          </div>
          
          <Button 
            onClick={handleComplete}
            className="px-6 py-2"
            disabled={isLoading}
          >
            <span>{isCompleted ? "Continue" : "Mark as Understood"}</span>
            <svg className="w-5 h-5 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}
