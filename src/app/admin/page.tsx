'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { UserTaskManagement } from '@/components/admin/UserTaskManagement';
import { AgentManagement } from '@/components/admin/AgentManagement';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, Settings, Bell, ArrowLeft, MoreHorizontal, Power, CheckCircle, XCircle, LayoutList, Shield, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface User {
  id: string;
  email: string;
  display_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminPage() {
  const { user, loading, isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserDisplayName, setNewUserDisplayName] = useState('');
  const [newUserPin, setNewUserPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [notifLoading, setNotifLoading] = useState(false);

  const handleTriggerNotifications = async () => {
    setNotifLoading(true);
    try {
        const response = await fetch('/api/cron/notifications', { method: 'POST' });
        const data = await response.json();
        if (response.ok) {
            toast({
                title: "Success",
                description: `Sent ${data.notificationsSent} notifications.`,
            });
        } else {
             throw new Error(data.error);
        }
    } catch (error: any) {
        toast({
            title: "Error",
            description: "Failed to trigger notifications: " + error.message,
            variant: "destructive",
        });
    } finally {
        setNotifLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      if (!user) {
        window.location.href = '/login';
      } else if (!isAdmin) {
        toast({
            title: "Access Denied",
            description: "You do not have admin privileges.",
            variant: "destructive",
        });
        window.location.href = '/dashboard';
      }
    }
  }, [user, loading, isAdmin]);

  useEffect(() => {
    fetchUsers();
  }, [refreshKey]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUserEmail || !newUserDisplayName || !newUserPin) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (!/^\d{4,6}$/.test(newUserPin)) {
      toast({
        title: "Error", 
        description: "PIN must be 4-6 digits",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newUserEmail,
          display_name: newUserDisplayName,
          pin: newUserPin,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "User created successfully",
        });
        setNewUserEmail('');
        setNewUserDisplayName('');
        setNewUserPin('');
        setRefreshKey(prev => prev + 1);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create user",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: !isActive }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `User ${!isActive ? 'activated' : 'deactivated'} successfully`,
        });
        setRefreshKey(prev => prev + 1);
      } else {
        toast({
          title: "Error",
          description: "Failed to update user status",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
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

  if (selectedUser) {
    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Button variant="ghost" onClick={() => setSelectedUser(null)} className="gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back to Users
                    </Button>
                    <h1 className="font-semibold text-lg">Managing: <span className="text-indigo-600">{selectedUser.display_name || selectedUser.email}</span></h1>
                </div>
            </header>
            <div className="container mx-auto py-8 px-4">
                <UserTaskManagement
                    userId={selectedUser.id}
                    userName={selectedUser.display_name || selectedUser.email}
                    onClose={() => setSelectedUser(null)}
                />
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/50">
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-20">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-700">
                  <Shield className="w-6 h-6" />
                  <span className="font-bold text-lg">Admin Portal</span>
              </div>
              <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => window.location.href = '/dashboard'}>
                      <LayoutList className="w-4 h-4 mr-2" />
                      Client View
                  </Button>
                  <Button variant="ghost" size="icon" onClick={async () => {
                      await fetch('/api/auth/logout', { method: 'POST' });
                      window.location.href = '/login';
                  }}>
                      <LogOut className="w-5 h-5 text-slate-500 hover:text-red-500" />
                  </Button>
              </div>
          </div>
      </header>

      <div className="container mx-auto py-8 px-4">
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
        >
          <div>
              <h1 className="text-3xl font-bold text-slate-800">User Management</h1>
              <p className="text-slate-500 mt-1">
                Oversee accounts, manage tasks, and configure system alerts.
              </p>
          </div>
          <Button
            onClick={handleTriggerNotifications}
            disabled={notifLoading}
            className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20"
          >
              <Bell className="w-4 h-4 mr-2" />
              {notifLoading ? 'Sending...' : 'Trigger Daily Notifications'}
          </Button>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-12">
          {/* Left Column: Create User & Agent Management */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-4 space-y-6"
          >
            <Card className="border-none shadow-xl shadow-indigo-100">
              <CardHeader className="bg-indigo-600 text-white rounded-t-xl">
                <CardTitle className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5" /> Create User
                </CardTitle>
                <CardDescription className="text-indigo-100">
                  Add a new user to the system.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="user@example.com"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      type="text"
                      placeholder="John Doe"
                      value={newUserDisplayName}
                      onChange={(e) => setNewUserDisplayName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pin">PIN (4-6 digits)</Label>
                    <Input
                      id="pin"
                      type="password"
                      placeholder="••••"
                      value={newUserPin}
                      onChange={(e) => setNewUserPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800" disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create User"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <AgentManagement />
          </motion.div>

          {/* Right Column: Existing Users */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-8"
          >
            <Card className="border-none shadow-xl shadow-slate-200 h-full">
              <CardHeader className="border-b bg-white rounded-t-xl">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-slate-800">
                            <Users className="w-5 h-5 text-indigo-600" /> Existing Users
                        </CardTitle>
                        <CardDescription>
                            Active directory of all registered users.
                        </CardDescription>
                    </div>
                    <div className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                        Total: {users.length}
                    </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {users.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">
                        <Users className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p>No users found in the system.</p>
                    </div>
                  ) : (
                    users.map((user) => (
                      <motion.div
                        layout
                        key={user.id}
                        className="flex items-center justify-between p-4 border rounded-xl bg-white hover:shadow-md transition-all group"
                      >
                        <div className="flex items-center gap-4">
                            <Avatar className="h-10 w-10 border bg-slate-100">
                                <AvatarFallback className="text-indigo-700 font-bold">
                                    {user.display_name ? user.display_name.substring(0,2).toUpperCase() : 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold text-slate-800 flex items-center gap-2">
                                    {user.display_name || 'Unknown'}
                                    {!user.is_active && (
                                        <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Inactive</span>
                                    )}
                                </p>
                                <p className="text-sm text-slate-500">{user.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedUser(user)}
                                className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                            >
                                <Settings className="w-3 h-3 mr-1" /> Manage
                            </Button>

                            {user.is_active ? (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                                    className="text-red-500 hover:bg-red-50 hover:text-red-600"
                                    title="Deactivate Account"
                                >
                                    <Power className="w-4 h-4" />
                                </Button>
                            ) : (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                                    className="text-green-500 hover:bg-green-50 hover:text-green-600"
                                    title="Activate Account"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
