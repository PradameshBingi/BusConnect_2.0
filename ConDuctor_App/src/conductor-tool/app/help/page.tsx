
'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Header from '@/components/header';
import { HelpCircle, ShieldCheck, Bus, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const staffFaqs = [
  {
    question: "How do I verify a digital ticket?",
    answer: "Go to 'Ticket Tools' > 'Standard Verification'. Enter the 5-digit alphanumeric code from the passenger's screen. If the ticket is valid, you must then confirm the secondary Security PIN shown on their device before marking it as USED."
  },
  {
    question: "What if the passenger boards a higher category bus?",
    answer: "Use 'Category Adjustment'. Enter the ticket code and select the current bus type (e.g., Metro Deluxe). The system will calculate the difference. If positive, collect cash. If negative, the system auto-refunds the difference to their wallet upon validation."
  },
  {
    question: "How to handle a non-matching Security PIN?",
    answer: "Security PINs are case-sensitive and can contain letters or words. If the PIN doesn't match, boarding should be denied as the ticket may be a screenshot or fraudulent. Ask the passenger to refresh their ticket screen."
  },
  {
    question: "How to verify a Bus Pass?",
    answer: "Select 'Bus Pass Verification' and enter the 10-digit ID. The terminal will pull the holder's photo and validity from the database. Ensure the photo matches the passenger boarding."
  },
  {
    question: "What to do with 'Used' or 'Expired' tickets?",
    answer: "Tickets automatically expire after a set window to prevent reuse. If a ticket shows any status other than VALID, it cannot be accepted for travel. Passengers must book a fresh ticket via the Passenger App."
  }
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header showBackButton={true} backHref="/" title="Operational Manual" />
      <main className="p-4 md:p-8 max-w-3xl mx-auto space-y-8 flex-grow">
        <div className="flex items-center gap-3 mb-2">
          <HelpCircle className="h-8 w-8 text-[#00B893]" />
          <h1 className="text-2xl font-bold font-headline uppercase tracking-tight">Staff Help & FAQs</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-emerald-50 border-emerald-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-black flex items-center gap-2 text-emerald-700">
                <ShieldCheck className="h-4 w-4" /> VERIFICATION PROTOCOL
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-emerald-800 leading-relaxed">
              Always check the secondary PIN. It prevents fraudulent reuse of ticket screenshots.
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-blue-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-black flex items-center gap-2 text-blue-700">
                <Bus className="h-4 w-4" /> FARE DISPUTES
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-blue-800 leading-relaxed">
              Use the Adjustment tool for category changes. Never collect cash without system validation.
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline uppercase text-lg">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {staffFaqs.map((faq, index) => (
                <AccordionItem value={`faq-${index}`} key={index}>
                  <AccordionTrigger className="text-left font-bold text-slate-700">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-slate-500 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl flex gap-4 items-start">
          <AlertCircle className="h-6 w-6 text-amber-600 shrink-0" />
          <div className="space-y-1">
            <p className="font-black text-amber-900 text-sm">NETWORK OFFLINE?</p>
            <p className="text-xs text-amber-700">If the terminal cannot reach the database, check the passenger's 'Last Synced' timestamp on their ticket. If recent, proceed with manual verification.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
