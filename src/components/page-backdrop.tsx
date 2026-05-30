/** Soft gradient orbs — biased right so primary content stays clean. */
export function PageBackdrop() {
  return (
    <div className="page-backdrop" aria-hidden>
      <div className="page-orb page-orb--sky" />
      <div className="page-orb page-orb--violet" />
      <div className="page-orb page-orb--mint" />
    </div>
  );
}
