/** Three intersecting orbital loops — a literal stand-in for the closed-loop
 * concept (Identify/Generate/Defend, or the two feedback loops) rendered as
 * line art, echoing the reference's atom illustration but on-theme: orbits
 * ARE loops. Small colored nodes mark a few crossing points. */
export default function OrbitalLoops() {
  return (
    <svg viewBox="0 0 420 420" className="w-full h-full" fill="none">
      <g transform="translate(210,210)">
        <ellipse rx="170" ry="80" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" />
        <ellipse rx="170" ry="80" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" transform="rotate(60)" />
        <ellipse rx="170" ry="80" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" transform="rotate(120)" />
        <circle r="7" fill="var(--accent)" />
        <circle cx="170" cy="0" r="4" fill="var(--accent-2)" />
        <circle cx="-85" cy="69" r="4" fill="var(--warn)" />
        <circle cx="-85" cy="-69" r="4" fill="var(--danger)" />
      </g>
    </svg>
  );
}
