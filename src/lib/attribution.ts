/**
 * First-touch attribution capture.
 *
 * Everything the marketing model needs starts here: what channel the person
 * came from, which campaign tag was on the link, and where they landed. We
 * record the FIRST touch of the session so a visitor who wanders the site
 * before booking still gets credited to the channel that brought them in.
 */

export const sourceChannels = [
  "Word of mouth / referral",
  "LinkedIn",
  "Realtor or property manager",
  "Met someone from EPS in person",
  "Phone call",
  "Search engine",
  "Flyer, pamphlet or event",
  "Other",
] as const;

export type SourceChannel = (typeof sourceChannels)[number];

export type Attribution = {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  landing_path: string;
  referrer_host: string;
};

const EMPTY: Attribution = {
  utm_source: "",
  utm_medium: "",
  utm_campaign: "",
  landing_path: "",
  referrer_host: "",
};

const KEY = "eps.attribution.v1";

function readStored(): Attribution | null {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Attribution>;
    return { ...EMPTY, ...parsed };
  } catch {
    return null;
  }
}

/** Capture (once per session) and return the current first-touch attribution. */
export function captureAttribution(): Attribution {
  if (typeof window === "undefined") return EMPTY;

  const existing = readStored();
  if (existing) return existing;

  const params = new URLSearchParams(window.location.search);
  let referrer_host = "";
  try {
    if (document.referrer) {
      const url = new URL(document.referrer);
      if (url.host !== window.location.host) referrer_host = url.host;
    }
  } catch {
    referrer_host = "";
  }

  const value: Attribution = {
    utm_source: (params.get("utm_source") ?? "").slice(0, 80),
    utm_medium: (params.get("utm_medium") ?? "").slice(0, 80),
    utm_campaign: (params.get("utm_campaign") ?? "").slice(0, 80),
    landing_path: window.location.pathname.slice(0, 200),
    referrer_host: referrer_host.slice(0, 120),
  };

  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    /* private mode — attribution is best-effort */
  }
  return value;
}

/**
 * Best guess at the channel when the visitor does not pick one, so the model
 * still has a label instead of a blank.
 */
export function inferChannel(a: Attribution): SourceChannel | "" {
  const src = a.utm_source.toLowerCase();
  const host = a.referrer_host.toLowerCase();
  if (src.includes("linkedin") || host.includes("linkedin")) return "LinkedIn";
  if (src.includes("realtor") || src.includes("agent")) return "Realtor or property manager";
  if (src.includes("flyer") || src.includes("pamphlet") || src.includes("event"))
    return "Flyer, pamphlet or event";
  if (host.includes("google") || host.includes("bing") || host.includes("duckduckgo"))
    return "Search engine";
  return "";
}
