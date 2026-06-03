'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/app/components/header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, User, RefreshCw, ChevronRight, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { AuthGuard } from '@/components/auth-guard';

export const dynamic = "force-dynamic";

type TicketDetails = {
  ticketCode: string;
  from: string;
  to: string;
  totalFare: number;
  createdAt: string;
  status: 'valid' | 'expired' | 'used' | 'cancelled';
  busType: string;
  passengers: string;
};

export default function BookingHistoryPage() {
  const [tickets, setTickets] = useState<TicketDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchHistory = async (phone: string, silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);
    
    try {
      const response = await fetch(`/api/history?phone=${phone}`);
      if (!response.ok) throw new Error("Failed to fetch history");
      const data = await response.json();
      setTickets(data);
    } catch (error) {
      toast({ variant: 'destructive', title: "Sync Error", description: "Could not fetch your booking history from the database." });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      fetchHistory(user);
    }
  }, []);

  const getStandardizedBusType = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('ordinary')) return 'City Ordinary';
    if (t.includes('express')) return 'Metro Express';
    if (t.includes('deluxe')) return 'Metro Deluxe';
    return type;
  };

  return (
    <AuthGuard>
      <Header showBackButton={true} backHref="/" title="Booking History" />
      <div className="p-4 md:p-8 max-w-2xl mx-auto pb-32">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <History className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold font-headline">Booking History</h1>
          </div>
          <Button variant="outline" size="sm" onClick={() => fetchHistory(localStorage.getItem('currentUser') || '', false)} disabled={isRefreshing}>
            <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
            Sync
          </Button>
        </div>

        {isLoading ? (
          <div className="p-20 text-center"><Loader2 className="animate-spin h-10 w-10 text-primary mx-auto" /></div>
        ) : tickets.length === 0 ? (
          <Card><CardContent className="p-10 text-center text-muted-foreground">No booking records found in database.</CardContent></Card>
        ) : (
          <div className="space-y-4">
            {tickets.map(ticket => (
              <Link href={`/ticket/${ticket.ticketCode}`} key={ticket.ticketCode} className="block no-underline">
                <Card className={cn("border-l-4 shadow-sm group hover:shadow-md transition-shadow", {
                  "border-l-green-600": ticket.status === 'valid',
                  "border-l-pink-600": ticket.status === 'used',
                  "border-l-yellow-500": ticket.status === 'expired',
                  "border-l-red-600": ticket.status === 'cancelled',
                })}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-grow">
                        <p className="font-mono font-bold text-primary flex items-center gap-1">
                          {ticket.ticketCode.toUpperCase()}
                          <ChevronRight className="h-4 w-4" />
                        </p>
                        <p className="text-[10px] text-muted-foreground font-semibold">{new Date(ticket.createdAt).toLocaleString()}</p>
                      </div>
                      <Badge className={cn("capitalize font-bold px-3 py-1 text-white border-transparent", {
                        "bg-green-600": ticket.status === 'valid',
                        "bg-pink-600": ticket.status === 'used',
                        "bg-yellow-500": ticket.status === 'expired',
                        "bg-red-600": ticket.status === 'cancelled',
                      })}>
                        {ticket.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <p className="font-bold text-lg text-slate-800">{ticket.from}</p>
                      <ArrowRight className="h-5 w-5 text-primary mx-2" />
                      <p className="font-bold text-lg text-slate-800">{ticket.to}</p>
                    </div>
                    <div className="flex justify-between items-end mt-2">
                      <p className="font-bold text-slate-800">Total: Rs. {ticket.totalFare.toFixed(2)}</p>
                      <Badge variant="outline" className="border-primary text-primary font-bold text-xs uppercase">{getStandardizedBusType(ticket.busType)}</Badge>
                    </div>
                      <div className="flex items-center text-xs mt-2 text-muted-foreground font-medium">
                        <User className="h-4 w-4 mr-1.5" /> {ticket.passengers}
                      </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
