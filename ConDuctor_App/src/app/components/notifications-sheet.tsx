
'use client';

import { useState, useEffect } from 'react';
import { Ticket, Zap, Wallet, Info, Clock, Loader2, Bell, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import * as SheetPrimitive from "@radix-ui/react-dialog";

interface Notification {
  _id: string;
  title: string;
  description: string;
  iconType: string;
  category: string;
  createdAt: string;
}

export function NotificationsSheet({ trigger, onOpen }: { trigger: React.ReactNode, onOpen: () => void }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error("Failed to load conductor alerts");
    } finally {
      setIsLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'ticket': return <Ticket className="h-5 w-5" />;
      case 'zap': return <Zap className="h-5 w-5" />;
      case 'wallet': return <Wallet className="h-5 w-5" />;
      default: return <Info className="h-5 w-5" />;
    }
  };

  const getRelativeTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleOpen = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      onOpen();
      fetchNotifications();
    }
  };

  return (
    <SheetPrimitive.Root open={isOpen} onOpenChange={handleOpen}>
      <SheetPrimitive.Trigger asChild>{trigger}</SheetPrimitive.Trigger>
      <SheetPrimitive.Portal>
        <SheetPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] transition-all" />
        <SheetPrimitive.Content className="fixed inset-y-0 right-0 z-50 w-full max-w-sm h-full bg-slate-50 shadow-2xl border-l flex flex-col outline-none animate-in slide-in-from-right duration-300">
          <div className="p-6 bg-[#00B893] text-white flex justify-between items-center shrink-0">
            <div className="space-y-1">
              <h2 className="text-xl font-black uppercase tracking-tight">Staff Alerts</h2>
              <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Operational Updates</p>
            </div>
            <SheetPrimitive.Close className="rounded-full bg-white/20 p-2 hover:bg-white/30 transition-colors">
              <X className="h-5 w-5" />
            </SheetPrimitive.Close>
          </div>

          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-[#00B893]" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Alerts...</p>
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((notif) => (
                <div key={notif._id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className={`p-2.5 rounded-xl bg-${notif.category}-50 text-${notif.category}-600`}>
                      {getIcon(notif.iconType)}
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      <Clock className="h-2.5 w-2.5" />
                      {getRelativeTime(notif.createdAt)}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-900 leading-tight mb-1">{notif.title}</h3>
                    <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase tracking-wider">{notif.description}</p>
                  </div>
                  <div className="pt-2">
                     <Badge variant="outline" className={`text-[8px] font-black uppercase text-${notif.category}-600 border-${notif.category}-100 bg-${notif.category}-50/50`}>
                        {notif.category}
                     </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 space-y-4">
                 <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                    <Bell className="h-8 w-8 text-slate-300" />
                 </div>
                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No Alerts Available</p>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t text-center shrink-0">
             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em]">TGSRTC Operational Control</p>
          </div>
        </SheetPrimitive.Content>
      </SheetPrimitive.Portal>
    </SheetPrimitive.Root>
  );
}
