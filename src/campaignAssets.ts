/** Real bundled assets. Selection uses explicit template and asset identities, never copy semantics. */
export const GENERIC_CAMPAIGN_ASSETS = Object.fromEntries([
  'professional-man-v1','professional-woman-v1','keyboard-macro-v1','enterprise-glass-v1',
  'graphics-card-v1','waterfront-city-v1','data-center-v1','healthcare-lab-v1',
  'smart-manufacturing-v1','learning-library-v1','warehouse-logistics-v1','planet-career-v2','marble-owl-v1',
].map(name=>[`generic-${name}`,{
  id:`generic-${name}`,src:`/media/generic/${name}.webp`,source:'ai-generated',
  sourceUrl:'/media/generic/manifest.json',author:'Neatico',license:'Original generated generic asset',
  alt:name.replace(/-v\d+$/,'').replace(/-/g,' '),
}]));

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
