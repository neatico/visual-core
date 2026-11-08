/** Apply only renderer-authored defaults. Never rewrite supplied copy or values. */
export function compositionParameterDefaults(schema:Readonly<Record<string,unknown>>,value:unknown):unknown {
 if(value===undefined&&Object.hasOwn(schema,'default'))return JSON.parse(JSON.stringify(schema.default));
 if(schema.type==='object'&&value&&typeof value==='object'&&!Array.isArray(value)){
  const next={...value} as Record<string,unknown>;
  for(const [key,child] of Object.entries(schema.properties||{})){
   const resolved=compositionParameterDefaults(child as Record<string,unknown>,next[key]);
   if(resolved!==undefined)next[key]=resolved;
  }
  return next;
 }
 if(schema.type==='array'&&Array.isArray(value))return value.map((item,index)=>compositionParameterDefaults((Array.isArray(schema.items)?schema.items[index]:schema.items)||{},item));
 return value;
}
