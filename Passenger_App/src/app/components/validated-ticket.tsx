'use client';

import { useMemo } from 'react';
import { hyderabadLocalities } from '@/lib/locations';

interface Ticket {
  ticketCode: string;
  from: string;
  to: string;
  timestamp: string; 
  passengers: string;
  totalFare: number;
  busType: string;
  quantities?: { Men: number, Child: number, Women: number };
}

interface ValidatedTicketProps {
  ticket: Ticket;
}

const TicketWatermark = () => (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.06] pointer-events-none z-0">
        <div className="w-56 h-56 rounded-full border-[6px] border-red-600 flex flex-col items-center justify-center text-red-600 font-bold">
            <div className="text-xl tracking-tighter">TGSRTC</div>
            <div className="border-t-2 border-b-2 border-red-600 py-1 w-full text-center text-[12px] font-black">HYDERABAD</div>
            <div className="text-[10px] mt-1">CITY SERVICE</div>
        </div>
    </div>
);

export function ValidatedTicket({ ticket }: ValidatedTicketProps) {
  const issuedAt = useMemo(() => {
    const d = new Date(ticket.timestamp);
    return isNaN(d.getTime()) ? new Date() : d;
  }, [ticket.timestamp]);

  const formattedDate = issuedAt.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const formattedTime = issuedAt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  const { menRate, childRate, womenRate } = useMemo(() => {
    const fromLocality = hyderabadLocalities.find(l => l.name === ticket.from);
    const toLocality = hyderabadLocalities.find(l => l.name === ticket.to);
    
    if (!fromLocality || !toLocality) return { menRate: 0, childRate: 0, womenRate: 0 };

    const distance = Math.abs(parseInt(fromLocality.routeNumber, 10) - parseInt(toLocality.routeNumber, 10));
    const baseFare = 10 + distance * 1.5;
    const ordinaryAdultFare = Math.round(Math.max(10, baseFare));
    const ordinaryChildFare = Math.round(ordinaryAdultFare / 2);

    let mRate = ordinaryAdultFare;
    let cRate = ordinaryChildFare;
    let wRate = 0;

    if (ticket.busType === 'express') {
        mRate += 5;
        cRate = Math.round(ordinaryChildFare + 2.5);
        wRate = 0;
    } else if (ticket.busType === 'deluxe') {
        mRate += 10;
        cRate = ordinaryChildFare + 5;
        wRate = ordinaryAdultFare + 10;
    }

    return { menRate: mRate, childRate: cRate, womenRate: wRate };
  }, [ticket.from, ticket.to, ticket.busType]);

  const serviceNumber = "MENA" + (Math.floor(Math.random() * 90) + 10);
  const waybill = Math.floor(10000000 + Math.random() * 90000000);
  const busNo = "TS11UA" + (Math.floor(1000 + Math.random() * 9000));
  const cnd = Math.floor(100000 + Math.random() * 900000);

  return (
    <div className="w-full max-w-sm mx-auto bg-white shadow-2xl relative font-mono text-black rounded-sm overflow-hidden border border-gray-200">
      {/* Pink Scalloped Sides (Thermal Paper Effect) */}
      <div className="absolute left-0 top-0 bottom-0 w-4 bg-repeat-y z-20" style={{backgroundImage: 'linear-gradient(135deg, #ffb6c1 50%, transparent 50%), linear-gradient(-135deg, #ffb6c1 50%, transparent 50%)', backgroundSize: '8px 8px'}}></div>
      <div className="absolute right-0 top-0 bottom-0 w-4 bg-repeat-y z-20" style={{backgroundImage: 'linear-gradient(-45deg, #ffb6c1 50%, transparent 50%), linear-gradient(45deg, #ffb6c1 50%, transparent 50%)', backgroundSize: '8px 8px'}}></div>
      
      <div className="p-10 relative z-10">
        {/* Header Section */}
        <div className="text-center space-y-1 mb-6">
          <p className="font-bold text-2xl leading-tight tracking-tighter">తెలంగాణ రాష్ట్ర రోడ్డు రవాణా సంస్థ</p>
          <p className="font-black text-lg tracking-tight">LB Nagar Depot</p>
        </div>

        {/* Top Metadata */}
        <div className="flex justify-between text-[12px] font-black mb-6 px-1 border-b border-gray-100 pb-2">
          <span>{ticket.ticketCode.replace('TKT-', '')}</span>
          <span>{formattedDate} {formattedTime}</span>
        </div>

        {/* Central Info Section */}
        <div className="text-center relative py-6 mb-6">
          <TicketWatermark />
          <p className="text-[12px] font-black mb-1 relative z-10">Service Number: {serviceNumber}</p>
          <h2 className="text-3xl font-black uppercase tracking-tighter relative z-10 py-1">CITY {ticket.busType.toUpperCase()}</h2>
          <p className="text-[12px] font-black relative z-10">Trip No: {Math.floor(Math.random() * 5) + 1}</p>
        </div>

        {/* Route Section */}
        <div className="flex justify-between items-center font-black text-base px-1 mb-8">
          <span className="uppercase">{ticket.from}</span>
          <span className="text-[11px] text-gray-500 font-bold mx-4">TO</span>
          <span className="uppercase">{ticket.to}</span>
        </div>

        {/* Fare Breakdown Section */}
        <div className="space-y-1 text-[13px] font-black px-1 mb-10">
          {(ticket.quantities?.Men || 0) > 0 && (
            <p>MEN: {ticket.quantities!.Men} x {menRate.toFixed(2)} = {(ticket.quantities!.Men * menRate).toFixed(2)}</p>
          )}
          {(ticket.quantities?.Child || 0) > 0 && (
            <p>CHILD: {ticket.quantities!.Child} x {childRate.toFixed(2)} = {(ticket.quantities!.Child * childRate).toFixed(2)}</p>
          )}
          {(ticket.quantities?.Women || 0) > 0 && (
            <div className="flex items-center gap-2">
                <p>WOMEN: {ticket.quantities!.Women} x {womenRate.toFixed(2)} = {(ticket.quantities!.Women * womenRate).toFixed(2)}</p>
                {womenRate === 0 && <span className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded font-black tracking-widest">FREE</span>}
            </div>
          )}
          {(!ticket.quantities) && (
            <p>PASSENGERS: {ticket.passengers}</p>
          )}
        </div>

        {/* Total Divider */}
        <div className="border-t-2 border-dashed border-gray-400 my-6"></div>

        {/* Total Section */}
        <div className="text-center mb-8">
          <h3 className="text-4xl font-black tracking-tighter">Total Rs. {ticket.totalFare.toFixed(2)}</h3>
          <p className="text-[11px] font-black mt-2 text-gray-600">Payment Mode: DIGITAL</p>
        </div>

        {/* System Details Section */}
        <div className="text-[11px] font-black border-t border-dashed border-gray-300 pt-6 px-1">
          <div className="grid grid-cols-2 gap-y-1">
              <p>CND: {cnd}</p>
              <p className="text-right">DRV: DS{serviceNumber}</p>
              <p>Waybill: {waybill}</p>
              <p className="text-right">Bus: {busNo}</p>
              <p>ETIM No: I062300078</p>
              <p className="text-right">v1.9.29</p>
          </div>
        </div>

        {/* Footer Text */}
        <div className="text-center font-black text-base space-y-1 mt-10 border-t-2 border-dashed border-gray-400 pt-6 uppercase">
          <p className="tracking-tight">NOT TRANSFERABLE</p>
          <p className="tracking-widest">HAPPY JOURNEY</p>
          <div className='pt-4'>
            <p className='text-[10px] text-gray-500 font-bold'>Help Line No</p>
            <p className='text-base tracking-tighter'>040 69440000</p>
          </div>
        </div>
      </div>
    </div>
  );
}
