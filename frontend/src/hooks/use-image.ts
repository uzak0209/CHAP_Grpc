export async function uploadImage(file: File) {
  const workersEndpoint = process.env.NEXT_PUBLIC_WORKERS_UPLOAD_ENDPOINT;
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