
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Task } from '@/types';
import { ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

interface TaskListProps {
  tasks: Task[];
  onToggleStatus: (taskId: string, currentStatus: string) => void;
  title: string;
}

export function TaskList({ tasks, onToggleStatus, title }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
           <h3 className="font-semibold text-lg mb-4">{title}</h3>
           <p className="text-muted-foreground">No tasks found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mb-6">
        <h3 className="font-semibold text-xl mb-4 text-gray-800">{title}</h3>
        <div className="space-y-4">
          {tasks.map((task, index) => (
            <div
              key={task.id}
              className={`flex items-start p-4 bg-card rounded-xl shadow-sm border border-border/50 transition-all hover:shadow-md animate-slide-in ${
                task.status === 'completed' ? 'opacity-60 bg-gray-50' : 'bg-white'
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Checkbox
                checked={task.status === 'completed'}
                onCheckedChange={() => onToggleStatus(task.id, task.status)}
                className="mt-1 mr-4 h-6 w-6 rounded-md touch-target"
              />

              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                    {task.title}
                  </h4>
                  {task.is_agent_task && (
                     <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                       Agent
                     </span>
                  )}
                </div>

                {task.description && (
                  <p className={`text-sm mt-1 ${task.status === 'completed' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {task.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500">
                  {task.due_date && (
                    <span>Due: {new Date(task.due_date).toLocaleDateString()} {new Date(task.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  )}
                  {task.priority && task.priority !== 'medium' && (
                    <span className={`capitalize ${
                      task.priority === 'urgent' ? 'text-red-600 font-bold' :
                      task.priority === 'high' ? 'text-orange-600' : 'text-gray-500'
                    }`}>
                      {task.priority} Priority
                    </span>
                  )}
                </div>

                {task.is_agent_task && task.agent_url && (
                    <div className="mt-2">
                        {task.open_in_new_window ? (
                             <Button size="sm" variant="outline" className="gap-2" asChild>
                                <a href={task.agent_url} target="_blank" rel="noopener noreferrer">
                                    Open Agent <ExternalLink size={14} />
                                </a>
                             </Button>
                        ) : (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button size="sm" variant="secondary" className="gap-2">
                                        Open Agent Interface
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl h-[80vh] w-[90vw] p-0 overflow-hidden">
                                    <div className="w-full h-full flex flex-col">
                                        <div className="p-2 bg-gray-100 border-b text-sm text-center font-mono truncate">
                                            {task.agent_url}
                                        </div>
                                        <iframe
                                            src={task.agent_url}
                                            className="w-full h-full border-0"
                                            title={`Agent Interface for ${task.title}`}
                                        />
                                    </div>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                )}
              </div>
            </div>
          ))}
        </div>
    </div>
  );
}
