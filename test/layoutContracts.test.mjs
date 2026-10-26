import {test} from 'node:test';import assert from 'node:assert/strict';
import {SOCIAL_LAYOUT_CATALOG,LAYOUT_CONTRACTS,eligibleLayouts,layoutCandidates} from '../dist/index.js';
test('every published renderer has exactly one content contract',()=>{assert.equal(SOCIAL_LAYOUT_CATALOG.length,39);assert.equal(LAYOUT_CONTRACTS.length,39);assert.equal(new Set(LAYOUT_CONTRACTS.map(x=>x.kind+':'+x.id)).size,LAYOUT_CONTRACTS.length);});
test('cover cannot drop supplied items and metric cannot invent a value',()=>{
 assert.ok(!eligibleLayouts('presentation',{title:'Facts',items:[{title:'Limit',description:'Draft'}]},16/9).some(l=>l.id==='cover'));
 assert.ok(!eligibleLayouts('social',{headline:'Facts'},1).some(l=>l.id==='metric'));
});
test('candidates are bounded and preserve compatible intent',()=>{
 const content={headline:'Compare',scene:'comparison',items:[{title:'One'},{title:'Two'}]};
 const ids=layoutCandidates('social','comparison',content,1);assert.equal(ids[0],'comparison');assert.ok(ids.length<=8);assert.equal(new Set(ids).size,ids.length);
 assert.deepEqual(eligibleLayouts('presentation',{title:'Facts'},1),[]);
});
