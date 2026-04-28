export const toNumber = (value: string | number | undefined | null) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const haversineKm = (fromLat: number, fromLng: number, toLat: number, toLng: number) => {
  const rad = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = rad(toLat - fromLat);
  const dLng = rad(toLng - fromLng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(fromLat)) * Math.cos(rad(toLat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

export const estimateEtaMinutes = (distanceKm: number, averageKmPerHour = 28) => {
  if (!Number.isFinite(distanceKm) || distanceKm <= 0) return 0;
  return Math.round((distanceKm / averageKmPerHour) * 60);
};

export const buildGoogleMapsDirectionsUrl = (params: {
  pickupLat?: number;
  pickupLng?: number;
  dropLat?: number;
  dropLng?: number;
}) => {
  const { pickupLat, pickupLng, dropLat, dropLng } = params;
  if ([pickupLat, pickupLng, dropLat, dropLng].some((value) => typeof value !== "number")) {
    return null;
  }

  return `https://www.google.com/maps/dir/?api=1&origin=${pickupLat},${pickupLng}&destination=${dropLat},${dropLng}&travelmode=driving`;
};
