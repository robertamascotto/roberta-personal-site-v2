import { ImageResponse } from "next/og";
import { CATEGORIES, getCategoryLabel, type CategorySlug } from "@/lib/constants";

export const runtime = "edge";
export const alt = "Portfolio category";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Design tokens matching globals.css
const COLORS = {
  background: "#FAF8F5",
  text: "#2D2A26",
  textLight: "#5C5751",
  accent: "#B8956C",
  accentLight: "#D4B896",
  border: "#E8E0D8",
} as const;

function isValidCategory(slug: string): slug is CategorySlug {
  return CATEGORIES.some((c) => c.slug === slug);
}

interface OGPhoto {
  src: string | null;
  alt: string | null;
}

interface OGSiteConfig {
  siteName?: string | null;
}

export default async function OGImage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  // Validate category against known slugs to prevent GROQ injection
  if (!isValidCategory(category)) {
    // Return a generic fallback image for unknown categories
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "1200px",
            height: "630px",
            backgroundColor: COLORS.background,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ color: COLORS.text, fontSize: "48px" }}>
            Portfolio
          </span>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  const categoryLabel = getCategoryLabel(category);

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
  const apiVersion = "2024-01-01";

  // Fetch up to 4 photos for the thumbnail strip and total count.
  // The category slug has already been validated against CATEGORIES, so it is
  // safe to interpolate into the GROQ query — it can only ever be one of the
  // three known literal values.
  const photoQuery = encodeURIComponent(
    `*[_type == "photo" && category == "${category}"] | order(featured desc, orderRank asc, sortOrder asc, date desc){
      "src": image.asset->url,
      alt
    }`
  );

  const configQuery = encodeURIComponent(
    `*[_type == "siteConfig"][0]{ siteName }`
  );

  const sanityBase = `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}`;

  // Fetch both in parallel; fail gracefully so a broken Sanity connection
  // still produces a usable OG image rather than a 500 error.
  const [photosResult, configResult] = await Promise.allSettled([
    fetch(`${sanityBase}?query=${photoQuery}`).then((r) => r.json()),
    fetch(`${sanityBase}?query=${configQuery}`).then((r) => r.json()),
  ]);

  const allPhotos: OGPhoto[] =
    photosResult.status === "fulfilled"
      ? (photosResult.value?.result ?? [])
      : [];

  const siteConfig: OGSiteConfig =
    configResult.status === "fulfilled"
      ? (configResult.value?.result ?? {})
      : {};

  const siteName = siteConfig?.siteName || "Roberta";
  const photoCount = allPhotos.length;

  // Take the first 4 photos with valid src URLs for the thumbnail row
  const thumbnails = allPhotos
    .filter((p): p is OGPhoto & { src: string } => typeof p.src === "string")
    .slice(0, 4);

  const hasThumbnails = thumbnails.length > 0;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "1200px",
          height: "630px",
          backgroundColor: COLORS.background,
          position: "relative",
          fontFamily:
            '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        {/* Subtle top border accent */}
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "3px",
            backgroundColor: COLORS.accent,
          }}
        />

        {/* Main content area */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            padding: "56px 72px 0",
          }}
        >
          {/* Site name — top left */}
          <div
            style={{
              display: "flex",
              fontSize: "18px",
              fontWeight: 300,
              letterSpacing: "0.18em",
              color: COLORS.textLight,
              textTransform: "uppercase",
              marginBottom: "auto",
            }}
          >
            {siteName}
          </div>

          {/* Center content: category heading + photo count */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              marginTop: hasThumbnails ? "32px" : "auto",
              marginBottom: hasThumbnails ? "40px" : "auto",
            }}
          >
            {/* Thin accent rule above heading */}
            <div
              style={{
                display: "flex",
                width: "48px",
                height: "2px",
                backgroundColor: COLORS.accent,
                marginBottom: "24px",
              }}
            />

            {/* Category label */}
            <div
              style={{
                display: "flex",
                fontSize: "72px",
                fontWeight: 300,
                letterSpacing: "-0.01em",
                color: COLORS.text,
                lineHeight: 1.05,
              }}
            >
              {categoryLabel}
            </div>

            {/* Secondary line: "Photography" word mark */}
            <div
              style={{
                display: "flex",
                fontSize: "32px",
                fontWeight: 300,
                letterSpacing: "0.08em",
                color: COLORS.textLight,
                marginTop: "8px",
                textTransform: "uppercase",
              }}
            >
              Photography
            </div>

            {/* Photo count badge */}
            {photoCount > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginTop: "28px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: COLORS.accent,
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    fontSize: "16px",
                    fontWeight: 400,
                    letterSpacing: "0.1em",
                    color: COLORS.textLight,
                    textTransform: "uppercase",
                  }}
                >
                  {photoCount} {photoCount === 1 ? "Photo" : "Photos"}
                </div>
              </div>
            )}
          </div>

          {/* Photo thumbnail strip */}
          {hasThumbnails && (
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                gap: "12px",
                marginBottom: "0",
              }}
            >
              {thumbnails.map((photo, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    width: "240px",
                    height: "160px",
                    overflow: "hidden",
                    borderRadius: "4px",
                    backgroundColor: COLORS.border,
                    // Fade out thumbnails toward the right for a editorial feel
                    opacity: index === 0 ? 1 : index === 1 ? 0.9 : index === 2 ? 0.75 : 0.55,
                  }}
                >
                  {/* Append Sanity image transformation params for a 250x250 crop */}
                  <img
                    src={`${photo.src}?w=250&h=250&fit=crop`}
                    alt={photo.alt ?? ""}
                    width={240}
                    height={160}
                    style={{
                      width: "240px",
                      height: "160px",
                      objectFit: "cover",
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom accent bar */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            padding: "0 72px",
            height: "56px",
            borderTop: `1px solid ${COLORS.border}`,
            marginTop: "0",
          }}
        >
          <div
            style={{
              display: "flex",
              flex: 1,
              height: "2px",
              backgroundColor: COLORS.accent,
              opacity: 0.6,
            }}
          />
          <div
            style={{
              display: "flex",
              marginLeft: "24px",
              fontSize: "13px",
              fontWeight: 400,
              letterSpacing: "0.14em",
              color: COLORS.textLight,
              textTransform: "uppercase",
              opacity: 0.7,
            }}
          >
            www.robertamascotto.com
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
