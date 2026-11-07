"use client";

import { useEffect, useState } from "react";

/**
 * The list of a project's sets under its title. It follows the page: the set you are looking at
 * is shown darker, and clicking a name jumps to it.
 */
export default function SetNav({ items }: { items: { id: string; title: string }[] }) {
  const [active, setActive] = useState(items[0]?.id);
  const key = items.map((i) => i.id).join("|");

  useEffect(() => {
    const ids = key.split("|");
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-30% 0px -60% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [key]);

  return (
    <nav aria-label="Sets" className="mt-6 flex flex-col gap-2 max-[900px]:flex-row max-[900px]:flex-wrap max-[900px]:gap-x-5">
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          aria-current={active === item.id ? "true" : undefined}
          className={`w-max font-body text-[13px] no-underline transition-colors hover:text-ink! ${
            active === item.id ? "text-ink!" : "text-ink/45!"
          }`}
        >
          {item.title}
        </a>
      ))}
    </nav>
  );
}
