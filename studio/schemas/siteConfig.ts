import { defineType, defineField } from "sanity";
import { CogIcon } from "@sanity/icons";
import { CATEGORIES, getCategoryLabel } from "@/lib/constants";

const LAYOUT_OPTIONS = [
  { title: "Masonry", value: "masonry" },
  { title: "Grid", value: "grid" },
  { title: "Single Column", value: "single-column" },
];

const COLUMN_OPTIONS = [
  { title: "2 Columns", value: 2 },
  { title: "3 Columns", value: 3 },
  { title: "4 Columns", value: 4 },
];

const ASPECT_RATIO_OPTIONS = [
  { title: "Natural — each photo keeps its own dimensions", value: "natural" },
  { title: "Square — 1:1", value: "square" },
  { title: "Portrait — 3:4 (tall)", value: "portrait" },
  { title: "Landscape — 4:3 (wide)", value: "landscape" },
  { title: "Cinematic — 16:9 (ultra-wide)", value: "cinematic" },
];

export default defineType({
  name: "siteConfig",
  title: "Site Configuration",
  type: "document",
  icon: CogIcon,
  groups: [
    { name: "general", title: "General", default: true },
    { name: "pages", title: "Pages" },
    { name: "navigation", title: "Navigation" },
    { name: "footer", title: "Footer" },
    { name: "theme", title: "Theme" },
    { name: "portfolio", title: "Portfolio" },
    { name: "labels", title: "Labels" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "siteName",
      title: "Site Name",
      type: "string",
      description: "Brand name shown in the navigation bar and footer",
      group: "general",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      description: "Contact email displayed in the footer and contact page",
      group: "general",
      validation: (rule) =>
        rule.required().custom((value: unknown) => {
          if (typeof value !== "string") return true;
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || "Must be a valid email address";
        }),
    }),
    defineField({
      name: "socialLinks",
      title: "Social Links",
      type: "array",
      of: [{ type: "socialLink" }],
      description: "Social media profiles shown in the footer",
      group: "general",
    }),
    defineField({
      name: "homePage",
      title: "Home Page",
      type: "homePage",
      description: "Hero section content and color overrides for the landing page",
      group: "pages",
    }),
    defineField({
      name: "contactPage",
      title: "Contact Page",
      type: "contactPage",
      description: "Contact form labels, placeholders, and sidebar content",
      group: "pages",
    }),
    defineField({
      name: "navigationLinks",
      title: "Navigation Links",
      type: "array",
      of: [{ type: "navigationLink" }],
      description: "Links shown in the top navigation bar and mobile menu",
      group: "navigation",
    }),
    defineField({
      name: "mobileTagline",
      title: "Mobile Tagline",
      type: "string",
      description: "Short tagline displayed at the bottom of the mobile menu",
      group: "navigation",
      initialValue: "Lifestyle & Ecommerce Photography",
    }),
    defineField({
      name: "footerTagline",
      title: "Footer Tagline",
      type: "string",
      description: "Short description displayed in the footer beneath the site name",
      group: "footer",
    }),
    defineField({
      name: "footerCTA",
      title: "Footer Call-to-Action",
      type: "footerCTA",
      description: "Call-to-action section in the footer with a heading and link",
      group: "footer",
    }),
    defineField({
      name: "footerLabels",
      title: "Footer Labels",
      type: "footerLabels",
      description: "Section headings and copyright text for footer columns",
      group: "footer",
    }),
    defineField({
      name: "theme",
      title: "Theme",
      type: "themeConfig",
      description: "Site-wide colors and font pairing",
      group: "theme",
    }),
    defineField({
      name: "portfolioLayout",
      title: "Portfolio Layout",
      type: "string",
      description: "Default layout for all categories (can be overridden per category below)",
      group: "portfolio",
      options: {
        list: LAYOUT_OPTIONS,
        layout: "dropdown",
      },
      initialValue: "masonry",
    }),
    defineField({
      name: "portfolioColumns",
      title: "Portfolio Columns",
      type: "number",
      description: "Default columns for all categories (can be overridden per category below)",
      group: "portfolio",
      options: {
        list: COLUMN_OPTIONS,
      },
      initialValue: 3,
      hidden: ({ parent }) => parent?.portfolioLayout === "single-column",
    }),
    defineField({
      name: "portfolioAspectRatio",
      title: "Portfolio Aspect Ratio",
      type: "string",
      description: "Default aspect ratio for all categories (can be overridden per category below)",
      group: "portfolio",
      options: {
        list: ASPECT_RATIO_OPTIONS,
        layout: "dropdown",
      },
      initialValue: "natural",
    }),
    defineField({
      name: "categoryOverrides",
      title: "Per-Category Layout Overrides",
      type: "array",
      description: "Override the global layout settings for specific categories. Fields left blank inherit the global defaults above.",
      group: "portfolio",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "category",
              title: "Category",
              type: "string",
              options: {
                list: CATEGORIES.map((c) => ({ title: c.label, value: c.slug })),
                layout: "dropdown",
              },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "portfolioLayout",
              title: "Layout",
              type: "string",
              description: "Leave blank to use the global default",
              options: {
                list: LAYOUT_OPTIONS,
                layout: "dropdown",
              },
            }),
            defineField({
              name: "portfolioColumns",
              title: "Columns",
              type: "number",
              description: "Leave blank to use the global default",
              options: {
                list: COLUMN_OPTIONS,
              },
              hidden: ({ parent, document }) => {
                const effectiveLayout = parent?.portfolioLayout ?? (document as Record<string, unknown>)?.portfolioLayout;
                return effectiveLayout === "single-column";
              },
            }),
            defineField({
              name: "portfolioAspectRatio",
              title: "Aspect Ratio",
              type: "string",
              description: "Leave blank to use the global default",
              options: {
                list: ASPECT_RATIO_OPTIONS,
                layout: "dropdown",
              },
            }),
          ],
          preview: {
            select: {
              category: "category",
              layout: "portfolioLayout",
              columns: "portfolioColumns",
              aspectRatio: "portfolioAspectRatio",
            },
            prepare({ category, layout, columns, aspectRatio }) {
              const label = getCategoryLabel(category);
              const parts: string[] = [];
              if (layout) parts.push(layout);
              if (columns) parts.push(`${columns} cols`);
              if (aspectRatio) parts.push(aspectRatio);
              return {
                title: label,
                subtitle: parts.length > 0 ? parts.join(", ") : "No overrides set",
              };
            },
          },
        },
      ],
      validation: (rule) =>
        rule.max(3).custom((items: { category?: string }[] | undefined) => {
          if (!items) return true;
          const categories = items.map((item) => item.category).filter(Boolean);
          const duplicates = categories.filter((c, i) => categories.indexOf(c) !== i);
          if (duplicates.length > 0) {
            return `Duplicate category override: ${duplicates.join(", ")}`;
          }
          return true;
        }),
    }),
    defineField({
      name: "uiLabels",
      title: "UI Labels",
      type: "uiLabels",
      description: "Customizable text for buttons, headings, and empty states across the site",
      group: "labels",
    }),
    defineField({
      name: "siteMetadata",
      title: "Site Metadata",
      type: "siteMetadata",
      description: "SEO description and browser title template",
      group: "seo",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Site Configuration" };
    },
  },
});
