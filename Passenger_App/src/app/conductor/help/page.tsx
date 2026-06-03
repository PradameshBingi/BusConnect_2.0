'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Header from '@/app/components/header';
import { HelpCircle, Briefcase, Zap, Mail, Linkedin, User, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthGuard } from '@/components/auth-guard';

const passengerFaqs = [
  {
    question: "How do I book a ticket?",
    answer: "Navigate to 'Book Bus Tickets' from the home screen, select your bus type, choose your starting point and destination, add passengers, and generate your ticket. You can also use your wallet balance for payment."
  },
  {
    question: "How is the fare calculated?",
    answer: "Fares are based on distance. Women travel free on City Ordinary and Metro Express buses. Surcharges apply for men and children on premium services, and for everyone on Metro Deluxe buses."
  },
  {
    question: "How do I modify my booking?",
    answer: "Go to 'Modify Booking' if your ticket is valid. You can update the route or passenger count. Refunds for removed members (minus 10% fee) go to your wallet, and additions require digital payment."
  },
  {
    question: "What are the cancellation rules?",
    answer: "Valid tickets can be cancelled in 'Booking History'. A 10% processing fee is applied, and the balance is credited to the wallet."
  },
  {
    question: "What happens if a ticket expires?",
    answer: "Tickets expire if not validated within 10 minutes. An automatic refund (minus 10% fee) is credited to the passenger's wallet to ensure fair usage."
  },
];

const conductorFaqs = [
  {
    question: "How Do I Verify A Alphanumeric Code?",
    answer: "Navigate to 'Ticket Tool'. Enter the 5-digit code provided by the passenger. If the system confirms validity, you MUST ask the passenger to reveal their secondary Security PIN. If they cannot provide it or it doesn't match the hidden code, boarding must be denied."
  },
  {
    question: "What Is 'Ticket Tool' Used For?",
    answer: "This is the primary verification hub. It allows you to verify codes, handle service category adjustments (Upgrades/Downgrades), and validate boarding in a single step."
  },
  {
    question: "How Do I Handle A Fare Difference?",
    answer: "Change the 'Actual Boarding Service' selector. If the service is higher than booked, the system checks for 'Auto-Deduct' status. If ON, validate to debit their wallet. If OFF, collect cash difference. If the service is lower, the system auto-credits a 'Ticket Downgrade' refund to their wallet."
  },
  {
    question: "Protocol For 'Expired' Or 'Used' Tickets?",
    answer: "Boarding MUST be denied. Tickets automatically expire to prevent reuse. If a ticket is expired, the passenger's wallet is often already credited automatically; ask them to book a fresh ticket via the Passenger App."
  },
  {
    question: "How To Handle Bus Pass Validation?",
    answer: "Enter the 10-digit ID. Ensure the photo displayed matches the person boarding. Check for the 'VALID' status badge and expiry date before allowing entry."
  },
  {
    question: "Session Invalidation: Why Was I Logged Out?",
    answer: "TGSRTC Terminal enforces a single-session rule. If your Staff ID is used to login on another device, your current session is immediately invalidated to prevent unauthorized access."
  },
];

const operationalProtocols = [
  {
    title: "Security PINs",
    description: "Always confirm the secondary alphanumeric PIN. It prevents ticket-sharing fraud and screenshot misuse.",
  },
  {
    title: "Category Shifts",
    description: "Never collect cash without updating the 'Actual Boarding Service' selector. The system must track all digital and cash transitions.",
  },
  {
    title: "Live Cloud Sync",
    description: "Ensure the 'Authorized' badge is visible. This confirms your terminal is synchronized with the TGSRTC cloud database.",
  },
];

export default function HelpPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header showBackButton={true} backHref="/conductor/dashboard" title="Help & FAQs" />
        <main className="p-4 md:p-8 max-w-3xl mx-auto space-y-8 flex-grow pb-24">
          <div className="flex items-center gap-3 mb-2">
            <HelpCircle className="h-8 w-8 text-[#00B893]" />
            <h1 className="text-2xl font-black font-headline uppercase tracking-tight">Staff Protocols</h1>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-[#00B893]" />
              <h2 className="text-xl font-black text-slate-800 uppercase font-headline">Operational Guides</h2>
            </div>
            <Card className="bg-white border-none shadow-sm rounded-2xl overflow-hidden">
              <CardContent className="p-6 space-y-4">
                {operationalProtocols.map((step, index) => (
                  <div key={index} className="flex gap-4 items-start">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-[#00B893] font-black text-[10px] mt-0.5">
                      {index + 1}
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-black text-xs text-slate-900 uppercase">{step.title}</p>
                      <p className="text-[11px] font-medium text-slate-500 leading-relaxed uppercase">{step.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-900 text-white py-6">
              <CardTitle className="font-headline uppercase text-lg tracking-widest flex items-center gap-3">
                <Briefcase className="h-6 w-6" />
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Accordion type="single" collapsible className="w-full">
                {conductorFaqs.map((faq, index) => (
                  <AccordionItem value={`faq-${index}`} key={index} className="border-slate-100">
                    <AccordionTrigger className="text-left font-black uppercase text-xs tracking-tight text-slate-700 py-5">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-sm font-medium text-slate-500 leading-relaxed uppercase">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md overflow-hidden bg-white opacity-80">
            <CardHeader className="bg-slate-100 text-slate-600 py-4">
              <CardTitle className="flex items-center gap-2 text-sm font-headline uppercase tracking-wider">
                <User className="h-4 w-4" />
                Reference: Passenger Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Accordion type="single" collapsible className="w-full">
                {passengerFaqs.map((faq, index) => (
                  <AccordionItem value={`p-item-${index}`} key={index} className="border-slate-50">
                    <AccordionTrigger className="text-left font-medium text-slate-700 py-4 hover:no-underline text-xs">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-500 pb-4 text-[11px] uppercase leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-slate-900 text-white">
            <CardContent className="p-8 text-center space-y-6">
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-black tracking-[0.3em] text-slate-400">Conceptualized & Developed by</p>
                <h2 className="text-2xl font-black tracking-tighter text-white uppercase">BINGI PRADAMESH</h2>
              </div>
              <p className="text-xs font-bold text-slate-400 max-w-sm mx-auto leading-relaxed uppercase">
                Have questions about this prototype or technical inquiries? Reach out via professional channels.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-xl h-12 px-6" asChild>
                  <a href="mailto:pradameshbingi043@gmail.com" target="_blank" rel="noopener noreferrer">
                    <Mail className="mr-2 h-4 w-4 text-primary" />
                    Email Me
                  </a>
                </Button>
                <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-xl h-12 px-6" asChild>
                  <a href="https://www.linkedin.com/in/pradamesh-043-bingi" target="_blank" rel="noopener noreferrer">
                    <Linkedin className="mr-2 h-4 w-4 text-[#0077B5]" />
                    LinkedIn
                  </a>
                </Button>
              </div>
              <p className="text-[10px] font-black tracking-[0.2em] text-emerald-500 uppercase pt-4">
                Thank You For Visiting. 😎👍
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    </AuthGuard>
  );
}