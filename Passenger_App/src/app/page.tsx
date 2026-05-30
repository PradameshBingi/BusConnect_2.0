'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Ticket, 
  Info, 
  ChevronRight, 
  Wallet, 
  HelpCircle,
  MessageSquare
} from 'lucide-react';
import Header from '@/app/components/header';

export const dynamic = "force-dynamic";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    const user = localStorage.getItem('currentUser');
    if (!user) {
      router.replace('/login');
    } else {
      setIsLoggedIn(true);
    }
  }, [router]);

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

  if (!isMounted || !isLoggedIn) return null;

  return (
    <div className="bg-white min-h-screen pb-32">
      <Header />

      <main className="p-4 space-y-4 max-w-2xl mx-auto pt-8">
        {/* Service List */}
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

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 pt-6">
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
