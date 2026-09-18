import { defineType, defineField } from "sanity";

export default defineType({
  name: "imageGridBlock",
  title: "Image Grid",
  type: "object",
  description: "A row of evenly-sized images side by side",
  fields: [
    defineField({
      name: "columns",
      title: "Columns",
      type: "number",
      options: { list: [2, 3, 4] },
      initialValue: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "images",
      title: "Images",
      type: "array",
      of: [{ type: "imageWithAspect" }],
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: "leadingEmptyColumns",
      title: "Leading Empty Columns",
      type: "number",
      description:
        "Leave this many columns blank at the start of the row before the images — used for a couple of rows in the source design that intentionally start with blank space (e.g. Apre's opening 3-column row, where the images sit in the right two-thirds).",
      initialValue: 0,
    }),
  ],
  preview: {
    select: { columns: "columns", images: "images", media: "images.0.image" },
    prepare({ columns, images, media }) {
      return {
        title: `Image Grid — ${columns || "?"} columns`,
        subtitle: `${images?.length || 0} image${images?.length === 1 ? "" : "s"}`,
        media,
      };
    },
  },
});
