import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "መግቢያ (Login)",
  description: "ወደ አስተዳዳሪ ዳሽቦርድ ለመግባት።",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
