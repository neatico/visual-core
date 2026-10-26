import {test} from 'node:test';import assert from 'node:assert/strict';
import {COMPOSITION_SCENES,AUTHORED_COMPOSITIONS,DESIGN_RECIPES} from '../dist/index.js';
test('common scenes have stable unique IDs and declared material/output requirements',()=>{
 assert.equal(new Set(COMPOSITION_SCENES.map(scene=>scene.id)).size,COMPOSITION_SCENES.length);
 for(const scene of COMPOSITION_SCENES){assert.ok(scene.kinds.length);assert.ok(scene.outputs.length);if(scene.requiresAsset)assert.ok(scene.kinds.includes('image'));}
});
test('every authored composition is available to both outputs through the same contract',()=>{
 for(const composition of AUTHORED_COMPOSITIONS)for(const kind of ['presentation','social']){
  const recipe=DESIGN_RECIPES.find(recipe=>recipe.id===`authored-${composition.id}`&&recipe.kind===kind);
  assert.ok(recipe);assert.equal(recipe.renderer,'semantic');assert.deepEqual(recipe.accepts,[composition.kind,'paragraph']);assert.equal(recipe.maxEntries,composition.max);
 }
});

test('scene direction survives validation and prefers compositions without rewriting content',async()=>{
 const {validateEditableContentPage,sceneRecipePreference,parseSource,validateContentPlan}=await import('../dist/index.js');
 const evidence=[{sourceId:'source-1'}];
 const page={id:'page',title:'Launch',purpose:'explain',scene:'product-launch',evidence,blocks:[{id:'features',kind:'features',evidence,entries:[{title:'Review',description:'Keep evidence'}]}]};
 assert.equal(validateEditableContentPage(page).scene,'product-launch');
 assert.throws(()=>validateEditableContentPage({...page,scene:'invented'}),/CONTENT_INVALID_SCENE/);
 assert.ok(sceneRecipePreference('product-launch','authored-feature-bento')>sceneRecipePreference('product-launch','authored-feature-index'));
 assert.equal(sceneRecipePreference(undefined,'authored-feature-index'),0);
 const source=parseSource('Launch Review Keep evidence');
 page.evidence=[{sourceId:source.segments[0].id}];page.blocks[0].evidence=page.evidence;
 assert.equal(validateContentPlan({version:1,kind:'presentation',title:'Launch',pages:[page]},source).pages[0].scene,'product-launch');
});
