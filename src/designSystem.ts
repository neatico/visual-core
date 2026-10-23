import {AUTHORED_COMPOSITIONS,sceneRecipePreference} from './compositionScenes.js';
import {PRESENTATION_LAYOUT_IDS} from './layouts.js';
import {SOCIAL_LAYOUT_CATALOG} from './socialLayouts.js';
import {contentBlockText,type ContentPage,type SemanticKind} from './content.js';

export interface DesignTheme {
  id:string; palette:{background:string;surface:string;ink:string;muted:string;accent:string;line:string};
  typography:{heading:string;body:string;code:string;headingWeight:number};
  geometry:{radius:number;spacing:number;rule:'none'|'hairline'|'accent'};
}
/** Complete, deterministic token sets; decorative geometry belongs to individual compositions. */
export const DESIGN_THEMES:readonly DesignTheme[]=[
 {id:'studio',palette:{background:'#F5F3EE',surface:'#FFFFFF',ink:'#20251F',muted:'#5F685C',accent:'#376346',line:'#D7DED3'},typography:{heading:'Inter',body:'Inter',code:'monospace',headingWeight:700},geometry:{radius:4,spacing:1,rule:'hairline'}},
 {id:'ink',palette:{background:'#121B29',surface:'#1D2B3E',ink:'#F5F7FB',muted:'#B3C2D6',accent:'#85C8F3',line:'#3D526C'},typography:{heading:'Inter',body:'Inter',code:'monospace',headingWeight:700},geometry:{radius:12,spacing:1,rule:'accent'}},
 {id:'editorial',palette:{background:'#FCF8F1',surface:'#FFFFFF',ink:'#30281F',muted:'#756657',accent:'#A74328',line:'#DED2C1'},typography:{heading:'Georgia',body:'Inter',code:'monospace',headingWeight:700},geometry:{radius:0,spacing:1.1,rule:'hairline'}},
 {id:'electric',palette:{background:'#F3F4FF',surface:'#FFFFFF',ink:'#222047',muted:'#615D7B',accent:'#5340D9',line:'#DAD5F2'},typography:{heading:'Inter',body:'Inter',code:'monospace',headingWeight:800},geometry:{radius:16,spacing:1,rule:'none'}},
 {id:'signal',palette:{background:'#FFE04B',surface:'#FFF5B7',ink:'#242418',muted:'#535039',accent:'#272B21',line:'#B8A233'},typography:{heading:'Inter',body:'Inter',code:'monospace',headingWeight:800},geometry:{radius:2,spacing:1.05,rule:'none'}},
];
export function designTheme(id:string):DesignTheme {
 const alias:Record<string,string>={neatico:'electric',paper:'studio',midnight:'ink',ocean:'ink',plum:'electric'};
 return DESIGN_THEMES.find(theme=>theme.id===(alias[id]||id))||DESIGN_THEMES[0];
}
export interface DesignRecipe {
 id:string; renderer:'catalog'|'semantic'; kind:'presentation'|'social'; family:string;
 accepts:readonly SemanticKind[]; minEntries:number; maxEntries:number; requiresImage:boolean;
 /** Unmodelled domain-specific catalogs remain manual-only until their required evidence is expressible. */
 automatic?:boolean;
}
const family=(id:string,semantic?:string)=>{
 if(/code|terminal/.test(id))return 'code';
 if(/comparison|compare|before-after|myth|problem-solution/.test(id))return 'comparison';
 if(/process|steps|timeline|roadmap|journey|syllabus|workflow/.test(id))return 'steps';
 if(/chart|metric|stat|score|usage-breakdown/.test(id))return 'chart';
 if(/quote/.test(id))return 'quote';
 if(/table|specification/.test(id))return 'parameters';
 if(/image|photo|gallery/.test(id))return 'image';
 if(/cover|hero|banner|statement|closing|section/.test(id))return 'hero';
 if(semantic==='steps')return 'steps';if(semantic==='comparison')return 'comparison';
 return 'features';
};
const accepted=(family:string):SemanticKind[]=>({code:['code'],comparison:['comparison'],steps:['steps'],chart:['chart'],quote:['quote'],parameters:['parameters'],image:['image'],hero:['paragraph'],prose:['paragraph'],features:['features','paragraph']} as Record<string,SemanticKind[]>)[family];
// Explicit semantic contracts, not name/scene guesses. A travel itinerary, calendar,
// price promotion or fake UI cannot be inferred from an arbitrary paragraph.
const socialContracts:Record<string,readonly SemanticKind[]>={
 'news-focus':['paragraph'],manifesto:['paragraph'],editorial:['paragraph'],notice:['paragraph'],
 'block-banner':['paragraph'],'definition-card':['paragraph'],'concept-explainer':['paragraph'],
 'og-cover':['paragraph'],'gradient-cover':['paragraph'],'bold-diagonal-cover':['paragraph'],'split-cover':['paragraph'],
 'article-summary-card':['paragraph'],'paragraph-summary-card':['paragraph'],
 bento:['features'],spotlight:['features'],report:['features'],checklist:['features'],
 'contents-index':['features'],'contents-grid':['features'],'tips-card':['features'],
 'digest-card':['features'],'tips-grid':['features'],'feature-chip-hero':['features'],
 steps:['steps'],'contents-chapters':['steps'],'illustration-process':['steps'],
 comparison:['comparison'],'before-after':['comparison'],
 'code-snippet':['code'],specification:['parameters'],
 quote:['quote'],'editorial-quote':['quote'],'magazine-pull-quote':['quote'],
};
// Automatic presentation matching requires an explicit semantic contract too.
// A feature paragraph must never become a price plan, employee or risk entry.
const presentationContracts:Record<string,readonly SemanticKind[]>={
 cover:['paragraph'],section:['paragraph'],statement:['paragraph'],closing:['paragraph'],
 agenda:['features'],bullets:['features'],'two-column':['features'],
 'three-column':['features'],cards:['features'],checklist:['features'],
 process:['steps'],timeline:['steps'],roadmap:['steps'],'progress-roadmap':['steps'],
 comparison:['comparison'],'before-after':['comparison'],'problem-solution':['comparison'],
 metrics:['chart'],'bar-chart':['chart'],'usage-breakdown':['chart'],
 quote:['quote'],'editorial-quote':['quote'],'magazine-pull-quote':['quote'],
 table:['parameters'],specification:['parameters'],'code-snippet':['code'],
 'image-left':['image'],'image-right':['image'],'image-full':['image'],
 'product-showcase':['image'],
};
const recipe=(id:string,kind:DesignRecipe['kind'],semantic?:string):DesignRecipe=>{
 const contract=(kind==='social'?socialContracts:presentationContracts)[id];
 const group:string=contract?.[0] || family(id,semantic);
 return {id,kind,renderer:'catalog',automatic:Boolean(contract),family:group,accepts:contract||accepted(group),minEntries:group==='comparison'?2:kind==='social'&&(group==='features'||group==='steps'||group==='parameters')?1:0,maxEntries:group==='hero'?0:kind==='presentation'?4:6,requiresImage:group==='image'};
};
/** Existing authored catalogs remain first-class candidates, rather than being discarded. */
export const DESIGN_RECIPES:readonly DesignRecipe[]=[
 ...['cover','closing'].flatMap(role=>['editorial','panel','split'].map(style=>({id:`bookend-${role}-${style}`,kind:'presentation' as const,renderer:'semantic' as const,family:`${role}-${style}`,accepts:['paragraph'] as SemanticKind[],minEntries:0,maxEntries:0,requiresImage:false}))),
 ...(['presentation','social'] as const).map(kind=>({id:'brand-collection-grid',kind,renderer:'semantic' as const,family:'brand-collection',accepts:['features'] as SemanticKind[],minEntries:2,maxEntries:12,requiresImage:false})),
 ...PRESENTATION_LAYOUT_IDS.map(id=>recipe(id,'presentation')),
 ...SOCIAL_LAYOUT_CATALOG.map(item=>recipe(item.id,'social',item.scene)),
 ...(['presentation','social'] as const).flatMap(kind=>[
  ...['banner','split','editorial','campaign','inset'].map(style=>({id:`authored-image-${style}`,kind,renderer:'semantic' as const,family:`image-${style}`,accepts:['image'] as SemanticKind[],minEntries:0,maxEntries:0,requiresImage:true})),
  {id:'authored-prose-inset',kind,renderer:'semantic' as const,family:'prose-inset',accepts:['paragraph'] as SemanticKind[],minEntries:0,maxEntries:0,requiresImage:false},
  ...AUTHORED_COMPOSITIONS.map(composition=>({id:`authored-${composition.id}`,kind,renderer:'semantic' as const,family:composition.id,accepts:[composition.kind],minEntries:composition.min,maxEntries:composition.max,requiresImage:false})),
  ...(['code','parameters','steps','comparison','features','quote','chart','hero','prose'] as const).flatMap(group=>['split','stack','editorial'].map(variant=>({id:`semantic-${group}-${variant}`,kind,renderer:'semantic' as const,family:`${group}-${variant}`,accepts:accepted(group),minEntries:0,maxEntries:20,requiresImage:false}))),
  {id:'semantic-mixed-stack',kind,renderer:'semantic' as const,family:'mixed-stack',accepts:['paragraph','steps','features','comparison','code','parameters','quote','chart','image'] as SemanticKind[],minEntries:0,maxEntries:20,requiresImage:false},
 ]),
];
export function pageEntryCount(page:ContentPage):number {
 return page.blocks.reduce((sum,block)=>sum+(block.kind==='steps'||block.kind==='features'?block.entries.length:block.kind==='comparison'?block.columns.length:block.kind==='parameters'?block.rows.length:block.kind==='chart'?block.values.length:0),0);
}
export interface CandidateContext { kind:DesignRecipe['kind']; ratio:number; previousFamilies?:readonly string[]; excluded?:readonly string[]; limit?:number }
export function designCandidates(page:ContentPage,context:CandidateContext):DesignRecipe[] {
 if(!Number.isFinite(context.ratio)||context.ratio<.25||context.ratio>4)return [];
 const primary=page.blocks.filter(b=>b.kind!=='paragraph'&&!(b.kind==='image'&&b.status==='missing'));
 const kinds=[...new Set((primary.length?primary:page.blocks.filter(b=>b.kind!=='image')).map(b=>b.kind))];
 const count=pageEntryCount(page),characters=page.blocks.flatMap(contentBlockText).join('').length;
 const available=page.blocks.some(b=>b.kind==='image'&&b.status==='available');
 const exclude=new Set(context.excluded||[]);
 const candidates=DESIGN_RECIPES.filter(r=>r.kind===context.kind&&r.automatic!==false&&(!(r.family.startsWith('hero')&&page.purpose!=='cover'&&page.purpose!=='conclude'&&characters>120))&&(!r.id.startsWith('bookend-')||(page.purpose==='cover'?r.id.startsWith('bookend-cover-'):page.purpose==='conclude'&&r.id.startsWith('bookend-closing-')))&&(r.id!=='brand-collection-grid'||page.scene==='brand-collection')&&!exclude.has(r.id)&&count>=r.minEntries&&count<=r.maxEntries&&(!r.requiresImage||available)&&kinds.every(k=>r.accepts.includes(k))&&!(r.renderer==='catalog'&&(primary.length>1||characters>1000)));
 const score=(r:DesignRecipe)=>{
   const repeats=(context.previousFamilies||[]).filter(f=>f===r.family).length;
   const intent=page.purpose==='cover'||page.purpose==='conclude'?r.family.startsWith('hero'):page.purpose==='instruct'?r.family.startsWith('steps')||r.family.startsWith('code'):true;
   return (r.id.startsWith('bookend-')?80:0)+(page.scene==='brand-collection'&&r.id==='brand-collection-grid'?80:0)+sceneRecipePreference(page.scene,r.id)+(intent?30:0)+(r.renderer==='catalog'?8:0)-(r.id.includes('mixed')?20:0)-repeats*18+(context.ratio<1&&r.id.endsWith('stack')?6:0);
 };
 const ranked=candidates.map((r,index)=>({r,index,score:score(r)})).sort((a,b)=>b.score-a.score||a.index-b.index).map(e=>e.r);
 const limit=Math.max(1,Math.min(32,context.limit??12));
 // Catalog size must not prevent semantic renderers from reaching measurement.
 const semantic=ranked.filter(r=>r.renderer==='semantic').slice(0,Math.min(8,Math.ceil(limit/2)));
 const reserved=new Set(semantic.map(r=>r.id));
 const selected=new Set([...semantic,...ranked.filter(r=>!reserved.has(r.id)).slice(0,limit-semantic.length)].map(r=>r.id));
 return ranked.filter(r=>selected.has(r.id));
}

export interface GeometryItem {role:string;x:number;y:number;width:number;height:number}
/** Ignores color, copy and generated IDs; previews that only recolor are the same composition. */
export function structureFingerprint(items:readonly GeometryItem[],width:number,height:number):string {
 if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)throw new Error('INVALID_CANVAS');
 return items.map(item=>[item.role,...[item.x/width,item.y/height,item.width/width,item.height/height].map(v=>Math.round(v*24))].join(':')).sort().join('|');
}
