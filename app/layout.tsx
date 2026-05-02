import type { Metadata } from "next";
import "./globals.css";
import {
  APP_DESCRIPTION,
  APP_NAME,
  APP_TAGLINE,
  getSiteMetadataBase,
} from "../src/ikenga/lib/site";

export const metadata: Metadata = {
  metadataBase: getSiteMetadataBase(),
  title: {
    default: `${APP_NAME} | ${APP_TAGLINE}`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  keywords: [
    "IKENGA AI",
    "AI content engine",
    "brand voice AI",
    "creator operating system",
    "marketing automation",
    "early access",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    title: `${APP_NAME} | ${APP_TAGLINE}`,
    description: APP_DESCRIPTION,
    siteName: APP_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} | ${APP_TAGLINE}`,
    description: APP_DESCRIPTION,
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      data-scroll-behavior="smooth"
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
