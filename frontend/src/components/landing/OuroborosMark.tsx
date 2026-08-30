export default function OuroborosMark({ size = 20, color = "var(--accent)" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path
        d="M24 5a19 19 0 1 0 15.5 8"
        stroke={color}
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M35 7.5 40.5 13 34 15.8Z" fill={color} />
      <circle cx="24" cy="12" r="2.1" fill="var(--background)" />
    </svg>
  );
}
