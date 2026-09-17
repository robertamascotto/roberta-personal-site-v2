import { defineType, defineField } from "sanity";
import { validateUrl } from "../../lib/validators";
import { CATEGORIES } from "@/lib/constants";

const knownPaths = [
  ...CATEGORIES.map((c) => `/portfolio/${c.slug}`),
  "/contact",
];

function validateNavHref(value: unknown): string | true {
  const urlResult = validateUrl(value);
  if (urlResult !== true) return urlResult;
  if (!value || typeof value !== "string") return true;
  const trimmed = value.trim();
  if (trimmed !== value) return "URL contains leading or trailing spaces — please remove them";
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    const pathWithoutQuery = trimmed.split("?")[0].split("#")[0];
    if (!knownPaths.includes(pathWithoutQuery)) {
      return `Unknown path "${trimmed}". Known pages: ${knownPaths.join(", ")}`;
    }
  }
  return true;
}

export default defineType({
  name: "navigationLink",
  title: "Navigation Link",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      description: "Text displayed in the navigation bar",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "href",
      title: "URL",
      type: "string",
      description:
        "Link destination — portfolio pages must include the /portfolio/ prefix (e.g. /portfolio/campaigns, /portfolio/e-commerce)",
      validation: (rule) => rule.required().custom(validateNavHref),
    }),
  ],
  preview: {
    select: { title: "label", subtitle: "href" },
  },
});
