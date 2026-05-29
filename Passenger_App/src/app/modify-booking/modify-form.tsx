'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRightLeft, BusFront, Baby, PlusCircle, MinusCircle, CheckCircle, Wallet, Loader2, Save, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { hyderabadLocalities } from '@/lib/locations';
import { Label } from '@/components/ui/label';
import { calculateFare } from '@/lib/fare-calculator';
import { SimulatedPayment } from '@/components/simulated-payment';
import { API_ENDPOINTS } from '@/lib/api-config';
import { Separator } from '@/components/ui/separator';

type PassengerType = 'Men' | 'Child' | 'Women';

const ManIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="7" r="4" />
        <path d="M12 11v10" />
    </svg>
);

const WomanIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="7" r="4" />
        <path d="M12 11v4" />
        <path d="M8 15l-2 5h12l-2-5" />
        <path d="M6 15h12" />
    </svg>
);

const passengerMeta: { type: PassengerType; icon: React.ReactNode }[] = [
    { type: 'Men', icon: <ManIcon className="h-5 w-5" /> },
    { type: 'Child', icon: <Baby className="h-5 w-5" /> },
    { type: 'Women', icon: <WomanIcon className="h-5 w-5" /> },
];

export function ModifyForm({ ticket, onReset }: { ticket: any, onReset: () => void }) {
  const [from, setFrom] = useState(ticket.from);
  const [to, setTo] = useState(ticket.to);
  const [quantities, setQuantities] = useState({ ...ticket.quantities });
  const [isLoading, setIsLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const newTotalFare = useMemo(() => {
    // If nothing changed, return the original fare exactly to avoid rounding discrepancies
    const hasChanged = from !== ticket.from || 
                       to !== ticket.to || 
                       quantities.Men !== ticket.quantities.Men || 
                       quantities.Child !== ticket.quantities.Child || 
                       quantities.Women !== ticket.quantities.Women;
    
    if (!hasChanged) return ticket.totalFare;
    return calculateFare(from, to, quantities, ticket.busType);
  }, [from, to, quantities, ticket.busType, ticket]);

  const fareDifference = Math.round(newTotalFare - ticket.totalFare);
  const isAddition = fareDifference > 0;
  const isRefund = fareDifference < 0;

  const refundWithFee = useMemo(() => {
    if (!isRefund) return 0;
    const absoluteDiff = Math.abs(fareDifference);
    const fee = Math.round(absoluteDiff * 0.10);
    return absoluteDiff - fee;
  }, [fareDifference, isRefund]);

  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const handleQuantityChange = (type: PassengerType, delta: number) => {
    setQuantities(prev => {
      const newQuantities = { ...prev };
      const currentQuantity = newQuantities[type];
      const newQuantity = currentQuantity + delta;
      if (newQuantity < 0) return prev;
      newQuantities[type] = newQuantity;
      return newQuantities;
    });
  };

  const initiateUpdate = () => {
    if (from === to) {
        toast({ variant: 'destructive', title: 'Invalid Route', description: 'Start and Destination must differ.' });
        return;
    }
    const totalPassengers = Object.values(quantities).reduce((sum, q) => sum + (q as number), 0);
    if (totalPassengers === 0) {
        toast({ variant: 'destructive', title: 'No Passengers', description: 'Please keep at least one passenger.' });
        return;
    }

    if (isAddition) {
        setShowPayment(true);
    } else {
        finalizeUpdate();
    }
  };

  const finalizeUpdate = async () => {
    setIsLoading(true);
    try {
      const passengerSummary = Object.entries(quantities)
        .filter(([, count]) => (count as number) > 0)
        .map(([type, count]) => `${type}: ${count}`)
        .join(', ');

      const response = await fetch(`${API_ENDPOINTS.USE}/${ticket.ticketCode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from,
          to,
          passengers: passengerSummary,
          quantities,
          totalFare: newTotalFare,
          fare: isAddition ? (ticket.fare + fareDifference) : ticket.fare
        })
      });

      if (!response.ok) throw new Error("Update failed.");
      const result = await response.json();
      const updatedTicket = result.ticket;

      if (isRefund && refundWithFee > 0) {
          const walletData = JSON.parse(localStorage.getItem('userWallet') || '{"balance":0, "transactions": []}');
          walletData.balance += refundWithFee;
          walletData.transactions.push({
              type: 'credit',
              description: `Modification Refund for ${ticket.ticketCode}`,
              amount: refundWithFee,
              date: new Date().toISOString(),
          });
          localStorage.setItem('userWallet', JSON.stringify(walletData));
      }

      const storedTickets = JSON.parse(localStorage.getItem('generatedTickets') || '[]');
      const idx = storedTickets.findIndex((t: any) => t.ticketCode === ticket.ticketCode);
      if (idx > -1) {
          storedTickets[idx] = updatedTicket;
          localStorage.setItem('generatedTickets', JSON.stringify(storedTickets));
      }

      toast({ 
          title: "Booking Modified", 
          description: isRefund ? `Rs. ${Math.round(refundWithFee)} credited to wallet.` : "Details updated successfully." 
      });
      router.push(`/ticket/${ticket.ticketCode}`);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="w-full max-w-md border-none shadow-2xl rounded-3xl overflow-hidden">
        <CardHeader className="bg-primary text-white p-6">
          <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
             <Edit3 className="h-6 w-6 text-white" /> Modify Journey
          </CardTitle>
          <CardDescription className="text-purple-100">Ticket: {ticket.ticketCode}</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-2">
            <div className="flex-1 space-y-1">
              <Label className="text-[10px] font-black text-slate-400 uppercase">From</Label>
              <Select value={from} onValueChange={setFrom}>
                <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {hyderabadLocalities.map((loc) => <SelectItem key={loc.name} value={loc.name}>{loc.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button variant="ghost" size="icon" className="mt-5 rounded-full" onClick={handleSwap}>
              <ArrowRightLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1 space-y-1">
              <Label className="text-[10px] font-black text-slate-400 uppercase">To</Label>
              <Select value={to} onValueChange={setTo}>
                <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {hyderabadLocalities.map((loc) => <SelectItem key={loc.name} value={loc.name}>{loc.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] font-black text-slate-400 uppercase">Passengers</Label>
            {passengerMeta.map(({ type, icon }) => (
              <div key={type} className="flex items-center justify-between rounded-2xl border p-4 bg-slate-50/50">
                <div className="flex items-center gap-3 text-slate-700">{icon}<span className="text-sm font-bold">{type}</span></div>
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-2" onClick={() => handleQuantityChange(type, -1)}><MinusCircle className="h-4 w-4" /></Button>
                  <span className="font-black text-lg w-4 text-center">{quantities[type]}</span>
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-2" onClick={() => handleQuantityChange(type, 1)}><PlusCircle className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>

          <Separator className="bg-slate-100" />

          <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2 shadow-inner">
             <div className="flex justify-between text-xs opacity-60"><span>Original Total:</span> <span>Rs. {Math.round(ticket.totalFare)}</span></div>
             <div className="flex justify-between font-bold text-lg">
                <span>New Total:</span> 
                <span>Rs. {Math.round(newTotalFare)}</span>
             </div>
             {isRefund && (
               <div className="pt-2 border-t border-white/10 mt-2">
                 <div className="flex justify-between text-green-400 font-bold">
                    <span>Refund to Wallet:</span>
                    <span>+ Rs. {Math.round(refundWithFee)}</span>
                 </div>
                 <p className="text-[9px] opacity-40 italic mt-1 text-center">After 10% processing fee per person removed.</p>
               </div>
             )}
             {isAddition && (
               <div className="pt-2 border-t border-white/10 mt-2">
                 <div className="flex justify-between text-orange-400 font-bold">
                    <span>Additional Payable:</span>
                    <span>Rs. {Math.round(fareDifference)}</span>
                 </div>
               </div>
             )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 px-6 pb-6">
           <Button 
             variant="ghost"
             className="w-full h-14 text-slate-500 hover:bg-slate-100 text-lg font-bold" 
             onClick={initiateUpdate} 
             disabled={isLoading}
           >
              {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-5 w-5" />}
              Save Modifications
           </Button>
           <Button variant="ghost" className="w-full h-12 text-slate-500 font-bold hover:bg-slate-100" onClick={onReset}>Cancel Changes</Button>
        </CardFooter>
      </Card>

      {isAddition && (
        <SimulatedPayment 
           isOpen={showPayment}
           onClose={() => setShowPayment(false)}
           onComplete={finalizeUpdate}
           amount={fareDifference}
        />
      )}
    </>
  );
}
