'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Header from '@/app/components/header';
import { HelpCircle, User, Zap, Edit3, ShieldCheck, Linkedin , Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthGuard } from '@/components/auth-guard';

const passengerFaqs = [
  {
    question: "How do I login to my account?",
    answer: "Use your 10-digit mobile number and unique security password. Once logged in, your session is saved locally for quick access. Every ticket you book is securely linked to your account identity in the cloud database."
  },
  {
    question: "How do I book a ticket?",
    answer: "Select 'Book Bus Tickets' > 'Select Route'. Choose your bus type (City Ordinary, Metro Express, or Metro Deluxe), enter your route, and set the passenger count. You can pay via UPI, Cards, Netbanking, or your BusConnect Wallet balance."
  },
  {
    question: "How do I modify my booking?",
    answer: "If your ticket is valid, go to 'Modify Booking'. You can update the route or passenger count. The system tracks granular changes (e.g., 'Men: +1, Child: -1'). Refunds for removed members (minus 10% fee) go to your wallet, and additions require a digital payment. Modifications also refresh the ticket's 'Issued Date' to the latest update time."
  },
  {
    question: "What is the 5-digit Security PIN and Tap-to-Copy?",
    answer: "The PIN prevents unauthorized use. The conductor will ask for this to validate your boarding. For your convenience, you can tap the 'Ticket No' box in the preview to instantly copy the code to your clipboard."
  },
  {
    question: "How is the fare calculated?",
    answer: "Fares are distance-based. Women travel free on City Ordinary and Metro Express buses under the Maha Lakshmi scheme. Surcharges apply for men and children on premium services, and standard fares apply for everyone on Metro Deluxe buses."
  },
  {
    question: "What are the cancellation rules?",
    answer: "Tickets can be cancelled from 'Booking History' if they are still valid. A 10% processing fee is deducted from the total fare, and the remainder is instantly credited to your BusConnect Wallet."
  },
  {
    question: "What happens if my ticket expires?",
    answer: "Tickets expire 10 minutes after booking if not validated. To ensure fair usage, the system automatically processes a FULL REFUND (100% credit) to your wallet for any unused, expired tickets. No processing fee is charged for expiry."
  },
  {
    question: "How do I use my Wallet and its categorized history?",
    answer: "Your wallet stores refunds and top-ups. The 'Transaction History' is now split into tabs: 'Digital' (external payments), 'Wallet' (internal balance usage), and 'Refund' (credits from cancellations/expiry). You can also enable 'Auto Deduct for Conductor Use' to allow staff to instantly adjust fares for upgrades during boarding."
  },
];

const howItWorksSteps = [
  {
    title: "Secure Login",
    description: "Access your dashboard using your unique phone and password credentials.",
    icon: <ShieldCheck className="h-4 w-4 text-primary" />
  },
  {
    title: "Flexible Booking",
    description: "Select routes and modify them in real-time if your plans change before travel.",
    icon: <Edit3 className="h-4 w-4 text-primary" />
  },
  {
    title: "Instant Refunds",
    description: "Get automated credits to your wallet for cancellations or unused tickets.",
    icon: <Zap className="h-4 w-4 text-primary" />
  },
];

export default function HelpPage() {
  return (
    <AuthGuard>
      <Header showBackButton={true} backHref="/" title="Help & FAQs" />
      <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-8 pb-32">
        <div className="flex items-center gap-3 mb-2">
          <HelpCircle className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold font-headline">Passenger Support</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {howItWorksSteps.map((step, index) => (
            <Card key={index} className="border-none shadow-sm bg-slate-50">
              <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                <div className="bg-white p-2 rounded-full shadow-sm">{step.icon}</div>
                <p className="font-bold text-xs uppercase tracking-tight">{step.title}</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-none shadow-md overflow-hidden">
          <CardHeader className="bg-primary text-white">
            <CardTitle className="flex items-center gap-2 text-lg font-headline">
              <User className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Accordion type="single" collapsible className="w-full">
              {passengerFaqs.map((faq, index) => (
                <AccordionItem value={`p-item-${index}`} key={index} className="px-6 border-b last:border-0 border-slate-100">
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

        <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-slate-900 text-white">
          <CardContent className="p-8 text-center space-y-6">
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-black tracking-[0.3em] text-slate-400">Conceptualized & Developed by</p>
              <h2 className="text-3xl font-black tracking-tighter">BINGI PRADAMESH</h2>
            </div>
            
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs mx-auto">
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

            <div className="pt-4 border-t border-white/5">
              {/* <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Thank You For Visiting.😎👍</p> */}
              <p className="text-[10px] font-black tracking-[0.2em] text-emerald-500 uppercase pt-4">
                Thank You For Visiting. 😎👍
              </p>

            </div>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
