'use client';

import Link from 'next/link';
import { useEffect , useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Ticket, BookUser, ChevronRight, Database, BarChart3 , HelpCircle, Info , Bell, MessageSquare, Globe , User ,   LogOut } from 'lucide-react';
import Header from '@/app/components/header';
import AuthGuard from '@/app/components/AuthGuard';

export default function ConductorDashboardPage() { 

    const router = useRouter();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    useEffect(() => {
      const user = localStorage.getItem('currentUser');
      if (!user) {
        router.replace('/conductor/login');
      }
    }, [router]);

  const serviceLinks = [
    {
      href: '/conductor/ticket',
      title: 'Ticket Tools',
      description: 'Verify tickets, check fares, and view stats.',
      icon: <Ticket className="h-8 w-8 text-[#00B893]" />,
    },
    {
      href: '/conductor/bus-pass',
      title: 'Bus Pass Verification',
      description: 'Validate student and citizen bus passes.',
      icon: <BookUser className="h-8 w-8 text-[#0A2B70]" />,
    },
    {
      href: '/conductor/stats',
      title: 'Verification Insights',
      description: 'Real-time analytics for tickets and bus passes.',
      icon: <BarChart3 className="h-8 w-8 text-indigo-600" />,
    },
    // {
    //   href: '/conductor/pass-data',
    //   title: 'Sample Bus Pass Data',
    //   description: 'View pass codes for testing verification.',
    //   icon: <Database className="h-8 w-8 text-amber-500" />,
    // },
       { 
          href: '/help', 
          title: 'Help & FAQs', 
          description: 'Find answers to your questions.', 
          icon: <HelpCircle className="h-8 w-8 text-slate-500" />,
        },
        { 
          href: '/about', 
          title: 'About This App', 
          description: 'Learn more about this project.', 
          icon: <Info className="h-8 w-8 text-blue-500" />,
        },
  ];

  return (
    <AuthGuard>
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* <Header title="" showBackButton={false} /> */}
      
        <header className="bg-primary text-white p-4 flex items-center justify-between sticky top-0 z-50 shadow-sm h-16 w-full">
              <div className="flex items-center gap-3">
                <div className="bg-white p-1 rounded-sm shadow-inner">
                  <div className="w-8 h-8 flex flex-col items-center justify-center bg-red-600 text-white rounded-sm text-[5px] font-bold leading-none">
                    <span>TSRTC</span>
                    <span>GAMYAM</span>
                    <span className="text-[4px]">Track and Active</span>
                  </div>
                </div>
                <h1 className="text-xl font-bold tracking-wider font-headline uppercase">TGSRTC</h1>
              </div>
              <div className="flex items-center gap-4">
{/*For User  Icon to logout*/}  
        <div className="relative">
  <User
    className="h-5 w-5 cursor-pointer hover:opacity-80"
    onClick={() => setShowProfileMenu(!showProfileMenu)}
  />

  {showProfileMenu && (
    <div className="absolute right-0 top-8 w-64 bg-white rounded-2xl shadow-lg border overflow-hidden z-50">
      <div className="px-4 py-3 bg-gray-100">
        <h3 className="text-xl font-semibold text-gray-900">
          Account
        </h3>
      </div>

      <button
        onClick={() => {
          localStorage.removeItem('currentUser');
          localStorage.removeItem('sessionId');
          router.push('/conductor/login');
        }}
        className="w-full flex items-center gap-3 px-4 py-4 text-red-500 hover:bg-red-50 transition-colors"
      >
        <LogOut className="h-5 w-5" />
        <span className="font-semibold text-lg">Logout</span>
      </button>
    </div>
  )}
</div> {/*for user icon to logout*/}

                <Bell className="h-5 w-5 cursor-pointer hover:opacity-80" />
                <MessageSquare className="h-5 w-5 cursor-pointer hover:opacity-80" />
                <Globe className="h-5 w-5 cursor-pointer hover:opacity-80" />
              </div>
            </header>

      <main className="flex-grow flex flex-col items-center pt-12 p-4">
        <h1 className="text-2xl font-bold text-slate-900 mb-8 font-headline">Conductor Dashboard</h1>
        
        <div className="w-full max-w-2xl space-y-4">
          {serviceLinks.map((link) => (
            <Link href={link.href} key={link.title} className="group block no-underline">
              <Card className="hover:shadow-md transition-all border-slate-100 rounded-xl bg-white overflow-hidden">
                <CardHeader className="flex flex-row items-center gap-5 p-5">
                  <div className="p-3 bg-slate-50 rounded-xl shrink-0 group-hover:scale-110 transition-transform">
                    {link.icon}
                  </div>
                  <div className="flex-grow">
                    <CardTitle className="text-xl font-bold text-slate-900 mb-1">{link.title}</CardTitle>
                    <CardDescription className="text-sm font-medium text-slate-500">
                      {link.description}
                    </CardDescription>
                  </div>
                  <ChevronRight className="h-6 w-6 text-slate-300 group-hover:text-[#00B893] group-hover:translate-x-1 transition-all shrink-0" />
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
    </AuthGuard>
  );
}
