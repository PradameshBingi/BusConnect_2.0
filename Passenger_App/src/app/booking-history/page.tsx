'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/app/components/header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, User, RefreshCw, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS } from '@/lib/api-config';
import { cn } from '@/lib/utils';

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
  const [isClient, setIsClient] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const loadLocalTickets = () => {
    const storedTickets: TicketDetails[] = JSON.parse(localStorage.getItem('generatedTickets') || '[]');
    setTickets([...storedTickets].reverse());
  };

  const syncStatuses = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const storedTickets: TicketDetails[] = JSON.parse(localStorage.getItem('generatedTickets') || '[]');
      let autoRefundTotal = 0;
      
      const updatedTickets = await Promise.all(storedTickets.map(async (t) => {
        if (t.status === 'valid') {
          try {
            const res = await fetch(`${API_ENDPOINTS.VERIFY}/${t.ticketCode}`);
            if (res.ok) {
              const data = await res.json();
              if (data.status === 'expired' && data.refundAmount > 0) {
                 autoRefundTotal += data.refundAmount;
              }
              return { ...t, status: data.status };
            }
          } catch (e) {
            console.error("Sync failed for", t.ticketCode);
          }
        }
        return t;
      }));

      if (autoRefundTotal > 0) {
          const walletData = JSON.parse(localStorage.getItem('userWallet') || '{"balance":0, "transactions":[]}');
          walletData.balance += autoRefundTotal;
          walletData.transactions.push({
            type: 'credit',
            description: `Auto-Refund for Expired Ticket(s)`,
            amount: autoRefundTotal,
            date: new Date().toISOString(),
          });
          localStorage.setItem('userWallet', JSON.stringify(walletData));
          toast({ 
            title: "Auto-Refund Applied", 
            description: `Rs. ${autoRefundTotal.toFixed(2)} refunded to wallet.` 
          });
      }

      localStorage.setItem('generatedTickets', JSON.stringify(updatedTickets));
      setTickets([...updatedTickets].reverse());
      if (!silent) toast({ title: "Updated", description: "Status synced with database." });
    } catch (error) {
      if (!silent) toast({ variant: 'destructive', title: "Sync Error", description: "Could not reach server." });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    setIsClient(true);
    loadLocalTickets();
    setTimeout(() => syncStatuses(true), 500);
  }, []);

  const getFullBusType = (type: string) => {
    switch (type) {
      case 'ordinary': return 'City Ordinary';
      case 'express': return 'Metro Express';
      case 'deluxe': return 'Metro Deluxe';
      default: return type;
    }
  };

  if (!isClient) return null;

  return (
    <>
      <Header showBackButton={true} backHref="/" title="Booking History" />
      <div className="p-4 md:p-8 max-w-2xl mx-auto pb-32">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <History className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold font-headline">Booking History</h1>
          </div>
          <Button variant="outline" size="sm" onClick={() => syncStatuses(false)} disabled={isRefreshing}>
            <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
            Sync
          </Button>
        </div>
        {tickets.length === 0 ? (
          <Card><CardContent className="p-10 text-center text-muted-foreground">No recent bookings found.</CardContent></Card>
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
                      <Badge variant="outline" className="border-primary text-primary font-bold text-xs uppercase">{getFullBusType(ticket.busType)}</Badge>
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
    </>
  );
}
