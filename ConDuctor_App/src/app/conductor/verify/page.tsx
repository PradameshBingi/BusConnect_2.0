
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import Header from '@/app/components/header';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils'; // Assuming cn is available for conditional class names
import ValidatedTicket from '@/app/components/validated-ticket'; // Corrected import path
import { TicketDetails } from '@/types/types'; // Assuming TicketDetails is defined here

interface TicketVerificationState {
  ticketCode: string;
  status: 'idle' | 'loading' | 'found' | 'not_found' | 'error';
  ticket: TicketDetails | null;
  justValidated: boolean;
  showPin: boolean;
}

export default function VerifyTicketPage() {
  const [ticketCode, setTicketCode] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'found' | 'not_found' | 'error'>('idle');
  const [ticket, setTicket] = useState<TicketDetails | null>(null);
  const [justValidated, setJustValidated] = useState<boolean>(false);
  const [showPin, setShowPin] = useState<boolean>(false);

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setTicket(null);
    setJustValidated(false);
    setShowPin(false);

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

      // Mock data for demonstration
      const mockTickets: Record<string, TicketDetails> = {
        'TKT-01-VALID1': { ticketId: 'TKT-01-VALID1', route: 'Secunderabad to Gachibowli', fare: 50.00, issuedAt: new Date().toISOString(), status: 'valid', busType: 'AC Deluxe', quantities: { Men: 1, Child: 0, Women: 0 }, totalFare: 50.00 },
        'TKT-01-EXPIRED': { ticketId: 'TKT-01-EXPIRED', route: 'Secunderabad to LB Nagar', fare: 30.00, issuedAt: new Date(Date.now() - 86400000).toISOString(), status: 'expired', busType: 'Non-AC', quantities: { Men: 1, Child: 0, Women: 0 }, totalFare: 30.00 },
        'TKT-01-USED': { ticketId: 'TKT-01-USED', route: 'Secunderabad to Ameerpet', fare: 40.00, issuedAt: new Date(Date.now() - 43200000).toISOString(), status: 'used', busType: 'AC', quantities: { Men: 1, Child: 0, Women: 0 }, totalFare: 40.00 },
        'TKT-01-CANCELLED': { ticketId: 'TKT-01-CANCELLED', route: 'Secunderabad to Kukatpally', fare: 45.00, issuedAt: new Date().toISOString(), status: 'cancelled', busType: 'AC Deluxe', quantities: { Men: 2, Child: 1, Women: 0 }, totalFare: 90.00 },
        'TKT-01-MIXED': { ticketId: 'TKT-01-MIXED', route: 'Secunderabad to Madhapur', fare: 55.00, issuedAt: new Date().toISOString(), status: 'valid', busType: 'AC', quantities: { Men: 1, Child: 1, Women: 1 }, totalFare: 100.00 }, // Example with multiple passenger types
      };

      const foundTicket = mockTickets[ticketCode.toUpperCase()];

      if (foundTicket) {
        setTicket(foundTicket);
        setStatus('found');
        if (foundTicket.status === 'valid') {
          setJustValidated(true); // Automatically set to true for valid tickets to show the validated view
          setShowPin(true); // Show the PIN for valid tickets
        } else {
          setJustValidated(false); // Do not show validated view for invalid tickets
          setShowPin(false);
        }
      } else {
        setStatus('not_found');
      }
    } catch (error) {
      console.error("Verification failed:", error);
      setStatus('error');
    }
  };

  const handlePinConfirmation = () => {
    // Logic to confirm PIN if needed, for now just toggle showPin
    setShowPin(false); // Assume PIN is confirmed or not needed for this flow
    setJustValidated(true); // Proceed to show the validated ticket after PIN confirmation
  };

  const handleBoardingValidation = () => {
    // Placeholder for actual boarding validation logic
    console.log("Boarding validated for ticket:", ticket?.ticketId);
    // Potentially update ticket status in the backend here
    setStatus('idle'); // Reset to idle after validation
    setTicket(null);
    setTicketCode('');
    setJustValidated(false);
    setShowPin(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header showBackButton={true} backHref="/conductor/ticket" title="Verify Ticket" />
      <div className="flex flex-col items-center p-4 space-y-4 flex-grow">
        {(status === 'idle' || status === 'not_found' || status === 'error') && (
          <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="font-headline uppercase tracking-tighter">Ticket Verification</CardTitle>
                <CardDescription>Enter code to check status of Ticket.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerification} className="grid gap-4">
                <Input 
                  placeholder="TKT-01-XXXXX" 
                  value={ticketCode} 
                  onChange={(e) => setTicketCode(e.target.value)} 
                  required 
                  className="uppercase h-14 text-xl font-mono tracking-widest" 
                />
                {status === 'error' && <p className="text-red-500 text-sm">Error during verification. Please try again.</p>}
                {status === 'not_found' && <p className="text-red-500 text-sm">Ticket not found. Please check the code and try again.</p>}
                <Button type="submit" variant="default" className="h-14 text-lg font-bold uppercase tracking-wider" disabled={status === 'loading'}>
                  {status === 'loading' ? 'Verifying...' : 'Verify Ticket'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {status === 'found' && ticket && (
          <div className="w-full max-w-md space-y-4 pb-32">
            {(ticket.status === 'used' || ticket.status === 'cancelled' || ticket.status === 'expired') && !justValidated ? (
                <Card className="overflow-hidden border-2">
                    <CardHeader className="text-center bg-slate-100 py-16">
                        <h1 className={cn("text-5xl font-black uppercase tracking-widest", 
                            ticket.status === 'used' ? "text-slate-400" : 
                            ticket.status === 'cancelled' ? "text-red-500" : "text-amber-500"
                        )}>
                            {ticket.status}
                        </h1>
                    </CardHeader>
                </Card>
            ) : justValidated ? (
                <ValidatedTicket ticket={ticket} /> // This is the line causing the error
            ) : (
                <Card className="overflow-hidden border-green-200 border-2 shadow-2xl">
                    <CardHeader className="text-center bg-green-500 text-white py-16">
                        <h1 className="text-5xl font-black uppercase tracking-widest">
                            {ticket.status}
                        </h1>
                    </CardHeader>
                </Card>
            )}
            
            {/* Conditionally show PIN confirmation and validation buttons */}
            {showPin && ticket.status === 'valid' && (
              <div className="flex flex-col items-center space-y-4">
                <p className="text-center text-lg text-slate-700 font-semibold">Please confirm the PIN displayed on the passenger's device.</p>
                {/* Placeholder for PIN input/confirmation */}
                <Button variant="default" onClick={handlePinConfirmation} className="w-full h-16 bg-green-600 hover:bg-green-700 text-lg font-bold uppercase tracking-wider">
                  Confirm PIN & Validate
                </Button>
              </div>
            )}

            {!showPin && ticket.status === 'valid' && justValidated && (
               <Button variant="outline" className="w-full h-16 font-black uppercase text-slate-500" onClick={handleBoardingValidation}>
                 VALIDATE BOARDING
               </Button>
            )}
                <Button variant="outline" className="w-full h-16 font-black uppercase text-slate-500" onClick={() => {setStatus('idle'); setTicketCode(''); setTicket(null); setShowPin(false); setJustValidated(false);}}>
                    Verify Next Ticket
                </Button>
          </div>
        )}
      </div>
    </div>
  );
}
