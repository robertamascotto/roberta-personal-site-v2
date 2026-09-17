import { defineType, defineField } from "sanity";
import { TagIcon } from "@sanity/icons";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";
import { validateSlug } from "../lib/validators";

export default defineType({
  name: "tag",
  title: "Tag",
  type: "document",
  icon: TagIcon,
  description: "Tags are the filter tabs on the portfolio page — each tag becomes a clickable filter button.",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      description: "Tag name displayed as a filter tab (e.g. On-Figure, Flats)",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "URL Identifier",
      type: "slug",
      options: { source: "label" },
      description: "Auto-generated from the tag name — used in the website URL. Click Generate if you rename the tag.",
      validation: (rule) => rule.required().custom(validateSlug),
    }),
    defineField({
      name: "sortOrder",
      title: "Sort Order",
      type: "number",
      description:
        "Fallback sort order — only used for tags that haven't been reordered via drag-and-drop yet. Use the Tags list to drag-and-drop tags into the desired order.",
      initialValue: 99,
    }),
    orderRankField({ type: "tag", hidden: true }),
  ],
  orderings: [
    orderRankOrdering,
    {
      title: "Sort Order",
      name: "sortOrderAsc",
      by: [{ field: "sortOrder", direction: "asc" }],
    },
    {
      title: "Alphabetical",
      name: "labelAsc",
      by: [{ field: "label", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "label", slug: "slug.current" },
    prepare({ title, slug }) {
      return {
        title: title || "Untitled",
        subtitle: slug ? `/${slug}` : "No slug set",
      };
    },
  },
});
