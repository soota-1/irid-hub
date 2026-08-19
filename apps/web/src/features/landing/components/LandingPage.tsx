import { Hero } from "./Hero";
import { CommunitySnapshot } from "./CommunitySnapshot";
import { FeatureDoors } from "./FeatureDoors";
import { UpcomingEventsSection } from "./UpcomingEventsSection";
import { AchievementShowcase } from "./AchievementShowcase";
import { GalleryPreviewSection } from "./GalleryPreviewSection";
import { MemberStories } from "./MemberStories";
import { FinalCta } from "./FinalCta";

export function LandingPage() {
  return (
    <>
      <Hero />
      <CommunitySnapshot />
      <FeatureDoors />
      <UpcomingEventsSection />
      <AchievementShowcase />
      <GalleryPreviewSection />
      <MemberStories />
      <FinalCta />
    </>
  );
}
