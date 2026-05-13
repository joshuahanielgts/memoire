import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { CompositionRefinements, GeneratedFragranceResult } from "@/lib/compositions";
import { compositionsQueryKey } from "@/hooks/useCompositions";

interface CreateDraftInput {
  userId: string;
  memoryInput: string;
  refinements: CompositionRefinements;
}

interface CreateOrderInput {
  compositionId: string;
  format: string;
}

interface CreateOrderResponse {
  order_id: string;
  status: string;
  price_cents: number;
}

export const useCreateDraftComposition = () =>
  useMutation({
    mutationFn: async ({ userId, memoryInput, refinements }: CreateDraftInput) => {
      const { data, error } = await supabase
        .from("compositions")
        .insert({
          user_id: userId,
          status: "draft",
          memory_input: memoryInput,
          refinements,
        })
        .select("id")
        .single();

      if (error || !data?.id) {
        throw error ?? new Error("Failed to create composition");
      }

      return data.id;
    },
  });

export const useGenerateFragrance = () =>
  useMutation({
    mutationFn: async (compositionId: string) => {
      const { data, error } = await supabase.functions.invoke<GeneratedFragranceResult>("generate-fragrance", {
        body: { composition_id: compositionId },
      });

      if (error || !data) {
        throw error ?? new Error("Failed to generate fragrance");
      }

      return data;
    },
  });

export const useCreateOrder = (userId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ compositionId, format }: CreateOrderInput) => {
      const { data, error } = await supabase.functions.invoke<CreateOrderResponse>("create-order", {
        body: { composition_id: compositionId, format },
      });

      if (error || !data) {
        throw error ?? new Error("Failed to create order");
      }

      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: compositionsQueryKey(userId),
      });
    },
  });
};
