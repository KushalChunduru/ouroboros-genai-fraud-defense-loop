export function IconRadar({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a10 10 0 1 0 10 10" />
      <path d="M12 7a5 5 0 1 0 5 5" />
      <circle cx="12" cy="12" r="1.4" fill={color} stroke="none" />
      <path d="M12 12 L18 6" />
    </svg>
  );
}

export function IconSpark({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
      <path d="M12 9a3 3 0 1 0 3 3" />
      <path d="M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" opacity="0.5" />
    </svg>
  );
}

export function IconShield({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.5 20 6v6c0 5-3.4 8.4-8 9.5-4.6-1.1-8-4.5-8-9.5V6l8-3.5Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function IconLoop({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 2 21 6 17 10" />
      <path d="M3 12v-1a5 5 0 0 1 5-5h13" />
      <path d="M7 22 3 18 7 14" />
      <path d="M21 12v1a5 5 0 0 1-5 5H3" />
    </svg>
  );
}

export function IconReport({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h9l4 4v14H6z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6M9 17h6M9 9h2" />
    </svg>
  );
}

export function IconMicroscope({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 21h12" />
      <path d="M9 21a5 5 0 0 1 3-9 5 5 0 0 1 3 9" />
      <path d="M9 8 6.5 5.5a1.5 1.5 0 0 1 2-2L11 6" />
      <path d="m14 8 3-3" />
    </svg>
  );
}
