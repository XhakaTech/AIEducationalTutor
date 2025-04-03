import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface DashboardProps {
  user: any;
}

export default function Dashboard({ user }: DashboardProps) {
  const { data: lessons = [], isLoading, error } = useQuery<any[]>({
    queryKey: [`/api/lessons?userId=${user.id}`],
  });

  const startLesson = (lessonId: number) => {
    // Use direct navigation with our custom function or fallback to traditional navigation
    if ((window as any).navigate) {
      (window as any).navigate(`/lesson/${lessonId}`);
    } else {
      window.location.href = `/lesson/${lessonId}`;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <header className="bg-white shadow-sm z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <svg className="h-8 w-8 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3L1 9L5 11.18V17.18L12 21L19 17.18V11.18L21 10.09V17H23V9L12 3ZM18.82 9L12 12.72L5.18 9L12 5.28L18.82 9ZM17 15.99L12 18.72L7 15.99V12.27L12 15L17 12.27V15.99Z"></path>
                  </svg>
                  <span className="ml-2 text-xl font-heading font-semibold text-neutral-900">AI Educational Tutor</span>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-neutral-600 mr-4">{user.name}</span>
                <div className="h-8 w-8 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 font-medium">
                  {user.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-center items-center pt-20">
            <div className="h-16 w-16 border-t-4 border-primary-600 border-solid rounded-full animate-spin"></div>
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
      <header className="bg-white shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <svg className="h-8 w-8 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3L1 9L5 11.18V17.18L12 21L19 17.18V11.18L21 10.09V17H23V9L12 3ZM18.82 9L12 12.72L5.18 9L12 5.28L18.82 9ZM17 15.99L12 18.72L7 15.99V12.27L12 15L17 12.27V15.99Z"></path>
                </svg>
                <span className="ml-2 text-xl font-heading font-semibold text-neutral-900">AI Educational Tutor</span>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-neutral-600 mr-4">{user.name}</span>
              <div className="h-8 w-8 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 font-medium">
                {user.name.split(' ').map((n: string) => n[0]).join('')}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-heading font-bold text-neutral-900 mb-6">Your Courses</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons?.map((lesson: any) => (
              <Card 
                key={lesson.id} 
                className="overflow-hidden hover:shadow-lg transition duration-150 cursor-pointer" 
                onClick={() => startLesson(lesson.id)}
              >
                <div className="h-40 bg-gradient-to-r from-primary-500 to-primary-600 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white text-5xl opacity-30">{lesson.icon}</span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-heading font-semibold text-white">{lesson.title}</h3>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-neutral-600">{lesson.topics?.length || 0} topics</span>
                    <span className="text-sm font-medium text-primary-600">{lesson.progress || 0}% complete</span>
                  </div>
                  <Progress value={lesson.progress || 0} className="h-2.5" />
                  <p className="mt-4 text-sm text-neutral-600 line-clamp-2">{lesson.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
