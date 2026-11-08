import test from 'node:test';
import assert from 'node:assert/strict';
import {compositionParameterDefaults,FORMAL_COMPOSITIONS} from '../dist/index.js';

test('authored visual defaults complete graphic slots without rewriting factual copy',()=>{
 const contract=FORMAL_COMPOSITIONS.find(item=>item.id==='social:bento');
 const original={title:'Release review',body:'Keep the original copy.',items:Array.from({length:3},()=>({title:'Review',description:'Check the supplied version.'}))};
 const values=compositionParameterDefaults(contract.parameterSchema,original);
 assert.equal(values.items[0].illustration,'structure');
 assert.equal(original.items[0].illustration,undefined);
 assert.equal(values.items[0].description,original.items[0].description);
 const supplied={...original,items:original.items.map(item=>({...item,illustration:'review'}))};
 assert.equal(compositionParameterDefaults(contract.parameterSchema,supplied).items[0].illustration,'review');
});
