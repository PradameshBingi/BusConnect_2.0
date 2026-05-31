
'use client';

import "./globals.css";

/**
 * Root Layout
 * Included suppressHydrationWarning to prevent browser-specific extension errors.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col relative antialiased">
        <main className="flex-grow pb-32">
          {children}
        </main>
        <footer className="fixed bottom-0 left-0 right-0 bg-slate-50/80 backdrop-blur-md border-t py-6 z-50 shadow-[0_-4px_15px_rgba(0,0,0,0.05)]">
          <div className="container mx-auto text-center px-4">
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.3em] font-black mb-1">Powered By</p>
            <p className="font-black text-2xl tracking-tighter text-[#0A2B70] uppercase">BINGI PRADAMESH</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
