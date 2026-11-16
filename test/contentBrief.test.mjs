import test from 'node:test';
import assert from 'node:assert/strict';
import {parseSource,createContentBrief,validateContentBrief} from '../dist/index.js';

test('every input is a creative brief while retaining the original submission',()=>{
 const source=parseSource('Revenue was $50 in the supplied report.');
 const brief=createContentBrief(source);
 assert.equal(brief.mode,'creative');assert.equal(brief.creativeAllowed,true);assert.equal(brief.simulationAllowed,true);
 assert.equal(brief.originalInput,source.text);assert.deepEqual(brief.sourceIds,source.segments.map(segment=>segment.id));
 brief.sourceIds.push('another');assert.equal(source.segments.length,1);
});

test('adaptation remains available for creative input and retains the original assignment',()=>{
 const source=parseSource('Illustrative concept: 12 tasks in week one and 18 tasks in week two.');
 source.provenance={kind:'creative-draft',original:'Create an example project dashboard.',disclosure:'Creative draft',language:'en-US'};
 assert.equal(createContentBrief(source).creativeAllowed,true);assert.equal(createContentBrief(source).simulationAllowed,true);
 source.provenance.simulationAllowed=true;
 const brief=createContentBrief(source);
 assert.equal(brief.simulationAllowed,true);assert.equal(brief.originalInput,source.provenance.original);assert.equal(brief.language,'en-US');
 assert.deepEqual(validateContentBrief(brief),brief);
});

test('legacy provenance flags cannot reintroduce a factual-source gate on reopened content',()=>{
 for(const kind of ['creative-draft','user-revision']){
  const source=parseSource('The customer supplied verified results.');
  source.provenance={kind,original:'Use the verified report.',disclosure:'Reviewed input',simulationAllowed:false};
  const brief=createContentBrief(source);
  assert.equal(brief.creativeAllowed,true);
  assert.equal(brief.simulationAllowed,true);
  assert.equal(validateContentBrief(brief).simulationAllowed,true);
 }
});

test('malformed provenance is rejected while legacy permissions normalize to creative',()=>{
 for(const provenance of [{kind:'creative-draft',original:'',disclosure:'Draft'},{kind:'creative-draft',original:'Original',disclosure:'Draft',simulationAllowed:'yes'},{kind:'creative-draft',original:'Original',disclosure:'Draft',language:'<script>'}])assert.throws(()=>createContentBrief({...parseSource('Source'),provenance}),/CONTENT_BRIEF_INVALID/);
 const valid=createContentBrief(parseSource('Actual source'));
 assert.equal(validateContentBrief({...valid,creativeAllowed:false,simulationAllowed:false}).creativeAllowed,true);
 assert.throws(()=>validateContentBrief({...valid,sourceIds:['same','same']}),/CONTENT_BRIEF_INVALID/);
 assert.throws(()=>createContentBrief(null),/CONTENT_BRIEF_INVALID/);
});

test('explicit revisions preserve the initial submission and retain their separate active input',()=>{
 const source=parseSource('The reviewed launch date is June 12.');
 source.provenance={kind:'user-revision',original:'Launch on June 4.',originalMode:'source-backed',disclosure:'User-edited content'};
 const brief=createContentBrief(source);
 assert.equal(brief.originalInput,'Launch on June 4.');
 assert.equal(brief.revisedInput,source.text);
 assert.equal(brief.mode,'creative');
 assert.deepEqual(validateContentBrief(brief),brief);
 source.provenance.originalMode='creative';
 assert.equal(createContentBrief(source).mode,'creative');
 source.provenance.illustrative=true;
 assert.equal(createContentBrief(source).revisedInputIllustrative,true);
 assert.throws(()=>validateContentBrief({...brief,revisedInput:undefined,revisedInputIllustrative:true}),/CONTENT_BRIEF_INVALID/);
 assert.throws(()=>validateContentBrief({...brief,revisedInput:''}),/CONTENT_BRIEF_INVALID/);
 assert.throws(()=>validateContentBrief({...brief,revisedInput:'x'.repeat(20001)}),/CONTENT_BRIEF_INVALID/);
 assert.throws(()=>createContentBrief({...source,provenance:{...source.provenance,originalMode:'unverified'}}),/CONTENT_BRIEF_INVALID/);
});
