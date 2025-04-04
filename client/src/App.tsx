import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Switch, Route } from "wouter";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Lesson from "@/pages/lesson";
import AuthPage from "@/pages/auth-page";
import AdminDashboard from "@/pages/admin-dashboard";
import CustomLesson from './pages/custom-lesson';

function Router() {
  return (
    <Switch>
      {/* Protected routes */}
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute 
        path="/lesson/:id" 
        component={({ params }) => {
          if (!params?.id) return <NotFound />;
          return <Lesson lessonId={parseInt(params.id)} />;
        }} 
      />
      
      {/* Public routes */}
      <Route path="/custom-lesson/:lessonId" component={({ params }) => <CustomLesson lessonId={params.lessonId} />} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/admin" component={AdminDashboard} />
      
      {/* Catch-all route */}
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