import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'MR MUTANT', description: 'Búsqueda y reputación de números telefónicos con datos reales.' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="es"><body>{children}</body></html>;
}
