
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, CheckCircle, XCircle, Clock, Loader2, ArrowRight, User } from 'lucide-react';
import Header from '@/app/components/header';
import { useToast } from "@/hooks/use-toast";
import AuthGuard from '@/app/components/AuthGuard';

type VerificationStatus = 'idle' | 'loading' | 'not_found' | 'expired' | 'valid';

export default function BusPassPage() {
    const [passCode, setPassCode] = useState('');
    const [status, setStatus] = useState<VerificationStatus>('idle');
    const [passDetails, setPassDetails] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleVerification = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!passCode) return;

        setIsLoading(true);
        setPassDetails(null);
        setStatus('loading');

        try {
            const response = await fetch(`/api/verify-bus-pass/${passCode.trim().toUpperCase()}`);
            if (response.status === 404) {
                setStatus('not_found');
                return;
            }
            if (!response.ok) throw new Error("Invalid");

            const result = await response.json();
            const foundPass = result.pass;
            
            if (foundPass) {
                const now = new Date();
                const validTillDate = foundPass.validTill ? new Date(foundPass.validTill) : null;
                setPassDetails({...foundPass, validTill: validTillDate});

                if (validTillDate && !isNaN(validTillDate.getTime()) && now > validTillDate) {
                    setStatus('expired');
                } else {
                    setStatus('valid');
                    const pStats = JSON.parse(localStorage.getItem('conductorPassVerificationStats') || '[]');
                    pStats.push({
                        passCode: foundPass.passCode,
                        verifiedAt: new Date().toISOString(),
                        name: foundPass.name
                    });
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

    const reset = () => {
        setPassCode('');
        setStatus('idle');
        setPassDetails(null);
    };

  return (
    <AuthGuard>
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header showBackButton={true} backHref="/conductor/dashboard" title="Pass Tool" />
      
      <div className="flex-grow flex flex-col items-center p-4 md:p-8 space-y-6">
        {(status === 'idle' || status === 'loading') && (
          <Card className="w-full max-w-md shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="text-xl font-black font-headline uppercase">Verify Bus Pass</CardTitle>
              <CardDescription>Live database identification.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerification} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="pass-code">Bus Pass Code</Label>
                  <Input
                    id="pass-code"
                    placeholder="e.g. TK00998877"
                    value={passCode}
                    onChange={(e) => setPassCode(e.target.value)}
                    required
                    className="uppercase font-mono tracking-wider h-14 text-lg"
                  />
                </div>
                <Button type="submit" className="w-full h-14 font-black" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Search className="mr-2 h-5 w-5" />}
                  VERIFY PASS
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
        
        {status === 'valid' && passDetails && (
          <Card className="w-full max-w-xl overflow-hidden border-none shadow-2xl bg-[#FF80A0] rounded-[2rem]">
            <div className="bg-[#00B893] text-white p-5 flex items-center justify-center gap-3">
              <CheckCircle className="h-7 w-7" />
              <h2 className="text-xl font-black tracking-[0.15em] uppercase">VALID PASSHOLDER</h2>
            </div>
            
            <CardContent className="p-8 space-y-8 text-white">
              <div className="flex items-start gap-8">
                <div className="w-40 h-48 bg-white/10 border-2 border-dashed border-white/30 rounded-2xl flex flex-col items-center justify-center gap-1 shrink-0">
                  <User className="h-14 w-14 text-white/40" />
                  <span className="text-[10px] font-black text-white/50 tracking-widest uppercase">PHOTO ID</span>
                </div>
                
                <div className="flex-grow pt-4">
                  <p className="text-[9px] font-black text-white/60 uppercase tracking-widest mb-1">Holder Name</p>
                  <h3 className="text-3xl font-black text-white leading-tight mb-4 uppercase">
                    {passDetails.name}
                  </h3>
                  <div className="flex gap-2">
                    <Badge className="bg-white text-[#FF80A0] font-black text-[9px] px-4 py-1 uppercase border-none">
                      {passDetails.category}
                    </Badge>
                    <Badge className="bg-white/20 text-white font-black text-[9px] px-4 py-1 uppercase border border-white/30">
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
                    {passDetails.validTill?.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) || 'N/A'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Services</p>
                  <p className="text-[12px] font-bold text-white/90 leading-tight uppercase">
                    City Ordinary<br/>Metro Express
                  </p>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full h-16 bg-white text-[#FF80A0] border-none font-black text-xl hover:bg-white/90 shadow-xl uppercase"
                onClick={reset}
              >
                Next Pass
              </Button>
            </CardContent>
          </Card>
        )}

        {status === 'expired' && (
          <Card className="w-full max-w-md overflow-hidden border-none shadow-xl bg-white rounded-[2rem] p-10 text-center space-y-4">
               <Clock className="h-16 w-16 text-amber-500 mx-auto" />
               <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase">EXPIRED</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase mt-1">Validity has ended.</p>
               </div>
               <Button variant="outline" className="w-full h-12 rounded-xl" onClick={reset}>Try Again</Button>
          </Card>
        )}

        {status === 'not_found' && (
          <Card className="w-full max-w-md overflow-hidden border-none shadow-xl bg-white rounded-[2rem] p-10 text-center space-y-4">
               <XCircle className="h-16 w-16 text-red-500 mx-auto" />
               <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase">INVALID</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase mt-1">Pass record not found.</p>
               </div>
               <Button variant="outline" className="w-full h-12 rounded-xl" onClick={reset}>Try Different Code</Button>
          </Card>
        )}
      </div>
    </div>
    </AuthGuard>
  );
}
