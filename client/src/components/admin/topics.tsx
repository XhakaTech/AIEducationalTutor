import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Topic {
  id: number;
  lesson_id: number;
  title: string;
  order: number;
}

interface Lesson {
  id: number;
  title: string;
}

export function TopicsSection() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [formData, setFormData] = useState({
    lesson_id: '',
    title: '',
    order: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [topicsRes, lessonsRes] = await Promise.all([
        fetch('/api/admin/topics'),
        fetch('/api/admin/lessons')
      ]);
      
      const topicsData = await topicsRes.json();
      const lessonsData = await lessonsRes.json();
      
      setTopics(topicsData);
      setLessons(lessonsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingTopic 
        ? `/api/admin/topics/${editingTopic.id}`
        : '/api/admin/topics';
      
      const method = editingTopic ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchData();
        setIsDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving topic:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this topic?')) return;
    
    try {
      const response = await fetch(`/api/admin/topics/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting topic:', error);
    }
  };

  const handleOrderChange = async (topicId: number, direction: 'up' | 'down') => {
    try {
      const response = await fetch(`/api/admin/topics/${topicId}/order`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ direction }),
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error updating topic order:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      lesson_id: '',
      title: '',
      order: 0
    });
    setEditingTopic(null);
  };

  const openEditDialog = (topic: Topic) => {
    setEditingTopic(topic);
    setFormData({
      lesson_id: topic.lesson_id.toString(),
      title: topic.title,
      order: topic.order
    });
    setIsDialogOpen(true);
  };

  const getLessonTitle = (lessonId: number) => {
    const lesson = lessons.find(l => l.id === lessonId);
    return lesson ? lesson.title : 'Unknown Lesson';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Topics Management</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Topic
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTopic ? 'Edit Topic' : 'Create New Topic'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Lesson</label>
                <Select
                  value={formData.lesson_id}
                  onValueChange={(value) => setFormData({ ...formData, lesson_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a lesson" />
                  </SelectTrigger>
                  <SelectContent>
                    {lessons.map((lesson) => (
                      <SelectItem key={lesson.id} value={lesson.id.toString()}>
                        {lesson.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Order</label>
                <Input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  min="0"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingTopic ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {topics.map((topic) => (
            <Card key={topic.id} className="p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col space-y-1">
                    <h4 className="font-semibold">{topic.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {getLessonTitle(topic.lesson_id)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOrderChange(topic.id, 'up')}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOrderChange(topic.id, 'down')}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(topic)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => handleDelete(topic.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 
 
 
 