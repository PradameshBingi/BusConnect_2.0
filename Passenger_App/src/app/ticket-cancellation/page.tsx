'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileX, Loader2, CheckCircle, XCircle, Wallet, Lock } from 'lucide-react';
import Header from '@/app/components/header';
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS } from '@/lib/api-config';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type TicketStatus = 'loading' | 'found' | 'not_found' | 'already_used' | 'cancelled' | 'idle';

function CancellationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [ticketCode, setTicketCode] = useState('');
  const [status, setStatus] = useState<TicketStatus>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [ticketData, setTicketData] = useState<any>(null);
  const [isPreFilled, setIsPreFilled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      const formattedCode = code.toUpperCase();
      setTicketCode(formattedCode);
      setIsPreFilled(true);
      autoFetch(formattedCode);
    }
  }, [searchParams]);

  const autoFetch = async (code: string) => {
    setIsLoading(true);
    setStatus('loading');
    try {
      const response = await fetch(`${API_ENDPOINTS.VERIFY}/${code.toUpperCase()}`);
      if (!response.ok) {
          setStatus('not_found');
          return;
      }
      const data = await response.json();
      const foundTicket = data.ticket;

      if (foundTicket.status !== 'valid') {
        setStatus('already_used');
      } else {
        setTicketData(foundTicket);
        setStatus('found');
      }
    } catch (error) {
      setStatus('idle');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketCode) return;
    autoFetch(ticketCode);
  };

  const handleCancellation = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_ENDPOINTS.CANCEL}/${ticketCode.toUpperCase()}`, {
        method: 'POST',
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Server rejected cancellation");
      }

      const result = await res.json();
      const originalFare = ticketData?.totalFare || 0;
      const cancellationFee = Math.round(originalFare * 0.10);
      const refundAmount = Math.max(0, originalFare - cancellationFee);

      setStatus('cancelled');
      toast({ title: 'Ticket Cancelled', description: `Refund of Rs. ${refundAmount} credited to your cloud wallet.` });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const renderResult = () => {
    switch (status) {
      case 'not_found':
        return (
          <div className="text-center text-destructive flex flex-col items-center gap-2">
            <XCircle className="h-10 w-10" />
            <p>Ticket not found in system records.</p>
          </div>
        );
      case 'already_used':
        return (
          <div className="text-center text-orange-500 flex flex-col items-center gap-2">
            <XCircle className="h-10 w-10" />
            <p>This ticket is already used, expired, or cancelled.</p>
          </div>
        );
      case 'cancelled':
        return (
          <div className="text-center text-green-600 flex flex-col items-center gap-4 py-4">
            <CheckCircle className="h-16 w-16 mx-auto" />
            <div>
              <h3 className="text-xl font-bold">Successfully Cancelled</h3>
              <p className="text-sm opacity-80">Refund has been added to your cloud wallet.</p>
            </div>
            <Button variant="outline" className="w-full h-12 rounded-xl font-bold" onClick={() => router.push('/wallet')}>
              <Wallet className="mr-2 h-4 w-4" /> View Wallet
            </Button>
          </div>
        );
      case 'found':
        return (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="p-5 bg-slate-50 border rounded-2xl text-sm font-medium space-y-2">
                <div className="flex justify-between"><span>Original Fare:</span> <span className="font-bold">Rs. {Math.round(ticketData?.totalFare)}</span></div>
                <div className="flex justify-between text-red-600"><span>Cancellation Fee (10%):</span> <span className="font-bold">- Rs. {Math.round(ticketData?.totalFare * 0.10)}</span></div>
                <div className="border-t mt-3 pt-3 flex justify-between font-black text-lg text-green-600"><span>Refund Amount:</span> <span>Rs. {Math.round(ticketData?.totalFare - Math.round(ticketData?.totalFare * 0.10))}</span></div>
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full h-14 text-lg font-bold bg-red-600 hover:bg-red-700 border-none rounded-2xl shadow-lg" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
                  Confirm Cancellation
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-3xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-xl font-headline">Cancellation Rules</AlertDialogTitle>
                  <AlertDialogDescription asChild>
                    <div className="text-sm text-muted-foreground space-y-3 pt-2">
                      <div className="flex gap-2"><span>•</span> <span>A 10% processing fee will be deducted from the total fare.</span></div>
                      <div className="flex gap-2"><span>•</span> <span>The remaining balance will be instantly credited to your Wallet.</span></div>
                      <div className="flex gap-2 text-destructive font-bold"><span>•</span> <span>Once cancelled, the ticket cannot be restored or used for travel.</span></div>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2">
                  <AlertDialogCancel className="rounded-xl h-12">Go Back</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancellation} className="bg-red-600 hover:bg-red-700 rounded-xl h-12">Confirm & Refund</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 md:p-8 flex justify-center bg-slate-50/50 min-h-[calc(100vh-4rem)]">
      <Card className="w-full max-w-md border-none shadow-xl rounded-3xl h-fit overflow-hidden">
        <CardHeader className="bg-slate-900 text-white p-8">
          <CardTitle className="flex items-center gap-3 font-headline text-2xl uppercase tracking-tight">
            <FileX className="h-7 w-7 text-red-500" />
            Cancel Ticket
          </CardTitle>
          <CardDescription className="text-slate-400">
            Request a refund for your booked ticket.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-8">
          <div className="space-y-2">
            <Label htmlFor="ticket-code" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Ticket Registration Code</Label>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-grow">
                <Input
                  id="ticket-code"
                  placeholder="TKT-XX-XXXXX"
                  value={ticketCode}
                  onChange={e => setTicketCode(e.target.value.toUpperCase())}
                  readOnly={isPreFilled || status === 'cancelled' || status === 'found'}
                  required
                  className={cn("uppercase font-mono text-lg h-14 rounded-2xl pl-10 tracking-widest", {
                    "bg-slate-50 text-slate-500": isPreFilled || status === 'found'
                  })}
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
              </div>
              {status === 'idle' && !isPreFilled && (
                <Button type="submit" className="h-14 w-14 rounded-2xl bg-slate-900">
                    <CheckCircle className="h-5 w-5" />
                </Button>
              )}
            </form>
          </div>
          <div className="pt-2">{renderResult()}</div>
        </CardContent>
        {status !== 'found' && status !== 'cancelled' && (
             <CardFooter className="pb-8 px-8">
                <Button variant="ghost" className="w-full h-12 rounded-xl text-slate-500 font-bold" onClick={() => router.back()}>Back</Button>
             </CardFooter>
        )}
      </Card>
    </div>
  );
}

export default function TicketCancellationPage() {
  return (
    <>
      <Header showBackButton={true} backHref="/booking-history" title="Cancellation Portal" />
      <Suspense fallback={<div className="p-20 text-center"><Loader2 className="animate-spin mx-auto h-10 w-10 text-primary" /></div>}>
        <CancellationContent />
      </Suspense>
    </>
  );
}
