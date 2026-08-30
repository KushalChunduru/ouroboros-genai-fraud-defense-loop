const STACK = [
  "FastAPI", "Python", "scikit-learn", "networkx", "Google Gemini",
  "Next.js 16", "TypeScript", "Tailwind CSS", "Recharts",
];

export default function TechStack() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-10 border-t" style={{ borderColor: "var(--border)" }}>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs" style={{ color: "var(--muted)" }}>
        <span className="eyebrow shrink-0">Built with</span>
        {STACK.map((s) => (
          <span key={s} className="data">{s}</span>
        ))}
      </div>
    </section>
  );
}
