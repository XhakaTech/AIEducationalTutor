import { useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Lesson from "@/pages/lesson";

function SimpleRouter() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [pathParams, setPathParams] = useState<Record<string, string>>({});

  // Handle navigation and path changes
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
      
      // Parse path parameters if we're on a lesson page
      if (window.location.pathname.startsWith('/lesson/')) {
        const id = window.location.pathname.split('/')[2];
        setPathParams({ id });
      } else {
        setPathParams({});
      }
    };

    // Listen for history changes
    window.addEventListener('popstate', handleLocationChange);
    
    // Initial path parsing
    handleLocationChange();

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  // Create a simple navigation function
  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    
    // Parse path parameters
    if (path.startsWith('/lesson/')) {
      const id = path.split('/')[2];
      setPathParams({ id });
    } else {
      setPathParams({});
    }
  };

  // Make navigate available globally
  (window as any).navigate = navigate;

  // Simulate authentication - in a real app this would check for an existing session
  useEffect(() => {
    const autoLogin = async () => {
      try {
        // For demo purposes, automatically log in as the demo user
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'student', password: 'password' }),
          credentials: 'include'
        });
        
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Error during auto-login:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    autoLogin();
  }, []);

  // If we're still checking auth status, show a loading state
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="h-16 w-16 mx-auto border-t-4 border-primary-600 border-solid rounded-full animate-spin"></div>
          <p className="mt-4 text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Render the appropriate component based on the current path
  let content;
  if (currentPath === '/') {
    content = <Dashboard user={user} />;
  } else if (currentPath.startsWith('/lesson/') && pathParams.id) {
    const lessonId = parseInt(pathParams.id);
    content = <Lesson lessonId={lessonId} user={user} />;
  } else {
    content = <NotFound />;
  }

  return (
    <div className="app-container">
      {content}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SimpleRouter />
      <Toaster />
    </QueryClientProvider>
  );
}

// Patch the useLocation hook for compatibility with existing code
// @ts-ignore
window.useLocation = () => {
  const [path, setPath] = useState(window.location.pathname);
  
  const navigate = (to: string) => {
    window.history.pushState({}, '', to);
    setPath(to);
    // Also trigger our global navigation function if it exists
    if ((window as any).navigate) {
      (window as any).navigate(to);
    }
  };
  
  return [path, navigate];
};

export default App;
