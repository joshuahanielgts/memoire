import { useState, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import StepInput from "@/components/create/StepInput";
import StepRefinement from "@/components/create/StepRefinement";
import StepProcessing from "@/components/create/StepProcessing";
import StepResults from "@/components/create/StepResults";
import StepDetail from "@/components/create/StepDetail";
import StepPurchase from "@/components/create/StepPurchase";

export interface ScentComposition {
  id: string;
  name: string;
  tagline: string;
  notes: { top: string; heart: string; base: string };
  longevity: string;
  projection: string;
  season: string;
  character: string;
}

const mockResults: ScentComposition[] = [
  {
    id: "ID 4821-09-15",
    name: "Crépuscule Doré",
    tagline: "Golden light through autumn leaves, the warmth of ending days.",
    notes: { top: "Saffron, Mandarin", heart: "Amber, Labdanum", base: "Sandalwood, Tonka Bean" },
    longevity: "10–12 hours",
    projection: "Strong",
    season: "Autumn · Winter",
    character: "Warm & Enveloping",
  },
  {
    id: "ID 4821-09-16",
    name: "Jardin Intérieur",
    tagline: "A secret garden behind closed eyes — green, alive, protected.",
    notes: { top: "Galbanum, Basil", heart: "Tuberose, Jasmine", base: "Vetiver, Moss" },
    longevity: "8–10 hours",
    projection: "Moderate",
    season: "Spring · Summer",
    character: "Fresh & Contemplative",
  },
  {
    id: "ID 4821-09-17",
    name: "Encre & Soie",
    tagline: "Ink on paper, silk on skin — the quiet luxury of presence.",
    notes: { top: "Pink Pepper, Bergamot", heart: "Iris, Violet", base: "Cashmere Wood, Musk" },
    longevity: "6–8 hours",
    projection: "Intimate",
    season: "All seasons",
    character: "Elegant & Understated",
  },
];

const CreatePage = () => {
  const [step, setStep] = useState(1);
  const [description, setDescription] = useState("");
  const [mood, setMood] = useState("");
  const [environment, setEnvironment] = useState<string[]>([]);
  const [intensity, setIntensity] = useState(50);
  const [selected, setSelected] = useState<ScentComposition | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Resume to checkout after auth
  const resumeCheckout = searchParams.get("resume") === "checkout";
  useState(() => {
    if (resumeCheckout && user) {
      setStep(6);
    }
  });

  const next = useCallback(() => setStep((s) => s + 1), []);

  const handleSelect = (comp: ScentComposition) => {
    setSelected(comp);
    setStep(5);
  };

  // Auth gate: when moving to step 6 (purchase), check if logged in
  const handleProceedToCheckout = useCallback(() => {
    if (!user) {
      navigate("/auth?returnTo=/create?resume=checkout");
      return;
    }
    setStep(6);
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-6">
        <Link to="/" className="font-serif text-lg text-foreground hover:text-accent transition-colors duration-300">
          Mémoire
        </Link>
        {step < 6 && (
          <p className="text-muted-foreground/50 text-[10px] tracking-[0.3em] uppercase font-sans">
            Step {step} of 6
          </p>
        )}
      </div>

      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-px bg-border/30">
        <div
          className="h-full bg-accent transition-all duration-700 ease-out"
          style={{ width: `${(step / 6) * 100}%` }}
        />
      </div>

      {step === 1 && <StepInput value={description} onChange={setDescription} onNext={next} />}
      {step === 2 && (
        <StepRefinement
          mood={mood}
          setMood={setMood}
          environment={environment}
          setEnvironment={setEnvironment}
          intensity={intensity}
          setIntensity={setIntensity}
          onNext={next}
        />
      )}
      {step === 3 && <StepProcessing onComplete={next} />}
      {step === 4 && <StepResults compositions={mockResults} onSelect={handleSelect} />}
      {step === 5 && selected && <StepDetail composition={selected} onNext={handleProceedToCheckout} />}
      {step === 6 && selected && <StepPurchase composition={selected} />}
    </div>
  );
};

export default CreatePage;
