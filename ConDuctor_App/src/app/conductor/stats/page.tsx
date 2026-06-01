
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
  Ticket as TicketIcon,
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
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const calculateStats = () => {
    setIsLoading(true);
    try {
      const storedTickets: any[] = JSON.parse(localStorage.getItem('generatedTickets') || '[]');
      const verificationStats: any[] = JSON.parse(localStorage.getItem('conductorVerificationStats') || '[]');
      const passStats: any[] = JSON.parse(localStorage.getItem('conductorPassVerificationStats') || '[]');
      
      const mergedData = new Map<string, any>();
      storedTickets.forEach(t => {
        if (t.ticketCode) mergedData.set(t.ticketCode, t);
      });
      verificationStats.forEach(v => {
        if (v.ticketCode) {
          const existing = mergedData.get(v.ticketCode) || {};
          mergedData.set(v.ticketCode, { ...existing, ...v });
        }
      });

      const allUniqueTickets = Array.from(mergedData.values());
      
      let totalRevenue = 0;
      let totalMen = 0;
      let totalWomen = 0;
      let totalChildren = 0;
      const routeMap = new Map<string, number>();

      for (const item of allUniqueTickets) {
        totalRevenue += (item.totalFare || 0);
        totalMen += (item.quantities?.Men || 0);
        totalWomen += (item.quantities?.Women || 0);
        totalChildren += (item.quantities?.Child || 0);

        const routeKey = item.from && item.to ? `${item.from} ➔ ${item.to}` : "Unknown Route";
        if (routeKey !== "Unknown Route") {
          routeMap.set(routeKey, (routeMap.get(routeKey) || 0) + 1);
        }
      }

      const topRoutes = Array.from(routeMap.entries())
        .map(([route, bookings]) => ({ route, bookings }))
        .sort((a, b) => b.bookings - a.bookings)
        .slice(0, 5);

      let totalCollectedDifference = 0;
      for (const record of verificationStats) {
        if (record.fareDifference && record.fareDifference > 0) {
          totalCollectedDifference += record.fareDifference;
        }
      }

      // Bus Pass Breakdown
      const passBreakdown = {
        studentGeneral: passStats.filter(p => p.category === 'Student' && p.passType === 'General').length,
        studentRoute: passStats.filter(p => p.category === 'Student' && p.passType === 'Route').length,
        citizenGeneral: passStats.filter(p => p.category === 'Citizen' && p.passType === 'General').length,
        citizenRoute: passStats.filter(p => p.category === 'Citizen' && p.passType === 'Route').length,
      };

      setStats({
        totalTickets: allUniqueTickets.length,
        totalRevenue: Math.round(totalRevenue + totalCollectedDifference),
        totalMen,
        totalWomen,
        totalChildren,
        topRoutes,
        verifiedTickets: verificationStats.length,
        totalCollectedDifference: Math.round(totalCollectedDifference),
        totalPassesVerified: passStats.length,
        passBreakdown
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

  const hasData = stats && (stats.totalTickets > 0 || stats.verifiedTickets > 0 || stats.totalPassesVerified > 0);

  return (
    <AuthGuard>
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header showBackButton={true} backHref="/conductor/dashboard" title="Verification Insights" />
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 pb-32 flex-grow">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <BarChartIcon className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-headline">Conductor Insights</h1>
              <p className="text-sm text-muted-foreground">Analytics for tickets and verified bus passes.</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={calculateStats} disabled={isLoading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Refresh Data
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
            {/* Ticket Summary Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-l-4 border-l-blue-600">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tickets Verified</CardTitle>
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.verifiedTickets}</div>
                  <p className="text-[10px] text-muted-foreground mt-1">Validated during boarding</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-600">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Fare Revenue</CardTitle>
                  <IndianRupee className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Rs. {stats.totalRevenue.toLocaleString()}</div>
                  <p className="text-[10px] text-muted-foreground mt-1">Total digital + cash collected</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-indigo-600">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Passes Checked</CardTitle>
                  <BookUser className="h-4 w-4 text-indigo-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalPassesVerified}</div>
                  <p className="text-[10px] text-muted-foreground mt-1">Student & Citizen validations</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cash Difference</CardTitle>
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Rs. {stats.totalCollectedDifference.toLocaleString()}</div>
                  <p className="text-[10px] text-muted-foreground mt-1">Physical collections (Upgrades)</p>
                </CardContent>
              </Card>
            </div>

            {/* Bus Pass Breakdown Section */}
            <div className="grid gap-6 md:grid-cols-2">
               <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-[#0A2B70]" />
                    Student Pass Breakdown
                  </CardTitle>
                  <CardDescription>Verified student concessions by pass type.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                  <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                    <div>
                      <p className="font-bold text-slate-800">General Passes</p>
                      <p className="text-xs text-slate-500">Valid on all ordinary/metro express</p>
                    </div>
                    <span className="text-2xl font-bold text-blue-700">{stats.passBreakdown.studentGeneral}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                    <div>
                      <p className="font-bold text-slate-800">Route-Specific Passes</p>
                      <p className="text-xs text-slate-500">Valid on specific source-destination</p>
                    </div>
                    <span className="text-2xl font-bold text-indigo-700">{stats.passBreakdown.studentRoute}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Users className="h-5 w-5 text-amber-600" />
                    Citizen Pass Breakdown
                  </CardTitle>
                  <CardDescription>Verified citizen passes by pass type.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                  <div className="flex items-center justify-between p-4 bg-amber-50/50 rounded-xl border border-amber-100">
                    <div>
                      <p className="font-bold text-slate-800">General Passes</p>
                      <p className="text-xs text-slate-500">Standard citizen concession</p>
                    </div>
                    <span className="text-2xl font-bold text-amber-700">{stats.passBreakdown.citizenGeneral}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-orange-50/50 rounded-xl border border-orange-100">
                    <div>
                      <p className="font-bold text-slate-800">Route-Specific Passes</p>
                      <p className="text-xs text-slate-500">Regular commuter route passes</p>
                    </div>
                    <span className="text-2xl font-bold text-orange-700">{stats.passBreakdown.citizenRoute}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Top 5 Ticket Routes
                  </CardTitle>
                  <CardDescription>Routes with the highest ticket verification density.</CardDescription>
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
                            fontSize={10} 
                            tick={{ fill: 'currentColor' }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                          <Bar dataKey="bookings" radius={[0, 4, 4, 0]}>
                            {stats.topRoutes.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={`hsl(var(--primary) / ${1 - index * 0.15})`} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">No route data available yet.</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Passenger Load</CardTitle>
                  <CardDescription>verified travelers split.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-2">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-blue-600" />
                      <span className="font-bold text-slate-700">Men</span>
                    </div>
                    <span className="text-xl font-bold text-blue-700">{stats.totalMen}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <PersonStanding className="h-5 w-5 text-pink-600" />
                      <span className="font-bold text-slate-700">Women</span>
                    </div>
                    <span className="text-xl font-bold text-pink-700">{stats.totalWomen}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Baby className="h-5 w-5 text-amber-600" />
                      <span className="font-bold text-slate-700">Children</span>
                    </div>
                    <span className="text-xl font-bold text-amber-700">{stats.totalChildren}</span>
                  </div>

                  <div className="pt-4 border-t text-center">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-1">Total Headcount</p>
                    <p className="text-3xl font-bold text-primary">{stats.totalMen + stats.totalWomen + stats.totalChildren}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
           <Card className="max-w-md mx-auto">
            <CardContent className="p-12 text-center space-y-4">
              <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <BarChartIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg">No Statistics Available</h3>
                <p className="text-sm text-muted-foreground">Start verifying tickets or bus passes to see your analytics dashboard here.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div> </AuthGuard>
  );
}
