import { SKILL_MAP } from './skills-list';

/**
 * Extracts canonical skill names from a block of plain text.
 * Returns a deduplicated, sorted array of display names.
 */
export function extractSkillsFromText(text: string): string[] {
  if (!text || text.trim().length === 0) return [];

  // Normalise: lowercase, collapse whitespace
  const normalised = text.toLowerCase().replace(/\s+/g, ' ');

  const found = new Set<string>();

  // Try multi-word matches first (longer keys take priority)
  const sortedKeys = Object.keys(SKILL_MAP).sort((a, b) => b.length - a.length);

  for (const key of sortedKeys) {
    // Use word-boundary-aware regex: \b doesn't work well for dots/+
    // so we use a lookahead/lookbehind for non-alphanumeric boundaries
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, 'i');
    if (pattern.test(normalised)) {
      found.add(SKILL_MAP[key]);
    }
  }

  return [...found].sort();
}

/**
 * Merges two skill lists (from manual entry and resume extraction),
 * deduplicates (case-insensitive), and returns a clean sorted array.
 */
export function mergeSkills(manual: string[], extracted: string[]): string[] {
  const merged = new Map<string, string>();
  for (const s of [...manual, ...extracted]) {
    const key = s.toLowerCase().trim();
    if (key && !merged.has(key)) {
      merged.set(key, s.trim());
    }
  }
  return [...merged.values()].sort();
}
