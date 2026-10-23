import type {SemanticKind} from './content.js';
/** Product scenes describe user intent; recipes describe an executable composition.
 * Multiple scenes deliberately reuse a recipe. Scene count is not design count.
 */
export interface CompositionScene {id:string; kinds:readonly SemanticKind[]; outputs:readonly ('presentation'|'social')[]; requiresAsset?:boolean}
const both=['presentation','social'] as const;
export const COMPOSITION_SCENES:readonly CompositionScene[]=[
 {id:'brand-collection',kinds:['features'],outputs:both},
 {id:'hero',kinds:['paragraph'],outputs:both},{id:'chapter',kinds:['paragraph'],outputs:['presentation']},
 {id:'statement',kinds:['paragraph'],outputs:both},{id:'closing',kinds:['paragraph'],outputs:both},
 {id:'product-launch',kinds:['features'],outputs:both},{id:'feature-spotlight',kinds:['features'],outputs:both},
 {id:'feature-overview',kinds:['features'],outputs:both},{id:'benefits',kinds:['features'],outputs:both},
 {id:'comparison',kinds:['comparison'],outputs:both},{id:'before-after',kinds:['comparison'],outputs:both},
 {id:'plan-options',kinds:['comparison'],outputs:both},{id:'process',kinds:['steps'],outputs:both},
 {id:'roadmap',kinds:['steps'],outputs:both},{id:'tutorial',kinds:['steps'],outputs:both},
 {id:'checklist',kinds:['features'],outputs:both},{id:'metrics',kinds:['chart'],outputs:both},
 {id:'trend',kinds:['chart'],outputs:both},{id:'results',kinds:['chart'],outputs:both},
 {id:'quotation',kinds:['quote'],outputs:both},{id:'testimonial',kinds:['quote'],outputs:both},
 {id:'code-example',kinds:['code'],outputs:both},{id:'specifications',kinds:['parameters'],outputs:both},
 {id:'pricing-details',kinds:['parameters'],outputs:both},{id:'event-details',kinds:['parameters'],outputs:both},
 {id:'recruitment-details',kinds:['parameters'],outputs:both},
 {id:'product-demonstration',kinds:['image'],outputs:both,requiresAsset:true},
 {id:'photograph',kinds:['image'],outputs:both,requiresAsset:true},
 ...['banner-hero','product-showcase','editorial-cover','image-campaign'].map(id=>({id,kinds:['image'] as const,outputs:both,requiresAsset:true})),
];
export const AUTHORED_COMPOSITIONS:readonly {id:string;kind:SemanticKind;min:number;max:number}[]=[
 {id:'feature-focus',kind:'features',min:1,max:1},
 {id:'feature-bento',kind:'features',min:2,max:6},
 {id:'feature-index',kind:'features',min:2,max:6},
 {id:'steps-journey',kind:'steps',min:2,max:6},
 {id:'steps-ribbon',kind:'steps',min:2,max:4},
 {id:'comparison-panels',kind:'comparison',min:2,max:3},
 {id:'quote-editorial',kind:'quote',min:0,max:0},
 {id:'quote-poster',kind:'quote',min:0,max:0},
 {id:'code-editorial',kind:'code',min:0,max:0},
 {id:'parameter-ledger',kind:'parameters',min:1,max:8},
 {id:'parameter-cards',kind:'parameters',min:1,max:4},
];

/** Soft art-direction preferences; capacity and measured quality always remain mandatory. */
export function sceneRecipePreference(scene:string|undefined,recipeId:string):number {
 const preferred:Record<string,readonly string[]>={
  'banner-hero':['authored-image-banner'],'product-showcase':['authored-image-split'],'editorial-cover':['authored-image-editorial'],'image-campaign':['authored-image-campaign'],
  hero:['cover','semantic-hero-split'],chapter:['section','semantic-hero-editorial'],statement:['statement','semantic-hero-stack'],closing:['closing'],
  'product-launch':['authored-feature-bento'],'feature-spotlight':['authored-feature-focus'],'feature-overview':['authored-feature-bento','three-column'],benefits:['authored-feature-index'],
  comparison:['authored-comparison-panels'],'before-after':['before-after','semantic-comparison-split'],'plan-options':['authored-comparison-panels'],
  process:['authored-steps-ribbon'],roadmap:['authored-steps-ribbon','roadmap'],tutorial:['authored-steps-journey'],checklist:['authored-feature-index','checklist'],
  quotation:['authored-quote-editorial'],testimonial:['authored-quote-poster'],
  'code-example':['authored-code-editorial'],specifications:['authored-parameter-ledger'],
  'pricing-details':['authored-parameter-cards'],'event-details':['authored-parameter-cards'],'recruitment-details':['authored-parameter-ledger'],
 };
 return scene&&preferred[scene]?.some(id=>recipeId===id||recipeId.startsWith(`${id}--`))?6:0;
}
