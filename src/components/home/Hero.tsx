import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-secondary/30" />
      <div className="relative z-10 text-center max-w-3xl mx-auto space-y-8">
        <p className="text-muted-foreground tracking-[0.4em] text-xs uppercase font-sans">
          Mémoire · Personalized Fragrance Atelier
        </p>
        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-light tracking-tight text-foreground leading-[1.1]">
          What does your memory smell like?
        </h1>
        <p className="text-muted-foreground text-base md:text-lg font-light max-w-lg mx-auto leading-relaxed">
          We compose singular fragrances from your personal narratives — 
          each one unrepeatable, each one yours alone.
        </p>
        <div className="pt-4">
          <Link
            to="/create"
            className="inline-block border border-foreground/20 px-10 py-4 text-xs tracking-[0.3em] uppercase text-foreground hover:bg-foreground hover:text-background transition-all duration-500 font-sans"
          >
            Begin Composition
          </Link>
        </div>
      </div>
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
        <div className="w-px h-12 bg-gradient-to-b from-transparent to-muted-foreground/30" />
      </div>
    </section>
  );
};

export default Hero;
