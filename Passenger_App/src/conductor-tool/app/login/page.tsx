'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Loader2, Lock, UserCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ConductorLoginPage() {
  const [empId, setEmpId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const session = localStorage.getItem('conductorSession');
    if (session) {
      router.replace('/dashboard');
    }
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulated Conductor Authentication
    setTimeout(() => {
      if (empId === 'C12345' && password === 'staff789') {
        localStorage.setItem('conductorSession', empId);
        toast({ title: "Access Granted", description: "Terminal initialized successfully." });
        router.push('/dashboard');
      } else {
        toast({ 
          variant: 'destructive', 
          title: "Access Denied", 
          description: "Invalid Employee ID or Security Key." 
        });
        setIsLoading(false);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#16a34a] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-4 text-white">
          <div className="bg-white p-1 rounded-sm shadow-inner">
            <div className="w-16 h-16 flex flex-col items-center justify-center bg-red-600 text-white rounded-sm text-[9px] font-bold leading-none">
              <span className="mb-0.5">TSRTC</span>
              <span className="mb-0.5">GAMYAM</span>
              <span className="text-[6px] scale-90">Track and Active</span>
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-[0.2em] font-headline">TGSRTC</h1>
            <p className="text-white/80 font-medium tracking-tight mt-1 uppercase text-xs">Conductor Terminal Access</p>
          </div>
        </div>

        <Card className="border-none shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-slate-100 p-3 rounded-full w-fit mb-2">
                <ShieldCheck className="h-8 w-8 text-[#16a34a]" />
            </div>
            <CardTitle className="text-2xl font-bold font-headline">Staff Login</CardTitle>
            <CardDescription>Enter your terminal credentials.</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="empId">Employee ID</Label>
                <div className="relative">
                  <Input 
                    id="empId" 
                    placeholder="e.g. C12345" 
                    value={empId} 
                    onChange={(e) => setEmpId(e.target.value.toUpperCase())} 
                    required 
                    className="pl-10 h-14 rounded-xl text-lg font-mono"
                  />
                  <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Security Key</Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="•••••" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    className="pl-10 h-14 rounded-xl text-lg tracking-[0.5em]"
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-4 pb-8">
              <Button type="submit" className="w-full h-14 text-lg font-bold bg-[#0A2B70] hover:bg-[#0A2B70]/90 rounded-2xl" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Authorize Terminal"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <p className="text-center text-white/60 text-[10px] mt-8 uppercase tracking-widest font-bold">
          Confidential Terminal • TGSRTC Hyderabad
        </p>
      </div>
    </div>
  );
}
