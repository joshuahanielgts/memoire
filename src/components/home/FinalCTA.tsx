import { Link } from "react-router-dom";
import { useReveal } from "@/hooks/useReveal";

const FinalCTA = () => {
  const { ref, visible } = useReveal();

  return (
    <section className="py-32 md:py-48 px-6">
      <div ref={ref} className={`reveal ${visible ? "visible" : ""} max-w-2xl mx-auto text-center space-y-8`}>
        <h2 className="font-serif text-4xl md:text-6xl text-foreground font-light">
          Create your scent
        </h2>
        <p className="text-muted-foreground text-base font-light max-w-md mx-auto leading-relaxed">
          Begin with a memory. End with a fragrance that belongs only to you.
        </p>
        <div className="pt-4">
          <Link
            to="/create"
            className="inline-block bg-foreground text-background px-12 py-4 text-xs tracking-[0.3em] uppercase hover:bg-foreground/90 transition-all duration-500 font-sans"
          >
            Begin Composition
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
