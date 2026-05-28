'use client';

import { useMemo } from 'react';
import { hyderabadLocalities } from '@/lib/locations';

type TicketDetails = {
    from: string;
    to: string;
    passengers: string;
    totalFare: number;
    fare: number;
    createdAt: string;
    busType: string;
    ticketCode: string;
    quantities: { Men: number, Child: number, Women: number };
    paymentMode?: string;
};

type GeneratedTicketProps = {
    ticket: TicketDetails;
    refundCode?: string | null;
};

const BusStamp = () => (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.08] pointer-events-none">
        <div className="w-32 h-32 rounded-full border-4 border-red-600 flex flex-col items-center justify-center text-red-600 font-bold">
            <div className="border-t-2 border-b-2 border-red-600 py-1 w-full text-center text-[10px]">TGSRTC</div>
            <div className="text-[10px] mt-1">HYDERABAD</div>
        </div>
    </div>
);

export function GeneratedTicket({ ticket, refundCode }: GeneratedTicketProps) {
    const issueDate = new Date(ticket.createdAt);
    
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
    const waybill = Math.floor(10000000 + Math.random() * 90000000);
    const busNo = "TS11UA" + (Math.floor(1000 + Math.random() * 9000));

    return (
        <div className="bg-white text-black p-8 font-mono max-w-sm mx-auto shadow-lg rounded-sm border border-gray-200 relative overflow-hidden">
            {/* Pink Scalloped Sides */}
            <div className="absolute left-0 top-0 bottom-0 w-3 bg-repeat-y" style={{backgroundImage: 'linear-gradient(135deg, #ffc0cb 50%, transparent 50%), linear-gradient(-135deg, #ffc0cb 50%, transparent 50%)', backgroundSize: '6px 6px'}}></div>
            <div className="absolute right-0 top-0 bottom-0 w-3 bg-repeat-y" style={{backgroundImage: 'linear-gradient(-45deg, #ffc0cb 50%, transparent 50%), linear-gradient(45deg, #ffc0cb 50%, transparent 50%)', backgroundSize: '6px 6px'}}></div>

            <div className="text-center relative z-10">
                <p className="font-bold text-lg leading-tight">తెలంగాణ రాష్ట్ర రోడ్డు రవాణా సంస్థ</p>
                <p className="font-bold text-sm">Secunderabad Depot</p>
                
                <div className="flex justify-between text-[11px] font-bold my-4 px-1">
                    <span>{ticket.ticketCode}</span>
                    <span>{issueDate.toLocaleDateString('en-GB')} {issueDate.toLocaleTimeString('en-GB', {hour: '2-digit', minute:'2-digit'})}</span>
                </div>

                <div className="my-4 relative py-2">
                    <BusStamp />
                    <p className="text-[11px] font-bold">Service Number: {serviceNumber}</p>
                    <p className="font-black text-2xl uppercase tracking-tighter">CITY {ticket.busType.toUpperCase()}</p>
                    <p className="text-[11px] font-bold">Trip No: {Math.floor(Math.random() * 5) + 1}</p>
                </div>

                <div className="flex justify-between items-center font-bold text-sm px-1 my-4">
                    <span>{ticket.from.toUpperCase()}</span>
                    <span className="mx-2 text-[10px] text-slate-400">TO</span>
                    <span>{ticket.to.toUpperCase()}</span>
                </div>
                
                <div className="text-left my-4 text-sm font-bold px-1 space-y-1">
                    {ticket.quantities.Men > 0 && <p>MEN: {ticket.quantities.Men} x {Math.round(menRate)} = {Math.round(ticket.quantities.Men * menRate)}</p>}
                    {ticket.quantities.Child > 0 && <p>CHILD: {ticket.quantities.Child} x {Math.round(childRate)} = {Math.round(ticket.quantities.Child * childRate)}</p>}
                    {ticket.quantities.Women > 0 && (
                        <p>WOMEN: {ticket.quantities.Women} x {Math.round(womenRate)} = {Math.round(ticket.quantities.Women * womenRate)}</p>
                    )}
                </div>

                <div className="border-t-2 border-dashed border-gray-400 my-4"></div>

                <p className="text-3xl font-black mb-1">Total Rs. {Math.round(ticket.totalFare)}</p>
                <p className="text-xs font-bold">Payment Mode: {ticket.paymentMode || "DIGITAL"}</p>
                
                <div className="text-[10px] text-left mt-6 font-bold px-1 border-t border-dashed border-gray-400 pt-4 space-y-0.5">
                    <p>CND: {Math.floor(100000 + Math.random() * 900000)}</p>
                    <p>DRV: DS{serviceNumber}</p>
                    <p>Waybill: {waybill}</p>
                    <p>Bus: {busNo}</p>
                    <div className="flex justify-between mt-1 pt-1 border-t border-dashed border-gray-200">
                        <span>ETIM No: I062300078</span>
                        <span>v1.9.29</span>
                    </div>
                </div>

                {refundCode && (
                    <div className="border-t-2 border-dashed border-gray-400 pt-4 mt-6">
                        <p className="font-bold text-xs">REFUND CODE:</p>
                        <p className="text-xl font-black tracking-widest text-blue-600">{refundCode}</p>
                    </div>
                )}
                
                <div className="border-t-2 border-dashed border-gray-400 pt-4 mt-8 font-bold text-sm space-y-0.5">
                    <p>NOT TRANSFERABLE</p>
                    <p>HAPPY JOURNEY</p>
                    <div className='pt-2'>
                        <p className='text-[10px] uppercase'>HELP LINE NO</p>
                        <p className='text-xs'>040 69440000</p>
                    </div>
                </div>
            </div>
        </div>
    );
}