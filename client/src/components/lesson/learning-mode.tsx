import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { geminiClient } from "@/main";
import { VolumeX, Volume2, Lightbulb, BookOpen, Check, ChevronRight, ExternalLink, Eye } from "lucide-react";
import RaiseHandDialog from "./raise-hand-dialog";
import { Card, CardContent } from "@/components/ui/card";

interface Resource {
  id: number;
  subtopic_id: number;
  type: string;
  description: string;
  title: string;
  url?: string;
  purpose?: string;
  content_tags?: string[];
  recommended_when?: string;
  is_optional?: boolean;
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
  const [raiseHandOpen, setRaiseHandOpen] = useState(false);
  
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
        <p className="text-muted-foreground">No content available</p>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col">
      {/* Top navigation bar */}
      <div className="bg-white/70 backdrop-blur-sm border-b border-border/40 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-sm text-muted-foreground">Topic</span>
          <span className="mx-2 text-muted-foreground">/</span>
          <span className="text-sm font-medium text-foreground">{currentTopic.title}</span>
          <span className="mx-2 text-muted-foreground">/</span>
          <span className="text-sm font-medium text-primary">{currentSubtopic.title}</span>
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
          <div className="text-sm text-muted-foreground">
            <span>Subtopic {currentSubtopic.order + 1}/{currentTopic.subtopics?.length || 0}</span>
          </div>
        </div>
      </div>
      
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-6 animate-fade-in">
          <div className="mb-8">
            <h1 className="text-2xl font-heading font-bold text-foreground mb-3">{currentSubtopic.title}</h1>
            <div className="flex flex-wrap gap-2 mb-4">
              {subtopicDetails.key_concepts.map((concept, index) => (
                <Badge key={index} variant="secondary" className="bg-secondary/10 text-secondary hover:bg-secondary/20">
                  {concept}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground border-l-4 border-primary/30 pl-3 italic">{subtopicDetails.objective}</p>
          </div>
            
          {/* AI Generated Content */}
          <div className="prose prose-neutral max-w-none mb-8 bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-sm">
            {isLoading ? (
              <div className="flex flex-col items-center py-10">
                <div className="h-10 w-10 border-t-4 border-primary border-solid rounded-full animate-spin mb-4"></div>
                <p className="text-muted-foreground">Generating content...</p>
              </div>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: generatedContent }} />
            )}
          </div>
            
          {/* Resources Section */}
          <div className="mb-8">
            <h2 className="text-xl font-heading font-semibold text-foreground mb-4 flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-secondary" />
              Learning Resources
            </h2>
              
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subtopicDetails.resources?.map((resource, index) => (
                <Card key={index} className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-all bg-white/70 backdrop-blur-sm">
                  <CardContent className="p-0">
                    <div className="h-1.5 bg-gradient-to-r from-accent to-accent/60 w-full"></div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className="bg-accent/10 text-accent hover:bg-accent/20 capitalize">
                          {resource.type}
                        </Badge>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => window.open(resource.url, '_blank')}>
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                      <h3 className="font-medium text-foreground mb-2">{resource.title}</h3>
                      <p className="text-sm text-muted-foreground">{resource.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
            
          {/* Action buttons */}
          <div className="flex justify-between items-center mt-12 mb-6">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={simplifyExplanation}
                className="shadow-sm hover:shadow-md transition-all"
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                Simplify
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setRaiseHandOpen(true)}
                className="shadow-sm hover:shadow-md transition-all"
              >
                <Eye className="h-4 w-4 mr-2" />
                Need Help
              </Button>
            </div>

            <Button 
              onClick={handleComplete}
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white shadow-md hover:shadow-lg transition-all"
              disabled={isLoading}
            >
              {isCompleted ? "Continue" : "Mark as Complete"}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Raise hand dialog */}
      <RaiseHandDialog 
        topicTitle={currentTopic.title}
        subtopicTitle={currentSubtopic.title}
      />
    </div>
  );
}
