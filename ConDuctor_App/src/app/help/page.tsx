import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Header from '@/app/components/header';
import { HelpCircle, User, Briefcase, Zap, Mail, Linkedin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AuthGuard from '@/app/components/AuthGuard';


const conductorFaqs = [
  {
    question: "How do I verify a standard ticket?",
    answer: "Navigate to 'Ticket Tools' > 'Verify Ticket Code'. Enter the ticket code from the passenger's screen and press 'Verify'. The system will instantly show you if the ticket is valid. After verification, a digital receipt is generated."
  },
  {
    question: "What is 'Verify by Bus Type' used for?",
    answer: "This tool is for when a passenger boards a different bus type than booked (e.g., has an 'Ordinary' ticket but is on a 'Deluxe' bus). It calculates the fare difference."
  },
  {
    question: "How do I handle a fare difference?",
    answer: "After checking the fare in 'Verify by Bus Type', the system shows the difference. If it's a positive amount, collect it in cash. If it's negative, a refund is due. The refund code will be generated on the digital ticket after you validate it."
  },
  {
    question: "How do I verify a Bus Pass?",
    answer: "From the conductor dashboard, select 'Bus Pass Verification'. Enter the 10-digit code from the pass. The system will check its validity and display pass details like type (General/Route) and expiry."
  },
  {
    question: "What should I do if a ticket shows as 'Expired', 'Used', or 'Canceled'?",
    answer: "These tickets are not valid for travel. You should inform the passenger that their ticket cannot be accepted and they will need to book a new one. If the ticket just expired, their fare may have been auto-refunded to their wallet."
  },
  {
    question: "What if a passenger's security code doesn't match?",
    answer: "Politely ask the passenger to double-check the code on their ticket screen. If it still doesn't match, the ticket cannot be validated. This is a security measure to prevent fraud."
  },
];

const howItWorksSteps = [
  {
    title: "Book",
    description: "Select your route and bus type. Pay via UPI, Cards, or Wallet.",
  },
  {
    title: "Secure",
    description: "A 5-digit Security PIN is generated for your ticket to prevent fraud.",
  },
  {
    title: "Verify",
    description: "Show your unique Ticket Code to the conductor. They will verify it on their device using your PIN.",
  },
  {
    title: "Refunds",
    description: "If you change buses or cancel, credits are added to your wallet for future use.",
  },
];

export default function HelpPage() {
  return ( <AuthGuard>
    <>
      <Header showBackButton={true} backHref="/" title="Help & FAQs" />
      <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-8">
        <div className="flex items-center gap-3 mb-2">
          <HelpCircle className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold font-headline">Conductor Support</h1>
        </div>

        {/* How It Works Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-primary font-headline">How It Works</h2>
          </div>
          <Card className="bg-slate-50/50 border-slate-200 shadow-sm rounded-xl">
            <CardContent className="p-4 space-y-2">
              {howItWorksSteps.map((step, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-white font-bold text-[10px] mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-snug text-slate-700 font-body">
                    <span className="font-bold text-slate-900">{step.title}: </span>
                    {step.description}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Briefcase className="h-6 w-6" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {conductorFaqs.map((faq, index) => (
                <AccordionItem value={`c-item-${index}`} key={index}>
                  <AccordionTrigger className="text-left font-semibold font-body">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground font-body">
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
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Thank You For Visiting.😎👍</p>
                    </div>
                  </CardContent>
          </Card>
      </div>
    </> </AuthGuard>
  );
}
