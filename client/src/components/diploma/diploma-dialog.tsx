import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Award, Download, Printer, Share2 } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';

interface DiplomaDialogProps {
  lessonTitle: string;
  completionDate: string;
  score: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DiplomaDialog({ lessonTitle, completionDate, score, open, onOpenChange }: DiplomaDialogProps) {
  const { user } = useAuth();
  const diplomaRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => diplomaRef.current,
    documentTitle: `Crypto Academy Diploma - ${lessonTitle}`,
    onAfterPrint: () => console.log('Print successful'),
  });
  
  const printHandler = () => {
    handlePrint();
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Crypto Academy Diploma: ${lessonTitle}`,
          text: `I completed the ${lessonTitle} course with a score of ${score}% at Crypto Academy!`,
          url: window.location.href,
        });
      } else {
        // Fallback for browsers that don't support navigator.share
        navigator.clipboard.writeText(
          `I completed the ${lessonTitle} course with a score of ${score}% at Crypto Academy! ${window.location.href}`
        );
        alert('Copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleDownload = () => {
    // For simplicity, we'll use the same print function which creates a printable view
    handlePrint();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Your Crypto Academy Diploma</DialogTitle>
          <DialogDescription>
            Congratulations on completing this course! You can download, print, or share your diploma.
          </DialogDescription>
        </DialogHeader>

        {/* Diploma Certificate */}
        <div ref={diplomaRef} className="p-8 border-4 border-double border-gray-300 bg-white my-4">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center mb-4">
              <Award className="h-10 w-10 text-yellow-500 mr-2" />
              <h2 className="text-2xl font-heading font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-blue-600">Crypto Academy</h2>
            </div>
            
            <h1 className="text-3xl font-heading font-bold mt-2 mb-6">Certificate of Completion</h1>
            
            <p className="text-lg mb-2">This certifies that</p>
            <h2 className="text-2xl font-bold mb-4">{user?.name}</h2>
            
            <p className="text-lg mb-2">has successfully completed the course</p>
            <h3 className="text-xl font-bold mb-4">"{lessonTitle}"</h3>
            
            <div className="mt-2 mb-6">
              <p className="text-lg">with a score of</p>
              <div className="text-3xl font-bold text-primary-600 my-2">{score}%</div>
            </div>
            
            <div className="mt-4 border-t border-gray-200 pt-4 w-full">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-500">Completion Date</p>
                  <p className="font-medium">{completionDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Certificate ID</p>
                  <p className="font-medium">CA-{user?.id}-{new Date().getTime().toString().slice(-6)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-wrap gap-2 sm:gap-0">
          <Button onClick={printHandler} variant="outline" className="flex-1 sm:flex-none">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button onClick={handleShare} variant="outline" className="flex-1 sm:flex-none">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button onClick={printHandler} className="flex-1 sm:flex-none">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}