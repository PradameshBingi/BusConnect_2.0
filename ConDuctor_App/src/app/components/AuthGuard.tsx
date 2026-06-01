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

  useEffect(() => {
    const user = localStorage.getItem('currentUser');

    if (!user) {
      router.replace('/conductor/login');
      return;
    }

    setAuthorized(true);
  }, [router]);

  if (!authorized) return null;

  return <>{children}</>;
}