import type {
  AIImpactMetrics,
  AIRecommendation,
  AIRecyclerInfo,
  AIReport,
  AIScoreReason,
  AiPrompt,
  DisposalAction,
  Product,
  Recycler,
  ScoreBreakdown,
  WasteTypeId,
} from "@/types/domain";

import {
  DISPOSAL_COPY,
  DISPOSAL_GUIDES,
  ECO_FACTS,
  WASTE_TYPE_LABEL,
} from "@/lib/wasteMapping";

import { explainScore, getScoreInsights, scoreTier } from "@/lib/scoring";

import {
  findRecyclersForWasteType,
  formatDistanceKm,
  getBestRecycler,
  haversineDistanceKm,
} from "@/lib/recyclers";

/* -------------------------------------------------------------------------- */
/*                               AI QUICK ACTIONS                             */
/* -------------------------------------------------------------------------- */

export const AI_PROMPTS: AiPrompt[] = [
  {
    id: "advisor",
    label: "AI Sustainability Report",
    icon: "sparkles",
    accent: "teal",
    question: "Analyze this product",
  },
  {
    id: "alternatives",
    label: "Better Alternatives",
    icon: "leaf",
    accent: "lichen",
    question: "How can I make a greener choice?",
  },
  {
    id: "guidance",
    label: "Disposal Guide",
    icon: "recycle",
    accent: "clay",
    question: "How should I dispose of this?",
  },
  {
    id: "pickup",
    label: "Recycler Advice",
    icon: "coins",
    accent: "gold",
    question: "Where should I recycle this?",
  },
];

/* -------------------------------------------------------------------------- */

export interface AdvisorContext {
  product: Product;
  score: ScoreBreakdown;
  wasteType: WasteTypeId;
  disposalAction: DisposalAction;
  recyclers: Recycler[];
  userLocation: {
    latitude: number;
    longitude: number;
  } | null;
}

/* -------------------------------------------------------------------------- */

const IMPROVEMENT_TIPS: Record<WasteTypeId, AIRecommendation[]> = {
  plastic: [
    {
      title: "Next Purchase",
      description:
        "Choose products packaged in paper, glass or refill containers whenever possible.",
    },
    {
      title: "Today",
      description: "Clean and separate plastic before recycling.",
    },
  ],

  paper: [
    {
      title: "Today",
      description: "Keep paper dry and remove plastic wrapping.",
    },
    {
      title: "Next Purchase",
      description: "Prefer recycled paper products.",
    },
  ],

  metal: [
    {
      title: "Today",
      description: "Rinse cans before recycling.",
    },
    {
      title: "Next Purchase",
      description: "Choose reusable metal containers.",
    },
  ],

  glass: [
    {
      title: "Today",
      description: "Reuse jars and bottles before recycling.",
    },
    {
      title: "Next Purchase",
      description: "Choose returnable glass packaging when available.",
    },
  ],

  mixed: [
    {
      title: "Today",
      description: "Separate different materials whenever possible.",
    },
    {
      title: "Next Purchase",
      description: "Avoid multi-layer packaging and choose simpler materials.",
    },
  ],
};

const CIRCULAR_JOURNEY: Record<WasteTypeId, string[]> = {
  plastic: [
    "Used Product",
    "Plastic Collection",
    "Sorting Facility",
    "Recycling Plant",
    "New Plastic Product",
  ],

  paper: [
    "Used Paper",
    "Paper Collection",
    "Pulp Processing",
    "Paper Mill",
    "New Paper Product",
  ],

  metal: [
    "Used Metal",
    "Scrap Collection",
    "Metal Furnace",
    "Rolling Mill",
    "New Metal Product",
  ],

  glass: [
    "Glass Bottle",
    "Collection",
    "Glass Crusher",
    "Glass Furnace",
    "New Bottle",
  ],

  mixed: [
    "Used Packaging",
    "Sorting",
    "Partial Recovery",
    "Waste Processing",
    "Final Disposal",
  ],
};

function randomFact(type: WasteTypeId) {
  const facts = ECO_FACTS[type];

  return facts[Math.floor(Math.random() * facts.length)];
}

export async function generateAIReport(ctx: AdvisorContext): Promise<AIReport> {
  const { strengths, weaknesses } = getScoreInsights(ctx.score, ctx.product);
  const facts = ECO_FACTS[ctx.wasteType] || ["Recycling saves energy."];
  const fact = facts[Math.floor(Math.random() * facts.length)];
  const journey = CIRCULAR_JOURNEY[ctx.wasteType] || [
    "Used Product",
    "Collection",
    "Processing",
    "New Product",
  ];
  const tier = scoreTier(ctx.score.total);
  const recyclers = findRecyclersForWasteType(ctx.recyclers, ctx.wasteType);
  const nearest = recyclers.length > 0 ? recyclers[0] : undefined;

  const recommendations: AIRecommendation[] = [];

  // Packaging recommendation
  if (ctx.score.packagingPenalty > 5) {
    recommendations.push({
      title: "Reduce Packaging Waste",
      description:
        "Choose products with simpler single-material packaging that is easier to recycle.",
    });
  }

  // Eco labels
  if (ctx.score.labelBonus === 0) {
    recommendations.push({
      title: "Choose Certified Products",
      description:
        "Look for products carrying recognised sustainability certifications such as Organic or Fair Trade.",
    });
  }

  // Glass
  if (ctx.wasteType === "glass") {
    recommendations.push({
      title: "Reuse the Container",
      description:
        "Reuse the glass jar or bottle several times before recycling it.",
    });
  }

  // Plastic
  if (ctx.wasteType === "plastic") {
    recommendations.push({
      title: "Recycle Clean Plastic",
      description:
        "Rinse the packaging before recycling to improve material recovery.",
    });
  }

  // Paper
  if (ctx.wasteType === "paper") {
    recommendations.push({
      title: "Keep Paper Dry",
      description:
        "Ensure paper packaging is clean and dry before placing it in recycling.",
    });
  }

  // Metal
  if (ctx.wasteType === "metal") {
    recommendations.push({
      title: "Recycle Metal",
      description: "Metal can be recycled indefinitely without losing quality.",
    });
  }

  // Mixed
  if (ctx.wasteType === "mixed") {
    recommendations.push({
      title: "Avoid Mixed Packaging",
      description:
        "Choose products packaged using a single recyclable material whenever possible.",
    });
  }

  // Nearby recycler
  if (nearest) {
    recommendations.push({
      title: "Use Nearby Recycling Facility",
      description: `Recycle this product at ${nearest.name} for proper processing.`,
    });
  }

  let nearestRecycler: AIRecyclerInfo | undefined;
  if (nearest) {
    let distanceStr: string | undefined;
    if (ctx.userLocation) {
      const d = haversineDistanceKm(ctx.userLocation, nearest);
      distanceStr = formatDistanceKm(d);
    }
    nearestRecycler = {
      name: nearest.name,
      distance: distanceStr || "Unknown",
      pickupAvailable: nearest.hasTransportPartner,
    };
  }

  const isPlastic = ctx.wasteType === "plastic";
  const isMixed = ctx.wasteType === "mixed";

  const environmentalImpact: AIImpactMetrics = {
    landfillRisk: isMixed ? "High" : isPlastic ? "Medium" : "Low",
    recyclability: isMixed
      ? "Low"
      : tier.accent === "lichen"
        ? "High"
        : "Medium",
    carbonImpact:
      ctx.score.base < 40 ? "High" : ctx.score.base > 70 ? "Low" : "Moderate",
    reusePotential:
      ctx.wasteType === "glass" || ctx.wasteType === "metal"
        ? "High"
        : isPlastic
          ? "Moderate"
          : "Low",
  };

  const scoreReasons: AIScoreReason[] = [];
  if (ctx.score.base < 50) {
    scoreReasons.push({
      title: "Category Footprint",
      description: "This category tends to have a higher environmental impact.",
      impact: "negative",
    });
  } else if (ctx.score.base >= 70) {
    scoreReasons.push({
      title: "Good Material",
      description:
        "Product category has a generally lower environmental footprint.",
      impact: "positive",
    });
  }

  if (ctx.score.labelBonus > 0) {
    scoreReasons.push({
      title: "Eco Certifications",
      description: "Recognized sustainability certifications found.",
      impact: "positive",
      points: ctx.score.labelBonus,
    });
  }
  if (ctx.score.recyclerBonus > 0) {
    scoreReasons.push({
      title: "Local Recycling",
      description: "A nearby facility accepts this material.",
      impact: "positive",
      points: ctx.score.recyclerBonus,
    });
  }
  if (ctx.score.packagingPenalty > 0) {
    scoreReasons.push({
      title: "Packaging Complexity",
      description: "Difficult to recycle packaging materials.",
      impact: "negative",
      points: -ctx.score.packagingPenalty,
    });
  }

  const disposalGuide = DISPOSAL_GUIDES[ctx.wasteType];
  const disposalSteps = disposalGuide
    ? disposalGuide.steps
    : ["Dispose thoughtfully."];

  let summary = `${ctx.product.name} has a ${tier.label.toLowerCase()} sustainability score of ${ctx.score.total}/100. `;

  // Score-based explanation
  if (ctx.score.total >= 75) {
    summary +=
      "Its packaging and overall environmental profile are environmentally friendly when disposed of correctly. ";
  } else if (ctx.score.total >= 50) {
    summary +=
      "The product performs reasonably well but still has opportunities to reduce its environmental impact. ";
  } else {
    summary +=
      "This product has a relatively high environmental impact and should be used and disposed of responsibly. ";
  }

  // Waste-specific explanation
  switch (ctx.wasteType) {
    case "glass":
      summary +=
        "The glass packaging is highly recyclable and can also be reused multiple times before recycling.";
      break;

    case "plastic":
      summary +=
        "The plastic packaging should be emptied, cleaned, and recycled through an appropriate collection system whenever possible.";
      break;

    case "paper":
      summary +=
        "Paper packaging is widely recyclable provided it is clean and dry before disposal.";
      break;

    case "metal":
      summary +=
        "Metal packaging can be recycled repeatedly without losing quality, making it one of the most sustainable packaging materials.";
      break;

    case "mixed":
      summary +=
        "Mixed-material packaging is difficult to recycle because different materials must be separated before processing.";
      break;
  }

  // Mention eco-labels if present
  if (ctx.product.labels.length > 0) {
    summary += ` The product also includes sustainability labels such as ${ctx.product.labels.join(", ")}.`;
  }
  const report: AIReport = {
    summary,
    strengths: strengths.length
      ? strengths
      : ["No major sustainability strengths identified."],
    weaknesses: weaknesses.length
      ? weaknesses
      : ["No major sustainability concerns."],
    scoreReasons: scoreReasons.length
      ? scoreReasons
      : [
          {
            title: "Average Profile",
            description: "Standard environmental impact for this category.",
            impact: "neutral",
          },
        ],
    disposalSteps,
    recommendations,
    environmentalImpact,
    nearestRecycler,
    circularJourney: journey,
    interestingFact: fact,
    confidence: "High",
    reasoning: explainScore(ctx.score, ctx.product),
  };

  return report;
}

function buildGeminiInput(
  promptId: string,
  ctx: AdvisorContext,
  report?: AIReport,
): string {
  const recycler = getBestRecycler(
    ctx.recyclers,
    ctx.wasteType,
    ctx.userLocation,
  );

  switch (promptId) {
    case "advisor":
      return `Product: ${ctx.product.name}
Score: ${ctx.score.total}/100 (Base: ${ctx.score.base}, Labels: +${ctx.score.labelBonus}, Pkg Penalty: -${ctx.score.packagingPenalty})
Why did it receive this score? Mentions strengths and weaknesses. Max 100 words. Plain text.`;

    case "alternatives":
      return `Product: ${ctx.product.name} (Category: ${ctx.product.categories[0] || "Unknown"})
Current Labels: ${ctx.product.labels.join(", ") || "None"}.
How can the user make a greener purchasing decision? Focus on packaging and labels. Max 100 words.`;

    case "guidance":
      return `Product: ${ctx.product.name} (Pkg: ${ctx.product.packaging.join(", ")}).
Waste Type: ${WASTE_TYPE_LABEL[ctx.wasteType]}. Disposal: ${ctx.disposalAction}.
Nearest Recycler: ${recycler?.name ?? "None"}.
How should they dispose of this? Max 100 words.`;

    case "pickup":
      const distance =
        recycler && ctx.userLocation
          ? formatDistanceKm(haversineDistanceKm(ctx.userLocation, recycler))
          : "Unknown";

      return `Product: ${ctx.product.name}. Nearest Recycler: ${recycler?.name ?? "None"} (${distance}).
Pickup Support: ${recycler?.hasTransportPartner ? "Yes" : "No"}.
Where should they recycle this? Max 100 words.`;

    default:
      return `Product: ${ctx.product.name}. Answer user contextually. Max 60 words.`;
  }
}

export async function askAdvisor(
  promptId: string,
  ctx: AdvisorContext,
  report?: AIReport,
): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY?.trim();
  const model = (
    process.env.EXPO_PUBLIC_GEMINI_MODEL || "gemini-2.5-flash"
  ).trim();

  if (apiKey) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: buildGeminiInput(promptId, ctx, report) }],
              },
            ],
            generationConfig: {
              temperature: 0.35,
              topP: 0.9,
              maxOutputTokens: 250, // Optimize response tokens
            },
          }),
        },
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.log("STATUS:", res.status);
        console.log("ERROR:", errorText);
        throw new Error(`Gemini HTTP Error ${res.status}`);
      }

      const data = await res.json();
      const candidate = data.candidates?.[0];
      const finishReason = candidate?.finishReason;

      if (finishReason && finishReason !== "STOP") {
        console.warn("[aiAdvisor] Unusual FinishReason:", finishReason);
        if (finishReason === "MAX_TOKENS" || finishReason === "SAFETY") {
          throw new Error(`Gemini blocked by reason: ${finishReason}`);
        }
      }

      const text = candidate?.content?.parts
        ?.map((part: any) => part.text ?? "")
        .join("")
        .replace(/[\u200B-\u200D\uFEFF]/g, "")
        .trim();

      if (text) return text;
    } catch (e) {
      console.warn(
        "[aiAdvisor] Gemini generation failed, using local fallback. Error:",
        e,
      );
    }
  }

  // Fallback if Gemini is unavailable
  const recycler = getBestRecycler(
    ctx.recyclers,
    ctx.wasteType,
    ctx.userLocation,
  );

  switch (promptId) {
    case "advisor":
      return `${ctx.product.name} has a sustainability score of ${ctx.score.total}/100. ${
        ctx.score.total >= 70
          ? "Its environmental profile is relatively good."
          : ctx.score.total >= 50
            ? "It performs reasonably well but could be improved."
            : "Its environmental impact is higher than average."
      } ${
        ctx.score.packagingPenalty > 0
          ? "Packaging contributes to the lower score because it is harder to recycle."
          : ""
      } ${
        ctx.product.labels.length
          ? `Eco labels such as ${ctx.product.labels.join(", ")} improve its sustainability.`
          : ""
      }`;

    case "alternatives":
      return `To make a greener choice, look for products in the same category with recyclable packaging, recognised sustainability certifications, and minimal plastic use. Choosing refill packs or reusable containers can significantly reduce environmental impact.`;

    case "guidance":
      return `${ctx.product.name} is classified as ${
        WASTE_TYPE_LABEL[ctx.wasteType]
      }. ${DISPOSAL_COPY[ctx.disposalAction]} ${
        recycler
          ? `A nearby recycler (${recycler.name}) can process this material.`
          : "No nearby recycler is currently available."
      }`;

    case "pickup":
      if (recycler) {
        return `${recycler.name} accepts this material${
          recycler.hasTransportPartner
            ? " and also provides pickup support."
            : "."
        } ${
          ctx.userLocation
            ? "You can plan a drop-off during your next trip."
            : ""
        }`;
      }

      return "No suitable recycling centre was found nearby. Check your municipality's recycling collection schedule.";

    default:
      return "Based on the available product information, I couldn't generate a detailed recommendation.";
  }
}
