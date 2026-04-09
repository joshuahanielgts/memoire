import { useReveal } from "@/hooks/useReveal";

const ReportPreview = () => {
  const { ref: r1, visible: v1 } = useReveal();
  const { ref: r2, visible: v2 } = useReveal();

  return (
    <section className="py-32 md:py-48 px-6 bg-secondary/20">
      <div className="max-w-5xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground tracking-[0.3em] text-xs uppercase font-sans">Documentation</p>
          <h2 className="font-serif text-3xl md:text-5xl text-foreground font-light">
            Every scent, fully documented
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Scent Report Mock */}
          <div ref={r1} className={`reveal ${v1 ? "visible" : ""}`}>
            <div className="border border-border/50 bg-background p-8 md:p-12 space-y-8">
              <div className="space-y-2">
                <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground/60 font-sans">Scent Report</p>
                <h3 className="font-serif text-2xl text-foreground">Sous la Pluie</h3>
                <p className="text-muted-foreground/50 text-[10px] tracking-[0.2em] uppercase font-sans">ID 7826-04-21 · No. 0001</p>
              </div>

              {/* Notes Pyramid */}
              <div className="space-y-6">
                <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground font-sans">Olfactory Structure</p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/60 font-sans w-12">Top</span>
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground font-light">Petrichor · Green Fig · Ozone</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/60 font-sans w-12">Heart</span>
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground font-light">Wet Stone · Iris · Violet Leaf</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/60 font-sans w-12">Base</span>
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground font-light">Oakmoss · White Musk · Cedar</span>
                  </div>
                </div>
              </div>

              {/* Properties */}
              <div className="space-y-4">
                <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground font-sans">Properties</p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Longevity", value: "8–10 hours" },
                    { label: "Projection", value: "Moderate" },
                    { label: "Season", value: "Spring · Autumn" },
                    { label: "Character", value: "Atmospheric" },
                  ].map((prop) => (
                    <div key={prop.label} className="space-y-1">
                      <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/60 font-sans">{prop.label}</p>
                      <p className="text-xs text-muted-foreground font-light">{prop.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Certificate Mock */}
          <div ref={r2} className={`reveal ${v2 ? "visible" : ""}`} style={{ transitionDelay: "200ms" }}>
            <div className="border border-border/50 bg-background p-8 md:p-12 space-y-8 flex flex-col items-center text-center min-h-full justify-center">
              <div className="w-16 h-px bg-accent" />
              <div className="space-y-2">
                <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground/60 font-sans">Certificate of Uniqueness</p>
                <h3 className="font-serif text-3xl text-foreground">Mémoire</h3>
              </div>
              <div className="space-y-6 max-w-xs">
                <p className="text-muted-foreground text-sm font-light leading-relaxed">
                  This certifies that the fragrance composition herein is singular and unrepeatable — 
                  composed exclusively for its owner.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground/60 font-sans">
                    <span className="tracking-[0.2em] uppercase">Composition</span>
                    <span>Sous la Pluie</span>
                  </div>
                  <div className="h-px bg-border/50" />
                  <div className="flex justify-between text-xs text-muted-foreground/60 font-sans">
                    <span className="tracking-[0.2em] uppercase">ID</span>
                    <span>7826-04-21</span>
                  </div>
                  <div className="h-px bg-border/50" />
                  <div className="flex justify-between text-xs text-muted-foreground/60 font-sans">
                    <span className="tracking-[0.2em] uppercase">Serial</span>
                    <span>No. 0001</span>
                  </div>
                  <div className="h-px bg-border/50" />
                  <div className="flex justify-between text-xs text-muted-foreground/60 font-sans">
                    <span className="tracking-[0.2em] uppercase">Date</span>
                    <span>April 2026</span>
                  </div>
                </div>
              </div>
              <div className="w-16 h-px bg-accent mt-4" />
              <p className="font-serif text-lg text-accent italic">Mémoire</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReportPreview;
