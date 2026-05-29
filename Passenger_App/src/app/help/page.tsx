import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Header from '@/app/components/header';
import { HelpCircle, User, Zap, Edit3, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const passengerFaqs = [
  {
    question: "How do I login to my account?",
    answer: "Use your 10-digit mobile number and 5-digit security password. Once logged in, your session is saved locally for quick access. Every ticket you book is securely linked to your account identity."
  },
  {
    question: "How do I book a ticket?",
    answer: "Select 'Book Bus Tickets' > 'Select Route'. Choose your bus type (Ordinary, Express, or Deluxe), enter your route, and set the passenger count. You can pay via UPI, Cards, or your BusConnect Wallet."
  },
  {
    question: "How do I modify my booking?",
    answer: "If your ticket is still valid (before boarding or expiry), go to 'Modify Booking'. You can change your destination or passenger count. If you add people, you pay the difference. If you remove people, the fare is refunded to your wallet minus a 10% processing fee per person."
  },
  {
    question: "How is the fare calculated?",
    answer: "Fares are distance-based. Women travel free on City Ordinary and Metro Express buses. Surcharges apply for men and children on premium services, and for everyone on Metro Deluxe buses. Per-person rates are rounded to ensure transparent scaling."
  },
  {
    question: "What are the cancellation rules?",
    answer: "Tickets can be cancelled from 'Booking History' if they are still valid. A 10% processing fee is deducted from the total fare, and the remainder is instantly credited to your BusConnect Wallet."
  },
  {
    question: "What happens if my ticket expires?",
    answer: "Tickets expire 10 minutes after booking if not validated by a conductor. To ensure you don't lose your money, the system automatically processes a refund to your wallet (minus a 10% processing fee) for any unused, expired tickets."
  },
  {
    question: "Why is the Security PIN important?",
    answer: "The 5-digit PIN prevents unauthorized use of your ticket. The conductor will ask for this code to validate your boarding. It is also required as a secondary authentication if you need to redeem a manual refund code issued by a conductor."
  },
  {
    question: "How do I use my Wallet?",
    answer: "Your wallet stores refunds from cancellations, modifications, or expired tickets. You can also top up your balance. Use 'Wallet' to pay for tickets or upgrades instantly without entering payment details every time."
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
    <>
      <Header showBackButton={true} backHref="/" title="Help & FAQs" />
      <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-8 pb-32">
        <div className="flex items-center gap-3 mb-2">
          <HelpCircle className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold font-headline">Passenger Support</h1>
        </div>

        {/* System Highlights */}
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

        <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl text-center">
            <p className="text-sm font-medium text-blue-800">Need more assistance?</p>
            <p className="text-xs text-blue-600 mt-1">Contact TSRTC Helpline: 040 69440000</p>
        </div>
      </div>
    </>
  );
}
