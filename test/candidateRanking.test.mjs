import test from 'node:test';
import assert from 'node:assert/strict';
import {candidateScore, rankCandidates, weightedParameterScore} from '../dist/index.js';

test('a suitable list outranks a fully populated but semantically unsuitable composition', () => {
  const list = {slotId:'page',compositionId:'list',state:'ready',scores:{semantic:96,layout:85,fidelity:95}};
  const dashboard = {slotId:'page',compositionId:'dashboard',state:'ready',scores:{semantic:40,layout:100,fidelity:100}};
  assert.equal(rankCandidates([dashboard,list])[0].compositionId,'list');
  const assessment = field => ({field,score:80,sourceType:'user-fact'});
  assert.equal(weightedParameterScore([assessment('title')],{title:2}),80);
  assert.equal(weightedParameterScore(['title','a','b','c'].map(assessment),{title:2,a:1,b:1,c:1}),80);
});
test('optional omission is neutral and weights belong to the registry', () => {
  assert.equal(weightedParameterScore([{field:'title',score:90,sourceType:'creative'}],{title:3,subtitle:1}),90);
  assert.throws(()=>weightedParameterScore([{field:'invented',score:100,sourceType:'creative'}],{title:3}));
});
test('unrenderable candidates cannot enter recommendations and ties stay stable', () => {
  const item = id => ({slotId:'page',compositionId:id,state:'ready',scores:{semantic:80,layout:80,fidelity:80}});
  const candidates=[item('b'),{...item('failed'),state:'failed'},item('a')];
  assert.deepEqual(rankCandidates(candidates).map(c=>c.compositionId),['a','b']);
  assert.deepEqual(rankCandidates([...candidates].reverse()).map(c=>c.compositionId),['a','b']);
  assert.equal(candidates.length,3);
  assert.throws(()=>rankCandidates([item('a'),item('a')]));
});
test('invalid provider scores fail explicitly rather than improving a ranking', () => {
  for(const semantic of [NaN,Infinity,-1,101,'100'])assert.throws(()=>candidateScore({semantic,layout:80,fidelity:80}));
  assert.equal(candidateScore({semantic:100,layout:100,fidelity:100}),100);
});
