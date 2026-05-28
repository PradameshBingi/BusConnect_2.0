
'use client';
import { Bus } from "lucide-react";

export function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-primary text-primary-foreground p-4 overflow-hidden">
      <div className="relative">
          <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
          <Bus className="h-24 w-24 animate-move-bus mx-auto relative z-10 text-white" />
      </div>
      <div className="flex flex-col items-center gap-4 text-center mt-12 relative z-10">
        <h1 className="text-4xl font-bold font-headline tracking-[0.2em] mb-1">TGSRTC</h1>
        <div className="h-1 w-20 bg-white/40 rounded-full mb-2"></div>
        <p className="text-xl font-medium tracking-tight opacity-90">Digital Ticket Booking</p>
      </div>
      <div className="absolute bottom-16 text-center w-full px-8">
        <p className="text-[10px] uppercase font-bold tracking-[0.3em] mb-3 opacity-60">Conceptualized and Developed by</p>
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-2xl">
            <p className="font-bold text-3xl tracking-tighter text-white">BINGI PRADAMESH</p>
        </div>
      </div>
    </div>
  );
}
