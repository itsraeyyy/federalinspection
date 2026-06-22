import { SubmissionForm } from "@/components/submission-form";
import { Menubar } from "@/components/menubar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "አቤቱታ | የብልፅግና ኢንስፔክሽን ኮሚሽን",
  description: "የአቤቱታ ማቅረቢያ ቅጽ",
};

export default function AbetutaPage() {
  return (
    <>
      <Menubar />
      <div className="bg-slate-50 min-h-screen pt-24 pb-12">
        <SubmissionForm type="abetuta" />
      </div>
    </>
  );
}
