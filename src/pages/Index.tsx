import bottleImage from "@/assets/luxury-perfume-bottle.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full flex flex-col items-center gap-10">
        <header className="text-center space-y-3">
          <p className="text-muted-foreground tracking-[0.35em] text-xs uppercase">
            Personalized Fragrance Atelier
          </p>
          <h1 className="font-serif text-4xl md:text-5xl tracking-tight text-foreground">
            MÉMOIRE
          </h1>
          <p className="text-muted-foreground text-sm tracking-widest">
            Scent Composed from Memory
          </p>
        </header>

        <div className="w-full max-w-md">
          <img
            src={bottleImage}
            alt="MÉMOIRE luxury perfume bottle — sculptural glass with engraved ID 7826-04-21, No. 0001, displayed alongside a certificate of uniqueness"
            width={1024}
            height={1344}
            className="w-full h-auto"
          />
        </div>

        <div className="text-center space-y-4 max-w-sm">
          <p className="text-muted-foreground text-sm leading-relaxed">
            Each bottle is a singular composition — crafted from your memories, 
            sealed with an engraved identity, and accompanied by a certificate 
            of uniqueness.
          </p>
          <p className="text-muted-foreground/60 text-xs tracking-[0.2em] uppercase">
            ID 7826-04-21 · No. 0001
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
