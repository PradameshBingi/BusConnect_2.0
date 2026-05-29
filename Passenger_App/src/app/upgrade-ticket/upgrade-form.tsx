'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { calculateFare } from '@/lib/fare-calculator';
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
  busType: 'ordinary' | 'express' | 'deluxe';
  walletAmountUsed?: number;
};

type BusType = 'ordinary' | 'express' | 'deluxe';

const busTypeMeta: { name: BusType, title: string, level: number }[] = [
    { name: 'ordinary', title: 'City Ordinary', level: 1 },
    { name: 'express', title: 'Metro Express', level: 2 },
    { name: 'deluxe', title: 'Metro Deluxe', level: 3 },
];

export function UpgradeForm({ ticket }: { ticket: Ticket }) {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState<BusType | null>(null);
    const [walletBalance, setWalletBalance] = useState(0);
    const [useWallet, setUseWallet] = useState(false);
    const [showPayment, setShowPayment] = useState(false);
    const [selectedUpgrade, setSelectedUpgrade] = useState<any>(null);

    useEffect(() => {
        try {
            const storedWallet = JSON.parse(localStorage.getItem('userWallet') || '{"balance":0}');
            setWalletBalance(storedWallet.balance || 0);
        } catch (e) {
            setWalletBalance(0);
        }
    }, []);

    const currentBusMeta = useMemo(() => busTypeMeta.find(b => b.name === ticket.busType)!, [ticket.busType]);

    const upgradeOptions = useMemo(() => {
        return busTypeMeta
            .filter(b => b.level > currentBusMeta.level)
            .map(upgradeBus => {
                const newTotalFare = calculateFare(ticket.from, ticket.to, ticket.quantities, upgradeBus.name);
                const fareDifference = Math.max(0, newTotalFare - ticket.totalFare);
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
            // 1. Sync with Database
            const response = await fetch(`${API_ENDPOINTS.USE}/${ticket.ticketCode}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    busType: opt.name,
                    totalFare: opt.newTotalFare,
                    fare: ticket.fare + opt.amountToPay
                })
            });

            if (!response.ok) throw new Error("Database update failed.");
            
            const result = await response.json();
            const updatedDbTicket = result.ticket;

            // 2. Update Wallet if used
            if (useWallet && opt.walletUsedForUpgrade > 0) {
                const storedWallet = JSON.parse(localStorage.getItem('userWallet') || '{"balance":0, "transactions": []}');
                storedWallet.balance -= opt.walletUsedForUpgrade;
                storedWallet.transactions.push({
                    type: 'debit',
                    description: `Upgrade to ${opt.title} for ${ticket.ticketCode}`,
                    amount: opt.walletUsedForUpgrade,
                    date: new Date().toISOString(),
                });
                localStorage.setItem('userWallet', JSON.stringify(storedWallet));
            }

            // 3. Update Local History
            const storedTickets: Ticket[] = JSON.parse(localStorage.getItem('generatedTickets') || '[]');
            const ticketIndex = storedTickets.findIndex(t => t.ticketCode === ticket.ticketCode);
            if (ticketIndex > -1) {
                storedTickets[ticketIndex] = { ...updatedDbTicket, status: 'valid' }; // Ensure status remains valid after upgrade
                localStorage.setItem('generatedTickets', JSON.stringify(storedTickets));
            }
            
            toast({ title: "Upgrade Successful!", description: `Ticket upgraded to ${opt.title}.` });
            router.push(`/ticket/${ticket.ticketCode}`);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Upgrade Failed', description: error.message });
            setIsLoading(null);
        }
    };

    return (
        <>
            <Card className="w-full max-w-md border-t-8 border-t-accent shadow-xl">
                <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-accent/10 rounded-full">
                            <Bus className="h-6 w-6 text-accent" />
                        </div>
                        <CardTitle className="text-2xl font-headline uppercase tracking-tight">Upgrade Portal</CardTitle>
                    </div>
                    <CardDescription>
                        Current: <span className="font-bold text-foreground">{currentBusMeta.title}</span><br/>
                        Paid Fare: <span className="font-bold text-primary">Rs. {ticket.totalFare}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Separator />
                    
                    {walletBalance > 0 && (
                        <div className="flex items-center justify-between rounded-xl border p-4 bg-muted/30">
                            <div className="flex items-center gap-3">
                                <Wallet className="h-6 w-6 text-primary" />
                                <div>
                                    <span className="font-bold text-sm">Use Wallet Balance</span>
                                    <p className="text-xs text-muted-foreground">Available: Rs. {walletBalance.toFixed(2)}</p>
                                </div>
                            </div>
                            <Switch checked={useWallet} onCheckedChange={setUseWallet} disabled={!!isLoading} />
                        </div>
                    )}

                    {upgradeOptions.length > 0 ? (
                        <div className="space-y-4">
                            {upgradeOptions.map(opt => (
                                <div key={opt.name} className="p-5 border-2 rounded-2xl hover:border-accent transition-colors group">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="text-lg font-black text-accent uppercase tracking-tighter">{opt.title}</h4>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Next Tier Category</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-xl">+ Rs. {Math.round(opt.fareDifference)}</p>
                                            <p className="text-[9px] font-bold text-muted-foreground uppercase">Difference</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5 text-xs font-medium bg-muted/20 p-3 rounded-lg border border-dashed">
                                        <div className="flex justify-between"><span>New Total Fare:</span> <span className="font-bold">Rs. {Math.round(opt.newTotalFare)}</span></div>
                                        {useWallet && opt.walletUsedForUpgrade > 0 && (
                                            <div className="flex justify-between text-green-600">
                                                <span>From Wallet:</span> 
                                                <span className="font-bold">- Rs. {Math.round(opt.walletUsedForUpgrade)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-base font-black border-t pt-2 mt-2">
                                            <span>Payable:</span> 
                                            <span className="text-primary">Rs. {Math.round(opt.amountToPay)}</span>
                                        </div>
                                    </div>
                                    <Button 
                                        className="w-full mt-5 h-12 text-sm font-bold bg-accent hover:bg-accent/90 rounded-xl" 
                                        disabled={!!isLoading} 
                                        onClick={() => handleUpgradeClick(opt)}
                                    >
                                        {isLoading === opt.name ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowUpCircle className="mr-2 h-4 w-4" />}
                                        {isLoading === opt.name ? 'Upgrading...' : `Upgrade to ${opt.name.toUpperCase()}`}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                            <p className="font-bold">Highest Category Reached</p>
                            <p className="text-sm text-muted-foreground">You are already on the Metro Deluxe service.</p>
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => router.back()}>Cancel and Go Back</Button>
                </CardFooter>
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
