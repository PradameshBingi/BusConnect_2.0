'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, CheckCircle, XCircle, Loader2, ArrowRight, Eye, EyeOff, RefreshCcw } from 'lucide-react';
import Header from '@/app/components/header';
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS } from '@/lib/api-config';
import { cn } from '@/lib/utils';
import { ValidatedTicket } from '@/app/components/validated-ticket';
import { Separator } from '@/components/ui/separator';
import AuthGuard from '@/app/components/AuthGuard';
import { Badge } from '@/components/ui/badge';

export const dynamic = "force-dynamic";

export default function VerifyTicketPage() {
    const [ticketCode, setTicketCode] = useState('');
    const [ticket, setTicket] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'found' | 'not_found'>('idle');
    const [showPin, setShowPin] = useState(false);
    const [justValidated, setJustValidated] = useState(false);
    const [actualBusType, setActualBusType] = useState<string>('');
    const { toast } = useToast();

    const handleVerification = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus('idle');
        setShowPin(false);
        setJustValidated(false);
        setTicket(null);
        
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
            setActualBusType(result.ticket.busType);
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
                body: JSON.stringify({ actualBusType })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || "Validation failed");
            }
            
            const result = await response.json();
            const updatedTicket = result.ticket;
            
            if (result.refunded) {
                toast({ title: "Refund Issued", description: `Rs. ${result.refunded} refunded to passenger wallet.` });
            }

            // Record verification for local stats
            const vStats = JSON.parse(localStorage.getItem('conductorVerificationStats') || '[]');
            vStats.push({
                ticketCode: updatedTicket.ticketCode,
                verifiedAt: new Date().toISOString(),
                from: updatedTicket.from,
                to: updatedTicket.to,
                busType: updatedTicket.busType,
                totalFare: updatedTicket.totalFare
            });
            localStorage.setItem('conductorVerificationStats', JSON.stringify(vStats));
            
            setTicket(updatedTicket);
            setJustValidated(true);
            toast({ title: "Validated", description: "Ticket status updated to USED." });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsLoading(false);
        }
    };

  return (
    <AuthGuard>  
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Header showBackButton={true} backHref="/conductor/ticket" title="Verify Ticket" />
        
        <main className="flex flex-col items-center p-4 space-y-6 pb-32">
          {/* SEARCH CARD - PERSISTENT */}
          <Card className="w-full max-w-md shadow-sm border-slate-200">
            <CardHeader className="pb-3">
                <CardTitle className="font-headline text-xl uppercase">Verify Ticket Code</CardTitle>
                <CardDescription>Enter alphanumeric code for boarding check</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerification} className="flex gap-2">
                <Input 
                  placeholder="TKT-XX-XXXXX" 
                  value={ticketCode} 
                  onChange={(e) => setTicketCode(e.target.value)} 
                  required 
                  className="uppercase font-mono text-lg h-12 tracking-widest" 
                />
                <Button type="submit" disabled={isLoading} className="h-12 w-16 bg-[#00B893] hover:bg-[#009e7c]">
                    {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : <Search className="h-5 w-5" />}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          {status === 'not_found' && (
              <Card className="w-full max-w-md p-6 text-center text-destructive border-destructive/20 bg-white animate-in fade-in zoom-in duration-300">
                  <XCircle className="mx-auto mb-2 h-12 w-12" />
                  <h3 className="font-bold text-lg">Ticket Not Found</h3>
                  <p className="text-sm text-slate-500">The provided code does not exist in our system.</p>
              </Card>
          )}

          {status === 'found' && ticket && (
            <div className="w-full max-w-md space-y-6">
              {justValidated ? (
                  /* FINAL PINK TICKET */
                  <div className="animate-in slide-in-from-bottom-4 duration-500">
                      <ValidatedTicket ticket={{
                        ...ticket, 
                        timestamp: ticket.validatedAt || new Date().toISOString()
                      }} />
                      <Button 
                          variant="outline" 
                          className="w-full mt-6 h-14 bg-white border-slate-200 text-slate-500 font-black rounded-2xl uppercase tracking-widest" 
                          onClick={() => {setStatus('idle'); setTicketCode(''); setTicket(null); setJustValidated(false);}}
                      >
                          Done - Verify Next
                      </Button>
                  </div>
              ) : (ticket.status === 'used' || ticket.status === 'cancelled' || ticket.status === 'expired') ? (
                  /* INVALID STATUS CARD */
                  <Card className="overflow-hidden bg-white shadow-lg border-slate-200 animate-in zoom-in-95 duration-300">
                      <CardHeader className="text-center bg-slate-50 py-12">
                          <h1 className={cn("text-4xl font-black uppercase tracking-[0.2em]", 
                              ticket.status === 'used' ? "text-slate-300" : 
                              ticket.status === 'cancelled' ? "text-red-500" : "text-yellow-500"
                          )}>
                              TICKET {ticket.status}
                          </h1>
                          <p className="mt-2 text-xs font-bold text-slate-400 uppercase">Boarding Denied</p>
                      </CardHeader>
                  </Card>
              ) : (
                  /* JOURNEY DETAILS PREVIEW CARD */
                  <Card className="overflow-hidden shadow-2xl bg-white border-none rounded-[2rem] border-t-8 border-t-[#00B893] animate-in slide-in-from-bottom-4 duration-500">
                      <CardHeader className="text-center pb-2 pt-8 relative">
                          <RefreshCcw 
                            className="absolute right-6 top-8 h-6 w-6 text-slate-300 cursor-pointer hover:text-[#00B893] transition-colors" 
                            onClick={() => {setTicket(null); setStatus('idle'); setTicketCode('');}}
                          />
                          <h2 className="text-3xl font-black text-slate-900 tracking-[0.1em] uppercase mb-3">JOURNEY DETAILS</h2>
                          <Badge className="bg-[#00B893] text-white px-6 py-1 rounded-full font-bold uppercase tracking-wider">Valid</Badge>
                      </CardHeader>

                      <CardContent className="space-y-6 px-8 pt-6">
                          {/* ROUTE BOXES */}
                          <div className="flex justify-between items-center p-6 bg-slate-50 rounded-3xl border border-slate-100 shadow-inner">
                              <div className="text-center flex-1">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">FROM</p>
                                  <p className="font-black text-slate-800 text-xl uppercase tracking-tighter">{ticket.from}</p>
                              </div>
                              <div className="px-4">
                                  <ArrowRight className="h-6 w-6 text-[#00B893]" />
                              </div>
                              <div className="text-center flex-1">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">TO</p>
                                  <p className="font-black text-slate-800 text-xl uppercase tracking-tighter">{ticket.to}</p>
                              </div>
                          </div>

                          <div className="grid grid-cols-2 gap-y-4 px-2">
                               <div className="space-y-0.5">
                                  <p className="text-[10px] font-black text-slate-400 uppercase">ISSUE DATE</p>
                                  <p className="font-black text-slate-800 text-sm">
                                      {new Date(ticket.createdAt).toLocaleDateString('en-GB')}
                                  </p>
                               </div>
                               <div className="space-y-0.5 text-right">
                                  <p className="text-[10px] font-black text-slate-400 uppercase">ISSUE TIME</p>
                                  <p className="font-black text-slate-800 text-sm">
                                      {new Date(ticket.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                               </div>
                               <Separator className="col-span-2 bg-slate-100 border-dashed" />
                               <div className="col-span-2 space-y-0.5">
                                  <p className="text-[10px] font-black text-slate-400 uppercase">PASSENGERS</p>
                                  <p className="font-black text-slate-800 text-sm">
                                      Men: {ticket.quantities?.Men || 0}, Child: {ticket.quantities?.Child || 0}, Women: {ticket.quantities?.Women || 0}
                                  </p>
                               </div>
                               <Separator className="col-span-2 bg-slate-100 border-dashed" />
                               <div className="space-y-0.5">
                                  <p className="text-[10px] font-black text-slate-400 uppercase">FARE PAID</p>
                                  <p className="font-black text-[#00B893] text-xl">Rs. {ticket.totalFare.toFixed(2)}</p>
                               </div>
                               <div className="space-y-0.5 text-right">
                                  <p className="text-[10px] font-black text-slate-400 uppercase">BUS CATEGORY</p>
                                  <p className="font-black text-[#00B893] text-sm uppercase">{ticket.busType}</p>
                               </div>
                          </div>

                          {/* CATEGORY SELECTOR FOR AUTO-REFUND */}
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                               <p className="text-[9px] font-black text-slate-400 uppercase mb-2 text-center tracking-widest">ACTUAL BOARDING CATEGORY</p>
                               <Select value={actualBusType} onValueChange={setActualBusType}>
                                  <SelectTrigger className="bg-white rounded-xl border-slate-200 h-10 font-bold uppercase text-xs">
                                      <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                      <SelectItem value="ordinary">City Ordinary</SelectItem>
                                      <SelectItem value="express">Metro Express</SelectItem>
                                      <SelectItem value="deluxe">Metro Deluxe</SelectItem>
                                  </SelectContent>
                               </Select>
                          </div>

                          {/* SECURITY PIN */}
                          <div className="bg-[#F0FDF4] p-8 rounded-3xl border border-[#DCFCE7] flex flex-col items-center">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">SECURITY CODE</p>
                              <div className="flex flex-col items-center gap-4">
                                  {showPin ? (
                                      <p className="text-5xl font-mono font-black text-[#0A2B70] tracking-[0.3em]">
                                          {ticket.securityCode}
                                      </p>
                                  ) : (
                                      <div className="flex gap-4">
                                          {[1,2,3,4,5].map(i => <div key={i} className="w-4 h-4 rounded-full bg-[#00B893]"></div>)}
                                      </div>
                                  )}
                                  <Button 
                                      variant="ghost" 
                                      size="sm"
                                      className="text-[10px] font-black uppercase text-slate-400 hover:text-[#00B893]" 
                                      onClick={() => setShowPin(!showPin)}
                                  >
                                      {showPin ? <EyeOff className="mr-1.5 h-3.5 w-3.5" /> : <Eye className="mr-1.5 h-3.5 w-3.5" />}
                                      {showPin ? 'Hide' : 'Reveal'}
                                  </Button>
                              </div>
                          </div>
                      </CardContent>

                      <CardFooter className="p-0 flex flex-col">
                          <div className="w-full bg-[#0F172A] py-6 flex flex-col items-center gap-1">
                              <p className="text-[10px] font-black text-slate-400 uppercase">TICKET NO</p>
                              <p className="text-xl font-black text-white tracking-widest">{ticket.ticketCode}</p>
                          </div>
                          <Button 
                              onClick={handleValidate} 
                              className="w-full h-20 bg-[#00B893] hover:bg-[#009e7c] text-xl font-black uppercase tracking-widest rounded-none shadow-2xl" 
                              disabled={isLoading}
                          >
                              {isLoading ? <Loader2 className="animate-spin mr-3 h-7 w-7" /> : <CheckCircle className="mr-3 h-7 w-7" />}
                              VALIDATE BOARDING
                          </Button>
                      </CardFooter>
                  </Card>
              )}
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
