import ReactMarkdown from "react-markdown";
import { useCommunity } from "../api/useCommunity";
import { Skeleton } from "@/shared/components";

export function CommunityProfilePage() {
  const { data: community, isPending, isError } = useCommunity();

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      {isPending && (
        <div className="space-y-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      )}

      {isError && <p className="text-danger">Gagal memuat profil komunitas. Coba muat ulang halaman.</p>}

      {community && (
        <>
          {community.cover_image_url && (
            <img
              src={community.cover_image_url}
              alt=""
              className="w-full aspect-[3/1] object-cover rounded-lg mb-8"
            />
          )}
          <h1 className="text-h1">{community.name}</h1>
          {community.tagline && <p className="text-body-lg text-surface-muted mt-2">{community.tagline}</p>}

          {community.description ? (
            <div className="prose prose-neutral max-w-none mt-8">
              <ReactMarkdown>{community.description}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-surface-muted mt-8">Profil komunitas belum dilengkapi.</p>
          )}
        </>
      )}
    </div>
  );
}
