import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Book, FileText, Link } from 'lucide-react';

interface DashboardStats {
  totalLessons: number;
  totalTopics: number;
  totalResources: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalLessons: 0,
    totalTopics: 0,
    totalResources: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) return;

        const [lessonsRes, topicsRes, resourcesRes] = await Promise.all([
          fetch('/api/admin/lessons', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch('/api/admin/topics/1', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch('/api/admin/resources/1', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (!lessonsRes.ok || !topicsRes.ok || !resourcesRes.ok) {
          throw new Error('Failed to fetch stats');
        }

        const [lessons, topics, resources] = await Promise.all([
          lessonsRes.json(),
          topicsRes.json(),
          resourcesRes.json(),
        ]);

        setStats({
          totalLessons: lessons.length,
          totalTopics: topics.length,
          totalResources: resources.length,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your educational content
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Lessons
            </CardTitle>
            <Book className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLessons}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Topics
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTopics}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Resources
            </CardTitle>
            <Link className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalResources}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
 
 
 