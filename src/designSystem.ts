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
const accepted=(family:string):SemanticKind[]=>({code:['code'],comparison:['comparison'],steps:['steps'],chart:['chart'],quote:['quote'],parameters:['parameters'],image:['image'],hero:['paragraph'],features:['features','paragraph']} as Record<string,SemanticKind[]>)[family];
const recipe=(id:string,kind:DesignRecipe['kind'],semantic?:string):DesignRecipe=>{
 const group=family(id,semantic);
 return {id,kind,renderer:'catalog',family:group,accepts:accepted(group),minEntries:group==='comparison'?2:0,maxEntries:group==='hero'?0:kind==='presentation'?4:6,requiresImage:group==='image'};
};
/** Existing authored catalogs remain first-class candidates, rather than being discarded. */
export const DESIGN_RECIPES:readonly DesignRecipe[]=[
 ...PRESENTATION_LAYOUT_IDS.map(id=>recipe(id,'presentation')),
 ...SOCIAL_LAYOUT_CATALOG.map(item=>recipe(item.id,'social',item.scene)),
 ...(['presentation','social'] as const).flatMap(kind=>[
  ...(['code','parameters','steps','comparison','features','quote','chart','hero'] as const).flatMap(group=>['split','stack','editorial'].map(variant=>({id:`semantic-${group}-${variant}`,kind,renderer:'semantic' as const,family:`${group}-${variant}`,accepts:accepted(group),minEntries:0,maxEntries:20,requiresImage:false}))),
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
 const candidates=DESIGN_RECIPES.filter(r=>r.kind===context.kind&&!exclude.has(r.id)&&count>=r.minEntries&&count<=r.maxEntries&&(!r.requiresImage||available)&&kinds.every(k=>r.accepts.includes(k))&&!(r.renderer==='catalog'&&(primary.length>1||characters>1000)));
 const score=(r:DesignRecipe)=>{
   const repeats=(context.previousFamilies||[]).filter(f=>f===r.family).length;
   const intent=page.purpose==='cover'||page.purpose==='conclude'?r.family.startsWith('hero'):page.purpose==='instruct'?r.family.startsWith('steps')||r.family.startsWith('code'):true;
   return (intent?30:0)+(r.renderer==='catalog'?8:0)-(r.id.includes('mixed')?20:0)-repeats*18+(context.ratio<1&&r.id.endsWith('stack')?6:0);
 };
 return candidates.map((r,index)=>({r,index,score:score(r)})).sort((a,b)=>b.score-a.score||a.index-b.index).slice(0,Math.max(1,Math.min(32,context.limit??12))).map(e=>e.r);
}

export interface GeometryItem {role:string;x:number;y:number;width:number;height:number}
/** Ignores color, copy and generated IDs; previews that only recolor are the same composition. */
export function structureFingerprint(items:readonly GeometryItem[],width:number,height:number):string {
 if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)throw new Error('INVALID_CANVAS');
 return items.map(item=>[item.role,...[item.x/width,item.y/height,item.width/width,item.height/height].map(v=>Math.round(v*24))].join(':')).sort().join('|');
}
