/** Closed presentation intent. Content stays in its original field, never in CSS. */
export interface TextPresentationLine {
  text: string;
  font: 'display' | 'body' | 'mono';
  scale: number;
  tone: 'ink' | 'accent' | 'secondary';
  decoration: 'none' | 'marker' | 'underline';
  italic: boolean;
}
export interface TextPresentation {
  path: string;
  fit: 'natural' | 'equal-width';
  lines: TextPresentationLine[];
}

const object = (properties: Record<string, unknown>) => ({
  type: 'object', additionalProperties: false, properties, required: Object.keys(properties),
});

export function textPresentationSchema() {
  return {
    type: 'array', minItems: 0, maxItems: 8, default: [],
    description: 'Optional typography for visible text fields, including title, body, item descriptions and quotations. Use a few deliberate contrasts within the shared suite. Every line must preserve the original field text and word boundaries. Empty uses the authored typography. Never style code, evidence, IDs or asset metadata.',
    items: object({
      path: {type: 'string', minLength: 1, maxLength: 120, description: 'Exact dot path of the visible text field, such as body, items.0.description or blocks.0.text.'},
      fit: {type: 'string', enum: ['natural', 'equal-width'], description: 'Equal-width adjusts each line independently within readable size limits; it never stretches glyphs.'},
      lines: {type: 'array', minItems: 1, maxItems: 8, items: object({
        text: {type: 'string', minLength: 1, maxLength: 220, description: 'One complete phrase copied exactly from the target field. All lines together must preserve that entire field.'},
        font: {type: 'string', enum: ['display', 'body', 'mono']},
        scale: {type: 'number', minimum: 0.8, maximum: 1.35},
        tone: {type: 'string', enum: ['ink', 'accent', 'secondary']},
        decoration: {type: 'string', enum: ['none', 'marker', 'underline']},
        italic: {type: 'boolean'},
      })},
    }),
  };
}

const normalize = (text: string) => text.normalize('NFC').replace(/\s+/gu, ' ').trim();
const word = (character: string) => /[\p{Script=Latin}\p{Script=Cyrillic}\p{Script=Greek}\p{Number}]/u.test(character);

/** Validate exact source reconstruction; script-aware boundaries permit CJK breaks. */
export function validateTextPresentations(value: unknown, content: Record<string, unknown>): TextPresentation[] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > 8) throw new Error('TEXT_PRESENTATION_INVALID');
  const paths = new Set<string>();
  for (const entry of value) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) throw new Error('TEXT_PRESENTATION_INVALID');
    if (Object.keys(entry).some(key => !['path', 'fit', 'lines'].includes(key))) throw new Error('TEXT_PRESENTATION_INVALID');
    if (typeof entry.path !== 'string' || !/^(?:title|body|eyebrow|cta|value|attribution|(?:items|blocks)\.\d+\.(?:(?:entries|rows|columns)\.\d+\.)?(?:title|heading|text|description|name|value|attribution|points\.\d+))$/.test(entry.path) || paths.has(entry.path)) throw new Error('TEXT_PRESENTATION_PATH');
    paths.add(entry.path);
    const copy = entry.path.split('.').reduce((node: any, key: string) => node?.[key], content);
    if (typeof copy !== 'string' || !copy.trim()) throw new Error('TEXT_PRESENTATION_PATH');
    if (!['natural', 'equal-width'].includes(entry.fit) || !Array.isArray(entry.lines) || entry.lines.length < 1 || entry.lines.length > 8) throw new Error('TEXT_PRESENTATION_INVALID');
    const source = normalize(copy);
    let cursor = 0;
    for (const line of entry.lines) {
      if (!line || typeof line !== 'object' || Array.isArray(line) || Object.keys(line).some(key => !['text', 'font', 'scale', 'tone', 'decoration', 'italic'].includes(key))) throw new Error('TEXT_PRESENTATION_INVALID');
      if (typeof line.text !== 'string' || !normalize(line.text) || Array.from(line.text).length > 220 || !['display', 'body', 'mono'].includes(line.font) || !Number.isFinite(line.scale) || line.scale < 0.8 || line.scale > 1.35 || !['ink', 'accent', 'secondary'].includes(line.tone) || !['none', 'marker', 'underline'].includes(line.decoration) || typeof line.italic !== 'boolean') throw new Error('TEXT_PRESENTATION_INVALID');
      const phrase = normalize(line.text);
      if (source[cursor] === ' ') cursor++;
      if (!source.startsWith(phrase, cursor)) throw new Error('TEXT_PRESENTATION_CONTENT');
      if (cursor && source[cursor - 1] !== ' ' && word(source[cursor - 1]) && word(phrase[0])) throw new Error('TEXT_PRESENTATION_WORD_BOUNDARY');
      cursor += phrase.length;
    }
    if (cursor !== source.length) throw new Error('TEXT_PRESENTATION_CONTENT');
  }
  return value as TextPresentation[];
}
