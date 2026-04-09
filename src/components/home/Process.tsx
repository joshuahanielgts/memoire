import { useReveal } from "@/hooks/useReveal";

const steps = [
  { number: "01", title: "Describe", description: "Share the memory, the feeling, the moment you want to capture in scent." },
  { number: "02", title: "Interpret", description: "Our atelier translates your words into olfactory language — notes, accords, and structure." },
  { number: "03", title: "Compose", description: "A unique fragrance is composed, with its own identity, report, and certificate." },
  { number: "04", title: "Deliver", description: "Your scent arrives in a sculptural bottle, engraved with your personal composition ID." },
];

const ProcessStep = ({ step, index }: { step: typeof steps[0]; index: number }) => {
  const { ref, visible } = useReveal(0.2);
  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "visible" : ""} flex flex-col md:flex-row items-start gap-6 md:gap-12`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <span className="text-accent font-serif text-5xl md:text-6xl font-light">{step.number}</span>
      <div className="space-y-3">
        <h3 className="font-serif text-2xl md:text-3xl text-foreground">{step.title}</h3>
        <p className="text-muted-foreground text-sm md:text-base font-light leading-relaxed max-w-md">
          {step.description}
        </p>
      </div>
    </div>
  );
};

const Process = () => {
  return (
    <section className="py-32 md:py-48 px-6">
      <div className="max-w-3xl mx-auto space-y-20 md:space-y-28">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground tracking-[0.3em] text-xs uppercase font-sans">The Process</p>
          <h2 className="font-serif text-3xl md:text-5xl text-foreground font-light">
            From memory to molecule
          </h2>
        </div>
        <div className="space-y-16 md:space-y-24">
          {steps.map((step, i) => (
            <ProcessStep key={step.number} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Process;
