/** Lightweight country → region mapping used to derive a user's region. */
const REGION_BY_COUNTRY: Record<string, string> = {
  "United States": "North America",
  Canada: "North America",
  Mexico: "North America",
  "United Kingdom": "Europe",
  Ireland: "Europe",
  Germany: "Europe",
  France: "Europe",
  Netherlands: "Europe",
  Spain: "Europe",
  Italy: "Europe",
  Switzerland: "Europe",
  Sweden: "Europe",
  Norway: "Europe",
  Denmark: "Europe",
  Finland: "Europe",
  Australia: "Oceania",
  "New Zealand": "Oceania",
  Singapore: "Asia",
  Japan: "Asia",
  "South Korea": "Asia",
  China: "Asia",
  India: "Asia",
  "United Arab Emirates": "Middle East",
  Israel: "Middle East",
  Brazil: "South America",
  Argentina: "South America",
  Nigeria: "Africa",
  Kenya: "Africa",
  "South Africa": "Africa",
  "Remote / Global": "Global",
};

export function regionForCountry(country: string): string {
  return REGION_BY_COUNTRY[country] ?? "Global";
}

/**
 * Best-effort derivation of city/state from a US ZIP code prefix. This is a
 * coarse heuristic for demo purposes; production would call a geocoding API.
 */
export function deriveLocationFromZip(
  country: string,
  zip: string,
): { city?: string; state?: string } {
  if (country !== "United States" || !/^\d{3}/.test(zip)) return {};
  const prefix = zip.slice(0, 3);
  const ranges: { min: number; max: number; state: string }[] = [
    { min: 0, max: 99, state: "Massachusetts" },
    { min: 100, max: 149, state: "New York" },
    { min: 150, max: 196, state: "Pennsylvania" },
    { min: 200, max: 219, state: "Washington, D.C." },
    { min: 300, max: 319, state: "Georgia" },
    { min: 320, max: 349, state: "Florida" },
    { min: 600, max: 629, state: "Illinois" },
    { min: 750, max: 799, state: "Texas" },
    { min: 850, max: 865, state: "Arizona" },
    { min: 900, max: 961, state: "California" },
    { min: 980, max: 994, state: "Washington" },
  ];
  const n = Number(prefix);
  const match = ranges.find((r) => n >= r.min && n <= r.max);
  return match ? { state: match.state } : {};
}
