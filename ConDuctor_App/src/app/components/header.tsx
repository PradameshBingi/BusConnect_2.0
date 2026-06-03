
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, LogOut, Bell, Globe, User } from 'lucide-react';
import { NotificationsSheet } from './notifications-sheet';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  backHref?: string;
}

export default function Header({ title, showBackButton, backHref }: HeaderProps) {
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/notifications');
        if (!res.ok) return;
        
        const data = await res.json().catch(() => null);
        if (!data || !data.notifications) return;

        const notifications = data.notifications;
        setNotificationsCount(notifications.length);

        const lastRead = localStorage.getItem('lastReadConductorNotification');
        if (notifications.length > 0) {
          const latestTime = new Date(notifications[0].createdAt).getTime();
          if (!lastRead || latestTime > parseInt(lastRead)) {
            setHasNewNotifications(true);
          }
        }
      } catch (err) {
        // Silent fail for polling errors
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Polling for new alerts
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('sessionId');
    router.replace('/login');
  };

  const handleBackNavigation = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  const goToDashboard = () => {
    router.push('/conductor/dashboard');
  };

  return (
    <header className="bg-[#00B893] text-white shadow-md sticky top-0 z-50 h-20 w-full">
      <div className="container mx-auto flex items-center justify-between h-full px-6">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleBackNavigation} 
              className="text-white hover:bg-white/20 rounded-full h-12 w-12"
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
          )}
          
          <div className="flex items-center gap-4 cursor-pointer hover:opacity-90" onClick={goToDashboard}>
            <div className="bg-red-600 p-1 border-2 border-white rounded-sm shadow-inner shrink-0">
              <div className="w-10 h-10 flex flex-col items-center justify-center text-white text-[6px] font-bold leading-none uppercase">
                <span>TSRTC</span>
                <span>GAMYAM</span>
                <span className="text-[5px] mt-0.5 scale-90">Track and Active</span>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-widest font-headline uppercase leading-none">TGSRTC</h1>
              <p className="text-[9px] font-bold text-white/70 uppercase tracking-tighter mt-1">{title || 'Terminal'}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Globe className="h-5 w-5 text-white/60 cursor-pointer hover:text-white" />
          
          {notificationsCount > 0 && (
            <div className="relative">
              <NotificationsSheet 
                trigger={
                  <div className="relative cursor-pointer group">
                    <Bell className="h-5 w-5 text-white/60 group-hover:text-white transition-colors" />
                    {hasNewNotifications && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-[#00B893] animate-pulse"></span>
                    )}
                  </div>
                } 
                onOpen={() => {
                  setHasNewNotifications(false);
                  localStorage.setItem('lastReadConductorNotification', Date.now().toString());
                }}
              />
            </div>
          )}

          <div className="relative">
            <User className="h-6 w-6 text-white/80 cursor-pointer hover:text-white" onClick={() => setShowProfileMenu(!showProfileMenu)} />
            {showProfileMenu && (
              <div className="absolute right-0 top-10 w-48 bg-white rounded-xl shadow-xl border overflow-hidden z-50 animate-in fade-in zoom-in duration-200">
                <div className="px-4 py-2 bg-slate-50 border-b">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Account</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-4 text-red-600 hover:bg-red-50 transition-colors font-bold uppercase text-xs tracking-widest"
                >
                  <LogOut className="h-4 w-4" />
                  Logout Terminal
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
