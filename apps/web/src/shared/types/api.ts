export interface PaginatedMeta {
  page: number;
  per_page: number;
  total: number;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  fields?: Record<string, string>;
}

export interface Envelope<T> {
  success: boolean;
  data: T;
  meta: PaginatedMeta | null;
  error: ApiErrorBody | null;
}

/**
 * Hand-written from the actual DTO structs in apps/api/internal/http/handler/*.go
 * (pointer field = nullable, value field = always present) rather than the
 * generated packages/shared-types/api.ts — swaggo/openapi-typescript marks
 * every string field `| null` indiscriminately, which doesn't reflect which
 * fields are actually Go pointers vs plain values.
 */

export interface EventDTO {
  id: string;
  community_id: string;
  title: string;
  description: string | null;
  category: "training" | "competition" | "social" | "other";
  location: string | null;
  start_at: string;
  end_at: string;
  cover_image_url: string | null;
  is_public: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AnnouncementDTO {
  id: string;
  community_id: string;
  title: string;
  content: string;
  urgency: "info" | "warning" | "important";
  visibility: "public" | "members_only";
  published_at: string | null;
  created_by: string;
  created_at: string;
}

export interface CommunityDTO {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  primary_color: string | null;
  created_at: string;
  updated_at: string;
}

export interface GalleryItemDTO {
  id: string;
  community_id: string;
  type: "photo" | "video";
  media_url: string;
  thumbnail_url: string | null;
  caption: string | null;
  event_id: string | null;
  uploaded_by: string;
  created_at: string;
}

export interface AchievementDTO {
  id: string;
  community_id: string;
  title: string;
  description: string | null;
  achieved_at: string;
  icon_or_badge_url: string | null;
  member_id: string | null;
}

export interface MembershipApplicationDTO {
  id: string;
  community_id: string;
  full_name: string;
  email: string;
  phone: string;
  motivation: string | null;
  status: "pending" | "approved" | "rejected";
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface MembershipDTO {
  id: string;
  community_id: string;
  user_id: string;
  role: "member" | "officer" | "admin";
  status: "active" | "inactive" | "banned";
  joined_at: string;
  bio: string | null;
}

export interface TrainingScheduleDTO {
  id: string;
  community_id: string;
  title: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  location: string | null;
  is_active: boolean;
}

export interface UserDTO {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

/** Not modeled in the OpenAPI spec (handler returns gin.H) — field names
 * copied from apps/api/internal/http/handler/admin_dashboard_handler.go. */
export interface AdminDashboardSummaryDTO {
  active_member_count: number;
  pending_applications: number;
  upcoming_event_count: number;
}
