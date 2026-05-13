import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useReveal } from "@/hooks/useReveal";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompositions, useOrderSummary } from "@/hooks/useCompositions";
import { parseGeneratedResult } from "@/lib/compositions";
import BrandLogo from "@/components/BrandLogo";

const statusSteps = [
  "Draft",
  "Processing",
  "Complete",
];

const getStatusIndex = (status: string) => statusSteps.indexOf(status);

const formatStatusLabel = (status: string) => {
  if (status === "draft") return "Draft";
  if (status === "processing") return "Processing";
  if (status === "complete") return "Complete";
  return status;
};

const DashboardPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const reveal1 = useReveal(); 
  const reveal2 = useReveal();
  const reveal3 = useReveal();
  const reveal4 = useReveal();
  const { data: compositions = [], isLoading: compositionsLoading } = useCompositions(user?.id);
  const { data: orderSummary } = useOrderSummary(user?.id);

  const displayName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Guest";

  const compositionModels = compositions.map((composition) => {
    const generated = parseGeneratedResult(composition.generated_result);
    return {
      id: composition.id,
      name: generated?.name ?? "Untitled Composition",
      mood: generated?.mood_profile?.join(" · ") || "Custom Fragrance",
      status: formatStatusLabel(composition.status),
      notes: generated
        ? [...generated.top_notes, ...generated.heart_notes, ...generated.base_notes]
            .filter(Boolean)
            .slice(0, 3)
            .join(", ")
        : "Awaiting generated profile",
      date: composition.created_at?.slice(0, 10) ?? "",
      selectedFormat: composition.selected_format ?? "Not selected",
    };
  });

  const activeCompositions = compositionModels.filter((composition) => composition.status !== "Complete");
  const pastCompositions = compositionModels.filter((composition) => composition.status === "Complete");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-6 bg-background/90 backdrop-blur-md border-b border-border/20">
        <Link
          to="/"
          className="hover:opacity-90 transition-opacity duration-500"
        >
          <BrandLogo className="h-14 md:h-16 w-auto" />
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
        <div ref={reveal1.ref} className="reveal space-y-3">
          <p className="text-muted-foreground/40 text-[10px] tracking-[0.3em] uppercase font-sans">
            Your Private Atelier
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-foreground font-light leading-tight">
            Welcome back, {displayName}
          </h1>
          <p className="text-muted-foreground text-sm font-light max-w-lg">
            Track your fragrances, view scent reports, and follow your active orders. Total orders:{" "}
            {orderSummary?.orderCount ?? 0}
          </p>
        </div>

        {/* Active Compositions */}
        <div ref={reveal2.ref} className="reveal space-y-8">
          <div className="space-y-1">
            <h2 className="font-serif text-2xl text-foreground font-light">
              Currently in composition
            </h2>
            <p className="text-muted-foreground/60 text-xs font-light">
              Perfumes being prepared in your atelier
            </p>
          </div>

          <div className="space-y-4">
            {compositionsLoading && (
              <>
                <Skeleton className="h-36 w-full" />
                <Skeleton className="h-36 w-full" />
              </>
            )}
            {!compositionsLoading && activeCompositions.map((comp) => {
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
            {!compositionsLoading && activeCompositions.length === 0 && (
              <p className="text-muted-foreground/50 text-xs font-light">
                No active compositions yet.
              </p>
            )}
          </div>
        </div>

        {/* Past Compositions */}
        <div ref={reveal3.ref} className="reveal space-y-8">
          <div className="space-y-1">
            <h2 className="font-serif text-2xl text-foreground font-light">
              Past compositions
            </h2>
            <p className="text-muted-foreground/60 text-xs font-light">
              Your archived fragrance history
            </p>
          </div>

          <div className="space-y-3">
            {compositionsLoading && (
              <>
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </>
            )}
            {!compositionsLoading && pastCompositions.map((comp) => (
              <div
                key={comp.id}
                className="flex items-center justify-between border-b border-border/20 py-5 group"
              >
                <div className="space-y-1">
                  <h3 className="font-serif text-lg text-foreground group-hover:text-accent transition-colors duration-500">
                    {comp.name}
                  </h3>
                  <p className="text-muted-foreground/40 text-[10px] tracking-[0.15em] uppercase font-sans">
                    {comp.id} · {comp.selectedFormat} · {comp.date}
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-muted-foreground/40 text-[10px] tracking-[0.15em] uppercase font-sans">
                    {comp.status}
                  </span>
                  <button
                    onClick={() => navigate(`/create?resume=${comp.id}`)}
                    className="text-[10px] tracking-[0.15em] uppercase font-sans text-accent hover:text-foreground transition-colors duration-500"
                  >
                    View Report
                  </button>
                </div>
              </div>
            ))}
            {!compositionsLoading && pastCompositions.length === 0 && (
              <p className="text-muted-foreground/50 text-xs font-light">
                No completed compositions yet.
              </p>
            )}
          </div>
        </div>

        {/* Account */}
        <div ref={reveal4.ref} className="reveal space-y-6">
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
