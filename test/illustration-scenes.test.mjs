import {test} from 'node:test';
import assert from 'node:assert/strict';
import {COMPOSITION_ILLUSTRATIONS,FORMAL_COMPOSITIONS,illustrationSubject,resolveIllustrationScene} from '../dist/index.js';
test('all illustration contracts expose the same supported subjects',()=>{
 const contract=FORMAL_COMPOSITIONS.find(c=>c.id==='article-features-0');
 const field=contract.parameterSchema.properties.blocks.items[0].properties.entries.items.properties.illustration;
 assert.deepEqual(field.enum,[...COMPOSITION_ILLUSTRATIONS]);
 assert.equal(field.default,'symbol');
 for(const subject of ['camping','landscape','route','climate','access','software'])assert.ok(field.enum.includes(subject));
});
test('only explicit scene IDs resolve; prose and contextual topics cannot override them',()=>{
 for(const subject of COMPOSITION_ILLUSTRATIONS){assert.equal(resolveIllustrationScene(subject),subject);assert.equal(illustrationSubject(subject),subject);}
 for(const text of ['Arid desert landscape','Regional Connection','户外露营','当地土地准入规则','An unknown subject']){
  assert.equal(resolveIllustrationScene(text),undefined);
  assert.equal(illustrationSubject(text,'Remote Solo Camping'),undefined);
 }
});
