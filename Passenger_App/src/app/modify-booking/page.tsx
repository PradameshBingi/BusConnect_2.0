
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/app/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search, Loader2, Edit3, Info, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS } from '@/lib/api-config';
import { ModifyForm } from './modify-form';
import { cn } from '@/lib/utils';

export const dynamic = "force-dynamic";

function ModifyBookingContent() {
  const searchParams = useSearchParams();
  const [ticketCode, setTicketCode] = useState('');
  const [ticket, setTicket] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPreFilled, setIsPreFilled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      setTicketCode(code.toUpperCase());
      setIsPreFilled(true);
      fetchTicket(code.toUpperCase());
    }
  }, [searchParams]);

  const fetchTicket = async (code: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.VERIFY}/${code}`);
      if (!response.ok) {
        if (response.status === 404) throw new Error("Ticket not found in system records.");
        throw new Error("Could not reach server.");
      }
      const data = await response.json();
      const foundTicket = data.ticket;

      const now = new Date().getTime();
      const createdAt = new Date(foundTicket.createdAt).getTime();
      const isExpired = now > createdAt + (10 * 60 * 1000);

      if (foundTicket.status !== 'valid' || isExpired) {
        throw new Error("This ticket is no longer modifiable (Used/Expired/Cancelled).");
      }

      setTicket(foundTicket);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Cannot Modify', description: error.message });
      setTicket(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketCode) return;
    fetchTicket(ticketCode);
  };

  return (
    <div className="p-4 md:p-8 flex flex-col items-center gap-6 min-h-[calc(100vh-4rem)] bg-slate-50/50">
      {!ticket ? (
        <Card className="w-full max-w-md shadow-xl border-none rounded-3xl overflow-hidden">
          <CardHeader className="bg-primary text-white p-8">
            <CardTitle className="flex items-center gap-3 font-headline text-2xl uppercase tracking-tight">
              <Edit3 className="h-7 w-7 text-white" />
              Modify Booking
            </CardTitle>
            <CardDescription className="text-white/80">
              Update route or passenger count for active tickets.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ticket-code" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Ticket No</Label>
                <div className="relative">
                  <Input
                    id="ticket-code"
                    placeholder="TKT-XX-XXXXX"
                    value={ticketCode}
                    onChange={e => setTicketCode(e.target.value.toUpperCase())}
                    className="h-14 pl-10 rounded-2xl font-mono text-lg tracking-widest uppercase"
                    required
                    readOnly={isPreFilled}
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                </div>
              </div>
              <Button type="submit" className="w-full h-14 bg-[#0A2B70] hover:bg-[#0A2B70]/90 rounded-2xl font-bold" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <Search className="mr-2 h-5 w-5" />}
                Find Ticket
              </Button>
            </form>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-blue-800 font-bold text-sm">
                <Info className="h-4 w-4" /> Instructions
              </div>
              <ul className="text-xs text-blue-700/80 space-y-2 leading-relaxed">
                <li>• Valid Tickets only are modifiable.</li>
                <li>• Add members: Pay the difference via Digital Payment.</li>
                <li>• Remove members: Refund credited to wallet (10% fee per person).</li>
                <li>• Used, Expired, or Cancelled tickets cannot be modified.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      ) : (
        <ModifyForm ticket={ticket} onReset={() => {setTicket(null); setTicketCode(''); setIsPreFilled(false);}} />
      )}
    </div>
  );
}

export default function ModifyBookingPage() {
  return (
    <>
      <Header showBackButton={true} backHref="/select-ticket-type" title="Modification Portal" />
      <Suspense fallback={<div className="p-20 text-center"><Loader2 className="animate-spin mx-auto h-10 w-10 text-primary" /></div>}>
        <ModifyBookingContent />
      </Suspense>
    </>
  );
}
