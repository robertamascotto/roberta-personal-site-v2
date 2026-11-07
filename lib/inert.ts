/** Marks everything on the page except the given element's own branch as inert; returns what it marked. */
export function inertEverythingElse(root: HTMLElement | null): Element[] {
  const marked: Element[] = [];
  let node: HTMLElement | null = root;
  while (node && node !== document.body) {
    const parent: HTMLElement | null = node.parentElement;
    if (!parent) break;
    Array.from(parent.children).forEach((el) => {
      if (el === node || el.tagName === "SCRIPT" || el.hasAttribute("inert")) return;
      el.setAttribute("inert", "");
      marked.push(el);
    });
    node = parent;
  }
  return marked;
}
