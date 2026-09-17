import { defineType, defineField } from "sanity";
import { validateUrl } from "../../lib/validators";

export default defineType({
  name: "footerCTA",
  title: "Footer Call-to-Action",
  type: "object",
  fields: [
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
      description: "Call-to-action heading displayed above the link (e.g. Let\u2019s work together)",
    }),
    defineField({
      name: "linkText",
      title: "Link Text",
      type: "string",
      description: "Clickable text for the CTA link",
      validation: (rule) =>
        rule.custom((value, context) => {
          const linkUrl = (context.parent as Record<string, unknown>)?.linkUrl;
          if (value && !linkUrl) return "Link URL is required when link text is set";
          return true;
        }),
    }),
    defineField({
      name: "linkUrl",
      title: "Link URL",
      type: "string",
      description: "URL the CTA link points to (e.g. /contact)",
      validation: (rule) =>
        rule.custom(validateUrl).custom((value, context) => {
          const linkText = (context.parent as Record<string, unknown>)?.linkText;
          if (value && !linkText) return "Link text is required when link URL is set";
          return true;
        }),
    }),
  ],
});
