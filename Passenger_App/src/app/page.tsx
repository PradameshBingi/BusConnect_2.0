'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const dynamic = "force-dynamic";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect directly to the Conductor Tools dashboard as per requirements
    router.replace('/conductor');
  }, [router]);

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-4">
        <div className="bg-white p-2 rounded-lg shadow-2xl animate-pulse mb-6">
            <div className="w-16 h-16 flex flex-col items-center justify-center bg-red-600 text-white rounded-md text-[10px] font-bold leading-none">
                <span>TSRTC</span>
                <span>GAMYAM</span>
            </div>
        </div>
        <p className="text-white font-black tracking-widest text-xl uppercase animate-pulse">
            Loading Conductor Tools...
        </p>
    </div>
  );
}
