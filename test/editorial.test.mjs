import test from 'node:test';import assert from 'node:assert/strict';
import {ensurePresentationBookends,needsEditorialPagination,languageFont,designCandidates} from '../dist/index.js';
const evidence=[{sourceId:'source-1'}];const page={id:'p',title:'行业认可',purpose:'conclude',evidence,blocks:[{id:'b',kind:'paragraph',text:'客户采用的事实必须保留。',evidence}]};
test('adds genuine bookends without losing an evidence closing',()=>{const result=ensurePresentationBookends({version:1,kind:'presentation',title:'产品',pages:[page]});assert.equal(result.pages.length,3);assert.equal(result.pages[1].purpose,'evidence');assert.equal(result.pages[2].title,'感谢聆听');assert.deepEqual(ensurePresentationBookends(result),result);});
test('long readable text requires editorial pagination before overflow',()=>assert.equal(needsEditorialPagination({...page,blocks:[{...page.blocks[0],text:'接口测试'.repeat(55)}]}),true));
test('language matching distinguishes Japanese and Chinese',()=>{assert.equal(languageFont('これは日本語','Inter'),'Noto Sans JP');assert.equal(languageFont('中文','Georgia'),'Noto Serif SC');});
test('cover recipes lead genuine presentation covers only',()=>{const cover={...page,purpose:'cover'};assert.match(designCandidates(cover,{kind:'presentation',ratio:16/9})[0].id,/^(bookend-cover|authored-explore-cover)/);assert.ok(!designCandidates({...page,purpose:'explain'},{kind:'presentation',ratio:16/9}).some(r=>r.id.startsWith('bookend-')));});

test('explicit brand families and compatible Google families are preserved',()=>{assert.equal(languageFont('中文','Brand Custom'),'Brand Custom');assert.equal(languageFont('日本語','Noto Sans JP','ja'),'Noto Sans JP');});

test("closing has dedicated candidates instead of aliasing cover",()=>{assert.match(designCandidates({...page,purpose:"conclude"},{kind:"presentation",ratio:16/9})[0].id,/^(bookend-closing|authored-explore-closing)/);});


test('archive typography preserves language coverage and its genuine display weight',async()=>{
 const {createStyleManifest,GOOGLE_FONT_CATALOG,contentScript}=await import('../dist/index.js');
 const english=createStyleManifest('archive','Shared knowledge');
 assert.equal(english.fonts.heading,'Instrument Serif');
 assert.equal(english.fonts.body,'DM Sans');
 assert.equal(english.theme.typography.headingWeight,400);
 assert.deepEqual(GOOGLE_FONT_CATALOG.find(font=>font.family==='Instrument Serif').weights,[400]);
 assert.equal(languageFont('\u77e5\u8bc6','Instrument Serif'),'Noto Serif SC');
 assert.equal(languageFont('\u0e04\u0e27\u0e32\u0e21\u0e23\u0e39\u0e49','Instrument Serif'),'Noto Serif Thai');
 assert.equal(languageFont('\u091c\u094d\u091e\u093e\u0928','Instrument Serif'),'Noto Serif Devanagari');
 assert.equal(contentScript('', 'th-TH'),'th');
});
