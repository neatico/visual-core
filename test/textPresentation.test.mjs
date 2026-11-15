import test from 'node:test';
import assert from 'node:assert/strict';
import {validateTextPresentations,textPresentationSchema} from '../dist/index.js';

const line=text=>({text,font:'body',scale:1,tone:'ink',decoration:'none',italic:false});
const hint=(path,lines)=>({path,fit:'natural',lines:lines.map(line)});

test('supports body and nested text without introducing new content',()=>{
 const content={title:'Knowledge workflow',body:'Collect documents and share decisions.',blocks:[{kind:'features',entries:[{title:'Review versions',description:'Read the current version.'}]}]};
 const values=[hint('body',['Collect documents','and share decisions.']),hint('blocks.0.entries.0.description',['Read the current','version.'])];
 assert.deepEqual(validateTextPresentations(values,content),values);
 assert.throws(()=>validateTextPresentations([hint('body',['Collect documents'])],content),/CONTENT/);
 assert.throws(()=>validateTextPresentations([hint('body',['Collect documents','and invent decisions.'])],content),/CONTENT/);
});

test('preserves mixed-script boundaries without breaking Latin words',()=>{
 assert.equal(validateTextPresentations([hint('title',['\u9879\u76ee','knowledge','\u7ba1\u7406'])],{title:'\u9879\u76eeknowledge\u7ba1\u7406'}).length,1);
 assert.throws(()=>validateTextPresentations([hint('title',['Know','ledge'])],{title:'Knowledge'}),/WORD_BOUNDARY/);
});

test('keeps Arabic and Indic words and emoji graphemes intact',()=>{
 const examples=[
  ['\u0627\u0644\u0639\u0631\u0628\u064a\u0629',['\u0627\u0644\u0639','\u0631\u0628\u064a\u0629']],
  ['\u0928\u092e\u0938\u094d\u0924\u0947',['\u0928','\u092e\u0938\u094d\u0924\u0947']],
  ['\u0915\u093f',['\u0915','\u093f']],
  ['\u{1f469}\u200d\u{1f4bb}',['\u{1f469}','\u200d\u{1f4bb}']],
 ];
 for(const [title,parts] of examples)assert.throws(()=>validateTextPresentations([hint('title',parts)],{title}),/WORD_BOUNDARY/);
});

test('allows real Thai word boundaries without requiring spaces',()=>{
 const title='\u0e20\u0e32\u0e29\u0e32\u0e44\u0e17\u0e22';
 const values=[hint('title',['\u0e20\u0e32\u0e29\u0e32','\u0e44\u0e17\u0e22'])];
 assert.deepEqual(validateTextPresentations(values,{title}),values);
});

test('rejects arbitrary styling, duplicate fields, metadata and unreadable scale requests',()=>{
 const content={body:'Read together.',blocks:[{code:'print(1)'}]};
 const valid=hint('body',['Read together.']);
 assert.throws(()=>validateTextPresentations([valid,valid],content),/PATH/);
 assert.throws(()=>validateTextPresentations([hint('blocks.0.code',['print(1)'])],content),/PATH/);
 assert.throws(()=>validateTextPresentations([{...valid,css:'position:fixed'}],content),/INVALID/);
 assert.throws(()=>validateTextPresentations([{...valid,lines:[{...line('Read together.'),scale:5}]}],content),/INVALID/);
 assert.deepEqual(validateTextPresentations(undefined,content),[]);
 assert.deepEqual(textPresentationSchema().default,[]);
});

test('native parameter validation accepts actual styled lines and rejects non-boolean flags',async()=>{
 const {validateNativeSocialParameters}=await import('../dist/index.js');
 const values={title:'Knowledge',body:'Read together.',textPresentation:[{path:'body',fit:'natural',lines:[{text:'Read together.',font:'body',scale:1,tone:'ink',decoration:'underline',italic:true}]}]};
 assert.equal(validateNativeSocialParameters('manifesto',values).textPresentation[0].lines[0].italic,true);
 values.textPresentation[0].lines[0].italic='true';
 assert.throws(()=>validateNativeSocialParameters('manifesto',values));
});
