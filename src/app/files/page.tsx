import { Menubar } from "@/components/menubar";
import { Footer } from "@/components/footer";
import { ChevronRight, FileText, Download, Search, FilePdf, FileArchive } from "lucide-react";

// Mock data for files
const documents = [
  {
    id: 1,
    title: "የብልፅግና ፓርቲ መተዳደሪያ ደንብ (የተሻሻለው)",
    category: "መተዳደሪያ ደንብ",
    size: "2.4 MB",
    date: "ጥር 24, 2017 ዓ.ም",
    type: "pdf",
  },
  {
    id: 2,
    title: "የኢንስፔክሽን እና ቁጥጥር መመሪያ",
    category: "መመሪያ",
    size: "1.1 MB",
    date: "መጋቢት 15, 2016 ዓ.ም",
    type: "pdf",
  },
  {
    id: 3,
    title: "የአቤቱታ አቀራረብና አፈታት ሥነ-ሥርዓት",
    category: "መመሪያ",
    size: "850 KB",
    date: "ጥቅምት 10, 2016 ዓ.ም",
    type: "pdf",
  },
  {
    id: 4,
    title: "የ2016 በጀት ዓመት የሥራ አፈጻጸም ሪፖርት",
    category: "ሪፖርት",
    size: "3.2 MB",
    date: "ሐምሌ 30, 2016 ዓ.ም",
    type: "pdf",
  },
  {
    id: 5,
    title: "የክልል ጽ/ቤቶች የክትትል ቅፆች ማጠቃለያ",
    category: "ቅፆች",
    size: "500 KB",
    date: "መስከረም 05, 2016 ዓ.ም",
    type: "zip",
  },
  {
    id: 6,
    title: "የኮሚሽኑ የ5 ዓመት ስትራቴጂክ ዕቅድ",
    category: "ዕቅድ",
    size: "4.5 MB",
    date: "ነሐሴ 12, 2015 ዓ.ም",
    type: "pdf",
  },
];

export default function FilesPage() {
  return (
    <>
      <Menubar />
      <main className="min-h-screen bg-slate-50 pt-24 pb-16">
        
        {/* --- Hero Section --- */}
        <section className="relative overflow-hidden bg-white py-16 lg:py-24">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "radial-gradient(#014BAA 2px, transparent 2px)",
              backgroundSize: "32px 32px",
            }}
            aria-hidden="true"
          />
          <div className="container-site relative z-10 flex flex-col items-center text-center">
            <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-blue-50 text-[#014BAA] shadow-inner">
              <FileText className="size-8" />
            </div>
            <h1 className="font-heading text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              <span style={{ color: "#014BAA" }}>ሰነዶች</span>
            </h1>
            <div className="mt-6 flex items-center gap-2 text-sm font-medium text-slate-500">
              <span>መነሻ</span>
              <ChevronRight className="size-4" />
              <span style={{ color: "#014BAA" }}>ሰነዶች</span>
            </div>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
              የፌዴራል ብልፅግና የኢንስፔክሽንና የስነ ምግባር ኮሚሽን ሕጎች፣ ደንቦች፣ መመሪያዎች እና ልዩ ልዩ ሪፖርቶች።
            </p>
          </div>
        </section>

        {/* --- Content Section --- */}
        <section className="container-site py-12 lg:py-16">
          <div className="mx-auto max-w-5xl">
            
            {/* Search and Filter Bar */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="ሰነዶችን ይፈልጉ..."
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#014BAA] focus:ring-4 focus:ring-[#014BAA]/10 shadow-sm"
                />
              </div>
              <div className="flex gap-2">
                <button className="rounded-xl bg-[#014BAA] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#013a85] hover:shadow">
                  ሁሉም
                </button>
                <button className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-slate-600 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-50 hover:text-slate-900">
                  መመሪያ
                </button>
                <button className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-slate-600 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-50 hover:text-slate-900">
                  ሪፖርት
                </button>
              </div>
            </div>

            {/* Documents List */}
            <div className="flex flex-col gap-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="group flex flex-col items-start gap-4 rounded-3xl bg-white p-5 ring-1 ring-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-8px_rgba(1,75,170,0.12)] hover:ring-[#014BAA]/20 sm:flex-row sm:items-center sm:p-6"
                >
                  <div 
                    className="flex size-14 shrink-0 items-center justify-center rounded-2xl transition-colors"
                    style={{ backgroundColor: "rgba(1, 75, 170, 0.06)", color: "#014BAA" }}
                  >
                    {doc.type === "pdf" ? <FileText className="size-7" /> : <FileArchive className="size-7" />}
                  </div>
                  
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-slate-500">
                        {doc.category}
                      </span>
                      <span className="text-[0.65rem] font-bold tracking-wider text-slate-400">
                        {doc.date}
                      </span>
                    </div>
                    <h3 className="mt-2 font-heading text-lg font-bold text-slate-900 group-hover:text-[#014BAA] transition-colors">
                      {doc.title}
                    </h3>
                  </div>

                  <div className="mt-4 flex w-full items-center justify-between sm:mt-0 sm:w-auto sm:gap-6">
                    <span className="text-sm font-bold text-slate-400">{doc.size}</span>
                    <button 
                      className="flex size-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition-all group-hover:bg-[#FFB800] group-hover:text-slate-900 group-hover:shadow-sm"
                      aria-label="ሰነድ አውርድ"
                    >
                      <Download className="size-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
