'use client';
export const dynamic = 'force-dynamic'; 

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRightLeft, BusFront, Baby, Ticket, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { hyderabadLocalities } from '@/lib/locations';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { calculateFare } from '@/lib/fare-calculator';
import { SimulatedPayment } from '@/components/simulated-payment';
import { API_ENDPOINTS } from '@/lib/api-config';

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
    { type: 'Men', icon: <ManIcon className="h-6 w-6" /> },
    { type: 'Child', icon: <Baby className="h-6 w-6" /> },
    { type: 'Women', icon: <WomanIcon className="h-6 w-6" /> },
];

export function BookingForm() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [quantities, setQuantities] = useState({ Men: 0, Child: 0, Women: 0 });
  const [securityCode, setSecurityCode] = useState('');
  const [totalFare, setTotalFare] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  useEffect(() => {
    const busType = (searchParams.get('type') as any) || 'City Ordinary';
    const newFare = calculateFare(from, to, quantities, busType);
    setTotalFare(newFare);
  }, [from, to, quantities, searchParams]);

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

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value; 
    if (val.length <= 5) {
      setSecurityCode(val);
    }
  };

  const initiateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!from || !to) {
      toast({ variant: 'destructive', title: 'Missing Information', description: 'Please select both locations.' });
      return;
    }
    if (from === to) {
      toast({ 
        variant: 'destructive', 
        title: 'Attention', 
        description: 'Source and Destination cannot be the same.' 
      });
      return;
    }
    const totalPassengers = Object.values(quantities).reduce((sum, q) => sum + q, 0);
    if (totalPassengers === 0) {
        toast({ variant: 'destructive', title: 'No Passengers', description: 'Please add at least one passenger.' });
        return;
    }
    if (!securityCode || securityCode.length !== 5) {
      toast({ variant: 'destructive', title: 'Invalid Security Code', description: 'Please enter exactly 5 characters.' });
      return;
    }

    setShowPayment(true);
  };

  const finalizeBooking = async (paymentData?: { walletUsed: number, digitalPaid: number }) => {
    setIsLoading(true);
    try {
      const busType = searchParams.get('type') || 'City Ordinary';
      const routeNo = hyderabadLocalities.find(l => l.name === from)?.routeNumber || "00";
      const currentUserId = localStorage.getItem('currentUser') || 'GUEST';
      
      const passengerSummary = Object.entries(quantities)
        .filter(([, count]) => count > 0)
        .map(([type, count]) => `${type}: ${count}`)
        .join(', ');

      const walletAmountUsed = paymentData?.walletUsed || 0;

      const bookingData = {
        from,
        to,
        routeNo,
        passengers: passengerSummary,
        quantities,
        totalFare,
        fare: paymentData?.digitalPaid ?? totalFare,
        walletAmountUsed,
        securityCode,
        busType,
        bookedBy: currentUserId
      };

      const response = await fetch(API_ENDPOINTS.CREATE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.details || errData.error || "Server failed to process booking.");
      }
      
      const result = await response.json();
      const ticket = result.ticket;

      // Log Wallet Deductions
      if (walletAmountUsed > 0) {
          await fetch('/api/user', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  phone: currentUserId,
                  amount: walletAmountUsed,
                  type: 'debit',
                  description: `Wallet Payment: Ticket ${ticket.ticketCode}`
              })
          });
      }

      // Log Digital Pay record (History Only, No Deduction)
      if (paymentData && paymentData.digitalPaid > 0) {
          await fetch('/api/user', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  phone: currentUserId,
                  amount: paymentData.digitalPaid,
                  type: 'digital',
                  description: `Digital Pay: Ticket ${ticket.ticketCode}`
              })
          });
      }

      router.push(`/ticket/${ticket.ticketCode}`);
    } catch (error: any) {
      toast({ 
        variant: 'destructive', 
        title: 'Booking Failed', 
        description: error.message 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="w-full max-w-md shadow-2xl rounded-3xl overflow-hidden border-none">
        <CardHeader className="bg-primary text-primary-foreground text-center p-8">
          <div className="flex flex-col items-center gap-2">
              <BusFront className="h-10 w-10" />
              <CardTitle className="font-headline text-2xl uppercase tracking-widest">Generate Ticket</CardTitle>
          </div>
        </CardHeader>
        <form onSubmit={initiateBooking}>
          <CardContent className="space-y-6 pt-8 px-6">
            <div className="flex items-center gap-2">
              <div className="flex-1 space-y-1">
                <Label className="text-[10px] uppercase font-black text-slate-600">From</Label>
                <Select value={from} onValueChange={setFrom} required>
                  <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="From" /></SelectTrigger>
                  <SelectContent>
                    {hyderabadLocalities.map((loc) => (
                      <SelectItem key={loc.name} value={loc.name}>{loc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="button" variant="ghost" size="icon" className="mt-5 rounded-full" onClick={handleSwap}>
                <ArrowRightLeft className="h-4 w-4" />
              </Button>
              <div className="flex-1 space-y-1">
                <Label className="text-[10px] uppercase font-black text-slate-600">To</Label>
                <Select value={to} onValueChange={setTo} required>
                  <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="To" /></SelectTrigger>
                  <SelectContent>
                    {hyderabadLocalities.map((loc) => (
                       <SelectItem key={loc.name} value={loc.name}>{loc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
                <Label className="text-[10px] uppercase font-black text-slate-600">Passengers</Label>
                {passengerMeta.map(({ type, icon }) => (
                  <div key={type} className="flex items-center justify-between rounded-2xl border p-4 bg-slate-50/50">
                    <div className="flex items-center gap-3 text-slate-700">{icon}<span className="text-sm font-bold">{type}</span></div>
                    <div className="flex items-center gap-4">
                      <Button type="button" variant="outline" size="icon" className="h-8 w-8 rounded-full border-2" onClick={() => handleQuantityChange(type, -1)}>-</Button>
                      <span className="font-black text-lg w-4 text-center">{quantities[type]}</span>
                      <Button type="button" variant="outline" size="icon" className="h-8 w-8 rounded-full border-2" onClick={() => handleQuantityChange(type, 1)}>+</Button>
                    </div>
                  </div>
                ))}
            </div>

            <div>
              <Label className="text-[10px] uppercase font-black text-slate-600">Security Code (5 characters)</Label>
              <Input
                placeholder="A B C 1 2"
                type="text"
                value={securityCode}
                onChange={handlePinChange}
                maxLength={5}
                required
                className="h-14 rounded-xl text-lg font-mono tracking-[0.5em] text-center"
              />
            </div>

             <div className="flex justify-between items-center rounded-2xl bg-slate-900 text-white p-5 shadow-inner">
                <span className="font-bold opacity-60">Total Fare:</span>
                <span className="text-3xl font-black">Rs. {totalFare}</span>
              </div>
          </CardContent>
          <CardFooter className="p-6">
            <Button type="submit" className="w-full h-14 text-lg font-bold rounded-2xl" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <><Ticket className="mr-2 h-5 w-5" /> Select Payment</>}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <SimulatedPayment 
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        onComplete={(data) => finalizeBooking(data)}
        amount={totalFare}
      />
    </>
  );
}
