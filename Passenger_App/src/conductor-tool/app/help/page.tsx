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
  },
  {
    question: "Why verify the Security PIN?",
    answer: "The PIN ensures the person holding the phone is the one who booked the ticket, preventing fraud through static screenshots."
  }
];

export default function ConductorHelpPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header showBackButton={true} backHref="/dashboard" title="Help & FAQs" />
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
                <AccordionItem value={`c-item-${index}`} key={index} className="px-6 border-b last:border-0 border-slate-100">
                  <AccordionTrigger className="text-left font-bold text-slate-800 py-5 hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 pb-6 text-sm leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Card className="bg-emerald-50 border-emerald-100">
                <CardContent className="p-6 space-y-2">
                    <ShieldCheck className="h-8 w-8 text-emerald-600" />
                    <h3 className="font-bold text-emerald-900">Security First</h3>
                    <p className="text-xs text-emerald-700">Always match the physical face with the Bus Pass photo box during validation.</p>
                </CardContent>
             </Card>
             <Card className="bg-amber-50 border-amber-100">
                <CardContent className="p-6 space-y-2">
                    <Zap className="h-8 w-8 text-amber-600" />
                    <h3 className="font-bold text-amber-900">Cash Collection</h3>
                    <p className="text-xs text-amber-700">Ensure any positive fare difference is collected in cash before marking a ticket as used.</p>
                </CardContent>
             </Card>
        </div>
      </div>
    </div>
  );
}
