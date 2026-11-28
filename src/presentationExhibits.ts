import type {ParameterSchema} from './recipeParameters.js';

export const PRESENTATION_EXHIBIT_CANVAS = 'semantic:presentation:authored-image-inset';

const object = (properties: Record<string, unknown>) => ({type:'object', additionalProperties:false, required:Object.keys(properties), properties});
const label = (maxLength: number) => ({type:'string', minLength:1, maxLength});
const list = (items: object, minItems: number, maxItems: number) => ({type:'array',items,minItems,maxItems});
const number = (minimum: number, maximum: number) => ({type:'number',minimum,maximum});
const figure = {anyOf:[{type:'number'}, {type:'string',pattern:'^\\{\\{[a-zA-Z][a-zA-Z0-9_]*\\}\\}$'}]};
const locator = object({
  kind:{const:'locator'},
  places:list(object({label:label(48), detail:label(120), latitude:number(-90,90), longitude:number(-180,180)}),2,8),
  links:list(object({from:{type:'integer',minimum:1,maximum:8},to:{type:'integer',minimum:1,maximum:8}}),0,12),
});
const benchmark = object({
  kind:{const:'editorial-benchmark'}, unit:label(28),
  rows:list(object({label:label(32),low:{type:'number'},high:{type:'number'}}),2,6),
});
const paired = object({kind:{const:'paired'},unit:label(24),firstLabel:label(22),secondLabel:label(22),
  rows:list(object({label:label(26),unit:label(24),first:figure,second:figure}),2,7)});
const matrix = object({kind:{const:'scenario-matrix'},criteriaLabel:label(26),alternatives:list(label(24),2,4),
  highlighted:{anyOf:[label(24),{type:'integer',minimum:0,maximum:4}],description:'Use the exact name of the recommended alternative, or 0 for equal emphasis. Saved 1-based positions are accepted.'},
  rows:list(object({label:label(26),cells:list(label(45),2,4)}),2,6)});

const level = {type:'integer',minimum:1,maximum:5};
const riskMatrix = object({
  kind:{const:'risk-matrix'}, likelihoodLabel:label(32), impactLabel:label(32), legendTitle:label(32),
  bands:list(object({maxScore:{type:'integer',minimum:1,maximum:25},label:label(20),action:label(50)}),2,5),
  risks:list(object({id:label(8),likelihood:level,impact:level}),1,16),
});

const trend = object({
  kind:{const:'multi-line'}, axisLabel:label(36), unit:label(20), categories:list(label(20),2,12),
  series:list(object({label:label(26),unit:label(20),values:list(figure,2,12)}),2,4),
});
const mosaic = object({
  kind:{const:'share-mosaic'}, segments:list(label(22),2,5),
  columns:list(object({label:label(24),weight:{anyOf:[figure,{type:'null'}],description:'Total size for this column when values are percentages; null uses sum of the raw component quantities.'},values:list(figure,2,5)}),2,6),
});
const process = object({
  kind:{const:'chevron-process'}, steps:list(object({label:label(28),detail:label(84)}),2,5),
  noteTitle:label(36), notes:list(label(90),1,3),
});
const measuredMetric=object({label:label(32),current:figure,baseline:figure,unit:label(20),baselineLabel:label(22),
  change:{enum:['relative','difference','points']},precision:{type:'integer',minimum:0,maximum:3}});
const summary = object({
  kind:{const:'kpi-brief'}, metrics:list({anyOf:[measuredMetric,object({label:label(32),value:label(24),comparison:label(48)})]},2,4),
  insights:list(label(110),1,3),
});
const breakdown = object({
  kind:{const:'reconciled-breakdown'}, totalLabel:label(36), total:figure, unit:label(20),
  basis:label(90), rows:list(object({label:label(36),amount:figure}),2,6),
});
const barEvidence = object({
  kind:{const:'bar-evidence'}, chartTitle:label(40),
  rows:list(object({label:label(32),amount:figure,unit:label(18)}),2,5),
  highlight:label(64), highlightDetail:label(92), methodTitle:label(32), method:label(140),
});
const interfaces = object({
  kind:{const:'interface-hub'}, hub:label(32),
  links:list(object({peer:label(36),flow:label(42),direction:{enum:['to-hub','from-hub']}}),2,6),
});
const schedule = object({
  kind:{const:'interval-roadmap'}, timeUnit:label(16), horizon:{type:'integer',minimum:2,maximum:120},
  gateHeading:label(24), tasks:list(object({label:label(32),start:{type:'integer',minimum:1},end:{type:'integer',minimum:1},gate:label(46)}),2,7),
});
const returns = object({
  kind:{const:'investment-return'}, unit:label(16), timeUnit:label(16), initial:figure,
  headings:object({period:label(24),investment:label(24),benefit:label(24),balance:label(24),initial:label(24),roi:label(28),payback:label(28),unrecovered:label(32)}),
  periods:list(object({label:label(18),investment:figure,netBenefit:figure}),2,6),
});
const formulaSteps = object({
  kind:{const:'formula-steps'},
  steps:list(object({label:label(32), notation:{enum:['latex','mhchem']}, source:label(320), reason:label(72)}),1,4),
});
const formulaLabels = {label:label(36),symbol:label(20),detail:label(90)};
const formulas = object({
  kind:{const:'ratio-definitions'}, rows:list({anyOf:[
    object({...formulaLabels,numerator:label(38),denominator:label(38),suffix:{type:'string',maxLength:32}}),
    object({...formulaLabels,expression:label(75)}),
  ]},1,3),
});

// The writer fills this structured contract. The compiler then produces a
// portable diagram asset and takeaway for the shared presentation canvas.
function exhibit(key: string, direction: string, displayNumber: string, maxEntries: number, block: ParameterSchema, description: string, minEntries = 2) {
  return {
    id:'exhibit:'+key, key, direction, displayNumber, minEntries, maxEntries, description,
    canvasId:PRESENTATION_EXHIBIT_CANVAS, aspectRatios:{min:1.4,max:2},
    parameterSchema:object({title:label(64),blocks:{type:'array',items:[
      block,object({kind:{const:'paragraph'},text:label(240)}),
    ],minItems:2,maxItems:2,additionalItems:false}}),
  };
}

export const PRESENTATION_EXHIBITS = [
  {...exhibit('editorial-benchmark','editorial-benchmark','S065',6,benchmark,
    'Compare numerical intervals for two to six named objects on one scale. Supply each lower and upper bound as a number in the same declared unit, with low <= high. Use a neutral chart title. The chart prints both endpoints directly.'), id:'social:editorial-benchmark'},
  exhibit('formula-steps','formula-steps','E15',4,formulaSteps,
    'Teaching board for mathematics and chemistry. Align one to four typeset expressions with the operation, observation or reason. Use for modeling, worked examples, checks, reaction equations or comparing correct and incorrect forms. For mathematics write LaTeX source without display delimiters. For chemical species, charges, states, equilibria and reactions use unwrapped mhchem source. Preserve symbols, coefficients, signs and units. Use visible prose in the requested language.',1),
  exhibit('locator','locator','E01',8,locator,
    'Geographic locator map with a real basemap, numbered sites and a corresponding legend. Use actual approximate longitude/latitude; links are optional 1-based site pairs, only for meaningful routes. Name the place, then give a short role or quantity in detail. Mark illustrative sites or flows in the takeaway.'),
  exhibit('paired-change','paired','E02',7,paired,
    'Compare two scenarios, periods or designs on one quantitative scale across named categories. Dumbbell plot and aligned exact values. Declare the actual display unit on each row; within one row both endpoints use the same unit and time basis. Use the same unit spelling for comparable rows. Different units have independent axes. Reference shared calculated figures for repeated amounts.'),
  exhibit('scenario-matrix','scenario-matrix','E03',6,matrix,
    'Decision table. Give competing alternatives the same criteria, units and time horizon. One short cell per alternative per row, in order. Use shared {{figureId}} references with units. Highlight one alternative only when justified.'),
  exhibit('multi-line','multi-line','E04',12,trend,
    'Compare two to four named series on the same ordered time points. Name the horizontal dimension in axisLabel. Declare the actual unit on each series; identical units share an axis, different units use aligned small multiples. Use the same unit spelling for comparable series. Never put units only in legend labels. Every series supplies one finite observation for every category, in order. Put the supported change and period in the title; interpret the key divergence in the takeaway.'),
  exhibit('share-mosaic','share-mosaic','E05',6,mosaic,
    'Marimekko composition across categories. Each column supplies nonnegative quantities in the declared segment order and a positive total. Width is proportional to total; height is the within-column share. If shares are percentages and widths must show size, provide each column’s real or illustrative total as weight using one common unit. For comparable 100% shares use equal column totals. Do not mix percentages and volumes.'),
  exhibit('chevron-process','chevron-process','E06',5,process,
    'Connected arrow stages. Give each short action a separate detail, then state the assumptions, inputs or acceptance conditions in the lower band. Use for a directional sequence.'),
  exhibit('kpi-brief','kpi-brief','E07',4,summary,
    'Executive readout: two to four prominent KPIs with unit and comparable baseline or delta, then one to three separate judgements. For every measured baseline comparison provide current, baseline, display unit, baselineLabel, change and precision. The host prints the value and calculates the change. Use the value/comparison text variant only for a qualitative qualification when no numeric baseline exists. Each judgement explains the implication, driver or decision.'),
  exhibit('ratio-definitions','ratio-definitions','E08',3,formulas,
    'Metric glossary. For a quotient supply the numerator, denominator and optional trailing multiplier. For a difference, sum or product supply its direct expression. A difference between normalized shares is already normalized. Include a symbol and concise interpretation for each row. Use the same units, population and period throughout. Do not emit LaTeX in these plain labels.',1),
  exhibit('reconciled-breakdown','reconciled-breakdown','E09',6,breakdown,
    'Show one total beside a horizontal breakdown of its two to six mutually exclusive parts. Use a single period, population and display unit for the total and every amount. Reuse exact {{figureId}} references for amounts repeated elsewhere. Parts must add to the declared total. The renderer calculates each share and draws a linear bar from zero. State the period and reporting or illustrative basis in the basis field. Suitable for money, counts, volume and time.'),
  exhibit('bar-evidence','bar-evidence','E10',5,barEvidence,
    'Horizontal bars with exact end labels on the left. On the right, put one key result in a tinted callout, then explain the population, method or counting basis below. Give each category a nonnegative observation and its explicit unit. Use at most two distinct units; each has an independent zero-based scale. Use the caption for context, source or a qualification. Suitable for outcomes, operations and research.'),
  exhibit('interface-hub','interface-hub','E11',6,interfaces,
    'Directed interface map around a named hub. Each peer sends or receives an explicitly named payload. Use two links for a reciprocal exchange with different payloads. Arrowheads follow direction. A layer stack instead describes levels of responsibility.'),
  exhibit('interval-roadmap','interval-roadmap','E12',7,schedule,
    'Schedule on one proportional time axis, with overlapping workstreams and row-aligned acceptance gates. Start and end are inclusive 1-based period numbers within the horizon. Each gate identifies a verifiable deliverable or threshold.'),
  exhibit('risk-matrix','risk-matrix','E14',16,riskMatrix,
    'Editable 5 by 5 likelihood–impact heatmap. Scores are likelihood times impact on 1–5 axes. Supply unique short register IDs and ordered band upper limits ending at 25, each with a localized response action. Counts, score ranges, locations and colors are computed from the records. Keep these IDs in subsequent mitigation, owner, deadline and verification records.',1),
  exhibit('investment-return','investment-return','E13',6,returns,
    'Investment decision schedule for equal periods. Positive time-zero investment, additional nonnegative period investment, and signed operating cash benefit net of recurring costs, before capital expenditure. Use the same currency and reporting magnitude as the budget. The host derives cumulative cash balance, undiscounted horizon ROI and first interpolated payback. Localize column headings and unrecovered status. Use the takeaway to describe ramp-up, exclusions or assumptions.'),
] as const;

// Shared catalog layouts keep their existing renderer and article curation.
export const NATIVE_PRESENTATION_EXHIBITS = PRESENTATION_EXHIBITS.filter(spec => spec.id.startsWith('exhibit:'));
