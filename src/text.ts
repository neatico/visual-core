import LineBreaker from 'linebreak';
export type Measure = (text: string, size: number, bold: boolean) => number;
export interface WrapOptions { balance?:boolean; keepWords?:boolean; preferClauseBreaks?:boolean }
/** Unicode line opportunities are provided by UAX #14; actual breaks use the caller's font metrics. */
export function wrapCopy(text:string,width:number,size:number,bold:boolean,measure:Measure,options:WrapOptions={}):string[] {
 if(typeof measure!=='function')throw new TypeError('measure must be a function');
 if(!Number.isFinite(width)||width<=0||!Number.isFinite(size)||size<=0)throw new RangeError('Width and font size must be positive finite numbers');
 // A cache belongs to this layout only: font loading and later edits can change metrics.
 const measurements=new Map<string,number>();
 const measured=(value:string)=>{
  const cached=measurements.get(value);if(cached!==undefined)return cached;
  const result=measure(value,size,bold);
  if(!Number.isFinite(result)||result<0)throw new TypeError('The text measurement must be a nonnegative finite number');
  measurements.set(value,result);return result;
 };
 let wordSegmenter:Intl.Segmenter|undefined,graphemeSegmenter:Intl.Segmenter|undefined;
 const graphemes=(value:string)=>{
  if(typeof Intl.Segmenter!=='function')return Array.from(value);
  graphemeSegmenter??=new Intl.Segmenter(undefined,{granularity:'grapheme'});
  return [...graphemeSegmenter.segment(value)].map(part=>part.segment);
 };
 const lines:string[]=[];
 for(const paragraph of text.replace(/\r\n?/g,'\n').split('\n')){
  if(!paragraph.trim()){if(text.includes('\n'))lines.push('');continue;}
  const clause=options.preferClauseBreaks?paragraph.match(/^(.{4,}?(?:：|:\s+|—\s+))(.+)$/u):null;
  if(clause&&measured(paragraph)>width&&measured(clause[1])<=width&&measured(clause[1])>=width*.35){
   const nested={...options,preferClauseBreaks:false};
   lines.push(...wrapCopy(clause[1],width,size,bold,measure,nested),...wrapCopy(clause[2],width,size,bold,measure,nested));continue;
  }
  const ranges=options.keepWords&&typeof Intl.Segmenter==='function'?[...(wordSegmenter??=new Intl.Segmenter(undefined,{granularity:'word'})).segment(paragraph)].filter(part=>part.isWordLike).map(part=>({start:part.index,end:part.index+part.segment.length,text:part.segment})):[];
  // Keep a fitting URL/API token whole even where UAX permits a slash break.
  for(const match of paragraph.matchAll(/[A-Za-z0-9]+(?:[.:_/@+\-][A-Za-z0-9]+)+/g))ranges.push({start:match.index!,end:match.index!+match[0].length,text:match[0]});
  ranges.sort((a,b)=>a.start-b.start);
  const wrapAt=(available:number):string[]|undefined=>{
   const breaker=new LineBreaker(paragraph),tokens:string[]=[];
   let rangeIndex=0;
   let activeRanges:typeof ranges=[];
   let last=0,point;
   while((point=breaker.nextBreak())){
    // Word and identifier ranges are ordered and each family is disjoint.
    // Visit only ranges covering this break instead of rescanning the paragraph.
    activeRanges=activeRanges.filter(range=>range.end>point!.position);
    while(rangeIndex<ranges.length&&ranges[rangeIndex].start<point.position){
     const range=ranges[rangeIndex++];
     if(range.end>point.position)activeRanges.push(range);
    }
    if(activeRanges.some(range=>measured(range.text)<=available))continue;
    tokens.push(paragraph.slice(last,point.position));last=point.position;
   }
   if(last<paragraph.length)tokens.push(paragraph.slice(last));
   const output:string[]=[];let line='';
   for(const token of tokens){
    if(measured(line+token.trimEnd())<=available){line+=token;continue;}
    if(line.trim()){output.push(line.trim());line='';}
    if(measured(token.trim())<=available){line=token.trimStart();continue;}
    // A range may be wider than a column, but a fitting clock must stay intact.
    // Keep each clock as an atomic fallback unit instead of splitting its minutes.
    const glyphs:string[]=[];let cursor=0;
    for(const match of token.matchAll(/\d{1,2}:\d{2}(?::\d{2})?/g)){
     glyphs.push(...graphemes(token.slice(cursor,match.index)));
     glyphs.push(...(measured(match[0])<=available?[match[0]]:graphemes(match[0])));
     cursor=match.index!+match[0].length;
    }
    glyphs.push(...graphemes(token.slice(cursor)));
    for(const glyph of glyphs){
     if(glyph.trim()&&measured(glyph)>available)return;
     if(line&&measured(line+glyph)>available){output.push(line.trim());line='';}
     line+=glyph;
    }
   }
   if(line.trim())output.push(line.trim());return output;
  };
  let wrapped=wrapAt(width);
  if(!wrapped)throw new RangeError('A character exceeds the available width');
  if(options.balance!==false&&wrapped.length>1){
   const widths=wrapped.map(measured),max=Math.max(...widths);
   if(widths[widths.length-1]<max*.3){
    const target=Math.min(width,widths.reduce((a,b)=>a+b,0)/wrapped.length*1.1);
    const balanced=wrapAt(target);
    if(balanced&&balanced.length<=wrapped.length&&measured(balanced[balanced.length-1])>widths[widths.length-1])wrapped=balanced;
   }
  }
  lines.push(...wrapped);
 }
 return lines;
}
