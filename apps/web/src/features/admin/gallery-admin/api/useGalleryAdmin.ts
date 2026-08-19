import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "@/shared/hooks/useApiClient";
import type { GalleryItemDTO } from "@/shared/types/api";
import type { PresignedUpload } from "@/shared/types/gallery";

/** No /admin/gallery — admin reuses the public list endpoint at a higher
 * page size (router.go has no ListAdmin for gallery). */
export function useGalleryAdmin() {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ["admin", "gallery"],
    queryFn: async () => {
      const { data } = await apiClient<GalleryItemDTO[]>("/gallery", { query: { per_page: 100 } });
      return data;
    },
  });
}

interface UploadInput {
  file: File;
  caption?: string;
  eventId?: string;
}

/** Two-step upload: (1) get a presigned R2 PUT URL from the API, (2) PUT
 * the raw file straight to R2, (3) save metadata via POST /gallery. */
export function useUploadGalleryItem() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, caption, eventId }: UploadInput) => {
      const { data: presigned } = await apiClient<PresignedUpload>("/gallery/presigned-url", {
        method: "POST",
        body: { content_type: file.type, size_bytes: file.size },
      });

      const putRes = await fetch(presigned.upload_url, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!putRes.ok) throw new Error("Upload ke storage gagal");

      const { data: item } = await apiClient<GalleryItemDTO>("/gallery", {
        method: "POST",
        body: {
          type: file.type.startsWith("video") ? "video" : "photo",
          media_url: presigned.public_url,
          caption: caption || undefined,
          event_id: eventId || undefined,
        },
      });
      return item;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "gallery"] }),
  });
}

export function useDeleteGalleryItem() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient(`/gallery/${id}`, { method: "DELETE" });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "gallery"] }),
  });
}
