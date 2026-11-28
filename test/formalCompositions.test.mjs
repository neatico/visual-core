import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {isReferencePoster,FORMAL_COMPOSITIONS,applicableCompositions,articleCompositionCuration,ARTICLE_COMPOSITION_CURATION} from '../dist/index.js';
test('formal inventory preserves every gallery ID and separates output capabilities',()=>{
 for(const id of ['edition:questions','edition:competitors']) assert.ok(FORMAL_COMPOSITIONS.some(item=>item.id===id));
 assert.equal(FORMAL_COMPOSITIONS.length,260);
 assert.equal(new Set(FORMAL_COMPOSITIONS.map(item=>item.id)).size,260);
 assert.equal(applicableCompositions('presentation',16/9).length,134);
 assert.equal(applicableCompositions('presentation',1).length,98);
 assert.equal(applicableCompositions('social',16/9).length,175);
 assert.equal(applicableCompositions('social',1).length,171);
 assert.equal(applicableCompositions('article-cover',16/9).length,101);
 assert.equal(applicableCompositions('article-cover',1).length,91);
 assert.equal(applicableCompositions('article-illustration',16/9).length,189);
 assert.equal(applicableCompositions('article-illustration',1).length,168);
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
 // Reviewed migration: lineups accept 2–4 people; shared icon IDs include
 // subject-specific media, logistics and finance glyphs; decoration defaults
 // to none. Existing renderer identities and three-person data remain valid.
 // Three photographic layouts accept an optional informative caption after the image.
 // Portrait contracts cover Korean regional assets alongside Chinese and Japanese.
 // Bento cards may bind a catalog photograph for each item. The empty default
 // preserves saved graphic-only cards.
 // X16 accepts an optional deadline heading on its action paragraph.
 // A deliberate future contract migration must update this
 // baseline explicitly; curation alone must never silently rewrite one.
 const original=JSON.stringify(FORMAL_COMPOSITIONS.filter(item=>!item.exhibit&&!['authored-explore-evidence-spread','authored-explore-decision-path'].includes(item.recipe?.id)&&!item.id.startsWith('edition:')&&!item.id.startsWith('diagram:')&&!['social:color-block-index','social:marker-broadside','social:hiring-role','social:hiring-openings','social:hiring-benefits','social:before-after','social:recipe','social:service-hours'].includes(item.id)&&!isReferencePoster(item.id.replace(/^social:/,''))).map(({supportedKinds,...definition})=>definition));
 assert.equal(createHash('sha256').update(original).digest('hex'),'7e7e7ed36c3da7483be14fe6cea808bf0bc81bbbfac67968448ca6855cb69922');
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

test('covers include authored feature, comparison and data summaries instead of only hero paragraphs',()=>{
 const cases=[
  ['social:bento','editorial-copy'],
  ['social:research-highlight','empty-promotion-slots'],
  ['social:comparison','aligned-comparison'],
  ['social:metric','quantities'],
  ['social:usage-breakdown','quantities'],
  ['social:organization','relationships'],
  ['social:editorial-quote','quotation'],
  ['reference:authored-reference-photo','source-asset'],
  ['reference:authored-reference-vision','editorial-copy'],
  ['reference:authored-reference-comparison','aligned-comparison'],
  ['reference:authored-reference-share','quantities'],
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
 assert.match(description('social:pricing'),/Develop useful prices/);
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


test('bookend contracts separate subtitle and optional identity from headline',()=>{
 const contracts=FORMAL_COMPOSITIONS.filter(c=>c.id.startsWith('semantic:presentation:bookend-'));
 assert.equal(contracts.length,6);
 for(const {parameterSchema:s} of contracts){
  assert.equal(s.properties.title.maxLength,44);
  const subtitle=s.properties.blocks.items[0];
  assert.equal(subtitle.properties.kind.const,'paragraph');
  assert.equal(subtitle.properties.heading,undefined);
  assert.deepEqual(s.properties.bookend.required,[]);
  assert.equal(s.properties.bookend.properties.date.maxLength,48);
  assert.equal(s.properties.bookend.additionalProperties,false);
 }
});

test('widescreen presentation exhibits own their data contracts and compile to the portable canvas',()=>{
 const expected=[['exhibit:locator','locator','places',8],['exhibit:paired-change','paired','rows',7],['exhibit:scenario-matrix','scenario-matrix','rows',6],
 ['exhibit:multi-line','multi-line','categories',12],['exhibit:share-mosaic','share-mosaic','columns',6],
 ['exhibit:chevron-process','chevron-process','steps',5],['exhibit:kpi-brief','kpi-brief','metrics',4],['exhibit:ratio-definitions','ratio-definitions','rows',3],['exhibit:reconciled-breakdown','reconciled-breakdown','rows',6],['exhibit:bar-evidence','bar-evidence','rows',5],['exhibit:interface-hub','interface-hub','links',6],['exhibit:interval-roadmap','interval-roadmap','tasks',7],['exhibit:investment-return','investment-return','periods',6],['exhibit:risk-matrix','risk-matrix','risks',16]];
 for(const [id,kind,rows,max] of expected){
  const [entry]=applicableCompositions('presentation',16/9,id);
  assert.deepEqual(entry.supportedKinds,['presentation']);
  assert.equal(entry.rendererKey,id);
  assert.equal(entry.capacity.requiresImage,false);
  assert.equal(entry.exhibit.canvasId,'semantic:presentation:authored-image-inset');
  const [data,takeaway]=entry.parameterSchema.properties.blocks.items;
  assert.equal(data.properties.kind.const,kind);
  assert.equal(data.properties[rows].maxItems,max);
  assert.equal(entry.capacity.minEntries,data.properties[rows].minItems);
  assert.equal(takeaway.properties.kind.const,'paragraph');
  assert.equal(applicableCompositions('presentation',1,id).length,0);
 }
});
