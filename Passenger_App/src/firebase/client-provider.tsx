'use client';

import { useEffect, useState } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';
import type { Auth } from 'firebase/auth';
import type { Analytics } from 'firebase/analytics';
import type { Messaging } from 'firebase/messaging';

import { initializeFirebase } from '@/firebase';
import { FirebaseProvider } from '@/firebase/provider';
import { firebaseConfig } from '@/firebase/config';

export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  const [firebase, setFirebase] = useState<{
    app: FirebaseApp | null;
    firestore: Firestore | null;
    auth: Auth | null;
    analytics?: Analytics;
    messaging?: Messaging;
  } | null>(null);

  useEffect(() => {
    if (firebaseConfig.apiKey) {
      try {
        const services = initializeFirebase();
        setFirebase(services);
      } catch (e: any) {
        console.error("Firebase initialization failed:", e.message);
        setFirebase({ app: null, firestore: null, auth: null });
      }
    } else {
      setFirebase({ app: null, firestore: null, auth: null });
    }
  }, []);

  // Always render the Provider with available services (or null) to keep the tree stable.
  // This prevents the entire app from remounting when initAttempted changes.
  return (
    <FirebaseProvider
      app={firebase?.app || null}
      firestore={firebase?.firestore || null}
      auth={firebase?.auth || null}
      analytics={firebase?.analytics}
      messaging={firebase?.messaging}
    >
      {children}
    </FirebaseProvider>
  );
}
