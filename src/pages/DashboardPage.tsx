import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useReveal } from "@/hooks/useReveal";

const statusSteps = [
  "Composition Received",
  "In Formulation",
  "In Evaluation",
  "Approved for Bottling",
  "Bottling in Progress",
  "Quality Check",
  "Packed",
  "Out for Delivery",
  "Delivered",
];

const activeCompositions = [
  {
    id: "ID 4821-09-15",
    name: "Encre Noire",
    mood: "Dark & Magnetic",
    status: "In Formulation",
    notes: "Oud, Black Pepper, Vetiver",
    date: "2026-03-28",
  },
  {
    id: "ID 4821-09-22",
    name: "Sous la Pluie",
    mood: "Fresh & Contemplative",
    status: "Bottling in Progress",
    notes: "Petrichor, Iris, Cedar",
    date: "2026-03-15",
  },
  {
    id: "ID 4821-09-30",
    name: "Premier Baiser",
    mood: "Warm & Intimate",
    status: "Out for Delivery",
    notes: "Rose, Musk, Vanilla",
    date: "2026-02-20",
  },
];

const pastCompositions = [
  {
    id: "ID 4821-08-04",
    name: "Dernier Été",
    mood: "Bright & Nostalgic",
    status: "Delivered",
    date: "2025-12-10",
  },
  {
    id: "ID 4821-07-11",
    name: "Chambre d'Ambre",
    mood: "Warm & Enveloping",
    status: "Archived",
    date: "2025-09-05",
  },
];

const getStatusIndex = (status: string) => statusSteps.indexOf(status);

const DashboardPage = () => {
  const { user, signOut } = useAuth();
  const ref1 = useReveal();
  const ref2 = useReveal();
  const ref3 = useReveal();
  const ref4 = useReveal();

  const displayName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Guest";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-6 bg-background/90 backdrop-blur-md border-b border-border/20">
        <Link
          to="/"
          className="font-serif text-lg text-foreground hover:text-accent transition-colors duration-500"
        >
          MÉMOIRE
        </Link>
        <div className="flex items-center gap-8">
          <Link
            to="/create"
            className="text-[11px] tracking-[0.2em] uppercase font-sans text-muted-foreground hover:text-foreground transition-colors duration-500"
          >
            New Composition
          </Link>
          <button
            onClick={signOut}
            className="text-[11px] tracking-[0.2em] uppercase font-sans text-muted-foreground/50 hover:text-foreground transition-colors duration-500"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-32 pb-24 space-y-20">
        {/* Welcome */}
        <div ref={ref1} className="reveal space-y-3">
          <p className="text-muted-foreground/40 text-[10px] tracking-[0.3em] uppercase font-sans">
            Your Private Atelier
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-foreground font-light leading-tight">
            Welcome back, {displayName}
          </h1>
          <p className="text-muted-foreground text-sm font-light max-w-lg">
            Track your fragrances, view scent reports, and follow your active
            orders.
          </p>
        </div>

        {/* Active Compositions */}
        <div ref={ref2} className="reveal space-y-8">
          <div className="space-y-1">
            <h2 className="font-serif text-2xl text-foreground font-light">
              Currently in composition
            </h2>
            <p className="text-muted-foreground/60 text-xs font-light">
              Perfumes being prepared in your atelier
            </p>
          </div>

          <div className="space-y-4">
            {activeCompositions.map((comp) => {
              const stepIdx = getStatusIndex(comp.status);
              const progress =
                stepIdx >= 0
                  ? ((stepIdx + 1) / statusSteps.length) * 100
                  : 0;

              return (
                <div
                  key={comp.id}
                  className="border border-border/30 p-6 md:p-8 space-y-5 hover:border-accent/30 transition-colors duration-500"
                >
                  <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-2">
                    <div className="space-y-1">
                      <h3 className="font-serif text-xl text-foreground">
                        {comp.name}
                      </h3>
                      <p className="text-muted-foreground/50 text-[10px] tracking-[0.2em] uppercase font-sans">
                        {comp.id} · {comp.mood}
                      </p>
                    </div>
                    <span className="text-accent text-[10px] tracking-[0.2em] uppercase font-sans">
                      {comp.status}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-2">
                    <div className="h-px bg-border/30 relative">
                      <div
                        className="h-full bg-accent transition-all duration-700 ease-out absolute top-0 left-0"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] tracking-[0.15em] uppercase font-sans text-muted-foreground/30">
                      <span>Received</span>
                      <span>Delivered</span>
                    </div>
                  </div>

                  <p className="text-muted-foreground/50 text-xs font-light">
                    Notes: {comp.notes}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Past Compositions */}
        <div ref={ref3} className="reveal space-y-8">
          <div className="space-y-1">
            <h2 className="font-serif text-2xl text-foreground font-light">
              Past compositions
            </h2>
            <p className="text-muted-foreground/60 text-xs font-light">
              Your archived fragrance history
            </p>
          </div>

          <div className="space-y-3">
            {pastCompositions.map((comp) => (
              <div
                key={comp.id}
                className="flex items-center justify-between border-b border-border/20 py-5 group"
              >
                <div className="space-y-1">
                  <h3 className="font-serif text-lg text-foreground group-hover:text-accent transition-colors duration-500">
                    {comp.name}
                  </h3>
                  <p className="text-muted-foreground/40 text-[10px] tracking-[0.15em] uppercase font-sans">
                    {comp.id} · {comp.mood} · {comp.date}
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-muted-foreground/40 text-[10px] tracking-[0.15em] uppercase font-sans">
                    {comp.status}
                  </span>
                  <button className="text-[10px] tracking-[0.15em] uppercase font-sans text-accent hover:text-foreground transition-colors duration-500">
                    View Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Account */}
        <div ref={ref4} className="reveal space-y-6">
          <h2 className="font-serif text-2xl text-foreground font-light">
            Account
          </h2>
          <div className="border-t border-border/20 pt-6 space-y-4">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground font-light">Email</span>
              <span className="text-sm text-foreground font-light">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground font-light">Addresses</span>
              <button className="text-[10px] tracking-[0.15em] uppercase font-sans text-muted-foreground/40 hover:text-foreground transition-colors duration-500">
                Manage
              </button>
            </div>
            <div className="pt-4">
              <button
                onClick={signOut}
                className="text-[10px] tracking-[0.15em] uppercase font-sans text-muted-foreground/40 hover:text-foreground transition-colors duration-500"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
