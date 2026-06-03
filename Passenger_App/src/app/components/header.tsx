'use client';

import { useEffect, useCallback, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, MessageSquare, Globe, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import { NotificationsSheet } from './notifications-sheet';

export default function Header({ showBackButton = false, backHref, title }: { showBackButton?: boolean; backHref?: string; title?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [userInfo, setUserInfo] = useState({ id: '', name: '' });

  const handleLogout = useCallback(() => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userName');
    localStorage.removeItem('sessionId');
    router.replace('/login');
  }, [router]);

  // Session Validation Heartbeat and Profile Loading
  useEffect(() => {
    const phone = localStorage.getItem('currentUser');
    const name = localStorage.getItem('userName');
    const localSessionId = localStorage.getItem('sessionId');

    if (phone) {
      setUserInfo({ id: phone, name: name || 'Passenger' });
    }

    const validateSession = async () => {
      if (phone && localSessionId) {
        try {
          const res = await fetch(`/api/user?phone=${phone}`);
          if (res.ok) {
            const data = await res.json();
            if (data.sessionId && data.sessionId !== localSessionId) {
              toast({
                variant: 'destructive',
                title: 'Session Expired',
                description: 'Logged in from another device. Please login again.'
              });
              handleLogout();
            }
          } else {
            console.warn(`Session check returned status: ${res.status}`);
          }
        } catch (e) {
          console.error("Session heartbeat failed:", e);
        }
      }
    };

    validateSession();
    const interval = setInterval(validateSession, 30000);
    return () => clearInterval(interval);
  }, [handleLogout, toast]);

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <header className="bg-primary text-primary-foreground sticky top-0 z-50 shadow-sm h-16">
      <div className="container mx-auto flex h-full items-center px-4 justify-between">
        <div className="flex items-center gap-3">
          {showBackButton ? (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleBack} 
              className="h-10 w-10 mr-2 text-primary-foreground hover:bg-white/10 rounded-full shrink-0"
            >
              <ArrowLeft className="h-6 w-6" />
              <span className="sr-only">Back</span>
            </Button>
          ) : (
            <div className="bg-white p-1 rounded-sm shadow-inner shrink-0 border border-white/20">
              <div className="w-8 h-8 flex flex-col items-center justify-center bg-red-600 text-white rounded-sm text-[5px] font-bold leading-none">
                <span className="mb-0.5">TSRTC</span>
                <span className="mb-0.5">GAMYAM</span>
                <span className="text-[4px] scale-90">Track and Active</span>
              </div>
            </div>
          )}
          <Link href="/" className="flex flex-col justify-center overflow-hidden hover:opacity-90 transition-opacity cursor-pointer">
            <h1 className="text-xl font-bold tracking-wider font-headline uppercase truncate">
              {title || 'TGSRTC'}
            </h1>
            {!title && <span className="text-[8px] opacity-80 font-bold uppercase tracking-widest leading-none">Hyderabad</span>}
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <NotificationsSheet>
             <div className="relative group cursor-pointer">
                <Bell className="h-5 w-5 text-white group-hover:opacity-80 transition-opacity" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse"></span>
             </div>
          </NotificationsSheet>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-white hover:bg-white/10">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl overflow-hidden">
              <DropdownMenuLabel className="font-normal bg-slate-50 border-b border-slate-100">
                <div className="flex flex-col space-y-1 py-1">
                  <p className="text-sm font-black text-slate-900 leading-none truncate">{userInfo.name}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">ID: {userInfo.id}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="m-0" />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer font-bold h-12 px-4">
                <LogOut className="mr-3 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <MessageSquare className="h-5 w-5 cursor-pointer hover:opacity-80 hidden md:block" />
          <Globe className="h-5 w-5 cursor-pointer hover:opacity-80 hidden md:block" />
        </div>
      </div>
    </header>
  );
}
