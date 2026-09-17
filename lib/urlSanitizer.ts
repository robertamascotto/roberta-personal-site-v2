/**
 * URL Sanitization Utility
 *
 * Sanitizes URLs to prevent XSS attacks via dangerous protocols.
 * Use this before rendering user-provided URLs in href attributes.
 */

const ALLOWED_PROTOCOLS = ['http:', 'https:', 'mailto:'];

/**
 * Sanitizes a URL by checking for dangerous protocols.
 * Returns the URL if safe, or undefined if the URL is unsafe.
 *
 * @param url - The URL to sanitize
 * @returns The sanitized URL or undefined if unsafe
 */
export function sanitizeUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;

  // Trim whitespace
  const trimmed = url.trim();
  if (!trimmed) return undefined;

  // Allow relative URLs starting with /
  if (trimmed.startsWith('/')) {
    // Prevent protocol-relative URLs like //evil.com
    if (trimmed.startsWith('//')) {
      return undefined;
    }
    return trimmed;
  }

  // Parse absolute URLs
  try {
    const parsed = new URL(trimmed);
    if (ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
      return trimmed;
    }
    // Block dangerous protocols like javascript:, data:, vbscript:
    return undefined;
  } catch {
    // If URL parsing fails, it might be a relative path without leading /
    // For safety, reject these as they could be interpreted as protocols
    return undefined;
  }
}