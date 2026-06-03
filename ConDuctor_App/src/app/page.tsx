
import { redirect } from 'next/navigation';

/**
 * Root Entry Point
 * Redirects to the login page. AuthGuard will handle subsequent dashboard access.
 */
export default function HomePage() {
  redirect('/login');
}
