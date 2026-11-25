const originalScenes: Record<string, string> = {
  'field-harvest': 'An apple orchard and working farmland at sunrise.',
  'solar-utilities': 'Photovoltaic panels and utility lines at sunset.',
  'stone-quarry': 'Terraced limestone quarry with a working excavator.',
  'core-samples': 'A geologist examining cylindrical rock cores at a field station.',
  'water-treatment': 'Circular clarifier tanks at a municipal water treatment plant.',
  'retail-shop': 'A sunlit neighborhood home goods shop with linen and ceramics.',
  'building-site': 'Timber and steel construction site with a tower crane.',
  'civic-chamber': 'Oak desks and microphones inside a city council chamber.',
  'bank-counter': 'Retail banking counter with tellers and a cash-counting machine.',
  'community-services': 'A resident speaking with an advisor at a community center.',
};

const libraryScenes: Record<string, string> = {
  'alpine-electric-crossover': 'An electric SUV parked beside an alpine lake.',
  'ceramics-workshop': 'A ceramics workshop with pottery and hand tools.',
  'chef-plating': 'Chef plating a meal in a professional kitchen.',
  'creative-studio-interview': 'A job interview inside a sunlit design studio.',
  'fulfillment-aisle': 'Blue warehouse shelving with boxed inventory.',
  'garden-suite': 'A hotel suite opening onto a garden.',
  'home-monitor-and-thermometer': 'Home blood pressure monitor and digital thermometer.',
  'pediatric-consultation': 'A pediatric consultation in a clinic.',
  'rainy-city-drama': 'Two fictional actors in a cinematic urban scene.',
  'salmon-bistro': 'Salmon with vegetables served in a bistro.',
  'seasonal-kitchen': 'A chef preparing seasonal vegetables.',
  'sunlit-interview': 'An interviewer and a candidate meeting in a bright office.',
  'studio-interview-east-asia': 'An interview in an East Asian creative studio.',
  'steamed-dumplings': 'Fresh dumplings in a bamboo steamer.',
  'lantern-night-fishing': 'A camping lantern at a lakeside fishing pier.',
};

function originalAssets(scenes: Record<string,string>, library: boolean) {
  return Object.fromEntries(Object.entries(scenes).map(([name, alt]) => {
    const id = library ? 'neatico-' + name + '-v1' : 'industry-' + name;
    const dir = library ? '/media/generic/' : '/media/industry/';
    return [id, {id, alt, src: dir + name + '-v1.webp', source: 'ai-generated',
      sourceUrl: dir + (library ? 'manifest.json' : 'photos.json'), author: 'Neatico',
      license: 'Original generated artwork', artDirection: 'Editorial stock illustration in a photographic style.'}];
  }));
}

const studioScenes:Record<string,string>={
  food:'A plate of handmade pasta with basil on a dark wooden restaurant table.',
  hiring:'A sunlit design studio with a shared worktable and tall windows.',
};
export const INDUSTRY_ORIGINAL_ASSETS = {...originalAssets(originalScenes, false), ...originalAssets(libraryScenes, true),
  ...Object.fromEntries(Object.entries(studioScenes).map(([name,alt])=>{
    const id='industry-'+name;
    return [id,{id,alt,src:'/media/industry/'+name+'.webp',source:'ai-generated',
      sourceUrl:'/media/industry/manifest.json',author:'Neatico',license:'Original generated artwork',artDirection:'Editorial photograph with space for copy.'}];
  })),
};

/** A subject can fit several sectors. No layout owns a sector or a photograph. */
const legacyIndustryPhotos = {
  agriculture: ['industry-field-harvest', 'photo-2Hzmz15wGik', 'photo-08bOYnH_r_E'],
  mining: ['industry-stone-quarry', 'industry-core-samples'],
  energy: ['industry-solar-utilities', 'photo-513dBrMJ_5w', 'photo-XGAZzyLzn18'],
  environment: ['industry-water-treatment', 'photo-sp-p7uuT0tw', 'photo-GxymWkdnl4Y'],
  manufacturing: ['generic-smart-manufacturing-v1', 'photo-tBvF46kmwBw', 'neatico-ceramics-workshop-v1'],
  construction: ['industry-building-site', 'photo-5xOSA-UgsKQ', 'industry-stone-quarry'],
  retail: ['industry-retail-shop', 'photo-ptZcO68OeGk', 'neatico-fulfillment-aisle-v1'],
  transport: ['neatico-fulfillment-aisle-v1', 'neatico-alpine-electric-crossover-v1', 'generic-warehouse-logistics-v1'],
  hospitality: ['neatico-garden-suite-v1', 'photo-RxMActpuDzE', 'neatico-salmon-bistro-v1', 'neatico-steamed-dumplings-v1'],
  food: ['industry-food', 'neatico-seasonal-kitchen-v1', 'neatico-chef-plating-v1', 'neatico-salmon-bistro-v1', 'neatico-steamed-dumplings-v1', 'photo-RxMActpuDzE', 'photo-EzH46XCDQRY', 'photo-wAkmA9I54dY', 'industry-field-harvest'],
  technology: ['generic-data-center-v1', 'photo-tBvF46kmwBw', 'photo-9qaKxU20GjY', 'photo-_HnJfS6WhA8'],
  finance: ['industry-bank-counter', 'photo-Sc5RKXLBjGg', 'neatico-sunlit-interview-v1'],
  property: ['photo-9FFtnyiV4Dg', 'photo-Sc5RKXLBjGg', 'industry-building-site'],
  professional: ['neatico-sunlit-interview-v1', 'photo-9qaKxU20GjY', 'industry-core-samples', 'neatico-creative-studio-interview-v1'],
  employment: ['industry-hiring', 'neatico-creative-studio-interview-v1', 'neatico-studio-interview-east-asia-v1', 'neatico-sunlit-interview-v1'],
  government: ['industry-civic-chamber', 'industry-community-services', 'industry-water-treatment'],
  education: ['photo-2JIvboGLeho', 'photo-6GPBVYLapYQ', 'generic-learning-library-v1'],
  health: ['neatico-pediatric-consultation-v1', 'generic-healthcare-lab-v1', 'neatico-home-monitor-and-thermometer-v1'],
  community: ['industry-community-services', 'industry-civic-chamber', 'neatico-pediatric-consultation-v1'],
  arts: ['neatico-ceramics-workshop-v1', 'photo-abv31LKDfls', 'neatico-rainy-city-drama-v1', 'photo-4dpAqfTbvKA'],
  recreation: ['photo-73F4pKoUkM0', 'photo-twukN12EN7c', 'neatico-lantern-night-fishing-v1'],
  personal: ['photo-HySqvJFvqp0', 'photo-GAL50cPHhBs', 'photo-Pd5JqHgT2Fs', 'industry-retail-shop'],
  general: ['photo-nvzvOPQW0gc', 'photo-9qaKxU20GjY', 'neatico-sunlit-interview-v1'],
} satisfies Record<string, string[]>;

export type PhotoIndustry = keyof typeof legacyIndustryPhotos;

/** Quiet environments and simple textures leave a continuous area for copy. */
export const INDUSTRY_BACKGROUNDS: Record<PhotoIndustry, string[]> = {
  agriculture: ['photo-2Hzmz15wGik', 'photo-twukN12EN7c'],
  mining: ['photo-pexels-15138922', 'photo-twukN12EN7c'],
  energy: ['photo-XGAZzyLzn18', 'photo-513dBrMJ_5w'],
  environment: ['photo-GxymWkdnl4Y', 'photo-2Hzmz15wGik'],
  manufacturing: ['photo-ptZcO68OeGk', 'photo-Sc5RKXLBjGg'],
  construction: ['photo-Sc5RKXLBjGg', 'photo-5xOSA-UgsKQ'],
  retail: ['photo-ptZcO68OeGk', 'photo-GAL50cPHhBs'],
  transport: ['photo-GxymWkdnl4Y', 'photo-Sc5RKXLBjGg'],
  hospitality: ['photo-9FFtnyiV4Dg', 'photo-73F4pKoUkM0'],
  food: ['photo-RxMActpuDzE', 'photo-ptZcO68OeGk'],
  technology: ['photo-9qaKxU20GjY', 'photo-nvzvOPQW0gc'],
  finance: ['photo-Sc5RKXLBjGg', 'photo-nvzvOPQW0gc'],
  property: ['photo-9FFtnyiV4Dg', 'photo-Sc5RKXLBjGg'],
  professional: ['photo-nvzvOPQW0gc', 'photo-9qaKxU20GjY'],
  employment: ['photo-nvzvOPQW0gc', 'photo-9qaKxU20GjY'],
  government: ['photo-Sc5RKXLBjGg', 'photo-pexels-10209717'],
  education: ['photo-2JIvboGLeho', 'photo-nvzvOPQW0gc'],
  health: ['photo-pexels-12344248', 'photo-nvzvOPQW0gc'],
  community: ['photo-nvzvOPQW0gc', 'photo-9FFtnyiV4Dg'],
  arts: ['photo-4dpAqfTbvKA', 'photo-ptZcO68OeGk'],
  recreation: ['photo-73F4pKoUkM0', 'photo-twukN12EN7c'],
  personal: ['photo-GAL50cPHhBs', 'photo-Pd5JqHgT2Fs'],
  general: ['photo-nvzvOPQW0gc', 'photo-9FFtnyiV4Dg'],
};

/** Concrete objects, activities and people for an independent content image. */
export const INDUSTRY_SUBJECTS: Record<PhotoIndustry, string[]> = {
  agriculture: ['photo-08bOYnH_r_E', 'photo-2Hzmz15wGik'],
  mining: ['photo-pexels-15138922'],
  energy: ['photo-513dBrMJ_5w', 'photo-XGAZzyLzn18'],
  environment: ['photo-sp-p7uuT0tw', 'photo-2Hzmz15wGik'],
  manufacturing: ['photo-abv31LKDfls', 'photo-pexels-4716292'],
  construction: ['photo-5xOSA-UgsKQ', 'photo-Sc5RKXLBjGg'],
  retail: ['photo-ptZcO68OeGk', 'photo-HySqvJFvqp0', 'photo-Pd5JqHgT2Fs'],
  transport: ['photo-pexels-2231744'],
  hospitality: ['photo-9FFtnyiV4Dg', 'photo-RxMActpuDzE', 'photo-wAkmA9I54dY'],
  food: ['photo-EzH46XCDQRY', 'photo-wAkmA9I54dY', 'photo-RxMActpuDzE', 'photo-08bOYnH_r_E'],
  technology: ['photo-pexels-4716292', 'photo-tBvF46kmwBw', 'photo-pexels-9275222'],
  finance: ['photo-pexels-6694492', 'photo-Sc5RKXLBjGg'],
  property: ['photo-9FFtnyiV4Dg', 'photo-5xOSA-UgsKQ'],
  professional: ['photo-pexels-5439376', 'photo-6GPBVYLapYQ', 'photo-pexels-9275222'],
  employment: ['photo-pexels-5439376', 'photo-pexels-9275222', 'photo-6GPBVYLapYQ'],
  government: ['photo-pexels-10209717', 'photo-pexels-6590928'],
  education: ['photo-6GPBVYLapYQ', 'photo-2JIvboGLeho', 'photo-pexels-9275222'],
  health: ['photo-pexels-12344248'],
  community: ['photo-pexels-6590928', 'photo-pexels-9275222'],
  arts: ['photo-abv31LKDfls', 'photo-4dpAqfTbvKA'],
  recreation: ['photo-73F4pKoUkM0', 'photo-twukN12EN7c'],
  personal: ['photo-HySqvJFvqp0', 'photo-GAL50cPHhBs', 'photo-Pd5JqHgT2Fs'],
  general: ['photo-6GPBVYLapYQ', 'photo-pexels-5439376', 'photo-pexels-9275222'],
};

/** Saved photographs and illustrations retain their IDs, source files and credits. */
export const INDUSTRY_PHOTOS = Object.fromEntries(Object.entries(legacyIndustryPhotos).map(([sector, ids]) => {
  const industry = sector as PhotoIndustry;
  return [industry, [...new Set([...ids, ...INDUSTRY_BACKGROUNDS[industry], ...INDUSTRY_SUBJECTS[industry]])]];
})) as Record<PhotoIndustry, string[]>;
export interface IndustryPhotoSelection {industry: PhotoIndustry; assetId: string | null}

export function resolveIndustryPhoto(input: unknown): IndustryPhotoSelection | undefined {
  if (!input || typeof input !== 'object' || !('industry' in input) ||
      typeof input.industry !== 'string' || !Object.hasOwn(INDUSTRY_PHOTOS, input.industry)) return;
  const industry = input.industry as PhotoIndustry;
  const id = 'assetId' in input ? input.assetId : null;
  return {industry, assetId: typeof id === 'string' && INDUSTRY_PHOTOS[industry].includes(id) ? id : null};
}
