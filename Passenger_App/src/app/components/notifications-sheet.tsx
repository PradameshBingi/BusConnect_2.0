'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Bell, Info, Zap, Ticket, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const systemUpdates = [
  {
    id: 1,
    title: "Maha Lakshmi Scheme",
    description: "Women can now travel free of cost on City Ordinary and Metro Express buses. Standard fares apply for Metro Deluxe.",
    date: "Active Now",
    icon: <Info className="h-4 w-4 text-emerald-600" />,
    color: "bg-emerald-50",
    isNew: true
  },
  {
    id: 2,
    title: "Ticket Modification Live",
    description: "Changed your mind? You can now update your route or passenger count directly from the 'Modify Booking' portal.",
    date: "2 days ago",
    icon: <Ticket className="h-4 w-4 text-purple-600" />,
    color: "bg-purple-50",
    isNew: true
  },
  {
    id: 3,
    title: "100% Expiry Refunds",
    description: "Unused tickets that expire (10 mins after booking) now receive an automatic 100% refund to your cloud wallet.",
    date: "3 days ago",
    icon: <Zap className="h-4 w-4 text-amber-600" />,
    color: "bg-amber-50",
    isNew: false
  },
  {
    id: 4,
    title: "Auto-Deduct Wallet Feature",
    description: "Enable 'Auto Deduct for Conductor Use' in your wallet settings for faster fare adjustments during boarding.",
    date: "5 days ago",
    icon: <Wallet className="h-4 w-4 text-blue-600" />,
    color: "bg-blue-50",
    isNew: false
  }
];

export function NotificationsSheet({ children }: { children: React.ReactNode }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col rounded-l-3xl border-none shadow-2xl">
        <SheetHeader className="p-8 bg-slate-900 text-white rounded-tl-3xl">
          <div className="flex items-center gap-3">
             <div className="bg-primary/20 p-2 rounded-lg">
                <Bell className="h-6 w-6 text-primary" />
             </div>
             <div>
                <SheetTitle className="text-2xl font-black uppercase tracking-tight text-white">System Updates</SheetTitle>
                <SheetDescription className="text-slate-400">Stay informed about TGSRTC services.</SheetDescription>
             </div>
          </div>
        </SheetHeader>
        
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4">
            {systemUpdates.map((update) => (
              <div key={update.id} className="relative group">
                <div className={cn("p-5 rounded-2xl border border-slate-100 transition-all hover:shadow-md bg-white", update.isNew && "border-l-4 border-l-primary")}>
                  <div className="flex items-start gap-4">
                    <div className={cn("p-2 rounded-xl shrink-0", update.color)}>
                      {update.icon}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900 text-sm">{update.title}</h4>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{update.date}</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {update.description}
                      </p>
                      {update.isNew && (
                        <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-none text-[8px] font-black tracking-widest uppercase mt-2">New Update</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="py-12 text-center">
             <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">End of Updates</p>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
