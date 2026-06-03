
import { redirect } from 'next/navigation';

/**
 * Root Entry Point
 * Redirects to the Conductor Dashboard. 
 * The AuthGuard on that page will handle redirection to /login if no session exists.
 */
export default function HomePage() {
  redirect('/conductor/dashboard');
}
