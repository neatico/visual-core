import {compositionUseCase} from './compositionUseCases.js';
import {nativeSocialParameterContract} from './nativeSocialParameters.js';
import {DESIGN_RECIPES,type DesignRecipe} from './designSystem.js';
import {SOCIAL_LAYOUT_CATALOG} from './socialLayouts.js';
import {recipeParameterContract,type RecipeParameterContract,type CompositionKind} from './recipeParameters.js';
import type {SemanticKind} from './content.js';
import {SEMANTIC_DISPLAY_NUMBERS,SOCIAL_DISPLAY_NUMBERS} from './compositionNumbers.js';

export interface FormalComposition extends RecipeParameterContract {
  displayNumber:string;
  aspectRatios:{min:number;max:number};
  recipe?:DesignRecipe;
}
const both=['presentation','social'] as const;
const semantic=(id:string,accepts:readonly SemanticKind[],minEntries=0,maxEntries=12,requiresImage=false):DesignRecipe=>({id,renderer:'semantic',kind:'social',family:id,accepts,minEntries,maxEntries,requiresImage});
function define(recipe:DesignRecipe,kinds:readonly CompositionKind[],id:string,displayNumber:string,min=.25,max=4):FormalComposition {
  return {...recipeParameterContract(recipe,kinds),semanticDescription:compositionUseCase(recipe.id),id,displayNumber,aspectRatios:{min,max},recipe};
}

/** Structural reference contracts shared with the product's existing renderers.
 * Colorways and historical aliases remain outside active discovery.
 */
export const FORMAL_REFERENCE_COMPOSITIONS:readonly {id:string;reference:number;layout:string;accepts:readonly SemanticKind[]}[]=[
  {id:'authored-reference-photo',reference:1,layout:'authored-photo-editorial',accepts:['image','paragraph']},
  {id:'authored-reference-manifesto',reference:2,layout:'authored-type-manifesto',accepts:['paragraph']},
  {id:'authored-reference-journey',reference:3,layout:'authored-editorial-flow',accepts:['steps']},
  {id:'authored-reference-vision',reference:4,layout:'authored-editorial-features',accepts:['features']},
  {id:'authored-reference-matrix',reference:5,layout:'authored-editorial-matrix',accepts:['comparison','paragraph']},
  {id:'authored-reference-diagonal',reference:6,layout:'authored-diagonal-cover',accepts:['paragraph']},
  {id:'authored-reference-list',reference:8,layout:'authored-editorial-index',accepts:['features']},
  {id:'authored-reference-story',reference:11,layout:'authored-visual-poster',accepts:['image','paragraph','features']},
  {id:'authored-reference-sustainable',reference:13,layout:'authored-editorial-metrics',accepts:['parameters']},
  {id:'authored-reference-code',reference:14,layout:'authored-code-panel',accepts:['code']},
  {id:'authored-reference-bars',reference:18,layout:'authored-editorial-bars',accepts:['chart']},
  {id:'authored-reference-share',reference:19,layout:'authored-editorial-donut',accepts:['chart']},
  {id:'authored-reference-opinion',reference:20,layout:'authored-editorial-quote',accepts:['quote']},
  {id:'authored-reference-comparison',reference:22,layout:'authored-editorial-comparison',accepts:['comparison']},
  {id:'authored-reference-faq',reference:23,layout:'authored-editorial-faq',accepts:['features']},
  {id:'authored-reference-trend',reference:25,layout:'authored-editorial-trend',accepts:['chart']},
];
const semanticRecipes=DESIGN_RECIPES.filter(recipe=>recipe.renderer==='semantic');
const uniqueSemantic=semanticRecipes.filter((recipe,index)=>semanticRecipes.findIndex(other=>other.id===recipe.id)===index);
const campaignDefinitions:[string,readonly SemanticKind[],number,number,boolean,boolean][]=[
  ['ledger-chart',['parameters','chart'],2,6,false,true],
  ['detail-sidebar',['paragraph','parameters'],1,3,false,true],
  ['technical-log',['code','paragraph'],0,12,false,false],
  ['architecture-stack',['steps','paragraph'],2,4,false,false],
  ['speaker-spotlight',['quote','parameters'],1,6,true,false],
  ['speaker-lineup',['quote','parameters'],1,6,true,false],
];
const founderDefinitions:[string,readonly SemanticKind[],number,number][]=[
  ['authored-mechanism-flow',['features','steps','paragraph'],2,4],
  ['authored-reference-capability-map',['features','paragraph'],2,4],
  ['authored-founder-timeline',['steps','paragraph'],2,4],
  ['authored-founder-comparison',['comparison','paragraph'],2,2],
];
const articleKinds=['features','process','comparison','summary','checklist','faq','chart'] as const;
const articleAccepts:Record<typeof articleKinds[number],readonly SemanticKind[]>={features:['features','paragraph'],process:['steps','paragraph'],comparison:['comparison','paragraph'],summary:['paragraph','features'],checklist:['features','paragraph'],faq:['features','paragraph'],chart:['chart','paragraph']};
function article(id:string,kind:typeof articleKinds[number]|'cover',variant:number):FormalComposition {
  const cover=kind==='cover';
  const recipe=semantic(id,cover?['paragraph','features','image']:articleAccepts[kind],0,kind==='chart'?12:3);
  const number=cover?variant+1:kind==='features'&&variant>=3?22+variant:kind==='process'&&variant===3?33:4+articleKinds.indexOf(kind as typeof articleKinds[number])*3+variant;
  const definition=define(recipe,[cover?'article-cover':'article-illustration'],id,`A${String(number).padStart(3,'0')}`,.5,2.4);
  // A cover is a headline, a short deck and its authored hero. It is not a
  // miniature article: the original source remains in the candidate pool.
  const coverSchema={type:'object',additionalProperties:false,required:['title','blocks'],properties:{
    title:{type:'string',minLength:1,maxLength:72,description:'A concise editorial headline, preferably four to eight words.'},
    blocks:{type:'array',minItems:1,maxItems:1,items:{type:'object',additionalProperties:false,required:['id','kind','text','evidence'],properties:{
      id:{type:'string',minLength:1,maxLength:80},kind:{const:'paragraph'},text:{type:'string',minLength:1,maxLength:140,description:'One concise supporting sentence. Summarize the topic; do not repeat the full article or enumerate every feature.'},
      evidence:{type:'array',minItems:1,maxItems:32,items:{type:'object',additionalProperties:false,required:['sourceId'],properties:{sourceId:{type:'string',maxLength:160},quote:{type:'string',maxLength:2000}}}},
    }}},
  }};
  // The optional hero preserves compatibility with saved paragraph-only pools.
  // New requests can reference a real asset; missing assets retain native artwork.
  const coverWithHero={...coverSchema,properties:{...coverSchema.properties,blocks:{...coverSchema.properties.blocks,maxItems:2,
    description:'One supporting paragraph and, when imagery helps explain the topic, one image hero. Use an available asset ID or a missing image request; never invent a photo URL.',
    items:[coverSchema.properties.blocks.items,{type:'object',additionalProperties:false,required:['id','kind','sourceId','alt','treatment','status','evidence'],properties:{
      id:{type:'string',minLength:1,maxLength:80},kind:{const:'image'},sourceId:{type:'string',maxLength:160},
      alt:{type:'string',minLength:1,maxLength:300,description:'A concise description of the image subject, grounded in the article topic.'},
      treatment:{enum:['photograph','diagram','screenshot']},status:{enum:['available','missing']},assetId:{type:'string',maxLength:200},
      evidence:coverSchema.properties.blocks.items.properties.evidence,
    }}],
  }}};
  const illustrationSchema=JSON.parse(JSON.stringify(definition.parameterSchema));
  if(!cover){
    const primaryKind=kind==='summary'?'features':articleAccepts[kind][0];
    const blocks=illustrationSchema.properties.blocks;
    const primary=blocks.items.find((block:{properties:{kind:{const:string}}})=>block.properties.kind.const===primaryKind);
    blocks.items=[primary];blocks.minItems=1;blocks.maxItems=1;
    if(kind==='faq')primary.properties.entries.items.properties.title.pattern='^.+[?？]$';
  }
  const coverDirections=['An editorial document sculpture with layered planes and a strong headline.','A connected constellation with a single focal object and an editorial headline.','An architectural archive silhouette balanced against expressive editorial typography.'];
  return {...definition,...(cover?{parameterSchema:coverWithHero,capacity:{minEntries:0,maxEntries:0,requiresImage:false},semanticDescription:coverDirections[variant]}:{parameterSchema:illustrationSchema}),recipe:undefined,rendererKey:`article-${kind}:${variant}`,
    semanticDescription:compositionUseCase(id)+(cover?' '+coverDirections[variant]:'')};
}

/** Matches /dev/compositions/all: 161 default previews plus two landscape-only
 * reference entries. Output capabilities overlap and must never be summed.
 */
export const FORMAL_COMPOSITIONS:readonly FormalComposition[]=[
  ...campaignDefinitions.map(([id,accepts,min,max,image,landscape],index)=>define(semantic(`authored-reference-${id}`,accepts,min,max,image),landscape?['presentation']:both,`new-reference:${id}`,`N${index+1}`,landscape?1.4:.25)),
  define(semantic('authored-event-poster',['parameters','paragraph'],1,6),['social'],'event:provider','E1'),
  define(semantic('authored-image-triptych',['paragraph','features','image'],3,3,true),['social'],'campaign:triptych','C1',.5,2),
  ...FORMAL_REFERENCE_COMPOSITIONS.map(spec=>define(semantic(spec.id,spec.accepts,0,12,spec.accepts.includes('image')),both,`reference:${spec.id}`,`R${String(spec.reference).padStart(2,'0')}`)),
  ...SOCIAL_LAYOUT_CATALOG.map(preset=>{
    const recipe=DESIGN_RECIPES.find(item=>item.id===preset.id&&item.kind==='social')!;
    return {...define({...recipe,renderer:'catalog'},['social'],`social:${preset.id}`,SOCIAL_DISPLAY_NUMBERS[preset.id],.5,2.4),...nativeSocialParameterContract(preset.id)};
  }),
  ...uniqueSemantic.map(recipe=>define(recipe,semanticRecipes.filter(other=>other.id===recipe.id).map(other=>other.kind),`semantic:${recipe.kind}:${recipe.id}`,SEMANTIC_DISPLAY_NUMBERS[`semantic:${recipe.kind}:${recipe.id}`])),
  ...founderDefinitions.map(([id,accepts,min,max],index)=>define(semantic(id,accepts,min,max),['social'],`semantic:social:${id}`,`F${index+1}`,1.3)),
  ...[0,1,2].flatMap(variant=>[article(`article-cover-${variant}`,'cover',variant),...articleKinds.map(kind=>article(`article-${kind}-${variant}`,kind,variant))]),
  ...[3,4,5,6,7,8,9,10].map(variant=>article(`article-features-${variant}`,'features',variant)),
  article('article-process-3','process',3),
];

/** Only output, ratio, and explicit IDs are hard gates; semantic fit is scored. */
export function applicableCompositions(kind:CompositionKind,ratio:number,id?:string):FormalComposition[] {
  if(!Number.isFinite(ratio)||ratio<=0)throw new Error('COMPOSITION_INVALID_RATIO');
  if(id&&!FORMAL_COMPOSITIONS.some(item=>item.id===id))throw new Error('COMPOSITION_UNKNOWN_ID');
  return FORMAL_COMPOSITIONS.filter(item=>item.supportedKinds.includes(kind)&&ratio>=item.aspectRatios.min&&ratio<=item.aspectRatios.max&&(!id||item.id===id));
}
