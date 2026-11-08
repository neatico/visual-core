import test from 'node:test';
import assert from 'node:assert/strict';
import {createStyleManifest,validateStyleManifest,designTheme} from '../dist/index.js';
test('serialized suite snapshots preserve fonts and colors across later generation',()=>{
  const manifest=createStyleManifest('editorial','Project knowledge');
  const restored=validateStyleManifest(JSON.parse(JSON.stringify(manifest)));
  assert.deepEqual(restored,manifest);
  restored.theme.palette.accent='#ffffff';
  assert.notEqual(restored.theme.palette.accent,manifest.theme.palette.accent);
  assert.notEqual(restored.theme.palette.accent,designTheme('editorial').palette.accent);
  assert.equal(manifest.fonts.heading,'Lora');
});
test('language fallback is resolved once and invalid suites fail explicitly',()=>{
  assert.notEqual(createStyleManifest('editorial','日本語').fonts.heading,'Lora');
  assert.throws(()=>createStyleManifest('unknown'));
  const manifest=createStyleManifest('ink');
  assert.throws(()=>validateStyleManifest({...manifest,themeVersion:2}));
  assert.throws(()=>validateStyleManifest({...manifest,theme:{...manifest.theme,palette:{...manifest.theme.palette,accent:'url(unsafe)'}}}));
});
