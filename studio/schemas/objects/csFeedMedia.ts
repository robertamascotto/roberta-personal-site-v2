import { defineType, defineField } from "sanity";

export default defineType({
  name: "csFeedMedia",
  title: "Feed Media Item",
  type: "object",
  description: "One 9:16 tile in the feed preview grid — either a looping video or a still image",
  fields: [
    defineField({
      name: "video",
      title: "Video File (leave blank for a still image instead)",
      type: "file",
      options: { accept: "video/mp4,video/quicktime" },
    }),
    defineField({
      name: "image",
      title: "Image (used when no video is set)",
      type: "image",
    }),
    defineField({ name: "caption", title: "Caption", type: "string", validation: (rule) => rule.required() }),
  ],
  preview: {
    select: { title: "caption", media: "image" },
  },
});
