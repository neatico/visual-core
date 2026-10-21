/** Versioned data-only composition: executable CSS, HTML and URLs are not accepted. */
export type CompositionNode = {type:'row'|'column'|'text'|'image'|'divider'|'icon';weight?:number;tone?:'plain'|'card'|'contrast';role?:'hero'|'heading'|'body'|'caption';bind?:string;icon?:'idea'|'check'|'chart'|'people'|'shield'|'arrow';children?:CompositionNode[]};
export interface Composition {version:1;root:CompositionNode}
export const COMPOSITION_PROMPT = `Also return composition:{version:1,root:node}. Design a hierarchy from the content, not a fixed template. A node is {type,weight?,tone?,role?,bind?,icon?,children?}. row and column contain 2-4 children; nest up to 5 levels, at most 40 nodes. Weight is relative space 0.5-4. Tone plain/card/contrast applies to groups. Text binds exactly one existing nonempty content field (title or headline, body, eyebrow, cta, value, attribution, items.0.title, items.0.description, etc); never bind notes. Include EVERY nonempty content field exactly once. Text role hero/heading/body/caption controls typography. Image is an optional original conceptual illustration, not invented evidence or a photo. Icon optionally uses idea/check/chart/people/shield/arrow. Divider separates related content. No coordinates, CSS, HTML, URLs or text in the tree. Use one strong hero, purposeful contrast, asymmetric columns, grouped evidence, and breathing room. Rows reflow for narrow formats. Different stories should have different trees, not just different colors.`;
export function compositionFields(value:Record<string,unknown>):Record<string,string>{
 const fields:Record<string,string>={};
 for(const key of ['title','headline','body','eyebrow','cta','value','attribution'])if(typeof value[key]==='string'&&(value[key] as string).trim())fields[key]=value[key] as string;
 if(Array.isArray(value.items))value.items.forEach((item,i)=>{for(const key of ['title','description'])if(typeof item?.[key]==='string'&&item[key].trim())fields[`items.${i}.${key}`]=item[key];});
 return fields;
}
export function validateComposition(raw:unknown,fields:Record<string,string>):Composition{
 const value=raw as Composition;let count=0,images=0;const seen=new Set<string>();
 if(!value||value.version!==1)throw new Error('Unsupported composition');
 function visit(n:CompositionNode,depth:number):CompositionNode{
  if(!n||typeof n!=='object'||++count>40||depth>5||!['row','column','text','image','divider','icon'].includes(n.type))throw new Error('Invalid composition node');
  if(n.weight!==undefined&&(!Number.isFinite(n.weight)||n.weight<.5||n.weight>4))throw new Error('Invalid composition weight');
  if(n.tone!==undefined&&!['plain','card','contrast'].includes(n.tone))throw new Error('Invalid composition tone');
  const out:CompositionNode={type:n.type,weight:n.weight,tone:n.tone};
  if(n.type==='row'||n.type==='column'){
   if(!Array.isArray(n.children)||n.children.length<2||n.children.length>4)throw new Error('Invalid composition group');
   out.children=n.children.map(c=>visit(c,depth+1));
  }else{
   if(n.children!==undefined)throw new Error('Leaf cannot have children');
   if(n.type==='text'){
    if(!n.bind||!Object.prototype.hasOwnProperty.call(fields,n.bind)||seen.has(n.bind))throw new Error('Invalid or duplicated binding');
    if(n.role!==undefined&&!['hero','heading','body','caption'].includes(n.role))throw new Error('Invalid text role');
    seen.add(n.bind);out.bind=n.bind;out.role=n.role||'body';
   }
   if(n.type==='image'&&++images>1)throw new Error('Only one illustration per composition');
   if(n.type==='icon'){
    if(!n.icon||!['idea','check','chart','people','shield','arrow'].includes(n.icon))throw new Error('Invalid icon');out.icon=n.icon;
   }
  }
  return out;
 }
 const root=visit(value.root,0);
 if(Object.keys(fields).some(key=>!seen.has(key)))throw new Error('Composition omits content');
 return {version:1,root};
}
