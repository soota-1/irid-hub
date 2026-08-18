import { Clock, MapPin } from "lucide-react";
import { Card, Skeleton, StaggerReveal, StaggerItem } from "@/shared/components";
import { useSchedules } from "../api/useSchedules";
import { dayLabels } from "../types";

export function SchedulesPage() {
  const { data: schedules, isPending, isError } = useSchedules();

  const byDay = (schedules ?? []).reduce<Record<number, typeof schedules>>((acc, s) => {
    (acc[s.day_of_week ?? 0] ??= []).push(s);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-h1">Jadwal Latihan Rutin</h1>
      <p className="text-surface-muted mt-1">Konsisten latihan bareng, yuk atur jadwalmu.</p>

      {isError && <p className="text-danger mt-8">Gagal memuat jadwal. Coba muat ulang halaman.</p>}

      {isPending && (
        <div className="mt-8 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      )}

      {!isPending && (schedules?.length ?? 0) === 0 && !isError && (
        <p className="text-surface-muted mt-8">Belum ada jadwal latihan yang diumumkan.</p>
      )}

      <StaggerReveal className="mt-8 space-y-6">
        {Object.entries(byDay)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([day, items]) => (
            <StaggerItem key={day}>
              <h2 className="text-h3 mb-3">{dayLabels[Number(day)]}</h2>
              <div className="space-y-3">
                {items?.map((s) => (
                  <Card key={s.id} accent="schedules" className="p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-surface">{s.title}</p>
                      {s.location && (
                        <p className="text-sm text-surface-muted flex items-center gap-1.5 mt-1">
                          <MapPin size={14} />
                          {s.location}
                        </p>
                      )}
                    </div>
                    <p className="text-sm text-surface-muted flex items-center gap-1.5 shrink-0">
                      <Clock size={14} />
                      {s.start_time?.slice(0, 5)}–{s.end_time?.slice(0, 5)}
                    </p>
                  </Card>
                ))}
              </div>
            </StaggerItem>
          ))}
      </StaggerReveal>
    </div>
  );
}
