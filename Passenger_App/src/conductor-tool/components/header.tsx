'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, MessageSquare, Globe, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('conductorSession');
    router.replace('/login');
  };

  return (
    <header className="bg-[#16a34a] text-white p-4 flex items-center justify-between sticky top-0 z-50 shadow-sm h-16">
      <div className="flex items-center gap-3">
        <div className="bg-white p-1 rounded-sm shadow-inner shrink-0 border border-white/40">
          <div className="w-9 h-9 flex flex-col items-center justify-center bg-red-600 text-white rounded-sm text-[6px] font-bold leading-none">
            <span className="mb-0.5">TSRTC</span>
            <span className="mb-0.5">GAMYAM</span>
            <span className="text-[4px] scale-90">Track and Active</span>
          </div>
        </div>
        <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-wider font-headline uppercase leading-none">TGSRTC</h1>
            <span className="text-[8px] font-bold uppercase tracking-[0.2em] opacity-80">Conductor Tools</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-white hover:bg-white/10">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl">
            <DropdownMenuLabel>Staff Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer font-bold">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Bell className="h-5 w-5 cursor-pointer hover:opacity-80" />
        <MessageSquare className="h-5 w-5 cursor-pointer hover:opacity-80 hidden md:block" />
        <Globe className="h-5 w-5 cursor-pointer hover:opacity-80 hidden md:block" />
      </div>
    </header>
  );
}
