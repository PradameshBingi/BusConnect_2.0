'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/app/components/header';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UpgradeForm } from './upgrade-form';
import { API_ENDPOINTS } from '@/lib/api-config';

type Ticket = {
  from: string;
  to: string;
  routeNo: string;
  passengers: string;
  quantities: { Men: number, Child: number, Women: number };
  totalFare: number;
  fare: number;
  ticketCode: string;
  securityCode: string;
  status: 'valid' | 'invalid' | 'used' | 'expired' | 'cancelled';
  createdAt: string;
  busType: 'ordinary' | 'express' | 'deluxe';
  walletAmountUsed?: number;
};

function UpgradeTicketContent() {
  const searchParams = useSearchParams();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const id = searchParams.get('id');

  useEffect(() => {
    if (!id) {
        setLoading(false);
        setError('No ticket ID provided.');
        return;
    }
    
    const fetchTicketFromDB = async () => {
        try {
            const res = await fetch(`${API_ENDPOINTS.VERIFY}/${id.toUpperCase()}`);
            if (!res.ok) {
                if (res.status === 404) throw new Error('Ticket not found in system records.');
                throw new Error('Could not connect to database.');
            }
            
            const data = await res.json();
            const foundTicket = data.ticket;

            const now = new Date().getTime();
            const createdAt = new Date(foundTicket.createdAt).getTime();
            const isExpired = now > createdAt + (10 * 60 * 1000); // 10 minute validity

            if (foundTicket.status !== 'valid' || isExpired) {
                setError('This ticket is no longer valid for an upgrade as it has expired, been used, or was cancelled.');
            } else if (foundTicket.busType === 'deluxe') {
                setError('This ticket is already the highest tier (Metro Deluxe) and cannot be upgraded.');
            } else {
                setTicket(foundTicket);
            }
        } catch (e: any) {
            setError(e.message || 'Could not retrieve ticket data.');
        } finally {
            setLoading(false);
        }
    };

    fetchTicketFromDB();
  }, [id]);

  if (loading) {
    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </CardContent>
        </Card>
    );
  }

  if (error) {
    return (
        <Card className="w-full max-w-md border-t-8 border-t-destructive shadow-lg">
            <CardHeader>
                <CardTitle className="text-xl font-bold font-headline text-destructive">Upgrade Unavailable</CardTitle>
                <CardDescription>We cannot process this upgrade request.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm font-medium text-slate-600 leading-relaxed">{error}</p>
            </CardContent>
        </Card>
    );
  }

  return ticket ? <UpgradeForm ticket={ticket} /> : null;
}

export default function UpgradeTicketPage() {
  return (
    <>
      <Header showBackButton={true} backHref="/booking-history" title="Upgrade Ticket" />
      <div className="flex flex-col items-center justify-center p-4 md:p-8 min-h-[calc(100vh-4rem)] bg-slate-50/50">
        <Suspense fallback={<div className="text-center p-20 text-muted-foreground">Loading upgrade portal...</div>}>
            <UpgradeTicketContent />
        </Suspense>
      </div>
    </>
  );
}
