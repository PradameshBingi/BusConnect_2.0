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
  // Terminology Normalization Layer
  const displayBusType = useMemo(() => {
    const type = (ticket.busType || '').toLowerCase();
    if (type.includes('deluxe')) return 'METRO DELUXE';
    if (type.includes('express')) return 'METRO EXPRESS';
    return 'CITY ORDINARY';
  }, [ticket.busType]);

  // Stable Randomized Data based on Ticket Code
  const stableData = useMemo(() => {
    const seed = ticket.ticketCode.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const rnd = (min: number, max: number, offset: number) => {
      const val = Math.abs(Math.sin(seed + offset) * 10000);
      return Math.floor(min + (val % (max - min + 1)));
    };

    const depots = ['LB Nagar Depot', 'Dilsukhnagar Depot', 'Mehdipatnam Depot', 'Uppal Depot', 'Secunderabad Depot', 'Hayathnagar Depot', 'Kukatpally Depot', 'Miyapur Depot', 'Barkatpura Depot', 'Ranigunj Depot'];
    const servicePrefixes = ['MENA', 'MEAB', 'METR', 'CITY'];
    
    return {
      depot: depots[rnd(0, depots.length - 1, 10)],
      serviceNo: servicePrefixes[rnd(0, 3, 20)] + rnd(10, 99, 30),
      waybill: rnd(10000000, 99999999, 40),
      busNo: "TS11UA" + rnd(1000, 9999, 50),
      cnd: rnd(100000, 999999, 60),
      tripNo: rnd(1, 8, 70)
    };
  }, [ticket.ticketCode]);

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

    const type = displayBusType.toLowerCase();

    if (type.includes('express')) {
        mRate += 5;
        cRate = Math.round(ordinaryChildFare + 2.5);
        wRate = 0;
    } else if (type.includes('deluxe')) {
        mRate += 10;
        cRate = ordinaryChildFare + 5;
        wRate = ordinaryAdultFare + 10;
    }

    return { menRate: mRate, childRate: cRate, womenRate: wRate };
  }, [ticket.from, ticket.to, displayBusType]);

  return (
    <div className="w-full max-sm:w-[calc(100vw-2rem)] max-w-sm mx-auto bg-white shadow-2xl relative font-mono text-black rounded-sm overflow-hidden border border-gray-200">
      <div className="absolute left-0 top-0 bottom-0 w-4 bg-repeat-y z-20" style={{backgroundImage: 'linear-gradient(135deg, #ffb6c1 50%, transparent 50%), linear-gradient(-135deg, #ffb6c1 50%, transparent 50%)', backgroundSize: '8px 8px'}}></div>
      <div className="absolute right-0 top-0 bottom-0 w-4 bg-repeat-y z-20" style={{backgroundImage: 'linear-gradient(-45deg, #ffb6c1 50%, transparent 50%), linear-gradient(45deg, #ffb6c1 50%, transparent 50%)', backgroundSize: '8px 8px'}}></div>
      
      <div className="p-8 relative z-10">
        <div className="text-center space-y-0.5 mb-3">
          <p className="font-bold text-lg leading-tight tracking-tighter">తెలంగాణ రాష్ట్ర రోడ్డు రవాణా సంస్థ</p>
          <p className="font-black text-sm tracking-tight">{stableData.depot}</p>
        </div>

        <div className="flex justify-between text-[11px] font-black mb-3 px-1 border-b border-gray-100 pb-1.5">
          <span>{ticket.ticketCode}</span>
          <span>{formattedDate} {formattedTime}</span>
        </div>

        <div className="text-center relative py-3 mb-3">
          <TicketWatermark />
          <p className="text-[11px] font-black mb-0 relative z-10">Service Number: {stableData.serviceNo}</p>
          <h2 className="text-2xl font-black uppercase tracking-tighter relative z-10 py-0.5">{displayBusType}</h2>
          <p className="text-[11px] font-black relative z-10">Trip No: {stableData.tripNo}</p>
        </div>

        <div className="flex justify-between items-center font-black text-sm px-1 mb-5">
          <span className="uppercase">{ticket.from}</span>
          <span className="text-[10px] text-gray-500 font-bold mx-2">TO</span>
          <span className="uppercase">{ticket.to}</span>
        </div>

        <div className="space-y-0.5 text-[12px] font-black px-1 mb-6">
          {(ticket.quantities?.Men || 0) > 0 && (
            <p>MEN: {ticket.quantities!.Men} x {menRate.toFixed(2)} = {(ticket.quantities!.Men * menRate).toFixed(2)}</p>
          )}
          {(ticket.quantities?.Child || 0) > 0 && (
            <p>CHILD: {ticket.quantities!.Child} x {childRate.toFixed(2)} = {(ticket.quantities!.Child * childRate).toFixed(2)}</p>
          )}
          {(ticket.quantities?.Women || 0) > 0 && (
            <div className="flex items-center gap-2">
                <p>WOMEN: {ticket.quantities!.Women} x {womenRate.toFixed(2)} = {(ticket.quantities!.Women * womenRate).toFixed(2)}</p>
                {womenRate === 0 && <span className="bg-green-100 text-green-700 text-[9px] px-1 py-0.5 rounded font-black tracking-widest">FREE</span>}
            </div>
          )}
          {(!ticket.quantities) && (
            <p>PASSENGERS: {ticket.passengers}</p>
          )}
        </div>

        <div className="border-t-2 border-dashed border-gray-400 my-3"></div>

        <div className="text-center mb-5">
          <h3 className="text-3xl font-black tracking-tighter">Total Rs. {Math.round(ticket.totalFare)}</h3>
          <p className="text-[10px] font-black mt-1 text-gray-600">Payment Mode: DIGITAL</p>
        </div>

        <div className="text-[10px] font-black border-t border-dashed border-gray-300 pt-3 px-1">
          <div className="grid grid-cols-2 gap-y-0.5">
              <p>CND: {stableData.cnd}</p>
              <p className="text-right">DRV: DS{stableData.serviceNo}</p>
              <p>Waybill: {stableData.waybill}</p>
              <p className="text-right">Bus: {stableData.busNo}</p>
              <p>ETIM No: I062300078</p>
              <p className="text-right">v1.9.29</p>
          </div>
        </div>

        <div className="text-center font-black text-sm space-y-0.5 mt-6 border-t-2 border-dashed border-gray-400 pt-4 uppercase">
          <p className="tracking-tight">NOT TRANSFERABLE</p>
          <p className="tracking-widest">HAPPY JOURNEY</p>
          <div className='pt-2'>
            <p className='text-[9px] text-gray-500 font-bold'>Help Line No</p>
            <p className='text-sm tracking-tighter'>040 69440000</p>
          </div>
        </div>
      </div>
    </div>
  );
}
