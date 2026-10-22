import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateBlueprint,createBlueprintRegistry,blueprintLabel} from '../dist/index.js';
const sample=()=>({version:1,id:'editorial-title',labels:{en:'Editorial',zh:'编辑式'},fields:['title','body'],ratios:[1,16/9],composition:{version:1,root:{type:'column',children:[{type:'text',bind:'title',role:'hero'},{type:'text',bind:'body'}]}}});
test('portable templates preserve field coverage and locale fallback',()=>{
 const b=validateBlueprint(sample());assert.equal(blueprintLabel(b,'zh-CN'),'编辑式');assert.equal(blueprintLabel(b,'fr'),'Editorial');
 assert.throws(()=>validateBlueprint({...sample(),fields:['title']}));
 assert.throws(()=>validateBlueprint({...sample(),ratios:[NaN]}));
});
test('registries isolate mutations, match content and unregister safely',()=>{
 const registry=createBlueprintRegistry(),input=sample(),remove=registry.register(input);
 input.composition.root.children=[];
 assert.equal(registry.find(['body','title'],1).length,1);
 assert.equal(registry.find(['title'],1).length,0);
 registry.list()[0].fields.pop();assert.equal(registry.list()[0].fields.length,2);
 assert.throws(()=>registry.register(sample()));remove();assert.deepEqual(registry.list(),[]);
});
test('missing identities cannot be coerced into valid registry keys',()=>{
 const input=sample();delete input.id;assert.throws(()=>validateBlueprint(input));
});
