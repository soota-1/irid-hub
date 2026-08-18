import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { GradientMesh } from "@/shared/components";
import { HeroIllustration } from "./HeroIllustration";

export function Hero({ communityName }: { communityName?: string }) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.08]">
        <GradientMesh />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <p className="text-caption font-semibold uppercase tracking-wide bg-iridescent bg-clip-text text-transparent">
            {communityName ?? "Iridescent"}
          </p>
          <h1 className="text-display mt-3 max-w-xl">
            Rumah digital untuk komunitas yang{" "}
            <span className="bg-iridescent bg-clip-text text-transparent">terus bergerak</span>
          </h1>
          <p className="text-body-lg text-surface-muted mt-5 max-w-lg">
            Jadwal latihan, kalender event, galeri, dan pendaftaran member — semua di satu tempat, tidak lagi
            tersebar di story yang hilang dalam 24 jam.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/gabung"
              className="inline-flex items-center justify-center h-13 px-7 rounded-lg text-base font-medium text-white bg-iridescent bg-[length:200%_100%] bg-left hover:bg-right shadow-[0_16px_32px_-10px_rgba(139,92,246,0.45)] transition-[background-position,box-shadow] duration-300"
            >
              Gabung Komunitas
            </Link>
            <Link
              to="/events"
              className="inline-flex items-center justify-center h-13 px-7 rounded-lg text-base font-medium border border-neutral-200 hover:border-iri-violet hover:text-iri-violet transition-colors"
            >
              Lihat Kalender Event
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="max-w-md mx-auto lg:max-w-none"
        >
          <HeroIllustration />
        </motion.div>
      </div>
    </section>
  );
}
