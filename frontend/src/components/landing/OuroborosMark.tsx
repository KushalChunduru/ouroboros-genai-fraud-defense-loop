export default function OuroborosMark({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="ouro-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--accent)" />
          <stop offset="1" stopColor="var(--accent-2)" />
        </linearGradient>
      </defs>
      <path
        d="M24 5a19 19 0 1 0 15.5 8"
        stroke="url(#ouro-grad)"
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M35 7.5 40.5 13 34 15.8Z" fill="var(--accent-2)" />
      <circle cx="24" cy="12" r="2.1" fill="var(--background)" />
    </svg>
  );
}
