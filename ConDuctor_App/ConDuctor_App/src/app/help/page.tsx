
'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Header from '@/app/components/header';
import AuthGuard from '@/components/AuthGuard';
import { HelpCircle, ShieldCheck, Bus, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const staffFaqs = [
  {
    question: "How do I verify an alphanumeric code?",
    answer: "Enter the code provided by the passenger. After the system confirms validity, you MUST ask the passenger for their secondary Security PIN. If they cannot provide it or it doesn't match, the ticket is invalid."
  },
  {
    question: "What to do for inter-category boarding?",
    answer: "If a passenger boards an Express bus with an Ordinary ticket, use 'Category Adjustment'. Collect the difference in cash and validate. The system will record the cash collection for your end-of-shift report."
  },
  {
    question: "How to handle Bus Pass validation?",
    answer: "Enter the 10-digit ID. Ensure the photo displayed on your screen matches the person boarding. Check for the 'ACTIVE' status badge and expiry date before allowing entry."
  },
  {
    question: "Session Invalidation: Why was I logged out?",
    answer: "TGSRTC Terminal enforces a single-session rule. If your ID is used to login on another device, your current session is immediately invalidated to prevent fraud."
  },
  {
    question: "Protocol for 'Expired' or 'Used' tickets?",
    answer: "Boarding MUST be denied. Tickets automatically expire to prevent reuse. Ask the passenger to book a fresh ticket via the Passenger App."
  }
];

export default function HelpPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header showBackButton={true} title="Operational Manual" />
        <main className="p-4 md:p-8 max-w-3xl mx-auto space-y-8 flex-grow pb-24">
          <div className="flex items-center gap-3 mb-2">
            <HelpCircle className="h-8 w-8 text-[#00B893]" />
            <h1 className="text-2xl font-black font-headline uppercase tracking-tight">Staff Protocols</h1>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-emerald-50 border-emerald-100 rounded-2xl shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-black flex items-center gap-2 text-emerald-700 uppercase tracking-widest">
                  <ShieldCheck className="h-4 w-4" /> Security PINs
                </CardTitle>
              </CardHeader>
              <CardContent className="text-[11px] font-bold text-emerald-800 leading-relaxed uppercase opacity-70">
                Always confirm the secondary PIN. It prevents ticket-sharing fraud and screenshot misuse.
              </CardContent>
            </Card>
            <Card className="bg-blue-50 border-blue-100 rounded-2xl shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-black flex items-center gap-2 text-blue-700 uppercase tracking-widest">
                  <Bus className="h-4 w-4" /> Fare Disputes
                </CardTitle>
              </CardHeader>
              <CardContent className="text-[11px] font-bold text-blue-800 leading-relaxed uppercase opacity-70">
                Use the Adjustment tool for category changes. Never collect cash without validating the difference.
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-900 text-white py-6">
              <CardTitle className="font-headline uppercase text-lg tracking-widest">Boarding FAQs</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Accordion type="single" collapsible className="w-full">
                {staffFaqs.map((faq, index) => (
                  <AccordionItem value={`faq-${index}`} key={index} className="border-slate-100">
                    <AccordionTrigger className="text-left font-black uppercase text-xs tracking-tight text-slate-700 py-5">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-sm font-medium text-slate-500 leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl flex gap-4 items-start">
            <AlertCircle className="h-6 w-6 text-amber-600 shrink-0" />
            <div className="space-y-1">
              <p className="font-black text-amber-900 text-xs uppercase tracking-widest">Single-Session Enforcement</p>
              <p className="text-[11px] font-medium text-amber-700">Only one terminal can be active per ID. Logouts happen automatically if account sharing is detected.</p>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
