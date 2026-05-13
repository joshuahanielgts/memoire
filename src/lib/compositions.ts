import type { Json, Tables } from "@/integrations/supabase/types";

export type CompositionRow = Tables<"compositions">;
export type OrderRow = Tables<"orders">;

export interface GeneratedFragranceResult {
  name: string;
  tagline: string;
  story?: string;
  top_notes: string[];
  heart_notes: string[];
  base_notes: string[];
  accords?: string[];
  intensity: "light" | "moderate" | "strong" | "intense";
  season: "spring" | "summer" | "autumn" | "winter" | "year-round";
  occasion?: "daily" | "evening" | "special" | "intimate";
  mood_profile?: string[];
}

export interface CompositionRefinements {
  mood: string;
  environment: string[];
  intensity: number;
}

export interface CompositionCardModel {
  id: string;
  name: string;
  tagline: string;
  notes: { top: string; heart: string; base: string };
  longevity: string;
  projection: string;
  season: string;
  character: string;
}

const asStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
};

export const parseGeneratedResult = (value: Json | null): GeneratedFragranceResult | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;

  if (
    typeof record.name !== "string" ||
    typeof record.tagline !== "string" ||
    typeof record.intensity !== "string" ||
    typeof record.season !== "string"
  ) {
    return null;
  }

  return {
    name: record.name,
    tagline: record.tagline,
    story: typeof record.story === "string" ? record.story : undefined,
    top_notes: asStringArray(record.top_notes),
    heart_notes: asStringArray(record.heart_notes),
    base_notes: asStringArray(record.base_notes),
    accords: asStringArray(record.accords),
    intensity: record.intensity as GeneratedFragranceResult["intensity"],
    season: record.season as GeneratedFragranceResult["season"],
    occasion:
      typeof record.occasion === "string"
        ? (record.occasion as GeneratedFragranceResult["occasion"])
        : undefined,
    mood_profile: asStringArray(record.mood_profile),
  };
};

const formatIntensity = (intensity: GeneratedFragranceResult["intensity"]) => {
  switch (intensity) {
    case "light":
      return { longevity: "4-6 hours", projection: "Intimate", character: "Airy & Delicate" };
    case "moderate":
      return { longevity: "6-8 hours", projection: "Moderate", character: "Balanced & Refined" };
    case "strong":
      return { longevity: "8-10 hours", projection: "Strong", character: "Bold & Magnetic" };
    case "intense":
      return { longevity: "10-12 hours", projection: "Powerful", character: "Deep & Dramatic" };
    default:
      return { longevity: "6-8 hours", projection: "Moderate", character: "Elegant & Understated" };
  }
};

const formatSeason = (season: GeneratedFragranceResult["season"]) => {
  if (season === "year-round") return "All seasons";
  return season.charAt(0).toUpperCase() + season.slice(1);
};

export const toCompositionCardModel = (
  compositionId: string,
  generated: GeneratedFragranceResult,
): CompositionCardModel => {
  const profile = formatIntensity(generated.intensity);
  const fallbackCharacter = generated.mood_profile?.slice(0, 2).join(" & ");

  return {
    id: compositionId,
    name: generated.name,
    tagline: generated.tagline,
    notes: {
      top: generated.top_notes.join(", "),
      heart: generated.heart_notes.join(", "),
      base: generated.base_notes.join(", "),
    },
    longevity: profile.longevity,
    projection: profile.projection,
    season: formatSeason(generated.season),
    character: fallbackCharacter || profile.character,
  };
};
