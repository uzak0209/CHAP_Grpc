import { useMutation } from "@tanstack/react-query";

interface UploadImageResponse {
  url: string;
}

export function useUploadImage() {
  return useMutation({
    mutationFn: async (file: File): Promise<UploadImageResponse> => {
      const formData = new FormData();
      formData.append("file", file);

      const workersEndpoint = process.env.NEXT_PUBLIC_WORKERS_UPLOAD_ENDPOINT;
      
      if (!workersEndpoint) {
        throw new Error("Workers upload endpoint is not configured");
      }

      const response = await fetch(workersEndpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Image upload failed: ${response.status}`);
      }

      return response.json();
    },
  });
}