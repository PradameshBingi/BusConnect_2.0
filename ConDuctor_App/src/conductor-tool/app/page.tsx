
'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Ticket, 
  BookUser, 
  ChevronRight, 
  BarChart3, 
  HelpCircle, 
  Info, 
  Bell, 
  MessageSquare, 
  Globe 
} from 'lucide-react';
import Header from '@/components/header';

export default function ConductorDashboardPage() {
  const serviceLinks = [
    {
      href: '/ticket',
      title: 'Ticket Tools',
      description: 'Verify tickets and check for fare upgrades.',
      icon: <Ticket className="h-8 w-8 text-[#00B893]" />,
    },
    {
      href: '/bus-pass',
      title: 'Bus Pass Verification',
      description: 'Live database check for student & citizen passes.',
      icon: <BookUser className="h-8 w-8 text-[#0A2B70]" />,
    },
    {
      href: '/stats',
      title: 'Verification Insights',
      description: 'Real-time analytics for your boarding session.',
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header title="Conductor Portal" showBackButton={false} />
      
      <main className="flex-grow flex flex-col items-center pt-12 p-4 w-full">
        <h1 className="text-2xl font-bold text-slate-900 mb-8 font-headline uppercase tracking-tight">Conductor Dashboard</h1>
        
        <div className="w-full max-w-2xl space-y-4">
          {serviceLinks.map((link) => (
            <Link href={link.href} key={link.title} className="group block no-underline">
              <Card className="hover:shadow-md transition-all border-slate-100 rounded-xl bg-white overflow-hidden">
                <CardHeader className="flex flex-row items-center gap-5 p-5">
                  <div className="p-3 bg-slate-50 rounded-xl shrink-0 group-hover:scale-110 transition-transform">
                    {link.icon}
                  </div>
                  <div className="flex-grow">
                    <CardTitle className="text-xl font-bold text-slate-900 mb-1">{link.title}</CardTitle>
                    <CardDescription className="text-sm font-medium text-slate-500">
                      {link.description}
                    </CardDescription>
                  </div>
                  <ChevronRight className="h-6 w-6 text-slate-300 group-hover:text-[#00B893] group-hover:translate-x-1 transition-all shrink-0" />
                </CardHeader>
              </Card>
            </Link>
          ))}

          <div className="grid grid-cols-2 gap-4 pt-4 w-full">
            <Button size="lg" className="bg-[#0A2B70] hover:bg-[#0A2B70]/90 text-white h-14 rounded-xl shadow-md font-bold text-sm">
              Flag a Bus
            </Button>
            <Button size="lg" variant="destructive" className="bg-[#EF4444] hover:bg-[#EF4444]/90 h-14 rounded-xl shadow-md font-bold text-sm text-white">
              Emergency?
            </Button>
          </div>
        </div>
      </main>
      
      <footer className="p-8 text-center text-slate-400 text-[10px] uppercase font-bold tracking-widest">
        TGSRTC Terminal v2.1.0 • Developed by Bingi Pradamesh
      </footer>
    </div>
  );
}
