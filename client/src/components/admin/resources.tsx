import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Link, FileText, Image, Video, Audio } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Resource {
  id: number;
  subtopic_id: number;
  type: string;
  url: string;
  title: string;
  description: string;
  purpose: string;
  content_tags: string[];
  recommended_when: string;
  is_optional: boolean;
}

interface Subtopic {
  id: number;
  title: string;
  topic_id: number;
}

interface Topic {
  id: number;
  title: string;
  lesson_id: number;
}

interface Lesson {
  id: number;
  title: string;
}

export function ResourcesSection() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [formData, setFormData] = useState({
    subtopic_id: '',
    type: 'text',
    url: '',
    title: '',
    description: '',
    purpose: '',
    content_tags: [] as string[],
    recommended_when: '',
    is_optional: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resourcesRes, subtopicsRes, topicsRes, lessonsRes] = await Promise.all([
        fetch('/api/admin/resources'),
        fetch('/api/admin/subtopics'),
        fetch('/api/admin/topics'),
        fetch('/api/admin/lessons')
      ]);
      
      const resourcesData = await resourcesRes.json();
      const subtopicsData = await subtopicsRes.json();
      const topicsData = await topicsRes.json();
      const lessonsData = await lessonsRes.json();
      
      setResources(resourcesData);
      setSubtopics(subtopicsData);
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
      const url = editingResource 
        ? `/api/admin/resources/${editingResource.id}`
        : '/api/admin/resources';
      
      const method = editingResource ? 'PUT' : 'POST';
      
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
      console.error('Error saving resource:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;
    
    try {
      const response = await fetch(`/api/admin/resources/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting resource:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      subtopic_id: '',
      type: 'text',
      url: '',
      title: '',
      description: '',
      purpose: '',
      content_tags: [],
      recommended_when: '',
      is_optional: true
    });
    setEditingResource(null);
  };

  const openEditDialog = (resource: Resource) => {
    setEditingResource(resource);
    setFormData({
      subtopic_id: resource.subtopic_id.toString(),
      type: resource.type,
      url: resource.url || '',
      title: resource.title,
      description: resource.description || '',
      purpose: resource.purpose || '',
      content_tags: resource.content_tags || [],
      recommended_when: resource.recommended_when || '',
      is_optional: resource.is_optional
    });
    setIsDialogOpen(true);
  };

  const getResourcePath = (resource: Resource) => {
    const subtopic = subtopics.find(s => s.id === resource.subtopic_id);
    const topic = topics.find(t => t.id === subtopic?.topic_id);
    const lesson = lessons.find(l => l.id === topic?.lesson_id);
    
    return `${lesson?.title} > ${topic?.title} > ${subtopic?.title}`;
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <FileText className="h-4 w-4" />;
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'audio':
        return <Audio className="h-4 w-4" />;
      default:
        return <Link className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Resources Management</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Resource
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingResource ? 'Edit Resource' : 'Create New Resource'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Subtopic</label>
                <Select
                  value={formData.subtopic_id}
                  onValueChange={(value) => setFormData({ ...formData, subtopic_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subtopic" />
                  </SelectTrigger>
                  <SelectContent>
                    {subtopics.map((subtopic) => {
                      const topic = topics.find(t => t.id === subtopic.topic_id);
                      const lesson = lessons.find(l => l.id === topic?.lesson_id);
                      return (
                        <SelectItem key={subtopic.id} value={subtopic.id.toString()}>
                          {lesson?.title} > {topic?.title} > {subtopic.title}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="audio">Audio</SelectItem>
                      <SelectItem value="link">Link</SelectItem>
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
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">URL</label>
                <Input
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Purpose</label>
                <Input
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  placeholder="e.g., Introduction, Example, Exercise"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Recommended When</label>
                <Input
                  value={formData.recommended_when}
                  onChange={(e) => setFormData({ ...formData, recommended_when: e.target.value })}
                  placeholder="e.g., After completing the previous topic"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_optional"
                  checked={formData.is_optional}
                  onChange={(e) => setFormData({ ...formData, is_optional: e.target.checked })}
                  className="h-4 w-4"
                />
                <label htmlFor="is_optional" className="text-sm font-medium">
                  Optional Resource
                </label>
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
                  {editingResource ? 'Update' : 'Create'}
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
        <div className="grid gap-4 md:grid-cols-2">
          {resources.map((resource) => (
            <Card key={resource.id} className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-2">
                  {getResourceIcon(resource.type)}
                  <h4 className="font-semibold">{resource.title}</h4>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(resource)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => handleDelete(resource.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-2">
                {resource.description || 'No description provided'}
              </p>
              
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Path:</span>{' '}
                  {getResourcePath(resource)}
                </p>
                
                {resource.url && (
                  <p className="text-sm">
                    <span className="font-medium">URL:</span>{' '}
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {resource.url}
                    </a>
                  </p>
                )}
                
                {resource.purpose && (
                  <p className="text-sm">
                    <span className="font-medium">Purpose:</span>{' '}
                    {resource.purpose}
                  </p>
                )}
                
                {resource.recommended_when && (
                  <p className="text-sm">
                    <span className="font-medium">Recommended When:</span>{' '}
                    {resource.recommended_when}
                  </p>
                )}
                
                <p className="text-sm">
                  <span className="font-medium">Status:</span>{' '}
                  {resource.is_optional ? 'Optional' : 'Required'}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 
 
 
 