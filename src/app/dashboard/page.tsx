'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Task } from '@/types';
import { TaskList } from '@/components/dashboard/TaskList';
import { CalendarView } from '@/components/dashboard/CalendarView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, LayoutDashboard, Calendar as CalendarIcon, CheckCircle2, ListTodo, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

  // Recurring Task State
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState('daily');
  const [recurrenceInterval, setRecurrenceInterval] = useState('1');

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
            description: "Great job keeping up!",
        });
        // If it was a recurring task, we should re-fetch to see the new task
        // But for now, let's just wait or re-fetch silently
        fetchTasks();
      }
    } catch (error) {
      console.error('Error updating task:', error);
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

          if (isRecurring) {
            formData.append('is_recurring', 'true');
            formData.append('recurrence_pattern', JSON.stringify({
                type: recurrenceType,
                interval: parseInt(recurrenceInterval)
            }));
          }

          const response = await fetch('/api/tasks', {
              method: 'POST',
              body: formData,
          });

          if (response.ok) {
              setTitle('');
              setDescription('');
              setPriority('medium');
              setDueDate('');
              setIsAgentTask(false);
              setAgentUrl('');
              setOpenInNewWindow(false);
              setFile(null);
              setIsRecurring(false);
              setRecurrenceType('daily');
              setRecurrenceInterval('1');
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
    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"
            />
        </div>
    );
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 pb-24">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-md bg-white/70 dark:bg-slate-950/70 border-b border-slate-200/50 dark:border-slate-800/50">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                      <img src="/logo.png" alt="Logo" className="w-6 h-6 brightness-0 invert" />
                  </div>
                  <div>
                      <h1 className="font-bold text-lg leading-tight text-slate-800 dark:text-slate-100">Integrative Psychiatry</h1>
                      <p className="text-xs text-slate-500 font-medium">Dashboard</p>
                  </div>
              </div>

              <div className="flex items-center gap-4">
                   <div className="hidden md:block text-right">
                       <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{profile?.display_name || user?.email?.split('@')[0]}</p>
                       <p className="text-xs text-slate-500">{isAdmin ? 'Administrator' : 'Client'}</p>
                   </div>
                   <Avatar className="h-10 w-10 border-2 border-white shadow-sm cursor-pointer hover:scale-105 transition-transform">
                       <AvatarImage src={profile?.avatar_url || ''} />
                       <AvatarFallback className="bg-indigo-100 text-indigo-700">
                            {user?.email?.substring(0,2).toUpperCase()}
                       </AvatarFallback>
                   </Avatar>
                   <Button variant="ghost" size="icon" onClick={async () => {
                        await fetch('/api/auth/logout', { method: 'POST' });
                        window.location.href = '/login';
                   }}>
                       <LogOut className="w-5 h-5 text-slate-500 hover:text-red-500" />
                   </Button>
              </div>
          </div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
        >
            <div>
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-400">
                    Welcome Back
                </h2>
                <p className="text-slate-500 mt-1">Here&apos;s what&apos;s on your plate today.</p>
            </div>

            <Dialog open={newTaskOpen} onOpenChange={setNewTaskOpen}>
                <DialogTrigger asChild>
                    <Button size="lg" className="rounded-full shadow-xl shadow-indigo-500/25 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all hover:scale-105 active:scale-95">
                        <Plus className="mr-2 h-5 w-5" /> New Task
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto sm:max-w-lg">
                  <DialogHeader>
                      <DialogTitle className="text-xl">Create New Task</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateTask} className="space-y-4 mt-4">
                      <div className="space-y-2">
                          <Label htmlFor="title" className="text-slate-600">Task Title</Label>
                          <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Morning Meditation"
                            required
                            className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                          />
                      </div>

                      <div className="space-y-2">
                          <Label htmlFor="description" className="text-slate-600">Description</Label>
                          <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add details..."
                            className="bg-slate-50 border-slate-200 focus:bg-white transition-colors min-h-[100px]"
                          />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                              <Label htmlFor="priority">Priority</Label>
                              <Select value={priority} onValueChange={setPriority}>
                                  <SelectTrigger className="bg-slate-50">
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
                                className="bg-slate-50"
                              />
                          </div>
                      </div>

                      {/* Recurrence Options */}
                      <div className="space-y-2 border p-3 rounded-lg bg-slate-50/50">
                          <div className="flex items-center space-x-2">
                              <Checkbox
                                id="is_recurring"
                                checked={isRecurring}
                                onCheckedChange={(checked) => setIsRecurring(!!checked)}
                              />
                              <Label htmlFor="is_recurring" className="font-medium cursor-pointer">Repeat Task?</Label>
                          </div>
                          <AnimatePresence>
                              {isRecurring && (
                                  <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="space-y-3 pl-6 pt-2 overflow-hidden"
                                  >
                                      <div className="grid grid-cols-2 gap-3">
                                          <div>
                                              <Label className="text-xs text-muted-foreground">Frequency</Label>
                                              <Select value={recurrenceType} onValueChange={setRecurrenceType}>
                                                  <SelectTrigger className="h-8 text-xs bg-white">
                                                      <SelectValue />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                      <SelectItem value="daily">Daily</SelectItem>
                                                      <SelectItem value="weekly">Weekly</SelectItem>
                                                      <SelectItem value="monthly">Monthly</SelectItem>
                                                  </SelectContent>
                                              </Select>
                                          </div>
                                          <div>
                                              <Label className="text-xs text-muted-foreground">Interval</Label>
                                              <Input
                                                  type="number"
                                                  min="1"
                                                  value={recurrenceInterval}
                                                  onChange={(e) => setRecurrenceInterval(e.target.value)}
                                                  className="h-8 text-xs bg-white"
                                              />
                                          </div>
                                      </div>
                                  </motion.div>
                              )}
                          </AnimatePresence>
                      </div>

                      {/* Agent Options */}
                      <div className="space-y-2 border p-3 rounded-lg bg-purple-50/50 border-purple-100">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="is_agent"
                            checked={isAgentTask}
                            onCheckedChange={(checked) => setIsAgentTask(!!checked)}
                            className="data-[state=checked]:bg-purple-600 border-purple-200"
                          />
                          <Label htmlFor="is_agent" className="font-medium cursor-pointer text-purple-900">Is Agent Task?</Label>
                        </div>
                        <AnimatePresence>
                            {isAgentTask && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="space-y-3 pl-6 pt-2 overflow-hidden"
                            >
                                <div className="space-y-2">
                                <Label htmlFor="agentUrl" className="text-xs">Agent URL</Label>
                                <Input
                                    id="agentUrl"
                                    value={agentUrl}
                                    onChange={(e) => setAgentUrl(e.target.value)}
                                    placeholder="https://..."
                                    className="h-9 bg-white"
                                />
                                </div>
                                <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="openInNewWindow"
                                    checked={openInNewWindow}
                                    onCheckedChange={(c) => setOpenInNewWindow(!!c)}
                                />
                                <Label htmlFor="openInNewWindow" className="text-sm">Open in new window</Label>
                                </div>
                            </motion.div>
                            )}
                        </AnimatePresence>
                      </div>

                      <div className="space-y-2">
                          <Label htmlFor="file">Attachment</Label>
                          <Input
                            id="file"
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                          />
                      </div>

                      <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white h-12 rounded-xl text-lg font-medium shadow-lg shadow-slate-900/10">Create Task</Button>
                  </form>
                </DialogContent>
            </Dialog>
        </motion.div>

        <Tabs defaultValue="today" className="w-full space-y-8">
            <div className="flex justify-center md:justify-start">
                <TabsList className="bg-white/50 backdrop-blur-sm p-1 rounded-full border shadow-sm">
                    <TabsTrigger value="today" className="rounded-full px-6 data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">
                        <LayoutDashboard className="w-4 h-4 mr-2" /> Today
                    </TabsTrigger>
                    <TabsTrigger value="upcoming" className="rounded-full px-6 data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">
                        <ListTodo className="w-4 h-4 mr-2" /> Upcoming
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="rounded-full px-6 data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Done
                    </TabsTrigger>
                    <TabsTrigger value="calendar" className="rounded-full px-6 data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">
                        <CalendarIcon className="w-4 h-4 mr-2" /> Calendar
                    </TabsTrigger>
                </TabsList>
            </div>

            <AnimatePresence mode="wait">
                <TabsContent value="today" className="mt-0">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <TaskList
                            title="Today's Focus"
                            tasks={dailyTasks}
                            onToggleStatus={handleToggleStatus}
                        />
                    </motion.div>
                </TabsContent>

                <TabsContent value="upcoming" className="mt-0">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <TaskList
                            title="Coming Up"
                            tasks={futureTasks}
                            onToggleStatus={handleToggleStatus}
                        />
                    </motion.div>
                </TabsContent>

                <TabsContent value="completed" className="mt-0">
                     <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <TaskList
                            title="Accomplishments"
                            tasks={completedTasks}
                            onToggleStatus={handleToggleStatus}
                        />
                    </motion.div>
                </TabsContent>

                <TabsContent value="calendar" className="mt-0">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                    >
                        <CalendarView />
                    </motion.div>
                </TabsContent>
            </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
}
