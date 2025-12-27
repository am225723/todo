import { ReactNode } from 'react';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}