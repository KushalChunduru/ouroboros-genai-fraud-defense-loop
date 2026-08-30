import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16 border-t" style={{ borderColor: "var(--border)" }}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight max-w-md">
            Run the loop yourself — no setup required
          </h2>
          <p className="text-sm md:text-base mt-2 max-w-lg" style={{ color: "var(--muted)" }}>
            Every screen runs live against the real backend. Pick attack vectors, generate a batch, score it, and
            watch the arms race play out.
          </p>
        </div>
        <Link href="/console" className="btn btn-solid shrink-0">
          Launch the console →
        </Link>
      </div>
    </section>
  );
}
