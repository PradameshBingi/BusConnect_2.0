'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, CheckCircle, XCircle, Clock, Loader2, ArrowRight, User } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export default function BusPassTab() {
    const [passCode, setPassCode] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'valid' | 'expired' | 'not_found'>('idle');
    const [passDetails, setPassDetails] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleVerification = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!passCode) return;

        setIsLoading(true);
        setStatus('loading');

        try {
            const response = await fetch(`/api/verify-bus-pass/${passCode.trim().toUpperCase()}`);
            if (response.status === 404) {
                setStatus('not_found');
                return;
            }
            const result = await response.json();
            const foundPass = result.pass;
            
            if (foundPass) {
                const now = new Date();
                const validTill = new Date(foundPass.validTill || foundPass.validTo);
                setPassDetails({...foundPass, validTill});

                if (now > validTill) {
                    setStatus('expired');
                } else {
                    setStatus('valid');
                    const pStats = JSON.parse(localStorage.getItem('conductorPassVerificationStats') || '[]');
                    pStats.push({ passCode, verifiedAt: new Date().toISOString(), name: foundPass.name });
                    localStorage.setItem('conductorPassVerificationStats', JSON.stringify(pStats));
                }
            } else {
                setStatus('not_found');
            }
        } catch (error) {
            setStatus('not_found');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="border-none shadow-lg overflow-hidden rounded-3xl">
                <CardHeader className="bg-[#E11D48] text-white p-6">
                    <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                        <BookUser className="h-6 w-6 text-white" /> Pass Validation
                    </CardTitle>
                    <CardDescription className="text-rose-100">Search alphanumeric pass code</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                    <form onSubmit={handleVerification} className="flex gap-3">
                        <Input 
                            placeholder="TK00998877" 
                            value={passCode} 
                            onChange={(e) => setPassCode(e.target.value)} 
                            className="uppercase font-mono text-lg h-14 rounded-xl" 
                        />
                        <Button type="submit" className="h-14 w-20 bg-[#E11D48] hover:bg-[#c4163b] rounded-xl" disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin h-6 w-6" /> : <Search className="h-6 w-6" />}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {status === 'valid' && passDetails && (
                <Card className="w-full overflow-hidden border-none shadow-2xl bg-[#FF80A0] rounded-3xl animate-in slide-in-from-bottom-5 duration-500">
                    <div className="bg-[#00B893] text-white p-5 flex items-center justify-center gap-3">
                        <CheckCircle className="h-7 w-7" />
                        <h2 className="text-xl font-black tracking-[0.15em] uppercase">Valid Passholder</h2>
                    </div>
                    
                    <CardContent className="p-8 space-y-8 text-white">
                        <div className="flex items-start gap-8">
                            <div className="w-40 h-48 bg-white/10 border-2 border-dashed border-white/30 rounded-2xl flex flex-col items-center justify-center gap-1 shrink-0">
                                <User className="h-14 w-14 text-white/40" />
                                <span className="text-[11px] font-bold text-white/50 tracking-tighter uppercase">Photo Box</span>
                            </div>
                            
                            <div className="flex-grow pt-4">
                                <p className="text-[11px] font-black text-white/60 uppercase tracking-widest mb-1">Holder Name</p>
                                <h3 className="text-3xl font-black text-white leading-tight mb-4 uppercase">
                                    {passDetails.name}
                                </h3>
                                <div className="flex gap-3">
                                    <Badge className="bg-white text-[#FF80A0] font-black text-[10px] px-4 py-1.5 uppercase border-none">
                                        {passDetails.category}
                                    </Badge>
                                    <Badge className="bg-white/20 text-white font-black text-[10px] px-4 py-1.5 uppercase border border-white/30">
                                        {passDetails.passType}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <Separator className="bg-white/20" />

                        <div className="grid grid-cols-2 gap-10">
                            <div>
                                <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Valid Until</p>
                                <p className="font-black text-2xl text-white">
                                    {passDetails.validTill.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Services</p>
                                <p className="text-[12px] font-bold text-white/90 leading-tight uppercase">
                                    City Ordinary<br/>Metro Express
                                </p>
                            </div>
                        </div>

                        {(passDetails.route?.from || passDetails.route?.to) && (
                            <div className="bg-white/10 rounded-2xl p-6 border border-white/10 shadow-inner">
                                <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-4 text-center">Designated Route</p>
                                <div className="flex items-center justify-between px-4">
                                    <p className="font-black text-lg text-white uppercase">{passDetails.route.from}</p>
                                    <ArrowRight className="h-6 w-6 text-white/50" />
                                    <p className="font-black text-lg text-white uppercase">{passDetails.route.to}</p>
                                </div>
                            </div>
                        )}

                        <Button 
                            variant="outline" 
                            className="w-full h-16 bg-white text-[#FF80A0] border-none font-black text-xl hover:bg-white/90 transition-all shadow-xl uppercase"
                            onClick={() => setStatus('idle')}
                        >
                            Next Pass
                        </Button>
                    </CardContent>
                </Card>
            )}

            {status === 'expired' && (
                <Card className="glass-card p-10 text-center border-orange-100 bg-orange-50/30 rounded-3xl">
                    <Clock className="mx-auto mb-4 h-12 w-12 text-orange-500" />
                    <h3 className="text-xl font-black text-orange-600 uppercase mb-2">Pass Expired</h3>
                    <p className="text-sm text-slate-500 font-medium">This pass holder must book a standard ticket.</p>
                    <Button variant="outline" className="mt-6 w-full h-12 rounded-xl" onClick={() => setStatus('idle')}>Search Again</Button>
                </Card>
            )}
        </div>
    );
}
