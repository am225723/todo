'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, BellOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function NotificationManager() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) return;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        toast({ title: "Notifications Enabled", description: "You will now receive updates." });

        // Register Push Subscription
        const registration = await navigator.serviceWorker.ready;
        try {
            // VAPID Public Key would go here
            // const subscription = await registration.pushManager.subscribe({
            //     userVisibleOnly: true,
            //     applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
            // });
            // Send subscription to backend
            console.log("Notification permission granted. Service Worker ready.");
        } catch (e) {
            console.error("Failed to subscribe to push", e);
        }

      } else {
        toast({ title: "Notifications Blocked", description: "You need to enable them in browser settings.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error requesting permission", error);
    }
  };

  if (!isSupported) return null;

  if (permission === 'granted') {
      return null; // Don't show button if already granted, or show a small icon in settings
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={requestPermission}
        className="shadow-lg rounded-full px-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
      >
        <Bell className="w-4 h-4 mr-2" />
        Enable Notifications
      </Button>
    </div>
  );
}
