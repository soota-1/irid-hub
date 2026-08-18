import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { apiClient } from "@/shared/lib/apiClient";
import type { GalleryItem } from "@/features/gallery";

interface PresignResponse {
  upload_url: string;
  object_key: string;
  public_url: string;
}

export function useUploadGalleryItem() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, caption }: { file: File; caption?: string }) => {
      const token = await getToken();
      const type = file.type.startsWith("video") ? "video" : "photo";

      const { data: presigned } = await apiClient.post<PresignResponse>(
        "/gallery/presigned-url",
        { content_type: file.type, size_bytes: file.size },
        { token },
      );

      const putRes = await fetch(presigned.upload_url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!putRes.ok) throw new Error("Upload ke storage gagal");

      return (
        await apiClient.post<GalleryItem>(
          "/gallery",
          { type, media_url: presigned.public_url, caption },
          { token },
        )
      ).data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["gallery"] }),
  });
}

export function useDeleteGalleryItem() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      return apiClient.delete(`/gallery/${id}`, { token });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["gallery"] }),
  });
}
