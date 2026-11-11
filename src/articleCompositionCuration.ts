import type {RecipeParameterContract} from './recipeParameters.js';

export type ArticleCompositionRequirement =
  | 'editorial-copy' | 'source-asset' | 'source-quotation' | 'source-quantities'
  | 'source-relationships' | 'aligned-comparison' | 'empty-promotion-slots';

/** Curation is a renderer audit, not a content filter or a renamed template.
 * The original ID, parameter schema and aspect-ratio limits remain authoritative.
 * A supported role still needs source-backed content and measured layout scoring.
 */
export interface ArticleCompositionCuration {
  category:string;
  cover:boolean;
  illustration:boolean;
  reason:string;
  requirements:readonly ArticleCompositionRequirement[];
}
interface CurationGroup extends ArticleCompositionCuration {rendererKeys:readonly string[]}
const semantic=(...keys:string[])=>keys.map(key=>`semantic:${key}`);
const catalog=(...keys:string[])=>keys.map(key=>`catalog:${key}`);
const editorial:readonly ArticleCompositionRequirement[]=['editorial-copy'];
const native:readonly ArticleCompositionRequirement[]=['editorial-copy','empty-promotion-slots'];

/** Audited against the shared authored/reference, image, bookend, explore,
 * native-social and domain renderers. Lists are intentionally explicit: a new
 * renderer must be reviewed instead of inheriting eligibility from its name.
 */
export const ARTICLE_COMPOSITION_CURATION:readonly CurationGroup[]=[
  {category:'native-article-cover',cover:true,illustration:false,requirements:editorial,
    reason:'The three original article covers pair a bounded headline/deck with an editable topic-specific hero; they retain their original cover-only contracts.',
    rendererKeys:[0,1,2].map(index=>`article-cover:${index}`)},
  {category:'native-article-diagram',cover:false,illustration:true,requirements:editorial,
    reason:'The thirty original article diagrams retain their bounded structural blocks and native editorial renderers; their detailed explanatory layouts remain body illustrations.',
    rendererKeys:[...['features','process','comparison','summary','checklist','faq','chart'].flatMap(kind=>[0,1,2].map(index=>`article-${kind}:${index}`)),...[3,4,5,6,7,8,9,10].map(index=>`article-features:${index}`),'article-process:3']},
  {category:'editorial-headline',cover:true,illustration:true,requirements:editorial,
    reason:'A deliberate headline/deck hierarchy, with a statement, inset or focal editorial scene, can summarize an article or introduce one section without slide navigation or a promotion button.',
    rendererKeys:semantic('authored-reference-manifesto','authored-reference-diagonal','authored-explore-cover','authored-explore-section','authored-explore-focus','bookend-cover-editorial','bookend-cover-panel','bookend-cover-split','authored-prose-inset','semantic-prose-editorial','semantic-hero-editorial')},
  {category:'editorial-photo',cover:true,illustration:true,requirements:['editorial-copy','source-asset'],
    reason:'The headline and supporting copy sit beside, above or on an opaque panel over one attributed image. Image slots and crop/contain behavior are real renderer capabilities, not invented assets; optional source actions are not required.',
    rendererKeys:semantic('authored-reference-photo','authored-reference-story','authored-explore-photo-story','authored-image-banner','authored-image-split','authored-image-editorial','authored-image-campaign','authored-image-inset')},
  {category:'visual-summary',cover:true,illustration:true,requirements:editorial,
    reason:'A prominent headline with a focal feature, small bento group, indexed highlights or summary pillars provides a readable cover-level synopsis as well as an explanatory body image. Content density is still scored per candidate.',
    rendererKeys:semantic('authored-reference-vision','authored-reference-list','authored-explore-overview','authored-explore-pillars','authored-feature-focus','authored-feature-bento','authored-feature-index')},
  {category:'aligned-summary-comparison',cover:true,illustration:true,requirements:['editorial-copy','aligned-comparison'],
    reason:'Two or three labeled panels can summarize a source-backed comparison without a dense table. Columns must describe the same dimensions; neutral differences are not unsupported checkmarks or endorsements.',
    rendererKeys:semantic('authored-reference-comparison','authored-explore-comparison','authored-comparison-panels','authored-founder-comparison')},
  {category:'sourced-data-summary',cover:true,illustration:true,requirements:['editorial-copy','source-quantities'],
    reason:'A headline above a compact bar, share, trend or focal metric offers a meaningful visual summary. Values, units, labels and relationships must exist in the source; this capability never licenses fabricated cover statistics.',
    rendererKeys:semantic('authored-reference-sustainable','authored-reference-bars','authored-reference-share','authored-reference-trend','authored-explore-chart','authored-parameter-cards')},
  {category:'attributed-quotation',cover:true,illustration:true,requirements:['editorial-copy','source-quotation'],
    reason:'An editorial quotation panel can be an article headline image or a body pull quote only when an actual supplied quotation and attribution justify it. An ordinary paragraph is not converted into a quotation.',
    rendererKeys:semantic('authored-reference-opinion','authored-explore-quote','authored-quote-editorial','authored-quote-poster','semantic-quote-split')},
  {category:'detailed-structure',cover:false,illustration:true,requirements:editorial,
    reason:'Code panels, fact ledgers, matrices, FAQs and detailed prose/mixed panels need body-level reading space. Their actual structural fields and renderer capacities are retained instead of squeezing them into a cover.',
    rendererKeys:semantic('authored-reference-ledger-chart','authored-reference-detail-sidebar','authored-reference-technical-log','authored-reference-matrix','authored-reference-code','authored-reference-faq','authored-explore-worksheet','authored-explore-ledger','authored-explore-faq','authored-plan-cards','authored-code-editorial','authored-parameter-ledger','semantic-code-split','semantic-parameters-split','semantic-parameters-stack','semantic-comparison-split','semantic-features-split','semantic-features-stack','semantic-features-editorial','semantic-chart-split','semantic-chart-stack','semantic-prose-split','semantic-prose-stack','semantic-mixed-stack','menu')},
  {category:'process-and-relationships',cover:false,illustration:true,requirements:['editorial-copy','source-relationships'],
    reason:'Connected steps, timelines, architecture flows, capability maps and schedules explain supplied order or parent/child relationships in the body. Their detailed sequence is not a default article cover or an invented dependency.',
    rendererKeys:semantic('authored-reference-architecture-stack','authored-reference-journey','authored-explore-workflow','authored-explore-timeline','authored-explore-action-plan','authored-steps-journey','authored-steps-ribbon','semantic-steps-split','semantic-steps-stack','semantic-steps-editorial','authored-mechanism-flow','authored-reference-capability-map','authored-founder-timeline','itinerary','schedule')},
  {category:'three-image-explainer',cover:false,illustration:true,requirements:['editorial-copy','source-asset'],
    reason:'The triptych has three real feature/image panels and a separate explanation column. It is useful for body detail, but too much simultaneous reading for the curated cover set; action copy is optional, never manufactured.',
    rendererKeys:semantic('authored-image-triptych')},
  {category:'native-editorial-summary',cover:true,illustration:true,requirements:native,
    reason:'These native slots render expressive note headlines, a photo/editorial split or compact feature panels. Their optional promotion slots can be empty while title, body and every structural item remain visible; article generation must not invent a CTA.',
    rendererKeys:catalog('note-question','note-marker','note-editorial','note-photo','note-news','news-focus','manifesto','launch','bento','spotlight','report','editorial','story','case-study','notice','research-highlight','product-showcase')},
  {category:'native-comparison',cover:true,illustration:true,requirements:[...native,'aligned-comparison'],
    reason:'The two authored contrast panels have their own title/body/item slots and can provide a compact article synopsis. Only source-supported alternatives with comparable dimensions belong here.',
    rendererKeys:catalog('comparison','myth')},
  {category:'native-data-summary',cover:true,illustration:true,requirements:[...native,'source-quantities'],
    reason:'These native slots expose a focal value or exactly three numeric series/share items and a headline. This is a compact factual cover or body summary when real dates/quantities support the chosen structure.',
    rendererKeys:[...catalog('time-notice','metric','split-bar-compare','benchmark-bars','usage-breakdown'),...semantic('time-notice')]},
  {category:'native-pull-quote',cover:true,illustration:true,requirements:[...native,'source-quotation'],
    reason:'The native quote and testimonial renderers contain real quotation/attribution slots rather than a portrait roster. They are reusable editorial pull quotes only with supplied words and attribution, not fabricated social proof.',
    rendererKeys:catalog('quote','testimonial','editorial-quote')},
  {category:'native-explanation',cover:false,illustration:true,requirements:native,
    reason:'Checklist rows, instruction steps, menus/specifications, schedules, safety notes and question/answer pairs render detailed source fields. They add useful body structures without turning an article cover into a list or timetable.',
    rendererKeys:catalog('note-checklist','checklist','steps','course','menu','specification','itinerary','schedule','safety','faq')},
  {category:'native-relationship',cover:true,illustration:true,requirements:[...native,'source-relationships'],
    reason:'A supplied parent label and three direct child roles form a compact editable relationship diagram, which can summarize the article or explain a section. Do not infer a hierarchy from unrelated features.',
    rendererKeys:catalog('organization')},
  {category:'presentation-bookend-alias',cover:false,illustration:false,requirements:[],
    reason:'Closing variants reuse the same bookend geometry/mode as their opening counterparts and add concluding deck semantics. The opening designs are already available; adding these would inflate article choice counts with duplicate geometry.',
    rendererKeys:semantic('bookend-closing-editorial','bookend-closing-panel','bookend-closing-split','authored-explore-closing')},
  {category:'platform-conversation',cover:false,illustration:false,requirements:[],
    reason:'These render actual messenger/workplace chat chrome and message bubbles. They are platform conversation mockups, not clean editorial diagrams; removing that chrome would be a different composition.',
    rendererKeys:catalog('chat-messenger','chat-imessage','chat-telegram','chat-workplace')},
  {category:'person-event-or-brand',cover:false,illustration:false,requirements:[],
    reason:'These dedicated renderers require speaker portraits/lineups, team identity, event admissions/recruitment/community invitations, or a brand collection. Repurposing them would change their semantic slots or remove their defining visual structure.',
    rendererKeys:[...semantic('authored-reference-speaker-spotlight','authored-reference-speaker-lineup','authored-event-poster','brand-collection-grid','ticket','webinar','hiring','community'),...catalog('ticket','webinar','hiring','team','community')]},
  {category:'promotion-and-brand-poster',cover:false,illustration:false,requirements:[],
    reason:'Price-plan/offer/price-increase posters encode commercial comparisons or deadline/terms slots; branded neon/navy service posters have dedicated website/product identity and fixed art direction. They remain available in their original workflows, not generic article generation.',
    rendererKeys:[...semantic('pricing','offer'),...catalog('pricing','offer','price-increase','dark-promo','neon-workflow','navy-service')]},
];

const byRenderer=new Map<string,ArticleCompositionCuration>();
for(const {rendererKeys,...review} of ARTICLE_COMPOSITION_CURATION){
  for(const key of rendererKeys){
    if(byRenderer.has(key))throw new Error(`ARTICLE_CURATION_DUPLICATE_RENDERER:${key}`);
    byRenderer.set(key,review);
  }
}
const unreviewed:ArticleCompositionCuration={category:'unreviewed',cover:false,illustration:false,requirements:[],reason:'This renderer has not been audited for article roles. Preserve its existing capabilities until its actual structure and rendering path have been reviewed.'};

export function articleCompositionCuration(definition:Pick<RecipeParameterContract,'rendererKey'>):ArticleCompositionCuration {
  return byRenderer.get(definition.rendererKey)||unreviewed;
}
