import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {FORMAL_COMPOSITIONS,applicableCompositions,articleCompositionCuration,ARTICLE_COMPOSITION_CURATION} from '../dist/index.js';
test('formal inventory preserves every gallery ID and separates output capabilities',()=>{
 assert.equal(FORMAL_COMPOSITIONS.length,183);
 assert.equal(new Set(FORMAL_COMPOSITIONS.map(item=>item.id)).size,183);
 assert.equal(applicableCompositions('presentation',16/9).length,80);
 assert.equal(applicableCompositions('presentation',1).length,62);
 assert.equal(applicableCompositions('social',16/9).length,126);
 assert.equal(applicableCompositions('social',1).length,122);
 assert.equal(applicableCompositions('article-cover',16/9).length,73);
 assert.equal(applicableCompositions('article-cover',1).length,63);
 assert.equal(applicableCompositions('article-illustration',16/9).length,151);
 assert.equal(applicableCompositions('article-illustration',1).length,130);
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
 for(const definition of FORMAL_COMPOSITIONS.filter(item=>item.id.startsWith('article-cover-'))){
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
 for(const definition of FORMAL_COMPOSITIONS.filter(item=>item.id.startsWith('article-')&&!item.id.startsWith('article-cover-'))){
  const schema=definition.parameterSchema;
  assert.ok(schema.properties.blocks.items[0].properties.kind.const);
  assert.equal(schema.properties.blocks.maxItems,1);
  assert.equal(schema.properties.title.maxLength,64);
 }
});

test('article reuse changes no original identifier, schema, renderer, recipe, ratio or display identity',()=>{
 // Recorded from the original 0.14.72 inventory before article capabilities
 // were appended. A deliberate future contract migration must update this
 // baseline explicitly; curation alone must never silently rewrite one.
 const original=JSON.stringify(FORMAL_COMPOSITIONS.map(({supportedKinds,...definition})=>definition));
 assert.equal(createHash('sha256').update(original).digest('hex'),'ea9397908a883ad22664c8e1a6d7beb67bdc737ef5afa0c2da22ee8ecd6f9ecc');
 assert.equal(FORMAL_COMPOSITIONS.filter(item=>item.id.startsWith('article-cover-')).length,3);
 assert.equal(FORMAL_COMPOSITIONS.filter(item=>item.id.startsWith('article-')&&!item.id.startsWith('article-cover-')).length,30);
});

test('every existing renderer has one explicit, reviewable article curation decision',()=>{
 const keys=ARTICLE_COMPOSITION_CURATION.flatMap(group=>group.rendererKeys);
 assert.equal(new Set(keys).size,keys.length);
 assert.deepEqual(new Set(keys),new Set(FORMAL_COMPOSITIONS.map(item=>item.rendererKey)));
 for(const item of FORMAL_COMPOSITIONS){
  const review=articleCompositionCuration(item);
  assert.notEqual(review.category,'unreviewed',item.id);
  assert.ok(review.reason.length>100,item.id);
  assert.equal(item.supportedKinds.includes('article-cover'),review.cover,item.id);
  assert.equal(item.supportedKinds.includes('article-illustration'),review.illustration,item.id);
 }
 // A future renderer with a familiar-looking name must not be opted in by
 // a broad prefix/name rule before its actual output has been reviewed.
 assert.deepEqual(articleCompositionCuration({rendererKey:'catalog:new-editorial-cover'}),{
  category:'unreviewed',cover:false,illustration:false,requirements:[],
  reason:'This renderer has not been audited for article roles. Preserve its existing capabilities until its actual structure and rendering path have been reviewed.',
 });
});

test('covers include source-backed feature, comparison and data summaries instead of only hero paragraphs',()=>{
 const cases=[
  ['social:bento','editorial-copy'],
  ['social:research-highlight','empty-promotion-slots'],
  ['social:comparison','aligned-comparison'],
  ['social:metric','source-quantities'],
  ['social:usage-breakdown','source-quantities'],
  ['social:organization','source-relationships'],
  ['social:editorial-quote','source-quotation'],
  ['reference:authored-reference-photo','source-asset'],
  ['reference:authored-reference-vision','editorial-copy'],
  ['reference:authored-reference-comparison','aligned-comparison'],
  ['reference:authored-reference-share','source-quantities'],
 ];
 for(const [id,requirement] of cases){
  const [definition]=applicableCompositions('article-cover',16/9,id);
  assert.equal(definition?.id,id);
  assert.ok(articleCompositionCuration(definition).requirements.includes(requirement),id);
 }
});

test('detailed structures remain body images and original ratio limits remain hard gates',()=>{
 for(const id of ['new-reference:ledger-chart','reference:authored-reference-code','reference:authored-reference-matrix','social:schedule','social:faq','campaign:triptych','semantic:presentation:authored-explore-timeline']){
  assert.equal(applicableCompositions('article-cover',16/9,id).length,0,id);
  assert.equal(applicableCompositions('article-illustration',16/9,id).length,1,id);
 }
 assert.equal(applicableCompositions('article-illustration',1,'new-reference:ledger-chart').length,0);
 assert.equal(applicableCompositions('article-cover',1,'semantic:presentation:authored-explore-cover').length,0);
 assert.equal(applicableCompositions('article-cover',1,'social:bento').length,1);
});

test('platform, promotion, portrait, brand and duplicate bookend output is not relabeled as article content',()=>{
 for(const id of ['social:chat-messenger','social:chat-imessage','social:chat-telegram','social:chat-workplace','social:pricing','social:offer','social:price-increase','social:dark-promo','social:neon-workflow','social:navy-service','social:team','social:webinar','new-reference:speaker-spotlight','new-reference:speaker-lineup','event:provider','semantic:presentation:brand-collection-grid','semantic:presentation:bookend-closing-panel']){
  const definition=FORMAL_COMPOSITIONS.find(item=>item.id===id);
  assert.ok(definition,id);
  assert.equal(applicableCompositions('article-cover',16/9,id).length,0,id);
  assert.equal(applicableCompositions('article-illustration',16/9,id).length,0,id);
  assert.ok(definition.supportedKinds.includes('social')||definition.supportedKinds.includes('presentation'),id);
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
