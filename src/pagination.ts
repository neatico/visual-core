export interface PaginatedContent {
  body?: string;
  items?: { title: string; description: string }[];
  composition?: unknown;
}
/** Split only at explicit word/sentence boundaries. Never cut identifiers,
 * decimal values, or unbroken URLs to force them onto a smaller canvas. */
export function splitCopy(copy: string): [string, string] | undefined {
  const breaks = [...copy.matchAll(/\s+|[。！？；]|[.!?;](?=\s|$)/gu)]
    .map((match) => match.index! + match[0].length)
    .filter((index) => index > 0 && index < copy.length);
  if (!breaks.length) return;
  const at = breaks.sort(
    (a, b) => Math.abs(a - copy.length / 2) - Math.abs(b - copy.length / 2),
  )[0];
  return [copy.slice(0, at), copy.slice(at)];
}
/** No paraphrasing, invented continuation labels or removed constraints. The
 * host keeps title/context on each part and remeasures every emitted page. */
export function splitContent<T extends PaginatedContent>(
  source: T,
): [T, T] | undefined {
  const base = { ...source };
  delete base.composition;
  const items = source.items || [];
  if (items.length > 1) {
    const middle = Math.ceil(items.length / 2);
    return [
      { ...base, items: items.slice(0, middle) },
      { ...base, body: "", items: items.slice(middle) },
    ] as [T, T];
  }
  if (items.length && source.body?.trim())
    return [
      { ...base, items: [] },
      { ...base, body: "", items },
    ] as [T, T];
  if (source.body) {
    const parts = splitCopy(source.body);
    if (parts) return parts.map((body) => ({ ...base, body })) as [T, T];
  }
  if (items.length === 1) {
    const parts = splitCopy(items[0].description);
    if (parts)
      return parts.map((description) => ({
        ...base,
        items: [{ ...items[0], description }],
      })) as [T, T];
  }
}
