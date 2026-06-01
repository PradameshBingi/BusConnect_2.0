
'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Ticket, BookUser, ChevronRight, BarChart3, HelpCircle, Info } from 'lucide-react';
import Header from '@/app/components/header';
import AuthGuard from '@/components/AuthGuard';

export default function ConductorDashboardPage() {
  const serviceLinks = [
    {
      href: '/ticket',
      title: 'Ticket Tools',
      description: 'Verify codes and handle upgrades.',
      icon: <Ticket className="h-8 w-8 text-[#00B893]" />,
    },
    {
      href: '/bus-pass',
      title: 'Bus Pass Verification',
      description: 'Validate student and citizen passes.',
      icon: <BookUser className="h-8 w-8 text-[#0A2B70]" />,
    },
    {
      href: '/stats',
      title: 'Verification Insights',
      description: 'Real-time analytics for your session.',
      icon: <BarChart3 className="h-8 w-8 text-indigo-600" />,
    },
    { 
      href: '/help', 
      title: 'Operational Manual', 
      description: 'Staff protocols and FAQs.', 
      icon: <HelpCircle className="h-8 w-8 text-slate-500" />,
    },
    { 
      href: '/about', 
      title: 'System Information', 
      description: 'Platform version and vision.', 
      icon: <Info className="h-8 w-8 text-blue-500" />,
    },
  ];

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header title="Conductor Terminal" showBackButton={false} />
        
        <main className="flex-grow flex flex-col items-center pt-12 p-4 w-full">
          <h1 className="text-2xl font-black text-slate-900 mb-8 font-headline uppercase tracking-tight">Main Dashboard</h1>
          
          <div className="w-full max-w-2xl space-y-4">
            {serviceLinks.map((link) => (
              <Link href={link.href} key={link.title} className="group block no-underline">
                <Card className="hover:shadow-md transition-all border-slate-100 rounded-[1.5rem] bg-white overflow-hidden">
                  <CardHeader className="flex flex-row items-center gap-6 p-6">
                    <div className="p-4 bg-slate-50 rounded-2xl shrink-0 group-hover:scale-110 transition-transform">
                      {link.icon}
                    </div>
                    <div className="flex-grow">
                      <CardTitle className="text-xl font-black text-slate-900 mb-1 uppercase tracking-tight">{link.title}</CardTitle>
                      <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        {link.description}
                      </CardDescription>
                    </div>
                    <ChevronRight className="h-6 w-6 text-slate-300 group-hover:text-[#00B893] group-hover:translate-x-1 transition-all shrink-0" />
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </main>
        
        <footer className="p-8 text-center text-slate-400 text-[10px] uppercase font-bold tracking-widest">
          TGSRTC Terminal v2.1.0 • Developed by Bingi Pradamesh
        </footer>
      </div>
    </AuthGuard>
  );
}
