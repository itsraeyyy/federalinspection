import { Menubar } from "@/components/menubar";
import { HeroSection } from "@/components/hero-section";
import { ChairmanMessageSection } from "@/components/chairman-message-section";
import { NewsMessagesSection } from "@/components/news-messages-section";
import { MembersSection } from "@/components/members-section";
import { AboutMissionVisionSection } from "@/components/about-mission-vision-section";
import { AnalyticsSection } from "@/components/analytics-section";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <>
      <Menubar />
      <main id="main-content">
        <HeroSection />
        <AboutMissionVisionSection />
        <ChairmanMessageSection />
        <NewsMessagesSection />
        <MembersSection />
        <AnalyticsSection />
      </main>
      <Footer />
    </>
  );
}
