import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "መረጃ (Statistics)",
  description: "የብልፅግና የኢንስፔክሽንና የሥነ-ምግባር ኮሚሽን አጠቃላይ መዋቅር፣ የኮሚሽን አባላት እና ኃላፊዎች ስታቲስቲካዊ መረጃ።",
};

export default function StatisticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
