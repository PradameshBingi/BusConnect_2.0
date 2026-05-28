'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import Header from '@/app/components/header';

const faqs = [
    {
        question: "How do I verify a ticket?",
        answer: "Navigate to Conductor Tools > Ticket Verifier. Enter the ticket code in the input field and press \"Verify\". The system will show the ticket\'s status."
    },
    {
        question: "What do the different ticket statuses mean?",
        answer: "`VALID`: The ticket is active and can be used for travel. `USED`: The ticket has been successfully validated by a conductor. `EXPIRED`: The ticket is past its travel time and is no longer valid. `CANCELLED`: The ticket has been cancelled by the user."
    },
    {
        question: "What is the Universal Ticket (TKT-00-00000)?",
        answer: "This is a built-in test ticket for verification purposes. Use this code to test the verifier functionality without needing a real ticket. It will always show as valid initially and then as used after verification."
    },
    {
        question: "What should I do if a ticket shows as \"Invalid\" or \"Not Found\"?",
        answer: "First, double-check that you have entered the ticket code correctly. If it still fails, the ticket may be fraudulent or from a different system. Follow standard procedure for handling invalid tickets."
    },
    {
        question: "How do I log out?",
        answer: "On the main dashboard, click the \"Logout\" button in the top-right corner of the header."
    }
]

export default function HelpPage() {
  return (
    <>
    <Header showBackButton={true} backHref="/" title="Help & FAQs" />
    <div className="max-w-2xl mx-auto">
        <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
                <AccordionItem value={`item-${i}`} key={i}>
                    <AccordionTrigger className="text-lg font-bold text-left">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-base text-muted-foreground">
                        {faq.answer}
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    </div>
    </>
  );
}
