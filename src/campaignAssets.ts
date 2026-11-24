/** Real bundled assets. Selection uses explicit template and asset identities, never copy semantics. */
import {CURATED_PHOTO_ASSETS} from './curatedAssets.js';
// Metadata comes from the original asset generation briefs, never face classification.
const portraits:Record<string,{portraitRegion:'east-asian'|'western';alt:string}>={
 'chat-avatar-man-v1':{portraitRegion:'east-asian',alt:'Fictional East Asian adult man, close headshot, blue-gray background.'},
 'chat-avatar-woman-v1':{portraitRegion:'east-asian',alt:'Fictional East Asian adult woman, close headshot, beige background.'},
 'professional-man-v1':{portraitRegion:'western',alt:'Fictional Western male professional, navy blazer, transparent bust cutout.'},
 'professional-woman-v1':{portraitRegion:'western',alt:'Fictional Western woman, dark blonde hair, ivory blouse, transparent bust cutout.'},
 'portrait-east-asian-man-mature-v1':{portraitRegion:'east-asian',alt:'Fictional East Asian man around 50, salt-and-pepper hair, olive jacket, neutral studio portrait.'},
 'portrait-east-asian-woman-mature-v1':{portraitRegion:'east-asian',alt:'Fictional East Asian woman around 45, short dark hair, teal blouse, neutral studio portrait.'},
 'portrait-western-man-young-v1':{portraitRegion:'western',alt:'Fictional Western European man around 28, wavy brown hair, blue shirt, neutral studio portrait.'},
 'portrait-western-woman-young-v1':{portraitRegion:'western',alt:'Fictional Western European woman around 28, auburn hair, terracotta blouse, neutral studio portrait.'},
};
export const GENERIC_CAMPAIGN_ASSETS:Record<string,{id:string;src:string;source:string;sourceUrl:string;author:string;license:string;alt:string;artDirection?:string;portraitRegion?:'east-asian'|'western'}> = {...CURATED_PHOTO_ASSETS,...Object.fromEntries([
  'chat-avatar-man-v1','chat-avatar-woman-v1','professional-man-v1','professional-woman-v1',
  'portrait-east-asian-man-mature-v1','portrait-east-asian-woman-mature-v1','portrait-western-man-young-v1','portrait-western-woman-young-v1','keyboard-macro-v1','enterprise-glass-v1',
  'graphics-card-v1','waterfront-city-v1','data-center-v1','healthcare-lab-v1',
  'smart-manufacturing-v1','learning-library-v1','warehouse-logistics-v1','planet-career-v2','marble-owl-v1',
].map(name=>[`generic-${name}`,{
  id:`generic-${name}`,src:`/media/generic/${name}.webp`,source:'ai-generated',
  sourceUrl:'/media/generic/manifest.json',author:'Neatico',license:'Original generated generic asset',
  alt:portraits[name]?.alt || name.replace(/-v\d+$/,'').replace(/-/g,' '),
  ...(portraits[name]?{portraitRegion:portraits[name].portraitRegion}:{}),
}]))};

const defaults:Record<string,Record<string,string>>={
  'split-product-pricing':{imageAssetId:'generic-keyboard-macro-v1'},
  'neon-enterprise-trial':{imageAssetId:'generic-enterprise-glass-v1'},
  'city-service-offer':{imageAssetId:'generic-waterfront-city-v1'},
  'editorial-benchmark':{imageAssetId:'generic-marble-owl-v1'},
  'portrait-news-cover':{imageAssetId:'generic-data-center-v1',foregroundAssetId:'generic-professional-man-v1',avatarAssetId:'generic-professional-woman-v1'},
  'hardware-offer':{imageAssetId:'generic-graphics-card-v1'},
  'planet-career':{imageAssetId:'generic-planet-career-v2'},
};
export const referencePosterAssetDefaults=(layoutId:string):Record<string,string>=>({...defaults[layoutId]});
