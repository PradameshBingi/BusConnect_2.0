'use client';
import { Bus } from "lucide-react";

export function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-primary text-primary-foreground p-4 overflow-hidden">
      
      {/* Bus Animation Layer */}
      <div className="relative mb-12 flex flex-col items-center">
          <div className="relative animate-move-bus">
            <Bus className="h-24 w-24 relative z-10 text-white" />
            
            {/* Dust Particles - Increased Visibility and Size */}
            <div className="absolute -bottom-2 -left-6 flex gap-3 animate-dust-blow">
                <div className="w-8 h-8 bg-white/40 rounded-full blur-md"></div>
                <div className="w-10 h-10 bg-white/30 rounded-full blur-lg"></div>
                <div className="w-6 h-6 bg-white/50 rounded-full blur-sm"></div>
            </div>
            <div className="absolute -bottom-1 -right-4 flex gap-2 animate-dust-blow delay-75">
                <div className="w-7 h-7 bg-white/40 rounded-full blur-md"></div>
                <div className="w-5 h-5 bg-white/50 rounded-full blur-sm"></div>
                <div className="w-9 h-9 bg-white/20 rounded-full blur-lg"></div>
            </div>
            {/* Additional Dust Layer */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-4 animate-dust-blow delay-150">
                <div className="w-12 h-12 bg-white/25 rounded-full blur-xl"></div>
                <div className="w-8 h-8 bg-white/35 rounded-full blur-md"></div>
            </div>
          </div>
      </div>

      <div className="flex flex-col items-center gap-2 text-center relative z-10">
        <h1 className="text-5xl font-bold font-headline tracking-[0.2em] mb-1">TGSRTC</h1>
        <p className="text-xl font-medium tracking-wide opacity-90">Digital Ticket Booking</p>
      </div>

      <div className="absolute bottom-16 text-center w-full px-8">
        <p className="text-[10px] uppercase font-bold tracking-[0.4em] mb-4 opacity-50">Conceptualized and Developed by</p>
        <div className="rounded-2xl p-4">
            <p className="font-bold text-4xl tracking-tighter text-[#0A2B70]">BINGI PRADAMESH</p>
        </div>
      </div>
    </div>
  );
}
