
'use client';

import AuthGuard from '@/app/components/AuthGuard';
import { useState, useEffect } from 'react';
import Header from '@/app/components/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  BarChart as BarChartIcon, 
  User, 
  Baby, 
  PersonStanding, 
  IndianRupee, 
  TrendingUp, 
  MapPin, 
  RefreshCw,
  CheckCircle,
  BookUser,
  GraduationCap,
  Users,
  Repeat
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type RouteStat = {
  route: string;
  bookings: number;
};

type PassBreakdown = {
  studentGeneral: number;
  studentRoute: number;
  citizenGeneral: number;
  citizenRoute: number;
};

type FullStats = {
  totalTickets: number;
  totalRevenue: number;
  totalMen: number;
  totalWomen: number;
  totalChildren: number;
  topRoutes: RouteStat[];
  verifiedTickets: number;
  totalPassesVerified: number;
  passBreakdown: PassBreakdown;
  boardingChanges: number;
};

export default function ConductorStatsPage() {
  const [stats, setStats] = useState<FullStats | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const calculateStats = async () => {
    setIsLoading(true);
    const conductorId = localStorage.getItem('conductorUser');
    if (!conductorId) return;

    try {
      // CLOUD SYNC: Fetch all verification logs from MongoDB
      const res = await fetch(`/api/conductor-logs?conductorId=${conductorId}`);
      const data = await res.json();
      const logs: any[] = data.logs || [];

      const ticketLogs = logs.filter(l => l.type === 'ticket');
      const passLogs = logs.filter(l => l.type === 'pass');

      let totalRevenue = 0;
      let totalMen = 0;
      let totalWomen = 0;
      let totalChildren = 0;
      let boardingChanges = 0;
      const routeMap = new Map<string, number>();

      ticketLogs.forEach(log => {
        const item = log.data;
        totalRevenue += (item.totalFare || 0);
        totalMen += (item.quantities?.Men || 0);
        totalWomen += (item.quantities?.Women || 0);
        totalChildren += (item.quantities?.Child || 0);
        if (item.boardingChanged) boardingChanges++;

        const routeKey = item.from && item.to ? `${item.from} ➔ ${item.to}` : "Unknown Route";
        if (routeKey !== "Unknown Route") {
          routeMap.set(routeKey, (routeMap.get(routeKey) || 0) + 1);
        }
      });

      const topRoutes = Array.from(routeMap.entries())
        .map(([route, bookings]) => ({ route, bookings }))
        .sort((a, b) => b.bookings - a.bookings)
        .slice(0, 5);

      const passBreakdown = {
        studentGeneral: passLogs.filter(p => p.data.category === 'Student' && p.data.passType === 'General').length,
        studentRoute: passLogs.filter(p => p.data.category === 'Student' && p.data.passType === 'Route').length,
        citizenGeneral: passLogs.filter(p => p.data.category === 'Citizen' && p.data.passType === 'General').length,
        citizenRoute: passLogs.filter(p => p.data.category === 'Citizen' && p.data.passType === 'Route').length,
      };

      setStats({
        totalTickets: ticketLogs.length,
        totalRevenue: Math.round(totalRevenue),
        totalMen,
        totalWomen,
        totalChildren,
        topRoutes,
        verifiedTickets: ticketLogs.length,
        totalPassesVerified: passLogs.length,
        passBreakdown,
        boardingChanges
      });
    } catch (error) {
      console.error("Failed to load conductor stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsClient(true);
    calculateStats();
  }, []);

  if (!isClient) return null;

  const chartConfig = {
    bookings: {
      label: "Bookings",
      color: "hsl(var(--primary))",
    },
  };

  const hasData = stats && (stats.totalTickets > 0 || stats.totalPassesVerified > 0);

  return (
    <AuthGuard>
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header showBackButton={true} backHref="/" title="Verification Insights" />
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 pb-32 flex-grow">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <BarChartIcon className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-black font-headline uppercase tracking-tight">Conductor Insights</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time Cloud Sync Statistics</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={calculateStats} disabled={isLoading} className="rounded-xl h-10 border-slate-200">
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Sync Cloud Data
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}><CardContent className="p-6 space-y-2"><Skeleton className="h-4 w-2/3"/><Skeleton className="h-8 w-1/2"/></CardContent></Card>
            ))}
          </div>
        ) : hasData ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-l-4 border-l-blue-600 rounded-2xl shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Tickets Verified</CardTitle>
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-black">{stats.verifiedTickets}</div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Confirmed Boardings</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-600 rounded-2xl shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Fare Revenue</CardTitle>
                  <IndianRupee className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-black">₹{stats.totalRevenue.toLocaleString()}</div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Adjusted Digital Collection</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-indigo-600 rounded-2xl shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Passes Checked</CardTitle>
                  <BookUser className="h-4 w-4 text-indigo-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-black">{stats.totalPassesVerified}</div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Concessions Validated</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500 rounded-2xl shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Service Adjust</CardTitle>
                  <Repeat className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-black">{stats.boardingChanges}</div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Category Transfers</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
               <Card className="rounded-3xl shadow-sm border-none bg-white overflow-hidden">
                <CardHeader className="bg-slate-50 border-b">
                  <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-[#0A2B70]" />
                    Student Verification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                    <div>
                      <p className="font-black text-xs text-slate-800 uppercase">General Passes</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Ordinary/Express Access</p>
                    </div>
                    <span className="text-2xl font-black text-blue-700">{stats.passBreakdown.studentGeneral}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                    <div>
                      <p className="font-black text-xs text-slate-800 uppercase">Route Passes</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Start-End Validation</p>
                    </div>
                    <span className="text-2xl font-black text-indigo-700">{stats.passBreakdown.studentRoute}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl shadow-sm border-none bg-white overflow-hidden">
                <CardHeader className="bg-slate-50 border-b">
                  <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                    <Users className="h-5 w-5 text-amber-600" />
                    Citizen Verification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="flex items-center justify-between p-4 bg-amber-50/50 rounded-2xl border border-amber-100">
                    <div>
                      <p className="font-black text-xs text-slate-800 uppercase">Standard Citizens</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Regular Concessions</p>
                    </div>
                    <span className="text-2xl font-black text-amber-700">{stats.passBreakdown.citizenGeneral}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-orange-50/50 rounded-2xl border border-orange-100">
                    <div>
                      <p className="font-black text-xs text-slate-800 uppercase">Commuter Route</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Daily Path Validation</p>
                    </div>
                    <span className="text-2xl font-black text-orange-700">{stats.passBreakdown.citizenRoute}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2 rounded-3xl shadow-sm border-none bg-white">
                <CardHeader>
                  <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Busiest Route Segments
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] pt-4">
                  {stats.topRoutes.length > 0 ? (
                    <ChartContainer config={chartConfig}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.topRoutes} layout="vertical" margin={{ left: 40, right: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                          <XAxis type="number" hide />
                          <YAxis 
                            dataKey="route" 
                            type="category" 
                            width={120} 
                            fontSize={9} 
                            tick={{ fill: 'currentColor', fontWeight: 'bold' }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                          <Bar dataKey="bookings" radius={[0, 8, 8, 0]}>
                            {stats.topRoutes.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={`hsl(var(--primary) / ${1 - index * 0.15})`} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 text-xs font-bold uppercase tracking-widest">No verification data on routes.</div>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-3xl shadow-sm border-none bg-white">
                <CardHeader>
                  <CardTitle className="text-sm font-black uppercase tracking-widest">Passenger Load</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-2">
                  <div className="flex items-center justify-between p-3 bg-blue-50/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-blue-600" />
                      <span className="font-bold text-xs uppercase text-slate-700">Men</span>
                    </div>
                    <span className="text-xl font-black text-blue-700">{stats.totalMen}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-pink-50/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <PersonStanding className="h-5 w-5 text-pink-600" />
                      <span className="font-bold text-xs uppercase text-slate-700">Women</span>
                    </div>
                    <span className="text-xl font-black text-pink-700">{stats.totalWomen}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-amber-50/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Baby className="h-5 w-5 text-amber-600" />
                      <span className="font-bold text-xs uppercase text-slate-700">Children</span>
                    </div>
                    <span className="text-xl font-black text-amber-700">{stats.totalChildren}</span>
                  </div>

                  <div className="pt-6 border-t text-center">
                    <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1">Total Headcount</p>
                    <p className="text-4xl font-black text-[#00B893] tracking-tighter">{stats.totalMen + stats.totalWomen + stats.totalChildren}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
           <Card className="max-w-md mx-auto rounded-3xl border-none shadow-sm">
            <CardContent className="p-12 text-center space-y-4">
              <div className="bg-slate-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto">
                <BarChartIcon className="h-8 w-8 text-slate-200" />
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-xs uppercase tracking-widest">No Cloud Data Available</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed">Verified tickets and passes will appear here after cloud sync.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div> </AuthGuard>
  );
}
