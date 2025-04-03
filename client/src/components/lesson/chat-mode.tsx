import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { geminiClient } from "@/main";

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
        const initialMessage = `You've completed all the subtopics on ${currentTopic.title}. Before we proceed to the quiz, do you have any questions about what we've covered so far?`;
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
      // Handle special case for "Ready" message
      if (userMessage.toLowerCase() === 'ready') {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: "Great! I'll start the quiz now. Good luck!" 
        }]);
        
        // Wait for message to appear
        setTimeout(() => {
          onStartQuiz();
        }, 1000);
        return;
      }
      
      // Send message to Gemini
      const response = await geminiClient.sendChatMessage(userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm sorry, I couldn't process your message. Please try again." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="bg-neutral-50 border-b border-neutral-100 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-sm font-medium text-neutral-900">Chat with AI Tutor</span>
        </div>
        
        <Button 
          onClick={onStartQuiz}
          size="sm"
          className="px-3 py-1.5 h-auto"
        >
          I'm Ready for Quiz
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 bg-neutral-50" id="chat-messages">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`flex items-start mb-4 ${message.role === 'user' ? 'justify-end' : ''}`}
          >
            {message.role === 'assistant' && (
              <div className="flex-shrink-0 mr-3">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                    <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10zm0 18a8 8 0 100-16 8 8 0 000 16z" clipRule="evenodd"></path>
                  </svg>
                </div>
              </div>
            )}
            
            <div 
              className={`rounded-lg p-3 shadow-sm max-w-3xl ${
                message.role === 'user' 
                  ? 'bg-primary-50' 
                  : 'bg-white'
              }`}
            >
              <div dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, '<br/>') }} />
            </div>
            
            {message.role === 'user' && (
              <div className="flex-shrink-0 ml-3">
                <div className="w-8 h-8 rounded-full bg-neutral-300 flex items-center justify-center text-neutral-700 font-medium">
                  U
                </div>
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-start mb-4">
            <div className="flex-shrink-0 mr-3">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10zm0 18a8 8 0 100-16 8 8 0 000 16z" clipRule="evenodd"></path>
                </svg>
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm flex items-center space-x-2">
              <div className="w-2 h-2 bg-neutral-300 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-neutral-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-neutral-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t border-neutral-200 px-4 py-3 bg-white">
        <div className="flex">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask a question about the topic..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button 
            onClick={sendMessage}
            className="ml-3"
            disabled={isLoading || !inputMessage.trim()}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}
