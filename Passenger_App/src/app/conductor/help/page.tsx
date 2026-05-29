import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Header from '@/app/components/header';
import { HelpCircle, User, Briefcase, Zap, Ticket, ShieldCheck, Mail, Linkedin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    question: "How do I verify a standard ticket?",
    answer: "Go to 'Ticket Tools' > 'Verify Ticket Code'. Enter the passenger's code. If valid, check their 5-digit PIN for security. Click 'Validate Boarding' to mark as USED and generate the digital receipt."
  },
  {
    question: "What is 'Verify by Bus Type' used for?",
    answer: "Use this if a passenger boards a higher category bus than they booked (e.g., Ordinary ticket on a Deluxe bus). The system calculates the fare difference to collect in cash."
  },
  {
    question: "How do I handle manual refunds?",
    answer: "If you need to issue a manual refund code (e.g., for bus breakdowns), the passenger will need their original 5-digit Security PIN to redeem it in their wallet. PINs are viewable in their history even for USED tickets."
  },
  {
    question: "How do I verify a Bus Pass?",
    answer: "Select 'Bus Pass Verification' and enter the 10-digit alphanumeric code. The system displays the holder's name, category, route restrictions, and expiry status directly from the database."
  },
  {
    question: "What about expired or cancelled tickets?",
    answer: "The system will block validation for these. Inform the passenger they must book a new ticket. Expired tickets are automatically refunded to their wallet minus a fee, so they can use that balance for the new booking."
  },
  {
    question: "Where can I see operational stats?",
    answer: "Use 'Verification Insights' to see real-time data on tickets validated, cash collected from upgrades, and bus pass verification density across routes."
  },
];

const operationalGuides = [
  {
    title: "Boarding Check",
    description: "Always verify the 5-digit Security PIN to prevent screenshot fraud.",
    icon: <ShieldCheck className="h-4 w-4 text-emerald-600" />
  },
  {
    title: "Upgrade Fare",
    description: "Collect fare differences in cash for inter-category upgrades during boarding.",
    icon: <Zap className="h-4 w-4 text-emerald-600" />
  },
  {
    title: "Pass Photo Box",
    description: "Compare the passenger's physical face with the name displayed on valid passes.",
    icon: <User className="h-4 w-4 text-emerald-600" />
  },
];

export default function ConductorHelpPage() {
  return (
    <>
      <Header showBackButton={true} backHref="/conductor/dashboard" title="Help & FAQs" />
      <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-8 pb-32">
        <div className="flex items-center gap-3 mb-2">
          <HelpCircle className="h-8 w-8 text-[#00B893]" />
          <h1 className="text-2xl font-bold font-headline">Conductor Manual</h1>
        </div>

        {/* Operational Highlights */}
        <div className="grid gap-4 md:grid-cols-3">
          {operationalGuides.map((step, index) => (
            <Card key={index} className="border-none shadow-sm bg-emerald-50">
              <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                <div className="bg-white p-2 rounded-full shadow-sm">{step.icon}</div>
                <p className="font-bold text-[10px] uppercase tracking-wider text-emerald-800">{step.title}</p>
                <p className="text-[11px] text-emerald-700 leading-relaxed">{step.description}</p>
              </CardContent>
            </Card>
          ))}
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

        {/* Developer Contact Card */}
        <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-slate-900 text-white">
          <CardContent className="p-8 text-center space-y-6">
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-black tracking-[0.3em] text-slate-400">System Creator & Developer</p>
              <h2 className="text-3xl font-black tracking-tighter">BINGI PRADAMESH</h2>
            </div>
            
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs mx-auto">
              For system-level inquiries, professional networking, or technical discussions regarding the BusConnect prototype.
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-xl h-12 px-6" asChild>
                <a href="mailto:pradamesh@example.com" target="_blank" rel="noopener noreferrer">
                  <Mail className="mr-2 h-4 w-4 text-[#00B893]" />
                  Email Developer
                </a>
              </Button>
              <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-xl h-12 px-6" asChild>
                <a href="https://linkedin.com/in/pradameshbingi" target="_blank" rel="noopener noreferrer">
                  <Linkedin className="mr-2 h-4 w-4 text-[#0077B5]" />
                  LinkedIn
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md overflow-hidden opacity-80">
          <CardHeader className="bg-slate-100 text-slate-600">
            <CardTitle className="flex items-center gap-2 text-sm font-headline uppercase">
              <User className="h-4 w-4" />
              Reference: Passenger Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Accordion type="single" collapsible className="w-full">
              {passengerFaqs.map((faq, index) => (
                <AccordionItem value={`p-item-${index}`} key={index} className="px-6 border-b last:border-0 border-slate-50">
                  <AccordionTrigger className="text-left font-medium text-slate-700 py-4 hover:no-underline text-xs">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-500 pb-4 text-[11px]">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

      </div>
    </>
  );
}
