import { defineType, defineField } from "sanity";
import { ImageIcon } from "@sanity/icons";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";
import { validateSlug } from "../lib/validators";

export default defineType({
  name: "productSubGallery",
  title: "Product Sub-Gallery",
  type: "document",
  icon: ImageIcon,
  description: "A named sub-section within a product case study, e.g. 'Flats' or 'On Figure' under Smoke Rise NY",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "gallery", title: "Gallery" },
  ],
  fields: [
    defineField({
      name: "parentCaseStudy",
      title: "Parent Case Study",
      type: "reference",
      to: [{ type: "productCaseStudy" }],
      group: "content",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "e.g. 'Flats'",
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
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      description: "Shown on the parent case study page, above the teaser images",
      group: "content",
    }),
    defineField({
      name: "teaserImages",
      title: "Teaser Images",
      type: "array",
      description: "A handful of images shown on the parent case study page (e.g. 4)",
      of: [{ type: "imageWithAspect" }],
      group: "gallery",
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: "fullGallery",
      title: "Full Gallery",
      type: "array",
      description: "The complete set of images shown on this sub-gallery's own 'See all' page",
      of: [{ type: "imageWithAspect" }],
      group: "gallery",
      validation: (rule) => rule.min(1),
    }),
    orderRankField({ type: "productSubGallery", hidden: true }),
  ],
  orderings: [orderRankOrdering],
  preview: {
    select: { title: "title", parent: "parentCaseStudy.title", media: "teaserImages.0.image" },
    prepare({ title, parent, media }) {
      return { title, subtitle: parent ? `in ${parent}` : undefined, media };
    },
  },
});
