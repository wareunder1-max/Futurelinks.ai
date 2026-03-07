import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap', // Prevent invisible text during font loading (Requirement 21.6)
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap', // Prevent invisible text during font loading (Requirement 21.6)
});

export const metadata: Metadata = {
  title: 'AI FutureLinks - The Evolution of the Interface',
  description:
    'Model-agnostic AI workspace for the 2026 workflow. Toggle between OpenAI and Google Gemini, preview AI artifacts in real-time, and store projects with serverless storage.',
  keywords: [
    'model-agnostic AI workspace',
    'multi-model AI switching',
    'OpenAI vs Google Gemini comparison',
    'AI artifacts and code preview',
    'serverless AI project storage',
    '2026 AI workflow tools',
    'advanced AI interface',
  ],
  openGraph: {
    title: 'AI FutureLinks - The Evolution of the Interface',
    description:
      'Model-agnostic AI workspace for the 2026 workflow. Toggle between OpenAI and Google Gemini in a single click.',
    url: 'https://ai.futurelinks.art',
    siteName: 'AI FutureLinks',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI FutureLinks - The Evolution of the Interface',
    description:
      'Model-agnostic AI workspace for the 2026 workflow. Toggle between OpenAI and Google Gemini in a single click.',
  },
};

// Viewport configuration for mobile-first responsive design (Requirement 22.3)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Resource hints for critical assets (Requirement 21.8) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
