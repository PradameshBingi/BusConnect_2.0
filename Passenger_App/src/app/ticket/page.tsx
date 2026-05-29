'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

import { CountdownTimer } from '@/app/components/countdown-timer';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, RefreshCw, Loader2, XCircle, Eye, EyeOff } from 'lucide-react';
import Header from '@/app/components/header';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
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
  busType: string;
  walletAmountUsed?: number;
};

export const dynamic = "force-dynamic";

function TicketContent() {
  const searchParams = useSearchParams();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [now, setNow] = useState<number | null>(null);
  const { toast } = useToast();
  const id = searchParams.get('id');

  const getFullBusType = (type: string) => {
    switch (type.toLowerCase()) {
      case 'ordinary': return 'City Ordinary';
      case 'express': return 'Metro Express';
      case 'deluxe': return 'Metro Deluxe';
      default: return type;
    }
  };

  const fetchTicket = async (showToast = false) => {
    if (!id) return;
    if (showToast) setIsRefreshing(true);
    try {
        const response = await fetch(`${API_ENDPOINTS.VERIFY}/${id}`);
        if (!response.ok) {
            if (response.status === 404) {
              setError("Ticket not found in database.");
              setLoading(false);
              return;
            }
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || "Server communication error.");
        }
        const result = await response.json();
        setTicket(result.ticket);
        if (showToast) toast({ title: "Status Updated", description: `Current status: ${result.status}` });
    } catch (err: any) {
        setError(err.message);
    } finally {
        setLoading(false);
        setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTicket();
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(interval);
  }, [id]);
  
  const handleCopy = (text: string, fieldName: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text)
        .then(() => {
          toast({ title: "Copied!", description: `${fieldName} copied to clipboard.` });
        })
        .catch(() => {
          toast({ variant: 'destructive', title: "Copy Failed", description: "Could not copy to clipboard." });
        });
    } else {
      toast({ variant: 'destructive', title: "Copy Failed", description: "Clipboard API not supported in this browser." });
    }
  };

  if (!id || error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 text-center">
        <Card className="w-full max-w-md p-10 border-t-8 border-red-600">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="font-bold text-lg">{error || "No ticket ID provided."}</p>
            <Button asChild className="mt-4"><Link href="/">Go Home</Link></Button>
        </Card>
      </div>
    );
  }

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary h-10 w-10" /></div>;

  if (!ticket) return null;

  const issueDate = new Date(ticket.createdAt);
  const expiryTimestamp = issueDate.getTime() + 10 * 60 * 1000;
  const isCurrentlyExpired = ticket.status === 'valid' && now !== null && (now > expiryTimestamp);
  const displayStatus = isCurrentlyExpired ? 'expired' : ticket.status;

  const totalCost = ticket.totalFare || (ticket.fare + (ticket.walletAmountUsed || 0));

  return (
    <div className="flex flex-col items-center p-4 md:p-8 space-y-6">
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
                "bg-green-600 hover:bg-green-600": displayStatus === 'valid',
                "bg-slate-500 hover:bg-slate-500": displayStatus === 'used',
                "bg-yellow-500 hover:bg-yellow-500": displayStatus === 'expired',
                "bg-red-600 hover:bg-red-600": displayStatus === 'cancelled',
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
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Issue Date</p>
                    <p className="font-bold text-slate-800">{issueDate.toLocaleDateString('en-GB')}</p>
                </div>
                <div className="space-y-1 text-right">
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Issue Time</p>
                    <p className="font-bold text-slate-800">{issueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="col-span-2 space-y-1 py-2 border-y border-dashed">
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Passengers</p>
                    <p className="font-bold text-slate-800">{ticket.passengers}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Fare Paid</p>
                    <p className="font-bold text-primary text-base">Rs. {Math.round(totalCost)}.00</p>
                </div>
                <div className="space-y-1 text-right">
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Bus Category</p>
                    <p className="font-bold text-primary text-base">{getFullBusType(ticket.busType)}</p>
                </div>
            </div>

            {/* Security Code section - Hidden for expired/cancelled */}
            {(displayStatus !== 'expired' && displayStatus !== 'cancelled') && (
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20 flex flex-col items-center gap-2">
                  <p className="text-[10px] uppercase text-muted-foreground font-black tracking-[0.2em]">Security Code</p>
                  <div className="flex items-center justify-center w-full gap-3">
                      <p 
                        className="font-mono text-4xl font-black tracking-[0.3em] text-primary min-w-[140px] text-center cursor-pointer active:opacity-70 transition-opacity"
                        onClick={() => showPin && handleCopy(ticket.securityCode, 'Security PIN')}
                        title={showPin ? "Tap to Copy" : ""}
                      >
                          {showPin ? ticket.securityCode : '•••••'}
                      </p>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={() => setShowPin(!showPin)}>
                          {showPin ? <EyeOff className="h-[18px] w-[18px] text-muted-foreground" /> : <Eye className="h-[18px] w-[18px] text-muted-foreground" />}
                      </Button>
                  </div>
              </div>
            )}

            <div className="text-center p-4 bg-slate-900 text-white rounded-2xl cursor-pointer hover:bg-slate-800 transition-colors shadow-inner" onClick={() => handleCopy(ticket.ticketCode, 'Ticket No')}>
                <p className="text-[10px] uppercase text-slate-400 mb-1 font-black tracking-widest">Ticket No</p>
                <p className="font-mono text-xl font-bold break-all tracking-wider">{ticket.ticketCode}</p>
            </div>

            {displayStatus === 'valid' && (
              <CountdownTimer expiryTimestamp={expiryTimestamp} />
            )}
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full h-14 rounded-2xl text-lg font-bold"><Link href="/">Back to Dashboard</Link></Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function TicketPage() {
  return (
    <>
      <Header showBackButton={true} backHref="/" title="My Ticket" />
      <Suspense fallback={<div className="p-20 text-center"><Loader2 className="animate-spin mx-auto h-10 w-10 text-primary" /></div>}>
        <TicketContent />
      </Suspense>
    </>
  );
}
