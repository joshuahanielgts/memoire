import { useReveal } from "@/hooks/useReveal";

const Philosophy = () => {
  const { ref: r1, visible: v1 } = useReveal();
  const { ref: r2, visible: v2 } = useReveal();

  return (
    <section id="philosophy" className="py-32 md:py-48 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-12">
          <div ref={r1} className={`reveal ${v1 ? "visible" : ""} md:col-span-5 space-y-6`}>
            <p className="text-muted-foreground tracking-[0.3em] text-xs uppercase font-sans">Philosophy</p>
            <h2 className="font-serif text-3xl md:text-4xl text-foreground font-light leading-snug">
              Scent as identity
            </h2>
          </div>
          <div ref={r2} className={`reveal ${v2 ? "visible" : ""} md:col-span-7 space-y-8`} style={{ transitionDelay: "200ms" }}>
            <p className="text-muted-foreground text-base font-light leading-[1.9]">
              A fragrance is the most intimate form of self-expression — invisible yet unforgettable, 
              deeply personal yet universally understood. At Mémoire, we believe no two people should 
              wear the same scent, because no two people carry the same memories.
            </p>
            <p className="text-muted-foreground text-base font-light leading-[1.9]">
              Each composition begins with a story — yours. We translate emotion into olfactory architecture, 
              creating a fragrance that exists only once, documented with a full scent report and sealed 
              with a certificate of uniqueness.
            </p>
            <p className="text-muted-foreground text-base font-light leading-[1.9]">
              This is not perfumery as product. This is perfumery as art, as archive, as autobiography.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Philosophy;
