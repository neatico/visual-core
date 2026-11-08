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
    assert.equal(contract.parameterSchema.properties.blocks.minItems,contract.parameterSchema.properties.blocks.items.length);
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
