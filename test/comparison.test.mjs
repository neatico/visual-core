import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseSource,validateContentPlan,validateEditableContentPage,contentBlockText,canonicalRecipeId,designCandidates} from '../dist/index.js';
test('comparison facts survive validation and reject ungrounded prices or misaligned rows',()=>{
 const source=parseSource('Team $29 unlimited projects. Basic $19 10 projects. Priority support is included for Team and excluded for Basic.');
 const evidence=[{sourceId:'source-1'}];
 const block={id:'compare',kind:'comparison',evidence,columns:[{title:'Team',price:'$29',points:['Projects','Priority support'],values:['unlimited',''],statuses:['included','included']},{title:'Basic',price:'$19',points:['Projects','Priority support'],values:['10',''],statuses:['included','excluded']}]};
 const page={id:'page',title:'Plans',purpose:'compare',evidence,blocks:[block]};
 const plan={version:1,kind:'presentation',title:'Plans',pages:[page]};
 assert.deepEqual(validateContentPlan(plan,source).pages[0].blocks[0],block);
 assert.deepEqual(validateEditableContentPage(page).blocks[0],block);
 assert.ok(contentBlockText(block).includes('$29'));
 const invalid=structuredClone(plan);invalid.pages[0].blocks[0].columns[0].price='$99';
 assert.throws(()=>validateContentPlan(invalid,source),/CONTENT_UNSUPPORTED_COMPARISON/);
 const malformed=structuredClone(page);malformed.blocks[0].columns[0].statuses=['included'];
 assert.throws(()=>validateEditableContentPage(malformed),/CONTENT_INVALID_LIST/);
 assert.ok(designCandidates(page,{kind:'presentation',ratio:16/9}).every(r=>r.renderer!=='catalog'));
});
test('equivalent code, comparison and social hero recipes resolve transitively',()=>{
 assert.equal(canonicalRecipeId('semantic-code-editorial','presentation'),'authored-code-editorial');
 assert.equal(canonicalRecipeId('semantic-comparison-stack','presentation'),'authored-comparison-panels');
 assert.equal(canonicalRecipeId('semantic-hero-split','social'),'semantic-hero-editorial');
});

test('comparison editor accepts intermediate empty input without weakening final validation',()=>{
 const evidence=[{sourceId:'source-1'}];
 const page={id:'page',title:'Plans',purpose:'compare',evidence,blocks:[{id:'comparison',kind:'comparison',evidence,columns:[{title:'',points:[''],price:''},{title:'Basic',points:['Project']}]}]};
 assert.equal(validateEditableContentPage(page,{allowIncomplete:true}).blocks[0].columns[0].title,'');
 assert.throws(()=>validateEditableContentPage(page),/CONTENT_INVALID_TEXT/);
});
