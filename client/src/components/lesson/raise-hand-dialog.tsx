import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { geminiClient } from "@/main";
import { Loader2 } from "lucide-react";

interface RaiseHandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subtopicTitle: string;
  subtopicContent: string;
}

export default function RaiseHandDialog({
  open,
  onOpenChange,
  subtopicTitle,
  subtopicContent,
}: RaiseHandDialogProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    try {
      const prompt = `
        Based on this educational content about "${subtopicTitle}":
        
        ${subtopicContent}
        
        Answer this question: "${question}"
        
        Format your response in HTML using only basic tags (<h1>, <h2>, <p>, <ul>, <li>).
        Be concise but thorough.
        Use clear language appropriate for high school or early college students.
      `;
      
      const response = await geminiClient.generateContent(prompt);
      setAnswer(response);
    } catch (error) {
      console.error('Error getting answer:', error);
      setAnswer("<p>Sorry, I couldn't generate an answer. Please try asking again.</p>");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset state when dialog closes
      setQuestion("");
      setAnswer("");
      setIsLoading(false);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Ask a Question</DialogTitle>
          <DialogDescription>
            Ask any question about {subtopicTitle} and I'll help you understand it better.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Type your question here..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="min-h-[100px]"
          />

          {isLoading && (
            <div className="flex justify-center py-4">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Generating answer...</p>
              </div>
            </div>
          )}

          {answer && !isLoading && (
            <div className="mt-4 p-4 rounded-lg bg-muted/50">
              <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: answer }} />
            </div>
          )}

          <DialogFooter>
            <Button type="submit" disabled={!question.trim() || isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Thinking...
                </>
              ) : (
                'Ask'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}