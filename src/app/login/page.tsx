'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pin) {
      toast({
        title: "Error",
        description: "Please enter your PIN",
        variant: "destructive",
      });
      return;
    }

    if (!/^\d{4,6}$/.test(pin)) {
      toast({
        title: "Error", 
        description: "PIN must be 4-6 digits",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pin }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Login successful!",
        });
        router.push(data.redirect_url || '/dashboard');
      } else {
        toast({
          title: "Error",
          description: data.error || "Login failed",
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
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500 via-green-500 to-emerald-500 opacity-20 z-0" />
      <div className="logo-container absolute top-10">
        <img src="/logo.png" alt="Integrative Psychiatry" className="logo-image h-32 w-auto" />
      </div>

      <Card className="w-full max-w-md glass relative z-10 border-none shadow-2xl mt-20">
        <CardHeader className="space-y-3 pb-8">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <span className="text-2xl">🔐</span>
          </div>
          <CardTitle className="text-3xl font-bold text-center tracking-tight">Welcome Back</CardTitle>
          <CardDescription className="text-center text-base">
            Enter your secure PIN to access your workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Input
                id="pin"
                type="password"
                placeholder="• • • •"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="text-center text-4xl tracking-[1em] font-mono h-16 bg-white/50 border-2 focus:border-primary/50 transition-all rounded-xl"
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full h-12 text-lg font-medium shadow-lg hover:shadow-xl transition-all rounded-xl" disabled={loading}>
              {loading ? "Verifying..." : "Access Dashboard"}
            </Button>
          </form>
          
          <div className="mt-8 text-center text-sm text-muted-foreground">
            Protected by secure authentication
          </div>
        </CardContent>
      </Card>
    </div>
  );
}