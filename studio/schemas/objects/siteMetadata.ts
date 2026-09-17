import { defineType, defineField } from "sanity";

export default defineType({
  name: "siteMetadata",
  title: "Site Metadata",
  type: "object",
  fields: [
    defineField({
      name: "siteDescription",
      title: "Site Description",
      type: "text",
      description: "Default meta description used for SEO when pages don\u2019t have their own",
      validation: (rule) =>
        rule.max(160).warning("Meta descriptions over 160 characters may be truncated in search results"),
    }),
    defineField({
      name: "siteTitleTemplate",
      title: "Site Title Template",
      type: "string",
      description: "The %s is automatically replaced with each page's name. Example: 'Portfolio | Roberta Photography'",
      initialValue: "%s | Roberta Photography",
      validation: (rule) =>
        rule.custom((value: unknown) => {
          if (typeof value !== "string") return true;
          return value.includes("%s") || "Must include %s as a placeholder for the page name";
        }),
    }),
  ],
});
