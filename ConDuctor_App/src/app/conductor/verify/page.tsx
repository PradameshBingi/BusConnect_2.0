'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Search, CheckCircle, XCircle, Loader2, ArrowRight, Eye, EyeOff, RefreshCcw, Calendar, Clock } from 'lucide-react';
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

    // Recalculate dynamic fare in preview
    useEffect(() => {
        if (ticket && actualBusType) {
            const newFare = calculateFare(ticket.from, ticket.to, ticket.quantities, actualBusType as any);
            setDynamicFare(newFare);
        }
    }, [actualBusType, ticket]);

    const handleVerification = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (ticketDigits.length !== 5) {
            toast({ variant: 'destructive', title: 'Invalid Code', description: 'Please enter exactly 5 digits.' });
            return;
        }

        const fullCode = `TKT-${routeNo}-${ticketDigits}`;
        setIsLoading(true);
        setStatus('idle');
        setShowPin(false);
        setJustValidated(false);
        setTicket(null);
        
        try {
            const response = await fetch(`${API_ENDPOINTS.VERIFY}/${fullCode.toUpperCase()}`);
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
            setDynamicFare(result.ticket.totalFare);
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
                toast({ title: "Refund Issued", description: `Rs. ${result.refunded} credited to passenger wallet.` });
            }

            // Sync Log to MongoDB
            const conductorId = localStorage.getItem('currentUser');
            if (conductorId) {
                await fetch('/api/conductor-logs', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        conductorId,
                        type: 'ticket',
                        data: {
                            ticketCode: updatedTicket.ticketCode,
                            from: updatedTicket.from,
                            to: updatedTicket.to,
                            busType: actualBusType,
                            totalFare: updatedTicket.totalFare,
                            passengers: updatedTicket.passengers,
                            quantities: updatedTicket.quantities
                        }
                    })
                });
            }
            
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
        <Header showBackButton={true} backHref="/" title="Verification" />
        
        <main className="flex flex-col items-center p-4 space-y-4 pb-32">
          {/* Persistent Verification Input Bar */}
          <Card className="w-full max-w-md shadow-sm border-slate-200">
            <CardHeader className="py-3 px-4">
                <div className="flex justify-between items-center">
                    <CardTitle className="font-headline text-lg uppercase tracking-tight">Verify Ticket Code</CardTitle>
                    <Badge variant="outline" className="text-[9px] font-black uppercase text-emerald-600 border-emerald-200">Live Sync</Badge>
                </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="flex items-center gap-2">
                <div className="bg-slate-100 h-10 px-3 flex items-center rounded-lg font-mono font-bold text-slate-500 text-sm">
                    TKT-
                </div>
                
                <Button 
                    variant="outline" 
                    className="h-10 w-14 border-2 border-slate-200 rounded-lg font-bold text-base bg-white"
                    onClick={() => setRouteSelectorOpen(true)}
                >
                    {routeNo}
                </Button>

                <div className="text-slate-400 font-bold">-</div>

                <Input 
                  placeholder="XXXXX" 
                  value={ticketDigits} 
                  onChange={(e) => setTicketDigits(e.target.value.replace(/\D/g, '').slice(0, 5))} 
                  className="font-mono text-base h-10 tracking-[0.2em] rounded-lg border-2 border-slate-200 focus:border-[#00B893] text-center" 
                />
                
                <Button 
                    onClick={() => handleVerification()} 
                    disabled={isLoading || ticketDigits.length !== 5} 
                    className="h-10 w-12 bg-[#00B893] hover:bg-[#009e7c] rounded-lg shrink-0"
                >
                    {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {status === 'not_found' && (
              <Card className="w-full max-w-md p-4 text-center text-destructive border-destructive/20 bg-white animate-in fade-in zoom-in duration-300">
                  <XCircle className="mx-auto mb-1 h-8 w-8" />
                  <h3 className="font-bold text-sm">Ticket Not Found</h3>
                  <p className="text-[11px] text-slate-500">The code TKT-{routeNo}-{ticketDigits} does not exist.</p>
              </Card>
          )}

          {status === 'found' && ticket && (
            <div className="w-full max-w-md space-y-4">
              {justValidated ? (
                  <div className="animate-in slide-in-from-bottom-2 duration-500">
                      <ValidatedTicket ticket={{
                        ...ticket, 
                        timestamp: ticket.validatedAt || new Date().toISOString()
                      }} />
                      <Button 
                          variant="ghost" 
                          className="w-full mt-4 h-10 text-slate-400 font-bold rounded-xl uppercase text-[10px] tracking-widest hover:bg-slate-100" 
                          onClick={() => {setStatus('idle'); setTicketDigits(''); setTicket(null); setJustValidated(false);}}
                      >
                          Verify Next Passenger
                      </Button>
                  </div>
              ) : (ticket.status === 'used' || ticket.status === 'cancelled' || ticket.status === 'expired') ? (
                  <Card className="overflow-hidden bg-white shadow-lg border-slate-200 animate-in zoom-in-95 duration-300">
                      <CardHeader className="text-center bg-slate-50 py-10 px-4">
                          <h1 className={cn("text-3xl font-black uppercase tracking-[0.1em]", 
                              ticket.status === 'used' ? "text-slate-300" : 
                              ticket.status === 'cancelled' ? "text-red-500" : "text-yellow-500"
                          )}>
                              TICKET {ticket.status}
                          </h1>
                          <p className="mt-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">Boarding Denied</p>
                      </CardHeader>
                  </Card>
              ) : (
                  /* JOURNEY DETAILS PREVIEW (Compact & Dynamic) */
                  <Card className="overflow-hidden shadow-xl bg-white border-none rounded-[1.5rem] border-t-4 border-t-[#00B893] animate-in slide-in-from-bottom-2 duration-400">
                      <CardHeader className="text-center py-4 px-6 relative border-b border-slate-50">
                          <RefreshCcw 
                            className="absolute right-4 top-5 h-4 w-4 text-slate-300 cursor-pointer hover:text-[#00B893] transition-colors" 
                            onClick={() => {setTicket(null); setStatus('idle'); setTicketDigits('');}}
                          />
                          <h2 className="text-sm font-black text-slate-400 tracking-[0.2em] uppercase">JOURNEY DETAILS</h2>
                          
                          {/* Issue Metadata */}
                          <div className="flex justify-center gap-4 mt-2 text-[9px] font-bold text-slate-400 uppercase">
                              <span className="flex items-center gap-1"><Calendar className="h-2.5 w-2.5" /> {new Date(ticket.createdAt).toLocaleDateString('en-GB')}</span>
                              <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5" /> {new Date(ticket.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                      </CardHeader>

                      <CardContent className="space-y-4 px-6 pt-4 pb-0">
                          {/* Route Indicators */}
                          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                              <div className="text-left flex-1">
                                  <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">SOURCE</p>
                                  <p className="font-black text-slate-800 text-xs uppercase truncate">{ticket.from}</p>
                              </div>
                              <ArrowRight className="h-4 w-4 text-[#00B893] mx-2" />
                              <div className="text-right flex-1">
                                  <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">DESTINATION</p>
                                  <p className="font-black text-slate-800 text-xs uppercase truncate">{ticket.to}</p>
                              </div>
                          </div>

                          {/* Data Grid */}
                          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-[10px]">
                               <div className="space-y-0.5">
                                  <p className="font-bold text-slate-400 uppercase text-[8px]">PASSENGERS</p>
                                  <p className="font-black text-slate-800">
                                      {ticket.passengers || `${ticket.quantities?.Men}M, ${ticket.quantities?.Women}W, ${ticket.quantities?.Child}C`}
                                  </p>
                               </div>
                               <div className="space-y-0.5 text-right">
                                  <p className="font-bold text-slate-400 uppercase text-[8px]">BOOKED SERVICE</p>
                                  <p className="font-black text-[#0A2B70] uppercase">{ticket.busType}</p>
                               </div>
                               <Separator className="col-span-2 bg-slate-100/50" />
                               <div className="space-y-0.5">
                                  <p className="font-bold text-slate-400 uppercase text-[8px]">FARE (ADJUSTED)</p>
                                  <p className="font-black text-[#00B893] text-lg">Rs. {dynamicFare.toFixed(2)}</p>
                               </div>
                               <div className="space-y-0.5 text-right">
                                  <p className="font-bold text-slate-400 uppercase text-[8px]">WALLET REFUND</p>
                                  <p className="font-black text-slate-800">
                                    {dynamicFare < ticket.totalFare ? `Rs. ${(ticket.totalFare - dynamicFare).toFixed(2)}` : 'N/A'}
                                  </p>
                               </div>
                          </div>

                          {/* Category Adjustment Selector */}
                          <div className="pt-2">
                               <p className="text-[8px] font-black text-slate-400 uppercase mb-2 text-center tracking-widest">ACTUAL BOARDING SERVICE</p>
                               <Select value={actualBusType} onValueChange={setActualBusType}>
                                  <SelectTrigger className="bg-slate-50 border-none h-10 font-black uppercase text-[10px] tracking-widest rounded-lg">
                                      <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                      <SelectItem value="ordinary" className="font-bold text-xs uppercase">CITY ORDINARY</SelectItem>
                                      <SelectItem value="express" className="font-bold text-xs uppercase">METRO EXPRESS</SelectItem>
                                      <SelectItem value="deluxe" className="font-bold text-xs uppercase">METRO DELUXE</SelectItem>
                                  </SelectContent>
                               </Select>
                          </div>

                          {/* PIN Section */}
                          <div className="bg-[#F0FDF4] p-4 rounded-xl border border-[#DCFCE7] flex flex-col items-center">
                              <p className="text-[8px] font-black text-[#00B893] uppercase tracking-[0.2em] mb-2">SECURITY PIN</p>
                              <div className="flex flex-col items-center gap-2">
                                  {showPin ? (
                                      <p className="text-3xl font-mono font-black text-[#0A2B70] tracking-[0.2em]">
                                          {ticket.securityCode}
                                      </p>
                                  ) : (
                                      <div className="flex gap-2 py-2">
                                          {[1,2,3,4,5].map(i => <div key={i} className="w-2 h-2 rounded-full bg-[#00B893]/30"></div>)}
                                      </div>
                                  )}
                                  <button 
                                      className="text-[8px] font-black uppercase text-slate-400 hover:text-[#00B893] transition-colors" 
                                      onClick={() => setShowPin(!showPin)}
                                  >
                                      {showPin ? 'Hide PIN' : 'Reveal PIN'}
                                  </button>
                              </div>
                          </div>
                      </CardContent>

                      <CardFooter className="p-0 flex flex-col mt-4">
                          <div className="w-full bg-[#0F172A] py-3 flex flex-col items-center gap-0.5">
                              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">PASSENGER TICKET ID</p>
                              <p className="text-sm font-black text-white tracking-[0.15em]">{ticket.ticketCode}</p>
                          </div>
                          <Button 
                              onClick={handleValidate} 
                              className="w-full h-16 bg-[#00B893] hover:bg-[#009e7c] text-lg font-black uppercase tracking-[0.1em] rounded-none shadow-2xl" 
                              disabled={isLoading}
                          >
                              {isLoading ? <Loader2 className="animate-spin mr-3 h-5 w-5" /> : <CheckCircle className="mr-3 h-5 w-5" />}
                              VALIDATE BOARDING
                          </Button>
                      </CardFooter>
                  </Card>
              )}
            </div>
          )}
        </main>

        {/* Searchable Route Selector Dialog */}
        <Dialog open={isRouteSelectorOpen} onOpenChange={setRouteSelectorOpen}>
            <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden border-none">
                <DialogHeader className="bg-[#00B893] text-white p-6">
                    <DialogTitle className="font-headline uppercase tracking-tight text-xl">Select Bus Route</DialogTitle>
                    <DialogDescription className="text-emerald-50">Search for a route number or location name.</DialogDescription>
                </DialogHeader>
                <Command className="rounded-none">
                    <CommandInput 
                        placeholder="Search routes (e.g. 01 or Mehdipatnam)..." 
                        onValueChange={setSearchQuery} 
                        className="h-14 font-medium"
                    />
                    <CommandList className="max-h-[300px]">
                        <CommandEmpty>No routes found.</CommandEmpty>
                        <CommandGroup>
                            {filteredRoutes.map((route) => (
                                <CommandItem
                                    key={route.routeNo}
                                    onSelect={() => {
                                        setRouteNo(route.routeNo);
                                        setRouteSelectorOpen(false);
                                        setSearchQuery('');
                                    }}
                                    className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50 border-b border-slate-50 last:border-none"
                                >
                                    <div className="w-10 h-10 bg-[#0A2B70] text-white rounded-lg flex items-center justify-center font-bold">
                                        {route.routeNo}
                                    </div>
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
