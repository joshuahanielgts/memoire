import { useState } from "react";
import { Link } from "react-router-dom";
import { type ScentComposition } from "@/pages/CreatePage";

const options = [
  {
    size: "10ml",
    label: "Discovery",
    price: "€95",
    description: "Travel-size trial bottle with scent report",
    includes: ["Engraved glass vial", "Digital scent report"],
  },
  {
    size: "50ml",
    label: "Full Composition",
    price: "€285",
    description: "Signature bottle with full documentation",
    includes: ["Sculptural engraved bottle", "Printed scent report", "Uniqueness certificate", "Archival packaging"],
    featured: true,
  },
];

interface StepPurchaseProps {
  composition: ScentComposition;
}

const StepPurchase = ({ composition }: StepPurchaseProps) => {
  const [selected, setSelected] = useState(1);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-24">
      <div className="max-w-3xl w-full space-y-12 animate-fade-in">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground/40 text-[10px] tracking-[0.3em] uppercase font-sans">{composition.id}</p>
          <h2 className="font-serif text-3xl md:text-4xl text-foreground font-light">{composition.name}</h2>
          <p className="text-muted-foreground text-sm font-light">Choose your format</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {options.map((opt, i) => (
            <button
              key={opt.size}
              onClick={() => setSelected(i)}
              className={`border p-8 md:p-10 text-left space-y-6 transition-all duration-500 ${
                selected === i
                  ? "border-accent bg-secondary/30"
                  : "border-border/30 hover:border-accent/30"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-serif text-2xl text-foreground">{opt.label}</h3>
                  <span className="text-accent text-sm font-sans">{opt.size}</span>
                </div>
                <p className="font-serif text-3xl text-foreground">{opt.price}</p>
                <p className="text-muted-foreground text-xs font-light">{opt.description}</p>
              </div>
              <div className="space-y-2 pt-4 border-t border-border/30">
                <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/50 font-sans">Includes</p>
                {opt.includes.map((item) => (
                  <p key={item} className="text-xs text-muted-foreground font-light">· {item}</p>
                ))}
              </div>
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center gap-6 pt-4">
          <button className="w-full md:w-auto bg-foreground text-background px-16 py-4 text-xs tracking-[0.3em] uppercase hover:bg-foreground/90 transition-all duration-500 font-sans">
            Complete Order
          </button>
          <Link
            to="/"
            className="text-muted-foreground/50 text-[10px] tracking-[0.2em] uppercase hover:text-foreground transition-colors duration-300 font-sans"
          >
            Return to Atelier
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StepPurchase;
