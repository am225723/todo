'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Task } from '@/types';
import { TaskList } from '@/components/dashboard/TaskList';
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

export default function DashboardPage() {
  const { user, profile, loading, isAdmin } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskOpen, setNewTaskOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/login';
    } else if (user) {
      fetchTasks();
    }
  }, [user, loading]);

  const fetchTasks = async () => {
    try {
      // Assuming GET /api/tasks fetches tasks for the logged-in user
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
      if (!newTaskTitle) return;

      try {
          const response = await fetch('/api/tasks', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  title: newTaskTitle,
                  user_id: user?.id,
                  status: 'pending'
              })
          });

          if (response.ok) {
              setNewTaskTitle('');
              setNewTaskOpen(false);
              fetchTasks();
              toast({
                  title: "Success",
                  description: "Task added successfully"
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
      if (!t.due_date) return true; // Treat no due date as "Available Now"
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
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold mb-2">
            Hello, {profile?.display_name || user?.email?.split('@')[0]}!
            </h1>
            <p className="text-muted-foreground">
            Let&apos;s get things done.
            </p>
        </div>
        {isAdmin && (
            <Button variant="outline" onClick={() => window.location.href = '/admin'}>
                Admin Dashboard
            </Button>
        )}
      </div>

      <div className="mb-6">
          <Dialog open={newTaskOpen} onOpenChange={setNewTaskOpen}>
              <DialogTrigger asChild>
                  <Button className="w-full h-12 text-lg shadow-md">
                      <Plus className="mr-2" /> Add New Task
                  </Button>
              </DialogTrigger>
              <DialogContent>
                  <DialogHeader>
                      <DialogTitle>Add New Task</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateTask} className="space-y-4">
                      <div className="space-y-2">
                          <Label htmlFor="taskTitle">Task Title</Label>
                          <Input
                            id="taskTitle"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            placeholder="What needs to be done?"
                            autoFocus
                          />
                      </div>
                      <Button type="submit" className="w-full">Create Task</Button>
                  </form>
              </DialogContent>
          </Dialog>
      </div>

      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
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
      </Tabs>
    </div>
  );
}
