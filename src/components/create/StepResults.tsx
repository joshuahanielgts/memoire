import { type ScentComposition } from "@/pages/CreatePage";

interface StepResultsProps {
  compositions: ScentComposition[];
  onSelect: (c: ScentComposition) => void;
}

const StepResults = ({ compositions, onSelect }: StepResultsProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-24">
      <div className="max-w-4xl w-full space-y-12 animate-fade-in">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground tracking-[0.3em] text-xs uppercase font-sans">Your Compositions</p>
          <h2 className="font-serif text-3xl md:text-5xl text-foreground font-light">
            Your bespoke composition
          </h2>
          <p className="text-muted-foreground text-sm font-light">Explore and select your scent profile.</p>
        </div>
        <div className="flex justify-center">
          <div className="w-full max-w-md">
          {compositions.map((comp) => (
            <button
              key={comp.id}
              onClick={() => onSelect(comp)}
              className="group border border-border/50 p-8 space-y-6 text-left transition-all duration-500 hover:border-accent/50 hover:bg-secondary/20"
            >
              <div className="space-y-2">
                <p className="text-muted-foreground/40 text-[10px] tracking-[0.3em] uppercase font-sans">{comp.id}</p>
                <h3 className="font-serif text-2xl text-foreground">{comp.name}</h3>
              </div>
              <p className="text-muted-foreground text-sm font-light leading-relaxed italic">{comp.tagline}</p>
              <div className="space-y-1 pt-2 border-t border-border/30">
                <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground/50 font-sans">Top: {comp.notes.top}</p>
                <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground/50 font-sans">Heart: {comp.notes.heart}</p>
                <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground/50 font-sans">Base: {comp.notes.base}</p>
              </div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-accent font-sans group-hover:text-foreground transition-colors duration-300">
                Select →
              </p>
            </button>
          ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepResults;
