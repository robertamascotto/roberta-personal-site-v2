import { defineType, defineField } from "sanity";

export default defineType({
  name: "scrollStripBlock",
  title: "Horizontal Scroll Strip",
  type: "object",
  description: "A horizontally scrolling filmstrip of images, like the Apre gallery",
  fields: [
    defineField({
      name: "images",
      title: "Images",
      type: "array",
      of: [{ type: "imageWithAspect" }],
      validation: (rule) => rule.min(1),
    }),
  ],
  preview: {
    select: { images: "images", media: "images.0.image" },
    prepare({ images, media }) {
      return {
        title: "Horizontal Scroll Strip",
        subtitle: `${images?.length || 0} image${images?.length === 1 ? "" : "s"}`,
        media,
      };
    },
  },
});
