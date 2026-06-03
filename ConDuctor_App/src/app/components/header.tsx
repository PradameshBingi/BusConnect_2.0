
'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, LogOut, Bell, Globe, User } from 'lucide-react';
import { NotificationsSheet } from './notifications-sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  backHref?: string;
}

export default function Header({ title, showBackButton, backHref }: HeaderProps) {
  const router = useRouter();
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [conductorName, setConductorName] = useState('Staff Member');

  useEffect(() => {
    // Sync Name from Storage
    const updateName = () => {
      const savedName = localStorage.getItem('conductorName');
      if (savedName) setConductorName(savedName);
    };

    updateName();
    
    // Notifications Logic
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
        // Silent fail
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); 
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('sessionId');
    localStorage.removeItem('conductorName');
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

  // Reusable High-Fidelity Logo
  const Logo = () => (
    <div className="bg-red-600 p-1 border-2 border-white rounded-sm shadow-md shrink-0">
      <div className="w-10 h-10 flex flex-col items-center justify-center text-white font-black leading-none uppercase text-center">
        <span className="text-[7px]">TSRTC</span>
        <span className="text-[8px] mt-0.5">GAMYAM</span>
        <span className="text-[5px] mt-1 tracking-normal whitespace-nowrap px-0.5 border-t border-white/30 pt-0.5">Track and Active</span>
      </div>
    </div>
  );

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
          
          <div className="flex items-center gap-4 cursor-pointer hover:opacity-95" onClick={goToDashboard}>
            {!showBackButton && <Logo />}
            <div>
              {!showBackButton ? (
                <>
                  <h1 className="text-2xl font-black tracking-widest font-headline uppercase leading-none">TGSRTC</h1>
                  <p className="text-[9px] font-bold text-white/80 uppercase tracking-tighter mt-1">{title || 'Terminal'}</p>
                </>
              ) : (
                <h1 className="text-xl font-black tracking-tight font-headline uppercase leading-none">{title}</h1>
              )}
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <User className="h-6 w-6 text-white/80 cursor-pointer hover:text-white transition-all outline-none" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white rounded-xl shadow-xl border-slate-100 p-1">
              <DropdownMenuLabel className="px-3 py-2.5">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Logged In As</p>
                <p className="text-xs font-black text-slate-800 uppercase truncate">{conductorName}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-50" />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-3 text-red-600 focus:text-red-600 focus:bg-red-50 transition-colors font-bold uppercase text-[10px] tracking-widest cursor-pointer rounded-lg"
              >
                <LogOut className="h-4 w-4" />
                Logout Terminal
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
