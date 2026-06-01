/** Matches sticky header / `scroll-mt-[4.25rem]` on section anchors. */
export const SECTION_SCROLL_OFFSET = 72;

export function scrollToSection(
  id: string,
  behavior: ScrollBehavior = "smooth",
) {
  const target = document.getElementById(id);
  if (!target) return;

  const top =
    target.getBoundingClientRect().top + window.scrollY - SECTION_SCROLL_OFFSET;
  window.scrollTo({ top: Math.max(0, top), behavior });
}
