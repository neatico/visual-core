import {SOCIAL_LAYOUT_CATALOG} from './socialLayouts.js';
export interface LayoutContract {id:string;kind:'presentation'|'social';semantic:string;minItems:number;maxItems:number;minRatio:number;maxRatio:number;required:readonly string[];}
const textOnly=new Set(['cover','section','statement','quote','closing','image-full','og-cover','gradient-cover','bold-diagonal-cover','split-cover','block-banner','video-cover','magazine-pull-quote']);
const pair=new Set(['comparison','two-column','myth','problem-solution','before-after','split-bar-compare']);
/** Eligibility is a first filter, never a substitute for measured fit. */
export const LAYOUT_CONTRACTS:readonly LayoutContract[]=[
 ...SOCIAL_LAYOUT_CATALOG.map(({id,scene})=>({id,kind:'social' as const,semantic:scene,minItems:pair.has(id)?2:0,maxItems:textOnly.has(id)?0:pair.has(id)?2:6,minRatio:.25,maxRatio:4,required:['headline',...(['pricing','metric'].includes(scene)?['value']:[])]})),
];
export function eligibleLayouts(kind:LayoutContract['kind'],content:Record<string,unknown>,ratio:number):LayoutContract[]{
 const count=Array.isArray(content.items)?content.items.length:0;
 return LAYOUT_CONTRACTS.filter(layout=>layout.kind===kind&&ratio>=layout.minRatio-1e-6&&ratio<=layout.maxRatio+1e-6&&count>=layout.minItems&&count<=layout.maxItems&&layout.required.every(key=>typeof content[key]==='string'&&String(content[key]).trim()));
}
/** Requested intent, same semantic scene, then general-purpose structures. */
export function layoutCandidates(kind:LayoutContract['kind'],requested:string,content:Record<string,unknown>,ratio:number,limit=8):string[]{
 const eligible=eligibleLayouts(kind,content,ratio);
 const selected=LAYOUT_CONTRACTS.find(layout=>layout.kind===kind&&layout.id===requested);
 const fallback=kind==='presentation'?['cards','two-column','bullets','table','agenda','statement']:['report','checklist','steps','bento','editorial','story'];
 const order=[requested,...eligible.filter(layout=>layout.semantic===(content.scene||selected?.semantic)).map(layout=>layout.id),...fallback];
 const allowed=new Set(eligible.map(layout=>layout.id));
 return [...new Set(order)].filter(id=>allowed.has(id)).slice(0,Math.max(1,Math.min(16,limit)));
}
