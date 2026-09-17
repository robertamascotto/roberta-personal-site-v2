import { createClient } from "@sanity/client";
import { projectId, dataset, apiVersion } from "./env";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
});

// Write client for migration scripts (server-side only)
export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

// Preview client — bypasses CDN and reads draft documents
export const previewClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
  perspective: "previewDrafts",
});

/** Returns the preview client when draft mode is active, otherwise the CDN client. */
export function getClient(preview: boolean) {
  return preview ? previewClient : client;
}
