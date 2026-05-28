'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface Ticket {
  ticketCode: string;
  from: string;
  to: string;
  timestamp?: string; 
  createdAt?: string | Date;
  passengers: number | string;
  totalFare: number;
  busType: string;
  quantities?: {
    Men: number;
    Child: number;
    Women: number;
  };
}

interface ValidatedTicketProps {
  ticket: Ticket;
}

export function ValidatedTicket({ ticket }: ValidatedTicketProps) {
  const rawDate = ticket.createdAt || ticket.timestamp || new Date();
  const issuedAt = new Date(rawDate);
  
  const formattedDate = issuedAt instanceof Date && !isNaN(issuedAt.getTime()) 
    ? issuedAt.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });

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
    return 0;
  };

  return (
    <Card className="w-full max-w-xs mx-auto bg-white shadow-xl relative font-sans text-slate-800 border-none overflow-hidden">
      {/* Pink Scalloped Borders */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 flex flex-col items-center py-1 overflow-hidden opacity-60">
        {[...Array(45)].map((_, i) => (
          <div key={i} className="w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent border-r-[5px] border-r-[#FF80A0] my-0.5" />
        ))}
      </div>
      <div className="absolute right-0 top-0 bottom-0 w-1.5 flex flex-col items-center py-1 overflow-hidden opacity-60">
        {[...Array(45)].map((_, i) => (
          <div key={i} className="w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent border-l-[5px] border-l-[#FF80A0] my-0.5" />
        ))}
      </div>
      
      {/* Central Watermark */}
      <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.07] pointer-events-none select-none z-0">
        <svg width="220" height="220" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="95" stroke="#FF80A0" strokeWidth="2" />
          <circle cx="100" cy="100" r="85" stroke="#FF80A0" strokeWidth="1" />
          <text x="50%" y="45%" dominantBaseline="middle" textAnchor="middle" fill="#FF80A0" fontSize="24" fontWeight="bold">TGSRTC</text>
          <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#FF80A0" fontSize="14" fontWeight="bold">HYDERABAD</text>
        </svg>
      </div>

      <CardContent className="p-5 pt-6 relative z-10">
        <div className="text-center mb-4">
          <h1 className="text-[17px] font-black text-slate-900 tracking-tight">తెలంగాణ రాష్ట్ర రోడ్డు రవాణా సంస్థ</h1>
          <p className="font-bold text-sm text-slate-800">{depot}</p>
        </div>

        <div className="flex justify-between text-[11px] font-bold mb-4 px-2 text-slate-700">
          <span>{ticket.ticketCode}</span>
          <span>{formattedDate} {formattedTime}</span>
        </div>

        <div className="text-center my-4">
          <p className="text-[11px] font-bold text-slate-600 mb-1">Service Number: {serviceNumber}</p>
          <div className="relative inline-block mb-1">
            <h2 className="text-[19px] font-black leading-tight text-slate-900 uppercase">City {ticket.busType}</h2>
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">HYDERABAD</p>
          <p className="text-[11px] font-bold text-slate-800">Trip No: {tripNumber}</p>
        </div>

        <div className="flex justify-between items-center my-5 px-1">
          <div className="flex flex-col flex-1">
            <p className="font-black text-[13px] leading-tight uppercase">{ticket.from}</p>
          </div>
          <div className="mx-2 font-black text-xs text-slate-400">TO</div>
          <div className="flex flex-col flex-1 text-right">
            <p className="font-black text-[13px] leading-tight uppercase">{ticket.to}</p>
          </div>
        </div>

        {/* Fare Breakdown - NO DECIMALS */}
        <div className="text-[12px] font-mono my-4 space-y-1 font-bold px-1 border-t border-slate-100 pt-3">
          {qty && Object.entries(qty).map(([type, count]: [any, any]) => {
            if (count === 0) return null;
            const farePerHead = getCategoryFareWhole(type);
            const subtotal = count * farePerHead;
            return (
              <div key={type} className="flex justify-between">
                <span>{type.toUpperCase()}: {count} x {farePerHead}</span>
                <span>= {subtotal}</span>
              </div>
            );
          })}
        </div>
        
        <Separator className="my-3 border-dashed bg-transparent border-t-2 border-slate-200" />

        <div className="text-center my-5">
          <h3 className="text-[28px] font-black text-slate-900 tracking-tighter">Total Rs. {Math.round(ticket.totalFare)}</h3>
          <p className="font-bold mt-2 text-[11px] text-slate-600 tracking-wider">
            Payment Mode: DIGITAL
          </p>
        </div>

        <div className="space-y-1 text-[10px] my-5 font-bold text-slate-600 border-t border-slate-100 pt-4 px-1">
          <div className="flex justify-between"><span>CND:</span> <span className="font-black">{cnd}</span></div>
          <div className="flex justify-between"><span>DRV:</span> <span className="font-black">{drv}</span></div>
          <div className="flex justify-between"><span>Waybill:</span> <span className="font-black">{waybill}</span></div>
          <div className="flex justify-between"><span>Bus:</span> <span className="font-black">{bus}</span></div>
          <div className="flex justify-between"><span>ETIM No:</span> <span className="font-black">{etimNo}</span></div>
          <div className="flex justify-between"><span>v1.9.29</span></div>
        </div>

        <Separator className="my-3 border-dashed bg-transparent border-t-2 border-slate-200" />

        <div className="text-center font-black text-[11px] space-y-1 mt-4 text-slate-900">
          <p className="tracking-widest">NOT TRANSFERABLE</p>
          <p className="tracking-[0.15em] text-[13px]">HAPPY JOURNEY</p>
          <div className="pt-3 text-slate-600">
            <p className="text-[10px] font-bold">HELP LINE NO</p>
            <p className="text-[12px] font-black tracking-widest">{helpline}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
