import { redirect } from 'next/navigation';

/** Eski /dashboard/research → intelligence/keywords */
export default function ResearchRedirect() {
  redirect('/dashboard/intelligence/keywords');
}
