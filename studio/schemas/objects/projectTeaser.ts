import { defineType, defineField } from "sanity";

export default defineType({
  name: "projectTeaser",
  title: "Project Teaser",
  type: "object",
  fields: [
    defineField({ name: "image", title: "Image", type: "image", options: { hotspot: true } }),
    defineField({
      name: "video",
      title: "Video (optional)",
      type: "file",
      options: { accept: "video/mp4,video/quicktime" },
      description: "If set, this plays instead of the image",
    }),
    defineField({ name: "blurb", title: "Blurb", type: "text", rows: 3, validation: (rule) => rule.required() }),
  ],
  preview: {
    select: { title: "blurb", media: "image" },
  },
});
