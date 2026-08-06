import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ያግኙን",
  description: "ለማንኛውም ጥያቄ፣ መረጃ ወይም ማብራሪያ የብልፅግና የኢንስፔክሽንና የሥነ-ምግባር ኮሚሽንን በሚከተሉት አድራሻዎች ማግኘት ይችላሉ።",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
