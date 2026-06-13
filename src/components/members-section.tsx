"use client";

import Image from "next/image";
import { Mail, Phone } from "lucide-react";

import { memberCategories } from "@/lib/site-data";
import { SectionHeader } from "@/components/section-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export function MembersSection() {
  return (
    <section
      id="members"
      className="section-padding bg-surface"
      aria-labelledby="members-heading"
    >
      <div className="container-site">
        <SectionHeader
          id="members-heading"
          eyebrow="Our Team"
          title="Our Members"
          description="Dedicated professionals leading inspections, compliance, and institutional support nationwide."
        />

        <Tabs defaultValue={memberCategories[0].id} className="mt-14">
          <TabsList
            className="mx-auto flex h-auto w-full max-w-lg flex-wrap justify-center gap-2 rounded-2xl bg-surface-elevated p-2 shadow-sm ring-1 ring-border/60"
            aria-label="Member categories"
          >
            {memberCategories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold data-active:bg-primary data-active:text-primary-foreground data-active:shadow-sm"
              >
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {memberCategories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="mt-10">
              <ul
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                role="list"
              >
                {category.members.map((member, index) => (
                  <li key={member.id}>
                    <article
                      className={cn(
                        "group card-hover overflow-hidden rounded-2xl bg-surface-elevated ring-1 ring-border/60",
                        index === 0 && "sm:col-span-2 lg:col-span-1"
                      )}
                    >
                      <div className="relative aspect-[5/4] overflow-hidden bg-muted">
                        <Image
                          src={member.image}
                          alt={member.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-brand-dark/90 via-brand-dark/20 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-5">
                          <h3 className="font-heading text-xl text-white">
                            {member.name}
                          </h3>
                          <p className="mt-0.5 text-sm font-medium text-brand-gold-light">
                            {member.position}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2.5 border-t border-border/60 p-5">
                        <a
                          href={`mailto:${member.email}`}
                          className="flex items-center gap-2.5 text-sm text-muted-foreground transition-colors hover:text-primary"
                        >
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary">
                            <Mail className="size-3.5" aria-hidden="true" />
                          </span>
                          <span className="truncate">{member.email}</span>
                        </a>
                        <a
                          href={`tel:${member.phone.replace(/\s/g, "")}`}
                          className="flex items-center gap-2.5 text-sm text-muted-foreground transition-colors hover:text-primary"
                        >
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary">
                            <Phone className="size-3.5" aria-hidden="true" />
                          </span>
                          <span>{member.phone}</span>
                        </a>
                      </div>
                    </article>
                  </li>
                ))}
              </ul>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
