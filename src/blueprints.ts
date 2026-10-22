import {validateComposition, type Composition} from './composition.js';

/** Portable AI-authored template. Applications own approval and visual checks. */
export interface Blueprint {
  version: 1;
  id: string;
  labels: Record<string,string>;
  fields: string[];
  ratios: number[];
  /** Optional semantic layout/scene IDs. Omit only for intentionally generic layouts. */
  intents?: string[];
  composition: Composition;
}
export function validateBlueprint(raw: unknown): Blueprint {
  const value=raw as Blueprint;
  if(!value || value.version!==1 || typeof value.id!=='string' || !/^[a-z][a-z0-9-]{0,79}$/.test(value.id)) throw new Error('Invalid blueprint identity');
  if(!value.labels || typeof value.labels!=='object' || Array.isArray(value.labels) || !value.labels.en) throw new Error('Missing blueprint labels');
  const labels:Record<string,string>={};
  for(const [locale,label] of Object.entries(value.labels)) {
    if(!/^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(locale) || typeof label!=='string' || !label.trim() || label.length>120) throw new Error('Invalid blueprint label');
    labels[locale]=label.trim();
  }
  if(!Array.isArray(value.fields) || !value.fields.length || value.fields.length>40 || new Set(value.fields).size!==value.fields.length || value.fields.some(field=>typeof field!=='string'|| !/^(title|headline|body|eyebrow|cta|value|attribution|items\.\d{1,2}\.(title|description))$/.test(field))) throw new Error('Invalid blueprint fields');
  if(!Array.isArray(value.ratios) || !value.ratios.length || value.ratios.length>16 || value.ratios.some(r=>!Number.isFinite(r)||r<.25||r>4)) throw new Error('Invalid blueprint ratios');
  if(value.intents!==undefined&&(!Array.isArray(value.intents)||!value.intents.length||value.intents.length>32||value.intents.some(intent=>typeof intent!=='string'||!/^[a-z][a-z0-9-]{0,79}$/.test(intent))))throw new Error('Invalid blueprint intents');
  return {version:1,id:value.id,labels,...(value.intents?{intents:[...new Set(value.intents)]}:{}),fields:[...value.fields],ratios:[...new Set(value.ratios)],composition:validateComposition(value.composition,Object.fromEntries(value.fields.map(field=>[field,'content'])))};
}
/** Register only after the application has approved representative rendered samples. */
export function createBlueprintRegistry() {
  const entries=new Map<string,Blueprint>();
  const copy=(entry:Blueprint)=>validateBlueprint(entry);
  return {
    register(raw:unknown) {
      const entry=validateBlueprint(raw);
      if(entries.has(entry.id))throw new Error('Blueprint already registered');
      entries.set(entry.id,entry);
      return ()=>{if(entries.get(entry.id)===entry)entries.delete(entry.id);};
    },
    list(){return [...entries.values()].map(copy);},
    find(fields:string[],ratio:number,intent?:string){
      return [...entries.values()].filter(entry=>(!entry.intents||(intent!==undefined&&entry.intents.includes(intent))) && entry.fields.length===fields.length && entry.fields.every(field=>fields.includes(field)) && entry.ratios.some(r=>Math.abs(r-ratio)<.001)).map(copy);
    },
  };
}
export function blueprintLabel(blueprint:Blueprint,locale:string):string {
  return blueprint.labels[locale]||blueprint.labels[locale.split('-')[0]]||blueprint.labels.en;
}
