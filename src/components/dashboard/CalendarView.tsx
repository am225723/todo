'use client';

import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from '@/hooks/use-toast';
import { Trash2, Calendar as CalendarIcon, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

    // Event Details Modal
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false);

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

    const handleSelectEvent = (event: any) => {
        setSelectedEvent(event);
        setIsEventDetailsOpen(true);
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
                borderRadius: '6px',
                opacity: 0.9,
                color: 'white',
                border: '0px',
                display: 'block',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                padding: '2px 5px',
                fontSize: '0.85rem'
            }
        };
    };

    return (
        <div className="h-[800px] p-6 bg-white/40 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-xl">
                        <CalendarIcon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">Calendar</h2>
                </div>
                <Dialog open={isManageOpen} onOpenChange={setIsManageOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50">Manage Calendars</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Manage Calendar Sources</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-6">
                            <form onSubmit={handleAddSource} className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <h3 className="font-semibold text-sm uppercase text-slate-500 tracking-wider">Add New Calendar</h3>
                                <div className="space-y-2">
                                    <Label>Name</Label>
                                    <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="My Google Calendar" required className="bg-white" />
                                </div>
                                <div className="space-y-2">
                                    <Label>iCal URL</Label>
                                    <Input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="https://calendar.google.com/..." required className="bg-white" />
                                    <p className="text-xs text-muted-foreground">
                                        For Google Calendar: Settings &gt; Integrate calendar &gt; Secret address in iCal format
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Type</Label>
                                        <Select value={newType} onValueChange={setNewType}>
                                            <SelectTrigger className="bg-white">
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
                                        <div className="flex items-center gap-2">
                                            <Input type="color" value={newColor} onChange={e => setNewColor(e.target.value)} className="h-10 w-20 p-1 bg-white" />
                                            <span className="text-xs text-muted-foreground">{newColor}</span>
                                        </div>
                                    </div>
                                </div>
                                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">Add Calendar</Button>
                            </form>

                            <div className="space-y-2">
                                <h3 className="font-semibold text-sm uppercase text-slate-500 tracking-wider">Your Calendars</h3>
                                {sources.length === 0 && <p className="text-sm text-muted-foreground italic">No external calendars added.</p>}
                                {sources.map(source => (
                                    <div key={source.id} className="flex items-center justify-between p-3 border rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-3">
                                            <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: source.color }} />
                                            <div>
                                                <p className="font-medium text-slate-800">{source.name}</p>
                                                <p className="text-xs text-slate-500 uppercase">{source.type}</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteSource(source.id)} className="text-slate-400 hover:text-red-500">
                                            <Trash2 className="w-4 h-4" />
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
                style={{ height: 'calc(100% - 80px)' }}
                eventPropGetter={eventStyleGetter}
                views={['month', 'week', 'day', 'agenda']}
                onSelectEvent={handleSelectEvent}
                className="rounded-xl overflow-hidden bg-white shadow-inner"
            />

            <Dialog open={isEventDetailsOpen} onOpenChange={setIsEventDetailsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedEvent?.title}</DialogTitle>
                        <DialogDescription>
                            {selectedEvent?.start && format(selectedEvent.start, 'PPP p')} - {selectedEvent?.end && format(selectedEvent.end, 'p')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {selectedEvent?.resource?.description && (
                            <div className="p-4 bg-slate-50 rounded-lg text-sm text-slate-700">
                                {selectedEvent.resource.description}
                            </div>
                        )}

                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Type:</span>
                                <span className="capitalize font-medium">{selectedEvent?.resource?.type || 'Event'}</span>
                            </div>
                            {selectedEvent?.resource?.priority && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Priority:</span>
                                    <span className={`capitalize font-medium ${
                                        selectedEvent.resource.priority === 'urgent' ? 'text-red-600' :
                                        selectedEvent.resource.priority === 'high' ? 'text-orange-600' :
                                        'text-blue-600'
                                    }`}>{selectedEvent.resource.priority}</span>
                                </div>
                            )}
                            {selectedEvent?.resource?.link && (
                                <div className="pt-2">
                                    <a
                                        href={selectedEvent.resource.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline flex items-center gap-1 text-sm"
                                    >
                                        Open Link <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
