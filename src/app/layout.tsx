import type { Metadata } from "next";
import { Instrument_Serif, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://federalinspection.gov.et'),
  title: {
    default: "የብልፅግና የኢንስፔክሽንና የሥነ-ምግባር ኮሚሽን | የኢትዮጵያ ፌዴራላዊ ዲሞክራሲያዊ ሪፐብሊክ",
    template: "%s | የብልፅግና የኢንስፔክሽንና የሥነ-ምግባር ኮሚሽን"
  },
  description: "በመንግሥት አገልግሎቶች ውስጥ ጥራትና ተጠያቂነትን ማረጋገጥ።",
  keywords: [
    "ኢትዮጵያ",
    "ብልፅግና",
    "ኢንስፔክሽን",
    "መንግሥት",
    "ተጠያቂነት",
    "ሥነ-ምግባር",
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: "website",
    locale: "am_ET",
    url: "/",
    siteName: "የብልፅግና የኢንስፔክሽንና የሥነ-ምግባር ኮሚሽን",
    images: [
      {
        url: "/logo.jpg",
        width: 1200,
        height: 630,
        alt: "የብልፅግና ኢንስፔክሽን ኮሚሽን ምልክት",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "የብልፅግና የኢንስፔክሽንና የሥነ-ምግባር ኮሚሽን",
    description: "በመንግሥት አገልግሎቶች ውስጥ ጥራትና ተጠያቂነትን ማረጋገጥ።",
    images: ["/logo.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="am"
      data-scroll-behavior="smooth"
      className={`${plusJakarta.variable} ${instrumentSerif.variable} min-h-full antialiased scroll-smooth`}
      suppressHydrationWarning
    >
      <body className="min-h-full font-sans" suppressHydrationWarning>
        <I18nProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2.5 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-lg"
          >
            ወደ ዋናው ይዘት ይሂዱ
          </a>
          {children}
          <AnalyticsTracker />
        </I18nProvider>
      </body>
    </html>
  );
}
