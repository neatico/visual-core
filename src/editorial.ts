import {
  contentBlockText,
  type ContentPage,
  type ContentPlan,
} from "./content.js";
/** Reading density, not just geometric fit. CJK occupies roughly twice Latin's width. */
export const readingUnits = (text: string) =>
  Array.from(text).reduce(
    (n, c) =>
      n +
      (/\s/.test(c)
        ? 0.2
        : /[\u2e80-\u9fff\uac00-\ud7af\u3040-\u30ff]/u.test(c)
          ? 1
          : 0.52),
    0,
  );
export function needsEditorialPagination(page: ContentPage): boolean {
  if (page.scene === "brand-collection") return false;
  const entries = page.blocks.flatMap((b) =>
    b.kind === "features" || b.kind === "steps" ? b.entries : [],
  );
  if (
    entries.length >= 3 &&
    entries.some((e) => readingUnits(e.description) > 65)
  )
    return true;
  const total = page.blocks.reduce(
    (n, b) => n + contentBlockText(b).reduce((m, s) => m + readingUnits(s), 0),
    0,
  );
  return (
    total > 250 ||
    page.blocks.some((b) =>
      b.kind === "paragraph"
        ? readingUnits(b.text) > 165
        : (b.kind === "features" || b.kind === "steps") &&
          (b.entries.some((e) => readingUnits(e.description) > 135) ||
            (b.entries.length >= 3 &&
              b.entries.some((e) => readingUnits(e.description) > 65))),
    )
  );
}
const endings: Record<string, string> = {
  zh: "感谢聆听",
  en: "Thank you",
  de: "Vielen Dank",
  es: "Gracias",
  fr: "Merci",
  ja: "ご清聴ありがとうございました",
  pt: "Obrigado",
};
/** Structural bookends contain no invented customer claims or calls to action. */
export function ensurePresentationBookends(plan: ContentPlan): ContentPlan {
  if (plan.kind !== "presentation" || !plan.pages.length) return plan;
  const text = [plan.title, ...plan.pages.map((p) => p.title)].join(" ");
  const language = /[\u3040-\u30ff]/.test(text)
    ? "ja"
    : /[\u3400-\u9fff]/.test(text)
      ? "zh"
      : /\b(und|für|Einführung)\b/i.test(text)
        ? "de"
        : /\b(pour|présentation|avec)\b/i.test(text)
          ? "fr"
          : /\b(para|apresentação|com)\b/i.test(text)
            ? "pt"
            : /\b(presentación|con|gracias)\b/i.test(text)
              ? "es"
              : "en";
  const pages = plan.pages.map((p) => ({ ...p, blocks: [...p.blocks] }));
  const used = new Set(
    pages.flatMap((p) => [p.id, ...p.blocks.map((b) => b.id)]),
  );
  const id = (prefix: string) => {
    let s = prefix,
      i = 0;
    while (used.has(s)) s = `${prefix}-${++i}`;
    used.add(s);
    return s;
  };
  const bookend = (purpose: "cover" | "conclude"): ContentPage => ({
    id: id(`deck-${purpose}`),
    title: purpose === "cover" ? plan.title : endings[language],
    purpose,
    scene: purpose === "cover" ? "hero" : "closing",
    evidence: pages[0].evidence,
    blocks: [
      {
        id: id(`deck-${purpose}-caption`),
        kind: "paragraph",
        text: plan.title,
        evidence: pages[0].evidence,
      },
    ],
  });
  if (pages[0].purpose !== "cover") pages.unshift(bookend("cover"));
  const last = pages[pages.length - 1];
  // Evidence and long explanations remain content slides, never masquerade as a closing.
  if (
    last.purpose !== "conclude" ||
    last.scene === "brand-collection" ||
    last.blocks.some((b) => b.kind !== "paragraph") ||
    last.blocks.reduce((n, b) => n + contentBlockText(b).join("").length, 0) >
      120 ||
    /行业认可|客户|customers|trusted by/i.test(last.title)
  ) {
    if (last.purpose === "conclude") last.purpose = "evidence";
    pages.push(bookend("conclude"));
  }
  return { ...plan, pages };
}
