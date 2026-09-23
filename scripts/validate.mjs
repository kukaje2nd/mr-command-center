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
  'go','showHome','setFocusedSection','openWorkspaceView','setWorkspaceTabActive','openLab','renderLabsHome',
  'kspaceUpdate','kspaceDft1D','kspaceDft2D','kspaceApplyMask','kspaceModeChanged','applyKspacePreset','restoreKspaceState','kspaceReset',
  'openPalette','setPaletteCategory','openPreferences','runSelfCheck',
  'routeHash','restoreRouteFromHash','syncMobileNav',
  'sandboxUpdate','renderParameterLens','jumpParameterLab',
  'openParameterGoal','renderParameterGoalFeedback',
  'openParameterChallenge','renderParameterChallenge',
  'restoreSandboxCurrentState','quickSaveSandboxPreset',
  'saveSandboxPreset','exportSandboxPresets','importSandboxPresets',
  'swapSandboxComparison','saveComparisonHistory','renderComparisonHistory',
  'openParameterReferenceGroup',
  'contrastUpdate','contrastSignal','contrastTeachingCue','applyContrastPreset','contrastReset','restoreContrastState',
  'calcVoxel','calcTime','solveArtifact','updateSafety','burnUpdate',
  'readStoredJson','trapDialogFocus','localDataHealthy','renderDataHealth'
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
  'workspaceRail','cockpit','cockpitTitle','homeParameterState','homeParameterMeta','homeContrastState','homeContrastMeta','homeKspaceState','homeKspaceMeta','homePresetResumeCount','homeCompareResumeCount','sandbox','contrast','kspace','mobileNav',
  'ksMode','ksAmount','ksAmountRow','ksAmountLabel','ksAmountHint','ksAmountOut','ksExplain','ksKspaceCanvas','ksImageCanvas','ksRetainedBadge','ksEffectBadge','ksRetained','ksEffect','ksEffectDetail','ksKeyIdea','ksKeyDetail',
  'labContinuity','labContinuityTitle','labContinuityMeta','labChallengeLauncher',
  'paramControlsCard','paramModelCard','parameterLens','parameterReference','workspaceReferenceHub',
  'clMode','clTr','clTe','clTi','clTiRow','clTrOut','clTeOut','clTiOut','contrastMaterials','clModeBadge','clSpread','clBrightest','clCue','clCueDetail','contrastEquation',
  'presetLibrary','presetList','presetSearch',
  'parameterChallengePanel','parameterChallengeTitle','parameterChallengeCopy','parameterChallengeState','parameterChallengeReference','parameterChallengeConstraints',
  'parameterGoalPanel','parameterGoalTitle','parameterGoalCopy','parameterGoalTabs','parameterGoalTracker','parameterGoalTarget','parameterGoalMetric','parameterGoalMetricLabel','parameterGoalProgress','parameterGoalProgressCopy','parameterGoalCost','parameterGoalCostCopy','parameterGoalProgressBar',
  'parameterCompareWorkbench','compareContext','compareASummary','compareAMeta','compareBSummary','compareBMeta','compareSwapBtn','compareRestoreBtn','compareClearBtn','comparisonHistoryList',
  'paramRefGeometry','paramRefSignal','paramRefTime','paramRefContrast','paramRefArtifact',
  'math','rescue','artifact','safety','burn',
  'brandMark','paletteBack','paletteFilters','prefsBack','dataHealthSummary'
]
for(const id of requiredIds){if(!html.includes('id="'+id+'"')) fail.push('Required element id is missing: '+id);}

const forbiddenFragments=[
  '<section id="shift"','<section id="reports"','id="shiftTemplates"','id="workspaceProfilesCard"','id="backupCard"',
  'data-mobile-route="shift"','>New Shift<','Operational snapshot','Shift pulse','Ready-state dashboard',
  'id="secretBreak"','id="secretMood"','id="secretAfterHours"',
  'showAllTools','nav-browse','dockmore','dockmenu','task-entry','report-shell','shiftreset'
];
for(const fragment of forbiddenFragments){if(html.includes(fragment)) fail.push('Removed legacy surface returned unexpectedly: '+fragment);}

const requiredCopy=[
  'Learn MRI by changing the model.','Lab library','Pick the model you want to interrogate.','Your local workspace','Resume without rebuilding the experiment.',
  'Parameter Lab','Build, compare, and reason through the parameter stack',
  'Contrast Lab','Change timing. Watch synthetic signals separate.','Model boundary','Synthetic material definitions',
  'K-Space Lab','Mask frequency space. Reconstruct the consequence.','Sampled k-space','Teaching reconstruction',
  'Current workspace','Problem mode','Start from a constraint',
  'A/B Parameter Compare','Parameter Reference','Related tools',
  'MR Safety Reference','RF / thermal details',
  'Learning-use boundary','Settings & shortcuts'
]
for(const text of requiredCopy){if(!html.includes(text)) fail.push('Required v7 workspace copy is missing: '+text);}

const removedLogic=['normalizeTaskRecord','saveWorkspaceProfile','trackUsage','workspaceReportText','buildLocalBackupPayload','newShift','moduleMeta'];
for(const name of removedLogic){if(script.includes(name)) fail.push('Obsolete logic is still present: '+name);}

if(!fs.existsSync('brand-mark.svg')) fail.push('brand-mark.svg is missing.');
if(fs.existsSync('brand-mark.png')) fail.push('Legacy brand-mark.png should not remain in the repository.');
if(!brand.includes('MR Command Center mark')||!brand.includes('#48f0b2')||!brand.includes('#b89cff')) fail.push('Brand mark does not contain the approved MRCC identity markers.');
if(!manifest.includes('Fourier-based K-Space')) fail.push('Manifest description is not the v7.3 K-Space Labs description.');
if(!manifest.includes('/brand-mark.svg')) fail.push('Manifest does not include the SVG brand mark.');
if(!sw.includes("mrcc-v7.3.0")) fail.push('Service worker cache marker is not v7.3.0.');
if(!sw.includes('/brand-mark.svg')) fail.push('Service worker core assets do not include the brand mark.');
if(!html.includes('<title>MR Command Center — MRI Labs</title>')) fail.push('Page title is not the v7.2 MRI Labs title.');
if(!html.includes('src="/brand-mark.svg"')) fail.push('Header is not using the SVG brand mark.');
if(!html.includes('class="system-panel" id="offlineBar"')) fail.push('Compact system-status drawer is missing.');
if(!html.includes('id="routeAnnouncer"')||!script.includes('function announceRoute')||!script.includes("history[replace?'replaceState':'pushState']")) fail.push('Accessible route announcements or browser history navigation are missing.');
if(!html.includes('id="workspaceRail"')||!html.includes('id="labChallengeLauncher"')||!html.includes('id="workspaceReferenceHub"')) fail.push('V7 workspace navigation / contextual surfaces are missing.');
if(!html.includes('/* v7.1 Labs + Contrast Lab */')||!script.includes('const contrastMaterialsModel=')||!script.includes('mrcc_contrast_current')) fail.push('v7.1 Contrast Lab implementation is missing.');
if(!html.includes('/* v7.2 Labs home + polish */')||!html.includes('class="labs-library"')||!html.includes('class="labs-home-work"')||!script.includes('function renderLabsHome')) fail.push('v7.2 Labs home implementation is missing.');
if(!html.includes('/* v7.3 K-Space Lab */')||!script.includes('const KS_N=32')||!script.includes('function kspaceDft2D')||!script.includes('function kspaceApplyMask')||!script.includes('mrcc_kspace_current')) fail.push('v7.3 K-Space Lab implementation is missing.');
if(!html.includes('not MRI raw data from a patient or scanner')||!html.includes('Brightness is normalized for visibility')) fail.push('K-Space Lab model-boundary copy is missing.');
if(!html.includes('not human tissue values')||!html.includes('They do not predict real image intensity.')) fail.push('Contrast Lab model-boundary copy is missing.');
if(!script.includes("function showHome")||!script.includes("setWorkspaceTabActive('home')")||!script.includes("routeHash('',replaceRoute)")||!script.includes("renderLabsHome()")) fail.push('Labs-first home route behavior is missing.');
if(!html.includes('id="parameterCompareWorkbench"')||!html.includes('id="parameterReference"')||!html.includes('id="presetLibrary"')) fail.push('Core reusable workspace tools are missing.');
if(!html.includes('id="safety"')||!html.includes('RF / thermal details')) fail.push('Safety reference or integrated RF / thermal path is missing.');
if(!html.includes('id="math"')||!html.includes('id="rescue"')||!html.includes('id="artifact"')) fail.push('Supporting reference tools are missing.');
if(!script.includes('const parameterGoals=')||!script.includes('function openParameterGoal')||!script.includes('function renderWorkbenchHome')) fail.push('Parameter workbench behavior is missing.');
if(!script.includes('function parameterGoalFeedback')||!script.includes('function renderParameterGoalFeedback')||!script.includes('parameterGoalTargetPct=20')) fail.push('Goal-tracker behavior is missing.');
if(!script.includes('const parameterChallenges=')||!script.includes('function openParameterChallenge')||!script.includes('function renderParameterChallenge')||!script.includes('function challengeChangedControlCount')) fail.push('v5.6 constraint-challenge behavior is missing.');
for(const id of ['faster','detail','signal','balanced']){if(!script.includes(id+':{title:')) fail.push('Constraint challenge is missing: '+id);}
if(!html.includes('Start from a constraint')||!html.includes('Challenge success means only that this simplified relative model satisfies the displayed constraints.')) fail.push('Constraint-challenge boundary copy is missing.');
if(!html.includes('Directional only — no universal numeric distortion target is claimed.')||!html.includes('Largest modeled cost')) fail.push('Goal-tracker safety / tradeoff copy is missing.');
if(!html.includes('class="param-reference-nav"')||!html.includes('class="param-reference-reading-note"')||!script.includes('function openParameterReferenceGroup')) fail.push('v5.7 Parameter Reference presentation is missing.');
if((html.match(/reference-tool-section/g)||[]).length<6||!html.includes('/* v5.7 Reference presentation */')) fail.push('v5.7 shared reference-section presentation is missing.');
if(!html.includes('/* v5.8 Workspace presentation */')||!html.includes('workspace-panel-icon')) fail.push('v5.8 reusable workspace presentation system is missing.');
if(!html.includes('/* v5.9 Workspace navigation */')||!script.includes('function runFocusPrimary')||!script.includes("aria-label','Workspace navigation'")) fail.push('v5.9 workspace navigation is missing.');
if(!html.includes('/* v6.0 Lab continuity */')||!script.includes("mrcc_sandbox_current")||!script.includes('function restoreSandboxCurrentState')||!script.includes('function quickSaveSandboxPreset')||!script.includes('function queueSandboxAutosave')) fail.push('v6.0 Lab continuity is missing.');
if(!html.includes('/* v6.1 Compare flow */')||!script.includes('function swapSandboxComparison')||!html.includes('Only changed controls are shown below')||!html.includes('Compare vs current')) fail.push('v6.1 compare flow is missing.');
for(const legacyId of ['focusStudyBtn','focusPrevBtn','focusNextBtn']){if(html.includes('id="'+legacyId+'"')) fail.push('Course-style focus control returned: '+legacyId);}
if(html.includes('Previous / next module')||html.includes('aria-label="Previous learning module"')||html.includes('aria-label="Next learning module"')) fail.push('Linear course navigation copy returned.');
if(!html.includes('/* v7.0 Workspace architecture */')||!script.includes('function openWorkspaceView')||!script.includes('function setWorkspaceTabActive')) fail.push('v7.0 workspace architecture is missing.');
if(!script.includes("document.title='MR Command Center — MRI Labs'")||!html.includes('/* v7.2 Labs home + polish */')) fail.push('V7.2 Labs home is missing.');
if(!html.includes('body.nav-home #cockpit{display:block!important}')||!html.includes('.creator-zone,.practice-zone,.reference-onboarding{display:none!important}')) fail.push('Labs home visibility or retired secondary surfaces are incorrect.');
if(!script.includes("retiredV7Commands")||!script.includes("'caselab'")||!script.includes("'packstudio'")||!script.includes("'learningprogress'")) fail.push('Retired v7 commands are not filtered from Search.');
if(!script.includes("if(id==='learn'){openWorkspaceView('challenges');return}")) fail.push('Retired Micro-Lab route does not redirect to Challenges.');
if(!html.includes('data-workspace-tab="home"')||!html.includes('data-workspace-tab="labs"')||!html.includes('data-workspace-tab="compare"')||!html.includes('data-workspace-tab="reference"')||!html.includes('data-workspace-tab="safety"')) fail.push('Five-destination Home/Labs navigation is incomplete.');
if((html.match(/onclick="openLab\\('kspace'\\)"/g)||[]).length<4||html.includes('title="Planned lab"')) fail.push('K-Space Lab is not fully activated across Labs navigation and home.');






if(!readme.includes('v7.3 — K-Space Lab')||!readme.includes('discrete Fourier transform')) fail.push('README is stale.');
if(!fs.existsSync('SELLING_CASE_PACKS.md')) fail.push('SELLING_CASE_PACKS.md is missing.');
if(!fs.existsSync('USING_CASE_PACKS.md')) fail.push('USING_CASE_PACKS.md is missing.');
else{const using=fs.readFileSync('USING_CASE_PACKS.md','utf8');if(!using.includes('Installed does not mean licensed')||!using.includes('stable pack ID')) fail.push('USING_CASE_PACKS.md is missing buyer-side delivery/update guidance.');}

if(fail.length){
  console.error('\nMR Command Center validation failed:\n');
  for(const item of fail) console.error('- '+item);
  process.exit(1);
}

console.log('MR Command Center v7.3 K-Space Lab validation passed.');
