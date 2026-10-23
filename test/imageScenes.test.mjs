import test from 'node:test';
import assert from 'node:assert/strict';
import {designCandidates} from '../dist/index.js';
const evidence=[{sourceId:'fixture'}];
const base={id:'hero',title:'New perspective',purpose:'cover',evidence};
test('image compositions require a real image and honor the banner scene',()=>{
 const missing={...base,blocks:[{id:'copy',kind:'paragraph',text:'A new story',evidence}]};
 assert.ok(designCandidates(missing,{kind:'social',ratio:.75,limit:32}).every(r=>!r.id.startsWith('authored-image-')));
 const available={...base,scene:'banner-hero',blocks:[{id:'photo',kind:'image',status:'available',assetId:'photo',treatment:'photograph',alt:'Example',sourceId:'fixture',evidence}]};
 const candidates=designCandidates(available,{kind:'social',ratio:.75,limit:32});
 assert.equal(candidates.filter(r=>r.id.startsWith('authored-image-')).length,4);
 assert.ok(candidates.findIndex(r=>r.id==='authored-image-banner')<candidates.findIndex(r=>r.id==='authored-image-split'));
});
