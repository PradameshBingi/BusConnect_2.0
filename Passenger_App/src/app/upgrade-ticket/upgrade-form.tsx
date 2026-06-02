'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { calculateFare, BUS_CATEGORIES } from '@/lib/fare-calculator';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Wallet, ArrowUpCircle, Loader2, Bus } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { SimulatedPayment } from '@/components/simulated-payment';
import { API_ENDPOINTS } from '@/lib/api-config';

type Ticket = {
  from: string;
  to: string;
  routeNo: string;
  passengers: string;
  quantities: { Men: number, Child: number, Women: number };
  totalFare: number;
  fare: number;
  ticketCode: string;
  securityCode: string;
  status: 'valid' | 'invalid' | 'used' | 'expired' | 'cancelled';
  createdAt: string;
  busType: string;
  walletAmountUsed?: number;
};

const busTypeMeta = [
    { name: BUS_CATEGORIES.ORDINARY, level: 1 },
    { name: BUS_CATEGORIES.EXPRESS, level: 2 },
    { name: BUS_CATEGORIES.DELUXE, level: 3 },
];

export function UpgradeForm({ ticket }: { ticket: Ticket }) {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const [walletBalance, setWalletBalance] = useState(0);
    const [useWallet, setUseWallet] = useState(false);
    const [showPayment, setShowPayment] = useState(false);
    const [selectedUpgrade, setSelectedUpgrade] = useState<any>(null);

    useEffect(() => {
        const fetchWallet = async () => {
          const phone = localStorage.getItem('currentUser');
          if (!phone) return;
          try {
            const res = await fetch(`/api/user?phone=${phone}`);
            if (res.ok) {
              const data = await res.json();
              setWalletBalance(data.walletBalance || 0);
            }
          } catch (e) {
            console.error("Wallet fetch failed");
          }
        };
        fetchWallet();
    }, []);

    const currentBusMeta = useMemo(() => {
        const found = busTypeMeta.find(b => b.name === ticket.busType);
        return found || busTypeMeta[0];
    }, [ticket.busType]);

    const upgradeOptions = useMemo(() => {
        return busTypeMeta
            .filter(b => b.level > currentBusMeta.level)
            .map(upgradeBus => {
                const newTotalFare = calculateFare(ticket.from, ticket.to, ticket.quantities, upgradeBus.name);
                const fareDifference = Math.round(Math.max(0, newTotalFare - ticket.totalFare));
                let amountToPay = fareDifference;
                let walletUsedForUpgrade = 0;

                if (useWallet) {
                    walletUsedForUpgrade = Math.min(amountToPay, walletBalance);
                    amountToPay = Math.max(0, amountToPay - walletUsedForUpgrade);
                }

                return { ...upgradeBus, newTotalFare, fareDifference, amountToPay, walletUsedForUpgrade };
            });
    }, [ticket, currentBusMeta, walletBalance, useWallet]);

    const handleUpgradeClick = (opt: any) => {
        setSelectedUpgrade(opt);
        if (opt.amountToPay > 0) {
            setShowPayment(true);
        } else {
            finalizeUpgrade(opt);
        }
    };

    const finalizeUpgrade = async (optParam?: any) => {
        const opt = optParam || selectedUpgrade;
        if (!opt) return;

        setIsLoading(opt.name);
        try {
            const currentUserId = localStorage.getItem('currentUser');
            const newCreatedAt = new Date().toISOString();
            
            const response = await fetch(`${API_ENDPOINTS.USE}/${ticket.ticketCode}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    busType: opt.name,
                    totalFare: opt.newTotalFare,
                    fare: Math.round((ticket.fare || 0) + opt.amountToPay),
                    status: 'valid',
                    createdAt: newCreatedAt 
                })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || "Upgrade failed at database.");
            }

            if (currentUserId && opt.walletUsedForUpgrade > 0) {
                await fetch('/api/user', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        phone: currentUserId,
                        amount: opt.walletUsedForUpgrade,
                        type: 'debit',
                        description: `Upgrade to ${opt.name} for ${ticket.ticketCode}`
                    })
                });
            }

            toast({ title: "Upgrade Successful", description: `Service updated to ${opt.name}.` });
            router.push(`/ticket/${ticket.ticketCode}`);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
            setIsLoading(null);
        }
    };

    return (
        <>
            <Card className="w-full max-w-md border-none shadow-2xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-accent text-white p-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Bus className="h-8 w-8 text-white" />
                        <CardTitle className="text-2xl font-headline uppercase tracking-tight">Upgrade Service</CardTitle>
                    </div>
                    <CardDescription className="text-white/80 leading-relaxed">
                        From: <span className="font-bold text-white">{ticket.busType}</span><br />
                        Fare Paid: <span className="font-bold text-white">Rs. {Math.round(ticket.totalFare)}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-8">
                    {walletBalance > 0 && (
                        <div className="flex items-center justify-between rounded-2xl border p-4 bg-slate-50">
                            <div className="flex items-center gap-3 text-slate-700">
                                <Wallet className="h-6 w-6 text-primary" />
                                <div>
                                    <p className="font-bold text-sm">Use Wallet</p>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Balance: Rs. {Math.round(walletBalance)}</p>
                                </div>
                            </div>
                            <Switch checked={useWallet} onCheckedChange={setUseWallet} disabled={!!isLoading} />
                        </div>
                    )}

                    {upgradeOptions.length > 0 ? (
                        <div className="space-y-4">
                            {upgradeOptions.map(opt => (
                                <div key={opt.name} className="p-6 border-2 rounded-2xl hover:border-accent transition-all cursor-pointer group" onClick={() => !isLoading && handleUpgradeClick(opt)}>
                                    <div className="flex justify-between items-start mb-4">
                                        <h4 className="text-xl font-black text-accent uppercase tracking-tighter">{opt.name}</h4>
                                        <div className="text-right">
                                            <p className="font-black text-2xl text-primary">+ Rs. {Math.round(opt.fareDifference)}</p>
                                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Difference</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-bold text-slate-500 bg-slate-50 p-3 rounded-xl border border-dashed">
                                        <span>New Total: Rs. {Math.round(opt.newTotalFare)}</span>
                                        <span className="text-accent uppercase">Payable: Rs. {Math.round(opt.amountToPay)}</span>
                                    </div>
                                    <Button className="w-full mt-6 h-12 bg-accent hover:bg-accent/90 rounded-xl font-bold" disabled={!!isLoading}>
                                        {isLoading === opt.name ? <Loader2 className="animate-spin h-5 w-5" /> : `Select ${opt.name}`}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed">
                            <Bus className="h-12 w-12 text-green-500 mx-auto mb-3" />
                            <p className="font-bold text-slate-800">Highest Category Reached</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {selectedUpgrade && (
              <SimulatedPayment 
                isOpen={showPayment}
                onClose={() => setShowPayment(false)}
                onComplete={() => finalizeUpgrade()}
                amount={selectedUpgrade.amountToPay}
              />
            )}
        </>
    );
}
