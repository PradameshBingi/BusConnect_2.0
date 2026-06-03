'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  Wallet, 
  CheckCircle2, 
  Loader2, 
  X,
  QrCode,
  SmartphoneNfc,
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

type PaymentMethod = 'UPI' | 'Card' | 'Netbanking' | 'Wallet';
type PaymentStatus = 'idle' | 'processing' | 'success';

interface SimulatedPaymentProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data?: any) => void;
  amount: number;
}

const processingSteps = [
  "Initializing secure connection...",
  "Authenticating payment details...",
  "Communicating with bank servers...",
  "Finalizing transaction..."
];

export function SimulatedPayment({ isOpen, onClose, onComplete, amount }: SimulatedPaymentProps) {
  const [method, setMethod] = useState<PaymentMethod>('UPI');
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [stepIndex, setStepIndex] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [useWallet, setUseWallet] = useState(false);

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
      } catch (e) {}
    };
    if (isOpen) fetchWallet();
  }, [isOpen]);

  useEffect(() => {
    if (status === 'processing') {
      const interval = setInterval(() => {
        setStepIndex((prev) => {
          if (prev >= processingSteps.length - 1) {
            clearInterval(interval);
            setTimeout(() => setStatus('success'), 800);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [status]);

  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => {
        const walletUsed = useWallet ? Math.min(amount, walletBalance) : 0;
        const digitalPaid = amount - walletUsed;
        onComplete({ walletUsed, digitalPaid });
        onClose();
        setStatus('idle');
        setStepIndex(0);
        setUseWallet(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [status, onComplete, onClose, useWallet, amount, walletBalance]);

  if (!isOpen) return null;

  const walletUsed = useWallet ? Math.min(amount, walletBalance) : 0;
  const digitalPaid = amount - walletUsed;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-auto md:h-[580px] max-h-[95vh]"
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2 rounded-full hover:bg-gray-100 bg-white/80"><X className="h-5 w-5" /></button>

        <div className="w-full md:w-56 bg-slate-50 border-r p-6 flex flex-col shrink-0 overflow-y-auto">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1"><ShieldCheck className="h-5 w-5 text-primary" /><span className="font-bold text-lg">SecurePay</span></div>
            <p className="text-[9px] text-slate-500 uppercase font-black tracking-[0.2em]">Gateway</p>
          </div>
          <nav className="space-y-1">
            <MethodTab active={method === 'UPI'} onClick={() => setMethod('UPI')} icon={<Smartphone className="h-4 w-4" />} label="UPI" />
            <MethodTab active={method === 'Card'} onClick={() => setMethod('Card')} icon={<CreditCard className="h-4 w-4" />} label="Cards" />
            <MethodTab active={method === 'Netbanking'} onClick={() => setMethod('Netbanking')} icon={<Building2 className="h-4 w-4" />} label="Netbanking" />
            <MethodTab active={method === 'Wallet'} onClick={() => setMethod('Wallet')} icon={<Wallet className="h-4 w-4" />} label="Wallets" />
          </nav>
        </div>

        <div className="flex-1 flex flex-col bg-white relative overflow-y-auto">
          <AnimatePresence mode="wait">
            {status === 'idle' && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col p-8">
                <div className="mb-6">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Rs. {amount.toFixed(2)}</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Order #TKT-{Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
                </div>

                <div className="flex-1 space-y-6">
                  {walletBalance > 0 && (
                    <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary p-2 rounded-lg text-white"><Wallet className="h-4 w-4" /></div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">Use App Wallet</p>
                          <p className="text-[9px] text-muted-foreground uppercase font-bold">Balance: Rs. {walletBalance.toFixed(2)}</p>
                        </div>
                      </div>
                      <Switch checked={useWallet} onCheckedChange={setUseWallet} />
                    </div>
                  )}

                  <div className="bg-slate-50 p-5 rounded-2xl space-y-2 border border-dashed border-slate-200">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase"><span>Subtotal:</span> <span>Rs. {amount}</span></div>
                    {useWallet && <div className="flex justify-between text-[10px] font-bold text-emerald-600 uppercase"><span>Wallet Applied:</span> <span>- Rs. {walletUsed}</span></div>}
                    <div className="flex justify-between font-black text-lg text-slate-800 pt-1 border-t border-slate-100"><span>Payable:</span> <span>Rs. {digitalPaid}</span></div>
                  </div>

                  {method === 'UPI' && <UPIDetails />}
                  {method === 'Card' && <CardDetails />}
                  {method === 'Wallet' && <div className="p-4 text-center text-xs text-muted-foreground italic bg-slate-50 rounded-xl">Selected External Wallet: Amazon Pay</div>}
                </div>

                <Button onClick={() => setStatus('processing')} className="w-full h-14 text-lg font-bold rounded-2xl bg-primary hover:bg-primary/90 mt-8 shadow-xl">
                  {digitalPaid > 0 ? `Pay Rs. ${digitalPaid.toFixed(2)}` : 'Confirm Wallet Payment'}
                </Button>
              </motion.div>
            )}

            {status === 'processing' && (
              <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-6">
                <div className="relative"><Loader2 className="h-20 w-20 text-primary animate-spin" /><div className="absolute inset-0 flex items-center justify-center"><SmartphoneNfc className="h-8 w-8 text-primary/40" /></div></div>
                <div><h3 className="text-xl font-bold mb-2">Processing Transaction</h3><p className="text-slate-400 text-xs italic">{processingSteps[stepIndex]}</p></div>
              </motion.div>
            )}

            {status === 'success' && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-6">
                <div className="bg-green-100 p-6 rounded-full animate-bounce"><CheckCircle2 className="h-16 w-16 text-green-600" /></div>
                <div><h3 className="text-2xl font-black text-slate-900 mb-2 uppercase">Payment Success</h3><p className="text-slate-500 font-medium">Generating your digital ticket...</p></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

function MethodTab({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all uppercase tracking-wider", active ? "bg-white text-primary shadow-sm border" : "text-slate-500 hover:bg-slate-100")}>
      <span className={cn(active ? "text-primary" : "text-slate-400")}>{icon}</span>{label}
    </button>
  );
}

function UPIDetails() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200">
        <QrCode className="h-24 w-24 text-slate-300 mb-2" /><p className="text-[9px] uppercase font-black text-slate-400 tracking-widest">Scan to Pay</p>
      </div>
      <div className="relative"><Input placeholder="user@upi" className="h-12 rounded-xl pl-10" /><Zap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" /></div>
    </div>
  );
}

function CardDetails() {
  return (
    <div className="space-y-3">
      <Input placeholder="Card Number" className="h-12 rounded-xl" />
      <div className="grid grid-cols-2 gap-3"><Input placeholder="MM/YY" className="h-12 rounded-xl" /><Input placeholder="CVV" type="password" className="h-12 rounded-xl" /></div>
      <Input placeholder="Holder Name" className="h-12 rounded-xl uppercase" />
    </div>
  );
}
