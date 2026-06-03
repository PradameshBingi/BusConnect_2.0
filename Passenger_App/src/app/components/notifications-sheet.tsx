'use client';

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Bell, Info, Zap, Ticket, Wallet, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from 'date-fns';

type Notification = {
  _id: string;
  title: string;
  description: string;
  iconType: string;
  category: string;
  isLatest: boolean;
  createdAt: string;
};

const getIcon = (type: string) => {
  switch (type) {
    case 'ticket': return <Ticket className="h-4 w-4 text-purple-600" />;
    case 'zap': return <Zap className="h-4 w-4 text-emerald-600" />;
    case 'wallet': return <Wallet className="h-4 w-4 text-blue-600" />;
    default: return <Info className="h-4 w-4 text-slate-600" />;
  }
};

const getColorClass = (category: string) => {
  switch (category) {
    case 'purple': return 'bg-purple-50';
    case 'amber': return 'bg-amber-50';
    case 'blue': return 'bg-blue-50';
    case 'emerald': return 'bg-emerald-50';
    default: return 'bg-slate-50';
  }
};

const getBorderClass = (category: string) => {
  switch (category) {
    case 'purple': return 'border-l-purple-600';
    case 'amber': return 'border-l-amber-600';
    case 'blue': return 'border-l-blue-600';
    case 'emerald': return 'border-l-emerald-600';
    default: return 'border-l-primary';
  }
};

export function NotificationsSheet({ children, onOpen }: { children: React.ReactNode, onOpen?: () => void }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (e) {
      console.error("Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <Sheet onOpenChange={(open) => {
        if (open && onOpen) onOpen();
    }}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col rounded-l-3xl border-none shadow-2xl">
        <SheetHeader className="p-8 bg-slate-900 text-white rounded-tl-3xl">
          <div className="flex items-center gap-3">
             <div className="bg-primary/20 p-2 rounded-lg">
                <Bell className="h-6 w-6 text-primary" />
             </div>
             <div className="text-left">
                <SheetTitle className="text-2xl font-black uppercase tracking-tight text-white">System Updates</SheetTitle>
                <SheetDescription className="text-slate-400">Stay informed about TGSRTC services.</SheetDescription>
             </div>
          </div>
        </SheetHeader>
        
        <ScrollArea className="flex-1 p-6">
          {isLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground bg-slate-50 rounded-2xl border border-dashed">
              No new updates at this time.
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((update) => (
                <div key={update._id} className="relative group">
                  <div className={cn(
                    "p-5 rounded-2xl border border-slate-100 transition-all hover:shadow-md bg-white", 
                    update.isLatest && "border-l-4",
                    update.isLatest && getBorderClass(update.category)
                  )}>
                    <div className="flex items-start gap-4">
                      <div className={cn("p-2 rounded-xl shrink-0", getColorClass(update.category))}>
                        {getIcon(update.iconType)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-900 text-sm">{update.title}</h4>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest" suppressHydrationWarning>
                            {formatDistanceToNow(new Date(update.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          {update.description}
                        </p>
                        {update.isLatest && (
                          <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-none text-[8px] font-black tracking-widest uppercase mt-2">New Update</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="py-12 text-center">
             <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">End of Updates</p>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
