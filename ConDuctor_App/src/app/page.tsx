'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Ticket, 
  Info, 
  ChevronRight, 
  Bell, 
  MessageSquare, 
  Globe, 
  User, 
  Wallet, 
  HelpCircle
} from 'lucide-react';

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
    // /* 
    // CONDUCTOR TOOL HIDDEN:
    // To show this again, simply remove the comment markers (/* and */) wrapping this block.
    { 
      href: '/conductor', 
      title: 'Conductor Tool', 
      description: 'Verify tickets and check fares.', 
      icon: <User className="h-6 w-6 text-red-500" />,
      bgColor: 'bg-red-50'
    },
    
    { 
      href: '/wallet', 
      title: 'My Wallet', 
      description: 'Manage your balance and refunds.', 
      icon: <Wallet className="h-6 w-6 text-orange-500" />,
      bgColor: 'bg-orange-50'
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
    <div className="bg-white min-h-screen pb-32">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 flex items-center justify-between sticky top-0 z-50 shadow-sm h-16">
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
          <Bell className="h-5 w-5" />
          <MessageSquare className="h-5 w-5" />
          <Globe className="h-5 w-5" />
        </div>
      </header>

      <main className="p-4 space-y-4 max-w-2xl mx-auto pt-6">
        {/* Service List */}
        <div className="space-y-3">
          {serviceLinks.map((link) => (
            <Link href={link.href} key={link.title} className="group block">
              <Card className="flex items-center p-4 shadow-sm hover:shadow-md transition-all rounded-xl border border-slate-100 bg-white">
                <div className={`w-12 h-12 flex items-center justify-center ${link.bgColor} rounded-xl mr-4 shrink-0`}>
                    {link.icon}
                </div>
                <div className="flex-grow">
                  <p className="font-bold text-slate-800">{link.title}</p>
                  <p className="text-xs text-muted-foreground font-medium">{link.description}</p>
                </div>
                <ChevronRight className="text-slate-300 h-5 w-5 group-hover:text-primary transition-colors" />
              </Card>
            </Link>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 pt-4">
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
