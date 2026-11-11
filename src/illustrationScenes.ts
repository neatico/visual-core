/** One vocabulary for model contracts, validation and native editable renderers. */
export const COMPOSITION_ILLUSTRATIONS = [
  'document','collaboration','review','feedback','sequence','comparison','structure','symbol',
  'software','security','analytics','education','health','nature','finance','logistics',
  'camping','landscape','route','cooking','climate','access',
] as const;
export type IllustrationScene = typeof COMPOSITION_ILLUSTRATIONS[number];
export const ILLUSTRATION_GUIDANCE = 'Choose a concrete subject supported by this item: camping for a tent/campsite, landscape for scenery/desert, route for travel/navigation, cooking for food preparation, climate for weather/aridity, access for land-entry rules; software, security, analytics, education, health, nature, finance or logistics for those subjects. Use document, collaboration, review, feedback, sequence, comparison or structure only for an actual document, people working together, checking, revision, ordered actions, alternatives or organization. symbol is a neutral fallback. Never choose by list position or reuse an unrelated diagram to fill a slot.';

/** Repair legacy broad descriptors from visible copy, never from item position.
 * This chooses decorative objects only; it adds no factual labels or geography.
 */
export function illustrationSubject(copy: string, context = ''): IllustrationScene | undefined {
  if (/地块|土地.{0,8}(?:规则|准入|进入)|准入|访问规则|\b(?:land access|land rules|access note|entry rules|land permission)\b/iu.test(copy)) return 'access';
  if (/风景|景观|\b(?:scenic|scenery|landscape)\b/iu.test(copy)) return 'landscape';
  if (/气候|干旱|干燥|天气|\b(?:arid|aridity|dry conditions|climate|weather)\b/iu.test(copy)) return 'climate';
  if (/烹饪|做饭|炊事|食物|餐饮|排骨|\b(?:cook\w*|food|meal|ribs|kitchen)\b/iu.test(copy)) return 'cooking';
  if (/露营|帐篷|营地|\b(?:camp\w*|tent)\b/iu.test(copy)) return 'camping';
  if (/沙漠|山川|\b(?:desert|mountain)\b/iu.test(copy)) return 'landscape';
  if (/路线|路程|导航|交通|旅行|跨区域|\b(?:route|overland|navigation|travel|regional connection)\b/iu.test(copy)) return 'route';
  if (/凭证|令牌|加密|权限|\b(?:credential|token|encrypt|permission|security)\b/iu.test(copy)) return 'security';
  if (/接口|代码|软件|\b(?:api|code|software)\b/iu.test(copy)) return 'software';
  if (/自然|森林|植物|\b(?:nature|forest|tree|plant)\b/iu.test(copy)) return 'nature';
  if (/医疗|健康|\b(?:health|medical)\b/iu.test(copy)) return 'health';
  if (/教育|课堂|\b(?:education|classroom|learning)\b/iu.test(copy)) return 'education';
  if (/财务|金融|预算|\b(?:finance|budget|payment)\b/iu.test(copy)) return 'finance';
  if (/货运|物流|配送|\b(?:logistics|shipping|delivery)\b/iu.test(copy)) return 'logistics';
  if (/分析|统计|\b(?:analytics|statistics)\b/iu.test(copy)) return 'analytics';
  // A solitude caption within a camping section is not a collaboration claim.
  if (/远离人群|独处|\b(?:disconnect|solitude|crowded spaces)\b/iu.test(copy) && /露营|\bcamp\w*/iu.test(context)) return 'camping';
  return undefined;
}
