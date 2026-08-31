import Link from "next/link";
import Reveal from "@/components/Reveal";

export default function FinalCTA() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <Reveal>
        <div className="block-teal rounded-3xl px-8 py-14 md:px-16 md:py-20 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <div className="eyebrow mb-4">Ready when you are</div>
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight max-w-lg leading-[1.05]">
              Run the loop yourself
              <span className="headline-dot" aria-hidden="true" />
            </h2>
            <p className="mesh-muted text-sm md:text-base mt-4 max-w-lg">
              Every screen runs live against the real backend. Pick attack vectors, generate a batch, score it, and
              watch the arms race play out.
            </p>
          </div>
          <Link href="/console" className="btn btn-solid shrink-0">
            Launch the console →
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
