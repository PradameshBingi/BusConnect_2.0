To hide Conductor Tool fro this Passenger_App[
  Location: /Passenger_App/src/app/page.tsx 
<!-- Processuse:

{ 
    //   href: '/conductor', 
    //   title: 'Conductor Tool', 
    //   description: 'Verify tickets and check fares.', 
    //   icon: <User className="h-6 w-6 text-red-500" />,
    //   bgColor: 'bg-red-50'
    // },
    
    -->
]
To hide Conductor FAQS in help :
Location: /Passenger_App/src/app/help/page.tsx 

<!-- 1. [// const conductorFaqs = [
//   {
//     question: "How do I verify a standard ticket?",
//     answer: "Navigate to 'Ticket Tools' > 'Verify Ticket Code'. Enter the ticket code from the passenger's screen and press 'Verify'. The system will instantly show you if the ticket is valid. After verification, a digital receipt is generated."
//   },
//   {
//     question: "What is 'Verify by Bus Type' used for?",
//     answer: "This tool is for when a passenger boards a different bus type than booked (e.g., has an 'Ordinary' ticket but is on a 'Deluxe' bus). It calculates the fare difference."
//   },
//   {
//     question: "How do I handle a fare difference?",
//     answer: "After checking the fare in 'Verify by Bus Type', the system shows the difference. If it's a positive amount, collect it in cash. If it's negative, a refund is due. The refund code will be generated on the digital ticket after you validate it."
//   },
//   {
//     question: "How do I verify a Bus Pass?",
//     answer: "From the conductor dashboard, select 'Bus Pass Verification'. Enter the 10-digit code from the pass. The system will check its validity and display pass details like type (General/Route) and expiry."
//   },
//   {
//     question: "What should I do if a ticket shows as 'Expired', 'Used', or 'Canceled'?",
//     answer: "These tickets are not valid for travel. You should inform the passenger that their ticket cannot be accepted and they will need to book a new one. If the ticket just expired, their fare may have been auto-refunded to their wallet."
//   },
//   {
//     question: "What if a passenger's security code doesn't match?",
//     answer: "Politely ask the passenger to double-check the code on their ticket screen. If it still doesn't match, the ticket cannot be validated. This is a security measure to prevent fraud."
//   },
// ]; ]

2.[  {/* <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <User className="h-6 w-6" />
              For Passengers
            </CardTitle>
          </CardHeader> */} ] -->



<!-- 3.[ <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Briefcase className="h-6 w-6" />
              For Conductors
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
        </Card> ] -->