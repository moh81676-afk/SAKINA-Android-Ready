/**
 * Qibla calculation utility using spherical trigonometry
 * Kaaba Coordinates: 21°25'21.0"N 39°49'34.3"E
 */

export const KAABA_COORDINATES = {
  lat: 21.422487,
  lon: 39.826206,
};

export interface QiblaResult {
  bearing: number; // degrees 0-360
  distanceKm: number;
}

/**
 * Calculates bearing and distance from any user coordinate to the Kaaba
 */
export function calculateQibla(latitude: number, longitude: number): QiblaResult {
  const phi1 = (latitude * Math.PI) / 180;
  const phi2 = (KAABA_COORDINATES.lat * Math.PI) / 180;
  const deltaLambda = ((KAABA_COORDINATES.lon - longitude) * Math.PI) / 180;

  // Great-circle forward azimuth formula
  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

  let bearing = (Math.atan2(y, x) * 180) / Math.PI;
  bearing = (bearing + 360) % 360;

  // Haversine distance calculation
  const earthRadiusKm = 6371;
  const dLat = phi2 - phi1;
  const dLon = deltaLambda;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = Math.round(earthRadiusKm * c);

  return {
    bearing: Math.round(bearing),
    distanceKm,
  };
}

/**
 * Normalizes device orientation heading
 */
export function normalizeHeading(alpha: number | null, webkitHeading?: number): number | null {
  if (typeof webkitHeading === 'number' && !isNaN(webkitHeading)) {
    return (webkitHeading + 360) % 360;
  }
  if (typeof alpha === 'number' && !isNaN(alpha)) {
    return (360 - alpha) % 360;
  }
  return null;
}
