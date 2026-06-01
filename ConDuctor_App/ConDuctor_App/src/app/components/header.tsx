
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, LogOut, Bell, Globe } from 'lucide-react';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  backHref?: string;
}

export default function Header({ title, showBackButton, backHref }: HeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('conductorUser');
    localStorage.removeItem('conductorSessionId');
    router.replace('/login');
  };

  const handleBackNavigation = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.push('/');
    }
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
          
          <div className="flex items-center gap-4">
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
          <Bell className="h-5 w-5 text-white/60 cursor-pointer hover:text-white" />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleLogout} 
            className="text-white hover:bg-red-500 rounded-full h-10 w-10 transition-colors"
            title="Logout Terminal"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
