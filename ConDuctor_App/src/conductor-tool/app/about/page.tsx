
'use client';

import Header from '@/components/header';
import { Separator } from '@/components/ui/separator';
import { Info, ShieldCheck, Database, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function AboutPage() {
  const missionPoints = [
    {
      title: "Fraud Prevention",
      desc: "Secondary alphanumeric PINs and single-session enforcement eliminate ticket sharing and screenshots.",
      icon: <ShieldCheck className="h-6 w-6 text-[#00B893]" />
    },
    {
      title: "Real-time Sync",
      desc: "Every boarding is logged instantly in the cloud, ensuring absolute revenue transparency.",
      icon: <Database className="h-6 w-6 text-[#0A2B70]" />
    },
    {
      title: "Operational Speed",
      desc: "Replacing QR scans with alphanumeric code entry for high-density boarding environments.",
      icon: <Zap className="h-6 w-6 text-amber-500" />
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header showBackButton={true} backHref="/" title="About Terminal" />
      <main className="max-w-4xl mx-auto p-4 md:p-8 space-y-10 flex-grow">
        
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black tracking-tight font-headline uppercase text-slate-900">
            TGSRTC Digital Conductor
          </h1>
          <p className="text-base font-medium text-slate-500">
            Standard Operating Terminal v2.1.0 (LATEST)
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {missionPoints.map((item, i) => (
            <Card key={i} className="border-none shadow-sm bg-white">
              <CardContent className="p-6 text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center">
                  {item.icon}
                </div>
                <h3 className="font-black uppercase text-xs tracking-widest">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Separator />

        <div className="space-y-4">
          <h2 className="text-2xl font-black font-headline uppercase text-slate-900">
            Operational Vision
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            The Conductor Terminal is designed to modernize public transport in Hyderabad by bridging the gap between digital booking and physical boarding. It focuses on speed, security, and fraud resistance, ensuring that every passenger is verified accurately without the friction of unreliable QR scanning in crowded environments.
          </p>
        </div>

        <Separator />

        <div className="bg-destructive/5 p-8 rounded-3xl border border-destructive/10 text-center space-y-4">
           <h2 className="text-xl font-black font-headline flex items-center justify-center gap-3 text-destructive">
              <Info className="h-6 w-6" /> DISCLAIMER
            </h2>
           <p className="text-sm text-destructive/70 max-w-2xl mx-auto leading-relaxed">
            BusConnect Conductor Tool is a prototype for demonstration purposes. All ticket verification and fare calculation processes are simulated to showcase system functionality and operational workflow design.
          </p>
        </div>

        <div className="text-center space-y-2 pt-8 pb-20">
          <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900">TGSRTC BusConnect</h3>
          <p className="text-base font-bold text-slate-400">
            Conceptualized & Developed by{' '}
            <span className="text-[#0A2B70]">BINGI PRADAMESH</span>
          </p>
        </div>
      </main>
    </div>
  );
}
