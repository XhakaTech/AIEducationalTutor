import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { PlusCircle, BookOpen, ArrowRight, MoveRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { CreateLessonDialog } from './create-lesson-dialog';
import { CustomLesson } from '@/types/custom-lesson';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

interface CustomLessonsListProps {
  className?: string;
}

export function CustomLessonsList({ className }: CustomLessonsListProps) {
  const [customLessons, setCustomLessons] = useState<CustomLesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Load custom lessons from localStorage
    const loadCustomLessons = () => {
      setIsLoading(true);
      try {
        const storedLessons = localStorage.getItem('customLessons');
        if (storedLessons && user) {
          // Filter lessons to only show those belonging to the current user
          setCustomLessons(JSON.parse(storedLessons).filter((lesson: CustomLesson) => lesson.userId === user.id));
        }
      } catch (error) {
        console.error('Error loading custom lessons:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCustomLessons();
  }, [user]);

  const handleLessonCreated = (newLesson: CustomLesson) => {
    setCustomLessons((prev) => [...prev, newLesson]);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800';
      case 'advanced':
        return 'bg-purple-100 text-purple-800';
      case 'expert':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Your Custom Lessons</h2>
        <Button onClick={() => setCreateDialogOpen(true)} variant="outline" size="sm" className="gap-1">
          <PlusCircle className="h-4 w-4" />
          Create Lesson
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/3 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {customLessons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No custom lessons yet</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md">
                Create your own personalized cryptocurrency lessons to learn about specific topics at your preferred difficulty level.
              </p>
              <Button onClick={() => setCreateDialogOpen(true)} className="gap-1">
                <PlusCircle className="h-4 w-4" />
                Create Your First Lesson
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[480px] pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {customLessons.map((lesson) => (
                  <Card key={lesson.id} className="overflow-hidden flex flex-col">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg line-clamp-1">{lesson.title}</CardTitle>
                        {lesson.completed && (
                          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                        )}
                      </div>
                      <CardDescription className="line-clamp-2">{lesson.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div className="flex gap-2 mb-3">
                        <Badge variant="outline" className={cn('font-normal', getDifficultyColor(lesson.difficulty))}>
                          {lesson.difficulty.charAt(0).toUpperCase() + lesson.difficulty.slice(1)}
                        </Badge>
                        <Badge variant="outline" className="font-normal">
                          {lesson.topics.length} topics
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>
                          Created on {new Date(lesson.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Link href={`/custom-lesson/${lesson.id}`}>
                        <Button className="w-full group">
                          {lesson.completed ? 'Review Lesson' : 'Continue Learning'}
                          <MoveRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </>
      )}

      <CreateLessonDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onLessonCreated={handleLessonCreated}
      />
    </div>
  );
}