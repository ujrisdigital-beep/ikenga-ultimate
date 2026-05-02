import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'IKENGA — Chi in Motion | Four Products. One Platform.',
  description:
    'IKENGA is a unified creative operating platform — four products, four brand voices, one shared engine. Founders, agencies, and creators use it to generate a full week of content in one run.',
  keywords: 'IKENGA, UJU Cycle, Chi in Motion, content generation, AI marketing, brand voices',
  authors: [{ name: 'UJU GROUP LIMITED' }],
  creator: 'UJU GROUP LIMITED',
  robots: 'index, follow',
  openGraph: {
    title: 'IKENGA — Chi in Motion',
    description: 'Four products. One platform. Unlimited brand momentum.',
    siteName: 'IKENGA',
    type: 'website',
  },
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
