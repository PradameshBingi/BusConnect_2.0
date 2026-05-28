
'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Ticket, Bus, ChevronRight, BarChart } from 'lucide-react';
import Header from '@/app/components/header';

export default function ConductorTicketPage() {
  /**
   * The serviceLinks array defines the cards shown on this page.
   * To "unlock" hidden features, move them from the commented section 
   * back into the active array.
   */
  const serviceLinks = [
    {
      href: '/conductor/verify',
      title: 'Verify Ticket Code',
      description: 'Standard ticket code verification.',
      icon: <Ticket className="h-8 w-8 text-primary" />,
    },
    {
      href: '/conductor/fare-check',
      title: 'Verify by Bus Type',
      description: 'Check for fare differences and validate.',
      icon: <Bus className="h-8 w-8 text-accent" />,
    },
    /* 
    {
      href: '/conductor/stats',
      title: 'Verification Stats',
      description: 'View your verification history and stats.',
      icon: <BarChart className="h-8 w-8 text-green-500" />,
    },
    */
  ];

  return (
    <>
      <Header showBackButton={true} backHref="/conductor/dashboard" title="Ticket Tools" />
      <div className="p-4 md:p-8">
        <h1 className="text-2xl font-bold mb-6 font-headline text-center">
          Ticket Tools
        </h1>
        <div className="space-y-4 max-w-lg mx-auto pb-32">
          {serviceLinks.map((link) => (
            <Link href={link.href} key={link.title} className="group block no-underline">
              <Card className="hover:shadow-lg transition-shadow border-slate-200">
                <CardHeader className="flex flex-row items-center gap-4 p-4">
                  <div className="p-2 bg-slate-100 rounded-lg shrink-0">
                    {link.icon}
                  </div>
                  <div className="flex-grow">
                    <CardTitle className="text-lg font-bold text-slate-900">{link.title}</CardTitle>
                    <CardDescription className="text-sm">{link.description}</CardDescription>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground ml-auto group-hover:text-primary transition-colors shrink-0" />
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
