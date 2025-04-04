import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { geminiClient } from "@/main";
import { Loader2 } from "lucide-react";

interface ChatModeProps {
  currentTopic: any;
  onStartQuiz: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatMode({ currentTopic, onStartQuiz }: ChatModeProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Initialize chat
  useEffect(() => {
    const initChat = async () => {
      setIsLoading(true);
      try {
        // Start a new chat session
        geminiClient.startChat();
        
        // Add initial AI message
        const initialMessage = `
          <div class="space-y-4">
            <p>You've completed all the subtopics on <strong>${currentTopic.title}</strong>. Before we proceed to the quiz, do you have any questions about what we've covered so far?</p>
            <p class="text-muted-foreground">Type your question or click "Ready for Quiz" when you're ready to proceed.</p>
          </div>
        `;
        setMessages([{ role: 'assistant', content: initialMessage }]);
      } catch (error) {
        console.error('Error initializing chat:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initChat();
  }, [currentTopic]);
  
  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    
    const userMessage = inputMessage.trim();
    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    
    try {
      // Send message to Gemini with HTML formatting instruction
      const response = await geminiClient.sendChatMessage(
        `${userMessage}\n\nFormat your response in HTML using these tags for better readability:
        - <div> for containers with class="space-y-4" for spacing
        - <p> for paragraphs
        - <ul> and <li> for lists
        - <strong> for emphasis
        - <em> for italics
        Return ONLY the HTML content without any markdown or additional formatting.`
      );
      
      // Ensure response is wrapped in a container div
      const formattedResponse = response.startsWith('<div') 
        ? response 
        : `<div class="space-y-4">${response}</div>`;
        
      setMessages(prev => [...prev, { role: 'assistant', content: formattedResponse }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "<div class='space-y-4'><p>I'm sorry, I couldn't process your message. Please try again.</p></div>" 
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="h-full flex flex-col">
      {/* Chat header */}
      <div className="bg-white/70 backdrop-blur-sm border-b border-border/40 px-6 py-3 sticky top-0 z-10">
        <h2 className="text-lg font-semibold">Pre-Quiz Discussion</h2>
        <p className="text-sm text-muted-foreground">Ask any questions before starting the quiz</p>
      </div>
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <div 
                  className="prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: message.content }}
                />
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg px-4 py-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input area */}
      <div className="border-t border-border/40 bg-background p-4">
        <div className="max-w-3xl mx-auto flex flex-col gap-4">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your question here..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
            >
              Send
            </Button>
          </div>
          
          <Button 
            variant="default"
            onClick={onStartQuiz}
            className="w-full"
          >
            Ready for Quiz
          </Button>
        </div>
      </div>
    </div>
  );
}
