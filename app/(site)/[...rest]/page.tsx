import { notFound } from "next/navigation";

/**
 * Any address that is not a real page lands here and shows the branded "Page not found"
 * (app/(site)/not-found.tsx) inside the normal layout, with the menu, instead of the bare default.
 */
export default function CatchAll() {
  notFound();
}
