
'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileX, Loader2, CheckCircle, XCircle, Wallet } from 'lucide-react';
import Header from '@/app/components/header';
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS } from '@/lib/api-config';
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
  const { toast } = useToast();

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      setTicketCode(code.toUpperCase());
      autoFetch(code.toUpperCase());
    }
  }, [searchParams]);

  const autoFetch = async (code: string) => {
    setIsLoading(true);
    setStatus('loading');
    try {
      const storedTickets = JSON.parse(localStorage.getItem('generatedTickets') || '[]');
      const foundTicket = storedTickets.find((t: any) => t.ticketCode.toUpperCase() === code.toUpperCase());

      if (!foundTicket) {
        setStatus('not_found');
      } else if (foundTicket.status === 'used' || foundTicket.status === 'expired' || foundTicket.status === 'cancelled') {
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

      const storedTickets: any[] = JSON.parse(localStorage.getItem('generatedTickets') || '[]');
      const ticketIndex = storedTickets.findIndex(t => t.ticketCode.toUpperCase() === ticketCode.toUpperCase());

      if (ticketIndex > -1) {
        const tkt = storedTickets[ticketIndex];
        // 10% Deduction Logic
        const originalFare = tkt.totalFare || 0;
        const cancellationFee = Math.round(originalFare * 0.10);
        const refundAmount = Math.max(0, originalFare - cancellationFee);

        storedTickets[ticketIndex].status = 'cancelled';
        localStorage.setItem('generatedTickets', JSON.stringify(storedTickets));
        
        // Credit Wallet
        const walletData = JSON.parse(localStorage.getItem('userWallet') || '{"balance":0, "transactions":[]}');
        walletData.balance += refundAmount;
        walletData.transactions.push({
            type: 'credit',
            description: `Refund for ${ticketCode.toUpperCase()} (10% Fee Deducted)`,
            amount: refundAmount,
            date: new Date().toISOString(),
        });
        localStorage.setItem('userWallet', JSON.stringify(walletData));

        setStatus('cancelled');
        toast({ title: 'Ticket Cancelled', description: `Rs. ${refundAmount} credited to wallet.` });
      }
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
            <p>Ticket not found in your history.</p>
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
              <p className="text-sm opacity-80">Refund has been added to your wallet.</p>
            </div>
            <Button variant="outline" className="w-full" onClick={() => router.push('/wallet')}>
              <Wallet className="mr-2 h-4 w-4" /> View Wallet
            </Button>
          </div>
        );
      case 'found':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg text-sm">
                <div className="flex justify-between"><span>Original Fare:</span> <span className="font-bold">Rs. {Math.round(ticketData?.totalFare)}</span></div>
                <div className="flex justify-between text-red-600"><span>Cancellation Fee (10%):</span> <span className="font-bold">- Rs. {Math.round(ticketData?.totalFare * 0.10)}</span></div>
                <div className="border-t mt-2 pt-2 flex justify-between font-bold text-green-600"><span>Refund Amount:</span> <span>Rs. {Math.round(ticketData?.totalFare - Math.round(ticketData?.totalFare * 0.10))}</span></div>
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full h-12 text-lg font-bold bg-red-600 hover:bg-red-700 border-none" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
                  Confirm Cancellation
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancellation Rules</AlertDialogTitle>
                  <AlertDialogDescription className="space-y-2">
                    <p>• A 10% processing fee will be deducted from the total fare.</p>
                    <p>• The remaining balance will be instantly credited to your BusConnect Wallet.</p>
                    <p>• Once cancelled, the ticket cannot be restored or used for travel.</p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Go Back</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancellation} className="bg-red-600 hover:bg-red-700">Confirm & Refund</AlertDialogAction>
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
    <div className="p-4 md:p-8 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline text-2xl">
            <FileX />
            Cancel Ticket
          </CardTitle>
          <CardDescription>
            Request a refund for your booked ticket.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ticket-code">Ticket Code</Label>
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                id="ticket-code"
                placeholder="TKT-XX-XXXXX"
                value={ticketCode}
                onChange={e => setTicketCode(e.target.value.toUpperCase())}
                required
                disabled={isLoading || status === 'cancelled'}
                className="uppercase font-mono"
              />
              {status === 'idle' && (
                <Button type="submit" size="icon">
                    <CheckCircle className="h-4 w-4" />
                </Button>
              )}
            </form>
          </div>
          <div className="pt-2">{renderResult()}</div>
        </CardContent>
        {status !== 'found' && status !== 'cancelled' && (
             <CardFooter>
                <Button variant="ghost" className="w-full" onClick={() => router.back()}>Back</Button>
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
