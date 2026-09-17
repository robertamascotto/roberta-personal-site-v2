import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const secret = searchParams.get("secret");
  const slug = searchParams.get("slug") || "/";

  // Validate the secret
  if (secret !== process.env.SANITY_REVALIDATE_SECRET) {
    return new Response("Invalid token", { status: 401 });
  }

  // Ensure slug is a relative path to prevent open redirect
  const safePath = slug.startsWith("/") ? slug : "/";

  (await draftMode()).enable();
  redirect(safePath);
}
