// Produce compatibility snapshots for consumers pinned to a pre-exhibit release.
// The installed formal registry is preferred as soon as the consumer upgrades.
import {PRESENTATION_EXHIBITS} from '../dist/index.js';
const target = process.argv[2];
if (!['studio','server'].includes(target)) throw Error('Expected studio or server');
const templates = target === 'server' ? PRESENTATION_EXHIBITS :
  PRESENTATION_EXHIBITS.map(({id,key,direction,canvasId,displayNumber,aspectRatios})=>({id,key,direction,canvasId,displayNumber,aspectRatios}));
process.stdout.write(JSON.stringify(templates,null,2)+'\n');
