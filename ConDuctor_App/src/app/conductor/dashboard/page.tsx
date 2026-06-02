'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Ticket, BookUser, ChevronRight, BarChart3, HelpCircle, Info, Bell, MessageSquare, Globe, User, LogOut } from 'lucide-react';
import AuthGuard from '@/app/components/AuthGuard';

export default function ConductorDashboardPage() { 
    const router = useRouter();
    const [showProfileMenu, setShowProfileMenu] = useState(false);

  const serviceLinks = [
    {
      href: '/conductor/verify',
      title: 'Ticket Tools',
      description: 'Direct verification and service adjustments.',
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
        <header className="bg-[#00B893] text-white p-4 flex items-center justify-between sticky top-0 z-50 shadow-sm h-16 w-full">
              <div className="flex items-center gap-3">
                <div className="bg-white p-1 rounded-sm shadow-inner shrink-0">
                  <div className="w-8 h-8 flex flex-col items-center justify-center bg-red-600 text-white rounded-sm text-[5px] font-bold leading-none text-center">
                    <span>TSRTC</span>
                    <span>GAMYAM</span>
                    <span className="text-[4px]">Track and Active</span>
                  </div>
                </div>
                <h1 className="text-xl font-bold tracking-wider font-headline uppercase">TGSRTC</h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <User
                    className="h-5 w-5 cursor-pointer hover:opacity-80"
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                  />
                  {showProfileMenu && (
                    <div className="absolute right-0 top-8 w-64 bg-white rounded-2xl shadow-lg border overflow-hidden z-50">
                      <div className="px-4 py-3 bg-gray-100">
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Account</h3>
                      </div>
                      <button
                        onClick={() => {
                          localStorage.removeItem('currentUser');
                          localStorage.removeItem('sessionId');
                          router.push('/conductor/login');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-4 text-red-500 hover:bg-red-50 transition-colors font-bold uppercase text-xs tracking-widest"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout Terminal
                      </button>
                    </div>
                  )}
                </div>
                <Bell className="h-5 w-5 cursor-pointer hover:opacity-80" />
                <Globe className="h-5 w-5 cursor-pointer hover:opacity-80" />
              </div>
            </header>

      <main className="flex-grow flex flex-col items-center pt-12 p-4">
        <h1 className="text-2xl font-black text-slate-900 mb-8 font-headline uppercase tracking-tight">Conductor Dashboard</h1>
        
        <div className="w-full max-w-2xl space-y-4">
          {serviceLinks.map((link) => (
            <Link href={link.href} key={link.title} className="group block no-underline">
              <Card className="hover:shadow-md transition-all border-slate-100 rounded-xl bg-white overflow-hidden">
                <CardHeader className="flex flex-row items-center gap-5 p-5">
                  <div className="p-3 bg-slate-50 rounded-xl shrink-0 group-hover:scale-110 transition-transform">
                    {link.icon}
                  </div>
                  <div className="flex-grow">
                    <CardTitle className="text-xl font-black text-slate-900 mb-1 uppercase tracking-tight">{link.title}</CardTitle>
                    <CardDescription className="text-xs font-bold text-slate-500 uppercase tracking-widest">
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
    </AuthGuard>
  );
}