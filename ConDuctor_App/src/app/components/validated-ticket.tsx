
'use client';

import React from 'react';
import { Separator } from '@/components/ui/separator';
import { Bus } from 'lucide-react';
import { TicketDetails } from '@/types/types'; // Assuming TicketDetails is defined in types/types.ts

interface ValidatedTicketProps {
  ticket: TicketDetails;
}

const ValidatedTicket: React.FC<ValidatedTicketProps> = ({ ticket }) => {
  const issuedAt = ticket.issuedAt ? new Date(ticket.issuedAt) : new Date();

  const formattedTime = issuedAt instanceof Date && !isNaN(issuedAt.getTime())
    ? issuedAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    : new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  // Randomized metadata for thermal receipt look
  const serviceNumber = "MEAB" + (Math.floor(10 + Math.random() * 90));
  const tripNumber = Math.floor(1 + Math.random() * 9);
  const depot = "Secunderabad Depot";
  const cnd = "645204";
  const drv = "DSMEAB10";
  const bus = "TS11UA8072";
  const etimNo = "I062300078";
  const waybill = "60844754";
  const helpline = "040 69440000";

  const isDeluxe = ticket.busType?.toLowerCase().includes('deluxe');
  const qty = ticket.quantities || { Men: 1, Child: 0, Women: 0 };
  
  // Strict whole-number fare calculation
  const totalWeight = qty.Men + (isDeluxe ? qty.Women : 0) + (qty.Child * 0.5);
  const adultFareWhole = totalWeight > 0 ? Math.round(ticket.totalFare / totalWeight) : 0;
  
  const getCategoryFareWhole = (type: string) => {
    if (type === 'Men') return adultFareWhole;
    if (type === 'Women') return isDeluxe ? adultFareWhole : 0;
    if (type === 'Child') return Math.round(adultFareWhole * 0.5);
    return 0; // Default case
  };

  // Determine ticket status for display
  const getTicketStatus = () => {
    // For a 'pink ticket' indicating validation, we'll assume it's always 'Valid' status here.
    // If you have a specific status that should trigger the 'pink' design, adjust this.
    // For this example, we'll explicitly set it to 'VALID' to ensure the pink theme.
    return "VALID"; 
  };

  const ticketStatus = getTicketStatus();

  return (
    <div className={`p-4 shadow-lg rounded-lg max-w-xs mx-auto bg-pink-50 border-2 border-pink-300 font-sans`}>
      {/* Header Section */}
      <div className="text-center pb-3 border-b border-pink-300">
        <h1 className="text-xl font-extrabold uppercase text-pink-800 tracking-wider flex items-center justify-center gap-2">
          <Bus className="h-7 w-7" />
          {serviceNumber}
        </h1>
        <p className="text-xs font-medium text-pink-700 uppercase tracking-[0.1em]">Route: {ticket.route || 'N/A'}</p>
        <p className="text-[10px] font-medium text-pink-600 mt-1">Depot: {depot} | Trip: {tripNumber}</p>
      </div>

      {/* Passenger & Fare Details */}
      <div className="py-3 border-b border-pink-300">
        <p className="text-[10px] font-bold text-pink-800 tracking-[0.1em] uppercase mb-1">Passenger Details</p>
        <div className="flex justify-between items-center mb-2">
          <p className="text-xs font-medium text-pink-700">Ticket ID: <span className="font-bold text-pink-900">{ticket.ticketId || 'N/A'}</span></p>
          <p className="text-xs font-medium text-pink-700">Time: <span className="font-bold text-pink-900">{formattedTime}</span></p>
        </div>
        {/* Displaying fare breakdown */}
        <div className="text-xs font-medium text-pink-700 space-y-0.5">
          <span>Fare: {ticket.totalFare.toFixed(2)}</span>
          {qty.Men > 0 && <p className="ml-4"> - Adult x {qty.Men}: ₹{getCategoryFareWhole('Men').toFixed(2)}</p>}
          {qty.Women > 0 && isDeluxe && <p className="ml-4"> - Women x {qty.Women}: ₹{getCategoryFareWhole('Women').toFixed(2)}</p>}
          {qty.Child > 0 && <p className="ml-4"> - Child x {qty.Child}: ₹{getCategoryFareWhole('Child').toFixed(2)}</p>}
        </div>
      </div>

      {/* Metadata Section */}
      <div className="py-3 text-xs font-medium text-pink-700 space-y-0.5">
        <p>Conductor: {cnd} | Driver: {drv}</p>
        <p>Bus No: {bus}</p>
        <p>E-Ticket No: {etimNo} | Waybill: {waybill}</p>
      </div>
      
      {/* Status Footer */}
      <div className="pt-3 text-center">
         <p className="text-[10px] font-bold uppercase text-pink-800 tracking-[0.2em] mb-1">Status</p>
        <p className={`text-xl font-black uppercase tracking-tight ${
            ticketStatus === 'VALID' ? 'text-pink-900' : 
            ticketStatus === 'EXPIRED' ? 'text-gray-500' : 
            ticketStatus === 'USED' ? 'text-orange-600' : 
            'text-red-600'
          }`}>
          {ticketStatus}
        </p>
      </div>

       {/* Helpline */}
       <div className="border-t border-pink-300 mt-3 pt-2 text-center">
         <p className="text-[10px] text-pink-600 uppercase tracking-tighter">Helpline: {helpline}</p>
       </div>
    </div>
  );
};

export default ValidatedTicket;
