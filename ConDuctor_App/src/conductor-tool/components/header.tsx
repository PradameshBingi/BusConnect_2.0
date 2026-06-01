
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Bell, MessageSquare, Globe } from 'lucide-react';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  backHref?: string;
}

export default function Header({ title, showBackButton, backHref }: HeaderProps) {
  const router = useRouter();

  const handleBackNavigation = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <header className="bg-[#00B893] text-white shadow-md sticky top-0 z-50 h-16 w-full">
      <div className="container mx-auto flex items-center justify-between h-full px-4">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleBackNavigation} 
              className="mr-1 text-white hover:bg-white/20 rounded-full"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          )}
          
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-1 border-2 border-white rounded-sm shadow-inner">
              <div className="w-8 h-8 flex flex-col items-center justify-center text-white text-[5px] font-bold leading-none uppercase">
                <span>TSRTC</span>
                <span>GAMYAM</span>
                <span className="text-[4px] mt-0.5 scale-90">Track and Active</span>
              </div>
            </div>
            <h1 className="text-xl font-bold tracking-wider font-headline uppercase">
              {title === 'Conductor Portal' ? 'TGSRTC' : (title || 'TGSRTC')}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Bell className="h-5 w-5 cursor-pointer hover:opacity-80" />
          <MessageSquare className="h-5 w-5 cursor-pointer hover:opacity-80" />
          <Globe className="h-5 w-5 cursor-pointer hover:opacity-80" />
        </div>
      </div>
    </header>
  );
}
