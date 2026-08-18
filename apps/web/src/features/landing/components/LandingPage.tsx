import { useCommunity } from "@/features/community-profile";
import { Hero } from "./Hero";
import { HighlightSection } from "./HighlightSection";
import { AchievementCarousel } from "./AchievementCarousel";
import { GalleryPreviewSection } from "./GalleryPreviewSection";
import { TestimonialSection } from "./TestimonialSection";
import { StickyJoinCta } from "./StickyJoinCta";

export function LandingPage() {
  const { data: community } = useCommunity();

  return (
    <div>
      <Hero communityName={community?.name ?? undefined} />
      <HighlightSection />
      <AchievementCarousel />
      <GalleryPreviewSection />
      <TestimonialSection />
      <StickyJoinCta />
    </div>
  );
}
