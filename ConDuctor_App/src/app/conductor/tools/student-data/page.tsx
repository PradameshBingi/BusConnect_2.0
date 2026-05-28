'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function StudentDataPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6"/> Student Concessions
          </CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-center text-muted-foreground py-12">
                Student Concessions functionality is coming soon.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
