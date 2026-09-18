import { defineType, defineField } from "sanity";

export default defineType({
  name: "videoAsset",
  title: "Video",
  type: "object",
  fields: [
    defineField({
      name: "video",
      title: "Video File",
      type: "file",
      options: { accept: "video/mp4,video/quicktime" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "poster",
      title: "Poster Image",
      type: "image",
      description: "Shown before the video plays",
    }),
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      description: "Small uppercase label above the caption (e.g. 'Smoke Rise NY — 2025')",
    }),
    defineField({
      name: "caption",
      title: "Caption",
      type: "text",
      rows: 2,
      description: "Optional description shown next to the video",
    }),
    defineField({
      name: "aspectRatio",
      title: "Aspect Ratio",
      type: "string",
      options: {
        list: [
          { title: "Widescreen (16:9)", value: "16/9" },
          { title: "Vertical (9:16)", value: "9/16" },
        ],
      },
      initialValue: "16/9",
    }),
    defineField({
      name: "ambientLoop",
      title: "Ambient Loop (no click needed)",
      type: "boolean",
      description:
        "Plays automatically, muted and looped, with no play button or click-to-play — like the featured reel. Leave off for the normal click-to-play behavior (used by most videos).",
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: "label", media: "poster" },
    prepare({ title, media }) {
      return { title: title || "Untitled video", media };
    },
  },
});
