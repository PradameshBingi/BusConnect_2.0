'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tag, History, ArrowDown, ArrowUp, CreditCard, Loader2, ShieldCheck } from 'lucide-react';
import Header from '@/app/components/header';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { SimulatedPayment } from '@/components/simulated-payment';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from '@/components/ui/scroll-area';
import { AuthGuard } from '@/components/auth-guard';

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
  const [isHydrated, setIsHydrated] = useState(false);
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
      toast({ variant: 'destructive', title: 'Error', description: 'Could not load history.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsHydrated(true);
    const user = localStorage.getItem('currentUser');
    if (user) {
      setPhone(user);
      fetchWallet(user);
    }
  }, []);

  const handleToggleAutoDeduct = async (checked: boolean) => {
    setIsUpdatingSettings(true);
    try {
      await fetch('/api/user/wallet-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, autoDeductEnabled: checked })
      });
      setWallet(prev => ({ ...prev, autoDeductEnabled: checked }));
      toast({ title: "Authorization Updated" });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Settings Error' });
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
          type: 'recharge', // Special type for Red UI + Balance Increment
          description: 'Digital Pay: Wallet Recharge'
        })
      });
      const result = await response.json();
      setWallet(prev => ({ ...prev, walletBalance: result.walletBalance }));
      fetchWallet(phone);
      setAddAmount('');
      toast({ title: 'Recharge Success' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error' });
    }
  };

  const TransactionList = ({ txs }: { txs: Transaction[] }) => {
    if (txs.length === 0) {
      return <div className="p-10 text-center text-muted-foreground bg-slate-50/50 rounded-2xl border border-dashed">No records in this category.</div>;
    }
    return (
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-3">
          {txs.map((tx, index) => (
            <Card key={index} className="border-none shadow-sm rounded-xl overflow-hidden bg-white">
              <CardContent className="p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", tx.type === 'credit' ? "bg-green-50" : "bg-red-50")}>
                    {tx.type === 'credit' ? <ArrowDown className="h-4 w-4 text-green-600"/> : <ArrowUp className="h-4 w-4 text-red-600"/>}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-[11px] leading-tight">{tx.description}</p>
                    <p className="text-[9px] text-muted-foreground font-bold mt-0.5" suppressHydrationWarning>
                      {isHydrated ? `${new Date(tx.date).toLocaleDateString('en-GB')} • ${new Date(tx.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}` : '...'}
                    </p>
                  </div>
                </div>
                <p className={cn("font-black text-xs shrink-0 ml-2", tx.type === 'credit' ? "text-green-600" : "text-red-600")}>
                  ₹{Math.round(tx.amount)}.00
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    );
  };

  const digitalHistory = wallet.transactions.filter(t => 
    t.description.toLowerCase().includes('digital pay') || 
    t.description.toLowerCase().includes('online payment')
  );
  const walletUsageHistory = wallet.transactions.filter(t => 
    t.description.toLowerCase().includes('wallet payment') || 
    (t.type === 'debit' && !t.description.toLowerCase().includes('digital pay') && !t.description.toLowerCase().includes('online payment'))
  );
  const refundHistory = wallet.transactions.filter(t => 
    t.description.toLowerCase().includes('refund') || 
    t.description.toLowerCase().includes('reimbursement') ||
    (t.type === 'credit' && t.description.toLowerCase().includes('conductor'))
  );

  return (
    <AuthGuard>
      <Header showBackButton={true} backHref="/" title="My Wallet" />
      <div className="p-4 md:p-8 pb-32 max-w-md mx-auto space-y-6">
          <Card className="rounded-[2.5rem] shadow-2xl border-none overflow-hidden bg-slate-900 text-white">
            <CardHeader className="bg-primary p-8 pb-10">
              <CardTitle className="flex items-center gap-3 text-2xl font-black uppercase tracking-tight">
                <Tag className="h-7 w-7" />
                Balance
              </CardTitle>
              <CardDescription className="text-white/80">Real-time Cloud Wallet</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 -mt-6">
              <div className="bg-slate-900 rounded-3xl p-6 border border-white/5">
                <p className="text-5xl font-black tracking-tighter" suppressHydrationWarning>Rs. {wallet.walletBalance.toFixed(2)}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-4">Wallet ID: {phone}</p>
                <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                    <div className="flex flex-col pr-4">
                        <p className="text-xs font-bold text-white flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-primary" /> Auto Deduct for Conductor Use
                        </p>
                        <p className="text-[9px] text-white/40 ml-6 mt-1 font-medium leading-relaxed italic">
                            Enables conductors to deduct fare differences directly from your wallet for inter-category upgrades during boarding.
                        </p>
                    </div>
                    <Switch checked={wallet.autoDeductEnabled} onCheckedChange={handleToggleAutoDeduct} disabled={isUpdatingSettings} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-lg bg-white overflow-hidden">
            <CardHeader className="pb-4"><CardTitle className="text-xl font-bold flex items-center gap-2"><CreditCard className="h-6 w-6 text-primary" /> Add Funds</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <Input type="tel" placeholder="Amount (Rs.)" value={addAmount} onChange={handleAmountChange} className="h-14 rounded-xl text-xl font-black bg-slate-50 border-none shadow-inner" suppressHydrationWarning />
                <Button className='w-full h-14 rounded-2xl text-lg font-bold bg-[#0A2B70]' onClick={() => setShowPayment(true)}>Recharge</Button>
            </CardContent>
          </Card>
          
          <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1"><History className="h-4 w-4" /> History</h3>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid grid-cols-4 w-full h-11 bg-slate-100 rounded-xl p-1 mb-4">
                  <TabsTrigger value="all" className="text-[9px] uppercase font-bold rounded-lg">All</TabsTrigger>
                  <TabsTrigger value="digital" className="text-[9px] uppercase font-bold rounded-lg">Digital</TabsTrigger>
                  <TabsTrigger value="wallet" className="text-[9px] uppercase font-bold rounded-lg">Wallet</TabsTrigger>
                  <TabsTrigger value="refund" className="text-[9px] uppercase font-bold rounded-lg">Refund</TabsTrigger>
                </TabsList>
                <TabsContent value="all"><TransactionList txs={wallet.transactions} /></TabsContent>
                <TabsContent value="digital"><TransactionList txs={digitalHistory} /></TabsContent>
                <TabsContent value="wallet"><TransactionList txs={walletUsageHistory} /></TabsContent>
                <TabsContent value="refund"><TransactionList txs={refundHistory} /></TabsContent>
              </Tabs>
          </div>
      </div>
      <SimulatedPayment isOpen={showPayment} onClose={() => setShowPayment(false)} onComplete={finalizeAddMoney} amount={parseFloat(addAmount) || 0} />
    </AuthGuard>
  );
}
