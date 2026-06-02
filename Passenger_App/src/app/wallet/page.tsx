'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tag, History, ArrowDown, ArrowUp, CreditCard, Loader2, ShieldCheck, SwitchCamera } from 'lucide-react';
import Header from '@/app/components/header';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { SimulatedPayment } from '@/components/simulated-payment';
import { Switch } from '@/components/ui/switch';

export const dynamic = "force-dynamic";

type Transaction = {
  type: 'credit' | 'debit';
  description: string;
  amount: number;
  date: string;
};

type WalletData = {
  walletBalance: number;
  autoDeductEnabled: boolean;
  transactions: Transaction[];
};

export default function WalletPage() {
  const [wallet, setWallet] = useState<WalletData>({ walletBalance: 0, autoDeductEnabled: false, transactions: [] });
  const [loading, setLoading] = useState(true);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
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
        walletBalance: data.walletBalance || 0,
        autoDeductEnabled: data.autoDeductEnabled || false,
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

  const handleToggleAutoDeduct = async (checked: boolean) => {
    setIsUpdatingSettings(true);
    try {
      const response = await fetch('/api/user/wallet-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, autoDeductEnabled: checked })
      });

      if (!response.ok) throw new Error("Failed to update settings");
      
      setWallet(prev => ({ ...prev, autoDeductEnabled: checked }));
      toast({ 
        title: checked ? "Authorization Enabled" : "Authorization Disabled", 
        description: checked 
          ? "Conductors can now deduct fare differences for upgrades." 
          : "Conductors will ask for cash for fare differences." 
      });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Settings Error', description: 'Failed to update authorization preference.' });
    } finally {
      setIsUpdatingSettings(false);
    }
  };

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
        <div className="max-w-md mx-auto space-y-6">
          <Card className="rounded-[2.5rem] shadow-2xl border-none overflow-hidden bg-slate-900 text-white">
            <CardHeader className="bg-primary p-8 pb-10">
              <CardTitle className="flex items-center gap-3 text-2xl font-black uppercase tracking-tight">
                <Tag className="h-7 w-7" />
                Current Balance
              </CardTitle>
              <CardDescription className="text-white/80">Real-time Cloud Wallet</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 -mt-6">
              <div className="bg-slate-900 rounded-3xl p-6 shadow-inner border border-white/5">
                <p className="text-5xl font-black tracking-tighter">Rs. {wallet.walletBalance.toFixed(2)}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-4">Wallet ID: {phone}</p>
                
                {/* Auto Deduct Authorization Section */}
                <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-white flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        Auto Deduct Authorization
                      </p>
                      <p className="text-[9px] text-slate-400 uppercase tracking-wider">For Conductor Upgrades</p>
                    </div>
                    <Switch 
                      checked={wallet.autoDeductEnabled} 
                      onCheckedChange={handleToggleAutoDeduct}
                      disabled={isUpdatingSettings}
                    />
                  </div>
                  <p className="text-[10px] leading-relaxed text-slate-500 italic">
                    * Enabling this allows conductors to deduct fare differences directly from your wallet if you board a higher category bus.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-lg border-slate-100 overflow-hidden bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <CreditCard className="h-6 w-6 text-primary" />
                Add Funds
              </CardTitle>
              <CardDescription>Securely recharge your balance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="add-amount" className="text-[10px] font-black uppercase text-slate-500 ml-1">Amount (Rs.)</Label>
                <div className="relative">
                   <Input
                    id="add-amount"
                    type="tel"
                    placeholder="Min: 50"
                    value={addAmount}
                    onChange={handleAmountChange}
                    className="h-16 rounded-2xl text-2xl font-black px-6 bg-slate-50 border-none shadow-inner"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 font-bold">INR</div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pb-8 px-6">
              <Button className='w-full h-14 rounded-2xl text-lg font-bold shadow-lg bg-[#0A2B70]' onClick={() => setShowPayment(true)}>
                Recharge Wallet
              </Button>
            </CardFooter>
          </Card>
          
          <div className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1">
                  <History className="h-4 w-4" /> Transaction History
              </h3>
              {wallet.transactions.length > 0 ? (
                <div className="space-y-3">
                {wallet.transactions.map((tx, index) => (
                    <Card key={index} className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
                        <CardContent className="p-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className={cn("p-2 rounded-xl", tx.type === 'credit' ? "bg-green-50" : "bg-red-50")}>
                                    {tx.type === 'credit' ? <ArrowDown className="h-5 w-5 text-green-600"/> : <ArrowUp className="h-5 w-5 text-red-600"/>}
                                </div>
                                <div className="max-w-[180px]">
                                    <p className="font-bold text-slate-800 text-xs leading-snug">{tx.description}</p>
                                    <p className="text-[9px] text-muted-foreground uppercase font-bold mt-0.5">{new Date(tx.date).toLocaleDateString()} • {new Date(tx.date).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</p>
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <p className={cn("font-black text-base", tx.type === 'credit' ? "text-green-600" : "text-red-600")}>
                                {tx.type === 'credit' ? '+' : '-'} ₹{Math.round(tx.amount)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                </div>
              ) : (
                <Card className="border-dashed border-2 border-slate-200 p-12 text-center text-muted-foreground rounded-3xl bg-slate-50/50">
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
