'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tag, History, ArrowDown, ArrowUp, CreditCard, Loader2 } from 'lucide-react';
import Header from '@/app/components/header';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { SimulatedPayment } from '@/components/simulated-payment';

export const dynamic = "force-dynamic";

type Transaction = {
  type: 'credit' | 'debit';
  description: string;
  amount: number;
  date: string;
};

type WalletData = {
  walletBalance: number;
  transactions: Transaction[];
};

export default function WalletPage() {
  const [wallet, setWallet] = useState<WalletData>({ walletBalance: 0, transactions: [] });
  const [loading, setLoading] = useState(true);
  const [addAmount, setAddAmount] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [phone, setPhone] = useState('');
  const { toast } = useToast();

  const fetchWallet = async (userPhone: string) => {
    try {
      const response = await fetch(`/api/user?phone=${userPhone}`);
      if (!response.ok) throw new Error("Failed to fetch wallet");
      const data = await response.json();
      setWallet({
        walletBalance: data.walletBalance,
        transactions: (data.transactions || []).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not load your wallet history.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setPhone(user);
      fetchWallet(user);
    }
  }, []);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length <= 4) setAddAmount(val);
  };

  const finalizeAddMoney = async () => {
    const amount = parseFloat(addAmount);
    try {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          amount,
          type: 'credit',
          description: 'Added via Online Payment'
        })
      });

      if (!response.ok) throw new Error("Database update failed");
      
      const result = await response.json();
      setWallet(prev => ({
        ...prev,
        walletBalance: result.walletBalance
      }));
      fetchWallet(phone); // Refresh transactions
      setAddAmount('');
      toast({ title: 'Success!', description: `Rs. ${amount} added to your wallet.` });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update balance.' });
    }
  };

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin h-10 w-10 text-primary mx-auto" /></div>;

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
              <CardDescription className="text-white/80">Real-time Wallet Balance</CardDescription>
            </CardHeader>
            <CardContent className="p-8 bg-slate-900 text-white">
              <p className="text-5xl font-black">Rs. {wallet.walletBalance.toFixed(2)}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-4">Wallet ID: {phone}</p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-lg border-slate-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <CreditCard className="h-6 w-6 text-primary" />
                Add Funds
              </CardTitle>
              <CardDescription>Securely recharge your wallet balance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="add-amount" className="text-[10px] font-black uppercase text-slate-500">Amount (Rs.)</Label>
                <Input
                  id="add-amount"
                  type="tel"
                  placeholder="Min: 50"
                  value={addAmount}
                  onChange={handleAmountChange}
                  className="h-14 rounded-xl text-lg font-bold px-5"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button className='w-full h-14 rounded-2xl text-lg font-bold' onClick={() => setShowPayment(true)}>Add Money Now</Button>
            </CardFooter>
          </Card>
          
          <div className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1">
                  <History className="h-4 w-4" /> Wallet History
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
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">{new Date(tx.date).toLocaleDateString()}</p>
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
                   <p className="font-medium">No wallet transactions found.</p>
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
