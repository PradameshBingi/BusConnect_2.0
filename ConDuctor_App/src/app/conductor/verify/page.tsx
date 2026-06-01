'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, CheckCircle, XCircle, Loader2, ArrowRight, Eye, EyeOff, User, Tag } from 'lucide-react';
import Header from '@/app/components/header';
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS } from '@/lib/api-config';
import { cn } from '@/lib/utils';
import { ValidatedTicket } from '@/app/components/validated-ticket';
import { Separator } from '@/components/ui/separator';
import AuthGuard from '@/app/components/AuthGuard';

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
            toast({ variant: 'destructive', title: 'Error', description: 'Could not update ticket.' });
        } finally {
            setIsLoading(false);
        }
    };

  return (
    <AuthGuard>  
    <>
      <Header showBackButton={true} backHref="/conductor/ticket" title="Verify Ticket" />
      <div className="flex flex-col items-center bg-slate-50 p-4 min-h-screen space-y-4">
        <Card className="w-full max-w-md shadow-sm border-slate-200">
          <CardHeader>
              <CardTitle className="font-headline text-xl">Verify Ticket Code</CardTitle>
              <CardDescription>Enter alphanumeric code for boarding check</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerification} className="flex gap-2">
              <Input 
                placeholder="TKT-XX-XXXXX" 
                value={ticketCode} 
                onChange={(e) => setTicketCode(e.target.value)} 
                required 
                className="uppercase font-mono text-lg h-12" 
              />
              <Button type="submit" disabled={isLoading} className="h-12 w-20">
                  {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : <Search className="h-5 w-5" />}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        {status === 'not_found' && (
            <Card className="w-full max-w-md p-6 text-center text-destructive border-destructive/20 bg-white">
                <XCircle className="mx-auto mb-2 h-12 w-12" />
                <h3 className="font-bold text-lg">Ticket Not Found</h3>
                <p className="text-sm text-slate-500">The provided code does not exist in our system.</p>
            </Card>
        )}

        {status === 'found' && ticket && (
          <div className="w-full max-w-md space-y-4 animate-in slide-in-from-bottom-2 duration-300">
            {justValidated ? (
                <ValidatedTicket ticket={{
                  ...ticket, 
                  timestamp: ticket.validatedAt || new Date().toISOString()
                }} />
            ) : (ticket.status === 'used' || ticket.status === 'cancelled' || ticket.status === 'expired') ? (
                <Card className="overflow-hidden bg-white shadow-lg border-slate-200">
                    <CardHeader className="text-center bg-slate-50 py-12">
                        <h1 className={cn("text-4xl font-black uppercase tracking-widest", 
                            ticket.status === 'used' ? "text-slate-300" : 
                            ticket.status === 'cancelled' ? "text-red-500" : "text-yellow-500"
                        )}>
                            TICKET {ticket.status}
                        </h1>
                        <p className="mt-2 text-xs font-bold text-slate-400 uppercase">Boarding Denied</p>
                    </CardHeader>
                </Card>
            ) : (
                <Card className="overflow-hidden shadow-xl bg-white border-slate-200">
                    <CardHeader className="text-center pb-6 pt-10">
                        <div className="flex flex-col items-center gap-2">
                             <div className="bg-emerald-50 rounded-full p-2">
                                <CheckCircle className="h-12 w-12 text-[#22C55E]" />
                             </div>
                             <h2 className="text-3xl font-bold text-[#22C55E] tracking-tight">VALID</h2>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6 px-6">
                        <div className="flex justify-between items-center p-4 bg-slate-100/50 rounded-2xl border border-slate-100">
                            <div className="text-center flex-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">FROM</p>
                                <p className="font-black text-slate-900 text-lg">{ticket.from}</p>
                            </div>
                            <div className="px-4">
                                <ArrowRight className="h-5 w-5 text-[#00B893]" />
                            </div>
                            <div className="text-center flex-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">TO</p>
                                <p className="font-black text-slate-900 text-lg">{ticket.to}</p>
                            </div>
                        </div>

                        <div className="space-y-3 px-2">
                             <div className="flex justify-between items-center">
                                <p className="text-sm font-medium text-slate-500">Passengers:</p>
                                <p className="font-black text-slate-900">{ticket.passengers}</p>
                             </div>
                             <div className="flex justify-between items-center">
                                <p className="text-sm font-medium text-slate-500">Fare Paid:</p>
                                <p className="font-black text-[#00B893] text-lg">Rs. {Math.round(ticket.totalFare)}.00</p>
                             </div>
                        </div>

                        <Separator className="bg-slate-100" />

                        <div className="text-center space-y-4">
                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.1em]">SECURITY PIN</p>
                            <div className="flex flex-col items-center gap-3">
                                {showPin ? (
                                    <p className="text-4xl font-mono font-black text-center tracking-[0.3em] text-[#0A2B70]">
                                        {ticket.securityCode}
                                    </p>
                                ) : null}
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="h-11 px-8 font-bold text-sm bg-white border-slate-200 rounded-xl" 
                                    onClick={() => setShowPin(!showPin)}
                                >
                                    {showPin ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                                    {showPin ? 'Hide' : 'Show'} Security Code
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="p-6">
                        <Button 
                            onClick={handleValidate} 
                            className="w-full bg-[#22C55E] hover:bg-[#1ea34d] h-14 text-lg font-bold rounded-xl shadow-lg" 
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <CheckCircle className="mr-2 h-5 w-5" />}
                            Validate Boarding
                        </Button>
                    </CardFooter>
                </Card>
            )}

            <Button 
                variant="ghost" 
                className="w-full text-slate-500 font-bold hover:bg-slate-100 h-12" 
                onClick={() => {setStatus('idle'); setTicketCode(''); setTicket(null); setShowPin(false); setJustValidated(false);}}
            >
                Clear and Verify Next
            </Button>
          </div>
        )}
      </div>
    </>
    </AuthGuard>
  );
}
