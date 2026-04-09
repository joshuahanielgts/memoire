import { Slider } from "@/components/ui/slider";

const moods = [
  { label: "Nostalgic", desc: "Warm, familiar, comforting" },
  { label: "Luminous", desc: "Bright, radiant, uplifting" },
  { label: "Mysterious", desc: "Deep, enigmatic, alluring" },
  { label: "Serene", desc: "Calm, peaceful, meditative" },
  { label: "Passionate", desc: "Bold, intense, captivating" },
  { label: "Ethereal", desc: "Light, dreamy, otherworldly" },
];

const environments = [
  "Forest", "Ocean", "Garden", "Library", "Kitchen", "Rain",
  "Desert", "City Night", "Mountain", "Fireplace", "Market", "Church",
];

interface StepRefinementProps {
  mood: string;
  setMood: (m: string) => void;
  environment: string[];
  setEnvironment: (e: string[]) => void;
  intensity: number;
  setIntensity: (i: number) => void;
  onNext: () => void;
}

const StepRefinement = ({ mood, setMood, environment, setEnvironment, intensity, setIntensity, onNext }: StepRefinementProps) => {
  const toggleEnv = (e: string) => {
    setEnvironment(
      environment.includes(e) ? environment.filter((x) => x !== e) : [...environment, e]
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-24">
      <div className="max-w-2xl w-full space-y-16 animate-fade-in">
        {/* Mood */}
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-muted-foreground tracking-[0.3em] text-xs uppercase font-sans">Mood</p>
            <h2 className="font-serif text-2xl md:text-3xl text-foreground font-light">
              What feeling should it evoke?
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {moods.map((m) => (
              <button
                key={m.label}
                onClick={() => setMood(m.label)}
                className={`p-5 border text-left transition-all duration-300 ${
                  mood === m.label
                    ? "border-accent bg-secondary/50"
                    : "border-border/30 hover:border-accent/30"
                }`}
              >
                <p className="text-sm text-foreground font-light">{m.label}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">{m.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Environment */}
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-muted-foreground tracking-[0.3em] text-xs uppercase font-sans">Environment</p>
            <h2 className="font-serif text-2xl md:text-3xl text-foreground font-light">
              Where does this scent live?
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {environments.map((e) => (
              <button
                key={e}
                onClick={() => toggleEnv(e)}
                className={`px-5 py-2.5 border text-xs tracking-[0.15em] uppercase transition-all duration-300 font-sans ${
                  environment.includes(e)
                    ? "border-accent bg-accent/10 text-foreground"
                    : "border-border/30 text-muted-foreground hover:border-accent/30"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Intensity */}
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-muted-foreground tracking-[0.3em] text-xs uppercase font-sans">Intensity</p>
            <h2 className="font-serif text-2xl md:text-3xl text-foreground font-light">
              How strong should it speak?
            </h2>
          </div>
          <div className="space-y-4">
            <Slider
              value={[intensity]}
              onValueChange={(v) => setIntensity(v[0])}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] tracking-[0.2em] uppercase text-muted-foreground/50 font-sans">
              <span>Whisper</span>
              <span>Statement</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onNext}
            className="border border-foreground/20 px-10 py-4 text-xs tracking-[0.3em] uppercase text-foreground hover:bg-foreground hover:text-background transition-all duration-500 font-sans"
          >
            Compose My Scent
          </button>
        </div>
      </div>
    </div>
  );
};

export default StepRefinement;
