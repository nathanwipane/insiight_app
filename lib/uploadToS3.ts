import apiClient from "@/lib/config";

export async function uploadFileToS3(
  file: File,
  folder: string,
  token: string
): Promise<string> {
  // 1. Get presigned URL from our API using apiClient
  const presignedRes = await apiClient.post(
    "/v2/upload/presigned-url",
    {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      folder,
    },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const { presignedUrl, fileUrl } = presignedRes.data.data;

  if (!presignedUrl || !fileUrl) {
    throw new Error("Failed to get upload URL");
  }

  // 2. Upload directly to S3 using native fetch
  // (must use fetch here — apiClient would add auth headers
  // that S3 presigned URLs don't accept)
  const uploadRes = await fetch(presignedUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });

  if (!uploadRes.ok) {
    throw new Error("Failed to upload file to S3");
  }

  return fileUrl;
}
