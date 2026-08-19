import { UserProfile } from "@clerk/clerk-react";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { KickerLabel } from "@/shared/components";
import { useMe } from "../api/useMe";

/** No "my RSVPs" / "my achievements" endpoint exists in the API contract
 * (only `member_id` filters on the admin side), so this page sticks to
 * what's actually available: our synced profile record + Clerk's own
 * account management UI for editing it. */
export function MemberProfilePage() {
  const { data: user, isLoading } = useMe();
  const { t } = useTranslation("membership");

  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <KickerLabel>{t("profile.kicker")}</KickerLabel>
      <h1 className="mt-3 font-display text-h1">{t("profile.title")}</h1>

      {isLoading ? (
        <Skeleton className="mt-8 h-24 w-full rounded-lg" />
      ) : user ? (
        <div className="mt-8 flex items-center gap-4 rounded-lg border border-border bg-card p-6">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.avatar_url ?? undefined} alt={user.full_name ?? ""} />
            <AvatarFallback>{user.full_name?.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-display text-lg font-semibold">{user.full_name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            {user.phone && <p className="text-sm text-muted-foreground">{user.phone}</p>}
          </div>
        </div>
      ) : null}

      <div className="mt-10 [&_.cl-rootBox]:w-full">
        <UserProfile routing="hash" appearance={{ variables: { colorPrimary: "#8b5cf6" } }} />
      </div>
    </div>
  );
}
