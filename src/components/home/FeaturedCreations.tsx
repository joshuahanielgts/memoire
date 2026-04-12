import { useState } from "react";
import { useReveal } from "@/hooks/useReveal";

import bottleSousLaPluie from "@/assets/bottle-sous-la-pluie.jpg";
import bottleDernierEte from "@/assets/bottle-dernier-ete.jpg";
import bottleEncreNoire from "@/assets/bottle-encre-noire.jpg";
import bottlePremierBaiser from "@/assets/bottle-premier-baiser.jpg";

const creations = [
  {
    name: "Sous la Pluie",
    mood: "Nostalgic · Tender",
    description: "The smell of warm rain on limestone, a grandmother's garden in late June.",
    notes: { top: "Petrichor, Green Fig", heart: "Wet Stone, Iris", base: "Oakmoss, Musk" },
    id: "ID 7826-04-21",
    image: bottleSousLaPluie,
  },
  {
    name: "Dernier Été",
    mood: "Luminous · Bittersweet",
    description: "Sun-warmed skin, salt breeze, and the last page of a book read by the sea.",
    notes: { top: "Bergamot, Sea Salt", heart: "Tiare, Coconut Milk", base: "Driftwood, Ambergris" },
    id: "ID 3901-11-08",
    image: bottleDernierEte,
  },
  {
    name: "Encre Noire",
    mood: "Introspective · Deep",
    description: "A midnight library — aged leather, ink, and the quiet hum of concentration.",
    notes: { top: "Black Pepper, Cardamom", heart: "Leather, Oud", base: "Vetiver, Amber" },
    id: "ID 5412-02-14",
    image: bottleEncreNoire,
  },
  {
    name: "Premier Baiser",
    mood: "Intimate · Electric",
    description: "The space between two people before a first kiss — warm breath and wild nerves.",
    notes: { top: "Pink Pepper, Neroli", heart: "Turkish Rose, Saffron", base: "Vanilla, Sandalwood" },
    id: "ID 9087-06-30",
    image: bottlePremierBaiser,
  },
];

const CreationCard = ({ creation, index }: { creation: typeof creations[0]; index: number }) => {
  const [hovered, setHovered] = useState(false);
  const { ref, visible } = useReveal(0.15);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "visible" : ""} group cursor-pointer`}
      style={{ transitionDelay: `${index * 100}ms` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="border border-border/50 transition-all duration-500 hover:border-accent/50 hover:bg-secondary/30 overflow-hidden">
        {/* Bottle image */}
        <div className="relative overflow-hidden bg-background">
          <img
            src={creation.image}
            alt={`${creation.name} perfume bottle`}
            loading="lazy"
            width={768}
            height={1024}
            className={`w-full h-64 md:h-80 object-contain object-center transition-transform duration-700 drop-shadow-[0_8px_24px_rgba(0,0,0,0.12)] ${
              hovered ? "scale-105" : "scale-100"
            }`}
          />
        </div>

        {/* Content */}
        <div className="p-8 md:p-10 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <p className="text-muted-foreground/50 text-[10px] tracking-[0.3em] uppercase font-sans">{creation.id}</p>
            <h3 className="font-serif text-2xl md:text-3xl text-foreground">{creation.name}</h3>
            <p className="text-accent text-xs tracking-[0.2em] uppercase font-sans">{creation.mood}</p>
            <p className="text-muted-foreground text-sm font-light leading-relaxed">{creation.description}</p>
          </div>
          <div
            className={`space-y-2 transition-all duration-500 overflow-hidden ${
              hovered ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="pt-4 border-t border-border/30 space-y-1">
              <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/60 font-sans">Top: {creation.notes.top}</p>
              <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/60 font-sans">Heart: {creation.notes.heart}</p>
              <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/60 font-sans">Base: {creation.notes.base}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeaturedCreations = () => {
  return (
    <section id="compositions" className="py-32 md:py-48 px-6 bg-secondary/20">
      <div className="max-w-6xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground tracking-[0.3em] text-xs uppercase font-sans">Past Compositions</p>
          <h2 className="font-serif text-3xl md:text-5xl text-foreground font-light">
            Scents born from stories
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {creations.map((creation, i) => (
            <CreationCard key={creation.id} creation={creation} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCreations;
