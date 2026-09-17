import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { colorInput } from "@sanity/color-input";
import { dashboard } from "./studio/tools/dashboard";
import { bulkManager } from "./studio/tools/bulkManager";
import { schemaTypes } from "./studio/schemas";
import { structure } from "./studio/structure";
import { projectId, dataset } from "./studio/env";

const devOnlyPlugins =
  process.env.NODE_ENV === "development" ? [visionTool()] : [];

export default defineConfig({
  name: "roberta-portfolio",
  title: "Roberta Portfolio",
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [
    dashboard(),
    structureTool({ structure }),
    colorInput(),
    bulkManager(),
    ...devOnlyPlugins,
  ],
  schema: {
    types: schemaTypes,
    templates: (prev) => [
      ...prev.filter((t) => t.id !== "photo"),
      {
        id: "photo-e-commerce",
        title: "New E-Commerce Photo",
        schemaType: "photo",
        value: { category: "e-commerce" },
      },
      {
        id: "photo-campaigns",
        title: "New Campaigns Photo",
        schemaType: "photo",
        value: { category: "campaigns" },
      },
      {
        id: "photo-branded-content",
        title: "New Branded Content Photo",
        schemaType: "photo",
        value: { category: "branded-content" },
      },
    ],
  },
  document: {
    actions: (prev, context) => {
      if (context.schemaType === "siteConfig") {
        return prev.filter(
          ({ action }) => action !== "delete" && action !== "duplicate"
        );
      }
      return prev;
    },
    productionUrl: async (prev, context) => {
      const { document } = context;
      const secret = process.env.SANITY_REVALIDATE_SECRET || "";
      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

      if (document._type === "siteConfig") {
        return `${baseUrl}/api/draft?secret=${secret}&slug=/`;
      }

      if (document._type === "photo") {
        const category = (document as Record<string, unknown>).category as string | undefined;
        const slug = category || "e-commerce";
        return `${baseUrl}/api/draft?secret=${secret}&slug=/portfolio/${slug}`;
      }

      return prev;
    },
  },
});
