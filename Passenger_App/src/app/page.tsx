'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Ticket, 
  Info, 
  ChevronRight, 
  Wallet, 
  HelpCircle,
  MessageSquare,
  Zap,
  Info as InfoIcon
} from 'lucide-react';
import Header from '@/app/components/header';
import { AuthGuard } from '@/components/auth-guard';

export const dynamic = "force-dynamic";

export default function Home() {
  const serviceLinks = [
    { 
      href: '/select-ticket-type', 
      title: 'Book Bus Tickets', 
      description: 'Buy, cancel, and manage tickets.', 
      icon: <Ticket className="h-6 w-6 text-purple-600" />,
      bgColor: 'bg-purple-50'
    },
    { 
      href: '/wallet', 
      title: 'My Wallet', 
      description: 'Manage your balance and refunds.', 
      icon: <Wallet className="h-6 w-6 text-orange-500" />,
      bgColor: 'bg-orange-50'
    },
    { 
      href: '/feedback', 
      title: 'Send Feedback', 
      description: 'Rate our app and share suggestions.', 
      icon: <MessageSquare className="h-6 w-6 text-emerald-600" />,
      bgColor: 'bg-emerald-50'
    },
    { 
      href: '/help', 
      title: 'Help & FAQs', 
      description: 'Find answers to your questions.', 
      icon: <HelpCircle className="h-6 w-6 text-slate-500" />,
      bgColor: 'bg-slate-50'
    },
    { 
      href: '/about', 
      title: 'About This App', 
      description: 'Learn more about this project.', 
      icon: <Info className="h-6 w-6 text-blue-500" />,
      bgColor: 'bg-blue-50'
    },
  ];

  return (
    <AuthGuard>
      <div className="bg-white min-h-screen pb-32">
        <Header />

        <main className="p-4 space-y-6 max-w-2xl mx-auto pt-8">
          {/* Latest Updates "Space" */}
          <Card className="border-none bg-[#0A2B70] text-white shadow-xl rounded-[2rem] overflow-hidden">
            <CardHeader className="p-6 pb-0">
               <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                     <Zap className="h-5 w-5 text-[#FF80A0]" />
                     <CardTitle className="text-sm font-black uppercase tracking-widest text-[#FF80A0]">Latest Updates</CardTitle>
                  </div>
                  <span className="bg-white/10 px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest">v1.9.29</span>
               </div>
               <div className="space-y-2 pb-6 border-b border-white/10">
                  <h3 className="text-xl font-bold font-headline leading-tight">Modification & Upgrade Portal Live!</h3>
                  <p className="text-xs text-blue-100/70 leading-relaxed">
                    Passengers can now update routes and bus categories directly from the dashboard. All unused expired tickets are fully refunded.
                  </p>
               </div>
            </CardHeader>
            <div className="p-4 bg-white/5 flex items-center justify-between px-6">
                <div className="flex items-center gap-2">
                   <InfoIcon className="h-3 w-3 text-[#FF80A0]" />
                   <p className="text-[10px] font-bold text-blue-100/50 uppercase tracking-widest">Free travel for women active</p>
                </div>
                <ChevronRight className="h-4 w-4 text-white/20" />
            </div>
          </Card>

          <div className="space-y-3">
            {serviceLinks.map((link) => (
              <Link href={link.href} key={link.title} className="group block">
                <Card className="flex items-center p-5 shadow-sm hover:shadow-md transition-all rounded-xl border border-slate-100 bg-white">
                  <div className={`w-12 h-12 flex items-center justify-center ${link.bgColor} rounded-xl mr-4 shrink-0`}>
                      {link.icon}
                  </div>
                  <div className="flex-grow">
                    <p className="font-bold text-slate-800 text-lg">{link.title}</p>
                    <p className="text-xs text-muted-foreground font-medium">{link.description}</p>
                  </div>
                  <ChevronRight className="text-slate-300 h-5 w-5 group-hover:text-primary transition-colors" />
                </Card>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <Button size="lg" className="bg-[#0A2B70] hover:bg-[#0A2B70]/90 text-white h-14 rounded-xl shadow-md font-bold text-sm uppercase">
              Flag a Bus
            </Button>
            <Button size="lg" variant="destructive" className="bg-[#EF4444] hover:bg-[#EF4444]/90 h-14 rounded-xl shadow-md font-bold text-sm uppercase">
              Emergency?
            </Button>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
