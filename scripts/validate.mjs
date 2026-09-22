import fs from 'node:fs';

const html=fs.readFileSync('index.html','utf8');
const manifest=fs.readFileSync('manifest.webmanifest','utf8');
const brand=fs.readFileSync('brand-mark.svg','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const readme=fs.readFileSync('README.md','utf8');
const fail=[];

if((html.match(/<\/html>/g)||[]).length!==1||!html.trim().endsWith('</html>')) fail.push('HTML must end cleanly with exactly one </html>.');

const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
if(scripts.length!==1) fail.push('Expected exactly one inline <script> block.');

const script=scripts[0]?.[1]||'';
if(script){try{new Function(script)}catch(e){fail.push('Inline JavaScript does not parse: '+e.message)}}

const requiredFunctions=[
  'go','openPalette','sandboxUpdate','renderParameterLens','jumpParameterLab',
  'solveArtifact','calcVoxel','calcTime','updateSafety','burnUpdate',
  'renderLearningProgress','scoreQuiz','openPreferences','runSelfCheck',
  'saveSandboxPreset','exportSandboxPresets','importSandboxPresets',
  'saveComparisonHistory','renderComparisonHistory',
  'readStoredJson','trapDialogFocus','localDataHealthy','renderDataHealth',
  'showHome','setFocusedSection','setPaletteCategory','syncMobileNav',
  'routeHash','restoreRouteFromHash','toggleStudyModule','renderStudyProgress','resetStudyProgress',
  'renderContinueLearning','openContinueModule','stepModule','ensureModuleFooters','applyModuleArt','renderLearningPath','syncLearningPathCurrent',
  'startStudySession','startStudySessionModules','startCustomSession','renderStudySession','renderSessionBuilder','renderStudySessionHistory','sessionCompleteStep','sessionStep','resumeStudySession','endStudySession','clearStudySessionHistory','syncStudySessionForModule','studySessionProgress'
];
for(const name of requiredFunctions){
  const declaration=new RegExp('function\\s+'+name+'\\s*\\(');
  const assignment=new RegExp('(?:const|let|var)\\s+'+name+'\\s*=');
  if(!declaration.test(script)&&!assignment.test(script)) fail.push('Required function is missing: '+name);
}

const handlerAttrs=[...html.matchAll(/on(?:click|change|input|keydown)="([^"]+)"/g)];
const referenced=new Set();
for(const attr of handlerAttrs){for(const call of attr[1].matchAll(/\b([A-Za-z_$][\w$]*)\s*\(/g)) referenced.add(call[1]);}
const ignored=new Set(['if','confirm','prompt']);
for(const name of referenced){
  if(ignored.has(name)) continue;
  const declaration=new RegExp('function\\s+'+name+'\\s*\\(');
  const assignment=new RegExp('(?:const|let|var)\\s+'+name+'\\s*=');
  if(!declaration.test(script)&&!assignment.test(script)) fail.push('Inline event handler references an undefined function: '+name);
}

const requiredIds=[
  'cockpit','toolDock','homeSearchBtn','personalWorkspace','continuePanel','continueTitle','continueMeta','continueBtn','continueIcon','homeFieldGraphic','studyProgress','studyProgressCount','studyGauge','studyGaugeValue','learningPath',
  'safety','math','sandbox','rescue','artifact','burn','learn',
  'brandMark','focusBar','focusTitle','focusGroup','focusPosition','focusModuleIcon','focusRelated','focusStudyBtn','focusPrevBtn','focusNextBtn',
  'mobileNav','paletteBack','paletteFilters','prefsBack','dataHealthSummary',
  'artifactSelect','context','sbFov','sbFreq','sbPhaseFov','sbAccel','sbPf','sbSnr',
  'parameterLens','parameterReference','presetList','presetSearch','comparisonHistoryList',
  'learningProgress','learnHistory','learnAttempts','learnBest','learnLatest','learnDays',
  'sessionStudio','sessionStatusPill','sessionCustom','sessionCustomModules','sessionHomeState','sessionHistory','sessionHistoryCount','sessionHistoryList',
  'sessionBar','sessionBarIcon','sessionBarTitle','sessionBarProgressText','sessionBarProgressFill','sessionPrevBtn','sessionNextBtn','sessionCompleteBtn'
];
for(const id of requiredIds){if(!html.includes('id="'+id+'"')) fail.push('Required element id is missing: '+id);}

const forbiddenFragments=[
  '<section id="shift"','<section id="reports"','id="shiftTemplates"','id="workspaceProfilesCard"','id="backupCard"',
  'data-mobile-route="shift"','>New Shift<','Operational snapshot','Shift pulse','Ready-state dashboard',
  'id="secretBreak"','id="secretMood"','id="secretAfterHours"',
  'showAllTools','nav-browse','dockmore','dockmenu','task-entry','report-shell','shiftreset'
];
for(const fragment of forbiddenFragments){if(html.includes(fragment)) fail.push('Removed legacy surface returned unexpectedly: '+fragment);}

const requiredCopy=[
  'MR Learning Hub','Build MRI intuition, one concept at a time','MR Safety Foundations','Scan Math','Parameter Lab',
  'Sequence Rescue','Artifact Solver','Thermal / RF Foundations','Micro-Lab','Learning path','Continue learning',
  'Mark reviewed','Learning-use boundary','Settings & shortcuts','Build a focused study session','Quick review','Troubleshooting route','Safety + RF route','Full learning path'
];
for(const text of requiredCopy){if(!html.includes(text)) fail.push('Required learning-hub copy is missing: '+text);}

const moduleOrder=['safety','math','sandbox','rescue','artifact','burn','learn'];
const navStart=html.indexOf('<nav class="tool-dock" id="toolDock"');
const navEnd=html.indexOf('</nav>',navStart);
const navHtml=navStart>=0&&navEnd>navStart?html.slice(navStart,navEnd):'';
const positions=moduleOrder.map(id=>navHtml.indexOf('data-module-card="'+id+'"'));
if(positions.some(x=>x<0)||positions.some((x,i)=>i>0&&x<=positions[i-1])) fail.push('Home learning cards are missing or not in guided-sequence order.');

const removedLogic=['normalizeTaskRecord','saveWorkspaceProfile','trackUsage','workspaceReportText','buildLocalBackupPayload','newShift','moduleMeta'];
for(const name of removedLogic){if(script.includes(name)) fail.push('Obsolete logic is still present: '+name);}

if(!fs.existsSync('brand-mark.svg')) fail.push('brand-mark.svg is missing.');
if(fs.existsSync('brand-mark.png')) fail.push('Legacy brand-mark.png should not remain in the repository.');
if(!brand.includes('MR Command Center mark')||!brand.includes('#48f0b2')||!brand.includes('#b89cff')) fail.push('Brand mark does not contain the approved MRCC identity markers.');
if(!manifest.includes('MRI learning workspace')) fail.push('Manifest description is not the learning-product description.');
if(!manifest.includes('/brand-mark.svg')) fail.push('Manifest does not include the SVG brand mark.');
if(!sw.includes("mrcc-v4.7.0")) fail.push('Service worker cache marker is not v4.7.0.');
if(!sw.includes('/brand-mark.svg')) fail.push('Service worker core assets do not include the brand mark.');
if(!html.includes('<title>MR Command Center — MRI Learning Hub</title>')) fail.push('Page title is not the Learning Hub title.');
if(!html.includes('src="/brand-mark.svg"')) fail.push('Header is not using the SVG brand mark.');
if(!html.includes('data-module-card="burn"')) fail.push('Thermal / RF home module card is missing.');
if(!html.includes('id="focusPrevBtn"')||!html.includes('id="focusNextBtn"')) fail.push('Previous / next module navigation is missing.');
if(!html.includes('id="homeFieldGraphic"')||!html.includes('FIELD → SIGNAL → IMAGE')) fail.push('MRI field graphic is missing.');
if(!html.includes('class="system-panel" id="offlineBar"')) fail.push('Compact system-status drawer is missing.');
if(!html.includes('max-width:1400px')||!html.includes('@media(min-width:900px){html{font-size:15px}}')) fail.push('De-zoomed visual system is missing.');
if(!script.includes('const moduleArt=')||!script.includes('function applyModuleArt')) fail.push('Module artwork system is missing.');
for(const key of ['safety','math','sandbox','rescue','artifact','burn','learn']){if(!script.includes(key+':{')) fail.push('Module artwork entry is missing: '+key);}
for(const caption of ['IDENTIFY → VERIFY → MATCH','SAMPLE → CALCULATE → INTERPRET','CHANGE → TRADEOFF → COMPARE','PROBLEM → LEVER → COST','PATTERN → CAUSE → RESPONSE','GEOMETRY → RF → FEEDBACK','RECALL → SCORE → REVISIT']){if(!script.includes(caption)) fail.push('Module artwork caption is missing: '+caption);}
if(!html.includes('id="focusModuleIcon"')) fail.push('Focus-bar module icon is missing.');
if(!html.includes('id="learningPath"')||!html.includes('id="studyGauge"')||!html.includes('id="studyGaugeValue"')) fail.push('Learning path / completion gauge is missing.');
if(!script.includes('function renderLearningPath')||!script.includes('function syncLearningPathCurrent')) fail.push('Learning path behavior is missing.');
if(!script.includes('const moduleAccent=')) fail.push('Module accent map is missing.');
if(!html.includes('id="continueIcon"')) fail.push('Continue Learning module icon is missing.');
if(html.includes('id="studyProgressBar"')||html.includes('id="studyProgressChips"')) fail.push('Legacy chip-based study progress UI returned.');
if(!html.includes('id="sessionStudio"')||!html.includes('id="sessionBar"')||!html.includes('id="sessionHistoryList"')) fail.push('Study Session UI is missing.');
if(!script.includes('const studySessionPresets=')||!script.includes('mrcc_study_session')||!script.includes('mrcc_study_session_history')) fail.push('Study Session state model is missing.');
for(const mode of ['quick','troubleshoot','safety','full']){if(!script.includes(mode+':{label:')) fail.push('Study Session preset is missing: '+mode);}
if(!script.includes("id:'studysession'")) fail.push('Quick Console Study Sessions command is missing.');
if(!html.includes('review markers unchanged')||!html.includes('Session completion is separate from your “Reviewed” markers.')) fail.push('Study Session / Reviewed-marker separation copy is missing.');
if(!script.includes("bar.classList.toggle('show',document.body.classList.contains('nav-focus'))")) fail.push('Study Session bar is not scoped to focused modules.');
const sessionCompleteStart=script.indexOf('function sessionCompleteStep(){');
const sessionCompleteEnd=script.indexOf('function endStudySession(){',sessionCompleteStart);
const sessionCompleteBody=sessionCompleteStart>=0&&sessionCompleteEnd>sessionCompleteStart?script.slice(sessionCompleteStart,sessionCompleteEnd):'';
if(!sessionCompleteBody||sessionCompleteBody.includes('toggleStudyModule')||sessionCompleteBody.includes('studyState[')) fail.push('Study Session completion must remain separate from Reviewed markers.');
if(!script.includes('Array.isArray(studySessionHistory)')) fail.push('Study Session history is not included in local data health.');
if(!readme.includes('v4.7 — Study Sessions')||!readme.includes('MRI learning hub')) fail.push('README is stale.');

if(fail.length){
  console.error('\nMR Command Center validation failed:\n');
  for(const item of fail) console.error('- '+item);
  process.exit(1);
}

console.log('MR Command Center v4.7 Study Sessions validation passed.');
