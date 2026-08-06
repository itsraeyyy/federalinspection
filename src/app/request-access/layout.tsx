import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "የመዳረሻ ጥያቄ",
  description: "ለተመረጡ የኮሚሽኑ ሰነዶች እና መረጃዎች የመዳረሻ ጥያቄ ማቅረቢያ ገጽ።",
};

export default function RequestAccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
