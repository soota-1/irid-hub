import { Link } from "react-router-dom";
import { CalendarDays, Clock, Images, Trophy } from "lucide-react";
import { Card, TiltCard, StaggerReveal, StaggerItem } from "@/shared/components";

const highlights = [
  {
    to: "/events",
    icon: CalendarDays,
    title: "Kalender Event",
    description: "Lihat semua event komunitas mendatang, dari latihan sampai kompetisi.",
    accent: "events" as const,
  },
  {
    to: "/jadwal",
    icon: Clock,
    title: "Jadwal Latihan",
    description: "Jadwal latihan rutin mingguan supaya kamu nggak pernah ketinggalan sesi.",
    accent: "schedules" as const,
  },
  {
    to: "/galeri",
    icon: Images,
    title: "Galeri",
    description: "Dokumentasi momen-momen terbaik dari setiap kegiatan komunitas.",
    accent: "gallery" as const,
  },
  {
    to: "/prestasi",
    icon: Trophy,
    title: "Prestasi",
    description: "Rekam jejak pencapaian komunitas dan member yang membanggakan.",
    accent: "achievements" as const,
  },
];

export function HighlightSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <h2 className="text-h2 text-center">Semua yang kamu butuhkan</h2>
      <StaggerReveal className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {highlights.map((h) => (
          <StaggerItem key={h.to}>
            <TiltCard>
              <Link to={h.to} className="block h-full">
                <Card accent={h.accent} className="p-6 h-full">
                  <h.icon className="text-iri-violet" size={28} />
                  <h3 className="text-h3 mt-4">{h.title}</h3>
                  <p className="text-surface-muted text-sm mt-2">{h.description}</p>
                </Card>
              </Link>
            </TiltCard>
          </StaggerItem>
        ))}
      </StaggerReveal>
    </section>
  );
}
