import { useTranslation } from "react-i18next";
import { KickerLabel, StaggerReveal } from "@/shared/components";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Story {
  quote: string;
  name: string;
  style: string;
}

/** Illustrative example copy (uiux.md §MEMBER STORIES) — there's no
 * testimonials table in the schema, so this is editorial content the
 * community would swap in, not live API data. Translated as part of the
 * bundled marketing copy (unlike backend-sourced content, this is ours). */
export function MemberStories() {
  const { t } = useTranslation("landing");
  const stories = t("stories.items", { returnObjects: true }) as Story[];

  return (
    <section className="border-y border-border bg-card/40">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <KickerLabel>{t("stories.kicker")}</KickerLabel>
        <h2 className="mt-3 font-display text-h2">{t("stories.title")}</h2>

        <StaggerReveal className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {stories.map((story) => (
            <figure key={story.name} className="rounded-lg border border-border bg-card p-6">
              <blockquote className="text-body-lg leading-relaxed">&ldquo;{story.quote}&rdquo;</blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{story.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <p className="font-semibold">{story.name}</p>
                  <p className="text-muted-foreground">{story.style}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </StaggerReveal>
      </div>
    </section>
  );
}
