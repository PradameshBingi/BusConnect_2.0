
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const user = localStorage.getItem('currentUser');

    if (!user) {
      // Standardized redirect to /login to match src/app/login/page.tsx
      router.replace('/login');
      return;
    }

    setAuthorized(true);
  }, [router]);

  if (!isMounted || !authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Authenticating Terminal...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
