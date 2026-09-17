import type { StructureBuilder } from "sanity/structure";
import type { ConfigContext } from "sanity";
import { ImageIcon, TagIcon, CogIcon } from "@sanity/icons";
import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";
import { CATEGORIES } from "@/lib/constants";

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
      S.divider(),
      S.listItem()
        .title("Photos")
        .icon(ImageIcon)
        .child(
          S.list()
            .title("Photos")
            .items([
              orderableDocumentListDeskItem({
                type: "photo",
                title: "All Photos",
                icon: ImageIcon,
                createIntent: false,
                S,
                context,
              }),
              S.divider(),
              ...CATEGORIES.map((cat) =>
                orderableDocumentListDeskItem({
                  type: "photo",
                  id: `orderable-photo-${cat.slug}`,
                  title: cat.label,
                  icon: ImageIcon,
                  filter: '_type == "photo" && category == $category',
                  params: { category: cat.slug },
                  createIntent: false,
                  S,
                  context,
                })
              ),
            ])
        ),
      orderableDocumentListDeskItem({
        type: "tag",
        title: "Tags",
        icon: TagIcon,
        S,
        context,
      }),
    ]);
