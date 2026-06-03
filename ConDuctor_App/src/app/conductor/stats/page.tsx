
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
  Users
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
  totalCollectedDifference: number;
  totalPassesVerified: number;
  passBreakdown: PassBreakdown;
};

export default function ConductorStatsPage() {
  const [stats, setStats] = useState<FullStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const calculateStats = async () => {
    setIsLoading(true);
    const conductorId = localStorage.getItem('currentUser');
    if (!conductorId) return;

    try {
      const res = await fetch(`/api/conductor-logs?conductorId=${conductorId}`);
      const data = await res.json();
      const logs: any[] = data.logs || [];

      const ticketLogs = logs.filter(l => l.type === 'ticket');
      const passLogs = logs.filter(l => l.type === 'pass');

      let totalRevenue = 0;
      let totalCollectedDifference = 0;
      let totalMen = 0;
      let totalWomen = 0;
      let totalChildren = 0;
      const routeMap = new Map<string, number>();

      ticketLogs.forEach(log => {
        const item = log.data;
        totalRevenue += (item.totalFare || 0);
        if (item.boardingChanged) {
            const diff = (item.totalFare || 0) - (item.originalFare || 0);
            if (diff > 0) totalCollectedDifference += diff;
        }
        totalMen += (item.quantities?.Men || 0);
        totalWomen += (item.quantities?.Women || 0);
        totalChildren += (item.quantities?.Child || 0);

        const routeKey = item.from && item.to ? `${item.from} → ${item.to}` : "Unknown Route";
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
        totalCollectedDifference: Math.round(totalCollectedDifference),
        totalPassesVerified: passLogs.length,
        passBreakdown
      });
    } catch (error) {
      console.error("Failed to load conductor stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    calculateStats();
  }, []);

  const chartConfig = {
    bookings: {
      label: "Bookings",
      color: "#00B893",
    },
  };

  return (
    <AuthGuard>
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header showBackButton={true} backHref="/conductor/dashboard" title="Verification Insights" />
      <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6 pb-28">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-50 p-1.5 rounded-md">
              <BarChartIcon className="h-6 w-6 text-[#00B893]" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 leading-none">Conductor Insights</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Analytics for tickets and verified bus passes.</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={calculateStats} disabled={isLoading} className="h-8 text-[10px] font-bold uppercase rounded-lg border-slate-200">
            <RefreshCw className={cn("h-3 w-3 mr-1.5", isLoading && "animate-spin")} />
            Refresh Data
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : (
          <>
            {/* Top 4 Insight Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-none shadow-sm border-l-4 border-l-blue-500 rounded-xl overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Tickets Verified</p>
                    <CheckCircle className="h-3.5 w-3.5 text-blue-500" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 leading-none">{stats?.verifiedTickets || 0}</h2>
                  <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase">Validated during boarding</p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm border-l-4 border-l-emerald-500 rounded-xl overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Fare Revenue</p>
                    <IndianRupee className="h-3.5 w-3.5 text-emerald-500" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 leading-none">Rs. {stats?.totalRevenue || 0}</h2>
                  <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase">Total digital + cash collected</p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm border-l-4 border-l-indigo-500 rounded-xl overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Passes Checked</p>
                    <BookUser className="h-3.5 w-3.5 text-indigo-500" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 leading-none">{stats?.totalPassesVerified || 0}</h2>
                  <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase">Student & Citizen validations</p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm border-l-4 border-l-orange-500 rounded-xl overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Cash Difference</p>
                    <TrendingUp className="h-3.5 w-3.5 text-orange-500" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 leading-none">Rs. {stats?.totalCollectedDifference || 0}</h2>
                  <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase">Physical collections (Upgrades)</p>
                </CardContent>
              </Card>
            </div>

            {/* Breakdown Cards */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-none shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="p-4 pb-0">
                  <CardTitle className="text-sm font-black flex items-center gap-2 uppercase text-slate-800">
                    <GraduationCap className="h-4 w-4 text-slate-600" />
                    Student Pass Breakdown
                  </CardTitle>
                  <CardDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Verified student concessions by pass type.</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-6 space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50/50 rounded-lg border border-slate-100">
                    <div>
                      <p className="font-black text-xs text-slate-800">General Passes</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Valid on all ordinary/metro express</p>
                    </div>
                    <span className="text-xl font-black text-blue-700">{stats?.passBreakdown.studentGeneral || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50/50 rounded-lg border border-slate-100">
                    <div>
                      <p className="font-black text-xs text-slate-800">Route-Specific Passes</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Valid on specific source-destination</p>
                    </div>
                    <span className="text-xl font-black text-blue-700">{stats?.passBreakdown.studentRoute || 0}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="p-4 pb-0">
                  <CardTitle className="text-sm font-black flex items-center gap-2 uppercase text-slate-800">
                    <Users className="h-4 w-4 text-orange-500" />
                    Citizen Pass Breakdown
                  </CardTitle>
                  <CardDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Verified citizen passes by pass type.</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-6 space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50/50 rounded-lg border border-slate-100">
                    <div>
                      <p className="font-black text-xs text-slate-800">General Passes</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Standard citizen concession</p>
                    </div>
                    <span className="text-xl font-black text-orange-700">{stats?.passBreakdown.citizenGeneral || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50/50 rounded-lg border border-slate-100">
                    <div>
                      <p className="font-black text-xs text-slate-800">Route-Specific Passes</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Regular commuter route passes</p>
                    </div>
                    <span className="text-xl font-black text-orange-700">{stats?.passBreakdown.citizenRoute || 0}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bottom Row */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="md:col-span-2 border-none shadow-sm rounded-xl">
                <CardHeader className="p-4">
                  <CardTitle className="text-xs font-black uppercase text-slate-800 flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-[#00B893]" />
                    Top 5 Ticket Routes
                  </CardTitle>
                  <CardDescription className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Routes with the highest ticket verification density.</CardDescription>
                </CardHeader>
                <CardContent className="h-[280px] p-4">
                  {stats?.topRoutes && stats.topRoutes.length > 0 ? (
                    <ChartContainer config={chartConfig}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.topRoutes} layout="vertical" margin={{ left: 60, right: 30, top: 10, bottom: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                          <XAxis type="number" hide />
                          <YAxis 
                            dataKey="route" 
                            type="category" 
                            width={130} 
                            fontSize={7} 
                            tick={{ fill: '#64748b', fontWeight: 'bold' }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                          <Bar dataKey="bookings" radius={[0, 4, 4, 0]} fill="#00B893" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-[9px] font-bold text-slate-300 uppercase tracking-widest">No verification data.</div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm rounded-xl">
                <CardHeader className="p-4">
                  <CardTitle className="text-xs font-black uppercase text-slate-800">Passenger Load</CardTitle>
                  <CardDescription className="text-[9px] font-bold text-slate-400 uppercase">verified travelers split.</CardDescription>
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded-md">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-500" />
                      <span className="font-bold text-[10px] uppercase text-slate-600">Men</span>
                    </div>
                    <span className="font-black text-blue-600">{stats?.totalMen || 0}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-pink-50 rounded-md">
                    <div className="flex items-center gap-2">
                      <PersonStanding className="h-4 w-4 text-pink-500" />
                      <span className="font-bold text-[10px] uppercase text-slate-600">Women</span>
                    </div>
                    <span className="font-black text-pink-600">{stats?.totalWomen || 0}</span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-amber-50 rounded-md">
                    <div className="flex items-center gap-2">
                      <Baby className="h-4 w-4 text-amber-500" />
                      <span className="font-bold text-[10px] uppercase text-slate-600">Children</span>
                    </div>
                    <span className="font-black text-amber-600">{stats?.totalChildren || 0}</span>
                  </div>

                  <div className="pt-4 border-t border-dashed mt-4 text-center">
                    <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest mb-1">Total Headcount</p>
                    <p className="text-2xl font-black text-[#00B893] tracking-tighter">{(stats?.totalMen || 0) + (stats?.totalWomen || 0) + (stats?.totalChildren || 0)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
    </AuthGuard>
  );
}
