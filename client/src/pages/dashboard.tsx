import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut, Bitcoin, Award, BookOpen, Check, CheckCircle, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { user, logoutMutation } = useAuth();
  const [, navigate] = useLocation();
  
  const { data: lessons = [], isLoading, error } = useQuery<any[]>({
    queryKey: ["/api/lessons", user?.id],
    queryFn: () => fetch(`/api/lessons?userId=${user?.id}`).then(res => res.json()),
    enabled: !!user
  });

  // Calculate overall learning progress
  const overallProgress = lessons.length > 0
    ? Math.round(
        lessons.reduce((sum, lesson) => sum + (lesson.progress || 0), 0) / lessons.length
      )
    : 0;
    
  // Count completed lessons
  const completedLessons = lessons.filter(lesson => lesson.progress === 100).length;

  const startLesson = (lessonId: number) => {
    navigate(`/lesson/${lessonId}`);
  };
  
  const handleLogout = () => {
    logoutMutation.mutate();
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
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white shadow-sm z-10 sticky top-0">
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
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-50 rounded-full mr-4">
                  <Zap className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-700">Overall Progress</h3>
                  <div className="mt-1 flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">{overallProgress}%</p>
                    <p className="ml-2 text-sm text-gray-500">complete</p>
                  </div>
                </div>
              </div>
              <Progress value={overallProgress} className="h-2.5 mt-4" />
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-50 rounded-full mr-4">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-700">Lessons Completed</h3>
                  <div className="mt-1 flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">{completedLessons}</p>
                    <p className="ml-2 text-sm text-gray-500">of {lessons.length} lessons</p>
                  </div>
                </div>
              </div>
              <Progress value={(completedLessons / lessons.length) * 100} className="h-2.5 mt-4" />
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-50 rounded-full mr-4">
                  <Award className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-700">Learning Streak</h3>
                  <div className="mt-1 flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">1</p>
                    <p className="ml-2 text-sm text-gray-500">days</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-between">
                <div className="w-8 h-2 bg-purple-200 rounded-full"></div>
                <div className="w-8 h-2 bg-purple-500 rounded-full"></div>
                <div className="w-8 h-2 bg-purple-200 rounded-full"></div>
                <div className="w-8 h-2 bg-purple-200 rounded-full"></div>
                <div className="w-8 h-2 bg-purple-200 rounded-full"></div>
                <div className="w-8 h-2 bg-purple-200 rounded-full"></div>
                <div className="w-8 h-2 bg-purple-200 rounded-full"></div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mb-8">
          <h1 className="text-2xl font-heading font-bold text-neutral-900 mb-6">Your Courses</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons?.map((lesson: any) => (
              <Card 
                key={lesson.id} 
                className="overflow-hidden hover:shadow-lg transition duration-150 cursor-pointer relative" 
                onClick={() => startLesson(lesson.id)}
              >
                {lesson.progress === 100 && (
                  <div className="absolute top-3 right-3 z-10">
                    <Badge className="bg-green-500">
                      <Check className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  </div>
                )}
                <div className="h-40 bg-gradient-to-r from-primary to-primary/60 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white text-5xl opacity-30">{lesson.icon || <BookOpen className="h-12 w-12" />}</span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-heading font-semibold text-white">{lesson.title}</h3>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-muted-foreground">{lesson.topics?.length || 0} topics</span>
                    <span className="text-sm font-medium text-primary">{lesson.progress || 0}% complete</span>
                  </div>
                  <Progress value={lesson.progress || 0} className="h-2.5" />
                  <p className="mt-4 text-sm text-muted-foreground line-clamp-2">{lesson.description}</p>
                  
                  {lesson.final_test_result && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center">
                        <Award className="h-4 w-4 text-yellow-500 mr-2" />
                        <span className="text-sm font-medium">Final Score: {lesson.final_test_result.score}%</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
