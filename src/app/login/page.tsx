'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Delete, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePinClick = (digit: string) => {
    if (pin.length < 6) {
      setPin(prev => prev + digit);
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin('');
  };

  const handleSubmit = async () => {
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
        <CardHeader className="space-y-3 pb-6">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <span className="text-2xl">🔐</span>
          </div>
          <CardTitle className="text-3xl font-bold text-center tracking-tight">Welcome Back</CardTitle>
          <CardDescription className="text-center text-base">
            Enter your secure PIN
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-4">
              <Input
                id="pin"
                type="password"
                placeholder="• • • •"
                value={pin}
                readOnly
                className="text-center text-4xl tracking-[1em] font-mono h-16 bg-white/50 border-2 focus:border-primary/50 transition-all rounded-xl pointer-events-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-4 px-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                <Button
                  key={digit}
                  variant="outline"
                  onClick={() => handlePinClick(digit.toString())}
                  className="h-16 text-2xl font-medium bg-white/40 hover:bg-white/60 border-none shadow-sm rounded-2xl active:scale-95 transition-all"
                  disabled={loading}
                >
                  {digit}
                </Button>
              ))}
              <Button
                variant="outline"
                onClick={handleClear}
                className="h-16 text-lg font-medium bg-red-100/50 hover:bg-red-200/50 text-red-700 border-none shadow-sm rounded-2xl active:scale-95 transition-all"
                disabled={loading}
              >
                CLR
              </Button>
              <Button
                variant="outline"
                onClick={() => handlePinClick('0')}
                className="h-16 text-2xl font-medium bg-white/40 hover:bg-white/60 border-none shadow-sm rounded-2xl active:scale-95 transition-all"
                disabled={loading}
              >
                0
              </Button>
              <Button
                variant="outline"
                onClick={handleBackspace}
                className="h-16 flex items-center justify-center bg-white/40 hover:bg-white/60 border-none shadow-sm rounded-2xl active:scale-95 transition-all"
                disabled={loading}
              >
                <Delete className="w-6 h-6" />
              </Button>
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full h-14 text-lg font-medium shadow-lg hover:shadow-xl transition-all rounded-xl mt-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700"
              disabled={loading || pin.length < 4}
            >
              {loading ? (
                "Verifying..."
              ) : (
                <div className="flex items-center gap-2">
                  Access Dashboard <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </Button>
          </div>
          
          <div className="mt-8 text-center text-sm text-muted-foreground">
            Protected by secure authentication
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
