'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Route, History, ChevronRight, Edit3 } from 'lucide-react';
import Header from '@/app/components/header';
import { AuthGuard } from '@/components/auth-guard';

const serviceLinks = [
  { 
    href: '/select-bus-type', 
    title: 'Select Route', 
    icon: <Route className="h-7 w-7 text-blue-600" /> 
  },
  { 
    href: '/modify-booking', 
    title: 'Modify Booking', 
    icon: <Edit3 className="h-7 w-7 text-purple-600" /> 
  },
  { 
    href: '/booking-history', 
    title: 'Booking History', 
    icon: <History className="h-7 w-7 text-yellow-600" /> 
  },
];

export default function SelectTicketTypePage() {
  return (
    <AuthGuard>
      <Header showBackButton={true} backHref="/" title="Book Tickets" />
      <main className="p-4 space-y-3 pt-8 max-w-md mx-auto">
        {serviceLinks.map((link) => (
          <Link href={link.href} key={link.title} className="block group no-underline">
            <Card className="flex items-center p-4 shadow-sm hover:shadow-md transition-shadow rounded-lg bg-card border-slate-200">
              <div className="w-12 h-12 flex items-center justify-center bg-slate-100 rounded-lg mr-4 shrink-0">
                  {link.icon}
              </div>
              <span className="flex-grow font-semibold text-slate-800 text-md">{link.title}</span>
              <ChevronRight className="text-slate-400 h-5 w-5 group-hover:text-primary transition-colors" />
            </Card>
          </Link>
        ))}
      </main>
    </AuthGuard>
  );
}
