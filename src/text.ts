export type Measure = (text: string, size: number, bold: boolean) => number;
/** Wrap measured text without depending on DOM, canvas, or a specific font engine. */
export function wrapCopy(
  text: string,
  width: number,
  size: number,
  bold: boolean,
  measure: Measure,
): string[] {
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
  const lines: string[] = [];
  for (const paragraph of text.replace(/\r\n?/g, "\n").split("\n")) {
    let line = "";
    for (const token of paragraph.match(
      /[^\s\u2e80-\u9fff\uf900-\ufaff]+\s*|[\u2e80-\u9fff\uf900-\ufaff]\s*/gu,
    ) || []) {
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
