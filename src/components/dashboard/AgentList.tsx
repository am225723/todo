'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Maximize2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Agent } from '@/types';
import { motion } from 'framer-motion';

export function AgentList() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents');
      if (response.ok) {
        const data = await response.json();
        setAgents(data.agents);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2].map((i) => (
                <div key={i} className="h-40 bg-slate-100 rounded-xl animate-pulse" />
            ))}
        </div>
    );
  }

  if (agents.length === 0) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
           <h3 className="font-semibold text-lg mb-4">Agents</h3>
           <p className="text-muted-foreground">No active agents found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {agents.map((agent, index) => (
        <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
        >
            <Card className="h-full hover:shadow-lg transition-all duration-300 border-indigo-100 overflow-hidden group">
                <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500" />
                <CardContent className="pt-6 flex flex-col h-full">
                    <div className="flex-1">
                        <h3 className="font-bold text-lg text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">
                            {agent.name}
                        </h3>
                        {agent.description && (
                            <p className="text-sm text-slate-500 mb-4">
                                {agent.description}
                            </p>
                        )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100">
                        {agent.open_in_new_window ? (
                             <Button className="w-full bg-slate-900 hover:bg-indigo-600 text-white transition-colors" asChild>
                                <a href={agent.url} target="_blank" rel="noopener noreferrer">
                                    Launch Tool <ExternalLink size={16} className="ml-2" />
                                </a>
                             </Button>
                        ) : (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button className="w-full bg-white text-slate-700 border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 transition-all shadow-sm">
                                        Open Interface <Maximize2 size={16} className="ml-2" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-[95vw] h-[90vh] p-0 overflow-hidden bg-slate-50">
                                    <div className="w-full h-full flex flex-col">
                                        <div className="p-3 bg-white border-b flex items-center justify-between shadow-sm z-10">
                                            <span className="font-semibold text-slate-700 flex items-center gap-2">
                                                {agent.name}
                                                <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-mono">
                                                    {agent.url}
                                                </span>
                                            </span>
                                            <Button variant="ghost" size="sm" asChild>
                                                <a href={agent.url} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-indigo-600">
                                                    Open in new tab <ExternalLink size={14} className="ml-1" />
                                                </a>
                                            </Button>
                                        </div>
                                        <div className="flex-1 bg-slate-100 relative">
                                            <iframe
                                                src={agent.url}
                                                className="w-full h-full border-0 absolute inset-0"
                                                title={`Interface for ${agent.name}`}
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
                                            />
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
      ))}
    </div>
  );
}
