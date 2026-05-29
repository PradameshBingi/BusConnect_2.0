
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/app/components/header';
import { ValidatedTicket } from '@/app/components/validated-ticket';
import { CountdownTimer } from '@/app/components/countdown-timer';
import { Loader2, ArrowRight, Copy, RefreshCw, XCircle, Ticket as TicketIcon, ArrowUpCircle, FileX } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS } from '@/lib/api-config';
import { cn } from '@/lib/utils';

type TicketDetails = {
  ticketCode: string;
  from: string;
  to: string;
  totalFare: number;
  fare: number;
  createdAt: string;
  status: 'valid' | 'expired' | 'used' | 'cancelled';
  busType: string;
  passengers: string;
  securityCode: string;
  walletAmountUsed?: number;
};

export default function TicketDetailPage() {
  const params = useParams();
  const ticketCode = params?.id as string;
  const [ticket, setTicket] = useState<TicketDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [now, setNow] = useState<number | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const fetchTicket = async (silent = false) => {
    if (!ticketCode) return;
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const response = await fetch(`${API_ENDPOINTS.VERIFY}/${ticketCode.toUpperCase()}`);
      if (response.ok) {
        const data = await response.json();
        setTicket(data.ticket);
      } else {
        const storedTickets: TicketDetails[] = JSON.parse(localStorage.getItem('generatedTickets') || '[]');
        const foundTicket = storedTickets.find(t => t.ticketCode.toUpperCase() === ticketCode.toUpperCase());
        setTicket(foundTicket || null);
      }
    } catch (e) {
      const storedTickets: TicketDetails[] = JSON.parse(localStorage.getItem('generatedTickets') || '[]');
      const foundTicket = storedTickets.find(t => t.ticketCode.toUpperCase() === ticketCode.toUpperCase());
      setTicket(foundTicket || null);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTicket();
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [ticketCode]);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: `${fieldName} copied to clipboard.` });
  };

  const getFullBusType = (type: string) => {
    switch (type.toLowerCase()) {
      case 'ordinary': return 'City Ordinary';
      case 'express': return 'Metro Express';
      case 'deluxe': return 'Metro Deluxe';
      default: return type;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <>
        <Header showBackButton backHref="/booking-history" title="Ticket Not Found" />
        <div className="p-8 text-center flex flex-col items-center gap-4">
          <XCircle className="h-16 w-16 text-destructive" />
          <p className="text-xl font-bold">The requested ticket could not be found.</p>
          <Button asChild><Link href="/booking-history">Back to History</Link></Button>
        </div>
      </>
    );
  }

  if (ticket.status === 'used') {
    return (
      <>
        <Header showBackButton backHref="/booking-history" title="Validated Ticket" />
        <div className="p-4 md:p-8">
          <ValidatedTicket ticket={{ ...ticket, timestamp: ticket.createdAt }} />
        </div>
      </>
    );
  }

  const issueDate = new Date(ticket.createdAt);
  const expiryTimestamp = issueDate.getTime() + 10 * 60 * 1000;
  const isCurrentlyExpired = ticket.status === 'valid' && now !== null && (now > expiryTimestamp);
  const displayStatus = isCurrentlyExpired ? 'expired' : ticket.status;
  const totalCost = ticket.totalFare || (ticket.fare + (ticket.walletAmountUsed || 0));

  return (
    <>
      <Header showBackButton backHref="/booking-history" title="Ticket Details" />
      <div className="flex flex-col items-center p-4 md:p-8 space-y-6 pb-32">
        <Card className={cn("w-full max-w-md border-t-8 shadow-xl", {
          "border-t-green-600": displayStatus === 'valid',
          "border-t-slate-500": displayStatus === 'used',
          "border-t-yellow-500": displayStatus === 'expired',
          "border-t-red-600": displayStatus === 'cancelled',
        })}>
          <CardHeader className="text-center relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-4 top-4" 
              onClick={() => fetchTicket(true)}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            </Button>
            <CardTitle className="font-headline text-2xl uppercase tracking-wider">Journey Details</CardTitle>
            <div className="flex justify-center mt-2">
              <Badge className={cn("capitalize font-bold px-4 py-1 border-transparent text-white", {
                "bg-green-600": displayStatus === 'valid',
                "bg-slate-500": displayStatus === 'used',
                "bg-yellow-500": displayStatus === 'expired',
                "bg-red-600": displayStatus === 'cancelled',
              })}>
                {displayStatus}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg">
              <div className="text-center flex-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">From</p>
                <p className="font-bold text-slate-900">{ticket.from}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-primary mx-2" />
              <div className="text-center flex-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">To</p>
                <p className="font-bold text-slate-900">{ticket.to}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-[9px] text-muted-foreground uppercase font-bold">Issue Date</p>
                <p className="font-bold">{issueDate.toLocaleDateString('en-GB')}</p>
              </div>
              <div>
                <p className="text-[9px] text-muted-foreground uppercase font-bold">Issue Time</p>
                <p className="font-bold">{issueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[9px] text-muted-foreground uppercase font-bold">Passengers</p>
                <p className="font-bold">{ticket.passengers}</p>
              </div>
              <div>
                <p className="text-[9px] text-muted-foreground uppercase font-bold">Fare Paid</p>
                <p className="font-bold text-primary">Rs. {Math.round(totalCost)}</p>
              </div>
              <div>
                <p className="text-[9px] text-muted-foreground uppercase font-bold">Bus Category</p>
                <p className="font-bold text-primary">{getFullBusType(ticket.busType)}</p>
              </div>
            </div>

            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 flex flex-col items-center gap-2">
              <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-tight">Security Code</p>
              <div className="flex items-center justify-center w-full">
                <p className="font-mono text-3xl font-bold tracking-[0.3em] text-primary">{ticket.securityCode}</p>
                <Copy className="h-4 w-4 text-muted-foreground ml-2 cursor-pointer" onClick={() => handleCopy(ticket.securityCode, 'PIN')} />
              </div>
            </div>

            <div className="text-center p-4 bg-slate-900 text-white rounded-lg cursor-pointer hover:bg-slate-800 transition-colors" onClick={() => handleCopy(ticket.ticketCode, 'Code')}>
              <p className="text-[10px] uppercase text-slate-400 mb-1 font-bold">Registration Code</p>
              <p className="font-mono text-xl font-bold break-all tracking-wider">{ticket.ticketCode}</p>
            </div>

            {displayStatus === 'valid' && (
              <CountdownTimer expiryTimestamp={expiryTimestamp} />
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            {displayStatus === 'valid' && (
              <div className="grid grid-cols-2 gap-3 w-full">
                <Button className="bg-red-600 hover:bg-red-700 h-12 font-bold text-white shadow-lg border-none" asChild>
                  <Link href={`/ticket-cancellation?code=${ticket.ticketCode}`}>
                    Cancel
                  </Link>
                </Button>
                {ticket.busType.toLowerCase() !== 'deluxe' && (
                  <Button className="bg-accent hover:bg-accent/90 h-12 font-bold shadow-lg" asChild>
                    <Link href={`/upgrade-ticket?id=${ticket.ticketCode}`}>
                      <ArrowUpCircle className="mr-2 h-4 w-4" /> Upgrade
                    </Link>
                  </Button>
                )}
              </div>
            )}
            <Button asChild variant="ghost" className="w-full h-11"><Link href="/booking-history">Back to History</Link></Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
