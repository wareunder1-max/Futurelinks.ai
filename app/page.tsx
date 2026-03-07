import { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/seo/JsonLd';
import { generateOrganizationSchema, generateWebSiteSchema } from '@/lib/seo/schemas';
import { getLandingPageCanonicalUrl } from '@/lib/seo/canonical';
import { defaultAIMetaTags } from '@/lib/seo/ai-meta-tags';

export const metadata: Metadata = {
  title: 'AI FutureLinks - The Evolution of the Interface',
  description: 'The first model-agnostic AI workspace designed for the 2026 workflow. Toggle between OpenAI and Google Gemini in a single click.',
  keywords: 'model-agnostic AI workspace, multi-model AI switching, OpenAI vs Google Gemini comparison, AI artifacts and code preview, serverless AI project storage, 2026 AI workflow tools, advanced AI interface',
  ...defaultAIMetaTags,
  openGraph: {
    title: 'AI FutureLinks - The Evolution of the Interface',
    description: 'The first model-agnostic AI workspace designed for the 2026 workflow. Toggle between OpenAI and Google Gemini in a single click.',
    url: getLandingPageCanonicalUrl(),
    type: 'website',
    images: [
      {
        url: 'https://ai.futurelinks.art/og-default.png',
        width: 1200,
        height: 630,
        alt: 'AI FutureLinks Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI FutureLinks - The Evolution of the Interface',
    description: 'The first model-agnostic AI workspace designed for the 2026 workflow. Toggle between OpenAI and Google Gemini in a single click.',
    images: ['https://ai.futurelinks.art/og-default.png'],
  },
  alternates: {
    canonical: getLandingPageCanonicalUrl(),
  },
};

export default function Home() {
  // Generate Organization schema for the landing page
  const organizationSchema = generateOrganizationSchema({
    name: 'AI FutureLinks',
    url: 'https://ai.futurelinks.art',
    logo: 'https://ai.futurelinks.art/logo.png',
    description: 'Model-agnostic AI workspace designed for the 2026 workflow',
  });

  // Generate WebSite schema with search action
  const websiteSchema = generateWebSiteSchema({
    name: 'AI FutureLinks',
    url: 'https://ai.futurelinks.art',
    description: 'The first model-agnostic workspace designed for the 2026 workflow',
    searchUrl: 'https://ai.futurelinks.art/search?q={search_term_string}',
  });

  return (
    <>
      {/* JSON-LD Structured Data */}
      <JsonLd data={organizationSchema} />
      <JsonLd data={websiteSchema} />

      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-black">
      {/* Navigation */}
      <nav className="border-b border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
                AI FutureLinks
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/blog"
                className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                Blog
              </Link>
              <Link
                href="/api/auth/signin"
                className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-16 text-center">
          <div className="max-w-4xl space-y-8">
            {/* Main Headline */}
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl md:text-7xl">
              The Evolution of the Interface
            </h1>

            {/* Subheadline */}
            <h2 className="mx-auto max-w-3xl text-xl font-medium text-gray-700 dark:text-gray-300 sm:text-2xl">
              The era of the simple text box is over. Welcome to AI FutureLinks, the first
              model-agnostic workspace designed for the 2026 workflow.
            </h2>

            {/* Body Copy with SEO Keywords */}
            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-gray-600 dark:text-gray-400">
              Toggle between the deep reasoning of OpenAI and the massive context of Google Gemini
              in a single click. Watch your ideas come to life in our real-time Artifacts window
              and maintain a perfect memory of your projects with integrated serverless storage.
              Don&apos;t just use AI—master it.
            </p>

            {/* CTA Button */}
            <div className="flex flex-col items-center gap-4 pt-4 sm:flex-row sm:justify-center">
              <Link
                href="/chat"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Start Creating
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center justify-center rounded-lg border-2 border-gray-300 bg-white px-8 py-4 text-base font-semibold text-gray-900 transition-all hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:border-gray-600 dark:hover:bg-gray-800"
              >
                Learn More
              </Link>
            </div>

            {/* SEO Keywords Section */}
            <div className="pt-12">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-500">
                Features: model-agnostic AI workspace • multi-model AI switching • OpenAI vs Google
                Gemini comparison • AI artifacts and code preview • serverless AI project storage •
                2026 AI workflow tools • advanced AI interface
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
    </>
  );
}
