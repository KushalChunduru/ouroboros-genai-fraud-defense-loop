import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="max-w-6xl mx-auto px-6 pb-24">
      <div
        className="card p-10 md:p-14 text-center flex flex-col items-center gap-5"
        style={{ background: "linear-gradient(135deg, rgba(124,92,255,0.12), rgba(53,226,194,0.08))" }}
      >
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight max-w-xl">
          Run the loop yourself — no setup required
        </h2>
        <p className="text-sm md:text-base max-w-lg" style={{ color: "var(--muted)" }}>
          Every screen runs live against the real backend. Pick attack vectors, generate a batch, score it, and
          watch the arms race play out.
        </p>
        <Link href="/console" className="btn-primary px-7 py-3.5 rounded-full font-medium">
          Launch the console →
        </Link>
      </div>
    </section>
  );
}
