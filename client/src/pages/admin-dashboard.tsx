import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lesson, Topic, Subtopic, Resource, QuizQuestion, FinalTestQuestion } from "@shared/schema";
import { 
  PlusCircle, 
  Edit, 
  Trash2, 
  ArrowLeft, 
  Book, 
  BookOpen, 
  FileText, 
  HelpCircle, 
  CheckCircle2 
} from "lucide-react";

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Admin password authentication
  const handleAuth = () => {
    // For this MVP, we'll use a simple hardcoded password
    // In a real app, this would be a proper authentication
    if (password === "admin123") {
      setIsAuthenticated(true);
      toast({
        title: "Authentication successful",
        description: "You now have access to the admin dashboard",
      });
    } else {
      toast({
        title: "Authentication failed",
        description: "Invalid password",
        variant: "destructive"
      });
    }
  };

  // Lessons data fetching
  const { 
    data: lessons, 
    isLoading: lessonsLoading 
  } = useQuery({ 
    queryKey: ['/api/admin/lessons'],
    enabled: isAuthenticated
  });

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Admin Authentication</CardTitle>
            <CardDescription>Please enter the admin password to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAuth();
                    }
                  }}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleAuth}>Login</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage educational content</p>
        </div>
        <Button variant="outline" onClick={() => setLocation("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return to App
        </Button>
      </div>

      <Tabs defaultValue="lessons" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="lessons">Lessons</TabsTrigger>
          <TabsTrigger value="topics">Topics</TabsTrigger>
          <TabsTrigger value="subtopics">Subtopics</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
        </TabsList>

        <TabsContent value="lessons">
          <LessonsManagement />
        </TabsContent>
        
        <TabsContent value="topics">
          <TopicsManagement />
        </TabsContent>
        
        <TabsContent value="subtopics">
          <SubtopicsManagement />
        </TabsContent>
        
        <TabsContent value="resources">
          <ResourcesManagement />
        </TabsContent>
        
        <TabsContent value="questions">
          <QuestionsManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Lessons Management Component
const LessonsManagement = () => {
  const { toast } = useToast();
  const [lessonFormOpen, setLessonFormOpen] = useState(false);
  const [currentLesson, setCurrentLesson] = useState<Partial<Lesson> | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Fetch all lessons
  const { data: lessons = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/lessons'],
  });

  // Create lesson mutation
  const createMutation = useMutation({
    mutationFn: async (lesson: Omit<Lesson, "id">) => {
      const response = await fetch('/api/admin/lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lesson }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create lesson');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/lessons'] });
      toast({
        title: "Lesson created",
        description: "The lesson has been created successfully",
      });
      setLessonFormOpen(false);
      setCurrentLesson(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update lesson mutation
  const updateMutation = useMutation({
    mutationFn: async (lesson: Partial<Lesson>) => {
      const response = await fetch(`/api/admin/lessons/${lesson.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lesson }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update lesson');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/lessons'] });
      toast({
        title: "Lesson updated",
        description: "The lesson has been updated successfully",
      });
      setLessonFormOpen(false);
      setCurrentLesson(null);
      setIsEditMode(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Delete lesson mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/lessons/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete lesson');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/lessons'] });
      toast({
        title: "Lesson deleted",
        description: "The lesson has been deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleCreateLesson = () => {
    setCurrentLesson({
      title: "",
      description: "",
      icon: "",
    });
    setIsEditMode(false);
    setLessonFormOpen(true);
  };

  const handleEditLesson = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    setIsEditMode(true);
    setLessonFormOpen(true);
  };

  const handleDeleteLesson = (id: number) => {
    if (window.confirm("Are you sure you want to delete this lesson? This will also delete all associated topics, subtopics, resources, and quiz questions.")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentLesson) return;
    
    if (isEditMode && currentLesson.id) {
      updateMutation.mutate(currentLesson);
    } else {
      createMutation.mutate(currentLesson as Omit<Lesson, "id">);
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading lessons...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Lessons Management</h2>
        <Button onClick={handleCreateLesson}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Lesson
        </Button>
      </div>

      {lessons.length === 0 ? (
        <div className="text-center py-10 border rounded-lg">
          <p className="text-muted-foreground">No lessons found. Create your first lesson to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson: Lesson) => (
            <Card key={lesson.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <span className="text-3xl">{lesson.icon || '📚'}</span>
                    <CardTitle>{lesson.title}</CardTitle>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEditLesson(lesson)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDeleteLesson(lesson.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-muted-foreground">{lesson.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={lessonFormOpen} onOpenChange={setLessonFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Lesson' : 'Create New Lesson'}</DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? 'Update the lesson details below.' 
                : 'Fill in the lesson details to create a new lesson.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                value={currentLesson?.title || ''} 
                onChange={(e) => setCurrentLesson({...currentLesson, title: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={currentLesson?.description || ''} 
                onChange={(e) => setCurrentLesson({...currentLesson, description: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="icon">Icon (Emoji)</Label>
              <Input 
                id="icon" 
                value={currentLesson?.icon || ''} 
                onChange={(e) => setCurrentLesson({...currentLesson, icon: e.target.value})}
              />
              <p className="text-sm text-muted-foreground">Enter a single emoji character</p>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setLessonFormOpen(false);
                  setCurrentLesson(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {isEditMode ? 'Update Lesson' : 'Create Lesson'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Topics Management Component
const TopicsManagement = () => {
  const { toast } = useToast();
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [topicFormOpen, setTopicFormOpen] = useState(false);
  const [currentTopic, setCurrentTopic] = useState<Partial<Topic> | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Fetch all lessons
  const { data: lessons = [], isLoading: lessonsLoading } = useQuery({
    queryKey: ['/api/admin/lessons'],
  });

  // Fetch topics for selected lesson
  const { 
    data: topics = [], 
    isLoading: topicsLoading,
    refetch: refetchTopics
  } = useQuery({
    queryKey: ['/api/admin/lessons', selectedLessonId, 'topics'],
    enabled: !!selectedLessonId,
  });

  // Create topic mutation
  const createMutation = useMutation({
    mutationFn: async (topic: Omit<Topic, "id">) => {
      const response = await fetch('/api/admin/topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create topic');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/lessons', selectedLessonId, 'topics'] });
      toast({
        title: "Topic created",
        description: "The topic has been created successfully",
      });
      setTopicFormOpen(false);
      setCurrentTopic(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update topic mutation
  const updateMutation = useMutation({
    mutationFn: async (topic: Partial<Topic>) => {
      const response = await fetch(`/api/admin/topics/${topic.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update topic');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/lessons', selectedLessonId, 'topics'] });
      toast({
        title: "Topic updated",
        description: "The topic has been updated successfully",
      });
      setTopicFormOpen(false);
      setCurrentTopic(null);
      setIsEditMode(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Delete topic mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/topics/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete topic');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/lessons', selectedLessonId, 'topics'] });
      toast({
        title: "Topic deleted",
        description: "The topic has been deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleCreateTopic = () => {
    if (!selectedLessonId) {
      toast({
        title: "Error",
        description: "Please select a lesson first",
        variant: "destructive",
      });
      return;
    }
    
    setCurrentTopic({
      title: "",
      lesson_id: selectedLessonId,
      order: topics.length + 1,
    });
    setIsEditMode(false);
    setTopicFormOpen(true);
  };

  const handleEditTopic = (topic: Topic) => {
    setCurrentTopic(topic);
    setIsEditMode(true);
    setTopicFormOpen(true);
  };

  const handleDeleteTopic = (id: number) => {
    if (window.confirm("Are you sure you want to delete this topic? This will also delete all associated subtopics, resources, and quiz questions.")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentTopic) return;
    
    if (isEditMode && currentTopic.id) {
      updateMutation.mutate(currentTopic);
    } else {
      createMutation.mutate(currentTopic as Omit<Topic, "id">);
    }
  };

  const isLoading = lessonsLoading || (selectedLessonId && topicsLoading);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Topics Management</h2>
        <Button onClick={handleCreateTopic} disabled={!selectedLessonId}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Topic
        </Button>
      </div>

      <div className="space-y-4">
        <div className="max-w-md">
          <Label htmlFor="lesson-select">Select Lesson</Label>
          <Select 
            onValueChange={(value) => setSelectedLessonId(Number(value))}
            value={selectedLessonId?.toString() || ""}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a lesson" />
            </SelectTrigger>
            <SelectContent>
              {lessons.map((lesson: Lesson) => (
                <SelectItem key={lesson.id} value={lesson.id.toString()}>
                  {lesson.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center py-10">Loading topics...</div>
        ) : selectedLessonId ? (
          topics.length === 0 ? (
            <div className="text-center py-10 border rounded-lg">
              <p className="text-muted-foreground">No topics found for this lesson. Create your first topic to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topics.map((topic: Topic, index: number) => (
                <Card key={topic.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-medium">#{topic.order || index + 1}</span>
                        <CardTitle>{topic.title}</CardTitle>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditTopic(topic)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteTopic(topic.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-10 border rounded-lg">
            <p className="text-muted-foreground">Please select a lesson to manage its topics.</p>
          </div>
        )}
      </div>

      <Dialog open={topicFormOpen} onOpenChange={setTopicFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Topic' : 'Create New Topic'}</DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? 'Update the topic details below.' 
                : 'Fill in the topic details to create a new topic.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                value={currentTopic?.title || ''} 
                onChange={(e) => setCurrentTopic({...currentTopic, title: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="order">Order</Label>
              <Input 
                id="order" 
                type="number"
                value={currentTopic?.order?.toString() || ''} 
                onChange={(e) => setCurrentTopic({
                  ...currentTopic, 
                  order: e.target.value ? parseInt(e.target.value) : undefined
                })}
              />
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setTopicFormOpen(false);
                  setCurrentTopic(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {isEditMode ? 'Update Topic' : 'Create Topic'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Subtopics Management Component (stub)
const SubtopicsManagement = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Subtopics Management</h2>
      <div className="text-center py-10 border rounded-lg">
        <p className="text-muted-foreground">Subtopics management will be implemented soon.</p>
      </div>
    </div>
  );
};

// Resources Management Component (stub)
const ResourcesManagement = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Resources Management</h2>
      <div className="text-center py-10 border rounded-lg">
        <p className="text-muted-foreground">Resources management will be implemented soon.</p>
      </div>
    </div>
  );
};

// Questions Management Component (stub)
const QuestionsManagement = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Questions Management</h2>
      <div className="text-center py-10 border rounded-lg">
        <p className="text-muted-foreground">Questions management will be implemented soon.</p>
      </div>
    </div>
  );
};

export default AdminDashboard;