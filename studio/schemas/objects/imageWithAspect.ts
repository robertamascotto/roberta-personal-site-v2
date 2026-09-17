import { defineType, defineField } from "sanity";

const ASPECT_RATIOS = [
  { title: "Square (1:1)", value: "1/1" },
  { title: "Portrait (4:5)", value: "4/5" },
  { title: "Portrait (3:4)", value: "3/4" },
  { title: "Portrait (2:3)", value: "2/3" },
  { title: "Landscape (5:4)", value: "5/4" },
  { title: "Landscape (4:3)", value: "4/3" },
  { title: "Landscape (3:2)", value: "3/2" },
  { title: "Widescreen (16:9)", value: "16/9" },
  { title: "Wide (16:10)", value: "16/10" },
  { title: "Cinematic (21:9)", value: "21/9" },
];

export default defineType({
  name: "imageWithAspect",
  title: "Image",
  type: "object",
  fields: [
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "alt",
      title: "Alt Text",
      type: "string",
      description: "Describe what's in the photo for accessibility and SEO",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "aspectRatio",
      title: "Crop Shape",
      type: "string",
      description: "How this image is cropped in the layout",
      options: { list: ASPECT_RATIOS, layout: "dropdown" },
      initialValue: "4/5",
    }),
  ],
  preview: {
    select: { title: "alt", media: "image" },
  },
});
