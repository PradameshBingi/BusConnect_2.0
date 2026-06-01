
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const user = localStorage.getItem('conductorUser');
      const localSessionId = localStorage.getItem('conductorSessionId');

      if (!user || !localSessionId) {
        router.replace('/login');
        return;
      }

      try {
        // Validate session against database for single-session enforcement
        const res = await fetch(`/api/conductor-session?id=${user}`);
        const data = await res.json();

        if (data.sessionId !== localSessionId) {
          // Newer session detected elsewhere
          localStorage.removeItem('conductorUser');
          localStorage.removeItem('conductorSessionId');
          router.replace('/login');
          return;
        }

        setAuthorized(true);
      } catch (error) {
        // Fallback to local auth if network fails, but retry on next heartbeat
        setAuthorized(true);
      }
    };

    checkAuth();
    const interval = setInterval(checkAuth, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, [router]);

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#00B893] border-t-transparent rounded-full animate-spin"></div>
          <p className="font-black text-[#0A2B70] uppercase tracking-widest text-xs">Authenticating Terminal...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
