import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { geminiClient } from "@/main";
import { HelpCircle, Loader2 } from "lucide-react";

interface RaiseHandDialogProps {
  topicTitle: string;
  subtopicTitle: string;
}

export default function RaiseHandDialog({ topicTitle, subtopicTitle }: RaiseHandDialogProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleAskQuestion = async () => {
    if (!question.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const prompt = `
        I'm studying "${topicTitle}", specifically the subtopic "${subtopicTitle}".
        I have a question: ${question}
        
        Please provide a clear, educational answer that helps me understand this topic better.
        Keep your response concise but thorough, and use simple language.
      `;

      const response = await geminiClient.generateContent(prompt);
      setAnswer(response);
    } catch (error) {
      console.error('Error getting answer:', error);
      setAnswer("I'm sorry, I couldn't process your question right now. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset state when dialog closes
      setQuestion("");
      setAnswer("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="absolute bottom-4 right-4 rounded-full w-10 h-10 p-0"
          title="Raise hand to ask a question"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-heading font-semibold">Ask a Question</DialogTitle>
          <DialogDescription>
            Have a specific question about <span className="font-medium">{subtopicTitle}</span>? Ask here and get an immediate answer.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 py-2">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Type your question here..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={handleAskQuestion} 
              disabled={isLoading || !question.trim()}
              size="sm"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ask"}
            </Button>
          </div>
          
          {isLoading && (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
          
          {answer && !isLoading && (
            <div className="mt-2 bg-muted/50 rounded-md p-4 max-h-[300px] overflow-y-auto">
              <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: answer }} />
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}