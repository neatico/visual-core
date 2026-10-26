import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseSource,validateContentPlan,validateEditableContentPage,designCandidates} from '../dist/index.js';
const source=parseSource('研究报告\n青禾工作室，汇报人林舟，产品设计师。');
const page={id:'cover',title:'研究报告',purpose:'cover',evidence:[{sourceId:'source-1'}],blocks:[{id:'intro',kind:'paragraph',text:'研究报告',evidence:[{sourceId:'source-1'}]}],bookend:{organization:'青禾工作室',presenter:'林舟',role:'产品设计师'}};
test('source-backed bookend identity survives generation and editor roundtrip',()=>{
 const plan=validateContentPlan({version:1,kind:'presentation',title:'研究报告',pages:[page]},source);
 assert.deepEqual(plan.pages[0].bookend,page.bookend);
 assert.deepEqual(validateEditableContentPage({...page,bookend:{...page.bookend,logoAssetId:'brand-logo'}}).bookend,{...page.bookend,logoAssetId:'brand-logo'});
 for(const bookend of [{presenter:'虚构人物'},{logoAssetId:'invented-logo'}])assert.throws(()=>validateContentPlan({version:1,kind:'presentation',title:'研究报告',pages:[{...page,bookend}]},source));
});
test('bookend role selects distinct cover and closing families',()=>{
 for(const purpose of ['cover','conclude']){
  const recipes=designCandidates({...page,purpose},{kind:'presentation',ratio:16/9}).filter(r=>r.id.startsWith('bookend-'));
  assert.equal(recipes.length,3);assert.ok(recipes.every(r=>r.id.startsWith(purpose==='cover'?'bookend-cover-':'bookend-closing-')));
 }
});
