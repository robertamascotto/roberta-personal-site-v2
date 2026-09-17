import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="py-24 md:py-32 text-center">
      <p className="text-[0.6875rem] tracking-[0.3em] uppercase text-warm-gray-lighter mb-4">
        Page Not Found
      </p>
      <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-light text-warm-gray mb-6">
        404
      </h1>
      <p className="text-warm-gray-light max-w-md mx-auto mb-12">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-block px-10 py-4 text-sm tracking-[0.1em] uppercase border border-warm-gray text-warm-gray hover:bg-warm-gray hover:text-cream transition-all duration-500"
        style={{ transitionTimingFunction: "var(--ease-luxe)" }}
      >
        Back to Home
      </Link>
    </div>
  );
}
