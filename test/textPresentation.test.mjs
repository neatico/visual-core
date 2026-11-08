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
