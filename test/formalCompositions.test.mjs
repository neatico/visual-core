import test from 'node:test';
import assert from 'node:assert/strict';
import {FORMAL_COMPOSITIONS,applicableCompositions} from '../dist/index.js';
test('formal inventory preserves every gallery ID and separates output capabilities',()=>{
 assert.equal(FORMAL_COMPOSITIONS.length,163);
 assert.equal(new Set(FORMAL_COMPOSITIONS.map(item=>item.id)).size,163);
 assert.equal(applicableCompositions('article-cover',16/9).length,3);
 assert.equal(applicableCompositions('article-illustration',16/9).length,30);
 for(const item of FORMAL_COMPOSITIONS){assert.ok(item.parameterSchema&&item.semanticDescription&&item.rendererKey&&item.displayNumber);}
});
test('explicit IDs never substitute a different composition and semantic fit is not an eligibility gate',()=>{
 const list=applicableCompositions('presentation',16/9,'reference:authored-reference-list');
 assert.equal(list.length,1);assert.equal(list[0].id,'reference:authored-reference-list');
 assert.equal(applicableCompositions('social',1,'new-reference:ledger-chart').length,0);
 assert.throws(()=>applicableCompositions('social',1,'unknown'));
 assert.throws(()=>applicableCompositions('social',NaN));
});

test('cover contracts require a concise headline and one bounded supporting sentence and an optional attributed hero',()=>{
 for(const definition of applicableCompositions('article-cover',16/9)){
  const schema=definition.parameterSchema;
  assert.equal(schema.properties.title.maxLength,72);
  assert.equal(schema.properties.blocks.maxItems,2);
  assert.equal(schema.properties.blocks.items[0].properties.text.maxLength,140);
  assert.equal(schema.properties.blocks.items[0].properties.kind.const,'paragraph');
  assert.equal(schema.properties.blocks.items[1].properties.kind.const,'image');
  assert.ok(schema.properties.blocks.items[1].required.includes('evidence'));
  assert.equal(schema.properties.blocks.minItems,1);
 }
});

test('illustration contracts require their actual visual structure and bounded native copy',()=>{
 for(const definition of applicableCompositions('article-illustration',16/9)){
  const schema=definition.parameterSchema;
  assert.ok(schema.properties.blocks.items[0].properties.kind.const);
  assert.equal(schema.properties.blocks.maxItems,1);
  assert.equal(schema.properties.title.maxLength,64);
 }
});

test('formal suitability descriptions distinguish communication intent from fillable structure',()=>{
 const description=id=>FORMAL_COMPOSITIONS.find(item=>item.id===id).semanticDescription;
 assert.match(description('social:team'),/people/);assert.match(description('social:team'),/not a roster/);
 assert.match(description('reference:authored-reference-list'),/parallel/);
 assert.match(description('social:pricing'),/pricing is requested/);
 assert.match(description('social:metric'),/requested illustrative/);
 for(const composition of FORMAL_COMPOSITIONS)assert.ok(composition.semanticDescription.length>50,composition.id);
});

test('all formal FAQ patterns include the full question rather than only punctuation',()=>{
 const patterns=[];
 function visit(value){if(!value||typeof value!=='object')return;if(value.pattern?.includes('[?'))patterns.push(value.pattern);Object.values(value).forEach(visit);}
 FORMAL_COMPOSITIONS.forEach(contract=>visit(contract.parameterSchema));
 assert.ok(patterns.length>3);
 for(const pattern of patterns){const regex=new RegExp(pattern,'u');assert.equal('What should I save?'.match(regex)?.[0],'What should I save?');assert.equal(regex.test('?'),false);}
});
