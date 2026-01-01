'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, BellOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

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
            const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            if (!vapidKey) {
                console.warn('NEXT_PUBLIC_VAPID_PUBLIC_KEY is missing. Push notifications will not work.');
                return;
            }

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidKey)
            });

            // Send subscription to backend
            const response = await fetch('/api/notifications/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ subscription }),
            });

            if (!response.ok) {
                console.error('Failed to save subscription:', await response.text());
                toast({ title: "Subscription Error", description: "Could not save notification settings.", variant: "destructive" });
            } else {
                console.log("Notification permission granted and saved.");
            }

        } catch (e) {
            console.error("Failed to subscribe to push", e);
            toast({ title: "Push Error", description: "Failed to subscribe to push notifications.", variant: "destructive" });
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
