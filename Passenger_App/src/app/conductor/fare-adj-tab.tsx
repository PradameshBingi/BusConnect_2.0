'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Loader2, Bus, ArrowUp, XCircle, CheckCircle, ArrowRight, ShieldCheck, Wallet } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { calculateFare } from '@/lib/fare-calculator';
import { API_ENDPOINTS } from '@/lib/api-config';
import { ValidatedTicket } from '@/app/components/validated-ticket';

type BusType = 'ordinary' | 'express' | 'deluxe';

export default function FareAdjTab() {
  const [ticketCode, setTicketCode] = useState('');
  const [actualBusType, setActualBusType] = useState<BusType | ''>('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'found' | 'validated' | 'not_found' | 'error'>('idle');
  const [ticketDetails, setTicketDetails] = useState<any | null>(null);
  const [passengerWallet, setPassengerWallet] = useState<any | null>(null);
  const [fareDifference, setFareDifference] = useState(0);
  const [calculatedTotal, setCalculatedTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFareCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketCode || !actualBusType) return;
    
    setStatus('loading');
    setTicketDetails(null);
    setPassengerWallet(null);

    try {
        const response = await fetch(`${API_ENDPOINTS.VERIFY}/${ticketCode.trim().toUpperCase()}`);
        if (response.status === 404) {
            setStatus('not_found');
            return;
        }
        const result = await response.json();
        const foundTicket = result.ticket;

        if (foundTicket.status === 'valid') {
            const actualFare = calculateFare(foundTicket.from, foundTicket.to, foundTicket.quantities, actualBusType as BusType);
            const currentTotalPaid = foundTicket.totalFare || (foundTicket.fare + (foundTicket.walletAmountUsed || 0));
            
            // Also fetch passenger wallet to check auto-deduct balance
            const walletRes = await fetch(`/api/user?phone=${foundTicket.bookedBy}`);
            if (walletRes.ok) {
                const walletData = await walletRes.json();
                setPassengerWallet(walletData);
            }

            setFareDifference(actualFare - currentTotalPaid);
            setCalculatedTotal(actualFare);
            setTicketDetails(foundTicket);
            setStatus('found');
        } else {
            toast({ variant: 'destructive', title: "Invalid Ticket", description: `This ticket is ${foundTicket.status.toUpperCase()}.` });
            setStatus('idle');
        }
    } catch (error) {
        setStatus('error');
    }
  };
  
  const handleValidation = async () => {
    if (!ticketDetails || !actualBusType) return;
    setIsLoading(true);

    const isAutoDeductPossible = passengerWallet?.autoDeductEnabled && passengerWallet.walletBalance >= fareDifference;
    
    try {
        // 1. Perform balance deduction if auto-deduct is active
        if (fareDifference > 0 && isAutoDeductPossible) {
             await fetch('/api/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: ticketDetails.bookedBy,
                    amount: fareDifference,
                    type: 'debit',
                    description: `Wallet Payment (Auto-Deduct): Ticket ${ticketDetails.ticketCode}`
                })
            });
        }

        // 2. Sync ticket status
        const response = await fetch(`${API_ENDPOINTS.USE}/${ticketDetails.ticketCode}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                busType: actualBusType,
                totalFare: calculatedTotal,
                fare: (ticketDetails.fare || 0) + (fareDifference > 0 ? fareDifference : 0)
            })
        });

        if (!response.ok) throw new Error("Validation failed");
        
        const result = await response.json();
        const updatedTicket = result.ticket;

        const vStats = JSON.parse(localStorage.getItem('conductorVerificationStats') || '[]');
        vStats.push({
            ticketCode: updatedTicket.ticketCode,
            verifiedAt: new Date().toISOString(),
            fareDifference: fareDifference,
            busType: actualBusType
        });
        localStorage.setItem('conductorVerificationStats', JSON.stringify(vStats));
        
        setTicketDetails(updatedTicket);
        setStatus('validated');
        toast({ title: "Adjusted & Validated", description: "Fare updated in database." });
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not sync adjustment.' });
    } finally {
        setIsLoading(false);
    }
  }

  const reset = () => {
    setTicketCode('');
    setActualBusType('');
    setStatus('idle');
    setTicketDetails(null);
    setPassengerWallet(null);
  }

  return (
    <div className="space-y-6">
        <Card className="border-none shadow-lg overflow-hidden rounded-3xl">
            <CardHeader className="bg-[#0A2B70] text-white p-6">
                <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                    <Bus className="h-6 w-6 text-[#FF80A0]" /> Fare Adjustment
                </CardTitle>
                <CardDescription className="text-blue-200">Inter-category boarding check</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
                <form onSubmit={handleFareCheck} className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400">Ticket Code</Label>
                        <Input 
                            placeholder="TKT-XX-XXXXX" 
                            value={ticketCode} 
                            onChange={e => setTicketCode(e.target.value)} 
                            className="uppercase font-mono h-14 rounded-xl"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400">Actual Boarding Bus</Label>
                        <Select value={actualBusType} onValueChange={(v) => setActualBusType(v as BusType)}>
                            <SelectTrigger className="h-14 rounded-xl">
                                <SelectValue placeholder="Select current bus type..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ordinary">City Ordinary</SelectItem>
                                <SelectItem value="express">Metro Express</SelectItem>
                                <SelectItem value="deluxe">Metro Deluxe</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button type="submit" className="w-full h-14 bg-[#0A2B70] hover:bg-[#08215c] rounded-xl font-black uppercase tracking-widest text-xs" disabled={status === 'loading'}>
                        {status === 'loading' ? <Loader2 className="animate-spin h-5 w-5" /> : 'Calculate Difference'}
                    </Button>
                </form>
            </CardContent>
        </Card>

        {status === 'found' && ticketDetails && (
            <Card className="border-none shadow-2xl rounded-3xl overflow-hidden animate-in slide-in-from-bottom-5">
                <CardHeader className="text-center bg-slate-50 py-10">
                    {fareDifference > 0 ? (
                        <div className="flex flex-col items-center">
                            <div className="bg-orange-100 p-4 rounded-full mb-4">
                                <ArrowUp className="h-10 w-10 text-orange-600" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 uppercase">Rs. {fareDifference.toFixed(2)}</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Upgrade Difference</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <div className="bg-emerald-100 p-4 rounded-full mb-4">
                                <CheckCircle className="h-10 w-10 text-emerald-600" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 uppercase">Valid Upgrade</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Fare difference applied to wallet</p>
                        </div>
                    )}
                </CardHeader>
                <CardContent className="p-8">
                     <div className="grid grid-cols-3 items-center gap-4 text-center mb-8">
                        <div className="space-y-1">
                             <p className="text-[10px] font-black text-slate-400 uppercase">Booked</p>
                             <p className="font-black text-blue-800 uppercase text-xs">{ticketDetails.busType}</p>
                        </div>
                        <ArrowRight className="mx-auto text-slate-300" />
                        <div className="space-y-1">
                             <p className="text-[10px] font-black text-slate-400 uppercase">Boarding</p>
                             <p className="font-black text-emerald-600 uppercase text-xs">{actualBusType}</p>
                        </div>
                     </div>

                     {fareDifference > 0 && (
                        <div className={cn(
                            "p-2.5 rounded-xl flex items-center justify-between border-2 animate-in slide-in-from-top-1 duration-300",
                            passengerWallet?.autoDeductEnabled && passengerWallet.walletBalance >= fareDifference 
                                ? "bg-orange-50 border-orange-100 text-orange-700" 
                                : "bg-red-50 border-red-100 text-red-700"
                        )}>
                            <div className="flex items-center gap-2 font-bold text-[10px] uppercase">
                                <ShieldCheck className="h-4 w-4 shrink-0" />
                                {passengerWallet?.autoDeductEnabled && passengerWallet.walletBalance >= fareDifference 
                                    ? "Auto-Deduct Wallet" 
                                    : "Manual Cash Collection"}
                            </div>
                            <div className="text-xs font-black">
                                {passengerWallet?.autoDeductEnabled && passengerWallet.walletBalance >= fareDifference 
                                    ? `₹${fareDifference.toFixed(2)} will be debited.` 
                                    : `₹${fareDifference.toFixed(2)} cash required (Low Balance).`}
                            </div>
                        </div>
                     )}
                </CardContent>
                <CardFooter className="p-0">
                    <Button onClick={handleValidation} className="w-full h-20 bg-[#0A2B70] hover:bg-[#08215c] font-black uppercase tracking-widest text-lg rounded-none" disabled={isLoading}>
                         {isLoading ? <Loader2 className="animate-spin mr-3 h-6 w-6" /> : <CheckCircle className="mr-3 h-6 w-6" />}
                         Validate Adjustment
                    </Button>
                </CardFooter>
            </Card>
        )}

        {status === 'validated' && ticketDetails && (
            <div className="animate-in fade-in duration-500">
                <ValidatedTicket ticket={{...ticketDetails, timestamp: ticketDetails.validatedAt || new Date().toISOString()}} />
                <Button variant="outline" className="w-full h-14 mt-6 bg-white rounded-2xl font-black uppercase tracking-widest text-xs text-slate-500" onClick={reset}>
                    Next Adjustment
                </Button>
            </div>
        )}
    </div>
  );
}
