export interface FontFamily {family:string;category:'sans'|'serif'|'display'|'mono';scripts:readonly string[];weights:readonly number[]}
const entry=(family:string,category:FontFamily['category'],scripts:readonly string[]=['latin'],weights:readonly number[]=[400,700]):FontFamily=>({family,category,scripts,weights});
/** Curated Google Fonts families; request only their declared, supported weights. */
export const GOOGLE_FONT_CATALOG:readonly FontFamily[]=[
 ...['Inter','Roboto','Montserrat','Manrope','DM Sans','Lato','Open Sans','Source Sans 3','Work Sans','Nunito Sans','IBM Plex Sans'].map(f=>entry(f,'sans')),
 ...['Lora','Merriweather','Libre Baskerville','Source Serif 4','Playfair Display','PT Serif'].map(f=>entry(f,'serif')),
 ...['Space Grotesk','Oswald','Bebas Neue'].map(f=>entry(f,'display',['latin'],f==='Bebas Neue'?[400]:[400,700])),
 ...['JetBrains Mono','IBM Plex Mono','Fira Code','Source Code Pro'].map(f=>entry(f,'mono')),
 entry('Noto Sans SC','sans',['zh']),entry('Noto Serif SC','serif',['zh']),entry('ZCOOL XiaoWei','display',['zh'],[400]),entry('Ma Shan Zheng','display',['zh'],[400]),
 entry('Noto Sans TC','sans',['zh-Hant']),entry('Noto Serif TC','serif',['zh-Hant']),
 entry('Noto Sans JP','sans',['ja']),entry('Noto Serif JP','serif',['ja']),entry('M PLUS Rounded 1c','sans',['ja']),
 entry('Noto Sans KR','sans',['ko']),entry('Noto Serif KR','serif',['ko']),
 entry('Noto Sans Arabic','sans',['ar']),entry('Noto Sans Devanagari','sans',['hi']),
];
export function contentScript(text:string,locale='en'):string {
 if(/[\u3040-\u30ff]/u.test(text))return 'ja';if(/[\uac00-\ud7af]/u.test(text))return 'ko';
 if(/[\u0600-\u06ff]/u.test(text))return 'ar';if(/[\u0900-\u097f]/u.test(text))return 'hi';
 if(/[\u3400-\u9fff]/u.test(text))return /TW|HK|Hant/i.test(locale)?'zh-Hant':'zh';
 if(/^zh/i.test(locale))return /TW|HK|Hant/i.test(locale)?'zh-Hant':'zh';return /^(ja|ko|ar|hi)/.exec(locale)?.[1]||'latin';
}
export function recommendedFonts(locale:string,text=''):FontFamily[]{const script=contentScript(text,locale);return [...GOOGLE_FONT_CATALOG].sort((a,b)=>Number(b.scripts.includes(script))-Number(a.scripts.includes(script)));}
export function languageFont(text:string,preferred:string,locale='en'):string {
 const script=contentScript(text,locale);if(script==='latin')return preferred;
 const serif=/serif|Georgia|Lora|Baskerville|Merriweather|Playfair/i.test(preferred)&&!/sans/i.test(preferred);
 return GOOGLE_FONT_CATALOG.find(f=>f.scripts.includes(script)&&f.category===(serif?'serif':'sans'))?.family||preferred;
}
