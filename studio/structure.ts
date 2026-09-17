import type { StructureBuilder } from "sanity/structure";
import type { ConfigContext } from "sanity";
import { ImageIcon, CogIcon } from "@sanity/icons";
import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";

export const structure = (S: StructureBuilder, context: ConfigContext) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Site Configuration")
        .id("siteConfig")
        .icon(CogIcon)
        .child(
          S.document().schemaType("siteConfig").documentId("siteConfig")
        ),
      S.listItem()
        .title("Movement Page")
        .id("movementPage")
        .icon(ImageIcon)
        .child(
          S.document().schemaType("movementPage").documentId("movementPage")
        ),
      S.listItem()
        .title("Content Strategy Page")
        .id("contentStrategyPage")
        .icon(ImageIcon)
        .child(
          S.document().schemaType("contentStrategyPage").documentId("contentStrategyPage")
        ),
      S.divider(),
      orderableDocumentListDeskItem({
        type: "editorial",
        title: "Editorials",
        icon: ImageIcon,
        S,
        context,
      }),
      S.listItem()
        .title("Products")
        .icon(ImageIcon)
        .child(
          S.list()
            .title("Products")
            .items([
              orderableDocumentListDeskItem({
                type: "productCaseStudy",
                title: "Case Studies",
                icon: ImageIcon,
                S,
                context,
              }),
              orderableDocumentListDeskItem({
                type: "productSubGallery",
                title: "Sub-Galleries",
                icon: ImageIcon,
                S,
                context,
              }),
            ])
        ),
    ]);
