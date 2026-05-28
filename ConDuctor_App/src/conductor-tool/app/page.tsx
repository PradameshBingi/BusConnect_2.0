
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#00B893] flex items-center justify-center">
      <div className="text-white font-bold text-xl animate-pulse">Entering Conductor Portal...</div>
    </div>
  );
}
