
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { Task } from '@/types';

interface UserTaskManagementProps {
  userId: string;
  userName: string;
  onClose: () => void;
}

export function UserTaskManagement({ userId, userName, onClose }: UserTaskManagementProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  // New task form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [isAgentTask, setIsAgentTask] = useState(false);
  const [agentUrl, setAgentUrl] = useState('');
  const [openInNewWindow, setOpenInNewWindow] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tasks?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('priority', priority);
      if (dueDate) formData.append('due_date', dueDate);
      formData.append('is_agent_task', isAgentTask.toString());
      if (isAgentTask && agentUrl) formData.append('agent_url', agentUrl);
      if (isAgentTask) formData.append('open_in_new_window', openInNewWindow.toString());
      if (file) formData.append('file', file);
      formData.append('status', 'pending');

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
        toast({
          title: "Success",
          description: "Task assigned successfully",
        });
        // Reset form
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

        fetchTasks();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create task');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Managing Tasks for {userName}</h2>
        <Button variant="outline" onClick={onClose}>Back to Users</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Assign New Task</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                    <SelectTrigger>
                      <SelectValue />
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
                  <Label htmlFor="dueDate">Due By</Label>
                  <Input
                    id="dueDate"
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
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

                  {isRecurring && (
                      <div className="space-y-3 pl-6 pt-2">
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
                      </div>
                  )}
              </div>

              <div className="space-y-4 border p-4 rounded-md">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isAgentTask"
                    checked={isAgentTask}
                    onCheckedChange={(c) => setIsAgentTask(!!c)}
                  />
                  <Label htmlFor="isAgentTask">Is Agent Task?</Label>
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

              <Button type="submit" className="w-full">Assign Task</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {loading ? (
                <p>Loading...</p>
              ) : tasks.length === 0 ? (
                <p className="text-muted-foreground">No tasks assigned.</p>
              ) : (
                tasks.map((task) => (
                  <div key={task.id} className="p-3 border rounded-lg space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold">{task.title}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {task.due_date && (
                        <span>Due: {new Date(task.due_date).toLocaleDateString()} {new Date(task.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        )}
                        {task.is_recurring && (
                            <span className="text-indigo-600 font-medium">Recurring</span>
                        )}
                    </div>
                    {task.is_agent_task && (
                      <p className="text-xs text-purple-600">🤖 Agent Task</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
