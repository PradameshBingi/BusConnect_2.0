
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

type VerificationStatus = 'idle' | 'loading' | 'not_found' | 'expired' | 'valid';

export default function BusPassPage() {
    const [passCode, setPassCode] = useState('');
    const [status, setStatus] = useState<VerificationStatus>('idle');
    const [passDetails, setPassDetails] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleVerification = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!passCode) {
            toast({ variant: 'destructive', title: 'Missing Code', description: 'Please enter a bus pass code.' });
            return;
        }

        setIsLoading(true);
        setPassDetails(null);
        setStatus('loading');

        try {
            const codeToVerify = passCode.trim().toUpperCase();
            const response = await fetch(`/api/verify-bus-pass/${codeToVerify}`);
            
            if (response.status === 404) {
                setStatus('not_found');
                return;
            }

            if (!response.ok) throw new Error("Verification failed");

            const result = await response.json();
            const foundPass = result.pass;
            
            if (foundPass) {
                // Front-end Normalization Layer (Aggressive)
                const name = foundPass.name || foundPass.holderName || foundPass.Name || 'Unknown Holder';
                const rawValidTill = foundPass.validTill || foundPass.validTo || foundPass.ValidTill || foundPass.expiryDate;
                
                // Deep extraction for routes
                const routeFrom = foundPass.route?.from || foundPass.Route?.from || foundPass.from || '';
                const routeTo = foundPass.route?.to || foundPass.Route?.to || foundPass.to || '';
                
                // Flexible extraction for bus types
                let busTypesRaw = [];
                if (foundPass.validBusTypes && Array.isArray(foundPass.validBusTypes) && foundPass.validBusTypes.length > 0) {
                    busTypesRaw = foundPass.validBusTypes;
                } else if (foundPass.busTypes && Array.isArray(foundPass.busTypes) && foundPass.busTypes.length > 0) {
                    busTypesRaw = foundPass.busTypes;
                } else {
                    busTypesRaw = foundPass.busType ? [foundPass.busType] : [];
                }
                
                const category = foundPass.category || foundPass.Category || 'Citizen';
                const passType = foundPass.passType || foundPass.PassType || (routeFrom && routeTo ? 'Route' : 'General');

                const now = new Date();
                const validTillDate = rawValidTill ? new Date(rawValidTill) : null;
                
                const normalizedPass = {
                    ...foundPass,
                    name,
                    validTill: validTillDate,
                    route: { from: routeFrom, to: routeTo },
                    busTypes: busTypesRaw.filter(Boolean),
                    category,
                    passType
                };

                setPassDetails(normalizedPass);

                if (validTillDate && !isNaN(validTillDate.getTime()) && now > validTillDate) {
                    setStatus('expired');
                } else {
                    setStatus('valid');
                    
                    const pStats = JSON.parse(localStorage.getItem('conductorPassVerificationStats') || '[]');
                    pStats.push({
                        passCode: foundPass.passCode || codeToVerify,
                        verifiedAt: new Date().toISOString(),
                        category: normalizedPass.category,
                        passType: normalizedPass.passType,
                        holderName: name
                    });
                    localStorage.setItem('conductorPassVerificationStats', JSON.stringify(pStats));
                }
            } else {
                setStatus('not_found');
            }
        } catch (error) {
            console.error("Verification failed", error);
            setStatus('not_found');
            toast({ variant: 'destructive', title: 'Error', description: 'Could not connect to database.' });
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
      <Header showBackButton={true} backHref="/conductor/dashboard" title="Verify Bus Pass" />
      
      <div className="flex-grow flex flex-col items-center p-4 md:p-8 space-y-6">
        {(status === 'idle' || status === 'loading') && (
          <Card className="w-full max-w-md shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="text-xl font-bold font-headline">Verify Bus Pass</CardTitle>
              <CardDescription>Enter the pass code to check status from database.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerification} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="pass-code">Bus Pass Code</Label>
                  <Input
                    id="pass-code"
                    placeholder="e.g., TK98765400"
                    value={passCode}
                    onChange={(e) => setPassCode(e.target.value)}
                    required
                    disabled={isLoading}
                    className="uppercase font-mono tracking-wider h-11"
                  />
                </div>
                <Button type="submit" className="w-full h-11 font-bold" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                  Verify Pass
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
        
        {status === 'valid' && passDetails && (
          <Card className="w-full max-w-xl overflow-hidden border-none shadow-2xl bg-[#FF80A0]">
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
                    <Badge variant="secondary" className="bg-white text-[#FF80A0] hover:bg-white/90 font-black text-[11px] px-4 py-1 tracking-wider uppercase border-none">
                      {passDetails.category}
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 font-black text-[11px] px-4 py-1 tracking-wider uppercase border border-white/30">
                      {passDetails.passType}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator className="bg-white/20" />

              <div className="grid grid-cols-2 gap-12">
                <div>
                  <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Valid Until</p>
                  <p className="font-black text-2xl text-white">
                    {passDetails.validTill && !isNaN(passDetails.validTill.getTime())
                      ? passDetails.validTill.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
                      : 'N/A'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Valid Bus Types</p>
                  <p className="text-[13px] font-bold text-white/90">
                    {passDetails.busTypes && passDetails.busTypes.length > 0 
                      ? passDetails.busTypes.join(', ') 
                      : 'N/A'}
                  </p>
                </div>
              </div>

              {(passDetails.route.from || passDetails.route.to) && (
                <div className="bg-white/10 rounded-2xl p-6 border border-white/10">
                   <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-4 text-center">Designated Route</p>
                   <div className="flex items-center justify-between px-4">
                      <div className="text-center flex-1">
                        <p className="font-black text-lg text-white uppercase">{passDetails.route.from || 'Start'}</p>
                      </div>
                      <div className="px-6">
                        <ArrowRight className="h-6 w-6 text-white/60" />
                      </div>
                      <div className="text-center flex-1">
                        <p className="font-black text-lg text-white uppercase">{passDetails.route.to || 'End'}</p>
                      </div>
                   </div>
                </div>
              )}

              <Button 
                variant="outline" 
                className="w-full h-14 bg-white text-[#FF80A0] border-none font-black text-lg hover:bg-white/90 transition-all mt-6 shadow-lg uppercase"
                onClick={reset}
              >
                Verify Next Pass
              </Button>
            </CardContent>
          </Card>
        )}

        {status === 'expired' && (
          <Card className="w-full max-w-md overflow-hidden border-none shadow-xl bg-white">
            <div className="bg-yellow-500 text-white p-4 flex items-center justify-center gap-2">
              <Clock className="h-6 w-6" />
              <h2 className="text-lg font-black tracking-[0.1em] uppercase">Pass Expired</h2>
            </div>
            <CardContent className="p-10 text-center space-y-4">
               <XCircle className="h-16 w-16 text-red-500 mx-auto" />
               <div>
                  <h3 className="text-xl font-bold text-slate-900">Validity Ended</h3>
                  <p className="text-sm text-slate-500">This pass is no longer valid for travel.</p>
               </div>
               <Button variant="outline" className="w-full h-11" onClick={reset}>Try Another Code</Button>
            </CardContent>
          </Card>
        )}

        {status === 'not_found' && (
          <Card className="w-full max-w-md overflow-hidden border-none shadow-xl bg-white">
            <div className="bg-red-600 text-white p-4 flex items-center justify-center gap-2">
              <XCircle className="h-6 w-6" />
              <h2 className="text-lg font-black tracking-[0.1em] uppercase">Not Found</h2>
            </div>
            <CardContent className="p-10 text-center space-y-4">
               <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                  <Search className="h-10 w-10 text-red-500" />
               </div>
               <div>
                  <h3 className="text-xl font-bold text-slate-900">Record Missing</h3>
                  <p className="text-sm text-slate-500">The code <span className="font-bold text-slate-700">{passCode.toUpperCase()}</span> was not found in our database.</p>
               </div>
               <Button variant="outline" className="w-full h-11" onClick={reset}>Try Different Code</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
