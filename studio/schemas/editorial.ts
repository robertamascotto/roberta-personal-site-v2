import { defineType, defineField } from "sanity";
import { ImageIcon } from "@sanity/icons";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";
import { validateSlug } from "../lib/validators";

export default defineType({
  name: "editorial",
  title: "Editorial",
  type: "document",
  icon: ImageIcon,
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "cover", title: "Cover Frames" },
    { name: "gallery", title: "Full Gallery" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "The shoot's name, e.g. 'Bloom in the Dark'",
      group: "content",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "URL Identifier",
      type: "slug",
      options: { source: "title" },
      group: "content",
      validation: (rule) => rule.required().custom(validateSlug),
    }),
    defineField({
      name: "year",
      title: "Year",
      type: "string",
      description: "e.g. '2024' — shown next to the title",
      group: "content",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 4,
      description: "Shown on the shoot's own page. Start a new line for a line break.",
      group: "content",
    }),
    defineField({
      name: "coverFrames",
      title: "Cover Frames",
      type: "array",
      of: [{ type: "imageWithAspect" }],
      description: "2–4 images used for this shoot's staggered teaser on the Editorials index page",
      group: "cover",
      validation: (rule) => rule.min(2).max(4),
    }),
    defineField({
      name: "gallery",
      title: "Full Gallery",
      type: "array",
      of: [{ type: "imageWithAspect" }],
      description: "The full set of images shown on this shoot's own page",
      group: "gallery",
      validation: (rule) => rule.min(1),
    }),
    orderRankField({ type: "editorial", hidden: true }),
  ],
  orderings: [orderRankOrdering],
  preview: {
    select: { title: "title", year: "year", media: "coverFrames.0.image" },
    prepare({ title, year, media }) {
      return { title, subtitle: year, media };
    },
  },
});
