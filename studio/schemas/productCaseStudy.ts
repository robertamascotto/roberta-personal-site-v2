import { defineType, defineField } from "sanity";
import { ImageIcon } from "@sanity/icons";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";
import { validateSlug } from "../lib/validators";

export default defineType({
  name: "productCaseStudy",
  title: "Product Case Study",
  type: "document",
  icon: ImageIcon,
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "gallery", title: "Gallery" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "The client/brand name, e.g. 'Apre'",
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
      name: "categoryLabel",
      title: "Category Label",
      type: "string",
      description: "e.g. 'Jewelry', 'Fashion', 'Ecommerce' — shown under the title on the Products index",
      group: "content",
    }),
    defineField({
      name: "yearRange",
      title: "Year",
      type: "string",
      description: "e.g. '2022' or '2024–2026'",
      group: "content",
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: { hotspot: true },
      description: "Shown on the Products index page",
      group: "content",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "coverAlt",
      title: "Cover Image Alt Text",
      type: "string",
      group: "content",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 4,
      group: "content",
    }),
    defineField({
      name: "gallery",
      title: "Gallery",
      type: "array",
      description: "Build this shoot's page from single images, grids, and horizontal scroll strips, in any order",
      of: [{ type: "imageWithAspect" }, { type: "imageGridBlock" }, { type: "scrollStripBlock" }],
      group: "gallery",
    }),
    orderRankField({ type: "productCaseStudy", hidden: true }),
  ],
  orderings: [orderRankOrdering],
  preview: {
    select: { title: "title", subtitle: "categoryLabel", media: "coverImage" },
  },
});
