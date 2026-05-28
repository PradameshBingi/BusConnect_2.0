'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Search, Loader2, CheckCircle, XCircle, ChevronDown } from 'lucide-react';
import { routes } from '@/lib/routes';
import { ValidatedTicket } from '@/app/components/validated-ticket';

type TicketDetails = {
  ticketCode: string;
  from: string;
  to: string;
  totalFare: number;
  timestamp: string; 
  status: 'valid' | 'expired' | 'used' | 'cancelled';
  busType: string;
  passengers: string;
  securityCode: string;
};

const UNIVERSAL_TICKET: TicketDetails = {
    ticketCode: "TKT-00-00000",
    from: "Universal Start",
    to: "Universal End",
    totalFare: 100.00,
    timestamp: new Date().toISOString(),
    status: 'valid',
    busType: "express",
    passengers: "1 Adult",
    securityCode: "XYZ123"
};

export default function TicketVerifierPage() {
  const [routeNo, setRouteNo] = useState('');
  const [ticketDigits, setTicketDigits] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TicketDetails | string | null>(null);
  const [isRouteSelectorOpen, setRouteSelectorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleVerify = async () => {
    if (!routeNo || ticketDigits.length !== 5) {
        setResult('Please select a route and enter a 5-digit ticket code.');
        return;
    }
    
    const fullTicketCode = `TKT-${routeNo}-${ticketDigits}`;
    setIsLoading(true);
    setResult(null);

    if (fullTicketCode.toUpperCase() === UNIVERSAL_TICKET.ticketCode) {
        setTimeout(() => {
            setResult({ ...UNIVERSAL_TICKET, status: 'used' });
            setIsLoading(false);
        }, 1000);
        return;
    }

    try {
      const res = await fetch(`/api/verify-ticket/${fullTicketCode}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setResult(data.ticket);
    } catch (error: any) {
      if (error.message.includes('not found')) {
        setResult('Invalid ticket code. Please double-check and try again.');
      } else if (error.message.includes('fetch')) {
        setResult('Network error. Please check your connection and try again.');
      } else {
        setResult(error.message || 'An unknown error occurred during verification.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const filteredRoutes = useMemo(() => {
    return routes.filter(route => 
      route.routeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.routeNo.includes(searchQuery)
    );
  }, [searchQuery]);

  return (
    <div className="p-4 md:p-6 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-6 w-6" />
            Verify Passenger Ticket
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2">
            <span className="text-lg font-semibold text-muted-foreground pb-2">TKT-</span>
            <div className="h-10">
                <label className="text-sm font-medium">Route</label>
                <Button variant="outline" className="w-24 justify-between h-10" onClick={() => setRouteSelectorOpen(true)}>
                    {routeNo || "Select"} <ChevronDown className="h-4 w-4"/>
                </Button>
            </div>
            <div className="flex-grow h-10">
                <label htmlFor="ticket-digits" className="text-sm font-medium">Ticket Code</label>
                <input
                    id="ticket-digits"
                    type="text"
                    value={ticketDigits}
                    onChange={(e) => {
                        const digits = e.target.value.replace(/[^0-9]/g, '');
                        if (digits.length <= 5) {
                            setTicketDigits(digits);
                        }
                    }}
                    placeholder="5 digits"
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
            </div>
          </div>
          <Button onClick={handleVerify} disabled={isLoading || !routeNo || ticketDigits.length !== 5} className="w-full mt-4 h-12 text-lg">
            {isLoading ? <Loader2 className="animate-spin" /> : 'Verify Ticket'}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <div className="mt-6">
          {typeof result === 'string' ? (
            <Card className="border-destructive bg-destructive/5 text-destructive">
              <CardContent className="p-4 flex items-center gap-4">
                <XCircle className="h-8 w-8" />
                <p className="font-bold text-lg">{result}</p>
              </CardContent>
            </Card>
          ) : (
              <ValidatedTicket ticket={result} />
          )}
        </div>
      )}

      <Dialog open={isRouteSelectorOpen} onOpenChange={setRouteSelectorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Bus Route</DialogTitle>
            <DialogDescription>Search for a route number or name.</DialogDescription>
          </DialogHeader>
          <Command>
            <CommandInput 
              placeholder="Search routes..." 
              value={searchQuery}
              onValueChange={setSearchQuery} />
            <CommandEmpty>No routes found.</CommandEmpty>
            <CommandGroup className="max-h-60 overflow-y-auto">
              {filteredRoutes.map((route) => (
                <CommandItem
                  key={route.routeNo}
                  onSelect={() => {
                    setRouteNo(route.routeNo);
                    setRouteSelectorOpen(false);
                    setSearchQuery('');
                  }}
                >
                  <span className="font-bold w-12">{route.routeNo}</span>
                  <span>{route.routeName}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </DialogContent>
      </Dialog>
    </div>
  );
}
