
'use client';

import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
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
  Globe,
  User,
  LogOut
} from 'lucide-react';

export default function ConductorDashboardPage() {
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const serviceLinks = [
    {
      href: '/conductor/verify', // DIRECT LINK TO VERIFY
      title: 'Ticket Tools',
      description: 'Verify codes and handle service adjustments.',
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
        <header className="bg-[#00B893] text-white p-4 flex items-center justify-between sticky top-0 z-50 shadow-sm h-20 w-full">
          <div className="flex items-center gap-4">
            <div className="bg-red-600 p-1 border-2 border-white rounded-sm shadow-inner shrink-0">
              <div className="w-10 h-10 flex flex-col items-center justify-center text-white text-[6px] font-bold leading-none uppercase">
                <span>TSRTC</span>
                <span>GAMYAM</span>
                <span className="text-[5px] mt-0.5 scale-90">Track and Active</span>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-widest font-headline uppercase leading-none">TGSRTC</h1>
              <p className="text-[9px] font-bold text-white/70 uppercase tracking-tighter mt-1">Conductor Terminal</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <User
                className="h-6 w-6 cursor-pointer hover:opacity-80"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              />
              {showProfileMenu && (
                <div className="absolute right-0 top-10 w-64 bg-white rounded-2xl shadow-xl border overflow-hidden z-50">
                  <div className="px-4 py-3 bg-slate-50 border-b">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Account</h3>
                  </div>
                  <button
                    onClick={() => {
                      localStorage.removeItem('conductorUser');
                      localStorage.removeItem('conductorSessionId');
                      router.push('/login');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-4 text-red-600 hover:bg-red-50 transition-colors font-bold uppercase text-xs tracking-widest"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout Terminal
                  </button>
                </div>
              )}
            </div>
            <Bell className="h-5 w-5 text-white/60 cursor-pointer hover:text-white" />
            <Globe className="h-5 w-5 text-white/60 cursor-pointer hover:text-white" />
          </div>
        </header>
        
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
                      <CardDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                        {link.description}
                      </CardDescription>
                    </div>
                    <ChevronRight className="h-6 w-6 text-slate-300 group-hover:text-[#00B893] group-hover:translate-x-1 transition-all shrink-0" />
                  </CardHeader>
                </Card>
              </Link>
            ))}

            <div className="grid grid-cols-2 gap-4 pt-4 w-full">
              <Button variant="outline" className="h-16 rounded-2xl border-2 border-slate-200 font-black uppercase tracking-widest text-[10px] text-slate-600 hover:bg-slate-50">
                Flag a Bus
              </Button>
              <Button variant="destructive" className="h-16 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg">
                Emergency?
              </Button>
            </div>
          </div>
        </main>
        
        <footer className="p-10 text-center text-slate-400 text-[9px] uppercase font-black tracking-[0.4em]">
          TGSRTC Terminal v2.1.0 • Developed by Bingi Pradamesh
        </footer>
      </div>
    </AuthGuard>
  );
}
