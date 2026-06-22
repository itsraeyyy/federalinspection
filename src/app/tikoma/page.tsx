import { SubmissionForm } from "@/components/submission-form";
import { Menubar } from "@/components/menubar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ጥቆማ | የብልፅግና ኢንስፔክሽን ኮሚሽን",
  description: "የጥቆማ ማቅረቢያ ቅጽ",
};

export default function TikomaPage() {
  return (
    <>
      <Menubar />
      <div className="bg-slate-50 min-h-screen pt-24 pb-12">
        <SubmissionForm type="tikoma" />
      </div>
    </>
  );
}
