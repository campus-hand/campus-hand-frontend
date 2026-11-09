import type { Metadata, Viewport } from 'next';
import { themeBootScript } from '@/features/theme/theme-script';
import { archivo, bigShoulders } from './fonts';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://campushand.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Campus Hand: past papers, notes and Magezi for your course units',
    template: '%s | Campus Hand',
  },
  description:
    'Notes and past papers for every course unit you are doing this semester, with Magezi, a study buddy that explains them, and tutors who passed them.',
  applicationName: 'Campus Hand',
  icons: { icon: '/brand/campus-hand-logo.svg' },
  openGraph: {
    type: 'website',
    siteName: 'Campus Hand',
    title: 'Find the past paper. Understand the answer.',
    description:
      'Notes, past papers, tutors and Magezi for every course unit you are doing this semester.',
  },
  // Staging and previews must not be indexed.
  robots:
    process.env.NEXT_PUBLIC_APP_ENV === 'production' ? undefined : { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FBF8F1' },
    { media: '(prefers-color-scheme: dark)', color: '#10152A' },
  ],
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      data-theme="day"
      data-theme-pref="auto"
      suppressHydrationWarning
      className={`${archivo.variable} ${bigShoulders.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
