import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Book, 
  Layers, 
  FileText, 
  Settings, 
  Users, 
  BarChart2,
  LogOut
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('lessons');

  const sections = [
    { id: 'lessons', label: 'Lessons', icon: Book },
    { id: 'topics', label: 'Topics', icon: Layers },
    { id: 'resources', label: 'Resources', icon: FileText },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = () => {
    // Implement logout logic
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-card/50 backdrop-blur-sm border-r border-border/50">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Admin Panel
          </h1>
        </div>
        
        <nav className="p-4 space-y-2">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Button
                key={section.id}
                variant={activeSection === section.id ? "default" : "ghost"}
                className="w-full justify-start gap-2"
                onClick={() => setActiveSection(section.id)}
              >
                <Icon className="h-4 w-4" />
                {section.label}
              </Button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-destructive hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 capitalize">
            {activeSection}
          </h2>
          
          <div className="grid gap-6">
            {activeSection === 'lessons' && <LessonsSection />}
            {activeSection === 'topics' && <TopicsSection />}
            {activeSection === 'resources' && <ResourcesSection />}
            {activeSection === 'users' && <UsersSection />}
            {activeSection === 'analytics' && <AnalyticsSection />}
            {activeSection === 'settings' && <SettingsSection />}
          </div>
        </div>
      </div>
    </div>
  );
}

// Placeholder components for each section
function LessonsSection() {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">Lessons Management</h3>
      <p>Lessons content will go here</p>
    </Card>
  );
}

function TopicsSection() {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">Topics Management</h3>
      <p>Topics content will go here</p>
    </Card>
  );
}

function ResourcesSection() {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">Resources Management</h3>
      <p>Resources content will go here</p>
    </Card>
  );
}

function UsersSection() {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">Users Management</h3>
      <p>Users content will go here</p>
    </Card>
  );
}

function AnalyticsSection() {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">Analytics Dashboard</h3>
      <p>Analytics content will go here</p>
    </Card>
  );
}

function SettingsSection() {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">Settings</h3>
      <p>Settings content will go here</p>
    </Card>
  );
} 
 
 
 