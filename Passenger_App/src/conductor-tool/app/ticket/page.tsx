
'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Ticket, Bus, ChevronRight } from 'lucide-react';
import Header from '@/components/header';

export default function TicketToolsPage() {
  const serviceLinks = [
    {
      href: '/verify',
      title: 'Standard Verification',
      description: 'Quick check for valid ticket codes.',
      icon: <Ticket className="h-8 w-8 text-[#00B893]" />,
    },
    {
      href: '/fare-check',
      title: 'Category Adjustment',
      description: 'Check fare differences for boarding upgrades.',
      icon: <Bus className="h-8 w-8 text-[#0A2B70]" />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header showBackButton={true} backHref="/dashboard" title="Ticket Tools" />
      <div className="p-4 md:p-8 flex flex-col items-center flex-grow">
        <h1 className="text-2xl font-bold mb-8 font-headline uppercase tracking-tight">Verification Tools</h1>
        <div className="space-y-4 w-full max-w-lg">
          {serviceLinks.map((link) => (
            <Link href={link.href} key={link.title} className="group block no-underline">
              <Card className="hover:shadow-lg transition-all border-slate-200 overflow-hidden">
                <CardHeader className="flex flex-row items-center gap-5 p-5">
                  <div className="p-3 bg-slate-50 rounded-xl shrink-0 group-hover:bg-slate-100 transition-colors">
                    {link.icon}
                  </div>
                  <div className="flex-grow">
                    <CardTitle className="text-lg font-bold text-slate-900">{link.title}</CardTitle>
                    <CardDescription className="text-sm font-medium">{link.description}</CardDescription>
                  </div>
                  <ChevronRight className="h-6 w-6 text-slate-300 group-hover:text-[#00B893] group-hover:translate-x-1 transition-all" />
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
