'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/app/components/header';
import { ValidatedTicket } from '@/app/components/validated-ticket';
import { CountdownTimer } from '@/app/components/countdown-timer';
import { Loader2, ArrowRight, RefreshCw, XCircle, ArrowUpCircle, FileX, Eye, EyeOff } from 'lucide-react';
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
  validatedAt?: string;
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
  const [showPin, setShowPin] = useState(false);
  const [now, setNow] = useState<number | null>(null);
  const { toast } = useToast();

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
        setTicket(null);
      }
    } catch (e) {
      setTicket(null);
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

  const isUsed = ticket.status === 'used';
  
  // STRICT: Use validation time for used tickets, creation time otherwise
  const displayDate = isUsed && ticket.validatedAt 
    ? new Date(ticket.validatedAt) 
    : new Date(ticket.createdAt);

  if (isUsed) {
    return (
      <>
        <Header showBackButton backHref="/booking-history" title="Validated Ticket" />
        <div className="p-4 md:p-8 flex flex-col items-center space-y-6 pb-32">
          <ValidatedTicket ticket={{ ...ticket, timestamp: ticket.validatedAt || ticket.createdAt }} />
          <Button asChild variant="ghost" className="w-full h-12 rounded-xl text-slate-500 font-bold"><Link href="/booking-history">Back to History</Link></Button>
        </div>
      </>
    );
  }

  const issueDate = new Date(ticket.createdAt);
  const expiryTimestamp = issueDate.getTime() + 10 * 60 * 1000;
  const isCurrentlyExpired = ticket.status === 'valid' && now !== null && (now > expiryTimestamp);
  const displayStatus = isCurrentlyExpired ? 'expired' : ticket.status;

  return (
    <>
      <Header showBackButton backHref="/booking-history" title="Ticket Details" />
      <div className="flex flex-col items-center p-4 md:p-8 space-y-6 pb-32">
        <Card className={cn("w-full max-w-md border-t-8 shadow-xl rounded-3xl", {
          "border-t-green-600": displayStatus === 'valid',
          "border-t-slate-500": displayStatus === 'used',
          "border-t-yellow-500": displayStatus === 'expired',
          "border-t-red-600": displayStatus === 'cancelled',
        })}>
          <CardHeader className="text-center relative pb-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-4 top-4 rounded-full" 
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
            <div className="flex justify-between items-center bg-muted/30 p-5 rounded-2xl border">
              <div className="text-center flex-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">From</p>
                <p className="font-bold text-slate-900 text-lg uppercase">{ticket.from}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-primary mx-3" />
              <div className="text-center flex-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">To</p>
                <p className="font-bold text-slate-900 text-lg uppercase">{ticket.to}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-5 gap-x-4 text-sm font-medium">
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Issued Date</p>
                <p className="font-bold text-slate-800">{displayDate.toLocaleDateString('en-GB')}</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Issued Time</p>
                <p className="font-bold text-slate-800">{displayDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div className="col-span-2 space-y-1 py-2 border-y border-dashed">
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Passengers</p>
                <p className="font-bold text-slate-800">{ticket.passengers}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Fare Paid</p>
                <p className="font-bold text-primary text-base">Rs. {Math.round(ticket.totalFare)}.00</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Bus Category</p>
                <p className="font-bold text-primary text-base">{ticket.busType}</p>
              </div>
            </div>

            {(displayStatus !== 'expired' && displayStatus !== 'cancelled') && (
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20 flex flex-col items-center gap-2">
                <p className="text-[10px] uppercase text-muted-foreground font-black tracking-[0.2em]">Security Code</p>
                <div className="flex items-center justify-center w-full gap-3">
                  <p 
                    className="font-mono text-4xl font-black tracking-[0.3em] text-primary min-w-[140px] text-center cursor-pointer active:opacity-70 transition-opacity"
                    onClick={() => showPin && handleCopy(ticket.securityCode, 'Security PIN')}
                  >
                      {showPin ? ticket.securityCode : '•••••'}
                  </p>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={() => setShowPin(!showPin)}>
                      {showPin ? <EyeOff className="h-[18px] w-[18px] text-muted-foreground" /> : <Eye className="h-[18px] w-[18px] text-muted-foreground" />}
                  </Button>
                </div>
              </div>
            )}

            <div className="text-center p-4 bg-slate-900 text-white rounded-2xl shadow-inner">
              <p className="text-[10px] uppercase text-slate-400 mb-1 font-black tracking-widest">Ticket No</p>
              <p className="font-mono text-xl font-bold break-all tracking-wider">{ticket.ticketCode}</p>
            </div>

            {displayStatus === 'valid' && (
              <CountdownTimer expiryTimestamp={expiryTimestamp} />
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-3 p-6 pt-0">
            {displayStatus === 'valid' && (
              <div className={cn("grid gap-3 w-full", ticket.busType === 'Metro Deluxe' ? "grid-cols-1" : "grid-cols-2")}>
                <Button className="bg-red-600 hover:bg-red-700 h-14 font-black text-white rounded-2xl uppercase tracking-widest text-xs" asChild>
                  <Link href={`/ticket-cancellation?code=${ticket.ticketCode}`}>Cancel Ticket</Link>
                </Button>
                {ticket.busType !== 'Metro Deluxe' && (
                  <Button className="bg-accent hover:bg-accent/90 h-14 font-black rounded-2xl uppercase tracking-widest text-xs" asChild>
                    <Link href={`/upgrade-ticket?id=${ticket.ticketCode}`}>
                      <ArrowUpCircle className="mr-2 h-4 w-4" /> Upgrade
                    </Link>
                  </Button>
                )}
              </div>
            )}
            <Button asChild variant="ghost" className="w-full h-12 rounded-xl text-slate-500 font-bold"><Link href="/booking-history">Back to History</Link></Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
