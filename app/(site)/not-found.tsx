import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="max-w-[1240px] mx-auto px-5 md:px-[clamp(20px,5vw,64px)] pt-[90px] pb-32 text-center">
      <p className="font-body text-xs tracking-[0.3em] uppercase text-ink/40 mb-4">Page Not Found</p>
      <h1 className="font-heading font-black text-5xl md:text-6xl lg:text-7xl mb-6">404</h1>
      <p className="text-ink/60 max-w-md mx-auto mb-12">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-block px-10 py-4 text-sm tracking-[0.1em] uppercase border border-ink hover:bg-ink hover:text-paper transition-all duration-500 no-underline"
        style={{ transitionTimingFunction: "var(--ease-luxe)" }}
      >
        Back to Home
      </Link>
    </div>
  );
}
