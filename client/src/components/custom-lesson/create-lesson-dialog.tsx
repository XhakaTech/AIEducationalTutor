import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { CustomLesson } from '@/types/custom-lesson';
import { apiRequest } from '@/lib/queryClient';
import { Loader2 } from 'lucide-react';

// UI Components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Form schema
const formSchema = z.object({
  topic: z.string().min(3, {
    message: 'Topic must be at least 3 characters.',
  }).max(100, {
    message: 'Topic must not exceed 100 characters.'
  }),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert'], {
    required_error: 'Please select a difficulty level.',
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateLessonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLessonCreated: (lesson: CustomLesson) => void;
}

export function CreateLessonDialog({
  open,
  onOpenChange,
  onLessonCreated,
}: CreateLessonDialogProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
      difficulty: 'beginner',
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!user) return;
    
    // First validate if the topic is crypto-related
    setIsValidating(true);
    setValidationMessage('');
    
    try {
      const validationResponse = await apiRequest('POST', '/api/gemini/validate-topic', {
        topic: values.topic
      });
      
      const validationData = await validationResponse.json();
      
      setIsValidating(false);
      
      if (!validationData.isValid) {
        setValidationMessage(validationData.message);
        return;
      }
      
      // If topic is valid, create the custom lesson
      setIsCreating(true);
      
      const lessonResponse = await apiRequest('POST', '/api/custom-lessons', {
        userId: user.id,
        topic: values.topic,
        difficulty: values.difficulty
      });
      
      const customLesson = await lessonResponse.json();
      
      // Store the lesson in local storage
      const storedLessons = localStorage.getItem('customLessons');
      let lessons = [];
      
      try {
        // Parse existing lessons or create empty array if none exist
        if (storedLessons) {
          const parsedLessons = JSON.parse(storedLessons);
          // Ensure we're working with an array
          lessons = Array.isArray(parsedLessons) ? parsedLessons : [];
        }
        
        // Add the new lesson
        lessons.push(customLesson);
        localStorage.setItem('customLessons', JSON.stringify(lessons));
        
        console.log('Custom lesson saved to localStorage:', customLesson.title);
      } catch (storageError) {
        console.error('Error saving to localStorage:', storageError);
        // Still call onLessonCreated even if localStorage fails
      }
      
      // Reset the form and close the dialog
      form.reset();
      onLessonCreated(customLesson);
      onOpenChange(false);
      
      toast({
        title: 'Success!',
        description: `Your custom lesson "${customLesson.title}" has been created.`,
      });
    } catch (error) {
      console.error('Error creating custom lesson:', error);
      
      // More detailed error message
      let errorMessage = 'Failed to create custom lesson. Please try again.';
      
      // If we have a more specific error from the API response
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Custom Lesson</DialogTitle>
          <DialogDescription>
            Enter a cryptocurrency-related topic and select a difficulty level to create a personalized lesson.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Bitcoin Mining, DeFi Staking, NFT Marketplaces" 
                      {...field} 
                      disabled={isValidating || isCreating}
                    />
                  </FormControl>
                  <FormMessage />
                  {validationMessage && (
                    <p className="text-sm font-medium text-destructive mt-1">{validationMessage}</p>
                  )}
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Difficulty Level</FormLabel>
                  <Select
                    disabled={isValidating || isCreating}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isValidating || isCreating}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isValidating || isCreating}
              >
                {isValidating && (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Validating Topic...
                  </>
                )}
                {isCreating && (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Lesson...
                  </>
                )}
                {!isValidating && !isCreating && 'Create Lesson'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}