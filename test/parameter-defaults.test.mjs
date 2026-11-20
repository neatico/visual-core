import test from 'node:test';
import assert from 'node:assert/strict';
import {compositionParameterDefaults,FORMAL_COMPOSITIONS,validateEditableContentPage} from '../dist/index.js';

test('authored visual defaults complete graphic slots without rewriting factual copy',()=>{
 const contract=FORMAL_COMPOSITIONS.find(item=>item.id==='social:bento');
 const original={title:'Release review',body:'Keep the original copy.',items:Array.from({length:3},()=>({title:'Review',description:'Check the supplied version.'}))};
 const values=compositionParameterDefaults(contract.parameterSchema,original);
 assert.equal(values.items[0].illustration,'symbol');
 assert.equal(original.items[0].illustration,undefined);
 assert.equal(values.items[0].description,original.items[0].description);
 const supplied={...original,items:original.items.map(item=>({...item,illustration:'review'}))};
 assert.equal(compositionParameterDefaults(contract.parameterSchema,supplied).items[0].illustration,'review');
});

test('unsupported optional row decorations never discard text or interrupt saved pages',()=>{
 const contract=FORMAL_COMPOSITIONS.find(item=>item.id==='semantic:presentation:semantic-steps-stack');
 for(const invalid of ['unknown-asset-Ω','不在目录中',42,null]){
  const original={title:'Nøva Ω',blocks:[{id:'steps',kind:'steps',evidence:[],entries:[
   {title:'Étape 1',description:'Keep 42 participants and every necessary detail.',icon:invalid,illustration:invalid},
   {title:'第二步',description:'保留全部内容。',icon:'BsPeople',illustration:'collaboration'},
  ]}]};
  const values=compositionParameterDefaults(contract.parameterSchema,original);
  assert.equal(values.blocks[0].entries[0].icon,undefined);
  assert.equal(values.blocks[0].entries[0].illustration,undefined);
  const page=validateEditableContentPage({id:'page',purpose:'instruct',evidence:[],...values});
  assert.equal(page.blocks[0].entries[0].description,original.blocks[0].entries[0].description);
  assert.equal(page.blocks[0].entries[1].icon,'BsPeople');
  assert.equal(page.blocks[0].entries[1].illustration,'collaboration');
  const reopened=validateEditableContentPage(JSON.parse(JSON.stringify({...page,blocks:original.blocks})));
  assert.equal(reopened.blocks[0].entries[0].illustration,undefined);
  assert.equal(reopened.blocks[0].entries[0].description,original.blocks[0].entries[0].description);
 }
 const entries=contract.parameterSchema.properties.blocks.items[0].properties.entries.items;
 assert.ok(!entries.required.includes('illustration'));
 assert.equal(entries.properties.illustration.default,undefined);
});

test('large illustration slots retain neutral defaults while unrelated invalid enums remain visible to validation',()=>{
 const contract=FORMAL_COMPOSITIONS.find(item=>item.id==='social:bento');
 const values=compositionParameterDefaults(contract.parameterSchema,{items:[{illustration:'unknown',description:'Do not rewrite this.'}]});
 assert.equal(values.items[0].illustration,'symbol');
 assert.equal(values.items[0].description,'Do not rewrite this.');
 assert.equal(compositionParameterDefaults({type:'object',properties:{status:{type:'string',enum:['ready']}}},{status:'unknown'}).status,'unknown');
});
