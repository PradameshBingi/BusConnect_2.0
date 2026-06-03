'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Search, CheckCircle, XCircle, Loader2, ArrowRight, RefreshCcw, Calendar, Clock, CreditCard, ShieldAlert, Copy, Eye, EyeOff } from 'lucide-react';
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
            const newFare = calculateFare(ticket.from, ticket.to, ticket.quantities, actualBusType as any);
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
                throw new Error("Server error");
            }
            const result = await response.json();
            setTicket(result.ticket);
            setActualBusType(result.ticket.busType);
            setDynamicFare(result.ticket.totalFare);
            
            // Fetch passenger's wallet authorization status
            const userRes = await fetch(`/api/user-data?phone=${result.ticket.bookedBy}`);
            const userData = await userRes.json();
            setPassenger(userData.user);
            
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

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || "Validation failed");
            }
            
            const result = await response.json();
            if (result.refunded) toast({ title: "Refund Issued", description: `₹${result.refunded} credited to passenger wallet.` });
            if (result.deducted) toast({ title: "Deducted", description: `₹${result.deducted} deducted from passenger wallet.` });
            
            setTicket(result.ticket);
            setJustValidated(true);
            toast({ title: "Validated", description: "Boarding confirmed and logged." });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsLoading(false);
        }
    };

  return (
    <AuthGuard>  
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Header showBackButton={true} backHref="/conductor/dashboard" title="Ticket Verification" />
        
        <main className="flex flex-col items-center p-4 space-y-4 pb-32">
          {/* SCAN ENTRY CODE CARD */}
          <Card className="w-full max-w-md shadow-sm border-slate-200">
            <CardHeader className="py-2 px-4 flex-row items-center justify-between">
                <CardTitle className="font-headline text-[10px] uppercase tracking-[0.2em] text-slate-400">Scan Entry Code</CardTitle>
                <Badge variant="outline" className="text-[8px] font-black uppercase text-emerald-600 border-emerald-200 bg-emerald-50">Cloud Linked</Badge>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
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
              <Card className="w-full max-w-md p-6 text-center text-destructive border-destructive/20 bg-white animate-in zoom-in duration-300">
                  <XCircle className="mx-auto mb-2 h-10 w-10" />
                  <h3 className="font-black text-xs uppercase tracking-widest">Ticket Record Missing</h3>
                  <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold">Code TKT-{routeNo}-{ticketDigits} not found in cloud.</p>
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
                  <Card className="overflow-hidden bg-white shadow-lg border-slate-200">
                      <CardHeader className="text-center bg-slate-50 py-16 px-4">
                          <h1 className={cn("text-3xl font-black uppercase tracking-[0.1em]", 
                              ticket.status === 'used' ? "text-slate-300" : "text-red-500"
                          )}>TICKET {ticket.status}</h1>
                          <p className="mt-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">BOARDING DENIED</p>
                      </CardHeader>
                  </Card>
              ) : (
                  /* HIGH FIDELITY JOURNEY PREVIEW (AS PER IMAGE) */
                  <Card className="overflow-hidden shadow-2xl bg-white border-none rounded-[2rem] border-t-8 border-t-[#00B893] animate-in slide-in-from-bottom-2 duration-400">
                      <CardHeader className="text-center py-6 px-6 relative">
                          <RefreshCcw className="absolute right-6 top-6 h-5 w-5 text-slate-300 cursor-pointer hover:text-[#00B893]" onClick={() => {setTicket(null); setStatus('idle');}} />
                          <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase font-headline">JOURNEY DETAILS</h2>
                          <div className="flex justify-center mt-3">
                              <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-black px-6 py-1 rounded-full uppercase text-[10px] tracking-widest border-none">Valid</Badge>
                          </div>
                      </CardHeader>

                      <CardContent className="space-y-6 px-8 pt-2 pb-0">
                          {/* FROM - TO SECTION */}
                          <div className="flex justify-between items-center p-6 bg-slate-50/50 rounded-[1.5rem] border border-slate-100">
                              <div className="text-center flex-1">
                                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">FROM</p>
                                  <p className="font-black text-slate-800 text-lg uppercase tracking-tight">{ticket.from}</p>
                              </div>
                              <ArrowRight className="h-5 w-5 text-[#00B893] mx-4" />
                              <div className="text-center flex-1">
                                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">TO</p>
                                  <p className="font-black text-slate-800 text-lg uppercase tracking-tight">{ticket.to}</p>
                              </div>
                          </div>

                          {/* ISSUE INFO SECTION */}
                          <div className="flex justify-between items-center px-2">
                               <div className="space-y-1">
                                  <p className="font-black text-slate-400 uppercase text-[9px] tracking-widest">ISSUE DATE</p>
                                  <p className="font-black text-slate-800 text-base">{new Date(ticket.createdAt).toLocaleDateString('en-GB')}</p>
                               </div>
                               <div className="space-y-1 text-right">
                                  <p className="font-black text-slate-400 uppercase text-[9px] tracking-widest">ISSUE TIME</p>
                                  <p className="font-black text-slate-800 text-base">{new Date(ticket.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
                               </div>
                          </div>

                          <Separator className="bg-slate-100" />

                          {/* PASSENGERS SECTION */}
                          <div className="px-2">
                              <p className="font-black text-slate-400 uppercase text-[9px] tracking-widest mb-1">PASSENGERS</p>
                              <p className="font-black text-slate-800 text-base">{ticket.passengers}</p>
                          </div>

                          <Separator className="bg-slate-100 border-dashed" />

                          {/* FARE & CATEGORY SECTION */}
                          <div className="flex justify-between items-end px-2">
                               <div className="space-y-1">
                                  <p className="font-black text-slate-400 uppercase text-[9px] tracking-widest">FARE (ADJUSTED)</p>
                                  <p className="font-black text-[#00B893] text-2xl tracking-tighter">Rs. {dynamicFare.toFixed(2)}</p>
                               </div>
                               <div className="space-y-1 text-right">
                                  <p className="font-black text-slate-400 uppercase text-[9px] tracking-widest">BOOKED SERVICE</p>
                                  <p className="font-black text-emerald-500 text-lg uppercase tracking-tight">{ticket.busType}</p>
                               </div>
                          </div>

                          {/* DIFFERENCE LOGIC BANNER */}
                          {dynamicFare !== ticket.totalFare && (
                              <div className={cn("p-4 rounded-2xl flex items-center justify-between border-2", 
                                  dynamicFare < ticket.totalFare ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-orange-50 border-orange-100 text-orange-700"
                              )}>
                                  <div className="flex items-center gap-3">
                                      {dynamicFare < ticket.totalFare ? <CreditCard className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
                                      <div>
                                          <p className="text-[10px] font-black uppercase tracking-widest leading-none">
                                              {dynamicFare < ticket.totalFare ? "Difference: Credit to Wallet" : 
                                               passenger?.autoDeductEnabled ? "Difference: Auto-Deduct" : "Difference: Manual Collection"}
                                          </p>
                                          <p className="text-xs font-bold mt-1">
                                              {dynamicFare < ticket.totalFare ? `Rs. ${Math.abs(ticket.totalFare - dynamicFare).toFixed(2)} will be refunded.` :
                                               passenger?.autoDeductEnabled ? `Rs. ${Math.abs(ticket.totalFare - dynamicFare).toFixed(2)} from passenger wallet.` :
                                               `Collect Rs. ${Math.abs(ticket.totalFare - dynamicFare).toFixed(2)} in cash.`}
                                          </p>
                                      </div>
                                  </div>
                                  <Badge variant="outline" className={cn("font-black", dynamicFare < ticket.totalFare ? "border-emerald-200 text-emerald-600" : "border-orange-200 text-orange-600")}>
                                      ₹{Math.abs(ticket.totalFare - dynamicFare).toFixed(2)}
                                  </Badge>
                              </div>
                          )}

                          {/* ACTUAL BOARDING SELECTOR */}
                          <div className="pt-2">
                               <p className="text-[9px] font-black text-slate-400 uppercase mb-2 text-center tracking-[0.2em]">ACTUAL BOARDING SERVICES</p>
                               <Select value={actualBusType} onValueChange={setActualBusType}>
                                  <SelectTrigger className="bg-slate-50 border-none h-14 font-black uppercase text-xs tracking-widest rounded-xl shadow-inner">
                                      <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                      <SelectItem value="ordinary" className="font-bold text-xs uppercase">CITY ORDINARY</SelectItem>
                                      <SelectItem value="express" className="font-bold text-xs uppercase">METRO EXPRESS</SelectItem>
                                      <SelectItem value="deluxe" className="font-bold text-xs uppercase">METRO DELUXE</SelectItem>
                                  </SelectContent>
                               </Select>
                          </div>

                          {/* SECURITY PIN SECTION */}
                          <div className="bg-[#E6F7F3] p-6 rounded-[1.5rem] flex flex-col items-center border border-[#CCEFED]">
                              <p className="text-[9px] font-black text-[#00B893] uppercase tracking-[0.3em] mb-4">SECURITY CODE</p>
                              <div className="flex items-center gap-4">
                                  {showPin ? (
                                      <p className="text-3xl font-mono font-black text-[#0A2B70] tracking-[0.4em] uppercase">{ticket.securityCode}</p>
                                  ) : (
                                      <div className="flex gap-4">
                                          {[1,2,3,4,5].map(i => <div key={i} className="w-3 h-3 rounded-full bg-[#00B893]"></div>)}
                                      </div>
                                  )}
                                  <button className="ml-4 text-slate-400 hover:text-[#00B893] transition-colors" onClick={() => setShowPin(!showPin)}>
                                      {showPin ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                                  </button>
                              </div>
                          </div>
                      </CardContent>

                      <CardFooter className="p-0 flex flex-col mt-8">
                          {/* PASSENGER TICKET ID BOX */}
                          <div className="w-full bg-[#1A1F2E] py-4 flex flex-col items-center gap-1 cursor-pointer hover:bg-[#252C3D] transition-colors" onClick={() => { navigator.clipboard.writeText(ticket.ticketCode); toast({ title: "Copied", description: "Ticket ID copied." }); }}>
                              <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em]">TICKET NO</p>
                              <p className="text-xl font-black text-white tracking-[0.1em] font-mono">{ticket.ticketCode}</p>
                          </div>
                          {/* BIG VALIDATION BUTTON */}
                          <Button onClick={handleValidate} className="w-full h-24 bg-[#00B893] hover:bg-[#009e7c] text-xl font-black uppercase tracking-[0.1em] rounded-none shadow-2xl transition-all active:scale-95" disabled={isLoading}>
                              {isLoading ? <Loader2 className="animate-spin mr-3 h-8 w-8" /> : <CheckCircle className="mr-4 h-8 w-8" />}
                              VALIDATE BOARDING
                          </Button>
                      </CardFooter>
                  </Card>
              )}
            </div>
          )}
        </main>

        {/* ROUTE SELECTOR DIALOG */}
        <Dialog open={isRouteSelectorOpen} onOpenChange={setRouteSelectorOpen}>
            <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden border-none">
                <DialogHeader className="bg-[#00B893] text-white p-6">
                    <DialogTitle className="font-headline uppercase tracking-tight text-xl">Select Bus Route</DialogTitle>
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
