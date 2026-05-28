
'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Ticket, BookUser, ChevronRight, Database, BarChart3 } from 'lucide-react';
import Header from '@/app/components/header';

export default function ConductorDashboardPage() {
  const serviceLinks = [
    {
      href: '/conductor/ticket',
      title: 'Ticket Tools',
      description: 'Verify tickets, check fares, and view stats.',
      icon: <Ticket className="h-8 w-8 text-[#00B893]" />,
    },
    {
      href: '/conductor/bus-pass',
      title: 'Bus Pass Verification',
      description: 'Validate student and citizen bus passes.',
      icon: <BookUser className="h-8 w-8 text-[#0A2B70]" />,
    },
    {
      href: '/conductor/stats',
      title: 'Verification Insights',
      description: 'Real-time analytics for tickets and bus passes.',
      icon: <BarChart3 className="h-8 w-8 text-indigo-600" />,
    },
    {
      href: '/conductor/pass-data',
      title: 'Sample Bus Pass Data',
      description: 'View pass codes for testing verification.',
      icon: <Database className="h-8 w-8 text-amber-500" />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header title="Conductor Tools" showBackButton={false} />
      
      <main className="flex-grow flex flex-col items-center pt-12 p-4">
        <h1 className="text-2xl font-bold text-slate-900 mb-8 font-headline">Conductor Dashboard</h1>
        
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
        </div>
      </main>
    </div>
  );
}
