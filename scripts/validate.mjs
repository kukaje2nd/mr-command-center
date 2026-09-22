import fs from 'node:fs';

const html=fs.readFileSync('index.html','utf8');
const manifest=fs.readFileSync('manifest.webmanifest','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const fail=[];

if((html.match(/<\/html>/g)||[]).length!==1||!html.trim().endsWith('</html>')) fail.push('HTML must end cleanly with exactly one </html>.');

const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
if(scripts.length!==1) fail.push('Expected exactly one inline <script> block.');

const script=scripts[0]?.[1]||'';
if(script){
  try{new Function(script)}catch(e){fail.push('Inline JavaScript does not parse: '+e.message)}
}

const requiredFunctions=[
  'go','openPalette','sandboxUpdate','renderParameterLens','jumpParameterLab',
  'solveArtifact','calcVoxel','calcTime','updateSafety','burnUpdate',
  'renderLearningProgress','scoreQuiz','openPreferences','runSelfCheck',
  'saveSandboxPreset','exportSandboxPresets','importSandboxPresets',
  'saveComparisonHistory','renderComparisonHistory',
  'readStoredJson','trapDialogFocus','localDataHealthy','renderDataHealth',
  'showHome','setFocusedSection','setPaletteCategory','syncMobileNav',
  'routeHash','restoreRouteFromHash','toggleStudyModule','renderStudyProgress','resetStudyProgress'
];

for(const name of requiredFunctions){
  const declaration=new RegExp('function\\s+'+name+'\\s*\\(');
  const assignment=new RegExp('(?:const|let|var)\\s+'+name+'\\s*=');
  if(!declaration.test(script)&&!assignment.test(script)) fail.push('Required function is missing: '+name);
}

const handlerAttrs=[...html.matchAll(/on(?:click|change|input|keydown)="([^"]+)"/g)];
const referenced=new Set();
for(const attr of handlerAttrs){
  for(const call of attr[1].matchAll(/\b([A-Za-z_$][\w$]*)\s*\(/g)) referenced.add(call[1]);
}
const ignored=new Set(['if','confirm','prompt']);
for(const name of referenced){
  if(ignored.has(name)) continue;
  const declaration=new RegExp('function\\s+'+name+'\\s*\\(');
  const assignment=new RegExp('(?:const|let|var)\\s+'+name+'\\s*=');
  if(!declaration.test(script)&&!assignment.test(script)) fail.push('Inline event handler references an undefined function: '+name);
}

const requiredIds=[
  'cockpit','toolDock','homeSearchBtn','personalWorkspace','studyProgress','studyProgressCount','studyProgressChips',
  'safety','math','sandbox','rescue','artifact','burn','learn',
  'brandMark','focusBar','focusTitle','focusGroup','focusRelated','focusStudyBtn',
  'mobileNav','paletteBack','paletteFilters','prefsBack','dataHealthSummary',
  'artifactSelect','context','sbFov','sbFreq','sbPhaseFov','sbAccel','sbPf','sbSnr',
  'parameterLens','parameterReference','presetList','presetSearch','comparisonHistoryList',
  'learningProgress','learnHistory','learnAttempts','learnBest','learnLatest','learnDays'
];
for(const id of requiredIds){
  if(!html.includes('id="'+id+'"')) fail.push('Required element id is missing: '+id);
}

const forbiddenFragments=[
  '<section id="shift"',
  '<section id="reports"',
  'id="shiftTemplates"',
  'id="workspaceProfilesCard"',
  'id="backupCard"',
  'data-mobile-route="shift"',
  '>New Shift<',
  'Operational snapshot',
  'Shift pulse',
  'Ready-state dashboard',
  'id="secretBreak"',
  'id="secretMood"',
  'id="secretAfterHours"'
];
for(const fragment of forbiddenFragments){
  if(html.includes(fragment)) fail.push('Removed non-learning UI returned unexpectedly: '+fragment);
}

const requiredCopy=[
  'MR Learning Hub',
  'Build MRI intuition, one concept at a time',
  'MR Safety Foundations',
  'Parameter Lab',
  'Sequence Rescue',
  'Artifact Solver',
  'Scan Math',
  'Micro-Lab',
  'Study progress',
  'Mark reviewed',
  'Learning-use boundary'
];
for(const text of requiredCopy){
  if(!html.includes(text)) fail.push('Required learning-hub copy is missing: '+text);
}

if(!fs.existsSync('brand-mark.png')) fail.push('brand-mark.png is missing.');
else if(fs.statSync('brand-mark.png').size<1000) fail.push('brand-mark.png looks unexpectedly small.');

if(!manifest.includes('MRI learning workspace')) fail.push('Manifest description was not updated for the learning product.');
if(!manifest.includes('/brand-mark.png')) fail.push('Manifest does not include the new brand mark.');
if(!sw.includes("mrcc-v4.0.0")) fail.push('Service worker cache marker is not v4.0.0.');
if(!sw.includes('/brand-mark.png')) fail.push('Service worker core assets do not include the brand mark.');

if(fail.length){
  console.error('\nMR Command Center validation failed:\n');
  for(const item of fail) console.error('- '+item);
  process.exit(1);
}
console.log('MR Command Center v4.0 Learning Hub validation passed.');
