
import { useMutation } from "@tanstack/react-query";
import { imageServiceUploadImage } from "@/api/image";
import type { V1UploadImageRequest } from "@/api/image.schemas.ts";

export async function uploadImage(file: File) {
  const workersEndpoint = process.env.NEXT_PUBLIC_LAMBDA_ENDPOINT;
  if (!workersEndpoint) throw new Error("Workers upload endpoint is not configured");

  const response = await fetch(workersEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": file.type || "application/octet-stream",
    },
    body: file, 
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Image upload failed (${response.status}): ${text}`);
  }

  return response;
}

// 一時的なアップロード用URL取得のためのhook
export function useGetUploadUrl() {
  return useMutation({
    mutationFn: async (params: V1UploadImageRequest) => {
      const response = await imageServiceUploadImage(params);
      return response.data;
    },
  });
}
