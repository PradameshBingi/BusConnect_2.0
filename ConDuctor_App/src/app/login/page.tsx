
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Lock, IdCard, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    const user = localStorage.getItem('currentUser');
    if (user) {
      router.replace('/conductor/dashboard');
    }
  }, [router]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); 
    if (value.length <= 10) {
      setPhone(value);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 5) {
      toast({ variant: 'destructive', title: "Invalid ID", description: "Enter valid Conductor ID." });
      return;
    }
    
    setIsLoading(true);

    try {
      const newSessionId = Date.now().toString();
      
      const res = await fetch('/api/conductor-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: phone, password: password, sessionId: newSessionId })
      });
      
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.status === "success") {
        localStorage.setItem('currentUser', phone);
        localStorage.setItem('sessionId', newSessionId);
        localStorage.setItem('conductorName', data.name || 'Staff Member');
        
        toast({ title: "Authorized", description: `Welcome back, ${data.name}.` });
        router.replace('/conductor/dashboard');
      } else {
        toast({ 
          variant: 'destructive', 
          title: "Access Denied", 
          description: data.message || "Invalid credentials. Check ID and PIN." 
        });
        setIsLoading(false);
      }
    } catch (err) {
      toast({ 
        variant: 'destructive', 
        title: "Connection Error", 
        description: "Could not reach the authentication server." 
      });
      setIsLoading(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#0A2B70] flex flex-col items-center justify-center p-4 font-headline">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-6 text-white">
          <div className="bg-white p-2 border-4 border-red-600 rounded-sm shadow-2xl animate-in zoom-in duration-700">
            <div className="w-20 h-20 flex flex-col items-center justify-center bg-red-600 text-white rounded-sm font-black leading-none uppercase text-center">
              <span className="text-[12px]">TSRTC</span>
              <span className="text-sm mt-1">GAMYAM</span>
              <span className="text-[7px] mt-2 tracking-normal border-t border-white/30 pt-1.5 px-1">Track and Active</span>
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-4xl font-black tracking-[0.2em] font-headline uppercase">TGSRTC</h1>
            <p className="text-white/60 font-bold tracking-widest mt-1 uppercase text-[10px]">Staff Terminal v2.1.0</p>
          </div>
        </div>

        <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="text-center pb-2 pt-10">
            <CardTitle className="text-2xl font-black font-headline uppercase tracking-tight">Staff Login</CardTitle>
            <CardDescription className="text-xs font-bold uppercase text-slate-400">Secure Access Portal</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-6 pt-6 px-8">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Conductor ID</Label>
                <div className="relative">
                  <Input 
                    placeholder="Conductor ID" 
                    value={phone} 
                    onChange={handlePhoneChange} 
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
                    onChange={(e) => setPassword(e.target.value)} 
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
