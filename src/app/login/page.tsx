'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePinClick = (digit: string) => {
    if (pin.length < 4) {
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
    if (!pin) return;
    if (pin.length !== 4) {
        toast({
            title: "Invalid PIN",
            description: "PIN must be 4 digits",
            variant: "destructive"
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
          title: "Access Granted",
          description: "Welcome back.",
        });
        router.push(data.redirect_url || '/dashboard');
      } else {
        toast({
          title: "Access Denied",
          description: data.error || "Incorrect PIN",
          variant: "destructive",
        });
        setPin(''); // Clear pin on error
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network connection issue.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full overflow-hidden flex items-center justify-center bg-black relative">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(20,184,166,0.15),transparent_70%)]" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />

      {/* Floating Orbs */}
      <motion.div
        animate={{
          x: [0, 50, -50, 0],
          y: [0, -50, 50, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          x: [0, -30, 30, 0],
          y: [0, 30, -30, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl"
      />

      <div className="relative z-10 w-full max-w-md p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center space-y-8"
        >
          {/* Logo / Header */}
          <div className="text-center space-y-4">
            <motion.div
              className="w-20 h-20 mx-auto bg-gradient-to-br from-teal-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/20"
              whileHover={{ scale: 1.05, rotate: 5 }}
            >
              <Image src="/logo.png" alt="Logo" width={48} height={48} className="w-12 h-12 brightness-0 invert" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h1>
            <p className="text-zinc-400">Enter your 4-digit PIN</p>
          </div>

          {/* PIN Dots */}
          <div className="flex gap-4 h-8 justify-center items-center mb-8">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                initial={false}
                animate={{
                  scale: i < pin.length ? 1.2 : 1,
                  backgroundColor: i < pin.length ? "rgb(20 184 166)" : "rgba(255, 255, 255, 0.1)",
                  boxShadow: i < pin.length ? "0 0 10px rgb(20 184 166)" : "none"
                }}
                className="w-4 h-4 rounded-full border border-white/10"
              />
            ))}
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-6 w-full max-w-[300px]">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <KeypadButton key={num} onClick={() => handlePinClick(num.toString())}>
                {num}
              </KeypadButton>
            ))}
            <KeypadButton onClick={handleClear} className="text-xs font-bold text-red-400 hover:text-red-300">
              CLR
            </KeypadButton>
            <KeypadButton onClick={() => handlePinClick('0')}>0</KeypadButton>
            <KeypadButton onClick={handleBackspace} className="text-lg">
              ⌫
            </KeypadButton>
          </div>

          {/* Submit Button */}
          <AnimatePresence>
            {pin.length === 4 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-[300px] pt-4"
              >
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-2xl text-white font-bold text-lg shadow-lg shadow-teal-500/25 active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    "Unlock Dashboard"
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

function KeypadButton({ children, onClick, className = "" }: { children: React.ReactNode, onClick: () => void, className?: string }) {
  return (
    <motion.button
      whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`w-20 h-20 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-white text-2xl font-light flex items-center justify-center transition-colors ${className}`}
    >
      {children}
    </motion.button>
  );
}
