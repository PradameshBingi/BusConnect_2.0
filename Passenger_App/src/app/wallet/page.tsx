'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tag, Gift, History, ArrowDown, ArrowUp, CreditCard } from 'lucide-react';
import Header from '@/app/components/header';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { SimulatedPayment } from '@/components/simulated-payment';

export const dynamic = "force-dynamic";

type Refund = {
  code: string;
  amount: number;
  status: 'unclaimed' | 'claimed';
  ticketCode: string;
};

type Transaction = {
  type: 'credit' | 'debit';
  description: string;
  amount: number;
  date: string;
};

type Wallet = {
  balance: number;
  refunds: Refund[];
  transactions: Transaction[];
};

type Ticket = {
  ticketCode: string;
  securityCode: string;
};

export default function WalletPage() {
  const [wallet, setWallet] = useState<Wallet>({ balance: 0, refunds: [], transactions: [] });
  const [refundCode, setRefundCode] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [addAmount, setAddAmount] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    try {
      const storedWallet = localStorage.getItem('userWallet');
      if (storedWallet) {
        const parsedWallet = JSON.parse(storedWallet);
        setWallet({
          ...parsedWallet,
          transactions: (parsedWallet.transactions || []).sort((a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime())
        });
      }
    } catch (error) {
      console.error("Failed to load wallet from localStorage", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not load your wallet data.' });
    }
  }, [toast]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setAddAmount(val);
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    if (val.length <= 5) {
      setSecurityCode(val);
    }
  };

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundCode || !securityCode) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please enter both refund and security codes.' });
      return;
    }
    
    let walletData: Wallet = { balance: 0, refunds: [], transactions: [] };
    try {
      const storedWalletJSON = localStorage.getItem('userWallet');
      if (storedWalletJSON) walletData = JSON.parse(storedWalletJSON);

      const allTickets: Ticket[] = JSON.parse(localStorage.getItem('generatedTickets') || '[]');

      const refundIndex = walletData.refunds.findIndex(r => r.code === refundCode && r.status === 'unclaimed');

      if (refundIndex === -1) {
        toast({ variant: 'destructive', title: 'Invalid Code', description: 'This refund code is either invalid or has already been claimed.' });
        return;
      }
      
      const refundToClaim = walletData.refunds[refundIndex];
      const originalTicket = allTickets.find(t => t.ticketCode === refundToClaim.ticketCode);

      if (!originalTicket) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not find the original ticket for this refund.' });
        return;
      }
      
      if(originalTicket.securityCode !== securityCode.toUpperCase()) {
        toast({ variant: 'destructive', title: 'Security Mismatch', description: 'The passenger security code is incorrect for this refund.' });
        return;
      }

      const refundAmount = refundToClaim.amount;
      walletData.balance += refundAmount;
      walletData.refunds[refundIndex].status = 'claimed';
      
      walletData.transactions = walletData.transactions || [];
      walletData.transactions.push({
          type: 'credit',
          description: `Redeemed code ${refundCode}`,
          amount: refundAmount,
          date: new Date().toISOString(),
      });
      
      localStorage.setItem('userWallet', JSON.stringify(walletData));
      setWallet({ 
        ...walletData,
        transactions: walletData.transactions.sort((a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime())
      });
      setRefundCode('');
      setSecurityCode('');

      toast({
        title: 'Success!',
        description: `Rs. ${refundAmount.toFixed(2)} has been added to your wallet.`,
      });

    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Error', description: 'An error occurred while redeeming the code.' });
    }
  };

  const initiateAddMoney = () => {
    const amount = parseFloat(addAmount);
    if(isNaN(amount)) {
        toast({variant: 'destructive', title: 'Invalid Amount', description: 'Please enter a valid amount.'});
        return;
    }

    if (amount < 50) {
      toast({
          variant: 'destructive',
          title: 'Minimum Amount',
          description: 'The minimum amount to add is Rs. 50.',
      });
      return;
    }

    if (amount > 2000) {
      toast({
          variant: 'destructive',
          title: 'Limit Exceeded',
          description: 'You can only add up to Rs. 2000 at a time.',
      });
      return;
    }

    if (wallet.balance + amount > 5000) {
      toast({
          variant: 'destructive',
          title: 'Wallet Limit Reached',
          description: 'Your total wallet balance cannot exceed Rs. 5000.',
      });
      return;
    }
    
    setShowPayment(true);
  };

  const finalizeAddMoney = () => {
    const amount = parseFloat(addAmount);
    try {
        let walletData: Wallet = JSON.parse(localStorage.getItem('userWallet') || '{"balance":0, "refunds":[], "transactions":[]}');
        
        walletData.balance += amount;
        walletData.transactions = walletData.transactions || [];
        walletData.transactions.push({
            type: 'credit',
            description: `Added via Online Payment`,
            amount: amount,
            date: new Date().toISOString(),
        });
        
        localStorage.setItem('userWallet', JSON.stringify(walletData));
        setWallet({
            ...walletData,
            transactions: walletData.transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        });
        setAddAmount('');
        
        toast({
            title: 'Success!',
            description: `Rs. ${amount.toFixed(2)} has been added to your wallet.`,
        });
    } catch (error) {
        console.error("Failed to add money to wallet", error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not add money to your wallet.',
        });
    }
  };

  if (!isClient) return null;

  return (
    <>
      <Header showBackButton={true} backHref="/" title="My Wallet" />
      <div className="p-4 md:p-8 pb-32">
        <div className="max-w-md mx-auto space-y-8">
          <Card className="rounded-3xl shadow-xl border-none overflow-hidden">
            <CardHeader className="bg-primary text-white p-8">
              <CardTitle className="flex items-center gap-3 text-2xl font-black uppercase tracking-tight">
                <Tag className="h-7 w-7" />
                Current Balance
              </CardTitle>
              <CardDescription className="text-white/80">Available for tickets and upgrades.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 bg-slate-900 text-white">
              <p className="text-5xl font-black">Rs. {wallet.balance.toFixed(2)}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-4">Wallet Limit: Rs. 5000.00</p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-lg border-slate-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <CreditCard className="h-6 w-6 text-primary" />
                Add Funds
              </CardTitle>
              <CardDescription>
                Recharge your wallet via Digital Payment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="add-amount" className="text-[10px] font-black uppercase text-slate-500">Amount (Rs.)</Label>
                  <Input
                    id="add-amount"
                    type="tel"
                    placeholder="Min: 50, Max: 2000"
                    value={addAmount}
                    onChange={handleAmountChange}
                    className="h-14 rounded-xl text-lg font-bold px-5"
                    maxLength={4}
                  />
                  <div className="grid grid-cols-3 gap-2 mt-4">
                     {[100, 200, 500].map(amt => (
                       <Button key={amt} variant="outline" className="rounded-xl font-bold h-11" onClick={() => setAddAmount(amt.toString())}>+ Rs.{amt}</Button>
                     ))}
                  </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button className='w-full h-14 rounded-2xl text-lg font-bold' onClick={initiateAddMoney}>Add Money Now</Button>
            </CardFooter>
          </Card>

          <Card className="rounded-3xl shadow-lg border-slate-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <Gift className="h-6 w-6 text-primary" />
                Redeem Refund Code
              </CardTitle>
              <CardDescription>
                Convert conductor-issued codes into wallet balance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRedeem} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="refund-code" className="text-[10px] font-black uppercase text-slate-500">Refund Code</Label>
                  <Input
                    id="refund-code"
                    placeholder="REF-XXXXX"
                    value={refundCode}
                    onChange={e => setRefundCode(e.target.value.toUpperCase())}
                    className="uppercase h-14 rounded-xl font-mono tracking-widest"
                  />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="security-code" className="text-[10px] font-black uppercase text-slate-500">Security PIN</Label>
                  <Input
                    id="security-code"
                    placeholder="Original 5-digit PIN"
                    value={securityCode}
                    onChange={handlePinChange}
                    className="uppercase h-14 rounded-xl font-mono tracking-[0.5em] text-center"
                    maxLength={5}
                  />
                </div>
                <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-bold">Redeem Balance</Button>
              </form>
            </CardContent>
          </Card>
          
          <div className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1">
                  <History className="h-4 w-4" /> Transaction History
              </h3>
              {wallet.transactions.length > 0 ? (
                <div className="space-y-3">
                {wallet.transactions.map((tx, index) => (
                    <Card key={index} className="border-none shadow-sm rounded-2xl overflow-hidden">
                        <CardContent className="p-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className={cn("p-2 rounded-xl", tx.type === 'credit' ? "bg-green-50" : "bg-red-50")}>
                                    {tx.type === 'credit' ? <ArrowDown className="h-5 w-5 text-green-600"/> : <ArrowUp className="h-5 w-5 text-red-600"/>}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800 text-sm">{tx.description}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">{new Date(tx.date).toLocaleDateString()} at {new Date(tx.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={cn("font-black text-base", tx.type === 'credit' ? "text-green-600" : "text-red-600")}>
                                {tx.type === 'credit' ? '+' : '-'} Rs. {Math.round(tx.amount)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                </div>
              ) : (
                <Card className="border-dashed border-2 p-12 text-center text-muted-foreground rounded-3xl">
                   <p className="font-medium">No transactions found.</p>
                </Card>
              )}
          </div>
        </div>
      </div>

      <SimulatedPayment 
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        onComplete={finalizeAddMoney}
        amount={parseFloat(addAmount) || 0}
      />
    </>
  );
}
