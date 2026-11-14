"use client";

import { usePathname } from "next/navigation";
import "./site-footer.css";

type Social = { platform?: string; url?: string };

/**
 * One thin line at the very end of the pages you scroll (Editorials, Products, Contact): copyright and city on the
 * left, Instagram / LinkedIn / Email on the right. Not on Home (one screen) or Movement (full-screen film).
 */
export default function SiteFooter({ email, socials }: { email?: string; socials?: Social[] }) {
  const path = usePathname();
  if (path === "/" || path === "/movement") return null;

  const links = (socials || []).filter((s) => s.platform && s.url);

  return (
    <footer className="site-footer">
      <span>© {new Date().getFullYear()} Roberta Mascotto — New York</span>
      <span className="site-footer-links">
        {links.map((s) => (
          <a key={s.platform} href={s.url} target="_blank" rel="noopener noreferrer">
            {s.platform}
          </a>
        ))}
        {email && <a href={`mailto:${email}`}>Email</a>}
      </span>
    </footer>
  );
}
