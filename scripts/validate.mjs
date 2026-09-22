import fs from 'node:fs';

const html=fs.readFileSync('index.html','utf8');
const manifest=fs.readFileSync('manifest.webmanifest','utf8');
const brand=fs.readFileSync('brand-mark.svg','utf8');
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
  'routeHash','restoreRouteFromHash','toggleStudyModule','renderStudyProgress','resetStudyProgress',
  'renderContinueLearning','openContinueModule','stepModule','ensureModuleFooters'
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
  'cockpit','toolDock','homeSearchBtn','personalWorkspace','continuePanel','continueTitle','continueMeta','continueBtn','homeFieldGraphic','studyProgress','studyProgressCount','studyProgressBar','studyProgressChips',
  'safety','math','sandbox','rescue','artifact','burn','learn',
  'brandMark','focusBar','focusTitle','focusGroup','focusPosition','focusRelated','focusStudyBtn','focusPrevBtn','focusNextBtn',
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
  'Continue learning',
  'Mark reviewed',
  'Learning-use boundary'
];
for(const text of requiredCopy){
  if(!html.includes(text)) fail.push('Required learning-hub copy is missing: '+text);
}

if(!fs.existsSync('brand-mark.svg')) fail.push('brand-mark.svg is missing.');
if(!brand.includes('MR Command Center mark')||!brand.includes('#48f0b2')||!brand.includes('#b89cff')) fail.push('Brand mark does not contain the approved MRCC identity markers.');

if(!manifest.includes('MRI learning workspace')) fail.push('Manifest description was not updated for the learning product.');
if(!manifest.includes('/brand-mark.svg')) fail.push('Manifest does not include the new brand mark.');
if(!sw.includes("mrcc-v4.3.0")) fail.push('Service worker cache marker is not v4.3.0.');
if(!sw.includes('/brand-mark.svg')) fail.push('Service worker core assets do not include the brand mark.');

if(fail.length){
  console.error('\nMR Command Center validation failed:\n');
  for(const item of fail) console.error('- '+item);
  process.exit(1);
}
const removedLogic=['normalizeTaskRecord','saveWorkspaceProfile','trackUsage','workspaceReportText','buildLocalBackupPayload','newShift'];
for(const name of removedLogic){if(script.includes(name)) fail.push('Obsolete operational logic is still present: '+name);}
if(!html.includes('<title>MR Command Center — MRI Learning Hub</title>')) fail.push('Page title is not the Learning Hub title.');
if(!html.includes('src="/brand-mark.svg"')) fail.push('Header is not using the new brand mark.');
if(!html.includes('data-module-card="sandbox"')||!html.includes('id="studyProgressBar"')) fail.push('Professional module-card / progress UI is missing.');
if(!html.includes('id="focusPrevBtn"')||!html.includes('id="focusNextBtn"')) fail.push('Previous / next module navigation is missing.');
if(!html.includes('id="homeFieldGraphic"')||!html.includes('FIELD → SIGNAL → IMAGE')) fail.push('MRI field graphic is missing.');
if(!html.includes('class="system-panel" id="offlineBar"')) fail.push('System status was not converted to the compact drawer.');
if(!html.includes('max-width:1400px')||!html.includes('@media(min-width:900px){html{font-size:15px}}')) fail.push('De-zoomed visual system is missing.');
if(fail.length){console.error('\nMR Command Center validation failed:\n');for(const item of fail) console.error('- '+item);process.exit(1);}
console.log('MR Command Center v4.3 Visual System validation passed.');
