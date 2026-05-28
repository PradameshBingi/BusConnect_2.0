
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bus, ArrowLeft } from 'lucide-react';
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
    <header className="bg-primary text-primary-foreground sticky top-0 z-50 shadow-md h-16">
      <div className="container mx-auto flex h-full items-center px-4 relative">
        {showBackButton && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleBack} 
            className="h-10 w-10 mr-2 text-primary-foreground hover:bg-white/10 rounded-full shrink-0"
          >
            <ArrowLeft className="h-6 w-6" />
            <span className="sr-only">Back</span>
          </Button>
        )}
        <Link 
          href="/" 
          className="flex-grow flex flex-col justify-center overflow-hidden hover:opacity-90 active:opacity-100 transition-opacity cursor-pointer"
        >
           <h1 className="font-bold text-lg leading-tight truncate">{title || 'BusConnect'}</h1>
           {!title && <span className="text-[10px] opacity-80 font-bold uppercase tracking-widest leading-none">TGSRTC Hyderabad</span>}
        </Link>
        {!showBackButton && (
          <Link
            href="/"
            className="flex items-center gap-2 text-primary-foreground font-headline shrink-0"
          >
            <Bus className="h-8 w-8" />
          </Link>
        )}
      </div>
    </header>
  );
}
