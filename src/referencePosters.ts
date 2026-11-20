import type {ParameterSchema} from './recipeParameters.js';

/** Explicit layout identities and numeric/image slots; copy never selects a brand or layout. */
export const REFERENCE_POSTERS = [
 {id:'model-price-table',scene:'pricing',name:'Model pricing table',ratio:1,min:.9,max:1.1},
 {id:'planet-career',scene:'editorial',name:'Planet career campaign',ratio:1,min:.9,max:1.1},
 {id:'rental-features',scene:'features',name:'Rental service features',ratio:1,min:.9,max:1.1},
 {id:'split-photo-poll',scene:'comparison',name:'Split photo opinion poll',ratio:.8,min:.72,max:.9},
 {id:'journal-announcement',scene:'editorial',name:'Research publication announcement',ratio:16/9,min:1.6,max:2},
 {id:'speaker-meetup',scene:'event',name:'Four speaker meetup',ratio:16/9,min:1.6,max:2},
 {id:'cost-comparison',scene:'comparison',name:'Two plan cost comparison',ratio:1200/628,min:1.7,max:2.1},
 {id:'split-product-pricing',scene:'pricing',name:'Split product pricing',ratio:1,min:.94,max:1.06},
 {id:'neon-enterprise-trial',scene:'pricing',name:'Neon enterprise trial',ratio:1,min:.94,max:1.06},
 {id:'ranked-data-table',scene:'metric',name:'Ranked data table',ratio:1400/1930,min:.68,max:.78},
 {id:'city-service-offer',scene:'pricing',name:'City service offer',ratio:16/9,min:1.65,max:1.9},
 {id:'editorial-benchmark',scene:'metric',name:'Editorial benchmark',ratio:3200/1880,min:1.6,max:1.8},
 {id:'portrait-news-cover',scene:'editorial',name:'Portrait news cover',ratio:16/9,min:1.65,max:1.9},
 {id:'hardware-offer',scene:'pricing',name:'Hardware offer',ratio:1200/628,min:1.8,max:2.05},
] as const;
export type ReferencePosterId=typeof REFERENCE_POSTERS[number]['id'];
export const isReferencePoster=(id:string):id is ReferencePosterId=>REFERENCE_POSTERS.some(p=>p.id===id);
export interface PosterPriceTable {
 heading:string;unit:string;currency:string;columns:{model:string;provider:string;input:string;output:string;savings:string};benefits:string[];badge:string;
 rows:{name:string;assetId:string;providerInput:number;providerOutput:number;input:number;output:number}[];
}
export interface PosterChart {
 columns?:{rank:string;name:string;period:string;value:string};
 unit:string;numberLocale:string;baseline:number;
 rows:{name:string;value:number;period:string;qualifier:string;assetId:string;highlight:boolean}[];
}
export interface PosterExtras {
 logoAssetId?:string;secondaryLogoAssetId?:string;secondaryBrand?:string;
 foregroundAssetId?:string;avatarAssetId?:string;valueSuffix?:string;accentText?:string;
 dataChart?:PosterChart;
}
export interface PosterItem {title:string;description:string;assetId?:string;subtitle?:string;primaryValue?:number;unit?:string}
const text=(maxLength:number,description:string,minLength=0)=>({type:'string',minLength,maxLength,description});
const num=(description:string)=>({type:'number',minimum:0,maximum:1e12,description});
const obj=(properties:Record<string,unknown>):ParameterSchema=>({type:'object',properties,required:Object.keys(properties),additionalProperties:false});
const arr=(items:unknown,count:number)=>({type:'array',minItems:count,maxItems:count,items});
const asset=()=>text(160,'Existing asset ID from the supplied catalog, or empty for the built-in generic illustration. Never invent a URL or person identity.');

export function referencePosterSchema(id:ReferencePosterId):ParameterSchema {
 const p:Record<string,unknown>={title:text(100,'Complete headline. Retain requested language and required content.',1),body:text(200,'Supporting copy in the output language.'),eyebrow:text(48,'Explicit brand or organization label, or empty. Never infer an identity from the topic.')};
 if(id==='model-price-table')p.priceTable=obj({heading:text(40,'Table heading',1),unit:text(40,'Shared pricing unit',1),currency:text(8,'Currency symbol',1),columns:obj({model:text(20,'Product/model column label',1),provider:text(20,'Combined provider input/output price column label',1),input:text(20,'Offered input price column label',1),output:text(20,'Offered output price column label',1),savings:text(16,'Input price saving percentage column label',1)}),benefits:arr(text(40,'One concise benefit; no paragraph.',1),2),badge:text(40,'Optional security or availability badge. Do not invent a certification.'),rows:arr(obj({name:text(28,'Model or product name, without repeating its prices',1),assetId:asset(),providerInput:num('Reference input price'),providerOutput:num('Reference output price'),input:num('Offered input price'),output:num('Offered output price')}),4)});
 if(id==='model-price-table'){p.title=text(80,'Large two-line announcement headline.',1);p.body=text(90,'One short supporting line, e.g. product names.');}
 if(id==='planet-career'){p.title=text(32,'First short campaign headline, one display line.',1);p.body=text(36,'Short brand tagline at bottom right, not an organization description.');p.eyebrow=text(24,'Brand name only.');p.value=text(32,'Second headline line, visually emphasized in gold.',1);p.imageAssetId=asset();p.cta=text(48,'Brand tagline or action.');}
 if(id==='rental-features'){p.title=text(40,'Service name in two short header lines.',1);p.body=text(12,'Short section label such as Features, in the requested language. Not a paragraph.',1);p.eyebrow=text(24,'Brand name only.');p.value=text(28,'Short product category under the brand.');p.imageAssetId=asset();p.items=arr(obj({title:text(48,'One complete feature, line breaks permitted.',1),description:text(24,'Optional short feature detail.')}),3);p.attribution=text(240,'All required qualifications. Preserve them in full.');}
 if(id==='split-photo-poll'){p.title=text(72,'One complete poll question, in two short lines.',1);p.body=text(60,'Optional short supporting line; empty if not needed.');p.value=text(36,'Overline introducing the opinion.');p.cta=text(36,'Centered call to action.');p.items=arr(obj({title:text(24,'Option label',1),description:{...text(12,'Only the localized count unit, e.g. votes. The numeric count is supplied separately; do not repeat it here.',1),pattern:'^[^0-9]+$'},assetId:asset(),primaryValue:num('Nonnegative vote count. Percentages and bar lengths are calculated from both counts.')}),2);}
 if(id==='journal-announcement'){p.title=text(64,'Publication or research title, two short lines.',1);p.body=text(40,'Short lead-in such as Latest research from. Not an abstract or summary.');p.eyebrow=text(24,'Publisher or organization name only.');p.value=text(36,'Publication status, e.g. Now online.',1);p.cta=text(80,'Bottom action line.',1);p.attribution=text(32,'Access label or publication imprint.');p.imageAssetId=asset();}
 if(id==='speaker-meetup'){p.title=text(32,'Very short event name in two display lines.',1);p.body=text(110,'Short event theme or description.');p.value=text(40,'Short date and city above the headline.');p.attribution=text(180,'Event date/time and venue, separated by explicit line breaks.');p.cta=text(24,'Speaker section label.',1);p.items=arr(obj({title:text(32,'Speaker name',1),subtitle:text(32,'Organization or affiliation.'),description:text(32,'Short speaker role.'),assetId:asset()}),4);}
 if(id==='cost-comparison'){p.value=text(8,'Currency symbol shared by both prices.',1);p.items=arr(obj({title:text(32,'Plan or provider label',1),description:text(80,'Cost components or explanation.'),primaryValue:num('Comparable total price in the shared currency.'),unit:text(16,'Same billing period suffix, e.g. /mo.',1)}),2);}
  // Brand assets are optional on old saved designs; empty preserves the neutral editable mark.
 p.logoAssetId={...text(160,'Explicit brand logo asset ID from the supplied catalog, or empty. Generic photos, product renders and decorative illustrations are not brand logos.'),default:''};
 if(id==='split-product-pricing'){
  p.title=text(32,'Short product name in a large condensed headline.',1);p.body=text(32,'Pricing category or subtitle.',1);p.value=text(50,'Shared pricing unit below both rows.',1);p.imageAssetId=asset();
  p.items=arr(obj({title:text(20,'Price category label',1),description:text(28,'Complete formatted price, including currency and necessary qualifiers. Put the shared billing unit in value instead of repeating it in each price.',1)}),2);
 }
 if(id==='neon-enterprise-trial'){
  p.title=text(32,'Product name in two short display lines.',1);p.value=text(22,'Highlighted offer headline.',1);p.body=text(40,'First line of the complete supporting benefit. Continue the same sentence in accentText, splitting at a word boundary; never omit its ending.');p.accentText=text(40,'Second line of the supporting benefit, in cyan. Together body and accentText must preserve the complete requested benefit.');p.secondaryBrand=text(24,'Explicit partner brand or empty.');p.secondaryLogoAssetId=text(160,'Explicit partner logo asset ID, or empty. Never use a generic photograph or product render as a brand logo.');p.imageAssetId=asset();p.cta=text(24,'Action button.',1);
  p.items=arr(obj({title:text(12,'Complete offer quantity including any units or currency.',1),description:text(28,'Short quantity label; at most two lines.',1)}),4);
 }
 if(id==='ranked-data-table'||id==='editorial-benchmark'){
  p.title=text(id==='ranked-data-table'?42:95,'Reader-facing chart headline. Keep qualifications and scope; do not repeat production instructions from the brief.',1);p.body=text(100,'Subtitle or methodology note.');p.value=text(100,'Optional highlighted finding.');p.attribution=text(id==='ranked-data-table'?400:140,'Reader-facing sources, footnotes and numeric qualifications only. Do not narrate excluded logos, asset choices or production instructions.');
  p.dataChart=obj({...(id==='ranked-data-table'?{columns:obj({rank:text(12,'Rank column heading.'),name:text(24,'Entity column heading.'),period:text(24,'Period column heading.'),value:text(30,'Numeric column heading.')})}:{}),unit:text(60,'Shared quantity unit and scope.',1),numberLocale:{...text(16,'BCP47 locale for numeric formatting.'),enum:['en','en-US','zh-CN','zh-TW','ja','ja-JP','ko','ko-KR','fr','fr-FR','de','de-DE','es','es-ES','it','it-IT','pt','pt-BR','pt-PT','ru','ar','hi','hi-IN','id','id-ID','th','th-TH','vi','vi-VN','tr','tr-TR','nl-NL','pl-PL']},baseline:{...num('Explicit lower numeric axis bound: horizontal bars in ranked-data-table, vertical bars in editorial-benchmark. Use zero for a full-scale chart. The renderer prints a nonzero lower bound; do not claim a separate axis-break graphic.'),default:0},rows:{type:'array',minItems:3,maxItems:id==='ranked-data-table'?21:16,description:'Rows in the exact intended display order. Do not infer brand logos from names; use explicit supplied asset IDs. Preserve all requested rows up to capacity.',items:obj({name:text(40,'Entity label only. Encode visual emphasis in highlight, never append rendering instructions to this name.',1),value:num('Numeric value used directly to calculate the bar length.'),period:text(16,'Data period, if applicable.'),qualifier:text(3,'Optional footnote marker only.'),assetId:asset(),highlight:{type:'boolean',description:'Explicit visual emphasis choice.'}})}});
 }
 if(id==='editorial-benchmark')p.imageAssetId={...asset(),default:''};
 if(id==='city-service-offer'){
  p.title=text(32,'Service headline.',1);p.value=text(24,'Complete formatted offer price.',1);p.valueSuffix=text(20,'Short qualifier beside the price.');p.body=text(70,'Included services or offer scope.');p.attribution=text(55,'Explicitly supplied credential, qualification or neutral service assurance. Do not invent a license number.');p.imageAssetId=asset();
 }
 if(id==='portrait-news-cover'){
  p.title=text(60,'Complete two-line editorial headline.',1);p.body=text(50,'Reader-facing topic context or qualification. Asset selection and fictional-person instructions belong in image fields, never in this copy.');p.value=text(16,'Main formatted headline metric.',1);p.valueSuffix=text(10,'Short metric label.');p.accentText=text(60,'Exact phrase from the title to emphasize; empty is allowed.');p.attribution=text(24,'Author or channel caption.');p.imageAssetId=asset();p.foregroundAssetId=asset();p.avatarAssetId=asset();
 }
 if(id==='hardware-offer'){
  p.title=text(32,'Product model or category.',1);p.value=text(16,'Highlighted specification value.',1);p.valueSuffix=text(16,'Specification unit or name.');p.body=text(64,'Main offer including complete rate and billing unit.',1);p.accentText=text(40,'Optional credit or secondary offer. Preserve supplied terms without inventing a time limit, eligibility condition or guarantee.');p.attribution=text(80,'Required offer qualifications.');p.cta=text(32,'Action button.',1);p.imageAssetId=asset();
 }
 return obj(p);
}
