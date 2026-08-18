import { UserProfile } from "@clerk/clerk-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { useMe } from "../api/useMe";

export function MemberProfilePage() {
  const { data: me } = useMe();

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-h1">Akun Saya</h1>
      {me?.created_at && (
        <p className="text-surface-muted mt-1">
          Member sejak {format(new Date(me.created_at), "MMMM yyyy", { locale: idLocale })}
        </p>
      )}

      <div className="mt-8">
        <UserProfile
          appearance={{
            variables: {
              colorPrimary: "#8B5CF6",
              borderRadius: "12px",
            },
          }}
        />
      </div>
    </div>
  );
}
