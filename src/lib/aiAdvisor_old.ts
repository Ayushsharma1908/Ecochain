import type { AiPrompt, DisposalAction, Product, Recycler, ScoreBreakdown, WasteTypeId } from '@/types/domain';
import { DISPOSAL_COPY, WASTE_TYPE_LABEL } from '@/lib/wasteMapping';
import { explainScore, scoreTier } from '@/lib/scoring';
import { findRecyclersForWasteType, formatDistanceKm, haversineDistanceKm } from '@/lib/recyclers';

/**
 * AI Recommendation Layer
 * ------------------------
 * The concept doc is explicit that this layer should "support explanation
 * and decision assistance instead of pretending to know exact hidden
 * supply-chain truth." The four use cases below are answered with a
 * deterministic, on-device layer over the data we actually have —
 * product metadata, the scoring breakdown, and seeded recycler data.
 *
 * Add EXPO_PUBLIC_GEMINI_API_KEY to .env to use Gemini. Without it, the app
 * falls back to the deterministic on-device advisor below.
 */

export const AI_PROMPTS: AiPrompt[] = [
  {
    id: 'advisor',
    label: 'Sustainability advisor',
    icon: 'sparkles',
    accent: 'teal',
    question: "Why is this product's score low?",
  },
  {
    id: 'alternatives',
    label: 'Alternative finder',
    icon: 'leaf',
    accent: 'lichen',
    question: 'Show greener products in the same category.',
  },
  {
    id: 'guidance',
    label: 'Waste guidance',
    icon: 'recycle',
    accent: 'clay',
    question: 'What should be done with this packaging?',
  },
  {
    id: 'pickup',
    label: 'Pickup & value prediction',
    icon: 'coins',
    accent: 'gold',
    question: "When should this be collected, and what's it worth?",
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

function adviseOnScore(ctx: AdvisorContext): string {
  return explainScore(ctx.score, ctx.product);
}

function suggestAlternatives(ctx: AdvisorContext): string {
  const tier = scoreTier(ctx.score.total);
  const category = ctx.product.categories[0] ?? 'this category';
  if (tier.accent === 'lichen') {
    return `${ctx.product.name} is already a strong choice for ${category}. Look for similar items with organic or fair-trade labels to push the score even higher.`;
  }
  return `Within ${category}, prioritize products with simpler, single-material packaging (paper or glass over mixed film) and organic or fair-trade labels — both lift the score noticeably more than brand alone.`;
}

function adviseOnWaste(ctx: AdvisorContext): string {
  const typeLabel = WASTE_TYPE_LABEL[ctx.wasteType];
  const copy = DISPOSAL_COPY[ctx.disposalAction];
  const matches = findRecyclersForWasteType(ctx.recyclers, ctx.wasteType);
  const nearest = matches[0];
  if (!nearest) {
    return `This is ${typeLabel.toLowerCase()} waste. ${copy} No seeded recycler nearby accepts this stream yet — check your municipal collection schedule.`;
  }
  const distance = ctx.userLocation ? haversineDistanceKm(ctx.userLocation, nearest) : null;
  const distanceCopy = distance !== null ? ` (${formatDistanceKm(distance)} away)` : '';
  return `This is ${typeLabel.toLowerCase()} waste. ${copy} ${nearest.name}${distanceCopy} accepts this stream.`;
}

function predictPickupAndValue(ctx: AdvisorContext): string {
  const matches = findRecyclersForWasteType(ctx.recyclers, ctx.wasteType);
  const withTransport = matches.find((r) => r.hasTransportPartner);
  const valuePerKg: Record<WasteTypeId, number> = { metal: 0.85, glass: 0.05, paper: 0.08, plastic: 0.12, mixed: 0.0 };
  const value = valuePerKg[ctx.wasteType];

  const valueCopy =
    value > 0
      ? `Roughly $${value.toFixed(2)}/kg at current scrap rates for ${WASTE_TYPE_LABEL[ctx.wasteType].toLowerCase()}.`
      : `Mixed material like this usually has no resale value — the win here is keeping it out of landfill, not the payout.`;

  if (withTransport) {
    return `${withTransport.name} runs transport pickups for this stream — batch a few items together and request a pickup rather than single trips. ${valueCopy}`;
  }
  return `No transport partner seeded near you for this stream yet — plan a drop-off on your next errand run. ${valueCopy}`;
}

function localAdvisor(promptId: AiPrompt['id'], ctx: AdvisorContext): string {
  switch (promptId) {
    case 'advisor':
      return adviseOnScore(ctx);
    case 'alternatives':
      return suggestAlternatives(ctx);
    case 'guidance':
      return adviseOnWaste(ctx);
    case 'pickup':
      return predictPickupAndValue(ctx);
    default:
      return "I don't have enough context for that yet — try scanning a product first.";
  }
}

function buildGeminiInput(promptId: AiPrompt['id'], ctx: AdvisorContext): string {
  const prompt = AI_PROMPTS.find((item) => item.id === promptId);
  const nearest = findRecyclersForWasteType(ctx.recyclers, ctx.wasteType)
    .slice(0, 3)
    .map((recycler) => recycler.name)
    .join(', ');

  return [
    'You are EcoChain Link, an expert sustainability and recycling advisor analyzing a specific packaged product.',
    'Your goal is to provide insightful, accurate, and highly practical advice in a friendly, conversational tone.',
    'Keep your response well-structured and easy to read (max 3-5 sentences). Formatting constraints: NO bold, NO italic, NO markdown, use simple plain text.',
    'Base your advice firmly on the provided product details, score, and nearby recyclers.',
    'Do not hallucinate facts or pretend to know exact hidden supply-chain truth. Be direct and avoid generic fluff.',
    `User question to address: "${prompt?.question ?? promptId}"`,
    `---`,
    `Product Details: ${ctx.product.name} (Brand: ${ctx.product.brand ?? 'unknown'})`,
    `Categories: ${ctx.product.categories.join(', ') || 'N/A'}`,
    `Packaging: ${ctx.product.packaging.join(', ') || 'unknown'}`,
    `Waste Classification: ${WASTE_TYPE_LABEL[ctx.wasteType]}`,
    `Recommended Action: ${ctx.disposalAction}`,
    `Sustainability Score: ${ctx.score.total}/100 (Base: ${ctx.score.base}, Label Bonus: +${ctx.score.labelBonus}, Packaging Penalty: -${ctx.score.packagingPenalty}, Recycler Bonus: +${ctx.score.recyclerBonus})`,
    `Nearby Recycling Centers: ${nearest || 'None currently registered in system'}`,
    `---`,
    `Answer the user question directly and concisely:`
  ].join('\n');
}

async function askGemini(promptId: AiPrompt['id'], ctx: AdvisorContext): Promise<string | null> {
  // Trim to strip any trailing \r from Windows CRLF line endings in .env
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY?.trim();
  const model = (process.env.EXPO_PUBLIC_GEMINI_MODEL || 'gemini-2.5-flash').trim();
  if (!apiKey) {
    console.warn('[aiAdvisor] No EXPO_PUBLIC_GEMINI_API_KEY set — using local advisor.');
    return null;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: buildGeminiInput(promptId, ctx) }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 300 },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text().catch(() => 'unknown');
      console.warn(`[aiAdvisor] Gemini API error ${response.status}: ${errText}`);
      return null;
    }

    const data = (await response.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[];
      error?: { message?: string };
    };

    if (data.error) {
      console.warn('[aiAdvisor] Gemini returned error:', data.error.message);
      return null;
    }

    // Filter out empty/thought parts — thinking models include reasoning parts with no text
    const text = data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? '')
      .filter(Boolean)
      .join('')
      .trim();

    return text || null;
  } catch (err) {
    console.warn('[aiAdvisor] Gemini fetch failed:', err);
    return null;
  }
}

export async function askAdvisor(promptId: AiPrompt['id'], ctx: AdvisorContext): Promise<string> {
  const geminiAnswer = await askGemini(promptId, ctx);
  
  // Make absolutely sure empty responses (including non-breaking spaces) hit the fallback.
  // We use regex to strip out weird unicode empty spaces that might bypass normal trim().
  const cleanAnswer = geminiAnswer ? geminiAnswer.replace(/[\u200B-\u200D\uFEFF]/g, '').trim() : '';

  return cleanAnswer || localAdvisor(promptId, ctx);
}
