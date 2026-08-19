import { AlertTriangle, Info, Megaphone } from "lucide-react";
import type { AnnouncementDTO } from "@/shared/types/api";
import { cn } from "@/shared/lib/cn";

const URGENCY_META: Record<AnnouncementDTO["urgency"], { accent: string; Icon: typeof Info }> = {
  info: { accent: "bg-info", Icon: Info },
  warning: { accent: "bg-warning", Icon: AlertTriangle },
  important: { accent: "bg-danger", Icon: Megaphone },
};

interface AnnouncementBannerProps {
  announcement: Pick<AnnouncementDTO, "title" | "content" | "urgency">;
  className?: string;
}

/** Left accent bar by urgency — Design.md §7. */
export function AnnouncementBanner({ announcement, className }: AnnouncementBannerProps) {
  const meta = URGENCY_META[announcement.urgency];
  const Icon = meta.Icon;

  return (
    <div className={cn("flex gap-3 overflow-hidden rounded-md border border-border bg-card", className)}>
      <div className={cn("w-1 shrink-0", meta.accent)} aria-hidden />
      <div className="flex items-start gap-3 py-3 pr-4">
        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <p className="text-sm font-semibold">{announcement.title}</p>
          <p className="text-sm text-muted-foreground">{announcement.content}</p>
        </div>
      </div>
    </div>
  );
}
