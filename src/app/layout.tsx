import type { Metadata } from "next";
import { Instrument_Serif, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";
import { SocketProvider } from "@/providers/socket-provider";
import { CommissionReviewPopup } from "@/components/commission-review-popup";

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
  title: "የብልፅግና የኢንስፔክሽንና የሥነ-ምግባር ኮሚሽን | የኢትዮጵያ ፌዴራላዊ ዲሞክራሲያዊ ሪፐብሊክ",
  description:
    "በመንግሥት አገልግሎቶች ውስጥ ጥራትና ተጠያቂነትን ማረጋገጥ።",
  keywords: [
    "ኢትዮጵያ",
    "ብልፅግና",
    "ኢንስፔክሽን",
    "መንግሥት",
    "ተጠያቂነት",
    "ሥነ-ምግባር",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="am"
      className={`${plusJakarta.variable} ${instrumentSerif.variable} min-h-full antialiased scroll-smooth`}
      suppressHydrationWarning
    >
      <body className="min-h-full font-sans" suppressHydrationWarning>
        <SocketProvider>
          <I18nProvider>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2.5 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-lg"
            >
              ወደ ዋናው ይዘት ይሂዱ
            </a>
            {children}
            <CommissionReviewPopup />
          </I18nProvider>
        </SocketProvider>
      </body>
    </html>
  );
}
