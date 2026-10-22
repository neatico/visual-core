import {contentBlockText,type ContentPage,type SemanticKind} from './content.js';
export interface DesignBlueprint {
 version:2;id:string;labels:Record<string,string>;kinds:SemanticKind[];ratios:number[];
 capacity:{maxCharacters:number;maxEntries:number;maxBlocks:number};
 layout:{mode:'stack'|'split'|'editorial';margin:number;gap:number;titleScale:number;bodyScale:number;columns:number;surface:'none'|'panels'|'bands';accent:'none'|'rail'|'rule'};
}
export const DESIGN_SAMPLE_LOCALES=['en-US','zh-CH','ja-JP','de-DE','fr-FR','es-ES','pt-PT'] as const;
export function validateDesignBlueprint(raw:unknown):DesignBlueprint {
 const v=raw as DesignBlueprint;if(!v||v.version!==2||typeof v.id!=='string'||!/^[a-z][a-z0-9-]{0,79}$/.test(v.id))throw new Error('DESIGN_BLUEPRINT_ID');
 const kinds:SemanticKind[]=['paragraph','steps','features','comparison','code','parameters','quote','chart','image'];
 if(!Array.isArray(v.kinds)||!v.kinds.length||v.kinds.length>9||v.kinds.some(k=>!kinds.includes(k)))throw new Error('DESIGN_BLUEPRINT_KINDS');
 if(!v.labels||typeof v.labels!=='object'||Array.isArray(v.labels)||typeof v.labels.en!=='string'||!v.labels.en.trim()||Object.entries(v.labels).some(([key,value])=>!/^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(key)||typeof value!=='string'||!value.trim()||value.length>120))throw new Error('DESIGN_BLUEPRINT_LABELS');
 if(!Array.isArray(v.ratios)||!v.ratios.length||v.ratios.length>8||v.ratios.some(n=>!Number.isFinite(n)||n<.25||n>4))throw new Error('DESIGN_BLUEPRINT_RATIOS');
 const number=(n:unknown,min:number,max:number)=>{if(typeof n!=='number'||!Number.isFinite(n)||n<min||n>max)throw new Error('DESIGN_BLUEPRINT_RANGE');return n;};
 const c=v.capacity,l=v.layout;if(!c||!l)throw new Error('DESIGN_BLUEPRINT_MISSING');
 if(!['stack','split','editorial'].includes(l.mode)||!['none','panels','bands'].includes(l.surface)||!['none','rail','rule'].includes(l.accent))throw new Error('DESIGN_BLUEPRINT_LAYOUT');
 const maxEntries=number(c.maxEntries,1,20),maxBlocks=number(c.maxBlocks,1,8),columns=number(l.columns,1,4);if(![maxEntries,maxBlocks,columns].every(Number.isInteger))throw new Error('DESIGN_BLUEPRINT_INTEGER');
 return {version:2,id:v.id,labels:{...v.labels},kinds:[...new Set(v.kinds)],ratios:[...new Set(v.ratios)],capacity:{maxCharacters:number(c.maxCharacters,40,20000),maxEntries,maxBlocks},layout:{mode:l.mode,margin:number(l.margin,32,80),gap:number(l.gap,12,40),titleScale:number(l.titleScale,.8,1.15),bodyScale:number(l.bodyScale,.9,1.15),columns,surface:l.surface,accent:l.accent}};
}
export function blueprintFitsContent(blueprint:DesignBlueprint,page:ContentPage,ratio:number):boolean {
 const entries=page.blocks.reduce((sum,b)=>sum+('entries'in b?b.entries.length:'columns'in b?b.columns.length:'rows'in b?b.rows.length:'values'in b?b.values.length:0),0);
 return blueprint.ratios.some(r=>Math.abs(r-ratio)<.001)&&page.blocks.length<=blueprint.capacity.maxBlocks&&page.blocks.every(b=>blueprint.kinds.includes(b.kind))&&page.blocks.flatMap(contentBlockText).join('').length<=blueprint.capacity.maxCharacters&&entries<=blueprint.capacity.maxEntries;
}
