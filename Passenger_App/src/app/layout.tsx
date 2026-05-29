'use client';

import { useState, useEffect } from 'react';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { SplashScreen } from '@/app/components/splash-screen';
import Link from 'next/link';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [mounted, setMounted] = useState(false);
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Show splash on every reload (every mount of RootLayout)
    setShowSplash(true);
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2800); // Slightly longer for the dust animation
    return () => clearTimeout(timer);
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>BusConnect</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen" suppressHydrationWarning>
        <FirebaseClientProvider>
          {mounted && showSplash && <SplashScreen />}
          <main className="flex-grow pb-24">
            {children}
          </main>
          <Toaster />
          <Link href="/" className="bg-white p-6 text-center border-t fixed bottom-0 w-full z-40 block hover:bg-slate-50 transition-colors cursor-pointer no-underline">
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold mb-2">Powered By</p>
            <p className="font-bold text-xl tracking-tight" style={{ color: '#0A2B70' }}>BINGI PRADAMESH</p>
          </Link>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
