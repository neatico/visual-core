import type {SemanticKind} from './content.js';

export interface CampaignEdition {
  key:string;
  description:string;
  blocks:SemanticKind[];
  entries:number;
  paper:string;
  ink:string;
  accent:string;
}
const edition=(key:string,description:string,blocks:SemanticKind[],entries:number,paper:string,ink:string,accent:string):CampaignEdition=>
  ({key,description,blocks,entries,paper,ink,accent});

/** Independent reference geometries. Descriptions direct authoring; no brief-text matching. */
export const CAMPAIGN_EDITIONS=[
  edition('contour','Centered masthead over concentric engraved contours',['paragraph'],0,'#073F35','#FFFFFF','#1EE2C2'),
  edition('hinge','Product on a folded yellow wedge meeting a blue field',['image','paragraph'],0,'#093766','#FFFFFF','#FFCB16'),
  edition('watermark','Translucent inset on an aqua and lime halftone field',['paragraph'],0,'#DAFFF5','#104D54','#1BC9C9'),
  edition('pattern','Patterned green field with a cropped corner subject',['image','paragraph'],0,'#00876E','#FFFFFF','#67EBC4'),
  edition('arc','Midnight masthead over a violet rising arc',['paragraph'],0,'#111A2B','#FFFFFF','#805BFC'),
  edition('ribbons','Layered amethyst ribbons and a contrasting yellow line',['paragraph'],0,'#311371','#FFFFFF','#FFE54D'),
  edition('sweep','Coral and crimson curved field with a centered title',['paragraph'],0,'#AC124B','#FFFFFF','#FF7953'),
  edition('corners','Bright white center surrounded by small illustrated objects',['features'],4,'#FBF7F1','#302C35','#AB3958'),
  edition('signal','Navy campaign with a cyan headline, bright action and arrow motif',['paragraph','paragraph'],0,'#18294F','#FFFFFF','#36E6E0'),
  edition('portrait-bulletin','Full portrait photograph, round secondary image and lower headline',['image','image','paragraph'],0,'#181620','#FFFFFF','#67E8F4'),
  edition('matrix','Comparable options in an aligned ruled green matrix',['comparison'],3,'#E9FBF2','#103A32','#008450'),
  edition('tiles','Evenly spaced colorful illustrated tiles on a cool pale field',['features'],20,'#F1F4FF','#18264E','#395CE0'),
  edition('proof','Side-by-side comparison with annotated evidence in two columns',['comparison'],2,'#F8FAFB','#142B32','#178967'),
  edition('hub','Color-coded branches radiating from one central idea',['features'],12,'#F6FAFC','#172B46','#1966D5'),
  edition('type-stack','Stacked oversize headline, colored type and dark ground',['paragraph','paragraph'],0,'#17222B','#FFFFFF','#FF6032'),
  edition('edge-light','Black display text on a luminous mint field fading toward the edge',['paragraph','paragraph'],0,'#FCF7F0','#273638','#087871'),
  edition('spectral','Dark editorial title page with a softly lit spectral field',['paragraph'],0,'#141722','#FFFFFF','#9A8AFF'),
  edition('facing','Warm ivory spread with two opposing columns',['comparison'],2,'#F3E9D7','#34261F','#AF512D'),
  edition('paper','Large serif statement on subtly shaded white paper',['paragraph'],0,'#FFFCF6','#251E1A','#9B482C'),
  edition('pullquote','Overscale editorial quotation on forest green',['quote'],0,'#143E31','#FCFAEB','#9BE7A7'),
  edition('night-panel','Midnight editorial page with an inset commentary panel',['paragraph','paragraph'],0,'#10233F','#FFFFFF','#6BB9F7'),
  edition('finale','Quiet pale closing with an oversized multiline statement',['paragraph'],0,'#FAFBF9','#152E43','#347B94'),
  edition('diptych','Two photographs sharing one dark lower headline band',['image','image','paragraph'],0,'#122127','#FFFFFF','#FFCD56'),
  edition('device','Diagonal product collage crossing an announcement stripe',['image','image','paragraph'],0,'#D62746','#FFFFFF','#47F0E1'),
  edition('dispatch','Large scene and framed inset with a gilded bulletin headline',['image','image','paragraph'],0,'#102E32','#FFF4D2','#F6CA6D'),
  edition('demo','Bright full-bleed photograph and translucent light offer panel',['image','paragraph','features'],3,'#F5FAFB','#102F45','#184ECD'),
  edition('inset','Desaturated context photo, portrait inset and highlighted news line',['image','image','paragraph'],0,'#253037','#FFFFFF','#4EF9A0'),
  edition('scrapbook','Pink editorial collage, two photos and overlapping caption bars',['image','image','paragraph'],0,'#F6CBDC','#4B1935','#08674D'),
  edition('portrait-rule','Full-page portrait with lower color headline and fine corner rules',['image','paragraph'],0,'#33201F','#FFFFFF','#FFDB47'),
  edition('profile','Magazine profile with a large portrait and tightly stacked display type',['image','paragraph'],0,'#FFFEFA','#201919','#B44B2B'),
  edition('opening','Full-bleed industry photograph, offer, timing and location in separate editable lines',['image','features'],3,'#331F1B','#FFFFFF','#FFD052'),
  edition('questions','A sequence of question cards with a short response to each question',['features'],4,'#F1F6F7','#153D42','#167C74'),
  edition('competitors','Two competitors compared on the same criteria in order, with aligned rows',['comparison'],2,'#F7F6F2','#1B3043','#254DA4'),
];
export const campaignEdition=(recipeId:string)=>CAMPAIGN_EDITIONS.find(spec=>recipeId==='authored-edition-'+spec.key);
