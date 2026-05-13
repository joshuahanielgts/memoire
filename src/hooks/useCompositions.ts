import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { CompositionRow, OrderRow } from "@/lib/compositions";

export const compositionsQueryKey = (userId?: string) => ["compositions", userId] as const;
export const orderSummaryQueryKey = (userId?: string) => ["orders-summary", userId] as const;

export const useCompositions = (userId?: string) =>
  useQuery({
    queryKey: compositionsQueryKey(userId),
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("compositions")
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as CompositionRow[];
    },
  });

export const useOrderSummary = (userId?: string) =>
  useQuery({
    queryKey: orderSummaryQueryKey(userId),
    enabled: Boolean(userId),
    queryFn: async () => {
      const [{ count, error: countError }, { data: recentOrder, error: recentError }] = await Promise.all([
        supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId!),
        supabase
          .from("orders")
          .select("*")
          .eq("user_id", userId!)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (countError) throw countError;
      if (recentError) throw recentError;

      return {
        orderCount: count ?? 0,
        recentOrder: (recentOrder ?? null) as OrderRow | null,
      };
    },
  });
