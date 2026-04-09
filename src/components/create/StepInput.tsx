interface StepInputProps {
  value: string;
  onChange: (val: string) => void;
  onNext: () => void;
}

const StepInput = ({ value, onChange, onNext }: StepInputProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="max-w-2xl w-full space-y-10 animate-fade-in">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground tracking-[0.3em] text-xs uppercase font-sans">Step One</p>
          <h1 className="font-serif text-3xl md:text-5xl text-foreground font-light">
            Describe the scent you want to create
          </h1>
          <p className="text-muted-foreground text-sm font-light max-w-md mx-auto">
            A memory, a feeling, a place, a moment — tell us what you want to capture.
          </p>
        </div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="The smell of my grandmother's kitchen on Sunday mornings — warm bread, cinnamon, and sunlight through lace curtains..."
          className="w-full h-48 bg-transparent border border-border/50 p-6 text-foreground text-base font-light leading-relaxed placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/50 transition-colors duration-300 resize-none"
        />
        <div className="flex justify-end">
          <button
            onClick={onNext}
            disabled={value.length < 10}
            className="border border-foreground/20 px-10 py-4 text-xs tracking-[0.3em] uppercase text-foreground hover:bg-foreground hover:text-background transition-all duration-500 font-sans disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default StepInput;
