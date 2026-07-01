import type { Recycler, WasteTypeId } from '@/types/domain';

/**
 * The concept doc calls this out directly as a hackathon risk mitigation:
 * "Recycler data may be sparse in some locations → seed local recycler
 * data manually for the hackathon." This module does exactly that —
 * it seeds a believable set of recyclers around wherever the device
 * actually is, rather than hardcoding one city's coordinates.
 */
const TEMPLATES: {
  name: string;
  kind: Recycler['kind'];
  acceptedWaste: WasteTypeId[];
  hasTransportPartner: boolean;
  notes: string;
  bearingDeg: number;
  distanceKm: number;
}[] = [
  {
    name: 'Greenline Materials Recovery',
    kind: 'recycler',
    acceptedWaste: ['plastic', 'metal', 'paper'],
    hasTransportPartner: true,
    notes: 'Accepts sorted household recyclables, no minimum volume.',
    bearingDeg: 35,
    distanceKm: 1.1,
  },
  {
    name: 'Riverside Glass & Bottle Bank',
    kind: 'collection-point',
    acceptedWaste: ['glass'],
    hasTransportPartner: false,
    notes: 'Public drop-off bins, open 24/7.',
    bearingDeg: 120,
    distanceKm: 0.6,
  },
  {
    name: 'Foundry Metal Reclaim',
    kind: 'recycler',
    acceptedWaste: ['metal'],
    hasTransportPartner: true,
    notes: 'Pays per kilo for clean aluminium and steel.',
    bearingDeg: 200,
    distanceKm: 2.4,
  },
  {
    name: 'Second Bloom Donation Hub',
    kind: 'donation',
    acceptedWaste: ['paper', 'mixed'],
    hasTransportPartner: false,
    notes: 'Takes textiles, books and small goods in resalable condition.',
    bearingDeg: 265,
    distanceKm: 1.8,
  },
  {
    name: 'Loop Co-op Resale Counter',
    kind: 'resale',
    acceptedWaste: ['mixed', 'plastic'],
    hasTransportPartner: false,
    notes: 'Community resale point for reusable containers and goods.',
    bearingDeg: 300,
    distanceKm: 0.9,
  },
  {
    name: 'Cardboard & Fibre Collective',
    kind: 'recycler',
    acceptedWaste: ['paper'],
    hasTransportPartner: true,
    notes: 'Small-business pickup available twice a week.',
    bearingDeg: 80,
    distanceKm: 3.1,
  },
  {
    name: 'Pinecone Composting Yard',
    kind: 'collection-point',
    acceptedWaste: ['mixed'],
    hasTransportPartner: false,
    notes: 'Organic & soft-plastic film drop-off, weekends only.',
    bearingDeg: 160,
    distanceKm: 2.0,
  },
];

const EARTH_RADIUS_KM = 6371;

function destinationPoint(lat: number, lng: number, bearingDeg: number, distanceKm: number) {
  const bearing = (bearingDeg * Math.PI) / 180;
  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;
  const angularDistance = distanceKm / EARTH_RADIUS_KM;

  const newLat = Math.asin(
    Math.sin(latRad) * Math.cos(angularDistance) + Math.cos(latRad) * Math.sin(angularDistance) * Math.cos(bearing)
  );
  const newLng =
    lngRad +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(latRad),
      Math.cos(angularDistance) - Math.sin(latRad) * Math.sin(newLat)
    );

  return { latitude: (newLat * 180) / Math.PI, longitude: (newLng * 180) / Math.PI };
}

export function haversineDistanceKm(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }): number {
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLng = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;

  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function formatDistanceKm(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

/** Seeds a believable set of nearby recyclers around an origin point. */
export function getSeededRecyclers(origin: { latitude: number; longitude: number } | null): Recycler[] {
  // No device location yet — anchor the seed set somewhere reasonable so the
  // Recyclers tab still has useful content before permission is granted.
  const base = origin ?? { latitude: 40.7128, longitude: -74.006 };

  return TEMPLATES.map((t, i) => {
    const point = destinationPoint(base.latitude, base.longitude, t.bearingDeg, t.distanceKm);
    return {
      id: `recycler-${i}`,
      name: t.name,
      kind: t.kind,
      acceptedWaste: t.acceptedWaste,
      address: origin ? 'Near your current location' : 'Demo location — enable location for real distances',
      latitude: point.latitude,
      longitude: point.longitude,
      hasTransportPartner: t.hasTransportPartner,
      notes: t.notes,
    };
  });
}

export function findRecyclersForWasteType(
  recyclers: Recycler[],
  wasteType: WasteTypeId
): Recycler[] {
  return recyclers.filter((r) =>
    r.acceptedWaste.includes(wasteType)
  );
}

/**
 * Returns recyclers sorted by distance from the user.
 */
export function getNearestRecyclers(
  recyclers: Recycler[],
  wasteType: WasteTypeId,
  userLocation: { latitude: number; longitude: number } | null
): Recycler[] {
  const matches = findRecyclersForWasteType(
    recyclers,
    wasteType
  );

  if (!userLocation) return matches;

  return [...matches].sort((a, b) => {
    const distanceA = haversineDistanceKm(userLocation, a);

    const distanceB = haversineDistanceKm(userLocation, b);

    return distanceA - distanceB;
  });
}

/**
 * Convenience helper used by AI.
 */
export function getBestRecycler(
  recyclers: Recycler[],
  wasteType: WasteTypeId,
  userLocation: { latitude: number; longitude: number } | null
): Recycler | null {
  return (
    getNearestRecyclers(
      recyclers,
      wasteType,
      userLocation
    )[0] ?? null
  );
}

/**
 * Returns a readable summary for AI prompts.
 */
export function recyclerSummary(
  recycler: Recycler | null,
  userLocation: { latitude: number; longitude: number } | null
): string {
  if (!recycler) {
    return 'No nearby recycler is currently registered for this material.';
  }

  const distance = userLocation
    ? formatDistanceKm(
        haversineDistanceKm(
          userLocation,
          recycler
        )
      )
    : 'Unknown distance';

  return `
Name: ${recycler.name}
Distance: ${distance}
Transport Pickup: ${
    recycler.hasTransportPartner ? 'Available' : 'Not Available'
  }
Notes: ${recycler.notes ?? 'None'}
`.trim();
}