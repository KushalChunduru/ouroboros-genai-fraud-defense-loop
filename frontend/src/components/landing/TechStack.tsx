const STACK = [
  "FastAPI", "Python", "scikit-learn", "networkx", "Google Gemini",
  "Next.js 16", "TypeScript", "Tailwind CSS", "Recharts",
];

export default function TechStack() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-14">
      <div className="text-center text-xs uppercase tracking-wider mb-5" style={{ color: "var(--muted)" }}>
        Built with
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        {STACK.map((s) => (
          <span key={s} className="card-2 px-3.5 py-1.5 rounded-full text-xs">
            {s}
          </span>
        ))}
      </div>
    </section>
  );
}
