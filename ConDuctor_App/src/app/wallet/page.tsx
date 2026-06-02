'use client';

import { useState, useEffect } from 'react';
import Header from '@/app/components/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { IndianRupee, History, ShieldCheck, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

export default function PassengerWalletPage() {
  const [balance, setWalletBalance] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [autoDeduct, setAutoDeduct] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const phone = localStorage.getItem('passengerPhone') || '9999999999'; // Mock or session ph
    fetchWalletData(phone);
  }, []);

  const fetchWalletData = async (phone: string) => {
    try {
      const res = await fetch(`/api/conductor-session?id=${phone}`); // Reuse session API to get user data
      const data = await res.json();
      setWalletBalance(data.walletBalance || 0);
      setAutoDeduct(data.autoDeductEnabled || false);
      setHistory(data.transactions || []);
    } catch (error) {
      console.error("Failed to load wallet", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAutoDeduct = async (checked: boolean) => {
    setIsUpdating(true);
    const phone = localStorage.getItem('passengerPhone') || '9999999999';

    try {
      const res = await fetch('/api/user/wallet-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, autoDeductEnabled: checked })
      });

      if (!res.ok) throw new Error("Failed to update");

      setAutoDeduct(checked);
      toast({
        title: checked ? "Authorization Enabled" : "Authorization Disabled",
        description: checked 
          ? "Conductors can now deduct fare differences automatically."
          : "You must pay fare differences in cash to the conductor."
      });
    } catch (error) {
      toast({ variant: 'destructive', title: "Error", description: "Could not update settings." });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header title="My Wallet" showBackButton={true} backHref="/" />
      
      <main className="p-4 max-w-2xl mx-auto w-full space-y-6 pb-20">
        {/* Balance Card */}
        <Card className="bg-[#0A2B70] text-white border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-10 flex flex-col items-center text-center space-y-4">
             <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60">Available Balance</p>
             <div className="flex items-center gap-3">
                <IndianRupee className="h-8 w-8 text-[#00B893]" />
                <h1 className="text-5xl font-black tracking-tighter">₹{balance.toLocaleString()}</h1>
             </div>
             <Button className="bg-white/10 hover:bg-white/20 text-white border-none rounded-full px-8 h-12 font-bold text-xs uppercase tracking-widest mt-4">
                Add Funds
             </Button>
          </CardContent>
        </Card>

        {/* Security / Authorization Toggle */}
        <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
           <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-slate-900">
                 <ShieldCheck className="h-4 w-4 text-[#00B893]" />
                 Conductor Authorization
              </CardTitle>
           </CardHeader>
           <CardContent className="p-6 space-y-6">
              <div className="flex items-start justify-between gap-6">
                 <div className="space-y-1">
                    <h3 className="font-bold text-sm text-slate-800">Auto Deduct Fare Difference</h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                       If you board a higher-category bus (e.g. Express → Deluxe), allow the conductor to debit the difference from your wallet instantly.
                    </p>
                 </div>
                 <Switch 
                    checked={autoDeduct} 
                    onCheckedChange={toggleAutoDeduct} 
                    disabled={isUpdating}
                    className="data-[state=checked]:bg-[#00B893]"
                 />
              </div>
              
              <div className="bg-blue-50 p-4 rounded-2xl flex gap-3 items-center">
                 <Zap className="h-5 w-5 text-[#0A2B70] shrink-0" />
                 <p className="text-[10px] font-bold text-[#0A2B70] uppercase leading-tight">
                    Ensures high-speed boarding without cash handling during peak hours.
                 </p>
              </div>
           </CardContent>
        </Card>

        {/* History Section */}
        <div className="space-y-4 pt-4">
           <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 ml-2">
              <History className="h-4 w-4" /> Recent Activity
           </h2>
           
           <div className="space-y-2">
              {history.length > 0 ? history.slice().reverse().map((tx, idx) => (
                <Card key={idx} className="border-none shadow-sm rounded-2xl">
                   <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className={`p-3 rounded-xl ${tx.type === 'credit' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            <IndianRupee className="h-4 w-4" />
                         </div>
                         <div>
                            <p className="font-bold text-xs text-slate-800 leading-tight">{tx.description}</p>
                            <p className="text-[10px] text-slate-400 mt-1 uppercase font-medium">
                               {new Date(tx.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} • {new Date(tx.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                         </div>
                      </div>
                      <span className={`font-black text-sm ${tx.type === 'credit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                         {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                      </span>
                   </CardContent>
                </Card>
              )) : (
                <div className="text-center py-12">
                   <p className="text-xs text-slate-400 uppercase font-black tracking-widest">No Transactions Yet</p>
                </div>
              )}
           </div>
        </div>
      </main>
    </div>
  );
}
