
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Search, CheckCircle, XCircle, Loader2, ArrowRight, RefreshCcw, Calendar, Clock, CreditCard, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import Header from '@/app/components/header';
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS } from '@/lib/api-config';
import { cn } from '@/lib/utils';
import { ValidatedTicket } from '@/app/components/validated-ticket';
import { Separator } from '@/components/ui/separator';
import AuthGuard from '@/app/components/AuthGuard';
import { Badge } from '@/components/ui/badge';
import { routes } from '@/lib/routes';
import { calculateFare } from '@/lib/fare-calculator';

export const dynamic = "force-dynamic";

const normalizeService = (type: string) => {
  const t = (type || "").toLowerCase();
  if (t.includes('delux')) return 'Metro Deluxe';
  if (t.includes('express')) return 'Metro Express';
  return 'City Ordinary';
};

export default function VerifyTicketPage() {
    const [routeNo, setRouteNo] = useState('01');
    const [ticketDigits, setTicketDigits] = useState('');
    const [isRouteSelectorOpen, setRouteSelectorOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    
    const [ticket, setTicket] = useState<any>(null);
    const [passenger, setPassenger] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'found' | 'not_found'>('idle');
    const [showPin, setShowPin] = useState(false);
    const [justValidated, setJustValidated] = useState(false);
    const [actualBusType, setActualBusType] = useState<string>('');
    const [dynamicFare, setDynamicFare] = useState<number>(0);
    const { toast } = useToast();

    const filteredRoutes = useMemo(() => {
        return routes.filter(r => 
            r.routeName.toLowerCase().includes(searchQuery.toLowerCase()) || 
            r.routeNo.includes(searchQuery)
        );
    }, [searchQuery]);

    useEffect(() => {
        if (ticket && actualBusType) {
            const mappedSlug = actualBusType.toLowerCase().includes('deluxe') ? 'deluxe' 
                             : actualBusType.toLowerCase().includes('express') ? 'express' 
                             : 'ordinary';
            
            const newFare = calculateFare(ticket.from, ticket.to, ticket.quantities, mappedSlug as any);
            setDynamicFare(newFare);
        }
    }, [actualBusType, ticket]);

    const handleVerification = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (ticketDigits.length !== 5) return;

        const fullCode = `TKT-${routeNo}-${ticketDigits}`;
        setIsLoading(true);
        setStatus('idle');
        setTicket(null);
        setPassenger(null);
        
        try {
            const response = await fetch(`${API_ENDPOINTS.VERIFY}/${fullCode.toUpperCase()}`);
            if (!response.ok) {
                if (response.status === 404) { setStatus('not_found'); return; }
                throw new Error("Invalid");
            }
            const result = await response.json().catch(() => null);
            if (!result || !result.ticket) throw new Error("Invalid");

            const normalizedTicket = {
                ...result.ticket,
                busType: normalizeService(result.ticket.busType)
            };

            setTicket(normalizedTicket);
            setActualBusType(normalizedTicket.busType);
            setDynamicFare(normalizedTicket.totalFare);
            
            const userRes = await fetch(`/api/user-data?phone=${normalizedTicket.bookedBy}`);
            if (userRes.ok) {
                const userData = await userRes.json().catch(() => ({}));
                setPassenger(userData.user || null);
            }
            
            setStatus('found');
        } catch (error: any) {
            setStatus('not_found');
            toast({ variant: 'destructive', title: 'Invalid', description: 'Ticket record not found.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleValidate = async () => {
        if (!ticket) return;
        setIsLoading(true);
        const conductorId = localStorage.getItem('currentUser');

        try {
            const response = await fetch(`${API_ENDPOINTS.USE}/${ticket.ticketCode}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    actualBusType, 
                    conductorId 
                })
            });

            if (!response.ok) throw new Error("Validation failed");
            
            const result = await response.json().catch(() => null);
            if (!result || !result.ticket) throw new Error("Server Error");

            if (result.refunded) toast({ title: "Credit Applied", description: `₹${result.refunded} added to passenger wallet.` });
            if (result.deducted) toast({ title: "Debit Applied", description: `₹${result.deducted} debited from passenger wallet.` });
            
            setTicket({
                ...result.ticket,
                busType: normalizeService(result.ticket.busType)
            });
            setJustValidated(true);
            toast({ title: "Boarding Validated", description: "Record synchronized." });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    const isServiceChanged = ticket && actualBusType !== ticket.busType;
    
    // Logic for Auto-Deduct vs Manual Collection (Deduction Case Only)
    const fareDiff = Math.abs((ticket?.totalFare || 0) - dynamicFare);
    const isRefund = dynamicFare < (ticket?.totalFare || 0);
    const hasSufficientBalance = (passenger?.walletBalance || 0) >= fareDiff;
    const canAutoDeduct = passenger?.autoDeductEnabled && hasSufficientBalance;

  return (
    <AuthGuard>  
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Header showBackButton={true} backHref="/conductor/dashboard" title="Ticket Tool" />
        
        <main className="flex flex-col items-center p-4 space-y-3 pb-32">
          <Card className="w-full max-w-md shadow-sm border-slate-200">
            <CardHeader className="py-2 px-4 flex-row items-center justify-between">
                <CardTitle className="font-headline text-[9px] uppercase tracking-[0.2em] text-slate-400">Verification Entry</CardTitle>
                <Badge variant="outline" className="text-[7px] font-black uppercase text-emerald-600 border-emerald-100 bg-emerald-50">Authorized</Badge>
            </CardHeader>
            <CardContent className="px-4 pb-3.5 pt-0">
              <div className="flex items-center gap-2">
                <div className="bg-slate-100 h-10 px-3 flex items-center rounded-lg font-mono font-black text-slate-400 text-xs">TKT-</div>
                <Button variant="outline" className="h-10 w-14 border-2 border-slate-200 rounded-lg font-black text-xs bg-white" onClick={() => setRouteSelectorOpen(true)}>{routeNo}</Button>
                <div className="text-slate-300 font-black">-</div>
                <Input 
                  placeholder="XXXXX" 
                  value={ticketDigits} 
                  onChange={(e) => setTicketDigits(e.target.value.replace(/\D/g, '').slice(0, 5))} 
                  className="font-mono text-base h-10 tracking-[0.2em] rounded-lg border-2 border-slate-200 focus:border-[#00B893] text-center font-black" 
                />
                <Button onClick={() => handleVerification()} disabled={isLoading || ticketDigits.length !== 5} className="h-10 w-12 bg-[#00B893] hover:bg-[#009e7c] rounded-lg shrink-0">
                    {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {status === 'not_found' && (
              <Card className="w-full max-w-md p-8 text-center text-destructive border-destructive/20 bg-white animate-in zoom-in duration-300 rounded-[2rem]">
                  <XCircle className="mx-auto mb-3 h-12 w-12" />
                  <h3 className="font-black text-sm uppercase tracking-widest">INVALID</h3>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">Record TKT-{routeNo}-{ticketDigits} not found.</p>
              </Card>
          )}

          {status === 'found' && ticket && (
            <div className="w-full max-w-md space-y-4">
              {justValidated ? (
                  <div className="animate-in slide-in-from-bottom-2 duration-500">
                      <ValidatedTicket ticket={ticket} />
                      <Button variant="ghost" className="w-full mt-4 h-12 text-slate-400 font-black rounded-xl uppercase text-[9px] tracking-[0.3em] hover:bg-slate-100" onClick={() => {setStatus('idle'); setTicketDigits(''); setTicket(null); setJustValidated(false);}}>
                          Next Passenger
                      </Button>
                  </div>
              ) : (ticket.status !== 'valid') ? (
                  <Card className="overflow-hidden bg-white shadow-lg border-slate-200 rounded-[2rem]">
                      <CardHeader className="text-center bg-slate-50 py-16 px-4">
                          <h1 className={cn("text-3xl font-black uppercase tracking-[0.1em]", 
                              ticket.status === 'used' ? "text-slate-300" : "text-red-500"
                          )}>{ticket.status}</h1>
                          <p className="mt-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">BOARDING REJECTED</p>
                      </CardHeader>
                  </Card>
              ) : (
                  <div className="space-y-3 animate-in slide-in-from-bottom-2 duration-400">
                      <Card className="overflow-hidden shadow-xl bg-white border-none rounded-[1.8rem] border-t-8 border-t-[#00B893]">
                          <CardHeader className="text-center py-3.5 px-6 relative">
                              <RefreshCcw className="absolute right-5 top-5 h-4 w-4 text-slate-300 cursor-pointer hover:text-[#00B893]" onClick={() => {setTicket(null); setStatus('idle');}} />
                              <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase font-headline">JOURNEY DETAILS</h2>
                              <div className="flex justify-center mt-0.5">
                                  <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-black px-4 py-0.5 rounded-full uppercase text-[8px] tracking-widest border-none">VALID</Badge>
                              </div>
                          </CardHeader>

                          <CardContent className="space-y-2.5 px-6 pt-0 pb-5">
                              <div className="flex justify-between items-center p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                                  <div className="text-center flex-1">
                                      <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5">FROM</p>
                                      <p className="font-black text-slate-800 text-xs uppercase tracking-tight truncate">{ticket.from}</p>
                                  </div>
                                  <ArrowRight className="h-4 w-4 text-[#00B893] mx-1.5" />
                                  <div className="text-center flex-1">
                                      <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5">TO</p>
                                      <p className="font-black text-slate-800 text-xs uppercase tracking-tight truncate">{ticket.to}</p>
                                  </div>
                              </div>

                              <div className="flex justify-between items-center px-1">
                                   <div className="space-y-0.5">
                                      <p className="font-black text-slate-400 uppercase text-[8px] tracking-widest">DATE</p>
                                      <p className="font-black text-slate-800 text-xs">{new Date(ticket.createdAt).toLocaleDateString('en-GB')}</p>
                                   </div>
                                   <div className="space-y-0.5 text-right">
                                      <p className="font-black text-slate-400 uppercase text-[8px] tracking-widest">TIME</p>
                                      <p className="font-black text-slate-800 text-xs">{new Date(ticket.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
                                   </div>
                              </div>

                              <Separator className="bg-slate-100" />

                              <div className="px-1 flex justify-between items-center">
                                  <div>
                                    <p className="font-black text-slate-400 uppercase text-[8px] tracking-widest mb-0.5">PASSENGERS</p>
                                    <p className="font-black text-slate-800 text-xs">{ticket.passengers}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-black text-slate-400 uppercase text-[8px] tracking-widest mb-0.5">BOOKED AS</p>
                                    <p className="font-black text-emerald-500 text-xs uppercase tracking-tight">{ticket.busType}</p>
                                  </div>
                              </div>

                              <Separator className="bg-slate-100 border-dashed" />

                              <div className="flex justify-between items-end px-1">
                                   <div className="space-y-0.5">
                                      <p className="font-black text-slate-400 uppercase text-[8px] tracking-widest">
                                        {isServiceChanged ? "FARE (ADJUSTED)" : "FARE PAID"}
                                      </p>
                                      <p className="font-black text-[#00B893] text-2xl tracking-tighter leading-none">₹{dynamicFare.toFixed(2)}</p>
                                   </div>
                                   {isServiceChanged && (
                                     <div className="text-right pb-0.5">
                                        <p className="font-black text-slate-400 uppercase text-[8px] tracking-widest">DIFFERENCE</p>
                                        <p className={cn("font-black text-sm", isRefund ? "text-emerald-600" : "text-orange-600")}>
                                            {isRefund ? '-' : '+'}₹{fareDiff.toFixed(2)}
                                        </p>
                                     </div>
                                   )}
                              </div>

                              {isServiceChanged && (
                                  <div className={cn("p-2.5 rounded-xl flex items-center justify-between border-2 animate-in slide-in-from-top-1 duration-300", 
                                      isRefund ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-orange-50 border-orange-100 text-orange-700"
                                  )}>
                                      <div className="flex items-center gap-2">
                                          {isRefund ? <CreditCard className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                                          <div className="leading-tight">
                                              <p className="text-[9px] font-black uppercase tracking-widest mb-0.5">
                                                  {isRefund ? "REFUND TO WALLET" : 
                                                   canAutoDeduct ? "AUTO-DEDUCT WALLET" : "MANUAL COLLECTION"}
                                              </p>
                                              <p className="text-[9px] font-bold">
                                                  {isRefund ? `₹${fareDiff.toFixed(2)} will be credited.` :
                                                   canAutoDeduct ? `₹${fareDiff.toFixed(2)} will be debited.` :
                                                   passenger?.autoDeductEnabled && !hasSufficientBalance
                                                   ? `Insufficient Funds. Collect ₹${fareDiff.toFixed(2)} cash.`
                                                   : `Collect ₹${fareDiff.toFixed(2)} cash.`}
                                              </p>
                                          </div>
                                      </div>
                                  </div>
                              )}

                              <div className="pt-0.5">
                                   <p className="text-[7px] font-black text-slate-400 uppercase mb-1 text-center tracking-[0.2em]">ACTUAL BOARDING SERVICE</p>
                                   <Select value={actualBusType} onValueChange={setActualBusType}>
                                      <SelectTrigger className="bg-slate-50 border-none h-10 font-black uppercase text-[10px] tracking-widest rounded-xl shadow-inner">
                                          <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                          <SelectItem value="City Ordinary" className="font-bold text-xs uppercase">City Ordinary</SelectItem>
                                          <SelectItem value="Metro Express" className="font-bold text-xs uppercase">Metro Express</SelectItem>
                                          <SelectItem value="Metro Deluxe" className="font-bold text-xs uppercase">Metro Deluxe</SelectItem>
                                      </SelectContent>
                                   </Select>
                              </div>

                              <div className="bg-[#E6F7F3] p-2.5 rounded-2xl flex flex-col items-center border border-[#CCEFED]">
                                  <p className="text-[8px] font-black text-[#00B893] uppercase tracking-[0.3em] mb-1">SECURITY PIN</p>
                                  <div className="flex items-center gap-2">
                                      {showPin ? (
                                          <p className="text-2xl font-mono font-black text-[#0A2B70] tracking-[0.4em] uppercase">{ticket.securityCode}</p>
                                      ) : (
                                          <div className="flex gap-3">
                                              {[1,2,3,4,5].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#00B893]"></div>)}
                                          </div>
                                      )}
                                      <button className="ml-2 text-slate-400 hover:text-[#00B893] transition-colors" onClick={() => setShowPin(!showPin)}>
                                          {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                      </button>
                                  </div>
                              </div>
                          </CardContent>
                      </Card>

                      <div className="w-full bg-[#1A1F2E] py-2 flex flex-col items-center gap-0.5 rounded-2xl cursor-pointer" onClick={() => { if(ticket.ticketCode) { navigator.clipboard.writeText(ticket.ticketCode); toast({ title: "Copied", description: "Ticket ID saved." }); } }}>
                          <p className="text-[7px] font-black text-slate-500 uppercase tracking-[0.3em]">TICKET CODE</p>
                          <p className="text-sm font-black text-white tracking-[0.1em] font-mono">{ticket.ticketCode}</p>
                      </div>

                      <Button onClick={handleValidate} className="w-full h-15 bg-[#00B893] hover:bg-[#009e7c] text-lg font-black uppercase tracking-[0.1em] rounded-2xl shadow-xl" disabled={isLoading}>
                          {isLoading ? "VALIDATING..." : "VALIDATE BOARDING"}
                      </Button>
                  </div>
              )}
            </div>
          )}
        </main>

        <Dialog open={isRouteSelectorOpen} onOpenChange={setRouteSelectorOpen}>
            <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden border-none">
                <DialogHeader className="bg-[#00B893] text-white p-6">
                    <DialogTitle className="font-headline uppercase tracking-tight text-xl">Select Bus Route</DialogTitle>
                    <DialogDescription className="hidden">Choose route to filter tickets</DialogDescription>
                </DialogHeader>
                <Command className="rounded-none">
                    <CommandInput placeholder="Search routes (e.g. 01 or Mehdipatnam)..." onValueChange={setSearchQuery} className="h-14 font-medium" />
                    <CommandList className="max-h-[300px]">
                        <CommandEmpty>No routes found.</CommandEmpty>
                        <CommandGroup>
                            {filteredRoutes.map((route) => (
                                <CommandItem key={route.routeNo} onSelect={() => { setRouteNo(route.routeNo); setRouteSelectorOpen(false); setSearchQuery(''); }} className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50 border-b border-slate-50 last:border-none">
                                    <div className="w-10 h-10 bg-[#0A2B70] text-white rounded-lg flex items-center justify-center font-bold">{route.routeNo}</div>
                                    <span className="font-black text-slate-800 uppercase text-xs">{route.routeName}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </DialogContent>
        </Dialog>
      </div>
    </AuthGuard>
  );
}
