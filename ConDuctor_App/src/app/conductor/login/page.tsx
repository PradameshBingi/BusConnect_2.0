
import { redirect } from 'next/navigation';

/**
 * Redirect to unified login page to avoid non-stop blinking or duplicate routes.
 */
export default function ConductorLoginPage() {
  redirect('/login');
}
