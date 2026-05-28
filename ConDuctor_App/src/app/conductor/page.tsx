
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * CONSOLIDATED INDEX:
 * Automatically redirects to the Conductor Dashboard.
 */
export default function ConductorIndexPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/conductor/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#00B893] flex items-center justify-center">
      <div className="animate-pulse text-white font-bold text-xl">Loading Dashboard...</div>
    </div>
  );
}
