import { Card, StaggerReveal, StaggerItem } from "@/shared/components";

/**
 * Placeholder member quotes — there's no testimonials table in the backend
 * (this is static marketing copy, not user data), so replace these with
 * real member quotes when available.
 */
const testimonials = [
  {
    quote: "Gabung di sini bikin latihan jadi lebih konsisten — jadwalnya jelas, nggak pernah kelewat info event.",
    name: "Member Komunitas",
  },
  {
    quote: "Suka banget sama galerinya, semua momen latihan dan kompetisi kerekam rapi di satu tempat.",
    name: "Member Komunitas",
  },
  {
    quote: "Proses daftar gampang banget, tinggal isi form terus tim langsung follow up.",
    name: "Member Baru",
  },
];

export function TestimonialSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <h2 className="text-h2 text-center">Kata Mereka</h2>
      <StaggerReveal className="mt-10 grid sm:grid-cols-3 gap-5">
        {testimonials.map((t, i) => (
          <StaggerItem key={i}>
            <Card className="p-6 h-full">
              <p className="text-surface italic">&ldquo;{t.quote}&rdquo;</p>
              <p className="text-caption text-surface-muted mt-4">— {t.name}</p>
            </Card>
          </StaggerItem>
        ))}
      </StaggerReveal>
    </section>
  );
}
