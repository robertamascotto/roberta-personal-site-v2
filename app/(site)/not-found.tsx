import type { Metadata } from "next";
import Link from "next/link";
import "./not-found.css";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="nf-page">
      <h1 className="nf-h1">Page not found</h1>
      <p className="nf-p">This page doesn&apos;t exist, or it has moved.</p>
      <Link href="/" className="nf-link">
        Back to home
      </Link>
    </div>
  );
}
