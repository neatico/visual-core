import test from 'node:test';import assert from 'node:assert/strict';
import {REFERENCE_POSTERS,FORMAL_COMPOSITIONS,referencePosterSchema,validateNativeSocialParameters,nativeSocialContentPage,applicableCompositions} from '../dist/index.js';
const sample=s=>s.type==='object'?Object.fromEntries(Object.entries(s.properties).map(([k,v])=>[k,sample(v)])):s.type==='array'?Array.from({length:s.minItems},()=>sample(s.items)):s.type==='number'?1:s.minLength?'X':'';
test('seven reference contracts have unique identities, exact ratios and lossless structured values',()=>{
 assert.equal(REFERENCE_POSTERS.length,7);
 for(const spec of REFERENCE_POSTERS){const definition=FORMAL_COMPOSITIONS.find(c=>c.id===`social:${spec.id}`);assert.equal(definition.parameterModel,'native-social');assert.equal(applicableCompositions('social',spec.ratio,definition.id).length,1);assert.equal(applicableCompositions('social',spec.min-.01,definition.id).length,0);const values=sample(referencePosterSchema(spec.id));assert.deepEqual(validateNativeSocialParameters(spec.id,values),values);assert.equal(nativeSocialContentPage(values,{id:'sample',title:'Original',purpose:'explain',blocks:[]},spec.id).title,'X');}
});
test('votes are integers and cost comparisons share the same billing period',()=>{
 const poll=sample(referencePosterSchema('split-photo-poll'));poll.items[0].primaryValue=.5;assert.throws(()=>validateNativeSocialParameters('split-photo-poll',poll));
 const cost=sample(referencePosterSchema('cost-comparison'));cost.items[1].unit='/year';assert.throws(()=>validateNativeSocialParameters('cost-comparison',cost));
});
test('pricing images and all price precision remain available after content projection',()=>{
 const values=sample(referencePosterSchema('model-price-table'));values.priceTable.rows[0]={name:'未知名稱',assetId:'uploaded-logo',providerInput:.3,providerOutput:1.2,input:.1573,output:.628649};
 const page=nativeSocialContentPage(values,{id:'sample',title:'Original',purpose:'explain',blocks:[]},'model-price-table');assert.ok(page.blocks.some(b=>b.kind==='image'&&b.assetId==='uploaded-logo'));assert.ok(JSON.stringify(page).includes('0.628649'));assert.ok(!page.blocks.some(b=>b.kind==='paragraph'&&!b.text));
});
