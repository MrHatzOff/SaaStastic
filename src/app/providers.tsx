'use client';

import { ThemeProvider } from 'next-themes';
import { ClerkProvider } from '@clerk/nextjs';
import { CompanyProvider } from '@/core/auth/company-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <CompanyProvider>
          {children}
        </CompanyProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
}
