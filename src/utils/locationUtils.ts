// ─── Indian Cities (Kerala-first, then other major cities) ───────────────────

export const INDIAN_CITIES: string[] = [
  // Kerala
  "Kochi",
  "Kozhikode",
  "Thrissur",
  "Kannur",
  "Thiruvananthapuram",
  "Kottayam",
  "Malappuram",
  "Palakkad",
  "Kollam",
  "Alappuzha",
  "Ernakulam",
  "Pathanamthitta",
  "Idukki",
  "Wayanad",
  "Kasaragod",
  "Manjeri",
  "Perinthalmanna",
  "Thrippunithura",
  "Kalamassery",
  "Angamaly",
  "Chalakudy",
  "Irinjalakuda",
  "Vadakara",
  "Thalassery",
  "Tirur",
  "Ottapalam",
  "Ponnani",
  "Guruvayur",
  "Kunnamkulam",
  "Kayamkulam",
  "Punalur",
  "Adoor",
  "Changanacherry",
  "Ettumanoor",
  "Pala",
  "Thodupuzha",
  "Munnar",
  "Aluva",
  "Perumbavoor",
  "Muvattupuzha",
  "Cherthala",
  "Mavelikkara",
  // Other major Indian cities
  "Bengaluru",
  "Chennai",
  "Mumbai",
  "Delhi",
  "Hyderabad",
  "Pune",
  "Kolkata",
  "Ahmedabad",
  "Surat",
  "Jaipur",
  "Lucknow",
  "Kanpur",
  "Nagpur",
  "Indore",
  "Bhopal",
  "Visakhapatnam",
  "Patna",
  "Vadodara",
  "Ghaziabad",
  "Ludhiana",
  "Agra",
  "Nashik",
  "Coimbatore",
  "Madurai",
  "Mangaluru",
  "Mysuru",
  "Hubli",
  "Belgaum",
  "Goa",
  "Kochi (Metro)",
];

// ─── Encoding / Decoding ────────────────────────────────────────────────────

const SEP = " || ";

/**
 * Encodes city + exact location + optional maps URL into one string for the DB.
 * Format: "City || Exact Location || https://maps.google.com/..."
 * The maps URL part is omitted when empty.
 */
export function encodeLocation(
  city: string,
  exactLocation: string,
  mapsUrl: string
): string {
  const parts = [city.trim(), exactLocation.trim(), mapsUrl.trim()];
  return parts.join(SEP);
}

export interface DecodedLocation {
  city: string;
  exactLocation: string;
  mapsUrl: string;
  /** true when the stored value uses the new pipe format */
  isNew: boolean;
}

/**
 * Decodes a stored location string back into its components.
 * Falls back gracefully for old single-field values.
 */
export function decodeLocation(raw: string | null | undefined): DecodedLocation {
  if (!raw) return { city: "", exactLocation: "", mapsUrl: "", isNew: false };

  if (raw.includes(SEP)) {
    const [city = "", exactLocation = "", mapsUrl = ""] = raw.split(SEP);
    return { city: city.trim(), exactLocation: exactLocation.trim(), mapsUrl: mapsUrl.trim(), isNew: true };
  }

  // Legacy format — treat whole string as city/location
  return { city: raw.trim(), exactLocation: "", mapsUrl: "", isNew: false };
}

// ─── Working Hours ──────────────────────────────────────────────────────────

export const HOURS = ["1","2","3","4","5","6","7","8","9","10","11","12"];
export const MINUTES = ["00","15","30","45"];
export const PERIODS = ["AM","PM"] as const;

export type Period = "AM" | "PM";

export interface TimeValue {
  hour: string;
  minute: string;
  period: Period;
}

export function formatTime(t: TimeValue): string {
  const h = t.hour.padStart(2, "0");
  return `${h}:${t.minute} ${t.period}`;
}

export function encodeWorkingHours(start: TimeValue, end: TimeValue): string {
  return `${formatTime(start)} – ${formatTime(end)}`;
}

export interface DecodedWorkingHours {
  start: TimeValue;
  end: TimeValue;
  isNew: boolean;
}

const DEFAULT_START: TimeValue = { hour: "9", minute: "00", period: "AM" };
const DEFAULT_END: TimeValue   = { hour: "5", minute: "00", period: "PM"  };

/**
 * Tries to parse "09:00 AM – 05:00 PM" back into TimeValue pairs.
 * Falls back to defaults if format is unrecognised (legacy text).
 */
export function decodeWorkingHours(raw: string | null | undefined): DecodedWorkingHours {
  if (!raw) return { start: DEFAULT_START, end: DEFAULT_END, isNew: false };

  // Matches "09:00 AM – 05:00 PM" or "09:00 AM - 05:00 PM"
  const re = /^(\d{1,2}):(\d{2})\s*(AM|PM)\s*[–\-]\s*(\d{1,2}):(\d{2})\s*(AM|PM)$/i;
  const m = raw.trim().match(re);

  if (m) {
    return {
      isNew: true,
      start: { hour: String(parseInt(m[1])), minute: m[2], period: m[3].toUpperCase() as Period },
      end:   { hour: String(parseInt(m[4])), minute: m[5], period: m[6].toUpperCase() as Period },
    };
  }

  return { start: DEFAULT_START, end: DEFAULT_END, isNew: false };
}
