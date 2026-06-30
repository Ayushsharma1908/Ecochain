import type { Product } from '@/types/domain';

/**
 * Open Food Facts is a free, public, key-less product database.
 * Docs: https://openfoodfacts.github.io/api-documentation/
 *
 * This is a real network call — when this project runs on a device with
 * internet access, scanning a real product barcode returns real data.
 */
const OFF_ENDPOINT = (barcode: string) =>
  `https://world.openfoodfacts.org/api/v2/product/${barcode}.json?fields=product_name,brands,categories_tags,labels_tags,packaging,packaging_tags,packagings,image_front_small_url`;

const OFF_SEARCH_ENDPOINT = (query: string) =>
  `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
    query
  )}&search_simple=1&action=process&json=1&page_size=5&fields=code,product_name,brands,categories_tags,labels_tags,packaging,packaging_tags,packagings,image_front_small_url`;

interface OffResponse {
  status: number;
  product?: OffProduct;
}

interface OffSearchResponse {
  products?: OffProduct[];
}

interface OffProduct {
  code?: string;
  product_name?: string;
  brands?: string;
  categories_tags?: string[];
  labels_tags?: string[];
  packaging?: string;
  packaging_tags?: string[];
  packagings?: { material?: string; shape?: string; recycling?: string }[];
  image_front_small_url?: string;
}

function cleanTag(tag: string): string {
  // Open Food Facts tags look like "en:organic" — strip the locale prefix.
  const withoutLocale = tag.includes(':') ? tag.split(':').slice(1).join(':') : tag;
  return withoutLocale.replace(/-/g, ' ');
}

export async function fetchProductByBarcode(barcode: string): Promise<Product | null> {
  const query = barcode.trim();
  try {
    if (!/^\d+$/.test(query)) {
      return searchProductByName(query);
    }

    const response = await fetch(OFF_ENDPOINT(query), {
      headers: { 'User-Agent': 'EcoChainLink - Hackathon Concept - Expo App' },
    });
    if (!response.ok) return null;

    const data = (await response.json()) as OffResponse;
    if (data.status !== 1 || !data.product) return null;

    return mapOffProduct(query, data.product);
  } catch {
    return null;
  }
}

async function searchProductByName(query: string): Promise<Product | null> {
  try {
    const response = await fetch(OFF_SEARCH_ENDPOINT(query), {
      headers: { 'User-Agent': 'EcoChainLink - Hackathon Concept - Expo App' },
    });
    if (!response.ok) return null;

    const data = (await response.json()) as OffSearchResponse;
    const products = data.products ?? [];
    if (products.length === 0) return null;

    // Pick the best matching product by name similarity
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(Boolean);
    const scored = products
      .filter((p) => p.product_name) // must have a name
      .map((p) => {
        const nameLower = (p.product_name ?? '').toLowerCase();
        const brandLower = (p.brands ?? '').toLowerCase();
        const combined = `${nameLower} ${brandLower}`;
        // Count how many query words appear in the product name/brand
        const matchCount = queryWords.filter((w) => combined.includes(w)).length;
        return { product: p, score: matchCount };
      })
      .sort((a, b) => b.score - a.score);

    const best = scored[0]?.product;
    if (!best) return null;

    return mapOffProduct(best.code || query, best);
  } catch {
    return null;
  }
}

function mapOffProduct(barcode: string, p: OffProduct): Product {
  const packagingText = p.packaging
    ? p.packaging
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
  const packagingParts = (p.packagings ?? []).flatMap((part) =>
    [part.material, part.shape, part.recycling].filter((value): value is string => Boolean(value))
  );

  return {
    barcode,
    name: p.product_name?.trim() || 'Unnamed product',
    brand: p.brands?.split(',')[0]?.trim(),
    categories: (p.categories_tags ?? []).map(cleanTag),
    labels: (p.labels_tags ?? []).map(cleanTag),
    packaging: [...(p.packaging_tags ?? []).map(cleanTag), ...packagingText, ...packagingParts.map(cleanTag)],
    imageUrl: p.image_front_small_url,
    source: 'open-food-facts',
  };
}

/**
 * A small set of fallback products so the scan flow is fully demoable
 * even with no network access, or when a scanned barcode isn't in the
 * Open Food Facts database yet (very common for local/regional products).
 */
export function fallbackProductForBarcode(barcode: string): Product {
  const samples: Product[] = [
    {
      barcode,
      name: 'Maggi 2-Minute Noodles',
      brand: 'Maggi',
      categories: ['instant noodles', 'noodles', 'savoury snacks'],
      labels: [],
      // Maggi is packed in a metallised plastic film pouch — mixed/plastic
      packaging: ['plastic film', 'metallised film', 'plastic pouch'],
      source: 'fallback',
    },
    {
      barcode,
      name: 'Kissan Mixed Fruit Jam',
      brand: 'Kissan',
      categories: ['spreads', 'fruit jams', 'sweet spreads'],
      labels: [],
      packaging: ['glass jar', 'metal lid'],
      source: 'fallback',
    },
    {
      barcode,
      name: 'Sparkling Water, 500ml',
      brand: 'ClearSpring',
      categories: ['beverages', 'waters', 'sparkling waters'],
      labels: ['recyclable packaging'],
      packaging: ['plastic bottle', 'plastic cap'],
      source: 'fallback',
    },
    {
      barcode,
      name: 'Organic Rolled Oats, 1kg',
      brand: 'FieldGrain',
      categories: ['breakfast cereals', 'cereal grains'],
      labels: ['organic', 'eu organic'],
      packaging: ['paper bag', 'cardboard box'],
      source: 'fallback',
    },
    {
      barcode,
      name: 'Mixed Nuts Snack Pack',
      brand: 'TrailFolk',
      categories: ['snacks', 'salty snacks', 'nuts'],
      labels: [],
      packaging: ['mixed material pouch', 'metallised film'],
      source: 'fallback',
    },
    {
      barcode,
      name: 'Lays Classic Salted Chips',
      brand: 'Lays',
      categories: ['snacks', 'crisps', 'potato chips'],
      labels: [],
      packaging: ['plastic film', 'metallised film'],
      source: 'fallback',
    },
    {
      barcode,
      name: 'Parle-G Glucose Biscuits',
      brand: 'Parle',
      categories: ['biscuits', 'cookies', 'sweet biscuits'],
      labels: [],
      packaging: ['plastic film', 'plastic wrap'],
      source: 'fallback',
    },
  ];

  // Named product hints — match brand or product keywords case-insensitively
  const NAMED_HINTS: { keywords: string[]; index: number }[] = [
    { keywords: ['maggi', 'noodle', 'instant noodle'], index: 0 },
    { keywords: ['kissan', 'jam'], index: 1 },
    { keywords: ['water', 'sparkling'], index: 2 },
    { keywords: ['oat', 'oats', 'fieldgrain'], index: 3 },
    { keywords: ['nut', 'nuts', 'trailfolk'], index: 4 },
    { keywords: ['lays', 'chips', 'crisp'], index: 5 },
    { keywords: ['parle', 'biscuit', 'glucose'], index: 6 },
  ];

  const barcodeLower = barcode.toLowerCase();
  const matched = NAMED_HINTS.find((hint) =>
    hint.keywords.some((kw) => barcodeLower.includes(kw))
  );
  if (matched) {
    return { ...samples[matched.index], barcode };
  }

  const idx = barcode.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0) % samples.length;
  return { ...samples[idx], barcode };
}
