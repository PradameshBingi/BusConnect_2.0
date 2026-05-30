'use client';

import Header from '../../components/header';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, Briefcase, Zap, ShieldCheck, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const conductorFaqs = [
  {
    question: "How do I verify a standard ticket?",
    answer: "Go to 'Ticket Tools' > 'Verify Ticket Code'. Enter the passenger's code. If valid, check their 5-digit PIN for security. Click 'Validate Boarding' to mark as USED and generate the digital receipt."
  },
  {
    question: "What is 'Category Adjustment' used for?",
    answer: "Use this if a passenger boards a higher category bus than they booked (e.g., Ordinary ticket on a Deluxe bus). The system calculates the fare difference to collect in cash."
  },
  {
    question: "How do I verify a Bus Pass?",
    answer: "Select 'Bus Pass Verification' and enter the 10-digit alphanumeric code. The system displays the holder's name, category, route restrictions, and expiry status directly from the database."
  },
  {
    question: "What about expired tickets?",
    answer: "The system will block validation for these. Inform the passenger they must book a new ticket. Expired tickets are automatically refunded to their wallet minus a fee."
  }
];

export default function ConductorHelpPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6 pb-32">
        <div className="flex items-center gap-3">
          <HelpCircle className="h-8 w-8 text-[#16a34a]" />
          <h1 className="text-2xl font-bold font-headline uppercase">Operational Manual</h1>
        </div>

        <Card className="border-none shadow-lg overflow-hidden">
          <CardHeader className="bg-[#0A2B70] text-white">
            <CardTitle className="flex items-center gap-2 text-lg font-headline uppercase tracking-tight">
              <Briefcase className="h-5 w-5 text-[#FF80A0]" />
              Conductor Operations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Accordion type="single" collapsible className="w-full">
              {conductorFaqs.map((faq, index) => (
                <AccordionItem value={`c-item-${index}`} key={index} className="px-6 border-b last:border-0">
                  <AccordionTrigger className="text-left font-bold text-slate-800 py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 pb-6 text-sm">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
