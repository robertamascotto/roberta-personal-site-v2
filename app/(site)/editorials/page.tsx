import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { getEditorials, safeFetch } from "@/studio/lib/helpers";
import PageContainer from "@/components/PageContainer";
import PageHero from "@/components/PageHero";
import EditorialTeaser from "@/components/gallery/EditorialTeaser";

export const metadata: Metadata = {
  title: "Editorials",
  description: "Personal and campaign portrait series.",
  alternates: { canonical: "/editorials" },
};

export default async function EditorialsPage() {
  const { isEnabled: isPreview } = await draftMode();
  const editorials = await safeFetch(getEditorials(isPreview), []);

  return (
    <PageContainer>
      <PageHero label="Editorial" headline="Personal and campaign portrait series." maxWidth="max-w-[60ch]" />
      {editorials.length === 0 ? (
        <p className="text-ink/60 pb-24">No editorials yet.</p>
      ) : (
        editorials.map((editorial) => <EditorialTeaser key={editorial._id} editorial={editorial} />)
      )}
    </PageContainer>
  );
}
