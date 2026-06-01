'use client';

import { Separator } from "@/components/ui/separator";
import { Info } from "lucide-react";
import Header from '@/app/components/header';

export default function AboutPage() {
  return (
    <>
    <Header showBackButton={true} backHref="/" title="About" />
    <div className="bg-background text-foreground max-w-4xl mx-auto p-4 md:p-8 space-y-10">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight font-headline sm:text-5xl">About TGSRTC Conductor</h1>
        <p className="text-base font-normal text-muted-foreground mt-2 md:pl-24">A Conceptual Digital Ticketing Platform for TGSRTC</p>
      </div>

      <div>
        <h2 className="text-3xl font-bold font-headline text-card-foreground">Who We Are</h2>
        <p className="mt-4 text-lg text-muted-foreground">TGSRTC Conductor is a conceptual smart mobility platform designed to modernize the public bus transport experience in Hyderabad. The platform focuses on bridging the real-world operational gap between passengers and conductors, particularly during peak-hour and high-density travel conditions.</p>
      </div>

      <Separator />

      <div>
        <h2 className="text-3xl font-bold font-headline text-card-foreground">Why We Built This</h2>
        <p className="mt-4 text-lg text-muted-foreground">Public bus transport in Hyderabad faces several daily operational challenges. TGSRTC Conductor was developed to address these challenges through a fast, simple, and fraud-resistant digital ticketing approach.</p>
        <ul className="mt-4 list-disc list-inside space-y-2 text-lg text-muted-foreground">
          <li>Delays caused by cash handling and QR-based payments</li>
          <li>Mobile network issues during ticket scanning</li>
          <li>Safety risks for passengers boarding overcrowded buses</li>
          <li>Time-consuming and difficult bus-pass verification</li>
          <li>Fare disputes when passengers change bus types</li>
        </ul>
      </div>

      <Separator />

      <div>
        <h2 className="text-3xl font-bold font-headline text-card-foreground">What We Do</h2>
        <p className="mt-4 text-lg text-muted-foreground">The platform replaces traditional paper tickets with a smart digital ticket code (for example: TK-01-56485) and introduces a dual-dashboard system:</p>
        <ul className="mt-4 list-disc list-inside space-y-2 text-lg text-muted-foreground">
            <li><strong>Passenger Dashboard</strong> for booking, upgrading, cancelling tickets, and managing refunds</li>
            <li><strong>Conductor Dashboard</strong> for rapid ticket verification, fare adjustment, and bus-pass validation</li>
        </ul>
        <p className="mt-4 text-lg text-muted-foreground">The system is specifically designed to operate efficiently in real-world, crowded bus environments.</p>
      </div>

      <Separator />

      <div>
        <h2 className="text-3xl font-bold font-headline text-card-foreground">How It Works (In Simple Terms)</h2>
        <ul className="mt-4 list-disc list-inside space-y-2 text-lg text-muted-foreground">
            <li>Passengers book tickets digitally and receive a short, unique ticket code instead of a QR code</li>
            <li>Conductors verify tickets by entering the code — no scanning or cash handling required</li>
            <li>Ticket status automatically updates as Valid, Used, Expired, or Refunded</li>
            <li>Bus passes are validated instantly using an alphanumeric pass code with photo verification</li>
            <li>Refunds and fare differences are managed transparently through an in-app wallet</li>
        </ul>
      </div>

      <Separator />

      <div>
        <h2 className="text-3xl font-bold font-headline text-card-foreground">Key Features</h2>
        <ul className="mt-4 list-disc list-inside space-y-2 text-lg text-muted-foreground">
            <li>Smart digital ticket code system (route-based + unique passenger ID)</li>
            <li>One-minute ticket validity window to prevent misuse</li>
            <li>Ticket upgrade support for higher bus categories</li>
            <li>Automatic refunds with wallet-based balance handling</li>
            <li>Secure passenger verification using a secondary security code</li>
            <li>Real-time conductor verification and validation tools</li>
            <li>Fraud-resistant bus-pass validation with status and photo display</li>
        </ul>
      </div>

      <Separator />

      <div>
        <h2 className="text-3xl font-bold font-headline text-card-foreground">Our Vision</h2>
        <p className="mt-4 text-lg text-muted-foreground">To support TGSRTC Telangana in building a faster, safer, and fully digital public transport ecosystem by reducing operational friction, improving passenger trust, and enhancing conductor efficiency.</p>
      </div>

      <Separator />

      <div className="bg-destructive/10 p-6 rounded-lg text-destructive border border-destructive/20">
        <h2 className="text-2xl font-bold font-headline flex items-center gap-3">
          <Info className="h-7 w-7" />Disclaimer
        </h2>
        <p className="mt-2 text-destructive/90">BusConnect is a prototype and conceptual project developed for demonstration and innovation purposes only. All ticketing, payment, and verification processes are simulated to showcase system functionality and workflow design.</p>
      </div>

      <Separator />

      <div className="text-center space-y-2 pt-4">
        <h3 className="text-3xl font-bold">TGSRTC Conductor</h3>
        <p className="text-xl">Conceptualized and Developed by
        <span className="font-bold text-2xl tracking-tight" style={{color: '#0A2B70'}}> Bingi Pradamesh</span> </p>
        <p className="text-sm text-muted-foreground">(This is a conceptual prototype created for demonstration and innovation purposes)</p>
      </div>

    </div>
    </>
  );
}
