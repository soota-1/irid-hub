import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/shared/components";
import { useSubmitApplication } from "../api/useSubmitApplication";
import { ApiClientError } from "@/shared/lib/apiClient";

const schema = z.object({
  full_name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  phone: z.string().min(8, "Nomor telepon minimal 8 digit"),
  motivation: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

// Iridescent palette — Design.md §2, so the confetti stays on-brand instead
// of default red/green/blue.
const CONFETTI_COLORS = ["#8B5CF6", "#EC4899", "#FB7185", "#FBBF24", "#34D399", "#22D3EE"];

function fireConfetti() {
  confetti({
    particleCount: 90,
    spread: 70,
    origin: { y: 0.6 },
    colors: CONFETTI_COLORS,
    disableForReducedMotion: true,
  });
}

export function MembershipFormPage() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const submitApplication = useSubmitApplication();

  async function onSubmit(values: FormValues) {
    try {
      await submitApplication.mutateAsync(values);
      fireConfetti();
    } catch (err) {
      if (err instanceof ApiClientError && err.fields) {
        for (const [field, message] of Object.entries(err.fields)) {
          setError(field as keyof FormValues, { message });
        }
      } else if (err instanceof ApiClientError) {
        setError("root", { message: err.message });
      }
    }
  }

  if (submitApplication.isSuccess) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <CheckCircle2 size={64} className="mx-auto text-success" />
        </motion.div>
        <h1 className="text-h2 mt-6">Pendaftaran Terkirim!</h1>
        <p className="text-surface-muted mt-2">
          Terima kasih sudah mendaftar. Tim kami akan meninjau pendaftaranmu dan menghubungi lewat email.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 py-16">
      <h1 className="text-h1">Gabung Komunitas</h1>
      <p className="text-surface-muted mt-1">Isi form di bawah, tim kami akan meninjau pendaftaranmu.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium mb-1.5">
            Nama Lengkap
          </label>
          <input
            id="full_name"
            {...register("full_name")}
            className="w-full h-11 px-3.5 rounded-md border border-neutral-200 bg-surface text-surface"
            aria-invalid={!!errors.full_name}
            aria-describedby={errors.full_name ? "full_name-error" : undefined}
          />
          {errors.full_name && (
            <p id="full_name-error" className="text-caption text-danger mt-1">
              {errors.full_name.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className="w-full h-11 px-3.5 rounded-md border border-neutral-200 bg-surface text-surface"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <p id="email-error" className="text-caption text-danger mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-1.5">
            Nomor Telepon / WhatsApp
          </label>
          <input
            id="phone"
            {...register("phone")}
            className="w-full h-11 px-3.5 rounded-md border border-neutral-200 bg-surface text-surface"
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? "phone-error" : undefined}
          />
          {errors.phone && (
            <p id="phone-error" className="text-caption text-danger mt-1">
              {errors.phone.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="motivation" className="block text-sm font-medium mb-1.5">
            Kenapa mau gabung? <span className="text-surface-muted font-normal">(opsional)</span>
          </label>
          <textarea
            id="motivation"
            rows={4}
            {...register("motivation")}
            className="w-full px-3.5 py-2.5 rounded-md border border-neutral-200 bg-surface text-surface resize-none"
          />
        </div>

        {errors.root && <p className="text-danger text-sm">{errors.root.message}</p>}

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Mengirim..." : "Kirim Pendaftaran"}
        </Button>
      </form>
    </div>
  );
}
