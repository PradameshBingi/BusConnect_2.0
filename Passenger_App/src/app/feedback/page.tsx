'use client';

import { useState, useEffect } from 'react';
import Header from '@/app/components/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Send, Loader2, CheckCircle2, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function FeedbackPage() {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [phone, setPhone] = useState('');
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) setPhone(user);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) {
      toast({ variant: 'destructive', title: "Rating Required", description: "Please select a star rating." });
      return;
    }
    if (!category) {
      toast({ variant: 'destructive', title: "Category Required", description: "Please select a feedback category." });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, rating, category, message })
      });

      if (!response.ok) throw new Error("Submission failed");
      
      setIsSubmitted(true);
      toast({ title: "Feedback Received", description: "Thank you for helping us improve BusConnect!" });
    } catch (error) {
      toast({ variant: 'destructive', title: "Error", description: "Could not submit feedback at this time." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <>
        <Header showBackButton backHref="/" title="Feedback Submitted" />
        <div className="p-4 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
          <Card className="w-full max-w-md text-center p-8 rounded-3xl shadow-xl border-none">
            <CheckCircle2 className="h-20 w-20 text-primary mx-auto mb-6" />
            <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Thank You!</h2>
            <p className="text-muted-foreground mb-8">Your feedback has been recorded in our database. We appreciate your contribution to the TGSRTC project.</p>
            <Button className="w-full h-14 rounded-2xl font-bold" onClick={() => router.push('/')}>Back to Dashboard</Button>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Header showBackButton backHref="/" title="Send Feedback" />
      <div className="p-4 md:p-8 flex justify-center bg-slate-50/50 min-h-[calc(100vh-4rem)]">
        <Card className="w-full max-w-md border-none shadow-xl rounded-3xl overflow-hidden h-fit">
          <CardHeader className="bg-primary text-white p-8">
            <CardTitle className="flex items-center gap-3 font-headline text-2xl uppercase tracking-tight">
              <MessageSquare className="h-7 w-7 text-white" />
              Share Feedback
            </CardTitle>
            <CardDescription className="text-white/80">
              Help us improve the TGSRTC digital experience.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block text-center">Your Rating</Label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn("h-10 w-10 cursor-pointer transition-all", {
                        "fill-amber-400 text-amber-400 scale-110": star <= (hoverRating || rating),
                        "text-slate-200": star > (hoverRating || rating)
                      })}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600">Feedback Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="What is this about?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="booking">Ticket Booking</SelectItem>
                    <SelectItem value="wallet">Wallet & Refunds</SelectItem>
                    <SelectItem value="UI/UX">UI/UX Design</SelectItem>
                    <SelectItem value="Upgradation & Modification">Upgradation & Modification</SelectItem>
                    <SelectItem value="Report">Report of Non-Working Tabs</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600">Your Message</Label>
                <Textarea
                  placeholder="Tell us what you liked or what we should fix..."
                  className="min-h-[120px] rounded-2xl p-4 resize-none"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full h-14 bg-[#0A2B70] hover:bg-[#0A2B70]/90 rounded-2xl font-bold text-lg" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <Send className="mr-2 h-5 w-5" />}
                Submit Feedback
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
