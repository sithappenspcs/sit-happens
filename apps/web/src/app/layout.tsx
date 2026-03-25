import type { Metadata } from 'next';
import './globals.css';
import { RealtimeProvider } from '@/components/RealtimeProvider';
import { AuthProvider } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Sit Happens Pet Care',
  description: 'Premium pet care services in Edmonton, AB.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <RealtimeProvider>
            {children}
          </RealtimeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
