import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { colorInput } from "@sanity/color-input";
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
    structureTool({ structure }),
    colorInput(),
    ...devOnlyPlugins,
  ],
  schema: {
    types: schemaTypes,
  },
  document: {
    actions: (prev, context) => {
      if (context.schemaType === "siteConfig" || context.schemaType === "movementPage" || context.schemaType === "contentStrategyPage") {
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

      const slug = (document as Record<string, unknown>).slug as { current?: string } | undefined;

      if (document._type === "siteConfig") {
        return `${baseUrl}/api/draft?secret=${secret}&slug=/`;
      }
      if (document._type === "movementPage") {
        return `${baseUrl}/api/draft?secret=${secret}&slug=/movement`;
      }
      if (document._type === "contentStrategyPage") {
        return `${baseUrl}/api/draft?secret=${secret}&slug=/strategy`;
      }
      if (document._type === "editorial" && slug?.current) {
        return `${baseUrl}/api/draft?secret=${secret}&slug=/editorials/${slug.current}`;
      }
      if (document._type === "productCaseStudy" && slug?.current) {
        return `${baseUrl}/api/draft?secret=${secret}&slug=/products/${slug.current}`;
      }

      return prev;
    },
  },
});
