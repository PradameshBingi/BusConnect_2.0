'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, CheckCircle, XCircle, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS } from '@/lib/api-config';
import { cn } from '@/lib/utils';
import { ValidatedTicket } from '@/app/components/validated-ticket';

export default function VerifyTab() {
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
        <div className="space-y-6">
            <Card className="border-none shadow-lg overflow-hidden rounded-3xl">
                <CardHeader className="bg-slate-900 text-white p-6">
                    <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                        <Search className="h-6 w-6 text-[#00B893]" /> Standard Verification
                    </CardTitle>
                    <CardDescription className="text-slate-400">Enter ticket registration code</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                    <form onSubmit={handleVerification} className="flex gap-3">
                        <Input 
                            placeholder="TKT-XX-XXXXX" 
                            value={ticketCode} 
                            onChange={(e) => setTicketCode(e.target.value)} 
                            required 
                            className="uppercase font-mono text-lg h-14 rounded-xl border-slate-200 focus:ring-[#00B893]" 
                        />
                        <Button type="submit" className="h-14 w-20 bg-[#00B893] hover:bg-[#009e7c] rounded-xl" disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin h-6 w-6" /> : <Search className="h-6 w-6" />}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {status === 'not_found' && (
                <Card className="glass-card p-10 text-center border-red-100 bg-red-50/30 rounded-3xl">
                    <XCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
                    <h3 className="text-xl font-black text-red-600 uppercase mb-2">Ticket Not Found</h3>
                    <p className="text-sm text-slate-500 font-medium">Please double check the code provided by the passenger.</p>
                </Card>
            )}

            {status === 'found' && ticket && (
                <div className="space-y-6">
                    {(ticket.status === 'used' || ticket.status === 'cancelled' || ticket.status === 'expired') && !justValidated ? (
                        <Card className="overflow-hidden rounded-3xl border-none shadow-xl bg-white">
                            <CardHeader className="text-center py-16 bg-slate-50">
                                <h1 className={cn("text-5xl font-black uppercase tracking-[0.2em]", 
                                    ticket.status === 'used' ? "text-slate-400" : 
                                    ticket.status === 'cancelled' ? "text-red-500" : "text-yellow-500"
                                )}>
                                    {ticket.status}
                                </h1>
                                <p className="mt-4 font-bold text-slate-500 uppercase tracking-widest text-xs">Invalid for Boarding</p>
                            </CardHeader>
                        </Card>
                    ) : justValidated ? (
                        <div className="animate-in slide-in-from-bottom-5 duration-500">
                             <ValidatedTicket ticket={{...ticket, timestamp: ticket.validatedAt || ticket.createdAt}} />
                        </div>
                    ) : (
                        <Card className="overflow-hidden rounded-3xl border-none shadow-2xl bg-white border-t-8 border-t-emerald-500">
                            <CardHeader className="text-center bg-emerald-50/50 pb-8 pt-10">
                                <CheckCircle className="mx-auto text-emerald-500 h-16 w-16 mb-4" />
                                <CardTitle className="text-3xl font-black uppercase tracking-[0.1em] text-emerald-600">VALID TICKET</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-8 p-10">
                                <div className="flex justify-between items-center p-6 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                                    <div className="text-center flex-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">FROM</p>
                                        <p className="font-black text-lg text-slate-900 uppercase">{ticket.from}</p>
                                    </div>
                                    <ArrowRight className="h-6 w-6 text-emerald-500" />
                                    <div className="text-center flex-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">TO</p>
                                        <p className="font-black text-lg text-slate-900 uppercase">{ticket.to}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-10">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Passengers</p>
                                        <p className="font-black text-xl text-slate-800">{ticket.passengers}</p>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fare Paid</p>
                                        <p className="font-black text-2xl text-[#00B893]">₹{ticket.totalFare?.toFixed(2)}</p>
                                    </div>
                                </div>
                                <div className="border-t border-dashed border-slate-200 pt-8 flex flex-col items-center">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Security PIN</p>
                                    <div className="flex flex-col items-center gap-4">
                                        {showPin ? (
                                            <p className="text-5xl font-mono font-black text-center tracking-[0.3em] text-[#0A2B70]">
                                                {ticket.securityCode}
                                            </p>
                                        ) : (
                                            <div className="h-[60px] flex items-center">
                                                <div className="flex gap-2">
                                                    {[1,2,3,4,5].map(i => <div key={i} className="w-3 h-3 rounded-full bg-slate-200"></div>)}
                                                </div>
                                            </div>
                                        )}
                                        <Button 
                                            variant="ghost" 
                                            className="font-black text-[10px] uppercase tracking-widest text-slate-500 hover:text-[#0A2B70]"
                                            onClick={() => setShowPin(!showPin)}
                                        >
                                            {showPin ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                                            {showPin ? 'Hide' : 'Reveal'} Security Code
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="p-0">
                                <Button 
                                    onClick={handleValidate} 
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 h-20 text-xl font-black uppercase tracking-widest rounded-none" 
                                    disabled={isLoading}
                                >
                                    {isLoading ? <Loader2 className="animate-spin mr-3 h-6 w-6" /> : <CheckCircle className="mr-3 h-6 w-6" />}
                                    Validate Boarding
                                </Button>
                            </CardFooter>
                        </Card>
                    )}
                    <Button 
                        variant="outline" 
                        className="w-full h-14 bg-white border-slate-200 text-slate-500 font-black rounded-2xl uppercase tracking-widest text-xs" 
                        onClick={() => {setStatus('idle'); setTicketCode(''); setTicket(null); setShowPin(false); setJustValidated(false);}}
                    >
                        Clear and Verify Next
                    </Button>
                </div>
            )}
        </div>
    );
}
