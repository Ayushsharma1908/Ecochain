import type {
  AIConfidence,
  AIImpactMetrics,
  AIRecommendation,
  AIRecyclerInfo,
  AIReport,
  AiPrompt,
  AIScoreReason,
  DisposalAction,
  Product,
  Recycler,
  ScoreBreakdown,
  WasteTypeId,
} from "@/types/domain";
import { DISPOSAL_COPY, WASTE_TYPE_LABEL } from "@/lib/wasteMapping";
import { explainScore, scoreTier } from "@/lib/scoring";
import {
  findRecyclersForWasteType,
  formatDistanceKm,
  haversineDistanceKm,
} from "@/lib/recyclers";

/**
 * AI Recommendation Layer
 * ------------------------
 * Refactored to generate a comprehensive AI Sustainability Report on first load,
 * replacing the old one-off chat approach.
 */

export const AI_PROMPTS: AiPrompt[] = [
  {
    id: "improve",
    label: "Improve Score",
    icon: "sparkles",
    accent: "teal",
    question: "How can I find a product with a better score?",
  },
  {
    id: "alternatives",
    label: "Better Alternatives",
    icon: "leaf",
    accent: "lichen",
    question: "Show greener products in the same category.",
  },
  {
    id: "recycler",
    label: "Nearest Recycler",
    icon: "recycle",
    accent: "clay",
    question: "Where is the nearest recycler for this?",
  },
  {
    id: "facts",
    label: "Environmental Facts",
    icon: "coins",
    accent: "gold",
    question: "What are some interesting environmental facts about this waste?",
  },
];

export interface AdvisorContext {
  product: Product;
  score: ScoreBreakdown;
  wasteType: WasteTypeId;
  disposalAction: DisposalAction;
  recyclers: Recycler[];
  userLocation: { latitude: number; longitude: number } | null;
}

// Fallback logic for when there is no Gemini API key, just to ensure it gracefully works offline/without key
function localGenerateReport(ctx: AdvisorContext): AIReport {
  const typeLabel = WASTE_TYPE_LABEL[ctx.wasteType];
  const copy = DISPOSAL_COPY[ctx.disposalAction];
  const matches = findRecyclersForWasteType(ctx.recyclers, ctx.wasteType);
  const nearest = matches[0];
  const distance =
    ctx.userLocation && nearest
      ? haversineDistanceKm(ctx.userLocation, nearest)
      : null;

  return {
    summary: `Your product is largely ${ctx.wasteType.toLowerCase()} waste. ${explainScore(
      ctx.score,
      ctx.product
    )}`,
    strengths: [
      ctx.score.labelBonus > 0 ? "Has positive eco-labels" : "Local product",
      ctx.score.recyclerBonus > 0 ? "Local recycling available" : "Common packaging",
    ],
    weaknesses: [
      ctx.score.packagingPenalty > 5 ? "Mixed or difficult packaging" : "Could be optimized",
      "Impacts local waste streams",
    ],
    scoreReasons: [
      {
        title: "Base Material",
        description: `Base score out of 70 based on material type`,
        impact: ctx.score.base > 40 ? "positive" : "negative",
        points: ctx.score.base,
      },
      {
        title: "Packaging Subtracted",
        description: `Deduction for non-ideal packaging layers`,
        impact: "negative",
        points: -ctx.score.packagingPenalty,
      },
      {
        title: "Eco Labels Addition",
        description: `Bonus for certified eco-labels`,
        impact: "positive",
        points: ctx.score.labelBonus,
      },
    ],
    disposalSteps: [
      `Identify the ${typeLabel.toLowerCase()} parts.`,
      `Empty and rinse the container completely.`,
      `Separate any different material components if possible.`,
      nearest ? `Take it to ${nearest.name}.` : `Place in your standard ${ctx.disposalAction} bin.`,
    ],
    recommendations: [
      {
        title: "Immediate Action",
        description: copy,
      },
      {
        title: "Next Purchase",
        description:
          "Look for similar items with simpler, single-material packaging or certified organic labels.",
      },
    ],
    environmentalImpact: {
      recyclability: ctx.score.total > 70 ? "High" : ctx.score.total > 40 ? "Medium" : "Low",
      landfillRisk: ctx.wasteType === "plastic" || ctx.wasteType === "mixed" ? "High" : "Low",
      reusePotential: ctx.wasteType === "glass" ? "High" : "Low",
      carbonImpact: ctx.score.total > 60 ? "Low" : "Medium",
    },
    circularJourney: [
      "Materials Sourced",
      "Manufactured into Product",
      "Purchased at Retailer",
      "Consumed by You",
      nearest ? `Recycled at ${nearest.name}` : "Disposed into municipal waste",
      nearest ? "Processed into raw materials" : "Sent to landfill",
    ],
    nearestRecycler: nearest
      ? {
          name: nearest.name,
          distance: distance ? formatDistanceKm(distance) : undefined,
          pickupAvailable: nearest.hasTransportPartner,
        }
      : undefined,
    interestingFact:
      "Recycling single-material packaging helps significantly in creating high-quality recycled material streams.",
    confidence: "Medium",
    reasoning: "Generated automatically from offline product metadata safely.",
  };
}

function buildGeminiReportInput(ctx: AdvisorContext): string {
  const nearest = findRecyclersForWasteType(ctx.recyclers, ctx.wasteType)
    .slice(0, 3)
    .map((r) => `${r.name} (${r.hasTransportPartner ? "Pickup Available" : "Drop-off Only"})`)
    .join(", ");

  return [
    'You are EcoChain Link, an expert sustainability and recycling AI assistant.',
    'You analyzing a specific packaged product and need to generate a "Sustainability Analysis" report.',
    'Your goal is to provide insightful, accurate, and highly practical report data in a structured format.',
    'Base your advice firmly on the provided product details, score, and nearby recyclers.',
    'You must respond ONLY with a strictly valid JSON object that matches the requested schema.',
    `---`,
    `Product Name: ${ctx.product.name}`,
    `Brand: ${ctx.product.brand ?? "unknown"}`,
    `Categories: ${ctx.product.categories.length ? ctx.product.categories.join(", ") : "N/A"}`,
    `Packaging Materials: ${ctx.product.packaging.length ? ctx.product.packaging.join(", ") : "unknown"}`,
    `Eco-labels: ${ctx.product.labels.length ? ctx.product.labels.join(", ") : "None"}`,
    `Waste Classification: ${WASTE_TYPE_LABEL[ctx.wasteType]}`,
    `Recommended Physical Action: ${ctx.disposalAction}`,
    `Sustainability Score: ${ctx.score.total}/100 (Base: ${ctx.score.base}, Label Bonus: +${ctx.score.labelBonus}, Packaging Penalty: -${ctx.score.packagingPenalty}, Recycler Bonus: +${ctx.score.recyclerBonus})`,
    `Nearby Recycling Centers: ${nearest || "None currently registered in system"}`,
    `---`,
    `The response must follow this EXACT JSON structure without any additional text or markdown formatting:`,
    `{
      "summary": "A friendly 1-2 sentence overview of the product's environmental profile",
      "strengths": ["string: 2-3 positive environmental traits"],
      "weaknesses": ["string: 1-3 negative environmental traits"],
      "scoreReasons": [
        {
          "title": "string: e.g. 'Mixed plastic packaging'",
          "description": "string: short explanation",
          "impact": "positive or negative or neutral"
        }
      ],
      "disposalSteps": ["string: step-by-step practical guide on how to dispose of this specifically (e.g. 1. Remove cap. 2. Wash bottle.)"],
      "recommendations": [
        {
          "title": "string: e.g. Immediate, Next Purchase, Long Term, Community",
          "description": "string: actionable advice"
        }
      ],
      "environmentalImpact": {
        "recyclability": "string: e.g. 89% or High",
        "landfillRisk": "string: High, Medium, or Low",
        "reusePotential": "string: High, Medium, or Low",
        "carbonImpact": "string: High, Medium, or Low"
      },
      "circularJourney": ["string: 5-6 steps showing the lifecycle of this product from Factory -> You -> Nearby Recycler -> New Product"],
      "nearestRecycler": {
        "name": "string: name of recycler based on context, or null if none",
        "distance": "string: distance if available or null",
        "pickupAvailable": boolean
      },
      "interestingFact": "string: One cool, memorable fact about recycling this specific material",
      "confidence": "High, Medium, or Low",
      "reasoning": "string: 1 sentence explaining why AI gave this analysis"
    }`
  ].join("\n");
}

export async function generateAIReport(ctx: AdvisorContext): Promise<AIReport> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY?.trim();
  const model = (process.env.EXPO_PUBLIC_GEMINI_MODEL || "gemini-2.5-flash").trim();

  if (!apiKey) {
    console.warn("[aiAdvisor] No EXPO_PUBLIC_GEMINI_API_KEY set — using local advisor.");
    return localGenerateReport(ctx);
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: buildGeminiReportInput(ctx) }] }],
          generationConfig: {
            temperature: 0.3,
            response_mime_type: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      console.warn(`[aiAdvisor] Gemini API error ${response.status}`);
      return localGenerateReport(ctx);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (text) {
      try {
        const parsed: AIReport = JSON.parse(text);
        // Do some light validation just to ensure basic shape ok
        if (parsed.summary && parsed.disposalSteps) {
          return parsed;
        }
      } catch (e) {
        console.warn("[aiAdvisor] Failed to parse JSON from AI", e);
      }
    }
  } catch (err) {
    console.warn("[aiAdvisor] Request failed", err);
  }

  return localGenerateReport(ctx);
}

// Keep a lightweight fallback for follow up questions
function localFollowUp(promptId: AiPrompt["id"], ctx: AdvisorContext): string {
  if (promptId === "improve") return "Choose products with single-material packaging like paper, aluminum, or glass.";
  if (promptId === "alternatives") return "Look for items with similar barcodes but organic or fair trade eco-labels.";
  if (promptId === "recycler") {
    const nearest = findRecyclersForWasteType(ctx.recyclers, ctx.wasteType)[0];
    return nearest ? `${nearest.name} accepts this.` : "Check municipal recycling schedules.";
  }
  return "Recycling is highly dependent on local facility capabilities.";
}

export async function askAdvisor(promptId: AiPrompt["id"], ctx: AdvisorContext, reportCtx?: AIReport): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY?.trim();
  const model = (process.env.EXPO_PUBLIC_GEMINI_MODEL || "gemini-2.5-flash").trim();

  if (!apiKey) return localFollowUp(promptId, ctx);

  const prompt = AI_PROMPTS.find(p => p.id === promptId);
  const userQ = prompt?.question || promptId;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ 
            role: "user", 
            parts: [{ 
              text: `You are an AI Sustainability Assistant. The user asked a follow up question: "${userQ}". 
The product they are asking about is ${ctx.product.name} (Material: ${WASTE_TYPE_LABEL[ctx.wasteType]}, Score: ${ctx.score.total}/100).\n
Already reported to user: ${reportCtx ? JSON.stringify({
                summary: reportCtx.summary,
                strengths: reportCtx.strengths,
                weaknesses: reportCtx.weaknesses
              }) : ""}\n
Provide a very short, friendly answer (1-3 sentences).` 
            }] 
          }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 250 },
        }),
      }
    );

    if (!response.ok) return localFollowUp(promptId, ctx);
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("").trim();
    return text || localFollowUp(promptId, ctx);
  } catch (e) {
    return localFollowUp(promptId, ctx);
  }
}
