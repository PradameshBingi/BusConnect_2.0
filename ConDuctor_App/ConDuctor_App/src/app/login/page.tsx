
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Lock, IdCard, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const IDLogoSVG = () => (
  <svg viewBox="0 0 100 100" className="w-24 h-24 drop-shadow-xl animate-in zoom-in duration-700">
    <circle cx="50" cy="50" r="50" fill="#0A2B70" />
    <rect x="35" y="25" width="45" height="35" rx="4" fill="white" opacity="0.2" transform="rotate(8 50 50)" />
    <rect x="22" y="32" width="56" height="42" rx="6" fill="white" />
    <rect x="28" y="40" width="18" height="22" rx="2" fill="#F1F5F9" />
    <circle cx="37" cy="48" r="5" fill="#0A2B70" />
    <path d="M37 54C33 54 31 57 31 60H43C43 57 41 54 37 54Z" fill="#0A2B70" />
    <rect x="52" y="44" width="18" height="2.5" rx="1" fill="#0A2B70" opacity="0.8" />
    <rect x="52" y="50" width="18" height="2.5" rx="1" fill="#0A2B70" opacity="0.8" />
    <rect x="52" y="56" width="12" height="2.5" rx="1" fill="#0A2B70" opacity="0.8" />
  </svg>
);

export default function LoginPage() {
  const [idNo, setIdNo] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulated Secure Login Logic with Session Tracking
    setTimeout(async () => {
      if (idNo === '9999999999' && password === '54987') {
        const newSessionId = Date.now().toString();
        
        try {
          // Register session in DB for single-session constraint
          await fetch('/api/conductor-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: idNo, sessionId: newSessionId })
          });

          localStorage.setItem('conductorUser', idNo);
          localStorage.setItem('conductorSessionId', newSessionId);
          
          toast({ title: "Login Successful", description: "Terminal Access Granted." });
          router.push('/');
        } catch (err) {
          localStorage.setItem('conductorUser', idNo);
          localStorage.setItem('conductorSessionId', newSessionId);
          toast({ title: "Login Successful", description: "Access Granted." });
          router.push('/');
        }
      } else {
        toast({ variant: 'destructive', title: "Access Denied", description: "Invalid Credentials." });
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0A2B70] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-6 text-white">
          <IDLogoSVG />
          <div className="text-center">
            <h1 className="text-4xl font-black tracking-[0.2em] font-headline uppercase">TGSRTC</h1>
            <p className="text-white/60 font-bold tracking-widest mt-1 uppercase text-[10px]">Staff Terminal v2.1.0</p>
          </div>
        </div>

        <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="text-center pb-2 pt-10">
            <CardTitle className="text-2xl font-black font-headline uppercase tracking-tight">Staff Login</CardTitle>
            <CardDescription className="text-xs font-bold uppercase text-slate-400">Enter secure ID to access dashboard</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-6 pt-6 px-8">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Conductor ID</Label>
                <div className="relative">
                  <Input 
                    placeholder="10-digit ID" 
                    value={idNo} 
                    onChange={e => setIdNo(e.target.value.replace(/\D/g, '').slice(0,10))} 
                    required 
                    className="pl-12 h-14 rounded-2xl text-lg font-bold tracking-widest bg-slate-50 border-slate-100"
                  />
                  <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Security PIN</Label>
                <div className="relative">
                  <Input 
                    type="password"
                    placeholder="•••••" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required 
                    className="pl-12 h-14 rounded-2xl text-2xl font-bold tracking-[0.5em] bg-slate-50 border-slate-100"
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="pb-10 pt-4 px-8">
              <Button type="submit" className="w-full h-16 text-lg font-black bg-[#0A2B70] hover:bg-[#08215c] rounded-2xl uppercase tracking-widest shadow-xl" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin mr-3 h-6 w-6" /> : <ShieldCheck className="mr-3 h-6 w-6" />}
                Authorize Access
              </Button>
            </CardFooter>
          </form>
        </Card>

        <p className="text-center text-white/30 text-[10px] font-bold uppercase tracking-widest">
          Standard Operating Terminal • TGSRTC Hyderabad
        </p>
      </div>
    </div>
  );
}
