
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Bus } from 'lucide-react';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  backHref?: string;
}

export default function Header({ title, showBackButton, backHref }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleBackNavigation = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  const goToDashboard = () => {
    // Detect context and route to appropriate dashboard
    if (pathname.startsWith('/passenger/conductor-tool')) {
        router.push('/passenger/conductor-tool');
    } else {
        router.push('/conductor/dashboard');
    }
  };

  return (
    <header className="bg-[#00B893] text-white shadow-md sticky top-0 z-20">
      <div className="container mx-auto flex items-center p-4">
        {showBackButton && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleBackNavigation} 
            className="mr-2 text-white hover:bg-white/20"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        )}
        
        <div 
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={goToDashboard}
          title="Back to Dashboard"
        >
          <Bus className="h-6 w-6" />
          <h1 className="text-xl font-bold tracking-wider font-headline uppercase">
            {title || 'Conductor Tools'}
          </h1>
        </div>
      </div>
    </header>
  );
}







