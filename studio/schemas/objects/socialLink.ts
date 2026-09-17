import { defineType } from "sanity";

export default defineType({
  name: "socialLink",
  title: "Social Link",
  type: "object",
  fields: [
    {
      name: "platform",
      title: "Platform",
      type: "string",
      description: "Social media platform name",
      options: {
        list: [
          "Instagram",
          "Pinterest",
          "LinkedIn",
          "Twitter",
          "Facebook",
          "TikTok",
          "YouTube",
          "Behance",
          "Dribbble",
          "Other",
        ],
      },
      validation: (rule) => rule.required(),
    },
    {
      name: "url",
      title: "URL",
      type: "url",
      description: "Full profile URL (e.g. https://instagram.com/yourhandle)",
      validation: (rule) => rule.required(),
    },
  ],
  preview: {
    select: {
      title: "platform",
      subtitle: "url",
    },
  },
});
