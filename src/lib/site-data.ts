export interface NavLink {
  label: string;
  href: string;
}

export interface NewsItem {
  id: string;
  title: string;
  date: string;
  description: string;
  image: string;
}

export interface Member {
  id: string;
  name: string;
  position: string;
  email: string;
  phone: string;
  image: string;
}

export interface MemberCategory {
  id: string;
  label: string;
  members: Member[];
}

export interface Metric {
  id: string;
  label: string;
  value: string;
  icon: "clipboard" | "shield" | "file" | "briefcase";
}

export interface Responsibility {
  id: string;
  title: string;
  description: string;
  icon: "check" | "shield" | "file";
}

export const navLinks: NavLink[] = [
  { label: "Home", href: "#home" },
  { label: "Sle-Egna", href: "#about" },
  { label: "Senedoch", href: "#news" },
  { label: "Yagegnun", href: "#members" },
];

export const newsItems: NewsItem[] = [
  {
    id: "1",
    title: "National Inspection Standards Updated for 2026",
    date: "June 10, 2026",
    description:
      "New quality assurance guidelines strengthen accountability across federal institutions and regional offices.",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
  },
  {
    id: "2",
    title: "Quarterly Compliance Report Published",
    date: "June 5, 2026",
    description:
      "The Inspection Sector releases its Q2 report highlighting improved compliance rates and key findings.",
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80",
  },
  {
    id: "3",
    title: "Training Program for Field Inspectors Launched",
    date: "May 28, 2026",
    description:
      "A comprehensive training initiative equips inspectors with modern tools and standardized evaluation methods.",
    image:
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80",
  },
];

export const memberCategories: MemberCategory[] = [
  {
    id: "leadership",
    label: "Leadership",
    members: [
      {
        id: "l1",
        name: "Dr. Abebe Kebede",
        position: "Commission Director",
        email: "abebe.kebede@pp-inspection.gov.et",
        phone: "+251 11 123 4567",
        image:
          "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80",
      },
      {
        id: "l2",
        name: "H.E. Tigist Haile",
        position: "Deputy Director",
        email: "tigist.haile@pp-inspection.gov.et",
        phone: "+251 11 123 4568",
        image:
          "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
      },
      {
        id: "l3",
        name: "Eng. Solomon Tadesse",
        position: "Chief of Operations",
        email: "solomon.tadesse@pp-inspection.gov.et",
        phone: "+251 11 123 4569",
        image:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80",
      },
    ],
  },
  {
    id: "inspectors",
    label: "Inspectors",
    members: [
      {
        id: "i1",
        name: "Mulugeta Assefa",
        position: "Senior Field Inspector",
        email: "mulugeta.assefa@pp-inspection.gov.et",
        phone: "+251 11 123 4570",
        image:
          "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80",
      },
      {
        id: "i2",
        name: "Selamawit Bekele",
        position: "Compliance Inspector",
        email: "selamawit.bekele@pp-inspection.gov.et",
        phone: "+251 11 123 4571",
        image:
          "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80",
      },
      {
        id: "i3",
        name: "Yonas Mekonnen",
        position: "Regional Inspector",
        email: "yonas.mekonnen@pp-inspection.gov.et",
        phone: "+251 11 123 4572",
        image:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
      },
    ],
  },
  {
    id: "support",
    label: "Support Staff",
    members: [
      {
        id: "s1",
        name: "Hanna Girma",
        position: "Administrative Coordinator",
        email: "hanna.girma@pp-inspection.gov.et",
        phone: "+251 11 123 4573",
        image:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
      },
      {
        id: "s2",
        name: "Daniel Worku",
        position: "Data Analyst",
        email: "daniel.worku@pp-inspection.gov.et",
        phone: "+251 11 123 4574",
        image:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
      },
      {
        id: "s3",
        name: "Meron Tesfaye",
        position: "Public Relations Officer",
        email: "meron.tesfaye@pp-inspection.gov.et",
        phone: "+251 11 123 4575",
        image:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80",
      },
    ],
  },
];

export const metrics: Metric[] = [
  {
    id: "inspections",
    label: "Total Inspections Conducted",
    value: "12,847",
    icon: "clipboard",
  },
  {
    id: "compliance",
    label: "Compliance Rate",
    value: "94.2%",
    icon: "shield",
  },
  {
    id: "reports",
    label: "Reports Generated",
    value: "3,256",
    icon: "file",
  },
  {
    id: "cases",
    label: "Active Cases",
    value: "187",
    icon: "briefcase",
  },
];

export const responsibilities: Responsibility[] = [
  {
    id: "1",
    title: "Conduct Quality Inspections",
    description:
      "Systematically evaluate government services and institutions to ensure they meet established quality standards.",
    icon: "check",
  },
  {
    id: "2",
    title: "Ensure Regulatory Compliance",
    description:
      "Monitor adherence to national regulations, policies, and procedural guidelines across all sectors.",
    icon: "shield",
  },
  {
    id: "3",
    title: "Report Violations & Recommendations",
    description:
      "Document findings, report violations, and provide actionable recommendations for improvement.",
    icon: "file",
  },
  {
    id: "4",
    title: "Promote Accountability Standards",
    description:
      "Champion transparency and accountability to build public trust in government institutions.",
    icon: "check",
  },
  {
    id: "5",
    title: "Support Institutional Reform",
    description:
      "Partner with agencies to implement reforms that strengthen service delivery and governance.",
    icon: "shield",
  },
  {
    id: "6",
    title: "Publish Performance Analytics",
    description:
      "Provide data-driven insights and public reports on inspection outcomes and compliance trends.",
    icon: "file",
  },
];
