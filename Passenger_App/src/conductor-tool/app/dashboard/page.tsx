'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Ticket, BookUser, ChevronRight, Database, BarChart3, HelpCircle, Info } from 'lucide-react';
import Header from '../../components/header';

export default function ConductorDashboardPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const session = localStorage.getItem('conductorSession');
    if (!session) {
      router.replace('/login');
    }
  }, [router]);

  const serviceLinks = [
    {
      href: '/ticket',
      title: 'Ticket Tools',
      description: 'Verify tickets, check fares, and view stats.',
      icon: <Ticket className="h-8 w-8 text-[#00B893]" />,
      bgColor: 'bg-slate-50'
    },
    {
      href: '/bus-pass',
      title: 'Bus Pass Verification',
      description: 'Validate student and citizen bus passes.',
      icon: <BookUser className="h-8 w-8 text-[#0A2B70]" />,
      bgColor: 'bg-slate-50'
    },
    {
      href: '/stats',
      title: 'Verification Insights',
      description: 'Real-time analytics for tickets and bus passes.',
      icon: <BarChart3 className="h-8 w-8 text-indigo-600" />,
      bgColor: 'bg-slate-50'
    },
    {
      href: '/pass-data',
      title: 'Sample Bus Pass Data',
      description: 'View pass codes for testing verification.',
      icon: <Database className="h-8 w-8 text-amber-500" />,
      bgColor: 'bg-slate-50'
    },
    { 
      href: '/help', 
      title: 'Help & FAQs', 
      description: 'Conductor operational manual.', 
      icon: <HelpCircle className="h-8 w-8 text-slate-500" />,
      bgColor: 'bg-slate-50'
    },
    { 
      href: '/about', 
      title: 'About System', 
      description: 'Learn more about the platform.', 
      icon: <Info className="h-8 w-8 text-blue-500" />,
      bgColor: 'bg-blue-50'
    },
  ];

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      
      <main className="flex-grow flex flex-col items-center pt-8 p-4 max-w-2xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-slate-900 mb-6 font-headline uppercase tracking-tight">Conductor Dashboard</h1>
        
        <div className="w-full space-y-3">
          {serviceLinks.map((link) => (
            <Link href={link.href} key={link.title} className="group block no-underline">
              <Card className="hover:shadow-md transition-all border-slate-100 rounded-xl bg-white overflow-hidden shadow-sm border border-slate-100">
                <CardHeader className="flex flex-row items-center gap-5 p-4">
                  <div className={`p-3 ${link.bgColor} rounded-xl shrink-0 group-hover:scale-110 transition-transform`}>
                    {link.icon}
                  </div>
                  <div className="flex-grow">
                    <CardTitle className="text-lg font-bold text-slate-800 mb-0.5">{link.title}</CardTitle>
                    <CardDescription className="text-xs font-medium text-slate-500">
                      {link.description}
                    </CardDescription>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-[#00B893] group-hover:translate-x-1 transition-all shrink-0" />
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 pt-8 w-full">
          <Button size="lg" className="bg-[#0A2B70] hover:bg-[#0A2B70]/90 text-white h-14 rounded-xl shadow-md font-bold text-sm">
            Flag a Bus
          </Button>
          <Button size="lg" variant="destructive" className="bg-[#EF4444] hover:bg-[#EF4444]/90 h-14 rounded-xl shadow-md font-bold text-sm">
            Emergency?
          </Button>
        </div>
      </main>
    </div>
  );
}
