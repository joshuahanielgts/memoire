import { useEffect, useState } from "react";

interface StepProcessingProps {
  onComplete: () => void;
}

const phrases = [
  "Interpreting your memory…",
  "Mapping olfactory language…",
  "Selecting accords…",
  "Composing structure…",
  "Finalizing compositions…",
];

const StepProcessing = ({ onComplete }: StepProcessingProps) => {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((i) => {
        if (i >= phrases.length - 1) {
          clearInterval(interval);
          setTimeout(onComplete, 1200);
          return i;
        }
        return i + 1;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="text-center space-y-12">
        {/* Subtle animated element */}
        <div className="w-20 h-20 mx-auto relative">
          <div className="absolute inset-0 border border-accent/30 rounded-full animate-ping" style={{ animationDuration: "3s" }} />
          <div className="absolute inset-2 border border-accent/20 rounded-full animate-ping" style={{ animationDuration: "3s", animationDelay: "0.5s" }} />
          <div className="absolute inset-4 border border-accent/10 rounded-full animate-ping" style={{ animationDuration: "3s", animationDelay: "1s" }} />
        </div>
        <div className="space-y-3">
          <p className="text-muted-foreground tracking-[0.3em] text-xs uppercase font-sans">Composing</p>
          <p className="font-serif text-xl md:text-2xl text-foreground font-light transition-all duration-500">
            {phrases[phraseIndex]}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StepProcessing;
