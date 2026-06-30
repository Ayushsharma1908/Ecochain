// Shared domain types for EcoChain Link.

export type WasteTypeId = "plastic" | "paper" | "metal" | "glass" | "mixed";

export type DisposalAction =
  | "recycle"
  | "resell"
  | "donate"
  | "reuse"
  | "dispose";

export interface ScoreBreakdown {
  base: number;
  labelBonus: number;
  packagingPenalty: number;
  recyclerBonus: number;
  total: number;
}

export interface Product {
  barcode: string;
  name: string;
  brand?: string;
  categories: string[];
  labels: string[];
  packaging: string[];
  imageUrl?: string;
  source: "open-food-facts" | "fallback";
}

export interface SustainabilityProfile {
  product: Product;
  score: ScoreBreakdown;
  wasteType: WasteTypeId;
  disposalAction: DisposalAction;
  explanation: string;
  alternativesHint: string;
}

export interface Recycler {
  id: string;
  name: string;
  kind: "recycler" | "collection-point" | "donation" | "resale";
  acceptedWaste: WasteTypeId[];
  address: string;
  latitude: number;
  longitude: number;
  hasTransportPartner: boolean;
  notes?: string;
}

export interface ScanRecord {
  id: string;
  barcode: string;
  productName: string;
  brand?: string;
  scoreTotal: number;
  wasteType: WasteTypeId;
  disposalAction: DisposalAction;
  scannedAt: string;
  estimatedKgCo2: number;
  recyclable: boolean;
}

/* ------------------------- Existing AI Prompt ------------------------- */

export interface AiPrompt {
  id: string;
  label: string;
  icon: "sparkles" | "leaf" | "recycle" | "coins";
  accent: "teal" | "lichen" | "clay" | "gold";
  question: string;
}

/* =======================================================================
   NEW AI REPORT TYPES
   ======================================================================= */

export type AIConfidence = "High" | "Medium" | "Low";

export interface AIScoreReason {
  title: string;
  description: string;
  impact: "positive" | "negative" | "neutral";
  points?: number;
}

export interface AIRecommendation {
  title: string;
  description: string;
}

export interface AIImpactMetrics {
  recyclability: string;
  landfillRisk: string;
  reusePotential: string;
  carbonImpact: string;
}

export interface AIRecyclerInfo {
  name: string;
  distance?: string;
  pickupAvailable: boolean;
}

export interface AIReport {
  summary: string;

  strengths: string[];

  weaknesses: string[];

  scoreReasons: AIScoreReason[];

  disposalSteps: string[];

  recommendations: AIRecommendation[];

  environmentalImpact: AIImpactMetrics;

  nearestRecycler?: AIRecyclerInfo;

  circularJourney: string[];

  interestingFact: string;

  confidence: AIConfidence;

  reasoning: string;
}
