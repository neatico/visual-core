import {compositionParameterDefaults} from './parameterDefaults.js';
import {textPresentationSchema,validateTextPresentations,type TextPresentation} from './textPresentation.js';
import {SOCIAL_LAYOUT_CATALOG} from './socialLayouts.js';
import type {ParameterSchema} from './recipeParameters.js';

/** Native slots keep renderer-specific content separate from semantic page projection. */
export interface NativeSocialParameters {
  textPresentation?:TextPresentation[];
  decorationEmoji?:string;
  title:string;
  body:string;
  eyebrow?:string;
  emphasis?:string[];
  titleLines?:string[];
  cta?:string;
  value?:string;
  attribution?:string;
  imageAssetId?:string;
  comparisonLabels?:[string,string];
  items?:{title:string;description:string;assetId?:string;illustration?:'document'|'collaboration'|'review'|'feedback'|'sequence'|'comparison'|'structure';primaryValue?:number;secondaryValue?:number}[];
}
export interface NativeSocialContract {
  parameterModel:'native-social';
  parameterSchema:ParameterSchema;
  importance:Readonly<Record<string,number>>;
  generationPolicy:Readonly<Record<string,readonly string[]>>;
}
interface Slots {items?:number;value?:boolean;attribution?:boolean;image?:boolean;itemImages?:boolean;quantities?:'share'|'comparison'|'benchmark'}
const slots:Record<string,Slots>={
 'note-question':{},'note-marker':{},'note-editorial':{},'note-checklist':{items:3},'note-photo':{image:true},'note-news':{value:true},
 'chat-messenger':{items:3},'chat-imessage':{items:3},'chat-telegram':{items:3},'chat-workplace':{items:3},
 'time-notice':{value:true},'news-focus':{},manifesto:{},launch:{image:true},bento:{items:3},spotlight:{items:3,value:true,image:true},
 ticket:{items:2,value:true},webinar:{value:true,image:true},quote:{attribution:true},testimonial:{attribution:true},metric:{value:true},
 report:{items:3},checklist:{items:3},steps:{items:3},comparison:{items:2},myth:{items:2},pricing:{items:3,value:true},offer:{value:true,image:true},
 editorial:{image:true},story:{image:true},hiring:{items:3},team:{items:3,itemImages:true},course:{items:3},'case-study':{items:3},notice:{},community:{value:true},
 menu:{items:3},specification:{items:3},itinerary:{items:3},schedule:{items:3},safety:{items:3},faq:{items:3},
 'split-bar-compare':{items:3,quantities:'comparison'},'benchmark-bars':{items:3,quantities:'benchmark'},'usage-breakdown':{items:3,quantities:'share'},
 organization:{items:3},'editorial-quote':{attribution:true},'research-highlight':{items:2},'product-showcase':{items:3,image:true},
};
const copy=(maxLength:number,description:string,minLength=1)=>({type:'string',minLength,maxLength,description});
const object=(properties:Record<string,unknown>)=>({type:'object',additionalProperties:false,properties,required:Object.keys(properties)});
const asset=()=>copy(160,'An existing supplied asset ID. Use neatico-editorial-placeholder when no matching source image exists.');
export const COMPOSITION_ILLUSTRATIONS=['document','collaboration','review','feedback','sequence','comparison','structure'] as const;
const illustratedSlots=new Set(['bento','course','case-study','report','product-showcase','comparison','research-highlight']);
const provenance=['user-fact','derived','creative','simulated'] as const;
// These authored slots have been measured with complete provider sentences at
// square, landscape, and portrait ratios. Compact labels keep their own limits.
const sentenceBodySlots=new Set(['note-question','note-marker','note-editorial','chat-imessage','chat-telegram','news-focus','manifesto','launch','spotlight','comparison','myth','editorial','story','notice']);
const supportingItemSlots=new Set(['team','course','specification','schedule','research-highlight']);

/** Every field corresponds to an authored visible slot; no scene-based eligibility filter. */
export function nativeSocialParameterContract(id:string):NativeSocialContract {
 const spec=slots[id];
 if(!spec||!SOCIAL_LAYOUT_CATALOG.some(item=>item.id===id))throw new Error('COMPOSITION_UNKNOWN_NATIVE_SOCIAL');
 const properties:Record<string,unknown>={title:copy(id==='note-question'?44:40,'Concise audience-facing headline.'),body:copy(id==='organization'?32:id==='case-study'?64:['quote','testimonial','editorial-quote'].includes(id)?140:sentenceBodySlots.has(id)?96:80,id==='organization'?'A short label for the parent or coordinating role; never invent a real person.':'One supporting sentence, or the quoted passage for a quote composition.')};
 if(!id.startsWith('chat-')&&!['note-photo','note-checklist'].includes(id))properties.eyebrow={...copy(20,'Optional concise section label. Use an empty string when no label improves the message.',0),default:''};
 if(!id.startsWith('chat-')&&!['note-photo','note-checklist'].includes(id))properties.cta={...copy(24,'Optional short call to action appropriate to the input. Use an empty string when this is purely informational.',0),default:''};
 if(['note-marker','note-editorial','note-question'].includes(id))properties.titleLines={type:'array',minItems:0,maxItems:4,default:[],items:copy(40,'One complete phrase from the title, preserving its original language.'),description:'Preferred title lines: one item for a single line, two to four for a multiline heading, or empty for automatic fitting. Concatenating the phrases must preserve the complete title and word boundaries. The renderer may reflow only when the requested lines cannot fit legibly.'};
 if(id==='note-marker')properties.emphasis={type:'array',minItems:0,maxItems:2,default:[],items:copy(40,'An exact contiguous phrase from title to highlight.'),description:'Choose one or two important exact title phrases. Empty means the renderer highlights the final title line.'};
 if(spec.value)properties.value=copy(24,'The focal quantity, price, time, or short value statement. Label fictional quantities as simulated.');
 if(spec.attribution)properties.attribution=copy(48,'Exact supplied attribution, or an empty string. Never invent an endorsement.',0);
 if(spec.image)properties.imageAssetId=asset();
 if(spec.items){
  const item:Record<string,unknown>={title:copy(id==='faq'?40:id==='case-study'?18:20,id==='faq'?'A concise audience question ending in a question mark.':'A short item label.'),description:copy(id==='faq'?64:spec.quantities||id==='case-study'?32:['comparison','myth'].includes(id)?80:supportingItemSlots.has(id)?48:40,'Concise supporting copy.',spec.quantities?0:1)};
  if(id==='faq')(item.title as Record<string,unknown>).pattern='^.+[?？]$';
  if(illustratedSlots.has(id))item.illustration={type:'string',enum:COMPOSITION_ILLUSTRATIONS,default:'structure',description:'An editable native illustration that explains this item. Choose document for material, review for checking, collaboration for people, feedback for revision, sequence for ordered actions, comparison for alternatives, or structure for organization. Never omit the visual slot.'};
  if(spec.itemImages)item.assetId=asset();
  if(spec.quantities){
   item.primaryValue={type:'number',minimum:0,maximum:100,description:spec.quantities==='comparison'?'A percentage from zero to one hundred. primaryValue plus secondaryValue must equal exactly 100 in this item.':'A percentage from zero to one hundred. Never encode numbers inside descriptive copy.'};
   if(spec.quantities!=='share')item.secondaryValue={type:'number',minimum:0,maximum:100,description:'The comparison or benchmark percentage.'};
   if(spec.quantities==='share')item.description={const:''};
  }
  properties.items={type:'array',minItems:spec.items,maxItems:spec.items,items:object(item),...(spec.quantities==='share'?{description:'Exactly three nonnegative percentage shares totaling at most one hundred.'}:{})};
 }
 if(spec.quantities==='comparison'||spec.quantities==='benchmark')properties.comparisonLabels={type:'array',minItems:2,maxItems:2,items:copy(20,'A supplied or explicitly illustrative series label.')};
 if(['note-question','note-marker','note-editorial'].includes(id))properties.decorationEmoji={type:'string',enum:['','✨','💡','🌱','💬','🎯','📚'],default:'',description:'Optional built-in decorative emoji for informal social notes. Choose one relevant symbol, or empty for the authored illustration. Never use it as factual evidence.'};
 properties.textPresentation=textPresentationSchema();
 const contentKeys=Object.keys(properties).filter(key=>!['textPresentation','decorationEmoji'].includes(key));
 const importance=Object.fromEntries(contentKeys.map(key=>[key,key==='title'?3:key==='items'?7:['eyebrow','cta'].includes(key)?.5:2]));
 return {parameterModel:'native-social',parameterSchema:object(properties),importance,generationPolicy:Object.fromEntries(contentKeys.map(key=>[key,provenance]))};
}

/** Apply the small closed schema vocabulary used by native slots on every local render. */
export function validateNativeSocialParameters(id:string,raw:unknown):NativeSocialParameters {
 const check=(value:unknown,schema:Record<string,unknown>):boolean=>{
  if(Object.hasOwn(schema,'const'))return value===schema.const;
  if(Array.isArray(schema.enum))return schema.enum.includes(value);
  if(schema.type==='string')return typeof value==='string'&&Array.from(value).length>=Number(schema.minLength||0)&&Array.from(value).length<=Number(schema.maxLength)&&(!schema.pattern||new RegExp(String(schema.pattern),'u').test(value));
  if(schema.type==='boolean')return typeof value==='boolean';
  if(schema.type==='number')return typeof value==='number'&&Number.isFinite(value)&&value>=Number(schema.minimum)&&value<=Number(schema.maximum);
  if(schema.type==='array')return Array.isArray(value)&&value.length>=Number(schema.minItems)&&value.length<=Number(schema.maxItems)&&value.every(item=>check(item,schema.items as Record<string,unknown>));
  if(schema.type==='object'){
   if(!value||typeof value!=='object'||Array.isArray(value))return false;
   const properties=schema.properties as Record<string,Record<string,unknown>>,object=value as Record<string,unknown>;
   return Object.keys(object).every(key=>Object.hasOwn(properties,key)&&check(object[key],properties[key]))&&(schema.required as string[]).every(key=>Object.hasOwn(object,key)&&check(object[key],properties[key]));
  }
  return false;
 };
 const schema=nativeSocialParameterContract(id).parameterSchema;
 raw=compositionParameterDefaults(schema,raw);
 if(!check(raw,schema))throw new Error('CANDIDATE_INVALID_PARAMETERS');
 const values=raw as NativeSocialParameters;
 validateTextPresentations(values.textPresentation,values as unknown as Record<string,unknown>);
 if(values.titleLines?.length){
  const normalize=(copy:string)=>copy.normalize('NFC').replace(/\s+/gu,' ').trim();
  const title=normalize(values.title);
  let cursor=0;
  for(const phrase of values.titleLines){
   const line=normalize(phrase),hadSpace=title[cursor]===' ';
   if(hadSpace)cursor++;
   // CJK phrases may meet without spaces, but Latin words cannot be split.
   const brokenWord=cursor>0&&!hadSpace&&/[\p{Script=Latin}\p{Mark}\d’'-]/u.test(title[cursor-1])&&/^[\p{Script=Latin}\p{Mark}\d’'-]/u.test(line);
   if(!line||brokenWord||!title.startsWith(line,cursor))throw new Error('CANDIDATE_INVALID_TITLE_LINES');
   cursor+=line.length;
  }
  if(cursor!==title.length)throw new Error('CANDIDATE_INVALID_TITLE_LINES');
 }
 if(values.emphasis?.some(phrase=>!values.title.includes(phrase)))throw new Error('CANDIDATE_INVALID_EMPHASIS');
 if(id==='usage-breakdown'&&values.items!.reduce((sum,item)=>sum+item.primaryValue!,0)>100.0001)throw new Error('CANDIDATE_INVALID_PERCENTAGES');
 if(id==='split-bar-compare'&&values.items!.some(item=>Math.abs(item.primaryValue!+item.secondaryValue!-100)>.001))throw new Error('CANDIDATE_INVALID_PERCENTAGES');
 return JSON.parse(JSON.stringify(values)) as NativeSocialParameters;
}

/** Numeric and image identities remain available when a native design becomes editable content. */
export function nativeSocialContentPage(values:NativeSocialParameters,original:import('./content.js').ContentPage):import('./content.js').ContentPage {
 const proof=original.evidence,blocks:import('./content.js').ContentBlock[]=[{id:'native-body',kind:'paragraph',text:values.body,evidence:proof}];
 if(values.items?.length)blocks.push({id:'native-items',kind:'features',evidence:proof,entries:values.items.map(item=>({title:item.title,...(item.illustration?{illustration:item.illustration}:{}),description:[item.description,...[item.primaryValue,item.secondaryValue].filter(value=>value!==undefined).map(value=>`${value}%`)].filter(Boolean).join(' · ')}))});
 for(const field of ['value','attribution','eyebrow','cta'] as const)if(values[field])blocks.push({id:`native-${field}`,kind:'paragraph',text:values[field]!,evidence:proof});
 if(values.comparisonLabels)blocks.push({id:'native-series',kind:'paragraph',evidence:proof,text:values.comparisonLabels.join(' / ')});
 const images=[values.imageAssetId,...(values.items||[]).map(item=>item.assetId)].filter((id):id is string=>!!id);
 for(const [index,assetId] of images.entries())blocks.push({id:`native-image-${index}`,kind:'image',evidence:[{sourceId:assetId}],sourceId:assetId,assetId,alt:values.title,treatment:assetId==='neatico-editorial-placeholder'?'diagram':'photograph',status:'available'});
 return {...original,title:values.title,blocks};
}
