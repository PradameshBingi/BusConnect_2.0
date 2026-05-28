
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, CheckCircle, XCircle, Clock, Loader2, ArrowRight, User } from 'lucide-react';
import Header from '@/components/header';
import { useToast } from "@/hooks/use-toast";

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
            if (!response.ok) throw new Error("Verification failed");

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
                        category: foundPass.category,
                        passType: foundPass.passType,
                        holderName: foundPass.name
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header showBackButton={true} backHref="/dashboard" title="Pass Verifier" />
      
      <div className="flex-grow flex flex-col items-center p-4 md:p-8 space-y-6">
        {(status === 'idle' || status === 'loading') && (
          <Card className="w-full max-w-md shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="text-xl font-black font-headline uppercase">Verify Bus Pass</CardTitle>
              <CardDescription>Live database check for passenger passes.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerification} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="pass-code">Pass Code</Label>
                  <Input
                    id="pass-code"
                    placeholder="e.g. TK00998877"
                    value={passCode}
                    onChange={(e) => setPassCode(e.target.value)}
                    required
                    className="uppercase font-mono tracking-widest h-14 text-xl"
                  />
                </div>
                <Button type="submit" className="w-full h-14 font-black text-lg" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Search className="mr-2 h-5 w-5" />}
                  VERIFY STATUS
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
        
        {status === 'valid' && passDetails && (
          <Card className="w-full max-w-2xl overflow-hidden border-none shadow-2xl bg-[#FF80A0]">
            <div className="bg-[#00B893] text-white p-6 flex items-center justify-center gap-3">
              <CheckCircle className="h-8 w-8" />
              <h2 className="text-2xl font-black tracking-[0.2em] uppercase">VALID PASSHOLDER</h2>
            </div>
            
            <CardContent className="p-10 space-y-8 text-white">
              <div className="flex items-start gap-10">
                <div className="w-48 h-56 bg-white/20 border-4 border-dashed border-white/40 rounded-3xl flex flex-col items-center justify-center gap-2 shrink-0 backdrop-blur-sm">
                  <User className="h-20 w-20 text-white/50" />
                  <span className="text-xs font-black text-white/60 tracking-widest uppercase">Photo ID</span>
                </div>
                
                <div className="flex-grow pt-4">
                  <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] mb-2">Holder Name</p>
                  <h3 className="text-4xl font-black text-white leading-tight mb-6 uppercase tracking-tight">
                    {passDetails.name}
                  </h3>
                  
                  <div className="flex flex-wrap gap-4">
                    <Badge className="bg-white text-[#FF80A0] font-black text-xs px-6 py-2 tracking-widest uppercase border-none">
                      {passDetails.category}
                    </Badge>
                    <Badge className="bg-white/20 text-white font-black text-xs px-6 py-2 tracking-widest uppercase border border-white/40">
                      {passDetails.passType}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator className="bg-white/30" />

              <div className="grid grid-cols-2 gap-12">
                <div>
                  <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-2">Valid Until</p>
                  <p className="font-black text-3xl text-white">
                    {passDetails.validTill && !isNaN(passDetails.validTill.getTime())
                      ? passDetails.validTill.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
                      : 'N/A'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-2">Valid Services</p>
                  <p className="text-sm font-bold text-white/90 leading-relaxed uppercase">
                    {passDetails.busTypes && passDetails.busTypes.length > 0 
                      ? passDetails.busTypes.join(', ') 
                      : 'All Local'}
                  </p>
                </div>
              </div>

              {(passDetails.route?.from || passDetails.route?.to) && (
                <div className="bg-white/10 rounded-3xl p-8 border border-white/20 shadow-inner">
                   <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-6 text-center">Designated Route</p>
                   <div className="flex items-center justify-between px-6">
                      <div className="text-center flex-1">
                        <p className="font-black text-xl text-white uppercase tracking-tight">{passDetails.route.from}</p>
                      </div>
                      <div className="px-8">
                        <ArrowRight className="h-8 w-8 text-white/40" />
                      </div>
                      <div className="text-center flex-1">
                        <p className="font-black text-xl text-white uppercase tracking-tight">{passDetails.route.to}</p>
                      </div>
                   </div>
                </div>
              )}

              <Button 
                className="w-full h-16 bg-white text-[#FF80A0] border-none font-black text-xl hover:bg-slate-100 transition-all mt-8 shadow-xl uppercase tracking-widest"
                onClick={reset}
              >
                Verify Next Pass
              </Button>
            </CardContent>
          </Card>
        )}

        {status === 'expired' && (
          <Card className="w-full max-w-md overflow-hidden border-none shadow-xl bg-white text-center p-10 space-y-6">
             <div className="bg-amber-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto">
               <Clock className="h-12 w-12 text-amber-600" />
             </div>
             <h3 className="text-2xl font-black text-slate-900 uppercase">Validity Expired</h3>
             <p className="text-slate-500">This pass is no longer valid for travel.</p>
             <Button variant="outline" className="w-full h-14" onClick={reset}>Search Again</Button>
          </Card>
        )}

        {status === 'not_found' && (
          <Card className="w-full max-w-md overflow-hidden border-none shadow-xl bg-white text-center p-10 space-y-6">
             <div className="bg-red-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto">
               <XCircle className="h-12 w-12 text-red-500" />
             </div>
             <h3 className="text-2xl font-black text-slate-900 uppercase">Pass Not Found</h3>
             <p className="text-slate-500">The code <span className="font-bold">{passCode.toUpperCase()}</span> was not found in passenger records.</p>
             <Button variant="outline" className="w-full h-14" onClick={reset}>Try Different Code</Button>
          </Card>
        )}
      </div>
    </div>
  );
}
