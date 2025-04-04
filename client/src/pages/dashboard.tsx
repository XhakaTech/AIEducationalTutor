import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut, Bitcoin, Award, BookOpen, Check, CheckCircle, Zap, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomLessonsList } from "@/components/custom-lesson/custom-lessons-list";
import { CreateLessonDialog } from "@/components/custom-lesson/create-lesson-dialog";
import { useState } from "react";

export default function Dashboard() {
  const { user, logoutMutation } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('regular');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  const { data: lessons = [], isLoading, error } = useQuery<any[]>({
    queryKey: ["/api/lessons", user?.id],
    queryFn: () => fetch(`/api/lessons?userId=${user?.id}`).then(res => res.json()),
    enabled: !!user
  });

  // Calculate overall learning progress
  const overallProgress = lessons && lessons.length > 0
    ? Math.round(
        lessons.reduce((sum, lesson) => sum + (lesson.progress || 0), 0) / lessons.length
      )
    : 0;
    
  // Count completed lessons
  const completedLessons = lessons ? lessons.filter(lesson => lesson.progress === 100).length : 0;

  const startLesson = (lessonId: number) => {
    navigate(`/lesson/${lessonId}`);
  };
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const handleCustomLessonCreated = (newLesson: any) => {
    // This will be handled by the CustomLessonsList component
    setActiveTab('custom');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <header className="bg-white shadow-sm z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Bitcoin className="h-8 w-8 text-primary" />
                  <span className="ml-2 text-xl font-heading font-semibold text-foreground">Crypto Academy</span>
                </div>
              </div>
              {user && (
                <div className="flex items-center">
                  <span className="text-sm text-muted-foreground mr-4">{user.name}</span>
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium mr-4">
                    {user.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <Button variant="outline" size="sm" onClick={handleLogout} disabled={logoutMutation.isPending}>
                    <LogOut className="h-4 w-4 mr-2" />
                    {logoutMutation.isPending ? "Logging out..." : "Logout"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-center items-center pt-20">
            <div className="h-16 w-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 p-6">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
          <h1 className="text-xl font-bold text-red-500 mb-2">Error</h1>
          <p className="text-neutral-600">Failed to load lessons. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <header className="bg-white/95 backdrop-blur-sm shadow-md z-10 sticky top-0 border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center animate-float">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Bitcoin className="h-7 w-7 text-primary" />
                </div>
                <span className="ml-3 text-xl font-heading font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Crypto Academy</span>
              </div>
            </div>
            {user && (
              <div className="flex items-center">
                <span className="text-sm font-medium text-muted-foreground mr-4">{user.name}</span>
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-medium shadow-md mr-4">
                  {user.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout} 
                  disabled={logoutMutation.isPending}
                  className="shadow-sm hover:shadow-md transition-all"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {logoutMutation.isPending ? "Logging out..." : "Logout"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="bg-white/90 shadow-md hover:shadow-lg transition-shadow rounded-xl overflow-hidden border-0 animate-slide-up" style={{animationDelay: "0ms"}}>
            <CardContent className="p-0">
              <div className="h-1.5 bg-gradient-to-r from-primary to-primary/60 w-full"></div>
              <div className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-primary/10 rounded-full mr-4">
                    <Zap className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-muted-foreground">Overall Progress</h3>
                    <div className="mt-1 flex items-baseline">
                      <p className="text-3xl font-bold text-foreground">{overallProgress}%</p>
                      <p className="ml-2 text-sm text-muted-foreground">complete</p>
                    </div>
                  </div>
                </div>
                <Progress value={overallProgress} className="h-2.5 mt-5" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/90 shadow-md hover:shadow-lg transition-shadow rounded-xl overflow-hidden border-0 animate-slide-up" style={{animationDelay: "100ms"}}>
            <CardContent className="p-0">
              <div className="h-1.5 bg-gradient-to-r from-secondary to-secondary/60 w-full"></div>
              <div className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-secondary/10 rounded-full mr-4">
                    <CheckCircle className="h-7 w-7 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-muted-foreground">Lessons Completed</h3>
                    <div className="mt-1 flex items-baseline">
                      <p className="text-3xl font-bold text-foreground">{completedLessons}</p>
                      <p className="ml-2 text-sm text-muted-foreground">of {lessons.length} lessons</p>
                    </div>
                  </div>
                </div>
                <Progress value={(completedLessons / lessons.length) * 100} className="h-2.5 mt-5 bg-muted" color="secondary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/90 shadow-md hover:shadow-lg transition-shadow rounded-xl overflow-hidden border-0 animate-slide-up" style={{animationDelay: "200ms"}}>
            <CardContent className="p-0">
              <div className="h-1.5 bg-gradient-to-r from-accent to-accent/60 w-full"></div>
              <div className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-accent/10 rounded-full mr-4">
                    <Award className="h-7 w-7 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-muted-foreground">Learning Streak</h3>
                    <div className="mt-1 flex items-baseline">
                      <p className="text-3xl font-bold text-foreground">1</p>
                      <p className="ml-2 text-sm text-muted-foreground">days</p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 flex justify-between gap-2">
                  <div className="h-2.5 flex-1 rounded-full bg-accent/20"></div>
                  <div className="h-2.5 flex-1 rounded-full bg-accent animate-pulse-subtle"></div>
                  <div className="h-2.5 flex-1 rounded-full bg-accent/20"></div>
                  <div className="h-2.5 flex-1 rounded-full bg-accent/20"></div>
                  <div className="h-2.5 flex-1 rounded-full bg-accent/20"></div>
                  <div className="h-2.5 flex-1 rounded-full bg-accent/20"></div>
                  <div className="h-2.5 flex-1 rounded-full bg-accent/20"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mb-8 animate-slide-up" style={{animationDelay: "300ms"}}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <h1 className="text-3xl font-heading font-bold text-foreground">Your Learning Journey</h1>
            <Button 
              onClick={() => setCreateDialogOpen(true)}
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Custom Lesson
            </Button>
          </div>
          
          <Tabs 
            defaultValue="regular" 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="mb-6"
          >
            <TabsList className="grid w-full grid-cols-2 max-w-md rounded-lg p-1 bg-muted/70 backdrop-blur-sm shadow-inner">
              <TabsTrigger 
                value="regular" 
                className="rounded-md data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-200"
              >
                Regular Courses
              </TabsTrigger>
              <TabsTrigger 
                value="custom"
                className="rounded-md data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-200"
              >
                Custom Courses
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="regular" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lessons && lessons.length > 0 ? (
                  lessons.map((lesson: any, index: number) => (
                    <Card 
                      key={lesson.id} 
                      className="overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer relative border-0 rounded-xl animate-slide-up bg-white/90" 
                      onClick={() => startLesson(lesson.id)}
                      style={{animationDelay: `${index * 100}ms`}}
                    >
                      {lesson.progress === 100 && (
                        <div className="absolute top-3 right-3 z-10">
                          <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md">
                            <Check className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        </div>
                      )}
                      <div 
                        className="h-48 relative" 
                        style={{
                          background: `linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))`,
                          backgroundSize: '200% 200%',
                          animation: 'gradientFlow 15s ease infinite'
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent">
                          <div className="absolute inset-0 flex items-center justify-center">
                            {lesson.icon ? (
                              <span className="text-white text-6xl opacity-60 animate-float">{lesson.icon}</span>
                            ) : (
                              <BookOpen className="h-16 w-16 text-white opacity-60 animate-float" />
                            )}
                          </div>
                          <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="text-2xl font-heading font-bold text-white drop-shadow-md">{lesson.title}</h3>
                          </div>
                        </div>
                      </div>
                      <CardContent className="p-5">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm font-medium text-muted-foreground px-2 py-1 bg-muted rounded-full">{lesson.topics?.length || 0} topics</span>
                          <span className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">{lesson.progress || 0}% complete</span>
                        </div>
                        <Progress 
                          value={lesson.progress || 0} 
                          className="h-2.5 mb-4" 
                          style={{
                            background: 'hsl(var(--muted))',
                            backgroundSize: '200% 200%'
                          }}
                        />
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{lesson.description}</p>
                        
                        {lesson.final_test_result && (
                          <div className="mt-4 pt-3 border-t border-border/50">
                            <div className="flex items-center">
                              <div className="p-1.5 bg-yellow-100 rounded-full mr-2">
                                <Award className="h-4 w-4 text-yellow-500" />
                              </div>
                              <span className="text-sm font-medium">Final Score: {lesson.final_test_result.score}%</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-3 flex flex-col items-center justify-center py-16 text-center bg-white/50 rounded-xl shadow-sm border border-border/50 animate-fade-in">
                    <div className="p-4 rounded-full bg-muted mb-4">
                      <BookOpen className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">No courses available yet</h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-md px-6">
                      It looks like the regular courses aren't loading properly. Try refreshing the page or check back later.
                    </p>
                    <Button variant="outline" onClick={() => window.location.reload()}>
                      Refresh Page
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="custom" className="mt-6">
              <CustomLessonsList className="" />
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Create Custom Lesson Dialog */}
        <CreateLessonDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onLessonCreated={handleCustomLessonCreated}
        />
      </main>
    </div>
  );
}
