import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ምዝገባ (Registration)",
  description: "በብልፅግና የኢንስፔክሽንና የሥነ-ምግባር ኮሚሽን አዲስ አካውንት ይፍጠሩ።",
};

export default function JoinLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
