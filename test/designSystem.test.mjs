import {test} from 'node:test';import assert from 'node:assert/strict';
import {designCandidates,DESIGN_THEMES,DESIGN_RECIPES,structureFingerprint} from '../dist/index.js';
const page={id:'example',title:'Request',purpose:'instruct',evidence:[{sourceId:'source-1'}],blocks:[{id:'code',kind:'code',code:'curl https://example.test',language:'bash',sourceId:'source-1',evidence:[{sourceId:'source-1'}]}]};
test('code gets specialized candidates instead of feature cards',()=>{const candidates=designCandidates(page,{kind:'presentation',ratio:16/9});assert.ok(candidates.length>=3);assert.ok(candidates.every(r=>r.accepts.includes('code')));});
test('preserves existing catalogs and bounds candidate work',()=>{assert.ok(DESIGN_RECIPES.filter(r=>r.renderer==='catalog').length>100);assert.ok(designCandidates(page,{kind:'social',ratio:1,limit:2}).length<=2);});
test('does not suggest unavailable screenshots',()=>{const image={...page,blocks:[{kind:'image',status:'missing',alt:'Missing screenshot'}]};assert.ok(designCandidates(image,{kind:'social',ratio:1}).every(r=>!r.requiresImage));});
test('excluded candidates do not reappear, repeated families lose priority',()=>{const first=designCandidates(page,{kind:'presentation',ratio:16/9});const next=designCandidates(page,{kind:'presentation',ratio:16/9,excluded:first.map(r=>r.id)});assert.equal(next.length,0);const varied=designCandidates(page,{kind:'presentation',ratio:16/9,previousFamilies:[first[0].family]});assert.notEqual(varied[0].family,first[0].family);});
test('structure fingerprint is scale and source-order invariant',()=>{const a=[{role:'title',x:10,y:20,width:80,height:20},{role:'body',x:10,y:50,width:80,height:40}];const b=a.map(n=>({...n,x:n.x*2,y:n.y*2,width:n.width*2,height:n.height*2})).reverse();assert.equal(structureFingerprint(a,100,100),structureFingerprint(b,200,200));assert.notEqual(structureFingerprint(a,100,100),structureFingerprint([{...a[0],x:40},a[1]],100,100));});
test('themes declare complete typography, geometry and color tokens',()=>{for(const theme of DESIGN_THEMES){assert.ok(theme.typography.code);assert.ok(theme.palette.surface);assert.ok(theme.geometry.spacing>0);}});

test('large catalogs cannot starve semantic paragraph compositions before measurement',()=>{const content={...page,blocks:[{id:'copy',kind:'paragraph',text:'First explanation',evidence:page.evidence},{id:'more',kind:'paragraph',text:'Additional context',evidence:page.evidence}]};for(const limit of [2,12,32]){const candidates=designCandidates(content,{kind:'presentation',ratio:16/9,limit});assert.ok(candidates.length<=limit);assert.ok(candidates.some(candidate=>candidate.renderer==='semantic'));assert.ok(candidates.some(candidate=>candidate.renderer==='catalog'));}});

test('plain campaign copy cannot select calendars, travel, prices or simulated product UI',()=>{
 const paragraph={...page,purpose:'explain',blocks:[{id:'copy',kind:'paragraph',text:'Share API documentation with your team.',evidence:page.evidence}]};
 const excluded=[];let choices;do{choices=designCandidates(paragraph,{kind:'social',ratio:1,limit:32,excluded});for(const choice of choices){assert.ok(!['time-notice','ticket','itinerary','summary-card-stack','angled-ui-launch','repo-card','research-highlight'].includes(choice.id));excluded.push(choice.id);}}while(choices.length);
 assert.ok(excluded.length>6);
 const steps={...page,blocks:[{id:'steps',kind:'steps',entries:[{title:'Import',description:'Paste curl'}],evidence:page.evidence}]};
 assert.ok(designCandidates(steps,{kind:'social',ratio:1,limit:32}).every(r=>r.id!=='itinerary'&&r.id!=='course-syllabus'));
 assert.ok(DESIGN_RECIPES.find(r=>r.id==='time-notice'&&r.kind==='social'));
});
