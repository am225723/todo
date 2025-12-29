'use client';

import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarSource {
    id: string;
    name: string;
    url: string;
    type: string;
    color: string;
}

export function CalendarView() {
    const [events, setEvents] = useState<any[]>([]);
    const [sources, setSources] = useState<CalendarSource[]>([]);
    const [isManageOpen, setIsManageOpen] = useState(false);

    // New Source Form
    const [newName, setNewName] = useState('');
    const [newUrl, setNewUrl] = useState('');
    const [newType, setNewType] = useState('web_ical');
    const [newColor, setNewColor] = useState('#3b82f6');

    useEffect(() => {
        fetchEvents();
        fetchSources();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await fetch('/api/calendars/events');
            if (res.ok) {
                const data = await res.json();
                // Parse dates back to Date objects
                const parsedEvents = data.events.map((e: any) => ({
                    ...e,
                    start: new Date(e.start),
                    end: new Date(e.end),
                }));
                setEvents(parsedEvents);
            }
        } catch (error) {
            console.error("Failed to fetch events", error);
        }
    };

    const fetchSources = async () => {
        try {
            const res = await fetch('/api/calendars');
            if (res.ok) {
                const data = await res.json();
                setSources(data.sources);
            }
        } catch (error) {
            console.error("Failed to fetch sources", error);
        }
    };

    const handleAddSource = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/calendars', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newName,
                    url: newUrl,
                    type: newType,
                    color: newColor
                })
            });

            if (res.ok) {
                toast({ title: "Success", description: "Calendar added" });
                setNewName('');
                setNewUrl('');
                fetchSources();
                fetchEvents();
            } else {
                toast({ title: "Error", description: "Failed to add calendar", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to add calendar", variant: "destructive" });
        }
    };

    const handleDeleteSource = async (id: string) => {
        try {
            const res = await fetch(`/api/calendars/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast({ title: "Success", description: "Calendar removed" });
                fetchSources();
                fetchEvents();
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to remove calendar", variant: "destructive" });
        }
    };

    const eventStyleGetter = (event: any) => {
        let backgroundColor = '#3174ad';
        if (event.resource?.type === 'task') {
            switch (event.resource.priority) {
                case 'urgent': backgroundColor = '#ef4444'; break;
                case 'high': backgroundColor = '#f97316'; break;
                case 'medium': backgroundColor = '#3b82f6'; break;
                case 'low': backgroundColor = '#22c55e'; break;
            }
        } else if (event.resource?.type === 'calendar') {
            backgroundColor = event.resource.color || '#8b5cf6';
        }

        return {
            style: {
                backgroundColor,
                borderRadius: '4px',
                opacity: 0.8,
                color: 'white',
                border: '0px',
                display: 'block'
            }
        };
    };

    return (
        <div className="h-[800px] p-4 bg-white/50 backdrop-blur-sm rounded-xl border shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-primary">Calendar</h2>
                <Dialog open={isManageOpen} onOpenChange={setIsManageOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline">Manage Calendars</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Manage Calendar Sources</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4">
                            <form onSubmit={handleAddSource} className="space-y-4 border p-4 rounded-md">
                                <h3 className="font-medium">Add New Calendar</h3>
                                <div className="space-y-2">
                                    <Label>Name</Label>
                                    <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="My Google Calendar" required />
                                </div>
                                <div className="space-y-2">
                                    <Label>iCal URL</Label>
                                    <Input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="https://calendar.google.com/..." required />
                                    <p className="text-xs text-muted-foreground">
                                        For Google Calendar: Settings &gt; Integrate calendar &gt; Secret address in iCal format
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-2">
                                        <Label>Type</Label>
                                        <Select value={newType} onValueChange={setNewType}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="web_ical">Web iCal</SelectItem>
                                                <SelectItem value="google">Google Calendar</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Color</Label>
                                        <Input type="color" value={newColor} onChange={e => setNewColor(e.target.value)} className="h-10" />
                                    </div>
                                </div>
                                <Button type="submit" className="w-full">Add Calendar</Button>
                            </form>

                            <div className="space-y-2">
                                <h3 className="font-medium">Your Calendars</h3>
                                {sources.length === 0 && <p className="text-sm text-muted-foreground">No external calendars added.</p>}
                                {sources.map(source => (
                                    <div key={source.id} className="flex items-center justify-between p-2 border rounded hover:bg-slate-50">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }} />
                                            <span className="font-medium">{source.name}</span>
                                            <span className="text-xs text-muted-foreground">({source.type})</span>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteSource(source.id)}>
                                            <Trash2 className="w-4 h-4 text-destructive" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 'calc(100% - 60px)' }}
                eventPropGetter={eventStyleGetter}
                views={['month', 'week', 'day', 'agenda']}
            />
        </div>
    );
}
