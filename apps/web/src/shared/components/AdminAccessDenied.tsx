import { Link } from "react-router-dom";
import { RefreshCw, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/shared/lib/apiClient";

interface AdminAccessDeniedProps {
  error?: unknown;
  onRetry?: () => void;
}

/** UNAUTHORIZED and FORBIDDEN mean genuinely different things here and get
 * different copy — conflating them into one generic "access denied" hides
 * the actionable case (account not synced yet, which is usually just a
 * webhook/timing problem, not a real permissions problem). */
export function AdminAccessDenied({ error, onRetry }: AdminAccessDeniedProps) {
  const isApiError = error instanceof ApiError;
  const notSyncedYet = isApiError && error.code === "UNAUTHORIZED";
  const notAdmin = isApiError && error.code === "FORBIDDEN";
  const unreachable = Boolean(error) && !isApiError;

  const title = notSyncedYet ? "Akun belum tersinkron" : notAdmin ? "Akses ditolak" : "Tidak bisa memuat panel admin";
  const description = notSyncedYet
    ? "Akun Clerk kamu belum ada di database komunitas (biasanya karena webhook user.created belum sempat masuk, atau di local dev belum dikonfigurasi — lihat CLERK_WEBHOOK_SIGNING_SECRET di apps/api/.env). Coba lagi sebentar, atau minta admin mengecek tabel users."
    : notAdmin
      ? "Akun kamu belum punya role admin/officer untuk komunitas ini. Hubungi pengurus komunitas kalau menurutmu ini keliru."
      : "Gagal menghubungi server API — cek apakah apps/api sedang jalan, VITE_API_BASE_URL benar, dan origin ini ada di CORS_ALLOWED_ORIGINS backend.";

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-5 py-24 text-center">
      <ShieldAlert className="h-10 w-10 text-warning" />
      <h1 className="font-display text-h3">{title}</h1>
      <p className="text-sm text-muted-foreground">{description}</p>
      {isApiError && (
        <p className="rounded-md bg-secondary/50 px-3 py-2 font-mono text-xs text-muted-foreground">
          {error.code}: {error.message}
        </p>
      )}
      {unreachable && (
        <p className="rounded-md bg-secondary/50 px-3 py-2 font-mono text-xs text-muted-foreground">
          {error instanceof Error ? error.message : String(error)}
        </p>
      )}
      <div className="flex gap-2">
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            <RefreshCw className="h-4 w-4" /> Coba lagi
          </Button>
        )}
        <Button variant="outline" asChild>
          <Link to="/">Kembali ke beranda</Link>
        </Button>
      </div>
    </div>
  );
}
