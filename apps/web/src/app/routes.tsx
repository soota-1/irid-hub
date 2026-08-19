import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { SignIn, SignUp } from "@clerk/clerk-react";
import { PublicLayout } from "./layouts/PublicLayout";
import { AdminLayout } from "./layouts/AdminLayout";
import { ProtectedRoute } from "./layouts/ProtectedRoute";
import { Skeleton } from "@/components/ui/skeleton";
import NotFoundPage from "./NotFoundPage";

const LandingPage = lazy(() => import("@/features/landing").then((m) => ({ default: m.LandingPage })));
const CommunityProfilePage = lazy(() =>
  import("@/features/community-profile").then((m) => ({ default: m.CommunityProfilePage })),
);
const EventsPage = lazy(() => import("@/features/events").then((m) => ({ default: m.EventsPage })));
const SchedulesPage = lazy(() => import("@/features/schedules").then((m) => ({ default: m.SchedulesPage })));
const AnnouncementsPage = lazy(() =>
  import("@/features/announcements").then((m) => ({ default: m.AnnouncementsPage })),
);
const GalleryPage = lazy(() => import("@/features/gallery").then((m) => ({ default: m.GalleryPage })));
const AchievementsPage = lazy(() =>
  import("@/features/achievements").then((m) => ({ default: m.AchievementsPage })),
);
const MembershipFormPage = lazy(() =>
  import("@/features/membership").then((m) => ({ default: m.MembershipFormPage })),
);
const MemberProfilePage = lazy(() =>
  import("@/features/membership").then((m) => ({ default: m.MemberProfilePage })),
);

const AdminDashboardPage = lazy(() =>
  import("@/features/admin/dashboard").then((m) => ({ default: m.AdminDashboardPage })),
);
const EventsAdminPage = lazy(() =>
  import("@/features/admin/events-admin").then((m) => ({ default: m.EventsAdminPage })),
);
const SchedulesAdminPage = lazy(() =>
  import("@/features/admin/schedules-admin").then((m) => ({ default: m.SchedulesAdminPage })),
);
const AnnouncementsAdminPage = lazy(() =>
  import("@/features/admin/announcements-admin").then((m) => ({ default: m.AnnouncementsAdminPage })),
);
const GalleryAdminPage = lazy(() =>
  import("@/features/admin/gallery-admin").then((m) => ({ default: m.GalleryAdminPage })),
);
const AchievementsAdminPage = lazy(() =>
  import("@/features/admin/achievements-admin").then((m) => ({ default: m.AchievementsAdminPage })),
);
const MembersAdminPage = lazy(() =>
  import("@/features/admin/members-admin").then((m) => ({ default: m.MembersAdminPage })),
);

function PageFallback() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <Skeleton className="h-96 w-full" />
    </div>
  );
}

export function AppRoutes() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/profil" element={<CommunityProfilePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/jadwal" element={<SchedulesPage />} />
          <Route path="/pengumuman" element={<AnnouncementsPage />} />
          <Route path="/galeri" element={<GalleryPage />} />
          <Route path="/prestasi" element={<AchievementsPage />} />
          <Route path="/gabung" element={<MembershipFormPage />} />
          <Route path="/sign-in/*" element={<div className="flex justify-center py-16"><SignIn routing="path" path="/sign-in" /></div>} />
          <Route path="/sign-up/*" element={<div className="flex justify-center py-16"><SignUp routing="path" path="/sign-up" /></div>} />
          <Route
            path="/akun"
            element={
              <ProtectedRoute>
                <MemberProfilePage />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="events" element={<EventsAdminPage />} />
          <Route path="schedules" element={<SchedulesAdminPage />} />
          <Route path="announcements" element={<AnnouncementsAdminPage />} />
          <Route path="gallery" element={<GalleryAdminPage />} />
          <Route path="achievements" element={<AchievementsAdminPage />} />
          <Route path="members" element={<MembersAdminPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
