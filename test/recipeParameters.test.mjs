import test from 'node:test';
import assert from 'node:assert/strict';
import {DESIGN_RECIPES,RECIPE_PARAMETER_CONTRACTS,FORMAL_COMPOSITIONS} from '../dist/index.js';
test('every shared recipe has a unique complete data-only parameter contract',()=>{
  assert.equal(RECIPE_PARAMETER_CONTRACTS.length,new Set(DESIGN_RECIPES.map(recipe=>recipe.id)).size);
  for(const contract of RECIPE_PARAMETER_CONTRACTS){
    assert.ok(contract.id&&contract.rendererKey&&contract.semanticDescription);
    assert.equal(contract.schemaVersion,1);
    assert.deepEqual(contract.parameterSchema.required,['title','blocks']);
    assert.ok(Array.isArray(contract.parameterSchema.properties.blocks.items));
    assert.equal(contract.parameterSchema.properties.blocks.minItems,['authored-explore-cover','authored-image-editorial','authored-image-inset','authored-image-campaign'].includes(contract.id)?1:contract.parameterSchema.properties.blocks.items.length);
    assert.equal(contract.parameterSchema.properties.blocks.maxItems,contract.parameterSchema.properties.blocks.items.length);
    assert.deepEqual([...contract.supportedKinds].sort(),DESIGN_RECIPES.filter(recipe=>recipe.id===contract.id).map(recipe=>recipe.kind).sort());
    assert.equal(contract.importance.title+contract.importance.blocks,10);
    assert.equal(JSON.stringify(contract).includes('undefined'),false);
  }
});

test('code parameters bound line count and column width without rejecting ordinary code',()=>{
 const contract=RECIPE_PARAMETER_CONTRACTS.find(item=>item.parameterSchema.properties.blocks.items.some(block=>block.properties.kind.const==='code'));
 const schema=contract.parameterSchema.properties.blocks.items.find(block=>block.properties.kind.const==='code');
 const pattern=new RegExp(schema.properties.code.pattern);
 assert.ok(pattern.test('const capacity = 12;\nconsole.log(capacity);'));
 assert.equal(pattern.test('x'.repeat(57)),false);
 assert.equal(pattern.test(Array(9).fill('x').join('\n')),false);
});

test('measured editorial paragraphs allow a complete sentence without widening every recipe',()=>{
 for(const id of ['authored-reference-detail-sidebar','authored-reference-diagonal','authored-prose-inset']){
  const contract=FORMAL_COMPOSITIONS.find(item=>item.recipe?.id===id);
  const paragraph=contract.parameterSchema.properties.blocks.items.find(block=>block.properties.kind.const==='paragraph');
  assert.equal(paragraph.properties.text.maxLength,160,id);
 }
 const compact=RECIPE_PARAMETER_CONTRACTS.find(item=>item.id==='semantic-prose-stack');
 assert.equal(compact.parameterSchema.properties.blocks.items[0].properties.text.maxLength,120);
});


test('formal contracts retain the visible supporting slots and comparison fields of the gallery',async()=>{
 const {FORMAL_COMPOSITIONS}=await import('../dist/index.js');
 const blocks=id=>FORMAL_COMPOSITIONS.find(item=>item.id===id).parameterSchema.properties.blocks.items;
 assert.deepEqual(blocks('new-reference:technical-log').map(item=>item.properties.kind.const),['paragraph','code']);
 assert.deepEqual(blocks('new-reference:architecture-stack').map(item=>item.properties.kind.const),['steps','paragraph']);
 assert.deepEqual(blocks('reference:authored-reference-story').map(item=>item.properties.kind.const),['image','paragraph','features']);
 const column=blocks('reference:authored-reference-comparison')[0].properties.columns.items.properties;
 assert.ok(column.values&&column.price&&column.statuses);
});

test('measured table and sequence contracts preserve detail without widening authored cards',()=>{
 for(const kind of ['parameters','steps'])for(const mode of ['stack','split']){
  const contract=FORMAL_COMPOSITIONS.find(item=>item.id===`semantic:presentation:semantic-${kind}-${mode}`);
  const block=contract.parameterSchema.properties.blocks.items[0];
  const rows=block.properties[kind==='steps'?'entries':'rows'];
  assert.equal(rows.minItems,2);assert.equal(rows.maxItems,mode==='stack'?8:6);
  assert.equal(rows.items.properties.description.maxLength,kind==='steps'?80:24);
 }
 const fixed=FORMAL_COMPOSITIONS.find(item=>item.id==='semantic:presentation:authored-steps-ribbon').parameterSchema.properties.blocks.items[0].properties.entries;
 assert.equal(fixed.minItems,3);assert.equal(fixed.maxItems,3);
});

 test('comparison playbook uses explicit status and a single prominent value per column',async()=>{
 const {FORMAL_COMPOSITIONS}=await import('../dist/index.js');
 const definition=FORMAL_COMPOSITIONS.find(item=>item.id==='new-reference:comparison-playbook');
 assert.deepEqual(definition.supportedKinds,['presentation','social']);
 const blocks=definition.parameterSchema.properties.blocks.items;
 assert.deepEqual(blocks.map(item=>item.properties.kind.const),['comparison','paragraph','steps','paragraph']);
 const values=blocks[0].properties.columns.items.properties.values;
 assert.equal(values.items[0].maxLength,24);
 assert.equal(values.items[1].const,'');
 assert.equal(values.additionalItems,false);
 assert.equal(blocks[2].properties.entries.maxItems,5);
 assert.deepEqual(blocks[0].properties.columns.items.properties.tone.enum,['positive','negative','caution','neutral']);
 assert.equal(blocks[0].properties.columns.items.properties.statuses,undefined);
 });

test('lineup slots preserve two, three and four distinct people through serialized content',async()=>{
 const {validateEditableContentPage}=await import('../dist/index.js');
 const contract=FORMAL_COMPOSITIONS.find(item=>item.id==='new-reference:speaker-lineup');
 const slots=contract.parameterSchema.properties.blocks;
 assert.equal(slots.minItems,3);assert.equal(slots.maxItems,5);assert.equal(slots.additionalItems,false);
 for(const count of [2,3,4]){
  const blocks=[{id:'facts',kind:'parameters',evidence:[],rows:[{name:'本页人物 / people',value:String(count),description:''}]},
   ...Array.from({length:count},(_,i)=>({id:`person-${i}`,kind:'quote',evidence:[],text:'A complete statement.',attribution:['未知 Δ','Nøva','モリ','Élan'][i],role:'Role',avatarAssetId:`person-${i}`}))];
  assert.ok(blocks.length>=slots.minItems&&blocks.length<=slots.maxItems);
  blocks.forEach((block,i)=>assert.equal(block.kind,slots.items[i].properties.kind.const));
  const restored=validateEditableContentPage(JSON.parse(JSON.stringify({id:'roster',title:'People',purpose:'explain',evidence:[],blocks})));
  assert.deepEqual(restored.blocks,blocks);
 }
});


test('relationship diagrams declare their meaning and preserve it through save and reopen',async()=>{
 const {validateEditableContentPage,applicableCompositions}=await import('../dist/index.js');
 for(const shape of ['funnel','pyramid','cycle']){
  const definition=FORMAL_COMPOSITIONS.find(c=>c.id===`diagram:${shape}`);
  const block=definition.parameterSchema.properties.blocks.items[0];
  assert.equal(block.properties.relationship.const,shape);
  assert.ok(block.required.includes('relationship'));
  assert.equal(block.properties.entries.minItems,3);assert.equal(block.properties.entries.maxItems,5);
  for(const kind of ['presentation','social','article-illustration'])for(const ratio of [.5625,1,16/9])assert.equal(applicableCompositions(kind,ratio,definition.id).length,1);
  const page={id:'unknown',title:'Nøva Ω',purpose:'explain',evidence:[],blocks:[{id:'diagram',kind:shape==='pyramid'?'features':'steps',relationship:shape,evidence:[],entries:['α','β','γ'].map(title=>({title,description:'Full detail'}))}]};
  assert.deepEqual(validateEditableContentPage(JSON.parse(JSON.stringify(page))).blocks,page.blocks);
  page.blocks[0].relationship='inferred';assert.throws(()=>validateEditableContentPage(page),/CONTENT_INVALID_RELATIONSHIP/);
 }
});

test('recruitment compositions use explicit role slots and preserve arbitrary names and languages',()=>{
 for(const id of ['hiring-role','hiring-openings','hiring-benefits']){
  const contract=FORMAL_COMPOSITIONS.find(c=>c.id===`social:${id}`);
  assert.equal(contract.parameterModel,'native-social');
  assert.equal(contract.parameterSchema.properties.items.minItems,3);
  assert.equal(contract.parameterSchema.properties.items.items.properties.description.maxLength,96);
  assert.ok(contract.semanticDescription.length>80);
 }
});
