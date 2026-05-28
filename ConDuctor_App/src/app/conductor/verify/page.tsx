
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, CheckCircle, XCircle, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import Header from '@/app/components/header';
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS } from '@/lib/api-config';
import { cn } from '@/lib/utils';
import { ValidatedTicket } from '@/app/components/validated-ticket';

export const dynamic = "force-dynamic";

export default function VerifyTicketPage() {
    const [ticketCode, setTicketCode] = useState('');
    const [ticket, setTicket] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'found' | 'not_found'>('idle');
    const [showPin, setShowPin] = useState(false);
    const [justValidated, setJustValidated] = useState(false);
    const { toast } = useToast();

    const handleVerification = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus('idle');
        setShowPin(false);
        setJustValidated(false);
        
        try {
            const response = await fetch(`${API_ENDPOINTS.VERIFY}/${ticketCode.trim().toUpperCase()}`);
            if (!response.ok) {
                if (response.status === 404) {
                    setStatus('not_found');
                    return;
                }
                throw new Error("Server error");
            }
            const result = await response.json();
            setTicket(result.ticket);
            setStatus('found');
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not connect to database.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleValidate = async () => {
        if (!ticket) return;
        setIsLoading(true);

        try {
            const response = await fetch(`${API_ENDPOINTS.USE}/${ticket.ticketCode}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });

            if (!response.ok) throw new Error("Validation failed");
            
            const result = await response.json();
            const updatedTicket = result.ticket;
            
            const vStats = JSON.parse(localStorage.getItem('conductorVerificationStats') || '[]');
            vStats.push({
                ticketCode: updatedTicket.ticketCode,
                verifiedAt: new Date().toISOString(),
                from: updatedTicket.from,
                to: updatedTicket.to,
                busType: updatedTicket.busType,
                totalFare: updatedTicket.totalFare,
                passengers: updatedTicket.passengers,
                quantities: updatedTicket.quantities
            });
            localStorage.setItem('conductorVerificationStats', JSON.stringify(vStats));
            
            setTicket(updatedTicket);
            setJustValidated(true);
            toast({ title: "Validated", description: "Ticket status updated to USED." });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not update ticket status.' });
        } finally {
            setIsLoading(false);
        }
    };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header showBackButton={true} backHref="/conductor/ticket" title="Verify Ticket" />
      <div className="flex flex-col items-center p-4 space-y-4 flex-grow">
        {(status === 'idle' || status === 'not_found') && (
          <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="font-headline uppercase tracking-tighter">Live Verification</CardTitle>
                <CardDescription>Enter code to check status from database.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerification} className="grid gap-4">
                <Input 
                  placeholder="TKT-01-XXXXX" 
                  value={ticketCode} 
                  onChange={(e) => setTicketCode(e.target.value)} 
                  required 
                  className="uppercase h-14 text-xl font-mono tracking-widest" 
                />
                <Button type="submit" disabled={isLoading} className="h-14 text-lg font-black">
                    {isLoading ? <Loader2 className="animate-spin h-6 w-6" /> : <Search className="mr-2 h-6 w-6" />}
                    VERIFY STATUS
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
        
        {status === 'not_found' && (
            <Card className="w-full max-w-md p-8 text-center bg-red-50 border-2 border-red-100">
                <XCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
                <p className="font-black text-2xl text-red-700 uppercase">Not Found</p>
                <p className="text-sm text-red-600">This ticket code is invalid or missing.</p>
            </Card>
        )}

        {status === 'found' && ticket && (
          <div className="w-full max-w-md space-y-4 pb-32">
            {(ticket.status === 'used' || ticket.status === 'cancelled' || ticket.status === 'expired') && !justValidated ? (
                <Card className="overflow-hidden border-2">
                    <CardHeader className="text-center bg-slate-100 py-16">
                        <h1 className={cn("text-5xl font-black uppercase tracking-widest", 
                            ticket.status === 'used' ? "text-slate-400" : 
                            ticket.status === 'cancelled' ? "text-red-500" : "text-amber-500"
                        )}>
                            {ticket.status}
                        </h1>
                    </CardHeader>
                </Card>
            ) : justValidated ? (
                <ValidatedTicket ticket={ticket} />
            ) : (
                <Card className="overflow-hidden border-green-200 border-2 shadow-2xl">
                    <CardHeader className="text-center bg-green-500 text-white">
                        <CheckCircle className="mx-auto h-12 w-12" />
                        <CardTitle className="mt-2 text-3xl font-black uppercase tracking-[0.2em]">VALID</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8 pt-8 px-6">
                        <div className="flex justify-between items-center p-6 bg-slate-50 rounded-2xl border">
                            <div className="text-center flex-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">FROM</p>
                                <p className="font-black text-xl text-slate-900">{ticket.from}</p>
                            </div>
                            <div className="px-6">
                                <ArrowRight className="h-8 w-8 text-[#00B893]" />
                            </div>
                            <div className="text-center flex-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TO</p>
                                <p className="font-black text-xl text-slate-900">{ticket.to}</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-8 text-sm font-black border-b border-dashed pb-8">
                            <div>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest">Passengers</p>
                                <p className="text-slate-800 text-lg uppercase">{ticket.passengers}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest">Fare Paid</p>
                                <p className="text-3xl font-black text-[#00B893]">₹{Math.round(ticket.totalFare)}</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-[10px] text-center text-slate-400 uppercase font-black mb-4 tracking-widest">Passenger PIN</p>
                            <div className="flex flex-col items-center gap-4">
                                {showPin ? (
                                    <p className="text-6xl font-mono font-black text-center tracking-[0.4em] text-[#0A2B70] bg-slate-100 p-6 rounded-2xl w-full border">
                                        {ticket.securityCode}
                                    </p>
                                ) : (
                                    <div className="text-6xl font-mono font-black text-center tracking-[0.4em] text-slate-200 bg-slate-50 p-6 rounded-2xl w-full border border-dashed">
                                        *****
                                    </div>
                                )}
                                <Button 
                                    variant="ghost" 
                                    className="font-black text-xs uppercase text-[#00B893]" 
                                    onClick={() => setShowPin(!showPin)}
                                >
                                    {showPin ? <><EyeOff className="mr-2 h-4 w-4" /> Hide</> : <><Eye className="mr-2 h-4 w-4" /> Show</>}
                                    Security PIN
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-green-50 p-6">
                        <Button onClick={handleValidate} className="w-full bg-green-600 hover:bg-green-700 h-20 text-2xl font-black shadow-xl uppercase tracking-[0.2em]" disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle className="mr-2 h-8 w-8" />}
                            VALIDATE BOARDING
                        </Button>
                    </CardFooter>
                </Card>
            )}
            <Button variant="outline" className="w-full h-16 font-black uppercase text-slate-500" onClick={() => {setStatus('idle'); setTicketCode(''); setTicket(null); setShowPin(false); setJustValidated(false);}}>
                Verify Next Ticket
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
