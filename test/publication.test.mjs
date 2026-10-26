import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseSource,validateContentPlan,validateEditableContentPage} from '../dist/index.js';
test('publication metadata is preserved and engagement values must be source backed',()=>{
 const source=parseSource('Design by Alex. Views 1200.');
 const page={id:'intro',title:'Design',purpose:'cover',evidence:[{sourceId:'source-1'}],blocks:[{id:'body',kind:'paragraph',text:'Design',evidence:[{sourceId:'source-1'}]}],publication:{tags:['Design'],author:{name:'Alex'},metrics:[{label:'Views',value:'1200'}]}};
 const raw={version:1,kind:'presentation',title:'Design',pages:[page]};
 const clean=validateContentPlan(raw,source);
 assert.deepEqual(clean.pages[0].publication,page.publication);
 assert.deepEqual(validateEditableContentPage(page).publication,page.publication);
 assert.throws(()=>validateContentPlan({...raw,pages:[{...page,publication:{metrics:[{label:'Views',value:'99999'}]}}]},source),/CONTENT_UNSUPPORTED_PUBLICATION/);
});
