export type Measure = (text: string, size: number, bold: boolean) => number;

/**
 * Wrap measured text without depending on DOM, canvas, or a specific font engine.
 *
 * Tokenization (not UAX #14):
 * 1. CJK ideographs break per character
 * 2. Unicode letters/marks/numbers stay together (Latin, Cyrillic, Arabic, Greek, …),
 *    with an optional internal URL/API separator run (`HTTP`, `a.b`, `user@host`)
 * 3. Any other non-space glyph is its own token
 */
export function wrapCopy(
  text: string,
  width: number,
  size: number,
  bold: boolean,
  measure: Measure,
): string[] {
  if (typeof measure !== "function")
    throw new TypeError("measure must be a function");
  if (
    !Number.isFinite(width) ||
    width <= 0 ||
    !Number.isFinite(size) ||
    size <= 0
  )
    throw new RangeError("Width and font size must be positive finite numbers");
  const fits = (value: string) => {
    const measured = measure(value, size, bold);
    if (!Number.isFinite(measured) || measured < 0)
      throw new TypeError(
        "The text measurement must be a nonnegative finite number",
      );
    return measured <= width;
  };
  // CJK first so ideographs are not swallowed by \p{L} word runs.
  const tokenRe =
    /[\u2e80-\u9fff\uf900-\ufaff]\s*|(?:[\p{L}\p{M}\p{N}]+(?:[._/@+\-][\p{L}\p{M}\p{N}]+)*)\s*|[^\s]\s*/gu;
  const lines: string[] = [];
  for (const paragraph of text.replace(/\r\n?/g, "\n").split("\n")) {
    let line = "";
    for (const token of paragraph.match(tokenRe) || []) {
      if (fits(line + token.trimEnd())) {
        line += token;
        continue;
      }
      if (line.trim()) {
        lines.push(line.trim());
        line = "";
      }
      for (const char of Array.from(token)) {
        if (!fits(char) && char.trim())
          throw new RangeError("A character exceeds the available width");
        if (!fits(line + char) && line) {
          lines.push(line.trim());
          line = "";
        }
        line += char;
      }
    }
    if (line.trim()) lines.push(line.trim());
    else if (!paragraph.trim() && text.includes("\n")) lines.push("");
  }
  return lines;
}
