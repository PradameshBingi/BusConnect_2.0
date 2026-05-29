'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bus, Loader2, Lock, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      router.replace('/');
    }
  }, [router]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Allow only digits
    if (value.length <= 10) {
      setPhone(value);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10) {
      toast({ variant: 'destructive', title: "Invalid Phone", description: "Please enter exactly 10 digits." });
      return;
    }
    
    setIsLoading(true);

    // Mock Authentication Logic for Prototype
    setTimeout(() => {
      if (phone === '9999999999' && password === '99999') {
        localStorage.setItem('currentUser', phone);
        toast({ title: "Login Successful", description: "Welcome to BusConnect Dashboard." });
        router.push('/');
      } else {
        toast({ 
          variant: 'destructive', 
          title: "Login Failed", 
          description: "Invalid phone number or password." 
        });
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-4 text-white">
          <div className="bg-white/20 p-4 rounded-full backdrop-blur-md">
            <Bus className="h-12 w-12" />
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-[0.2em] font-headline">TGSRTC</h1>
            <p className="text-white/80 font-medium tracking-tight mt-1 uppercase text-xs">Hyderabad Digital Ticketing</p>
          </div>
        </div>

        <Card className="border-none shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold font-headline">Passenger Login</CardTitle>
            <CardDescription>Enter credentials to access your dashboard.</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="Mobile Number" 
                    value={phone} 
                    onChange={handlePhoneChange} 
                    required 
                    className="pl-10 h-14 rounded-xl text-lg tracking-widest"
                    maxLength={10}
                    inputMode="numeric"
                  />
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
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
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-4">
              <Button type="submit" className="w-full h-14 text-lg font-bold bg-[#0A2B70] hover:bg-[#0A2B70]/90 rounded-2xl" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Login"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <p className="text-center text-white/60 text-xs mt-8">
          © 2024 TGSRTC. Developed by Bingi Pradamesh.
        </p>
      </div>
    </div>
  );
}
