import { Client, Storage, ID } from "node-appwrite";
import { InputFile } from "node-appwrite/file";

export function getAppwriteStorage() {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const apiKey = process.env.APPWRITE_API_KEY;

  if (!endpoint || !projectId || !apiKey) return null;

  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);

  return new Storage(client);
}

export function getAppwriteImageUrl(fileId: string) {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const bucketId = process.env.APPWRITE_BUCKET_ID;

  if (!endpoint || !projectId || !bucketId) return null;

  return `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/preview?project=${projectId}&width=1200`;
}

export async function uploadImageToAppwrite(file: File) {
  const storage = getAppwriteStorage();
  const bucketId = process.env.APPWRITE_BUCKET_ID;

  if (!storage || !bucketId) {
    throw new Error("Appwrite is not configured");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await storage.createFile({
    bucketId,
    fileId: ID.unique(),
    file: InputFile.fromBuffer(buffer, file.name),
  });

  const imageUrl = getAppwriteImageUrl(result.$id);
  if (!imageUrl) throw new Error("Failed to build image URL");

  return { fileId: result.$id, imageUrl };
}
