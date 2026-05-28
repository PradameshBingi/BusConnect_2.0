'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bus } from "lucide-react";

export default function BusPassPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bus className="h-6 w-6"/> Bus Pass Management
          </CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-center text-muted-foreground py-12">
                Bus Pass Management functionality is coming soon.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
