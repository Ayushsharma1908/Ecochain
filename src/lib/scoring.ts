import type { Product, ScoreBreakdown, WasteTypeId } from '@/types/domain';

/**
 * Category-level emissions baseline (0-100)
 */

const CATEGORY_BASE_SCORE: { match: string; score: number }[] = [
  { match: 'beef', score: 18 },
  { match: 'cheese', score: 32 },
  { match: 'meat', score: 35 },
  { match: 'dairy', score: 45 },
  { match: 'fish', score: 52 },
  { match: 'instant noodle', score: 50 },
  { match: 'noodle', score: 52 },
  { match: 'crisp', score: 54 },
  { match: 'chip', score: 54 },
  { match: 'biscuit', score: 56 },
  { match: 'cookie', score: 56 },
  { match: 'snack', score: 55 },
  { match: 'beverage', score: 58 },
  { match: 'water', score: 66 },
  { match: 'cereal', score: 70 },
  { match: 'grain', score: 74 },
  { match: 'fruit', score: 80 },
  { match: 'vegetable', score: 84 },
  { match: 'legume', score: 86 },
];

const DEFAULT_BASE_SCORE = 60;

function baseEmissionsScore(product: Product): number {
  const haystack = product.categories.join(' ').toLowerCase();
  const hit = CATEGORY_BASE_SCORE.find((c) => haystack.includes(c.match));
  return hit?.score ?? DEFAULT_BASE_SCORE;
}

function labelBonus(product: Product): number {
  const labels = product.labels.join(' ').toLowerCase();

  let bonus = 0;

  if (labels.includes('organic')) bonus += 6;

  if (
    labels.includes('fair trade') ||
    labels.includes('fairtrade')
  )
    bonus += 4;

  if (
    labels.includes('rainforest alliance') ||
    labels.includes('b corp')
  )
    bonus += 3;

  return Math.min(bonus, 12);
}

function packagingPenalty(wasteType: WasteTypeId): number {
  switch (wasteType) {
    case 'mixed':
      return 14;
    case 'plastic':
      return 8;
    case 'metal':
      return 3;
    case 'glass':
      return 2;
    case 'paper':
      return 0;
    default:
      return 6;
  }
}

function recyclerBonus(hasNearbyRecycler: boolean): number {
  return hasNearbyRecycler ? 8 : 0;
}

export function computeScore(
  product: Product,
  wasteType: WasteTypeId,
  hasNearbyRecycler: boolean
): ScoreBreakdown {
  const base = baseEmissionsScore(product);

  const lBonus = labelBonus(product);

  const pPenalty = packagingPenalty(wasteType);

  const rBonus = recyclerBonus(hasNearbyRecycler);

  const total = Math.max(
    0,
    Math.min(
      100,
      Math.round(base + lBonus - pPenalty + rBonus)
    )
  );

  return {
    base,
    labelBonus: lBonus,
    packagingPenalty: pPenalty,
    recyclerBonus: rBonus,
    total,
  };
}

export function scoreTier(total: number): {
  label: string;
  accent: 'lichen' | 'gold' | 'clay';
} {
  if (total >= 80)
    return {
      label: 'Excellent',
      accent: 'lichen',
    };

  if (total >= 65)
    return {
      label: 'Good',
      accent: 'lichen',
    };

  if (total >= 45)
    return {
      label: 'Moderate',
      accent: 'gold',
    };

  return {
    label: 'Needs Improvement',
    accent: 'clay',
  };
}

/**
 * Human explanation shown inside AI
 */

export function explainScore(
  score: ScoreBreakdown,
  product: Product
): string {
  const tier = scoreTier(score.total);

  const positives: string[] = [];

  const negatives: string[] = [];

  if (score.labelBonus > 0)
    positives.push(
      `Eco-certifications contributed +${score.labelBonus} points.`
    );

  if (score.recyclerBonus > 0)
    positives.push(
      `A nearby recycling facility accepts this material (+${score.recyclerBonus}).`
    );

  if (score.packagingPenalty > 0)
    negatives.push(
      `Packaging complexity reduced the score by ${score.packagingPenalty} points.`
    );

  if (score.base < 50)
    negatives.push(
      `This product category generally has a higher environmental footprint.`
    );

  if (score.base >= 70)
    positives.push(
      `This product category generally has a lower environmental footprint.`
    );

  return `
Overall Rating: ${tier.label} (${score.total}/100).

Why?

${
  positives.length
    ? positives.map((p) => `• ${p}`).join('\n')
    : '• No major positive sustainability indicators detected.'
}

Things lowering the score:

${
  negatives.length
    ? negatives.map((n) => `• ${n}`).join('\n')
    : '• No significant environmental concerns detected.'
}

This score is an estimate based on publicly available category-level environmental data, packaging recyclability and local recycling availability. It is intended to help compare products rather than provide a full lifecycle assessment.
`.trim();
}

/**
 * AI helper
 */

export function getScoreInsights(
  score: ScoreBreakdown,
  product: Product
) {
  const strengths: string[] = [];

  const weaknesses: string[] = [];

  if (score.base >= 70)
    strengths.push(
      'Low-impact product category.'
    );

  if (score.labelBonus > 0)
    strengths.push(
      'Recognized sustainability certifications.'
    );

  if (score.recyclerBonus > 0)
    strengths.push(
      'Nearby recycler available.'
    );

  if (score.packagingPenalty >= 8)
    weaknesses.push(
      'Packaging is difficult to recycle.'
    );

  if (score.base < 50)
    weaknesses.push(
      'High-emission product category.'
    );

  if (score.total < 50)
    weaknesses.push(
      'Overall sustainability score is below average.'
    );

  return {
    strengths,
    weaknesses,
  };
}

/**
 * Dashboard estimate
 */

export function estimateKgCo2(
  score: ScoreBreakdown
): number {
  const cleanliness = score.total / 100;

  const base = 2.4;

  return (
    Math.round(base * (1.6 - cleanliness) * 100) /
    100
  );
}