import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Route, Switch } from "wouter";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { Suspense, lazy } from "react";

// Lazy load pages for better performance
const Dashboard = lazy(() => import("./pages/dashboard"));
const AuthPage = lazy(() => import("./pages/auth-page"));
const NotFound = lazy(() => import("./pages/not-found"));
const Lesson = lazy(() => import("./pages/lesson"));

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute 
        path="/lesson/:lessonId" 
        component={({ params }) => {
          if (!params || !params.lessonId) {
            return <NotFound />;
          }
          return <Suspense fallback={<div>Loading...</div>}><Lesson lessonId={parseInt(params.lessonId)} /></Suspense>;
        }} 
      />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;