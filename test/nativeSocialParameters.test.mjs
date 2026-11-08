import test from 'node:test';
import assert from 'node:assert/strict';
import {SOCIAL_LAYOUT_CATALOG,nativeSocialParameterContract} from '../dist/index.js';

test('every authored social layout has a closed native slot contract',()=>{
 for(const layout of SOCIAL_LAYOUT_CATALOG){
  const contract=nativeSocialParameterContract(layout.id),schema=contract.parameterSchema;
  assert.equal(contract.parameterModel,'native-social');
  assert.equal(schema.additionalProperties,false);
  assert.deepEqual(schema.required,Object.keys(schema.properties));
  assert.ok(!('blocks' in schema.properties));
  assert.deepEqual(Object.keys(contract.importance),Object.keys(contract.generationPolicy));
  assert.ok(Object.keys(contract.importance).every(key=>Object.hasOwn(schema.properties,key)));
 }
 assert.throws(()=>nativeSocialParameterContract('unknown'));
});

test('numeric visual slots are typed separately from descriptive copy',()=>{
 for(const id of ['usage-breakdown','split-bar-compare','benchmark-bars']){
  const properties=nativeSocialParameterContract(id).parameterSchema.properties.items.items.properties;
  assert.deepEqual([properties.primaryValue.minimum,properties.primaryValue.maximum],[0,100]);
  assert.equal(properties.primaryValue.type,'number');
  if(id!=='usage-breakdown')assert.equal(properties.secondaryValue.type,'number');
 }
});

test('hero and portrait slots always permit the source-attributed native placeholder',()=>{
 for(const id of ['launch','webinar','editorial','note-photo'])assert.ok(nativeSocialParameterContract(id).parameterSchema.properties.imageAssetId.description.includes('neatico-editorial-placeholder'));
 assert.equal(nativeSocialParameterContract('ticket').parameterSchema.properties.items.maxItems,2);
 assert.equal(nativeSocialParameterContract('research-highlight').parameterSchema.properties.items.maxItems,2);
});

test('local rendering rejects missing native slots and impossible percentages',async()=>{
 const {validateNativeSocialParameters,nativeSocialContentPage}=await import('../dist/index.js');
 assert.throws(()=>validateNativeSocialParameters('metric',{title:'Sources',body:'Keep context.'}));
 const values=validateNativeSocialParameters('metric',{title:'Sources',body:'Keep context.',value:'42%'});
 const original={id:'page',title:'Original',purpose:'explain',evidence:[{sourceId:'source'}],blocks:[]};
 const page=nativeSocialContentPage(values,original);
 assert.equal(page.blocks.find(block=>block.id==='native-value').text,'42%');
 const items=[0,1,2].map(index=>({title:`Category ${index}`,description:'',primaryValue:50}));
 assert.throws(()=>validateNativeSocialParameters('usage-breakdown',{title:'Sources',body:'Illustrative allocation.',items}));
});

test('native string lengths use Unicode code points consistently with provider JSON schema validation',async()=>{
 const {validateNativeSocialParameters}=await import('../dist/index.js');
 const title='\u{1F4C4}'.repeat(40);
 assert.equal(validateNativeSocialParameters('metric',{title,body:'Keep source context.',value:'3 steps'}).title,title);
 assert.throws(()=>validateNativeSocialParameters('metric',{title:title+'x',body:'Keep source context.',value:'3 steps'}));
});

test('measured sentence slots retain complete source sentences while compact labels stay bounded',()=>{
 const sentence='Collect source documents, review the current version, and share decisions with the team.';
 for(const id of ['note-question','note-marker','note-editorial','chat-imessage','chat-telegram','news-focus','manifesto','launch','spotlight','comparison','myth','editorial','story','notice']){
  const schema=nativeSocialParameterContract(id).parameterSchema.properties;
  assert.ok(schema.body.maxLength>=Array.from(sentence).length);
  assert.equal(schema.body.maxLength,96);
 }
 assert.equal(nativeSocialParameterContract('organization').parameterSchema.properties.body.maxLength,32);
 assert.equal(nativeSocialParameterContract('bento').parameterSchema.properties.items.items.properties.description.maxLength,40);
 assert.equal(nativeSocialParameterContract('note-question').parameterSchema.properties.title.maxLength,44);
});

test('FAQ question patterns match complete questions for full-match provider grammars',()=>{
 const pattern=nativeSocialParameterContract('faq').parameterSchema.properties.items.items.properties.title.pattern;
 const regex=new RegExp(pattern,'u');
 const question='What should I save?';
 assert.equal(question.match(regex)?.[0],question);
 assert.equal(regex.test('?'),false);
 assert.equal(regex.test('Save documents'),false);
});


test('FAQ slots accept measured complete questions without accepting placeholder questions',async()=>{
 const {validateNativeSocialParameters}=await import('../dist/index.js');
 const values={title:'Project knowledge workflow FAQ',body:'Three steps for keeping shared knowledge useful.',eyebrow:'Project workflow',cta:'',items:[
  {title:'How do I collect source documents?',description:'Gather all relevant source materials in one shared location.'},
  {title:'When should I review the version?',description:'Review the current version of all project knowledge resources.'},
  {title:'Who gets shared decisions?',description:'Share all confirmed decisions openly with the full team.'},
 ]};
 assert.deepEqual(validateNativeSocialParameters('faq',values),{...values,textPresentation:[]});
 assert.throws(()=>validateNativeSocialParameters('faq',{...values,items:values.items.map(item=>({...item,title:'?'}))}));
 assert.throws(()=>validateNativeSocialParameters('faq',{...values,items:values.items.map(item=>({...item,description:'x'.repeat(65)}))}));
});


test('marker emphasis is a bounded exact title phrase and old candidates gain a safe default',async()=>{
 const {validateNativeSocialParameters}=await import('../dist/index.js');
 const values={title:'Make knowledge useful',body:'Connect source documents.'};
 assert.deepEqual(validateNativeSocialParameters('note-marker',values).emphasis,[]);
 assert.deepEqual(validateNativeSocialParameters('note-marker',{...values,emphasis:['knowledge']}).emphasis,['knowledge']);
 assert.throws(()=>validateNativeSocialParameters('note-marker',{...values,emphasis:['invented']}),/CANDIDATE_INVALID_EMPHASIS/);
});

test('preferred title lines preserve complete words and source copy',async()=>{
 const {validateNativeSocialParameters}=await import('../dist/index.js');
 const values={title:'Make knowledge useful',body:'Connect source documents.'};
 assert.deepEqual(validateNativeSocialParameters('note-marker',{...values,titleLines:['Make knowledge','useful']}).titleLines,['Make knowledge','useful']);
 assert.throws(()=>validateNativeSocialParameters('note-marker',{...values,titleLines:['Make know','ledge useful']}),/CANDIDATE_INVALID_TITLE_LINES/);
 assert.throws(()=>validateNativeSocialParameters('note-marker',{...values,titleLines:['Make useful']}),/CANDIDATE_INVALID_TITLE_LINES/);
 const title='\u77e5\u8bc6\u8fde\u63a5\u51b3\u7b56';
 assert.equal(validateNativeSocialParameters('note-marker',{...values,title,titleLines:[title.slice(0,2),title.slice(2)]}).titleLines.length,2);
});


test('mixed-script title lines retain spaces and never split Latin words',async()=>{
 const {validateNativeSocialParameters}=await import('../dist/index.js');
 const values={title:'AI \u77e5\u8bc6 knowledge',body:'Keep the complete title.'};
 assert.deepEqual(validateNativeSocialParameters('note-marker',{...values,titleLines:['AI','\u77e5\u8bc6 knowledge']}).titleLines,['AI','\u77e5\u8bc6 knowledge']);
 assert.throws(()=>validateNativeSocialParameters('note-marker',{...values,titleLines:['AI \u77e5\u8bc6 know','ledge']}),/CANDIDATE_INVALID_TITLE_LINES/);
});
