'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Bus, ChevronRight } from 'lucide-react';
import Header from '@/app/components/header';

const busTypes = [
  {
    href: '/book-ticket?type=City Ordinary',
    title: 'City Ordinary Bus Ticket',
    description: 'Standard buses for everyday travel.',
    fareInfo: 'Women travel free under the Maha Lakshmi scheme.'
  },
  {
    href: '/book-ticket?type=Metro Express',
    title: 'Metro Express Bus Ticket',
    description: 'Faster routes with fewer stops.',
    fareInfo: 'Women travel free. Surcharges apply for men & children.'
  },
  {
    href: '/book-ticket?type=Metro Deluxe',
    title: 'Metro Deluxe Bus Ticket',
    description: 'Comfortable, air-conditioned travel.',
    fareInfo: 'Surcharge of Rs. 10/adult (men & women) & Rs. 5/child.'
  },
];

export default function SelectBusTypePage() {
  return (
    <>
      <Header showBackButton={true} backHref="/select-ticket-type" title="Select Bus Type" />
      <div className="p-4 md:p-8 max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-6 font-headline text-center uppercase tracking-tight">Select Your Bus Type</h1>
        <div className="space-y-4">
          {busTypes.map((bus) => (
            <Link href={bus.href} key={bus.title} className="block group no-underline">
              <Card className="hover:shadow-lg transition-shadow border-slate-200 rounded-2xl overflow-hidden">
                <CardHeader className="flex flex-row items-center gap-4 p-4">
                  <div className="p-3 bg-primary/10 rounded-xl shrink-0 group-hover:scale-110 transition-transform">
                    <Bus className="h-7 w-7 text-primary" />
                  </div>
                  <div className="flex-grow">
                    <CardTitle className="text-lg font-bold text-slate-900">{bus.title}</CardTitle>
                    <CardDescription className="text-xs font-medium">{bus.description}</CardDescription>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors shrink-0" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                   <p className="text-[11px] text-green-600 font-bold bg-green-50 p-2 rounded-lg border border-green-100">{bus.fareInfo}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
