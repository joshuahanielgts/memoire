import { type ScentComposition } from "@/pages/CreatePage";

interface StepDetailProps {
  composition: ScentComposition;
  onNext: () => void;
}

const StepDetail = ({ composition, onNext }: StepDetailProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-24">
      <div className="max-w-3xl w-full space-y-16 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-4">
          <p className="text-muted-foreground/40 text-[10px] tracking-[0.3em] uppercase font-sans">{composition.id}</p>
          <h1 className="font-serif text-5xl md:text-7xl text-foreground font-light">{composition.name}</h1>
          <p className="font-serif text-lg md:text-xl text-muted-foreground italic font-light">{composition.tagline}</p>
        </div>

        {/* Notes Pyramid */}
        <div className="space-y-8">
          <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground font-sans text-center">Olfactory Structure</p>
          <div className="flex flex-col items-center space-y-6">
            {[
              { label: "Top Notes", value: composition.notes.top, width: "w-48 md:w-56" },
              { label: "Heart Notes", value: composition.notes.heart, width: "w-64 md:w-72" },
              { label: "Base Notes", value: composition.notes.base, width: "w-80 md:w-96" },
            ].map((layer) => (
              <div key={layer.label} className={`${layer.width} border border-border/50 p-5 text-center space-y-1`}>
                <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/50 font-sans">{layer.label}</p>
                <p className="text-sm text-foreground font-light">{layer.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Properties */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: "Longevity", value: composition.longevity },
            { label: "Projection", value: composition.projection },
            { label: "Season", value: composition.season },
            { label: "Character", value: composition.character },
          ].map((prop) => (
            <div key={prop.label} className="text-center space-y-2">
              <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/50 font-sans">{prop.label}</p>
              <p className="text-sm text-foreground font-light">{prop.value}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-center pt-8">
          <button
            onClick={onNext}
            className="bg-foreground text-background px-12 py-4 text-xs tracking-[0.3em] uppercase hover:bg-foreground/90 transition-all duration-500 font-sans"
          >
            Commission This Scent
          </button>
        </div>
      </div>
    </div>
  );
};

export default StepDetail;
