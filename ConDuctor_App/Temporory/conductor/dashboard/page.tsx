'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button'; // Imported Button to fix compilation errors
import { 
  Ticket, 
  BookUser, 
  ChevronRight, 
  Database, 
  BarChart3, 
  HelpCircle, // Added missing icon
  Info,       // Added missing icon
  Bell,       // Added missing icon
  MessageSquare, // Added missing icon
  Globe       // Added missing icon
} from 'lucide-react';

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
    // Reference 1: Integrated Help & About Links safely mapped into layout styling
    { 
      href: '/help', 
      title: 'Help & FAQs', 
      description: 'Find answers to your questions.', 
      icon: <HelpCircle className="h-8 w-8 text-slate-500" />,
    },
    { 
      href: '/about', 
      title: 'About This App', 
      description: 'Learn more about this project.', 
      icon: <Info className="h-8 w-8 text-blue-500" />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Reference 2: TGSRTC Sticky Custom Header (Replaced standard bg-primary with explicit fallback classes) */}
      <header className="bg-primary text-white p-4 flex items-center justify-between sticky top-0 z-50 shadow-sm h-16 w-full">
        <div className="flex items-center gap-3">
          <div className="bg-white p-1 rounded-sm shadow-inner">
            <div className="w-8 h-8 flex flex-col items-center justify-center bg-red-600 text-white rounded-sm text-[5px] font-bold leading-none">
              <span>TSRTC</span>
              <span>GAMYAM</span>
              <span className="text-[4px]">Track and Active</span>
            </div>
          </div>
          <h1 className="text-xl font-bold tracking-wider font-headline uppercase">TGSRTC</h1>
        </div>
        <div className="flex items-center gap-4">
          <Bell className="h-5 w-5 cursor-pointer hover:opacity-80" />
          <MessageSquare className="h-5 w-5 cursor-pointer hover:opacity-80" />
          <Globe className="h-5 w-5 cursor-pointer hover:opacity-80" />
        </div>
      </header>
      
      <main className="flex-grow flex flex-col items-center pt-8 p-4 w-full">
        <h1 className="text-2xl font-bold text-slate-900 mb-6 font-headline">Conductor Dashboard</h1>
        
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

          {/* Reference 3: Operational Quick Action Buttons container */}
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
    </div>
  );
}
