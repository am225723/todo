'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { Agent } from '@/types';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit2, ExternalLink, Save, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

export function AgentManagement() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Create/Edit State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [openInNewWindow, setOpenInNewWindow] = useState(false);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setIsLoading(true);
    try {
      // Note: GET /api/agents returns only active agents by default for users.
      // We might need an admin endpoint or update the GET endpoint to accept a query param.
      // For now, let's assume admins want to see all, but the API currently returns active only.
      // To properly manage, we should ideally see all.
      // I will update the API later or just use what we have.
      // Actually, looking at the API code I wrote: `eq('is_active', true)`.
      // This is a limitation for the admin panel if I want to reactivate inactive ones.
      // Ideally I should update the API to return all if requested by admin, but I don't have role check there yet.
      // For this task, I'll proceed with what I have. If an agent is deleted (inactive), it won't show up.
      // But wait, the previous instruction was to have GET /api/agents return active only.
      // I'll stick to that for now, but in a real app, I'd change it.

      const response = await fetch('/api/agents');
      if (response.ok) {
        const data = await response.json();
        setAgents(data.agents);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setUrl('');
    setOpenInNewWindow(false);
    setIsActive(true);
    setEditingAgent(null);
  };

  const handleEdit = (agent: Agent) => {
    setEditingAgent(agent);
    setName(agent.name);
    setDescription(agent.description || '');
    setUrl(agent.url);
    setOpenInNewWindow(agent.open_in_new_window);
    setIsActive(agent.is_active);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !url) {
      toast({
        title: "Error",
        description: "Name and URL are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = {
        name,
        description,
        url,
        open_in_new_window: openInNewWindow,
        is_active: isActive
      };

      let response;
      if (editingAgent) {
        response = await fetch(`/api/agents/${editingAgent.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch('/api/agents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (response.ok) {
        toast({
          title: "Success",
          description: `Agent ${editingAgent ? 'updated' : 'created'} successfully`,
        });
        setIsDialogOpen(false);
        resetForm();
        fetchAgents();
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.error || "Operation failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) return;

    try {
      const response = await fetch(`/api/agents/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Agent deleted successfully",
        });
        fetchAgents();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete agent",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="border-none shadow-xl shadow-slate-200 h-full">
      <CardHeader className="border-b bg-white rounded-t-xl flex flex-row items-center justify-between">
        <div>
            <CardTitle className="text-slate-800">Agent Tools</CardTitle>
            <CardDescription>Manage external tools and agents available to users.</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
        }}>
            <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="w-4 h-4 mr-2" /> Add Agent
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editingAgent ? 'Edit Agent' : 'Add New Agent'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Email AI" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description..." />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="url">URL</Label>
                        <Input id="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." required />
                    </div>
                    <div className="flex items-center space-x-2 border p-3 rounded-lg">
                        <Checkbox id="newWindow" checked={openInNewWindow} onCheckedChange={c => setOpenInNewWindow(!!c)} />
                        <Label htmlFor="newWindow" className="cursor-pointer">Open in new window (instead of modal)</Label>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                            {editingAgent ? 'Update Agent' : 'Create Agent'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
            {agents.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                    <p>No agents configured.</p>
                </div>
            ) : (
                agents.map(agent => (
                    <motion.div
                        key={agent.id}
                        layout
                        className="flex items-center justify-between p-4 border rounded-xl bg-white hover:shadow-md transition-all"
                    >
                        <div>
                            <h4 className="font-semibold text-slate-800">{agent.name}</h4>
                            <p className="text-sm text-slate-500 truncate max-w-xs">{agent.url}</p>
                            <div className="flex gap-2 mt-1">
                                {agent.open_in_new_window && (
                                    <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100">External Tab</span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button size="icon" variant="ghost" onClick={() => handleEdit(agent)} className="text-slate-500 hover:text-indigo-600">
                                <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => handleDelete(agent.id)} className="text-slate-500 hover:text-red-600">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </motion.div>
                ))
            )}
        </div>
      </CardContent>
    </Card>
  );
}
