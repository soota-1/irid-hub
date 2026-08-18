import { useAuth } from "@clerk/clerk-react";
import { Skeleton, StaggerReveal, StaggerItem } from "@/shared/components";
import { useAnnouncements, useInternalAnnouncements } from "../api/useAnnouncements";
import { AnnouncementBanner } from "./AnnouncementBanner";

export function AnnouncementsPage() {
  const { isSignedIn } = useAuth();
  // Signed-in members see members_only content too (via /announcements/internal);
  // guests only see the public feed — Task.md Phase 2.3.
  const publicQuery = useAnnouncements();
  const internalQuery = useInternalAnnouncements();
  const { data, isPending, isError } = isSignedIn ? internalQuery : publicQuery;
  const announcements = data?.data ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-h1">Pengumuman</h1>
      <p className="text-surface-muted mt-1">
        {isSignedIn ? "Termasuk pengumuman khusus member." : "Info terbaru seputar komunitas."}
      </p>

      {isError && <p className="text-danger mt-8">Gagal memuat pengumuman.</p>}

      {isPending && (
        <div className="mt-8 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      )}

      {!isPending && announcements.length === 0 && !isError && (
        <p className="text-surface-muted mt-8">Belum ada pengumuman.</p>
      )}

      <StaggerReveal className="mt-8 space-y-4">
        {announcements.map((a) => (
          <StaggerItem key={a.id}>
            <AnnouncementBanner announcement={a} />
          </StaggerItem>
        ))}
      </StaggerReveal>
    </div>
  );
}
