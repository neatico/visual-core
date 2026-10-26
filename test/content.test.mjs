import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseSource,validateContentPlan,contentBlockText} from '../dist/index.js';
const input=`快速上手\n导入请求\ncurl --location --request POST 'https://echo.Apipost.cn/get.php?c=Course&id=1000' \\\n--header 'Content-Type: application/json' \\\n--data '{\n    "course_id":1\n}'\n\nimage.png\n点击发送，查看返回 Header、Cookie、状态码和耗时。\n保存响应示例，然后分享文档。`;
const source=parseSource(input),code=source.segments.find(s=>s.kind==='code');
const plan=()=>({version:1,kind:'presentation',title:'快速上手',pages:[{id:'request',title:'导入请求',purpose:'instruct',evidence:[{sourceId:code.id}],blocks:[{id:'request-code',kind:'code',sourceId:code.id,evidence:[{sourceId:code.id}]}]}]});
test('extracts multiline curl losslessly and never treats placeholder names as available screenshots',()=>{
 assert.equal(code.text, input.slice(input.indexOf('curl'),input.indexOf('\n\nimage.png')));
 for(const segment of source.segments)assert.equal(segment.text,input.slice(segment.start,segment.end));
 assert.equal(source.segments.filter(s=>s.kind==='image-reference').length,1);
 assert.equal(source.segments.at(-1).text,'保存响应示例，然后分享文档。');
});
test('fenced code preserves indentation and CRLF; unclosed fences are bounded by source',()=>{
 const text='Example\r\n```json\r\n{\r\n  "a": 1\r\n}\r\n```\r\nDone';
 const source=parseSource(text);assert.equal(source.segments[1].text,'{\r\n  "a": 1\r\n}');assert.equal(source.segments[2].text,'Done');
 assert.equal(parseSource('```sql\nselect 1').segments[0].text,'select 1');
});
test('source code is bound by reference, not rewritten by the model',()=>{
 const result=validateContentPlan(plan(),source,'presentation');assert.equal(result.pages[0].blocks[0].code,code.text);
 assert.deepEqual(contentBlockText(result.pages[0].blocks[0]),[code.text]);
 const tampered=plan();tampered.pages[0].blocks[0].code='curl https://other.example';assert.throws(()=>validateContentPlan(tampered,source),/CONTENT_CODE_CHANGED/);
});
test('presentation cannot silently discard executable examples',()=>{
 const missing=plan();missing.pages[0].blocks=[{id:'summary',kind:'paragraph',text:'导入请求',evidence:[{sourceId:code.id}]}];
 assert.throws(()=>validateContentPlan(missing,source),/CONTENT_CODE_OMITTED/);
});
test('rejects invalid references and duplicate identities',()=>{
 const invalid=plan();invalid.pages[0].evidence=[{sourceId:'source-999'}];assert.throws(()=>validateContentPlan(invalid,source),/CONTENT_UNKNOWN_SOURCE/);
 const duplicate=plan();duplicate.pages.push({...duplicate.pages[0]});assert.throws(()=>validateContentPlan(duplicate,source),/CONTENT_DUPLICATE_ID/);
});
test('AI cannot claim to have a screenshot or smuggle in an asset URL',()=>{
 const raw=plan(),image=source.segments.find(s=>s.kind==='image-reference');
 raw.pages[0].blocks.push({id:'screenshot',kind:'image',sourceId:image.id,alt:'产品截图',treatment:'screenshot',status:'available',assetId:'other-workspace',url:'https://evil.example',evidence:[{sourceId:image.id}]});
 const result=validateContentPlan(raw,source).pages[0].blocks[1];assert.equal(result.status,'missing');assert.equal(result.assetId,undefined);assert.equal(result.url,undefined);
});
test('quotations, attribution, chart values and units must occur in evidence',()=>{
 const source=parseSource('甲 12 人；乙 24 人。'),base={version:1,kind:'social',title:'统计',pages:[{id:'chart',title:'统计',purpose:'evidence',caption:'甲和乙的人数',evidence:[{sourceId:'source-1'}],blocks:[{id:'counts',kind:'chart',chart:'bar',unit:'人',values:[{label:'甲',value:12},{label:'乙',value:24}],evidence:[{sourceId:'source-1'}]}]}]};
 assert.equal(validateContentPlan(base,source).pages.length,1);
 base.pages[0].blocks[0].values[0].value=100;assert.throws(()=>validateContentPlan(base,source),/CONTENT_UNSUPPORTED_VALUE/);
});
test('limits payload sizes and rejects unknown semantic blocks',()=>{
 assert.throws(()=>parseSource('x'.repeat(20001)),/SOURCE_INVALID_LENGTH/);
 const raw=plan();raw.pages[0].blocks[0].kind='script';assert.throws(()=>validateContentPlan(raw,source),/CONTENT_UNKNOWN_BLOCK/);
});

test('image-file markdown links remain unresolved references, not narrative facts',()=>{const input='[markdown picture](https://img.example.com/flow.svg)\n[Guide](https://example.com/guide)';const source=parseSource(input);assert.equal(source.segments[0].kind,'image-reference');assert.equal(source.segments[0].text,input.split('\n')[0]);assert.equal(source.segments[1].kind,'text');assert.equal(source.text,input);});
test('AI emphasis accepts exact title phrases and rejects invented or nested ranges',()=>{
 const good=plan();good.pages[0].titleEmphasis=['导入'];
 assert.deepEqual(validateContentPlan(good,source,'presentation').pages[0].titleEmphasis,['导入']);
 for(const bad of [['不存在'],['导入','导入请求'],[''],['导入','导入']]){good.pages[0].titleEmphasis=bad;assert.throws(()=>validateContentPlan(good,source,'presentation'),/CONTENT_INVALID_EMPHASIS/);}
});
