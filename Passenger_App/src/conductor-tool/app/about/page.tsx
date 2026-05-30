'use client';

import Header from '../../components/header';
import { Separator } from '@/components/ui/separator';
import { Info } from 'lucide-react';

export default function ConductorAboutPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header showBackButton={true} backHref="/dashboard" title="About System" />
      <div className="bg-white max-w-4xl mx-auto p-6 md:p-10 space-y-10 shadow-sm min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-black tracking-tight font-headline uppercase text-[#0A2B70]">
            System Information
          </h1>
          <p className="text-base font-bold text-slate-500 mt-2 tracking-widest uppercase">
            Conductor Terminal v1.9.29
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold font-headline text-slate-900 uppercase tracking-tight">
            Terminal Purpose
          </h2>
          <p className="mt-4 text-lg text-slate-600 leading-relaxed">
            This terminal is designed for real-time ticket validation and bus-pass verification. It synchronizes directly with the TGSRTC Cloud Database to prevent fraud and manage high-density boarding efficiently without physical scanning.
          </p>
        </div>
        
        <Separator />

        <div className="bg-amber-50 p-6 rounded-2xl text-amber-900 border border-amber-200">
           <h2 className="text-xl font-bold font-headline flex items-center gap-3">
              <Info className="h-6 w-6" />
              Staff Notice
            </h2>
           <p className="mt-2 text-sm font-medium">
            This terminal records every validation session. Ensure you verify the passenger's 5-digit Security PIN for every ticket to prevent screenshot duplication fraud.
          </p>
        </div>

        <div className="text-center space-y-2 pt-10">
          <h3 className="text-2xl font-black text-[#16a34a]">BusConnect Conductor Suite</h3>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">Operational Prototype by Bingi Pradamesh</p>
        </div>
      </div>
    </div>
  );
}
