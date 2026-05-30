/** Orbs biased to the right — left column stays clean for reading. */
export function NewsPageBackdrop() {
  return (
    <div className="news-page-backdrop" aria-hidden>
      <div className="news-page-orb news-page-orb--sky" />
      <div className="news-page-orb news-page-orb--violet" />
      <div className="news-page-orb news-page-orb--mint" />
    </div>
  );
}
