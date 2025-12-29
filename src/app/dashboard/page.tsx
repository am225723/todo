'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Task } from '@/types';
import { TaskList } from '@/components/dashboard/TaskList';
import { CalendarView } from '@/components/dashboard/CalendarView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function DashboardPage() {
  const { user, profile, loading, isAdmin } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Task Form State
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [isAgentTask, setIsAgentTask] = useState(false);
  const [agentUrl, setAgentUrl] = useState('');
  const [openInNewWindow, setOpenInNewWindow] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/login';
    } else if (user) {
      fetchTasks();
    }
  }, [user, loading]);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';

    // Optimistic update
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus as any } : t));

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      if (newStatus === 'completed') {
        toast({
            title: "Task Completed",
            description: "Good job!",
        });
      }
    } catch (error) {
      console.error('Error updating task:', error);
      // Revert optimistic update
      fetchTasks();
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!title) return;

      try {
          const formData = new FormData();
          formData.append('title', title);
          formData.append('description', description);
          formData.append('priority', priority);
          if (dueDate) formData.append('due_date', dueDate);
          formData.append('is_agent_task', isAgentTask.toString());
          if (isAgentTask && agentUrl) formData.append('agent_url', agentUrl);
          if (isAgentTask) formData.append('open_in_new_window', openInNewWindow.toString());
          if (file) formData.append('file', file);

          // Note: we don't send user_id, the API will handle it based on auth session
          // or we can send it if needed, but it's safer to let API resolve it.
          // However, existing code might expect it or use it. API now resolves it.

          const response = await fetch('/api/tasks', {
              method: 'POST',
              body: formData,
          });

          if (response.ok) {
              // Reset form
              setTitle('');
              setDescription('');
              setPriority('medium');
              setDueDate('');
              setIsAgentTask(false);
              setAgentUrl('');
              setOpenInNewWindow(false);
              setFile(null);
              setNewTaskOpen(false);
              fetchTasks();
              toast({
                  title: "Success",
                  description: "Task added successfully"
              });
          } else {
              const errorData = await response.json();
              toast({
                  title: "Error",
                  description: errorData.error || "Failed to create task",
                  variant: "destructive"
              });
          }
      } catch (error) {
          toast({
              title: "Error",
              description: "Failed to create task",
              variant: "destructive"
          });
      }
  }

  if (loading || isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dailyTasks = tasks.filter(t => {
      if (t.status === 'completed') return false;
      if (!t.due_date) return true;
      const due = new Date(t.due_date);
      due.setHours(0,0,0,0);
      return due.getTime() <= today.getTime();
  });

  const futureTasks = tasks.filter(t => {
      if (t.status === 'completed') return false;
      if (!t.due_date) return false;
      const due = new Date(t.due_date);
      due.setHours(0,0,0,0);
      return due.getTime() > today.getTime();
  });

  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="container mx-auto py-8 px-4 pb-20">
      <div className="logo-container">
        <img src="/logo.png" alt="Integrative Psychiatry" className="logo-image" />
      </div>
      <div className="flex justify-between items-center mb-8 glass p-6 rounded-2xl">
        <div>
            <h1 className="text-3xl font-bold mb-2 text-primary">
            Hello, {profile?.display_name || user?.email?.split('@')[0]}!
            </h1>
            <p className="text-muted-foreground">
            Let&apos;s get things done.
            </p>
        </div>
        <div className="flex items-center gap-2">
            {isAdmin && (
                <Button variant="outline" onClick={() => window.location.href = '/admin'}>
                    Admin Dashboard
                </Button>
            )}
            <Button variant="destructive" onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                window.location.href = '/login';
            }}>
                Logout
            </Button>
        </div>
      </div>

      <div className="mb-6">
          <Dialog open={newTaskOpen} onOpenChange={setNewTaskOpen}>
              <DialogTrigger asChild>
                  <Button className="w-full h-12 text-lg shadow-md">
                      <Plus className="mr-2" /> Add New Task
                  </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                      <DialogTitle>Add New Task</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateTask} className="space-y-4">
                      <div className="space-y-2">
                          <Label htmlFor="title">Task Title</Label>
                          <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="What needs to be done?"
                            required
                          />
                      </div>

                      <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add details..."
                          />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                              <Label htmlFor="priority">Priority</Label>
                              <Select value={priority} onValueChange={setPriority}>
                                  <SelectTrigger>
                                      <SelectValue placeholder="Select priority" />
                                  </SelectTrigger>
                                  <SelectContent>
                                      <SelectItem value="low">Low</SelectItem>
                                      <SelectItem value="medium">Medium</SelectItem>
                                      <SelectItem value="high">High</SelectItem>
                                      <SelectItem value="urgent">Urgent</SelectItem>
                                  </SelectContent>
                              </Select>
                          </div>

                          <div className="space-y-2">
                              <Label htmlFor="due_date">Due Date</Label>
                              <Input
                                id="due_date"
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                              />
                          </div>
                      </div>

                      <div className="space-y-4 border p-4 rounded-md">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="is_agent"
                            checked={isAgentTask}
                            onCheckedChange={(checked) => setIsAgentTask(!!checked)}
                          />
                          <Label htmlFor="is_agent">Is Agent Task?</Label>
                        </div>
                        {isAgentTask && (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="agentUrl">Agent URL</Label>
                              <Input
                                id="agentUrl"
                                value={agentUrl}
                                onChange={(e) => setAgentUrl(e.target.value)}
                                placeholder="https://..."
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="openInNewWindow"
                                checked={openInNewWindow}
                                onCheckedChange={(c) => setOpenInNewWindow(!!c)}
                              />
                              <Label htmlFor="openInNewWindow">Open in new window</Label>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="space-y-2">
                          <Label htmlFor="file">Attachment (Photo or PDF)</Label>
                          <Input
                            id="file"
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                          />
                      </div>

                      <Button type="submit" className="w-full">Create Task</Button>
                  </form>
              </DialogContent>
          </Dialog>
      </div>

      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="today">
            <TaskList
                title="Today's Tasks"
                tasks={dailyTasks}
                onToggleStatus={handleToggleStatus}
            />
        </TabsContent>

        <TabsContent value="upcoming">
            <TaskList
                title="Upcoming Tasks"
                tasks={futureTasks}
                onToggleStatus={handleToggleStatus}
            />
        </TabsContent>

        <TabsContent value="completed">
             <TaskList
                title="Completed Tasks"
                tasks={completedTasks}
                onToggleStatus={handleToggleStatus}
            />
        </TabsContent>

        <TabsContent value="calendar">
            <CalendarView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
