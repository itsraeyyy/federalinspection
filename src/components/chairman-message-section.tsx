"use client";

import { useState, useEffect } from "react";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface MessageData {
  id: string;
  name: string;
  title: string;
  org: string;
  paragraphs: string[];
  photo: string | null;
}

export function ChairmanMessageSection() {
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMessages() {
      const { data, error } = await supabase
        .from('personnel')
        .select('*')
        .not('message', 'is', null)
        .neq('message', '');

      if (!error && data) {
        // filter only those with actual message text
        const validData = data.filter(p => p.message && p.message.trim().length > 0);
        
        const formatted = validData.map(p => ({
          id: p.id,
          name: p.name_am || p.name,
          title: p.position_am || p.position,
          org: p.office_category_am || p.office_category || "የፌዴራል ብልፅግና ኢንስፔክሽን ኮሚሽን",
          paragraphs: p.message.split('\n').filter((text: string) => text.trim().length > 0),
          photo: p.photo
        }));
        
        setMessages(formatted);
      }
      setLoading(false);
    }
    fetchMessages();
  }, []);

  if (loading || messages.length === 0) return null;

  const msg = messages[current];

  const prev = () => setCurrent((c) => (c === 0 ? messages.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === messages.length - 1 ? 0 : c + 1));

  return (
    <section
      id="chairman-message"
      className="relative overflow-hidden bg-slate-50 py-24 sm:py-32"
      aria-labelledby="chairman-heading"
    >
      {/* Subtle background accent */}
      <div
        className="pointer-events-none absolute right-0 top-0 h-full w-1/2 opacity-[0.03]"
        style={{
          background: "radial-gradient(ellipse at top right, #014BAA 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="container-site relative z-10">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
          {/* ── Left: Photo ── */}
          <div className="flex items-center justify-center lg:justify-start">
            <div className="relative">
              {/* Accent blocks behind photo */}
              <div
                className="absolute -bottom-4 -left-4 h-full w-full rounded-3xl"
                style={{ backgroundColor: "#FFB800", opacity: 0.15 }}
                aria-hidden="true"
              />
              <div
                className="absolute -top-4 -right-4 h-full w-full rounded-3xl"
                style={{ backgroundColor: "#014BAA", opacity: 0.08 }}
                aria-hidden="true"
              />

              {/* Photo placeholder */}
              <div className="relative h-[460px] w-[340px] overflow-hidden rounded-3xl bg-gradient-to-br from-slate-200 to-slate-100 shadow-2xl ring-1 ring-slate-200 sm:h-[520px] sm:w-[380px]">
                {msg.photo ? (
                  <img src={msg.photo} alt={msg.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-4">
                    <div className="flex size-28 items-center justify-center rounded-full bg-slate-200">
                      <svg className="size-16 text-slate-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-slate-400">የሃላፊ ፎቶ</p>
                  </div>
                )}

                {/* Name plate overlay */}
                <div
                  className="absolute bottom-0 left-0 right-0 px-6 py-5"
                  style={{ background: "linear-gradient(to top, rgba(1,75,170,0.95) 0%, transparent 100%)" }}
                >
                  <p className="text-lg font-bold text-white">{msg.title}</p>
                  <p className="mt-0.5 text-sm font-medium text-white/70">
                    {msg.org}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: Message ── */}
          <div className="flex flex-col">
            <h2
              id="chairman-heading"
              className="font-heading text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl xl:text-5xl"
            >
              መልዕክት
            </h2>

            <div
              className="mt-6 mb-8 h-1.5 w-14 rounded-full"
              style={{ backgroundColor: "#FFB800" }}
              aria-hidden="true"
            />

            <Quote
              className="mb-4 size-8 rotate-180 opacity-20"
              style={{ color: "#014BAA" }}
              aria-hidden="true"
            />

            <blockquote className="space-y-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              {msg.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </blockquote>

            <Quote
              className="mt-4 self-end size-8 opacity-20"
              style={{ color: "#014BAA" }}
              aria-hidden="true"
            />

            {/* Signature line */}
            <div className="mt-10 flex items-center gap-5 border-t border-slate-200 pt-8">
              <div
                className="h-12 w-1 rounded-full"
                style={{ backgroundColor: "#014BAA" }}
                aria-hidden="true"
              />
              <div>
                <p className="text-base font-bold text-slate-900">{msg.name}</p>
                <p className="mt-0.5 text-sm font-medium text-slate-500">{msg.org}</p>
              </div>
            </div>

            {messages.length > 1 && (
              <div className="mt-8 flex items-center justify-start gap-4">
                <button
                  onClick={prev}
                  className="flex size-9 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm ring-1 ring-slate-200 transition-all hover:text-[#014BAA] hover:ring-[#014BAA]/30"
                  aria-label="ቀዳሚ"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <div className="flex items-center gap-2">
                  {messages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrent(i)}
                      className={`rounded-full transition-all duration-300 ${
                        i === current
                          ? "h-2.5 w-8 bg-[#014BAA]"
                          : "h-2.5 w-2.5 bg-slate-300 hover:bg-slate-400"
                      }`}
                      aria-label={`መልዕክት ${i + 1}`}
                    />
                  ))}
                </div>
                <button
                  onClick={next}
                  className="flex size-9 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm ring-1 ring-slate-200 transition-all hover:text-[#014BAA] hover:ring-[#014BAA]/30"
                  aria-label="ቀጣይ"
                >
                  <ChevronRight className="size-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
