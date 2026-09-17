import type { SlugValue } from "sanity";

export function validateSlug(slug: SlugValue | undefined): string | true {
  if (!slug?.current) return "Slug is required";
  if (!/^[a-z0-9-]+$/.test(slug.current)) {
    return "Slug must contain only lowercase letters, numbers, and hyphens";
  }
  return true;
}

export function generateSlug(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function validateUrl(value: unknown): string | true {
  if (!value || typeof value !== "string") return true;
  if (value.startsWith("/")) return true;
  try {
    new URL(value);
    return true;
  } catch {
    return "Must be a valid URL or a path starting with /";
  }
}
