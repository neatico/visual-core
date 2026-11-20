import test from 'node:test';
import assert from 'node:assert/strict';
import {validateEditableContentPage} from '../dist/index.js';
const page={id:'page',title:'Request',purpose:'instruct',evidence:[{sourceId:'source-1'}],blocks:[{id:'code',kind:'code',sourceId:'source-1',language:'bash',code:'curl https://edited.example',evidence:[{sourceId:'source-1'}]}]};
test('retains explicit user edits and strips unknown nested properties',()=>{const parsed=validateEditableContentPage({...page,unsafe:true,blocks:[{...page.blocks[0],url:'https://untrusted.example'}]});assert.equal(parsed.blocks[0].code,page.blocks[0].code);assert.equal(parsed.unsafe,undefined);assert.equal(parsed.blocks[0].url,undefined);});
test('rejects malformed nested arrays, duplicate identities and non-finite values',()=>{for(const block of [{...page.blocks[0],id:'page'},{id:'bad',kind:'steps',evidence:page.evidence,entries:[{title:4,description:''}]},{id:'bad',kind:'chart',evidence:page.evidence,chart:'bar',unit:'',values:[{label:'A',value:Infinity},{label:'B',value:2}]}])assert.throws(()=>validateEditableContentPage({...page,blocks:[block]}));});
test('available images require a resolved asset identity and never retain model URLs',()=>{assert.throws(()=>validateEditableContentPage({...page,blocks:[{id:'image',kind:'image',evidence:page.evidence,sourceId:'source-1',alt:'Screenshot',treatment:'screenshot',status:'available'}]}));});
test('in-progress editing can restore empty copy and invalid numeric drafts without weakening output validation',()=>{const draft={...page,title:'',blocks:[{id:'chart',kind:'chart',evidence:page.evidence,chart:'bar',unit:'',values:[{label:'',value:NaN},{label:'B',value:2}]}]};assert.throws(()=>validateEditableContentPage(draft));const restored=validateEditableContentPage(draft,{allowIncomplete:true});assert.equal(restored.title,'');assert.ok(Number.isNaN(restored.blocks[0].values[0].value));assert.throws(()=>validateEditableContentPage({...draft,purpose:'unknown'},{allowIncomplete:true}));});

test('literal explanatory visual descriptors survive editing without changing source facts',()=>{
 for(const illustration of ['sequence','comparison','structure']){
  const block={id:'method',kind:'features',evidence:page.evidence,entries:[{title:'Source method',description:'Source explanation.',illustration}]};
  assert.deepEqual(validateEditableContentPage({...page,blocks:[block]}).blocks,[block]);
 }
 const repaired=validateEditableContentPage({...page,blocks:[{id:'method',kind:'features',evidence:page.evidence,entries:[{title:'Method',description:'Explanation.',illustration:'invented-scene'}]}]});
 assert.deepEqual(repaired.blocks[0].entries,[{title:'Method',description:'Explanation.'}]);
});

test('approved long-form content retains every independent block before measured pagination',()=>{
 const blocks=Array.from({length:64},(_,i)=>({id:`unit-${i}`,kind:'paragraph',text:`未確定 Ω ${i} — Preserve every condition.`,evidence:page.evidence}));
 const parsed=validateEditableContentPage({...page,blocks});
 assert.deepEqual(parsed.blocks,blocks);
 assert.deepEqual(validateEditableContentPage(JSON.parse(JSON.stringify(parsed))),parsed);
 assert.throws(()=>validateEditableContentPage({...page,blocks:[...blocks,{...blocks[0],id:'extra'}]}));
});
test('explicit action and qualification roles survive editing; prose alone never assigns a role',()=>{
 for(const role of ['action','qualification',undefined]){
  const block={id:'copy',kind:'paragraph',text:'未知名称 — Join the review',evidence:page.evidence,...(role?{role}:{})};
  assert.deepEqual(validateEditableContentPage({...page,blocks:[block]}).blocks,[block]);
 }
 assert.throws(()=>validateEditableContentPage({...page,blocks:[{id:'copy',kind:'paragraph',text:'Ω',evidence:page.evidence,role:'invented'}]}),/CONTENT_INVALID_PARAGRAPH_ROLE/);
});

test('authored content without evidence annotations remains editable and serializable',()=>{
 const page={id:'creative',title:'Nieuwe ideeën Ω',purpose:'explain',blocks:[{id:'quote',kind:'quote',text:'Samen maken we ruimte.',attribution:'Mira Ω',role:'Host'}]};
 const normalized=validateEditableContentPage(page);
 assert.deepEqual(normalized.evidence,[]);assert.deepEqual(normalized.blocks[0].evidence,[]);
 assert.equal(normalized.blocks[0].attribution,'Mira Ω');
 assert.deepEqual(validateEditableContentPage(JSON.parse(JSON.stringify(normalized))),normalized);
});
