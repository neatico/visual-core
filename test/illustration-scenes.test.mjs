import {test} from 'node:test';
import assert from 'node:assert/strict';
import {COMPOSITION_ILLUSTRATIONS,FORMAL_COMPOSITIONS,illustrationSubject} from '../dist/index.js';
test('all illustration contracts expose the same supported subjects',()=>{
 const contract=FORMAL_COMPOSITIONS.find(c=>c.id==='article-features-0');
 const field=contract.parameterSchema.properties.blocks.items[0].properties.entries.items.properties.illustration;
 assert.deepEqual(field.enum,[...COMPOSITION_ILLUSTRATIONS]);
 assert.equal(field.default,'symbol');
 for(const subject of ['camping','landscape','route','climate','access','software'])assert.ok(field.enum.includes(subject));
});
test('legacy outdoor captions resolve concrete subjects without depending on row order',()=>{
 for(const [copy,subject] of [['Arid desert landscape','landscape'],['Regional Connection','route'],['Access Note','access'],['Arid Character','climate'],['Open areas for quiet camping','camping'],['户外露营','camping'],['沙漠景观','landscape'],['旅行路线','route'],['当地土地准入规则','access']])assert.equal(illustrationSubject(copy),subject,copy);
 assert.equal(illustrationSubject('Disconnect Opportunity','Remote Solo Camping'),'camping');
 assert.equal(illustrationSubject('A general idea'),undefined);
});
