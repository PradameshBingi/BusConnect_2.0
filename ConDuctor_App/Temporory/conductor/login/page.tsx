
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectToDashboard() {
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
