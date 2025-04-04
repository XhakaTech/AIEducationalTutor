import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { geminiClient } from "@/main";
import { Lightbulb, BookOpen, Check, ChevronRight, ExternalLink, Eye, EyeOff, HelpCircle, Loader2 } from "lucide-react";
import RaiseHandDialog from "./raise-hand-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

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
  const [showResources, setShowResources] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSimplifying, setIsSimplifying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [raiseHandOpen, setRaiseHandOpen] = useState(false);
  
  const { data: subtopicDetails } = useQuery<SubtopicDetails>({
    queryKey: [`/api/subtopics/${currentSubtopic?.id}`],
    enabled: !!currentSubtopic,
  });
  
  useEffect(() => {
    if (subtopicDetails) {
      generateContent();
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
        
        IMPORTANT: 
        - Do not include any list of key concepts at the beginning or end
        - Do not mention these are "key concepts" anywhere
        - Naturally incorporate the concepts into your explanation
        - Start directly with the main content
        - Use only <h1>, <h2>, <p>, <ul>, <li> tags for formatting
        - Return ONLY HTML content
      `;
      
      let content = await geminiClient.generateContent(prompt);
      
      // Remove any remaining key concepts list if present
      content = content.replace(/<h[1-6]>Key Concepts:?<\/h[1-6]>[\s\S]*?<\/ul>/gi, '');
      content = content.replace(/<h[1-6]>[^<]*Concepts[^<]*<\/h[1-6]>[\s\S]*?<\/ul>/gi, '');
      content = content.replace(/<strong>Key Concepts:?<\/strong>[\s\S]*?<\/ul>/gi, '');
      
      setGeneratedContent(content);
    } catch (error) {
      console.error('Error generating content:', error);
      setGeneratedContent("<p>Sorry, I couldn't generate content for this subtopic. Please try again later.</p>");
    } finally {
      setIsLoading(false);
    }
  };
  
  const simplifyExplanation = async () => {
    if (!generatedContent) return;
    
    setIsSimplifying(true);
    try {
      const prompt = `
        Simplify this explanation and return it in HTML format using only basic tags (<h1>, <h2>, <p>, <ul>, <li>):

        ${generatedContent}
      `;
      const simplified = await geminiClient.generateContent(prompt);
      setGeneratedContent(simplified);
    } catch (error) {
      console.error('Error simplifying explanation:', error);
    } finally {
      setIsSimplifying(false);
    }
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
      <div className="bg-white/70 backdrop-blur-sm border-b border-border/40 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
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
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">Generating content...</p>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {isSimplifying ? (
              <div className="flex justify-center py-4">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Simplifying content...</p>
                </div>
              </div>
            ) : (
              <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: generatedContent }} />
            )}
          </div>
        )}
      </div>

      {/* Bottom action bar */}
      <div className="bg-white/70 backdrop-blur-sm border-t border-border/40 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-0 z-10">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
          <Button 
            variant="outline" 
            onClick={simplifyExplanation}
            disabled={isSimplifying}
            className="flex-1 sm:flex-none min-w-[120px]"
          >
            {isSimplifying ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Lightbulb className="h-4 w-4 mr-2" />
            )}
            Simplify
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => setRaiseHandOpen(true)} 
            className="flex-1 sm:flex-none min-w-[120px]"
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            Ask a Question
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                className="flex-1 sm:flex-none min-w-[120px]"
              >
                <Eye className="h-4 w-4 mr-2" />
                Resources
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[400px] w-full">
              <SheetHeader>
                <SheetTitle>Additional Resources</SheetTitle>
              </SheetHeader>
              {subtopicDetails.resources && subtopicDetails.resources.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 mt-4">
                  {subtopicDetails.resources.map((resource) => (
                    <Card key={resource.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{resource.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{resource.description}</p>
                          </div>
                          {resource.url && (
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center mt-8">No additional resources available.</p>
              )}
            </SheetContent>
          </Sheet>
        </div>

        <Button 
          onClick={handleComplete} 
          className="gap-2 w-full sm:w-auto min-w-[120px]"
        >
          {isCompleted ? "Continue" : "Mark as Complete"}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <RaiseHandDialog
        open={raiseHandOpen}
        onOpenChange={setRaiseHandOpen}
        subtopicTitle={subtopicDetails.title}
        subtopicContent={generatedContent}
      />
    </div>
  );
}
