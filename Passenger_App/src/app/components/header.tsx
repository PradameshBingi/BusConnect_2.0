'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, MessageSquare, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Header({ showBackButton = false, backHref, title }: { showBackButton?: boolean; backHref?: string; title?: string }) {
  const router = useRouter();

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
            <div className="bg-white p-1 rounded-sm shadow-inner shrink-0">
              <div className="w-8 h-8 flex flex-col items-center justify-center bg-red-600 text-white rounded-sm text-[5px] font-bold leading-none">
                <span>TSRTC</span>
                <span>GAMYAM</span>
                <span className="text-[4px]">Track and Active</span>
              </div>
            </div>
          )}
          <Link href="/" className="flex flex-col justify-center overflow-hidden hover:opacity-90 active:opacity-100 transition-opacity cursor-pointer">
            <h1 className="text-xl font-bold tracking-wider font-headline uppercase truncate">
              {title || 'TGSRTC'}
            </h1>
            {!title && <span className="text-[8px] opacity-80 font-bold uppercase tracking-widest leading-none">Hyderabad</span>}
          </Link>
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
