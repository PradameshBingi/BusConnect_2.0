'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/app/components/header';
import { ValidatedTicket } from '@/app/components/validated-ticket';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Define TicketDetails type based on localStorage structure
type TicketDetails = {
  ticketCode: string;
  from: string;
  to: string;
  totalFare: number;
  createdAt: string;
  status: 'valid' | 'expired' | 'used' | 'cancelled';
  busType: string;
  passengers: string;
};

export default function TicketPage() {
  const params = useParams();
  const ticketCode = params?.id as string;
  const [ticket, setTicket] = useState<TicketDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (ticketCode) {
      const storedTickets: TicketDetails[] = JSON.parse(localStorage.getItem('generatedTickets') || '[]');
      const foundTicket = storedTickets.find(t => t.ticketCode === ticketCode);
      setTicket(foundTicket || null);
    }
    setIsLoading(false);
  }, [ticketCode]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <>
        <Header showBackButton backHref="/booking-history" title="Ticket Not Found" />
        <div className="p-8 text-center">
          <p>The requested ticket could not be found.</p>
        </div>
      </>
    );
  }

  // If ticket is used, show the detailed pink ticket
  if (ticket.status === 'used') {
    // The ValidatedTicket component expects `timestamp` so we map `createdAt` to it.
    const validatedTicketProps = {
        ...ticket,
        timestamp: ticket.createdAt,
    };
    return (
        <>
            <Header showBackButton backHref="/booking-history" title="Validated Ticket" />
            <div className="p-4 md:p-8">
                <ValidatedTicket ticket={validatedTicketProps} />
            </div>
        </>
    );
  }

  // Otherwise, show a summary of the ticket status
  return (
    <>
      <Header showBackButton backHref="/booking-history" title="Ticket Status" />
      <div className="p-4 md:p-8 max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className='flex justify-between items-center'>
              <span>{ticket.ticketCode}</span>
              <Badge className={cn("capitalize font-bold px-3 py-1 text-white border-transparent", {
                  "bg-green-600": ticket.status === 'valid',
                  "bg-yellow-500": ticket.status === 'expired',
                  "bg-red-600": ticket.status === 'cancelled',
              })}>
                  {ticket.status}
              </Badge>
            </CardTitle>
            <CardDescription>{new Date(ticket.createdAt).toLocaleString()}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between font-bold text-lg">
              <p>{ticket.from}</p>
              <p>&rarr;</p>
              <p>{ticket.to}</p>
            </div>
            <div className="mt-4">
              <p><strong>Total Fare:</strong> Rs. {ticket.totalFare.toFixed(2)}</p>
              <p><strong>Passengers:</strong> {ticket.passengers}</p>
              <p><strong>Bus Type:</strong> {ticket.busType}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
