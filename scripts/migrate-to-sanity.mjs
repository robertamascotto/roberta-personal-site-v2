#!/usr/bin/env node

/**
 * Migration script: TinaCMS + Cloudinary → Sanity CMS
 *
 * Reads content from:
 *   - content/config/index.json (site config)
 *   - content/projects/*.mdx (projects)
 *
 * Uploads images from Cloudinary to Sanity and creates all documents.
 *
 * Usage:
 *   SANITY_API_TOKEN=... NEXT_PUBLIC_SANITY_PROJECT_ID=... node scripts/migrate-to-sanity.mjs
 *
 * Idempotent: uses createOrReplace, safe to re-run.
 */

import { createClient } from "@sanity/client";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { fileURLToPath } from "url";
import https from "https";
import http from "http";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// --- Config ---
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !token) {
  console.error("Missing env vars: NEXT_PUBLIC_SANITY_PROJECT_ID, SANITY_API_TOKEN");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  useCdn: false,
  token,
});

// --- Helpers ---

/** Download an image URL and upload to Sanity, returning the asset reference. */
async function uploadImageFromUrl(url) {
  if (!url) return null;

  console.log(`  Uploading image: ${url.substring(0, 80)}...`);

  try {
    const buffer = await new Promise((resolve, reject) => {
      const get = url.startsWith("https") ? https.get : http.get;
      get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          // Follow redirect
          const get2 = res.headers.location.startsWith("https") ? https.get : http.get;
          get2(res.headers.location, (res2) => {
            const chunks = [];
            res2.on("data", (chunk) => chunks.push(chunk));
            res2.on("end", () => resolve(Buffer.concat(chunks)));
            res2.on("error", reject);
          }).on("error", reject);
          return;
        }
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => resolve(Buffer.concat(chunks)));
        res.on("error", reject);
      }).on("error", reject);
    });

    // Determine content type from URL
    const ext = path.extname(new URL(url).pathname).toLowerCase();
    const contentTypes = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".svg": "image/svg+xml",
    };
    const contentType = contentTypes[ext] || "image/jpeg";

    const asset = await client.assets.upload("image", buffer, { contentType });
    return {
      _type: "image",
      asset: { _type: "reference", _ref: asset._id },
    };
  } catch (err) {
    console.error(`  Failed to upload image ${url}:`, err.message);
    return null;
  }
}

// --- Main ---
async function main() {
  console.log("=== Migrating TinaCMS content to Sanity ===\n");

  // 1. Read site config
  const configPath = path.join(ROOT, "content/config/index.json");
  const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  console.log("Read site config from", configPath);

  // 2. Create category documents
  console.log("\n--- Creating categories ---");
  const categories = config.categories || [];
  for (const cat of categories) {
    if (!cat?.slug) continue;
    const doc = {
      _id: `category-${cat.slug}`,
      _type: "category",
      label: cat.label || cat.slug,
      slug: { _type: "slug", current: cat.slug },
      description: cat.description || undefined,
      sortOrder: cat.sortOrder || 0,
    };

    // Upload cover image if exists
    if (cat.coverImage) {
      const imageRef = await uploadImageFromUrl(cat.coverImage);
      if (imageRef) doc.coverImage = imageRef;
    }

    await client.createOrReplace(doc);
    console.log(`  Created category: ${cat.label} (${cat.slug})`);
  }

  // 3. Upload site config images and create siteConfig singleton
  console.log("\n--- Creating site config ---");

  // Upload profile photo
  let profilePhotoRef = null;
  if (config.profilePhoto) {
    profilePhotoRef = await uploadImageFromUrl(config.profilePhoto);
  }

  // Upload hero image
  let heroImageRef = null;
  if (config.homePage?.heroImage) {
    heroImageRef = await uploadImageFromUrl(config.homePage.heroImage);
  }

  const siteConfigDoc = {
    _id: "siteConfig",
    _type: "siteConfig",
    siteName: config.siteName,
    bio: config.bio || undefined,
    email: config.email || undefined,
    socialLinks: (config.socialLinks || []).map((sl) => ({
      _type: "socialLink",
      _key: sl.platform?.toLowerCase() || Math.random().toString(36).slice(2, 8),
      platform: sl.platform,
      url: sl.url,
    })),
    footerTagline: config.footerTagline || undefined,
    footerCTA: config.footerCTA
      ? {
          _type: "footerCTA",
          heading: config.footerCTA.heading,
          linkText: config.footerCTA.linkText,
          linkUrl: config.footerCTA.linkUrl,
        }
      : undefined,
    navigationLinks: (config.navigationLinks || []).map((nl, i) => ({
      _type: "navigationLink",
      _key: `nav-${i}`,
      label: nl.label,
      href: nl.href,
    })),
    mobileTagline: config.mobileTagline || undefined,
    homePage: {
      _type: "homePage",
      heroTagline: config.homePage?.heroTagline,
      heroHeadline: config.homePage?.heroHeadline,
      heroSubtitle: config.homePage?.heroSubtitle,
      heroTaglineColor: config.homePage?.heroTaglineColor || undefined,
      heroHeadlineColor: config.homePage?.heroHeadlineColor || undefined,
      heroSubtitleColor: config.homePage?.heroSubtitleColor || undefined,
      ...(heroImageRef ? { heroImage: heroImageRef } : {}),
    },
    contactPage: config.contactPage
      ? {
          _type: "contactPage",
          sectionLabel: config.contactPage.sectionLabel,
          heading: config.contactPage.heading,
          introText: config.contactPage.introText,
          location: config.contactPage.location,
          availability: config.contactPage.availability,
          quote: config.contactPage.quote,
          formLabels: config.contactPage.formLabels
            ? { ...config.contactPage.formLabels }
            : undefined,
          formPlaceholders: config.contactPage.formPlaceholders
            ? { ...config.contactPage.formPlaceholders }
            : undefined,
          projectTypes: config.contactPage.projectTypes || [],
          successMessage: config.contactPage.successMessage,
          errorMessage: config.contactPage.errorMessage,
          contactInfoHeading: config.contactPage.contactInfoHeading,
          emailLabel: config.contactPage.emailLabel,
          locationLabel: config.contactPage.locationLabel,
          availabilityLabel: config.contactPage.availabilityLabel,
          socialLabel: config.contactPage.socialLabel,
        }
      : undefined,
    footerLabels: config.footerLabels
      ? {
          _type: "footerLabels",
          navigationHeading: config.footerLabels.navigationHeading,
          contactHeading: config.footerLabels.contactHeading,
          copyrightText: config.footerLabels.copyrightText,
        }
      : undefined,
    uiLabels: config.uiLabels
      ? {
          _type: "uiLabels",
          ...config.uiLabels,
        }
      : undefined,
    siteMetadata: config.siteMetadata
      ? {
          _type: "siteMetadata",
          siteDescription: config.siteMetadata.siteDescription,
          siteTitleTemplate: config.siteMetadata.siteTitleTemplate,
        }
      : undefined,
    theme: config.theme
      ? {
          _type: "themeConfig",
          backgroundColor: config.theme.backgroundColor,
          textColor: config.theme.textColor,
          accentColor: config.theme.accentColor,
          fontPairing: config.theme.fontPairing,
        }
      : undefined,
  };

  if (profilePhotoRef) {
    siteConfigDoc.profilePhoto = profilePhotoRef;
  }

  await client.createOrReplace(siteConfigDoc);
  console.log("  Created siteConfig singleton");

  // 4. Read and create projects
  console.log("\n--- Creating projects ---");
  const projectsDir = path.join(ROOT, "content/projects");
  if (!fs.existsSync(projectsDir)) {
    console.log("  No projects directory found, skipping.");
  } else {
    const files = fs.readdirSync(projectsDir).filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));

    for (const file of files) {
      const filePath = path.join(projectsDir, file);
      const raw = fs.readFileSync(filePath, "utf-8");
      const { data } = matter(raw);

      console.log(`\n  Processing project: ${data.title || file}`);

      // Generate a deterministic ID from slug
      const projectSlug = data.slug || file.replace(/\.mdx?$/, "");
      const projectId = `project-${projectSlug}`;

      // Upload cover image
      let coverImageRef = null;
      if (data.coverImage) {
        coverImageRef = await uploadImageFromUrl(data.coverImage);
      }

      // Upload gallery images
      const imageRefs = [];
      if (data.images && Array.isArray(data.images)) {
        for (const img of data.images) {
          const src = typeof img === "string" ? img : img?.src;
          const alt = typeof img === "string" ? "" : img?.alt || "";
          if (src) {
            const imageRef = await uploadImageFromUrl(src);
            if (imageRef) {
              imageRefs.push({
                _type: "image",
                _key: Math.random().toString(36).slice(2, 10),
                asset: imageRef.asset,
                alt: alt || undefined,
              });
            }
          }
        }
      }

      // Find category reference
      const catSlug = data.category;
      const categoryRef = catSlug
        ? { _type: "reference", _ref: `category-${catSlug}` }
        : undefined;

      const projectDoc = {
        _id: projectId,
        _type: "project",
        title: data.title,
        slug: { _type: "slug", current: projectSlug },
        category: categoryRef,
        description: data.description || undefined,
        date: data.date ? new Date(data.date).toISOString() : undefined,
        featured: data.featured || false,
        client: data.client || undefined,
        services: data.services || undefined,
        testimonial: data.testimonial || undefined,
        testimonialAttribution: data.testimonialAttribution || undefined,
        externalLink: data.externalLink || undefined,
        externalLinkText: data.externalLinkText || undefined,
        galleryLayout: data.galleryLayout || "masonry",
        galleryColumns: data.galleryColumns || 3,
        galleryAspectRatio: data.galleryAspectRatio || "square",
      };

      if (coverImageRef) {
        projectDoc.coverImage = coverImageRef;
      }

      if (imageRefs.length > 0) {
        projectDoc.images = imageRefs;
      }

      await client.createOrReplace(projectDoc);
      console.log(`  Created project: ${data.title} (${projectSlug})`);
    }
  }

  console.log("\n=== Migration complete! ===");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
