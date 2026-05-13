import { useState, useCallback, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import StepInput from "@/components/create/StepInput";
import StepRefinement from "@/components/create/StepRefinement";
import StepProcessing from "@/components/create/StepProcessing";
import StepResults from "@/components/create/StepResults";
import StepDetail from "@/components/create/StepDetail";
import StepPurchase from "@/components/create/StepPurchase";
import BrandLogo from "@/components/BrandLogo";
import {
  parseGeneratedResult,
  toCompositionCardModel,
  type CompositionRefinements,
  type GeneratedFragranceResult,
} from "@/lib/compositions";
import {
  useCreateDraftComposition,
  useCreateOrder,
  useGenerateFragrance,
} from "@/hooks/useCompositionActions";

export interface ScentComposition {
  id: string;
  name: string;
  tagline: string;
  notes: { top: string; heart: string; base: string };
  longevity: string;
  projection: string;
  season: string;
  character: string;
  selectedFormat?: string | null;
}

const CreatePage = () => {
  const [step, setStep] = useState(1);
  const [description, setDescription] = useState("");
  const [mood, setMood] = useState("");
  const [environment, setEnvironment] = useState<string[]>([]);
  const [intensity, setIntensity] = useState(50);
  const [selected, setSelected] = useState<ScentComposition | null>(null);
  const [compositions, setCompositions] = useState<ScentComposition[]>([]);
  const [processingReady, setProcessingReady] = useState(false);
  const [compositionId, setCompositionId] = useState<string | null>(null);
  const [resumeHydrated, setResumeHydrated] = useState(false);
  const [orderConfirmation, setOrderConfirmation] = useState<{
    orderId: string;
    status: string;
    priceCents: number;
  } | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const createDraftMutation = useCreateDraftComposition();
  const generateFragranceMutation = useGenerateFragrance();
  const createOrderMutation = useCreateOrder(user?.id);

  const resumeParam = searchParams.get("resume");
  const shouldResumeCheckout = searchParams.get("checkout") === "1" || resumeParam === "checkout";
  const resumeCompositionId = resumeParam && resumeParam !== "checkout" ? resumeParam : null;

  const resumeCompositionQuery = useQuery({
    queryKey: ["composition-resume", user?.id, resumeCompositionId],
    enabled: Boolean(user?.id && resumeCompositionId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("compositions")
        .select("id, generated_result, selected_format")
        .eq("id", resumeCompositionId!)
        .eq("user_id", user!.id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  if (resumeCompositionQuery.error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-lg font-medium">Unable to load your composition.</p>
        <p className="text-sm opacity-60">{String(resumeCompositionQuery.error.message || resumeCompositionQuery.error)}</p>
        <button
          onClick={() => navigate("/create")}
          className="mt-4 px-6 py-2 bg-foreground text-background rounded-full text-sm"
        >
          Start a new composition
        </button>
      </div>
    );
  }

  const next = useCallback(() => setStep((s) => s + 1), []);

  const handleSelect = (comp: ScentComposition) => {
    setSelected(comp);
    setStep(5);
  };

  const startComposition = useCallback(async () => {
    if (!user) {
      toast.error("Please sign in to generate your fragrance concept.");
      navigate("/auth?returnTo=/create");
      return;
    }

    const refinements: CompositionRefinements = {
      mood,
      environment,
      intensity,
    };

    try {
      setOrderConfirmation(null);
      const newCompositionId = await createDraftMutation.mutateAsync({
        userId: user.id,
        memoryInput: description,
        refinements,
      });

      setCompositionId(newCompositionId);
      setProcessingReady(false);
      setStep(3);
      await generateFragranceMutation.mutateAsync(newCompositionId);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to create composition";
      toast.error(message, {
        action: {
          label: "Retry",
          onClick: () => {
            void startComposition();
          },
        },
      });
      setStep(2);
    }
  }, [
    user,
    mood,
    environment,
    intensity,
    description,
    createDraftMutation,
    generateFragranceMutation,
    navigate,
  ]);

  const handleCompleteOrder = useCallback(
    async (format: string) => {
      if (!compositionId) {
        toast.error("No composition selected for ordering.");
        return null;
      }

      try {
        const response = await createOrderMutation.mutateAsync({
          compositionId,
          format,
        });
        setOrderConfirmation({
          orderId: response.order_id,
          status: response.status,
          priceCents: response.price_cents,
        });
        toast.success("Order placement registered.");
        return response;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to complete order";
        toast.error(message);
        return null;
      }
    },
    [compositionId, createOrderMutation],
  );

  // Auth gate: when moving to step 6 (purchase), check if logged in
  const handleProceedToCheckout = useCallback(() => {
    if (!user) {
      const returnTo = compositionId
        ? `/create?resume=${compositionId}&checkout=1`
        : "/create?resume=checkout";
      navigate(`/auth?returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }
    setStep(6);
  }, [user, navigate, compositionId]);

  useEffect(() => {
    if (generateFragranceMutation.isError) {
      const message =
        generateFragranceMutation.error instanceof Error
          ? generateFragranceMutation.error.message
          : "Fragrance generation failed. Please retry.";
      toast.error(message);
      setStep(2);
    }
  }, [generateFragranceMutation.isError, generateFragranceMutation.error]);

  useEffect(() => {
    if (!generateFragranceMutation.data || !compositionId) return;

    const generated = generateFragranceMutation.data as GeneratedFragranceResult;
    const model = toCompositionCardModel(compositionId, generated);
    setCompositions([model]);
    setSelected(model);
  }, [generateFragranceMutation.data, compositionId]);

  useEffect(() => {
    if (processingReady && generateFragranceMutation.isSuccess) {
      setStep(4);
    }
  }, [processingReady, generateFragranceMutation.isSuccess]);

  useEffect(() => {
    if (!resumeCompositionQuery.data || resumeHydrated) return;
    const generated = parseGeneratedResult(resumeCompositionQuery.data.generated_result);
    if (!generated) return;

    const model = toCompositionCardModel(resumeCompositionQuery.data.id, generated);
    model.selectedFormat = resumeCompositionQuery.data.selected_format;
    setCompositionId(resumeCompositionQuery.data.id);
    setCompositions([model]);
    setSelected(model);
    setResumeHydrated(true);
    setStep(shouldResumeCheckout ? 6 : 5);
  }, [resumeCompositionQuery.data, shouldResumeCheckout, resumeHydrated]);

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-6">
        <Link to="/" className="hover:opacity-90 transition-opacity duration-300">
          <BrandLogo className="h-14 md:h-16 w-auto" />
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
          onNext={() => {
            void startComposition();
          }}
        />
      )}
      {step === 3 && (
        <StepProcessing
          onComplete={() => {
            setProcessingReady(true);
          }}
        />
      )}
      {step === 4 && <StepResults compositions={compositions} onSelect={handleSelect} />}
      {step === 5 && selected && <StepDetail composition={selected} onNext={handleProceedToCheckout} />}
      {step === 6 && selected && (
        <StepPurchase
          composition={selected}
          onCompleteOrder={async (format) => {
            return await handleCompleteOrder(format);
          }}
          isSubmittingOrder={createOrderMutation.isPending}
          orderConfirmation={orderConfirmation}
        />
      )}
    </div>
  );
};

export default CreatePage;
