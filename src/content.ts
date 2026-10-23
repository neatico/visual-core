import {COMPOSITION_SCENES} from './compositionScenes.js';
/** Source-backed content, independent of layout and editor primitives. */
export type SourceKind = 'text' | 'code' | 'image-reference';
export interface SourceSegment { id: string; kind: SourceKind; text: string; start: number; end: number; language?: string }
export interface SourceDocument { version: 1; text: string; segments: SourceSegment[] }
export interface Evidence { sourceId: string; quote?: string }
export type SemanticKind = 'paragraph' | 'steps' | 'features' | 'comparison' | 'code' | 'parameters' | 'quote' | 'chart' | 'image';
interface BlockBase { id: string; evidence: Evidence[] }
export type ContentBlock = BlockBase & (
  | { kind:'paragraph'; text:string }
  | { kind:'steps'|'features'; entries:{title:string;description:string}[] }
  | { kind:'comparison'; columns:{title:string;points:string[]}[] }
  | { kind:'code'; sourceId:string; language:string; code:string }
  | { kind:'parameters'; rows:{name:string;value:string;description:string}[] }
  | { kind:'quote'; text:string; attribution:string }
  | { kind:'chart'; chart:'bar'|'line'; unit:string; values:{label:string;value:number}[] }
  | { kind:'image'; sourceId:string; alt:string; treatment:'screenshot'|'photograph'|'diagram'; status:'missing'|'available'; assetId?:string }
);
export interface ContentPage {
  id:string; title:string; purpose:'cover'|'explain'|'instruct'|'compare'|'evidence'|'conclude';
  evidence:Evidence[]; blocks:ContentBlock[]; caption?:string; notes?:string; scene?:string;
}
export interface ContentPlan { version:1; kind:'presentation'|'social'; title:string; pages:ContentPage[] }
export class ContentContractError extends Error {
  constructor(public readonly code:string, public readonly path:string) { super(`${code}: ${path}`); }
}
const fail=(code:string,path:string):never=>{throw new ContentContractError(code,path);};
const sceneField=(value:unknown,path:string):{scene?:string}=>{if(value===undefined)return {};if(typeof value!=='string'||!COMPOSITION_SCENES.some(scene=>scene.id===value))return fail('CONTENT_INVALID_SCENE',path);return {scene:value};};
const object=(raw:unknown,path:string):Record<string,unknown>=>{
  if(!raw||typeof raw!=='object'||Array.isArray(raw))return fail('CONTENT_INVALID_OBJECT',path);
  return raw as Record<string,unknown>;
};
const text=(raw:unknown,path:string,max=1000,empty=false):string=>{
  if(typeof raw!=='string'||raw.length>max||(!empty&&!raw.trim()))return fail('CONTENT_INVALID_TEXT',path);
  return raw;
};
const list=(raw:unknown,path:string,min:number,max:number):unknown[]=>{
  if(!Array.isArray(raw)||raw.length<min||raw.length>max)return fail('CONTENT_INVALID_LIST',path);
  return raw;
};
const identity=(raw:unknown,path:string)=>{
  const id=text(raw,path,80);if(!/^[a-z][a-z0-9-]*$/.test(id))fail('CONTENT_INVALID_ID',path);return id;
};

/** Lossless ranges. File-name placeholders are references, never fabricated assets. */
export function parseSource(input:string):SourceDocument {
  if(typeof input!=='string'||!input.trim()||input.length>20000)fail('SOURCE_INVALID_LENGTH','source');
  const segments:SourceSegment[]=[];
  const lines=[...input.matchAll(/[^\n]*(?:\n|$)/g)].filter(match=>match[0].length);
  for(let i=0;i<lines.length;i++){
    const line=lines[i],raw=line[0],trimmed=raw.trim();
    if(!trimmed)continue;
    let start=line.index!,end=start+raw.replace(/\r?\n$/,'').length,kind:SourceKind='text',language:string|undefined;
    const fence=trimmed.match(/^(`{3,}|~{3,})([\w+-]*)\s*$/);
    if(fence){
      kind='code';language=fence[2]||'text';start=line.index!+raw.length;
      let j=i+1;
      for(;j<lines.length;j++)if(lines[j][0].trim()===fence[1])break;
      end=j<lines.length?lines[j].index!:input.length;
      if(input.slice(start,end).endsWith('\n'))end--;
      if(input.slice(start,end).endsWith('\r'))end--;
      i=j<lines.length?j:lines.length-1;
    }else if(/^curl(?:\s|$)/i.test(trimmed)){
      kind='code';language='bash';
      // Track multiline quoted arguments and escaped physical newlines without executing code.
      let quote='',escaped=false,j=i;
      for(;j<lines.length;j++){
        const current=lines[j][0];
        for(const char of current){
          if(escaped){escaped=false;continue;}
          if(char==='\\'&&quote!=="'"){escaped=true;continue;}
          if(quote){if(char===quote)quote='';}
          else if(char==='"'||char==="'")quote=char;
        }
        end=lines[j].index!+current.replace(/\r?\n$/,'').length;
        if(!quote&&!/\\\s*(?:\r?\n)?$/.test(current))break;
        escaped=false;
      }
      i=Math.min(j,lines.length-1);
    }else if(/^(?:!\[[^\]]*\]\([^\n]+\)|[^\s<>]+\.(?:png|jpe?g|webp|gif|svg))$/i.test(trimmed))kind='image-reference';
    if(end>start)segments.push({id:`source-${segments.length+1}`,kind,text:input.slice(start,end),start,end,...(language?{language}:{})});
  }
  if(segments.length>800)fail('SOURCE_TOO_MANY_SEGMENTS','source');
  return {version:1,text:input,segments};
}

/** Validate untrusted AI output; strip unknown properties and never trust generated code or asset URLs. */
export function validateContentPlan(raw:unknown,source:SourceDocument,expectedKind?:ContentPlan['kind']):ContentPlan {
  const root=object(raw,'plan');
  if(root.version!==1||!['presentation','social'].includes(String(root.kind))||(expectedKind&&root.kind!==expectedKind))fail('CONTENT_INVALID_VERSION','plan');
  const sources=new Map(source.segments.map(segment=>[segment.id,segment]));
  const evidence=(raw:unknown,path:string):Evidence[]=>list(raw,path,1,32).map((entry,index)=>{
    const item=object(entry,`${path}.${index}`),sourceId=text(item.sourceId,`${path}.${index}.sourceId`,80);
    const segment=sources.get(sourceId);if(!segment)fail('CONTENT_UNKNOWN_SOURCE',path);
    const quote=item.quote===undefined?undefined:text(item.quote,`${path}.${index}.quote`,20000);
    if(quote&&!segment!.text.includes(quote))fail('CONTENT_UNSUPPORTED_QUOTE',path);
    return {sourceId,...(quote?{quote}:{})};
  });
  const ids=new Set<string>();
  const unique=(raw:unknown,path:string)=>{const id=identity(raw,path);if(ids.has(id))fail('CONTENT_DUPLICATE_ID',path);ids.add(id);return id;};
  const block=(raw:unknown,path:string):ContentBlock=>{
    const value=object(raw,path),base={id:unique(value.id,`${path}.id`),evidence:evidence(value.evidence,`${path}.evidence`)};
    const field=(key:string,max=1000,empty=false)=>text(value[key],`${path}.${key}`,max,empty);
    switch(value.kind){
      case 'paragraph':return {...base,kind:'paragraph',text:field('text',1600)};
      case 'steps':case 'features':return {...base,kind:value.kind,entries:list(value.entries,`${path}.entries`,1,12).map((raw,i)=>{const item=object(raw,`${path}.entries.${i}`);return {title:text(item.title,path,160),description:text(item.description,path,600,true)};})};
      case 'comparison':return {...base,kind:'comparison',columns:list(value.columns,`${path}.columns`,2,4).map(raw=>{const col=object(raw,path);return {title:text(col.title,path,160),points:list(col.points,path,1,8).map(raw=>text(raw,path,500))};})};
      case 'code':{
        const sourceId=field('sourceId',80),segment=sources.get(sourceId);
        if(segment?.kind!=='code'||!base.evidence.some(e=>e.sourceId===sourceId))return fail('CONTENT_INVALID_CODE_SOURCE',path);
        if(value.code!==undefined&&value.code!==segment.text)fail('CONTENT_CODE_CHANGED',path);
        return {...base,kind:'code',sourceId,language:segment.language||'text',code:segment.text};
      }
      case 'parameters':return {...base,kind:'parameters',rows:list(value.rows,`${path}.rows`,1,20).map(raw=>{const row=object(raw,path);return {name:text(row.name,path,160),value:text(row.value,path,1000,true),description:text(row.description,path,500,true)};})};
      case 'quote':{
        const copy=field('text',1600);if(!base.evidence.some(e=>sources.get(e.sourceId)!.text.includes(copy)))fail('CONTENT_UNSUPPORTED_QUOTE',path);
        const attribution=field('attribution',160,true);if(attribution&&!base.evidence.some(e=>sources.get(e.sourceId)!.text.includes(attribution)))fail('CONTENT_UNSUPPORTED_ATTRIBUTION',path);
        return {...base,kind:'quote',text:copy,attribution};
      }
      case 'chart':{
        if(!['bar','line'].includes(String(value.chart)))fail('CONTENT_INVALID_CHART',path);
        const proof=base.evidence.map(e=>sources.get(e.sourceId)!.text).join('\n');
        const unit=field('unit',60,true);if(unit&&!proof.includes(unit))fail('CONTENT_UNSUPPORTED_UNIT',path);
        const numbers=new Set(proof.match(/-?\d+(?:\.\d+)?/g)?.map(Number)||[]);
        return {...base,kind:'chart',chart:value.chart as 'bar'|'line',unit,values:list(value.values,path,2,12).map(raw=>{const entry=object(raw,path);if(typeof entry.value!=='number'||!Number.isFinite(entry.value)||!numbers.has(entry.value))fail('CONTENT_UNSUPPORTED_VALUE',path);const label=text(entry.label,path,100);if(!proof.includes(label))fail('CONTENT_UNSUPPORTED_LABEL',path);return {label,value:entry.value as number};})};
      }
      case 'image':{
        const sourceId=field('sourceId',80),segment=sources.get(sourceId);
        if(segment?.kind!=='image-reference'||!base.evidence.some(e=>e.sourceId===sourceId))return fail('CONTENT_INVALID_IMAGE_SOURCE',path);
        if(!['screenshot','photograph','diagram'].includes(String(value.treatment)))fail('CONTENT_INVALID_IMAGE_TREATMENT',path);
        // Availability is resolved from the authenticated asset store later, never asserted by the model.
        return {...base,kind:'image',sourceId,alt:field('alt',300,true),treatment:value.treatment as 'screenshot'|'photograph'|'diagram',status:'missing'};
      }
      default:return fail('CONTENT_UNKNOWN_BLOCK',path);
    }
  };
  const pages=list(root.pages,'pages',1,root.kind==='social'?8:24).map((raw,index):ContentPage=>{
    const path=`pages.${index}`,page=object(raw,path);
    if(!['cover','explain','instruct','compare','evidence','conclude'].includes(String(page.purpose)))fail('CONTENT_INVALID_PURPOSE',path);
    return {...sceneField(page.scene,`${path}.scene`),id:unique(page.id,`${path}.id`),title:text(page.title,`${path}.title`,160),purpose:page.purpose as ContentPage['purpose'],evidence:evidence(page.evidence,`${path}.evidence`),blocks:list(page.blocks,`${path}.blocks`,1,8).map((value,i)=>block(value,`${path}.blocks.${i}`)),...(page.caption!==undefined?{caption:text(page.caption,`${path}.caption`,2000,true)}:{}),...(page.notes!==undefined?{notes:text(page.notes,`${path}.notes`,2000,true)}:{})};
  });
  if(root.kind==='presentation')for(const segment of source.segments.filter(s=>s.kind==='code'))if(!pages.some(p=>p.blocks.some(b=>b.kind==='code'&&b.sourceId===segment.id)))fail('CONTENT_CODE_OMITTED',segment.id);
  if(root.kind==='social'&&pages.some(page=>!page.caption?.trim()))fail('CONTENT_CAPTION_REQUIRED','pages');
  return {version:1,kind:root.kind as ContentPlan['kind'],title:text(root.title,'title',160),pages};
}

export function contentBlockText(block:ContentBlock):string[] {
  switch(block.kind){
    case 'paragraph':return [block.text];
    case 'steps':case 'features':return block.entries.flatMap(e=>[e.title,e.description]);
    case 'comparison':return block.columns.flatMap(c=>[c.title,...c.points]);
    case 'code':return [block.code];
    case 'parameters':return block.rows.flatMap(r=>[r.name,r.value,r.description]);
    case 'quote':return [block.text,block.attribution];
    case 'chart':return [block.unit,...block.values.flatMap(v=>[v.label,String(v.value)])];
    case 'image':return [];
  }
}

/** Validate persisted/editor-authored content without reasserting that user edits came from AI evidence. */
export function validateEditableContentPage(raw:unknown,{allowIncomplete=false}:{allowIncomplete?:boolean}={}):ContentPage {
 const draftText=(value:unknown,path:string,max=1000,empty=false)=>text(value,path,allowIncomplete?Math.max(max,20000):max,empty||allowIncomplete);
 const page=object(raw,'page'),ids=new Set<string>();
 const id=(value:unknown,path:string)=>{const result=identity(value,path);if(ids.has(result))fail('CONTENT_DUPLICATE_ID',path);ids.add(result);return result;};
 const proof=(value:unknown,path:string):Evidence[]=>list(value,path,1,32).map((raw,index)=>{const item=object(raw,`${path}.${index}`);return {sourceId:text(item.sourceId,path,80),...(item.quote===undefined?{}:{quote:text(item.quote,path,20000)})};});
 if(!['cover','explain','instruct','compare','evidence','conclude'].includes(String(page.purpose)))fail('CONTENT_INVALID_PURPOSE','page.purpose');
 const pageId=id(page.id,'page.id');
 const blocks=list(page.blocks,'page.blocks',1,8).map((raw,index):ContentBlock=>{
  const path=`page.blocks.${index}`,value=object(raw,path),base={id:id(value.id,`${path}.id`),evidence:proof(value.evidence,`${path}.evidence`)};
  const field=(name:string,max=1000,empty=false)=>draftText(value[name],`${path}.${name}`,max,empty);
  switch(value.kind){
   case 'paragraph':return {...base,kind:'paragraph',text:field('text',1600)};
   case 'steps':case 'features':return {...base,kind:value.kind,entries:list(value.entries,path,1,12).map(raw=>{const item=object(raw,path);return {title:draftText(item.title,path,160),description:draftText(item.description,path,600,true)};})};
   case 'comparison':return {...base,kind:'comparison',columns:list(value.columns,path,2,4).map(raw=>{const item=object(raw,path);return {title:draftText(item.title,path,160),points:list(item.points,path,1,8).map(raw=>draftText(raw,path,500))};})};
   case 'code':return {...base,kind:'code',sourceId:field('sourceId',80),language:field('language',40),code:field('code',20000)};
   case 'parameters':return {...base,kind:'parameters',rows:list(value.rows,path,1,20).map(raw=>{const item=object(raw,path);return {name:draftText(item.name,path,160),value:draftText(item.value,path,1000,true),description:draftText(item.description,path,500,true)};})};
   case 'quote':return {...base,kind:'quote',text:field('text',1600),attribution:field('attribution',160,true)};
   case 'chart':{
    if(!['bar','line'].includes(String(value.chart)))fail('CONTENT_INVALID_CHART',path);
    return {...base,kind:'chart',chart:value.chart as 'bar'|'line',unit:field('unit',60,true),values:list(value.values,path,2,12).map(raw=>{const item=object(raw,path);if(typeof item.value!=='number'||(!(allowIncomplete&&Number.isNaN(item.value))&&(!Number.isFinite(item.value)||Math.abs(item.value)>1e15)))fail('CONTENT_INVALID_VALUE',path);return {label:draftText(item.label,path,100),value:item.value as number};})};
   }
   case 'image':{
    if(!['screenshot','photograph','diagram'].includes(String(value.treatment))||!['missing','available'].includes(String(value.status)))fail('CONTENT_INVALID_IMAGE','page');
    return {...base,kind:'image',sourceId:field('sourceId',80),alt:field('alt',300,true),treatment:value.treatment as 'screenshot'|'photograph'|'diagram',status:value.status as 'missing'|'available',...(value.status==='available'?{assetId:field('assetId',200)}:{})};
   }
   default:return fail('CONTENT_UNKNOWN_BLOCK',path);
  }
 });
 return {...sceneField(page.scene,'page.scene'),id:pageId,title:draftText(page.title,'page.title',160),purpose:page.purpose as ContentPage['purpose'],evidence:proof(page.evidence,'page.evidence'),blocks,...(page.caption===undefined?{}:{caption:draftText(page.caption,'page.caption',2000,true)}),...(page.notes===undefined?{}:{notes:draftText(page.notes,'page.notes',2000,true)})};
}
