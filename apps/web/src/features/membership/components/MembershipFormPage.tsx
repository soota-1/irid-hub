import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import confetti from "canvas-confetti";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { KickerLabel, GradientMesh } from "@/shared/components";
import { useSubmitApplication } from "../api/useSubmitApplication";
import { MembershipSuccessScene } from "./MembershipSuccessScene";

/** Validation messages must re-localize when the language toggles, so the
 * schema is built from `t` inside the component (memoized on language)
 * rather than as a module-level constant. */
function buildSchema(t: (key: string) => string) {
  return z.object({
    full_name: z.string().min(2, t("join.errors.fullName")),
    email: z.string().email(t("join.errors.email")),
    phone: z.string().min(8, t("join.errors.phone")),
    motivation: z.string().max(1000).optional(),
  });
}

type FormValues = z.infer<ReturnType<typeof buildSchema>>;

/** Registration collects only what the API accepts
 * (`submitMembershipApplicationRequest`: full_name/email/phone/motivation)
 * — the richer field set in uiux.md §14 (age, dance style, Instagram) has
 * no backing column in `membership_applications` (Schema.md §2.4), so it's
 * deliberately left out rather than collected and silently dropped. */
export function MembershipFormPage() {
  const [succeeded, setSucceeded] = useState(false);
  const submit = useSubmitApplication();
  const { t } = useTranslation("membership");
  const schema = useMemo(() => buildSchema(t), [t]);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!succeeded) return;
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#8b5cf6", "#ec4899", "#fbbf24", "#22d3ee"],
    });
  }, [succeeded]);

  function onSubmit(values: FormValues) {
    submit.mutate(values, { onSuccess: () => setSucceeded(true) });
  }

  if (succeeded) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-5 py-24 text-center">
        <MembershipSuccessScene />
        <h1 className="font-display text-h2">{t("join.successTitle")}</h1>
        <p className="text-muted-foreground">{t("join.successBody")}</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      <GradientMesh className="opacity-20" />
      <div className="relative mx-auto max-w-xl px-5 py-16">
        <KickerLabel>{t("join.kicker")}</KickerLabel>
        <h1 className="mt-3 font-display text-h1">{t("join.title")}</h1>
        <p className="mt-3 text-body-lg text-muted-foreground">{t("join.subtitle")}</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-10 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="full_name">{t("join.fields.fullName")}</Label>
            <Input id="full_name" {...register("full_name")} />
            {errors.full_name && <p className="text-xs text-danger">{errors.full_name.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">{t("join.fields.email")}</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">{t("join.fields.phone")}</Label>
            <Input id="phone" type="tel" {...register("phone")} />
            {errors.phone && <p className="text-xs text-danger">{errors.phone.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="motivation">{t("join.fields.motivation")}</Label>
            <Textarea id="motivation" rows={4} {...register("motivation")} />
          </div>

          {submit.isError && <p className="text-sm text-danger">{t("join.errors.submitFailed")}</p>}

          <Button type="submit" variant="gradient" size="lg" disabled={isSubmitting} className="mt-2 p-2">
            {isSubmitting ? t("join.submitting") : t("join.submit")}
          </Button>
        </form>
      </div>
    </div>
  );
}
