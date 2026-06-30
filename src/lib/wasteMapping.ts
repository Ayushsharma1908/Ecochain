import type { DisposalAction, Product, WasteTypeId } from "@/types/domain";

const KEYWORDS: Record<WasteTypeId, string[]> = {
  glass: [
    "glass bottle",
    "glass jar",
    "glass container",
    "jar",
    "bottle glass",
    "glass",
  ],
  metal: [
    "metal lid",
    "metal cap",
    "metal",
    "aluminium",
    "aluminum",
    "tin",
    "can",
    "steel",
  ],
  paper: ["paper", "cardboard", "carton", "fibre", "fiber"],
  plastic: [
    "plastic bottle",
    "plastic jar",
    "plastic cap",
    "plastic lid",
    "plastic pouch",
    "plastic film",
    "plastic wrap",
    "plastic",
    "pet",
    "hdpe",
    "film",
    "pouch",
  ],
  // Only truly composite multi-material packaging counts as mixed
  mixed: ["mixed material", "composite", "laminate", "tetra"],
};

const PRODUCT_GLASS_HINTS = [
  "jam",
  "jelly",
  "pickle",
  "sauce",
  "honey",
  "marmalade",
  "preserve",
];

/** Classifies a product's packaging into one of five waste streams. */
export function classifyWasteType(product: Product): WasteTypeId {
  const haystack = product.packaging.join(" ").toLowerCase();
  const productText = [product.name, product.brand, ...product.categories]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (
    PRODUCT_GLASS_HINTS.some((hint) => productText.includes(hint)) &&
    !haystack.includes("pouch")
  ) {
    const plasticOnly =
      haystack.includes("plastic") &&
      !haystack.includes("jar") &&
      !haystack.includes("glass");
    if (!plasticOnly) return "glass";
  }

  if (haystack.length === 0) {
    // No packaging metadata — fall back to a category guess.
    const cats = product.categories.join(" ").toLowerCase();
    if (PRODUCT_GLASS_HINTS.some((hint) => productText.includes(hint)))
      return "glass";
    if (cats.includes("water") || cats.includes("beverage")) return "plastic";
    return "mixed";
  }

  // Mixed-material signals take priority — they're the trickiest stream.
  if (KEYWORDS.mixed.some((k) => haystack.includes(k))) return "mixed";

  const scores: Partial<Record<WasteTypeId, number>> = {};
  for (const type of ["glass", "metal", "paper", "plastic"] as WasteTypeId[]) {
    const hits = KEYWORDS[type].filter((k) => haystack.includes(k)).length;
    if (hits > 0) scores[type] = hits;
  }

  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  if (ranked.length === 0) return "mixed";
  // If there's a clear winner, return it; otherwise mixed only if truly ambiguous between different types
  if (ranked.length > 1 && ranked[0][1] === ranked[1][1]) {
    // Tie — prefer plastic over mixed for film/pouch products
    if (
      haystack.includes("film") ||
      haystack.includes("pouch") ||
      haystack.includes("plastic")
    )
      return "plastic";
    return "mixed";
  }
  return ranked[0][0] as WasteTypeId;
}

/** Recommends a disposal action for the classified waste type + product signals. */
export function recommendDisposalAction(
  product: Product,
  wasteType: WasteTypeId,
): DisposalAction {
  const labels = product.labels.join(" ").toLowerCase();
  const categories = product.categories.join(" ").toLowerCase();

  if (
    categories.includes("clothing") ||
    categories.includes("book") ||
    categories.includes("toy")
  ) {
    return "donate";
  }
  if (
    wasteType === "glass" &&
    (categories.includes("jar") || categories.includes("bottle"))
  ) {
    return "reuse";
  }
  if (wasteType === "mixed") return "dispose";
  if (labels.includes("refurbished") || labels.includes("secondhand"))
    return "resell";
  return "recycle";
}

export const WASTE_TYPE_LABEL: Record<WasteTypeId, string> = {
  plastic: "Plastic",
  paper: "Paper & Cardboard",
  metal: "Metal",
  glass: "Glass",
  mixed: "Mixed Material",
};

export const DISPOSAL_LABEL: Record<DisposalAction, string> = {
  recycle: "Recycle",
  resell: "Resell",
  donate: "Donate",
  reuse: "Reuse",
  dispose: "Standard Disposal",
};

export const DISPOSAL_COPY: Record<DisposalAction, string> = {
  recycle:
    "This stream is widely recyclable — route it through a recycler that accepts this material.",
  resell:
    "Still has resale value. Listing it keeps it circulating instead of becoming waste.",
  donate:
    "In good condition, this is better donated than discarded — someone else can use it.",
  reuse:
    "This packaging holds up well to reuse before it ever needs recycling.",
  dispose:
    "Mixed materials are hard to separate — this one is best handled through standard waste collection for now.",
};

export interface DisposalGuide {
  title: string;
  steps: string[];
  mistakes: string[];
  benefit: string;
}

export const DISPOSAL_GUIDES: Record<WasteTypeId, DisposalGuide> = {
  plastic: {
    title: "Plastic Recycling",
    steps: [
      "Empty and rinse the container.",
      "Remove caps or pumps if possible.",
      "Keep recyclable plastics separate from general waste.",
      "Take them to an accepted recycling facility.",
    ],
    mistakes: [
      "Do not recycle containers filled with food residue.",
      "Avoid mixing plastic with electronic waste.",
    ],
    benefit:
      "Proper recycling reduces landfill waste and allows plastic to be reused in new products.",
  },

  paper: {
    title: "Paper & Cardboard",
    steps: [
      "Keep paper dry and clean.",
      "Flatten cardboard boxes.",
      "Remove plastic wrapping before recycling.",
    ],
    mistakes: ["Wet or greasy paper cannot usually be recycled."],
    benefit: "Paper recycling saves trees, water and energy.",
  },

  metal: {
    title: "Metal Recycling",
    steps: [
      "Rinse cans and containers.",
      "Separate metal lids when possible.",
      "Place in a metal recycling stream.",
    ],
    mistakes: [
      "Do not include pressurized containers unless accepted locally.",
    ],
    benefit:
      "Metal can often be recycled repeatedly with minimal loss of quality.",
  },

  glass: {
    title: "Glass Recycling",
    steps: [
      "Rinse the bottle or jar.",
      "Remove lids if possible.",
      "Reuse containers before recycling if practical.",
    ],
    mistakes: [
      "Broken glass may require different handling depending on local rules.",
    ],
    benefit: "Glass can be recycled many times without losing quality.",
  },

  mixed: {
    title: "Mixed Material Packaging",
    steps: [
      "Separate different materials whenever possible.",
      "Recycle individual parts separately.",
      "Dispose of non-recyclable components according to local guidance.",
    ],
    mistakes: ["Do not assume all mixed packaging is recyclable."],
    benefit:
      "Separating materials improves recycling efficiency and reduces landfill waste.",
  },
};

export const ECO_FACTS: Record<WasteTypeId, string[]> = {
  plastic: [
    "Only a portion of plastic waste is recycled globally, making correct sorting especially important.",
    "Reducing single-use plastics has a greater impact than recycling alone.",
  ],

  paper: [
    "Recycling paper helps conserve forests and reduces water consumption.",
    "Paper fibres can often be recycled multiple times.",
  ],

  metal: [
    "Recycling aluminium uses far less energy than producing new aluminium from raw materials.",
    "Most metals can be recycled repeatedly.",
  ],

  glass: [
    "Glass is endlessly recyclable without losing quality.",
    "Recycled glass requires less energy to process than new glass.",
  ],

  mixed: [
    "Mixed-material packaging is one of the biggest challenges in modern recycling.",
    "Choosing simpler packaging makes recycling much easier.",
  ],
};
