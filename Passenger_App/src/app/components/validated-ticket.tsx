'use client';

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { hyderabadLocalities } from '@/lib/locations';
import { ArrowRight } from 'lucide-react';

interface Ticket {
  ticketCode: string;
  from: string;
  to: string;
  timestamp: string; 
  passengers: number | string;
  totalFare: number;
  busType: string;
  quantities?: { Men: number, Child: number, Women: number };
}

interface ValidatedTicketProps {
  ticket: Ticket;
}

const BusStamp = () => (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.08] pointer-events-none z-0">
        <div className="w-32 h-32 rounded-full border-4 border-red-600 flex flex-col items-center justify-center text-red-600 font-bold">
            <div className="border-t-2 border-b-2 border-red-600 py-1 w-full text-center text-[10px]">TGSRTC</div>
            <div className="text-[10px] mt-1">HYDERABAD</div>
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

  const serviceNumber = "MEAB" + (Math.floor(Math.random() * 90) + 10);
  const depot = "Secunderabad Depot";
  const cnd = Math.floor(100000 + Math.random() * 900000);
  const waybill = Math.floor(10000000 + Math.random() * 90000000);
  const busNo = "TS11UA" + (Math.floor(1000 + Math.random() * 9000));

  return (
    <div className="w-full max-w-sm mx-auto bg-white shadow-lg relative font-mono text-black rounded-sm overflow-hidden border border-gray-200">
      {/* Pink Scalloped Sides */}
      <div className="absolute left-0 top-0 bottom-0 w-3 bg-repeat-y z-20" style={{backgroundImage: 'linear-gradient(135deg, #ffc0cb 50%, transparent 50%), linear-gradient(-135deg, #ffc0cb 50%, transparent 50%)', backgroundSize: '6px 6px'}}></div>
      <div className="absolute right-0 top-0 bottom-0 w-3 bg-repeat-y z-20" style={{backgroundImage: 'linear-gradient(-45deg, #ffc0cb 50%, transparent 50%), linear-gradient(45deg, #ffc0cb 50%, transparent 50%)', backgroundSize: '6px 6px'}}></div>
      
      <div className="p-8 relative z-10">
        <div className="text-center space-y-0.5 mb-4">
          <p className="font-bold text-lg leading-tight">తెలంగాణ రాష్ట్ర రోడ్డు రవాణా సంస్థ</p>
          <p className="font-bold text-sm">{depot}</p>
        </div>

        <div className="flex justify-between text-[11px] font-bold mb-4 px-1">
          <span>{ticket.ticketCode}</span>
          <span>{formattedDate} {formattedTime}</span>
        </div>

        <div className="text-center relative py-4 mb-4">
          <BusStamp />
          <p className="text-[11px] font-bold mb-1 relative z-10">Service Number: {serviceNumber}</p>
          <h2 className="text-2xl font-black uppercase tracking-tighter relative z-10">CITY {ticket.busType.toUpperCase()}</h2>
          <p className="text-[11px] font-bold relative z-10">Trip No: {Math.floor(Math.random() * 5) + 1}</p>
        </div>

        <div className="flex justify-between items-center font-bold text-sm px-1 mb-4">
          <span className="uppercase">{ticket.from}</span>
          <span className="text-[10px] text-slate-400">TO</span>
          <span className="uppercase">{ticket.to}</span>
        </div>

        <div className="space-y-1 text-sm font-bold px-1 mb-6">
          {ticket.quantities?.Men && ticket.quantities.Men > 0 && (
            <p>MEN: {ticket.quantities.Men} x {Math.round(menRate)} = {Math.round(ticket.quantities.Men * menRate)}</p>
          )}
          {ticket.quantities?.Child && ticket.quantities.Child > 0 && (
            <p>CHILD: {ticket.quantities.Child} x {Math.round(childRate)} = {Math.round(ticket.quantities.Child * childRate)}</p>
          )}
          {ticket.quantities?.Women && ticket.quantities.Women > 0 && (
            <p>WOMEN: {ticket.quantities.Women} x {Math.round(womenRate)} = {Math.round(ticket.quantities.Women * womenRate)}</p>
          )}
          {(!ticket.quantities) && (
            <p>PASSENGERS: {ticket.passengers}</p>
          )}
        </div>

        <div className="border-t-2 border-dashed border-gray-400 my-4"></div>

        <div className="text-center mb-6">
          <h3 className="text-3xl font-black">Total Rs. {Math.round(ticket.totalFare)}</h3>
          <p className="text-xs font-bold mt-1">Payment Mode: DIGITAL</p>
        </div>

        <div className="text-[10px] font-bold border-t border-dashed border-gray-400 pt-4 px-1 space-y-0.5">
          <p>CND: {cnd}</p>
          <p>DRV: DS{serviceNumber}</p>
          <p>Waybill: {waybill}</p>
          <p>Bus: {busNo}</p>
          <div className="flex justify-between mt-1 pt-1 border-t border-dashed border-gray-200">
            <span>ETIM No: I062300078</span>
            <span>v1.9.29</span>
          </div>
        </div>

        <div className="text-center font-bold text-sm space-y-0.5 mt-8 border-t-2 border-dashed border-gray-400 pt-4">
          <p>NOT TRANSFERABLE</p>
          <p>HAPPY JOURNEY</p>
          <div className='pt-2'>
            <p className='text-[10px] uppercase'>Help Line No</p>
            <p className='text-xs'>040 69440000</p>
          </div>
        </div>
      </div>
    </div>
  );
}
