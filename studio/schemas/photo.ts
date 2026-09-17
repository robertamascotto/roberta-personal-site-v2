import { defineType, defineField } from "sanity";
import { ImageIcon } from "@sanity/icons";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";
import { CATEGORIES, getCategoryLabel } from "@/lib/constants";

export default defineType({
  name: "photo",
  title: "Photo",
  type: "document",
  icon: ImageIcon,
  groups: [
    { name: "image", title: "Image", default: true },
    { name: "details", title: "Details" },
  ],
  fields: [
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      description: "The photograph",
      group: "image",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "alt",
      title: "Alt Text",
      type: "string",
      description:
        "Describe what's in the photo for accessibility and SEO (e.g. 'Flatlay of skincare products on marble surface'). This helps people using screen readers and improves search visibility.",
      group: "image",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "caption",
      title: "Caption",
      type: "text",
      rows: 2,
      description: "Optional caption shown below the photo in lightbox",
      group: "image",
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "reference", to: [{ type: "tag" }], weak: true }],
      description: "Tags for filtering — a photo can have multiple tags",
      group: "image",
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      description: "Which portfolio section this photo appears in. Changing this will move it to a different category page.",
      group: "image",
      options: {
        list: CATEGORIES.map((c) => ({ title: c.label, value: c.slug })),
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "date",
      title: "Date",
      type: "date",
      description: "Photo date — used for sorting (newest first)",
      group: "details",
      initialValue: () => new Date().toISOString().split("T")[0],
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      description: "Featured photos are pinned to the top of the portfolio grid. Recommended: 3–5 per category for the best layout.",
      initialValue: false,
      group: "details",
    }),
    defineField({
      name: "sortOrder",
      title: "Sort Order",
      type: "number",
      description: "Manual position override — lower numbers appear first. Use drag-and-drop in the Photos list for easier reordering.",
      group: "details",
      hidden: true,
    }),
    orderRankField({ type: "photo", hidden: true }),
  ],
  orderings: [
    orderRankOrdering,
    {
      title: "Featured + Sort Order",
      name: "featuredSortOrder",
      by: [
        { field: "featured", direction: "desc" },
        { field: "sortOrder", direction: "asc" },
        { field: "date", direction: "desc" },
      ],
    },
    {
      title: "Date (Newest First)",
      name: "dateDesc",
      by: [{ field: "date", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      caption: "caption",
      alt: "alt",
      featured: "featured",
      category: "category",
      date: "date",
      tag0: "tags.0.label",
      tag1: "tags.1.label",
      tag2: "tags.2.label",
      media: "image",
    },
    prepare({ caption, alt, featured, category, date, tag0, tag1, tag2, media }) {
      const raw = caption || alt || "Untitled";
      const title = raw.length > 50 ? `${raw.substring(0, 50)}...` : raw;
      const prefix = featured ? "★ " : "";
      const suffix = category ? ` [${getCategoryLabel(category)}]` : "";

      const tags = [tag0, tag1, tag2].filter(Boolean);
      const datePart = date
        ? new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        : "";
      const tagPart = tags.length > 0 ? tags.join(", ") : "";
      const subtitle = [datePart, tagPart].filter(Boolean).join(" — ");

      return {
        title: `${prefix}${title}${suffix}`,
        subtitle: subtitle || undefined,
        media,
      };
    },
  },
});
