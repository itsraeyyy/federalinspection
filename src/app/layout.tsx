import type { Metadata } from "next";
import { Instrument_Serif, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";
import { SocketProvider } from "@/providers/socket-provider";

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
  title: "Prosperity Party Inspection Sector | Government of Ethiopia",
  description:
    "Ensuring quality and accountability in government services. Official website of the Prosperity Party Inspection Sector.",
  keywords: [
    "Ethiopia",
    "Prosperity Party",
    "Inspection Sector",
    "Government",
    "Accountability",
    "Compliance",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${instrumentSerif.variable} h-full antialiased overflow-hidden`}
      suppressHydrationWarning
    >
      <body className="h-full overflow-hidden font-sans" suppressHydrationWarning>
        <SocketProvider>
          <I18nProvider>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2.5 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-lg"
            >
              Skip to main content
            </a>
            {children}
          </I18nProvider>
        </SocketProvider>
      </body>
    </html>
  );
}
