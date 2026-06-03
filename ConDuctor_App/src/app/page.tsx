
import { redirect } from 'next/navigation';

/**
 * Root Entry Point
 * Consolidated to redirect to the secure Conductor Dashboard.
 */
export default function HomePage() {
  redirect('/conductor/dashboard');
}
