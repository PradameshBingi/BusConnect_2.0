
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Ticket, BookUser, ChevronRight, BarChart3, HelpCircle, Info } from 'lucide-react';
import AuthGuard from '@/app/components/AuthGuard';
import Header from '@/app/components/header';

export default function ConductorDashboardPage() { 
  const serviceLinks = [
    {
      href: '/conductor/verify',
      title: 'Ticket Tool',
      description: 'Direct Verification And Service Adjustments',
      icon: <Ticket className="h-6 w-6 text-[#00B893]" />,
    },
    {
      href: '/conductor/bus-pass',
      title: 'Bus Pass Verification',
      description: 'Validate Student And Citizen Bus Passes',
      icon: <BookUser className="h-6 w-6 text-[#0A2B70]" />,
    },
    {
      href: '/conductor/stats',
      title: 'Verification Insights',
      description: 'Real-Time Analytics For Tickets And Bus Passes',
      icon: <BarChart3 className="h-6 w-6 text-indigo-600" />,
    },
    { 
      href: '/help', 
      title: 'Help & FAQs', 
      description: 'Find Answers To Your Questions', 
      icon: <HelpCircle className="h-6 w-6 text-slate-500" />,
    },
    { 
      href: '/about', 
      title: 'About', 
      description: 'Learn More About This App', 
      icon: <Info className="h-6 w-6 text-blue-500" />,
    },
  ];

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50 flex flex-col font-headline">
        <Header title="Conductor Terminal" showBackButton={false} />

        <main className="flex-grow flex flex-col items-center pt-8 p-4">
          <h1 className="text-xl font-black text-slate-900 mb-6 font-headline uppercase tracking-tight">Main Dashboard</h1>
          
          <div className="w-full max-w-xl space-y-3">
            {serviceLinks.map((link) => (
              <Link href={link.href} key={link.title} className="group block no-underline">
                <Card className="hover:shadow-md transition-all border-slate-100 rounded-xl bg-white overflow-hidden">
                  <CardHeader className="flex flex-row items-center gap-4 p-4">
                    <div className="p-2.5 bg-slate-50 rounded-lg shrink-0 group-hover:scale-105 transition-transform">
                      {link.icon}
                    </div>
                    <div className="flex-grow">
                      <CardTitle className="text-sm font-black text-slate-900 mb-0.5 tracking-tight">{link.title}</CardTitle>
                      <CardDescription className="text-[10px] font-bold text-slate-500 tracking-widest leading-none">
                        {link.description}
                      </CardDescription>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#00B893] group-hover:translate-x-1 transition-all shrink-0" />
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
