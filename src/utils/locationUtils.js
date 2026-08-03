/**
 * Location helpers for opportunity filtering and canonical formatting.
 *
 * Canonical formats:
 *   Remoto              → "Remoto"
 *   Presencial          → "Cidade, UF"
 *   Híbrido             → "Cidade, UF (Híbrido)"
 *
 * Legacy DB strings are parsed heuristically. Fully-remote entries that mention
 * a city (e.g. "São Paulo, SP (100% Remoto)") count only as Remoto.
 *
 * Optional MySQL backfill for live data (run once if needed):
 *   UPDATE oportunidades SET location = 'Remoto'
 *     WHERE LOWER(location) LIKE '%remoto%' OR LOWER(location) LIKE '%online%'
 *       OR LOWER(location) IN ('presencial/online');
 *   UPDATE oportunidades SET location = 'São Paulo, SP'
 *     WHERE location = 'São Paulo, SP (Presencial)';
 *   UPDATE oportunidades SET location = 'Aracaju, SE'
 *     WHERE location = 'Aracaju, SE (Presencial)';
 *   UPDATE oportunidades SET location = 'Rio de Janeiro, RJ'
 *     WHERE location = 'Online / Rio de Janeiro';
 *   -- Híbrido and bare "Cidade, UF" already match the canonical form.
 */

export const LOCATION_FILTER_ALL = 'Todas';
export const LOCATION_FILTER_REMOTE = 'Remoto';

export const LOCATION_MODALITIES = ['Presencial', 'Híbrido', 'Remoto'];

/** Catalog of cities available in create/edit forms. */
export const CITY_CATALOG = [
  'São Paulo, SP',
  'Rio de Janeiro, RJ',
  'Belo Horizonte, MG',
  'Brasília, DF',
  'Salvador, BA',
  'Recife, PE',
  'Fortaleza, CE',
  'Aracaju, SE',
  'Campo Grande, MS',
  'São José do Rio Preto, SP',
];

const OTHER_CITY_VALUE = '__other__';
export { OTHER_CITY_VALUE };

const CITY_ALIAS_MAP = [
  { match: /s[aã]o\s+paulo/i, key: 'São Paulo, SP' },
  { match: /rio\s+de\s+janeiro/i, key: 'Rio de Janeiro, RJ' },
  { match: /belo\s+horizonte/i, key: 'Belo Horizonte, MG' },
  { match: /bras[ií]lia/i, key: 'Brasília, DF' },
  { match: /salvador/i, key: 'Salvador, BA' },
  { match: /recife/i, key: 'Recife, PE' },
  { match: /fortaleza/i, key: 'Fortaleza, CE' },
  { match: /aracaju/i, key: 'Aracaju, SE' },
  { match: /campo\s+grande/i, key: 'Campo Grande, MS' },
  { match: /s[aã]o\s+jos[eé]\s+do\s+rio\s+preto/i, key: 'São José do Rio Preto, SP' },
];

const stripModalitySuffix = (value) =>
  value
    .replace(/\s*\((?:100%\s*)?remoto\)/gi, '')
    .replace(/\s*\(h[ií]brido\)/gi, '')
    .replace(/\s*\(presencial\)/gi, '')
    .replace(/\s*\(global\)/gi, '')
    .trim();

/**
 * Fully remote / online — city mentions in the same string are ignored for filtering.
 */
export function isRemoteLocation(raw) {
  if (!raw || typeof raw !== 'string') return false;
  const value = raw.trim().toLowerCase();
  if (!value) return false;

  if (value === 'online' || value === 'presencial/online' || value === 'remoto') {
    return true;
  }

  // Pure online with optional slash city still treated as remote only when
  // the whole string is just "online" — "Online / Rio de Janeiro" is hybrid place.
  if (value === 'online / rio de janeiro') {
    return false;
  }

  if (/\b(100%\s*)?remoto\b/.test(value)) return true;
  if (value.startsWith('remoto')) return true;
  if (value === 'online') return true;
  if (/\bonline\b/.test(value) && !/\//.test(value)) return true;

  return false;
}

function resolveCityAlias(text) {
  if (!text) return null;
  for (const alias of CITY_ALIAS_MAP) {
    if (alias.match.test(text)) return alias.key;
  }
  return null;
}

/**
 * Extract a display city key for non-remote locations.
 */
export function extractCityKey(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const withoutSuffix = stripModalitySuffix(trimmed);

  // "Online / Rio de Janeiro" → Rio de Janeiro
  if (/\bonline\s*\/\s*/i.test(withoutSuffix)) {
    const afterSlash = withoutSuffix.replace(/^.*\bonline\s*\/\s*/i, '').trim();
    const aliased = resolveCityAlias(afterSlash);
    if (aliased) return aliased;
    return afterSlash || null;
  }

  const aliased = resolveCityAlias(withoutSuffix);
  if (aliased) return aliased;

  // "Cidade, UF" or "Cidade, Estado, País" — keep up to first two comma parts when UF-like
  const parts = withoutSuffix.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const uf = parts[1];
    if (/^[A-Z]{2}$/i.test(uf) || uf.length <= 3) {
      return `${parts[0]}, ${uf.toUpperCase() === uf || uf.length === 2 ? uf.toUpperCase() : uf}`;
    }
    // e.g. "Washington, D.C."
    return `${parts[0]}, ${parts[1]}`;
  }

  if (parts.length === 1) {
    return parts[0];
  }

  return withoutSuffix || null;
}

function detectModality(raw) {
  if (!raw || typeof raw !== 'string') return 'Presencial';
  if (isRemoteLocation(raw)) return 'Remoto';
  if (/\bh[ií]brido\b/i.test(raw)) return 'Híbrido';
  return 'Presencial';
}

/**
 * @returns {{ kind: 'remoto' | 'cidade', cityKey: string | null, modality: string }}
 */
export function parseLocation(raw) {
  if (!raw || typeof raw !== 'string' || !raw.trim()) {
    return { kind: 'cidade', cityKey: null, modality: 'Presencial' };
  }

  const modality = detectModality(raw);

  if (modality === 'Remoto' || isRemoteLocation(raw)) {
    return { kind: 'remoto', cityKey: null, modality: 'Remoto' };
  }

  const cityKey = extractCityKey(raw);
  return {
    kind: 'cidade',
    cityKey,
    modality: modality === 'Híbrido' ? 'Híbrido' : 'Presencial',
  };
}

/**
 * Build the canonical location string stored in the API.
 * @param {{ modality: string, cityKey?: string | null }} params
 */
export function formatLocation({ modality, cityKey }) {
  if (modality === 'Remoto') return 'Remoto';
  const city = (cityKey || '').trim();
  if (!city) return '';
  if (modality === 'Híbrido') return `${city} (Híbrido)`;
  return city;
}

/**
 * Dynamic filter options from loaded opportunities (multi-select values).
 * Only cities from non-remote opportunities; Remoto if any remote exists.
 * Does not include "Todas" — empty selection means all.
 */
export function collectLocationFilterOptions(opportunities) {
  const options = [];
  const cities = new Set();
  let hasRemote = false;

  (opportunities || []).forEach((op) => {
    const parsed = parseLocation(op?.location);
    if (parsed.kind === 'remoto') {
      hasRemote = true;
      return;
    }
    if (parsed.cityKey) {
      cities.add(parsed.cityKey);
    }
  });

  if (hasRemote) {
    options.push(LOCATION_FILTER_REMOTE);
  }

  Array.from(cities)
    .sort((a, b) => a.localeCompare(b, 'pt-BR'))
    .forEach((city) => options.push(city));

  return options;
}

function normalizeSelectedLocations(selected) {
  if (!selected) return [];
  if (Array.isArray(selected)) {
    return selected.filter((value) => value && value !== LOCATION_FILTER_ALL);
  }
  if (selected === LOCATION_FILTER_ALL) return [];
  return [selected];
}

function opportunityMatchesSingleLocation(opportunity, selected) {
  const parsed = parseLocation(opportunity?.location);

  if (selected === LOCATION_FILTER_REMOTE) {
    return parsed.kind === 'remoto';
  }

  if (parsed.kind === 'remoto') return false;
  return parsed.cityKey === selected;
}

/**
 * Match when no selection (all) or when the opportunity matches any selected location (OR).
 * @param {object} opportunity
 * @param {string|string[]} selected
 */
export function opportunityMatchesLocation(opportunity, selected) {
  const selectedLocations = normalizeSelectedLocations(selected);
  if (!selectedLocations.length) return true;
  return selectedLocations.some((value) =>
    opportunityMatchesSingleLocation(opportunity, value)
  );
}

/**
 * Normalize a legacy free-text location toward the canonical form (for seed / display).
 */
export function toCanonicalLocation(raw) {
  const parsed = parseLocation(raw);
  if (parsed.kind === 'remoto') return 'Remoto';
  if (!parsed.cityKey) return (raw || '').trim();
  return formatLocation({ modality: parsed.modality, cityKey: parsed.cityKey });
}
