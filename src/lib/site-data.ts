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

  { label: "መነሻ", href: "/" },

  { label: "ስለ እኛ", href: "/about" },

  { label: "ሰነዶች", href: "/files" },

  { label: "መረጃ", href: "/statistics" },

  { label: "አቤቱታ", href: "/abetuta" },

  { label: "ጥቆማ", href: "/tikoma" },

  { label: "አስተያየት", href: "/asteyayet" },

  { label: "ያግኙን", href: "/contact" },

];



export const newsItems: NewsItem[] = [

  {

    id: "1",

    title: "ብሔራዊ የኢንስፔክሽን መስፈርቶች ለ2026 ተዘምነዋል",

    date: "ሰኔ 10, 2026",

    description:

      "ኮሚሽኑ የ2026 የኢንስፔክሽን መስፈርቶችን በሁሉም ክልሎች ለመተግበር የሚያስችል አዲስ መመሪያ አውጥቷል።",

    image: "__placeholder__",

  },

  {

    id: "2",

    title: "ሩብ ዓመታዊ የሕግ ማክበር ሪፖርት ታተመ",

    date: "ሰኔ 5, 2026",

    description:

      "የፓርቲ ተቋማት ሕግና መመሪያዎችን የሚያከብሩበትን ሁኔታ የሚያሳይ ሩብ ዓመታዊ ሪፖርት ተሰርቷል።",

    image: "__placeholder__",

  },

  {

    id: "3",

    title: "ለሜዳ ኢንስፔክተሮች የሥልጠና ፕሮግራም ተጀመረ",

    date: "ሜይ 28, 2026",

    description:

      "በ14 ክልሎች ለሚገኙ የኢንስፔክሽን ባለሙያዎች የተዘጋጀ ሥልጠና በወቅቱ ተጀምሯል።",

    image: "__placeholder__",

  },

  {

    id: "4",

    title: "ስለ ሥነ-ምግባር አመራር እና ተጠያቂነት የጋራ ፎረም",

    date: "ሜይ 15, 2026",

    description:

      "የፓርቲ አመራሮች ሥነ-ምግባርና ተጠያቂነትን ለማጠናከር የጋራ ፍተሻ መድረክ ተካሄደ።",

    image: "__placeholder__",

  },

  {

    id: "5",

    title: "የክልል ጽ/ቤት አፈጻጸም ኦዲቶች ተጠናቀቁ",

    date: "ሜይ 08, 2026",

    description:

      "በክልል ጽ/ቤቶች የተካሄዱ የአፈጻጸም ኦዲቶች ውጤቶች ተዘርዝረው ለሥራ አስፈጻሚው ተሰጥተዋል።",

    image: "__placeholder__",

  },

];



export const memberCategories: MemberCategory[] = [

  {

    id: "secretariat",

    label: "ኮሚሽን ጽ/ቤት",

    members: [

      {

        id: "sec-1",

        name: "ዋና ኮሚሽነር",

        position: "ዋና ኮሚሽነር",

        email: "",

        phone: "",

        image: "__placeholder__",

      },

      {

        id: "sec-2",

        name: "ምክትል ኮሚሽነር",

        position: "ምክትል ኮሚሽነር",

        email: "",

        phone: "",

        image: "__placeholder__",

      },

      {

        id: "sec-3",

        name: "ጸሃፊና ጽህፈት ቤት ሃላፊ",

        position: "የኮሚሽን ጸሃፊና ጽህፈት ቤት ሃላፊ",

        email: "",

        phone: "",

        image: "__placeholder__",

      },

      {

        id: "sec-5",

        name: "ስራ አመራር አባል",

        position: "የኮሚሽን ስራ አመራር ኮሚቴ አባላት",

        email: "",

        phone: "",

        image: "__placeholder__",

      },

      {

        id: "sec-6",

        name: "ማኔጅመንት አባል",

        position: "ኮሚሽን ማኔጅመንት አባላት",

        email: "",

        phone: "",

        image: "__placeholder__",

      },

    ],

  },

  {

    id: "branch",

    label: "ኮሚሽን ቅርንጫፍ ጽ/ቤት",

    members: [

      {

        id: "br-1",

        name: "ዋና ኮሚሽነር",

        position: "ዋና ኮሚሽነር (ቅርንጫፍ)",

        email: "",

        phone: "",

        image: "__placeholder__",

      },

      {

        id: "br-2",

        name: "ምክትል ኮሚሽነር",

        position: "ምክትል ኮሚሽነር (ቅርንጫፍ)",

        email: "",

        phone: "",

        image: "__placeholder__",

      },

      {

        id: "br-3",

        name: "ጸሃፊ",

        position: "የኮሚሽን ጸሃፊና ጽህፈት ቤት ሃላፊ (ቅርንጫፍ)",

        email: "",

        phone: "",

        image: "__placeholder__",

      },

    ],

  },

  {

    id: "commission-members",

    label: "ኮሚሽን አባላት",

    members: [

      {

        id: "cm-1",

        name: "ኮሚሽን አባል",

        position: "ኮሚሽን አባላት",

        email: "",

        phone: "",

        image: "__placeholder__",

      },

    ],

  },

];



export const metrics: Metric[] = [

  {

    id: "inspections",

    label: "የተካሄዱ ጠቅላላ ኢንስፔክሽኖች",

    value: "12,847",

    icon: "clipboard",

  },

  {

    id: "compliance",

    label: "የሕግ ማክበር መጠን",

    value: "94.2%",

    icon: "shield",

  },

  {

    id: "reports",

    label: "የተሰሩ ሪፖርቶች",

    value: "3,256",

    icon: "file",

  },

  {

    id: "cases",

    label: "ንቁ ጉዳዮች",

    value: "187",

    icon: "briefcase",

  },

];



export const responsibilities: Responsibility[] = [

  {

    id: "1",

    title: "ጥራት ያለው ኢንስፔክሽን መካሄድ",

    description:

      "የመንግሥት አገልግሎቶችና ተቋማት የተቀመጡትን ጥራት መስፈርቶች እንደሚያሟሉ በስርዓተ መሠረት መገምገም።",

    icon: "check",

  },

  {

    id: "2",

    title: "የሕግ ማክበር ማረጋገጥ",

    description:

      "በሁሉም ዘርፎች የብሔራዊ መመሪያዎች፣ ፖሊሲዎችና ሂደቶች መከበራቸውን መከታተል።",

    icon: "shield",

  },

  {

    id: "3",

    title: "ጥሰቶችን ሪፖርት ማድረግ እና ሐሳብ መስጠት",

    description:

      "የተገኙ ጥሰቶችን ማስመዝገብ፣ ሪፖርት ማቅረብ እና ለማሻሻል ተግባራዊ ሐሳቦችን መስጠት።",

    icon: "file",

  },

  {

    id: "4",

    title: "የተጠያቂነት መስፈርቶችን ማስተዋወቅ",

    description:

      "ግልጽነትና ተጠያቂነትን ለማጠናከር በመንግሥት ተቋማት የህዝብ ጥምነት መገንባት።",

    icon: "check",

  },

  {

    id: "5",

    title: "የተቋም ማሻሻያ ድጋፍ",

    description:

      "አገልግሎት አቅርቦትንና አስተዳደርን ለማጠናከር ከተቋማት ጋር በመተባበር ማሻሻያ መተግበር።",

    icon: "shield",

  },

  {

    id: "6",

    title: "የአፈጻጸም ትንተና ማተም",

    description:

      "በኢንስፔክሽን ውጤቶችና በሕግ ማክበር ላይ የተመሰረቱ የህዝብ ሪፖርቶችንና መረጃዎችን መስጠት።",

    icon: "file",

  },

];

