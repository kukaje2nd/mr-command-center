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
  'artifactLabUpdate','artifactLabRender','artifactTeachingCue','applyArtifactLabPreset','restoreArtifactLabState','artifactLabReset',
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
  'normalizeTimingState','timingState','timingMetrics','timingUpdate','persistTimingState','applyTimingPreset','restoreTimingState','timingReset',
  'normalizeMotionState','motionState','motionPhaseOrder','motionDisplacementAt','motionAcquire','motionTeachingCopy','drawMotionImage','drawMotionHistory','motionConfigure','motionUpdate','persistMotionState','applyMotionPreset','restoreMotionState','motionReset',
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
  'workspaceRail','cockpit','cockpitTitle','homeParameterState','homeParameterMeta','homeContrastState','homeContrastMeta','homeTimingState','homeTimingMeta','homeMotionState','homeMotionMeta','homeKspaceState','homeKspaceMeta','homeArtifactState','homeArtifactMeta','homePresetResumeCount','homeCompareResumeCount','sandbox','contrast','timing','motion','kspace','artifact','mobileNav',
  'artifactCanvas','artifactStrength','artifactStrengthOut','artifactDirection','artifactVisualCue','artifactVisualDetail','artifactVisualBadge','artifactPhaseLabel',
  'ksMode','ksAmount','ksAmountRow','ksAmountLabel','ksAmountHint','ksAmountOut','ksExplain','ksKspaceCanvas','ksImageCanvas','ksRetainedBadge','ksEffectBadge','ksRetained','ksEffect','ksEffectDetail','ksKeyIdea','ksKeyDetail',
  'labContinuity','labContinuityTitle','labContinuityMeta','labChallengeLauncher',
  'paramControlsCard','paramModelCard','parameterLens','parameterReference','workspaceReferenceHub',
  'clMode','clTr','clTe','clTi','clTiRow','clTrOut','clTeOut','clTiOut','contrastMaterials','clModeBadge','clSpread','clBrightest','clCue','clCueDetail','contrastEquation',
  'timingTr','timingFirstEcho','timingSpacing','timingEtl','timingCenter','timingPhase','timingNex','timingCueTitle','timingCueDetail','timingFitBadge','timingTrMarker','timingTrainBand','timingEchoRow','timingEffectiveTe','timingTrainSpan','timingTrainCount','timingTimeProxy',
  'motionMode','motionDirection','motionOrder','motionAmplitude','motionOnset','motionCycles','motionCueTitle','motionCueDetail','motionEffectBadge','motionHistoryCanvas','motionReferenceCanvas','motionResultCanvas','motionAffected','motionPeak','motionCenterShift','motionDominant',
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
  'Sequence Timing Lab','Build an echo train. See where the timing goes.','One repetition window','Echo-train timeline',
  'Motion Lab','Move during acquisition. Reconstruct the inconsistency.','Acquisition history','Motion reconstruction',
  'K-Space Lab','Mask frequency space. Reconstruct the consequence.','Sampled k-space','Teaching reconstruction',
  'Artifact Lab','Change the pattern. Connect it to the troubleshooting logic.','Visualization boundary','Troubleshooting reference',
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
if(!manifest.includes('Sequence Timing, Motion, K-Space, and Artifact')) fail.push('Manifest description is not the six-Lab description.');
if(!manifest.includes('/brand-mark.svg')) fail.push('Manifest does not include the SVG brand mark.');
if(!sw.includes("mrcc-v10.2.0")) fail.push('Service worker cache marker is not v10.2.0.');
if(!sw.includes('/brand-mark.svg')) fail.push('Service worker core assets do not include the brand mark.');
if(!html.includes('<title>MR Command Center — MRI Labs</title>')) fail.push('Page title is not the MRI Labs title.');
if(!html.includes('rel="canonical" href="https://mr-command-center.vercel.app/"')) fail.push('Canonical production URL is missing.');
if(!html.includes('property="og:title" content="MR Command Center — MRI Labs"')) fail.push('Open Graph title metadata is missing.');
if(!html.includes('<meta name="author" content="Edon Kukaj" />')) fail.push('Edon Kukaj author metadata is missing.');
if(!html.includes('<span class="brandcredit">Edon Kukaj</span>')||!html.includes('aria-label="MR Command Center by Edon Kukaj"')) fail.push('Edon Kukaj brand credit is missing from the header.');
if(!html.includes('class="top-actions"')||!html.includes('class="top-status"')) fail.push('v10.1 header action/status grouping is missing.');
if(!html.includes('/* v10.1 Interface refinement */')||!html.includes('scroll-snap-type:x proximity')||!html.includes('.workspace-rail button.active:before')||!html.includes('.lab-home-card:hover,.lab-home-card:focus-within')) fail.push('v10.1 interface refinement styles are incomplete.');
if(!html.includes('/* v10.2 Live release identity + navigation */')||!html.includes('class="releasebadge" aria-label="Current build version">v10.2</span>')||!html.includes('id="routeChip"')||!html.includes('Created by <b>Edon Kukaj</b>')||!html.includes('class="footer-version">v10.2</span>')) fail.push('v10.2 live release identity is incomplete.');
if(!script.includes("function setRouteContext(label='Home')")||!script.includes('function keepActiveLabVisible(target)')||!script.includes("setRouteContext(sectionTitles[id])")) fail.push('v10.2 route context or active-Lab mobile navigation is incomplete.');
if(!html.includes('env(safe-area-inset-bottom)')) fail.push('v10.2 mobile safe-area handling is missing.');
if(!html.includes('active v10 workspace keys')) fail.push('Workspace restore copy still references an outdated workspace generation.');
if(!html.includes('@media(prefers-reduced-motion:reduce)')) fail.push('Native reduced-motion fallback is missing.');
if(!html.includes('node-artifact">◫</span>')||!html.includes('node-timing">◷</span>')||!html.includes('node-motion">↝</span>')) fail.push('Labs home graphic does not represent all active Labs.');
if((html.match(/<span>Search workspace<\/span><kbd>\/<\/kbd>/g)||[]).length!==1) fail.push('Keyboard shortcut list contains a duplicate Search workspace entry.');
if(!html.includes('aria-label="Search tools and problems"')) fail.push('Quick Console search field lacks an accessible name.');
if(!html.includes('id="homeResumeLabBtn"')||!script.includes("mrcc_last_lab")||!script.includes('function resumeLastLab')) fail.push('Persistent last-Lab resume flow is missing.');
if(!script.includes("workspaceViewTargets={compare:'parameterCompareWorkbench'")||!script.includes("challenges:'labChallengeLauncher'")||!script.includes("presets:'presetLibrary'")) fail.push('Deep-link workspace route aliases are missing.');
const labSwitchers=[...html.matchAll(/<div class="lab-switcher"[\s\S]*?<\/div>/g)].map(m=>m[0]);
if(labSwitchers.length!==6||labSwitchers.some(x=>!x.includes("openLab('timing')")||!x.includes("openLab('motion')")||!x.includes("openLab('artifact')"))) fail.push('All six Lab switchers must expose Timing, Motion, and Artifact Labs.');
if((html.match(/data-workspace-tab="labs" onclick="resumeLastLab\(\)"/g)||[]).length!==2) fail.push('Desktop and mobile Labs navigation must resume the last Lab.');
if(!html.includes('id="workspaceImportFile"')||!html.includes('id="workspaceExportBtn"')||!html.includes('id="workspaceDiagnosticsBtn"')) fail.push('Workspace portability controls are missing from Settings.');
if(!script.includes("const MRCC_WORKSPACE_BACKUP_FORMAT='mrcc-workspace'")||!script.includes('MRCC_WORKSPACE_BACKUP_SCHEMA=3')) fail.push('Workspace backup format/schema markers are missing.');
if(!script.includes('function exportWorkspaceBackup')||!script.includes('function sanitizeWorkspaceBackup')||!script.includes('function handleWorkspaceImportFile')||!script.includes('function applyWorkspaceImport')||!script.includes('function copyWorkspaceDiagnostics')) fail.push('Workspace portability implementation is incomplete.');
const backupKeyMatch=script.match(/const MRCC_WORKSPACE_ACTIVE_KEYS=\[([^\]]+)\]/);
const backupKeys=backupKeyMatch?[...backupKeyMatch[1].matchAll(/'([^']+)'/g)].map(x=>x[1]):[];
const expectedBackupKeys=['mrcc_sandbox_current','mrcc_contrast_current','mrcc_timing_current','mrcc_motion_current','mrcc_kspace_current','mrcc_artifact_current','mrcc_sandbox_presets','mrcc_sandbox_snapshot','mrcc_compare_history','mrcc_ui_prefs','mrcc_pins','mrcc_last_lab'];
if(backupKeys.length!==expectedBackupKeys.length||expectedBackupKeys.some(k=>!backupKeys.includes(k))) fail.push('Workspace backup allowlist is not the expected 12 active keys.');
const retiredBackupKeys=['mrcc_case_history','mrcc_case_packs','mrcc_pack_drafts','mrcc_pack_resume','mrcc_learning_attempts','mrcc_study_progress','mrcc_study_session_history','mrcc_daily_focus_history','mrcc_engagement_days'];
if(retiredBackupKeys.some(k=>backupKeys.includes(k))) fail.push('Retired product data leaked into the v10 workspace backup allowlist.');
if(!script.includes('file.size>1000000')||!script.includes("scope:'active-workspace-only'")) fail.push('Workspace import size guard or active-only scope marker is missing.');
if(!script.includes("Number(payload.schema)<1||Number(payload.schema)>MRCC_WORKSPACE_BACKUP_SCHEMA")) fail.push('v10 workspace import must remain backward-compatible with schema-1 and schema-2 backups.');
if(!script.includes("id:'workspace-export'")||!script.includes("id:'workspace-import'")||!script.includes("id:'workspace-diagnostics'")) fail.push('Workspace portability Quick Console commands are missing.');
if(!script.includes("['Workspace portability'")||!script.includes('MRCC_WORKSPACE_ACTIVE_KEYS.length===12')) fail.push('Workspace portability is missing from self-check coverage.');
if(!html.includes('src="/brand-mark.svg"')) fail.push('Header is not using the SVG brand mark.');
if(!html.includes('class="system-panel" id="offlineBar"')) fail.push('Compact system-status drawer is missing.');
if(!html.includes('id="routeAnnouncer"')||!script.includes('function announceRoute')||!script.includes("history[replace?'replaceState':'pushState']")) fail.push('Accessible route announcements or browser history navigation are missing.');
if(!html.includes('id="workspaceRail"')||!html.includes('id="labChallengeLauncher"')||!html.includes('id="workspaceReferenceHub"')) fail.push('V7 workspace navigation / contextual surfaces are missing.');
if(!html.includes('/* v7.1 Labs + Contrast Lab */')||!script.includes('const contrastMaterialsModel=')||!script.includes('mrcc_contrast_current')) fail.push('v7.1 Contrast Lab implementation is missing.');
if(!html.includes('/* v7.2 Labs home + polish */')||!html.includes('class="labs-library"')||!html.includes('class="labs-home-work"')||!script.includes('function renderLabsHome')) fail.push('v7.2 Labs home implementation is missing.');
if(!html.includes('/* v7.3 K-Space Lab */')||!script.includes('const KS_N=32')||!script.includes('function kspaceDft2D')||!script.includes('function kspaceApplyMask')||!script.includes('mrcc_kspace_current')) fail.push('v7.3 K-Space Lab implementation is missing.');
if(!html.includes('/* v7.6 Artifact Lab */')||!script.includes('function artifactLabRender')||!script.includes('mrcc_artifact_current')||!html.includes('id="artifactCanvas"')) fail.push('v7.6 Artifact Lab implementation is missing.');
if(!html.includes('/* v9.0 Sequence Timing Lab */')||!script.includes('function timingMetrics')||!script.includes('function timingUpdate')||!script.includes('mrcc_timing_current')||!html.includes('id="timingEchoRow"')) fail.push('v9.0 Sequence Timing Lab implementation is missing.');
if(!html.includes('/* v10.0 Motion Lab */')||!script.includes('function motionAcquire')||!script.includes('function motionUpdate')||!script.includes('mrcc_motion_current')||!html.includes('id="motionHistoryCanvas"')||!html.includes('id="motionResultCanvas"')) fail.push('v10.0 Motion Lab implementation is missing.');
if(!html.includes('applies idealized rigid translation to individual synthetic phase-encoding lines using the Fourier shift theorem')||!html.includes('This is not correction modeling')) fail.push('Motion Lab model-boundary or correction-boundary copy is missing.');
if(!script.includes("const target=id==='contrast'?'contrast':id==='timing'?'timing':id==='motion'?'motion'")||!script.includes("motion:{id:'motion',label:'Motion Lab'}")) fail.push('Motion Lab routing / resume integration is missing.');
if(!script.includes("restoreContrastState();restoreTimingState();restoreMotionState();restoreKspaceState();restoreArtifactLabState();renderLabsHome();")) fail.push('Lab restoration order is missing Motion Lab.');

if(!script.includes("const target=id==='contrast'?'contrast':id==='timing'?'timing'")||!script.includes("timing:{id:'timing',label:'Sequence Timing Lab'}")) fail.push('Sequence Timing Lab routing / resume integration is missing.');
if(!script.includes("restoreContrastState();restoreTimingState();restoreMotionState();restoreKspaceState();restoreArtifactLabState();renderLabsHome();")) fail.push('Lab restoration order is missing Sequence Timing or Motion Lab.');

if(!html.includes('not scanner data, patient anatomy, or a physical MRI artifact simulator')||!html.includes('Look for structure, not realism.')) fail.push('Artifact Lab visualization boundary is missing.');
if(!script.includes("timing:'labs'")||!script.includes("motion:'labs'")||!script.includes("artifact:'labs'")||!script.includes("ids:['sandbox','contrast','timing','motion','kspace','artifact']")) fail.push('Active Labs are not fully represented in Labs routing.');
const artifactRestorePos=script.lastIndexOf('restoreArtifactLabState();'),artifactEnginePos=script.indexOf('function artifactLabRender');
if(artifactEnginePos<0||artifactRestorePos<=artifactEnginePos) fail.push('Artifact Lab state restoration runs before its engine initializes.');
if(!script.includes("sectionTitles.artifact==='Artifact Lab'")||!script.includes("['Artifact Lab',typeof artifactLabUpdate==='function'")) fail.push('Built-in self-check does not include Artifact Lab.');
if(!script.includes("active Lab states '+activeStates+'/6")||script.includes("practice attempts '+learningAttempts.length")) fail.push('Local data health is not using the six-Lab active-state contract.');


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
if((html.match(/onclick="openLab\('kspace'\)"/g)||[]).length<4||html.includes('title="Planned lab"')) fail.push('K-Space Lab is not fully activated across Labs navigation and home.');
const contrastModelPos=script.indexOf('const contrastMaterialsModel='),contrastRestorePos=script.lastIndexOf('restoreContrastState();');
const kspaceModelPos=script.indexOf('const KS_N=32'),kspaceRestorePos=script.lastIndexOf('restoreKspaceState();');
if(contrastModelPos<0||contrastRestorePos<=contrastModelPos||kspaceModelPos<0||kspaceRestorePos<=kspaceModelPos) fail.push('Contrast/K-Space state restoration runs before the lab engines initialize.');
if(script.includes('restoreSandboxCurrentState();restoreContrastState()')||script.includes('restoreContrastState();restoreKspaceState();renderPresetLibrary')) fail.push('Early lab restore ordering regression detected.');
if(!script.includes("#mobileNav [data-workspace-tab]")||script.includes("document.querySelectorAll('[data-mobile-route]')")) fail.push('Mobile active-state sync is using the retired navigation contract.');
if(!script.includes("Engine: Labs checks passed")||!script.includes("['K-Space Lab',typeof kspaceUpdate==='function'")) fail.push('Built-in self-check is not aligned with the current Labs product.');
const bootMarker="restoreContrastState();restoreKspaceState();renderLabsHome();";
const bootPos=script.lastIndexOf(bootMarker),bootTail=bootPos>=0?script.slice(bootPos,script.indexOf('</script>',bootPos)):'';
for(const retired of ['renderLearningProgress();','renderCaseLab();','renderPackLibrary();','renderPackStudio();','renderStudyReport();','renderSessionBuilder();','renderStudyProgress();','renderContinueLearning();','renderStudySession();','renderStudySessionHistory();','recordEngagement();','renderReturnLoop();']){if(bootTail.includes(retired)) fail.push('Retired runtime call returned to Labs boot: '+retired);}
if(script.includes("syncMobileNav(id);syncLearningPathCurrent(id);syncStudySessionForModule(id)")) fail.push('Retired study/session route hooks returned.');
if(!script.includes("const footerIds=['safety','math','rescue','burn']")) fail.push('Workspace footer generation is not scoped to current supporting tools.');
if(script.includes("updateSafety();renderCockpit()")||script.includes("burnUpdate();renderCockpit()")) fail.push('Safety tools still trigger retired cockpit rendering.');








if(!readme.includes('v10.2 — Live Release Identity')||!readme.includes('v10.2 release notes')||!readme.includes('v10.1 release notes')||!readme.includes('v10.0 release notes')||!readme.includes('v9.0 release notes')||!readme.includes('v8.0 release notes')||!readme.includes('v7.8 release notes')||!readme.includes('v7.7 release notes')||!readme.includes('stylized artifact patterns')) fail.push('README is stale.');
if(!manifest.includes('"id": "/"')||!manifest.includes('"shortcuts"')||!manifest.includes('/#timing')||!manifest.includes('/#motion')||!manifest.includes('/#artifact')) fail.push('Manifest is missing app identity or Lab shortcuts.');
if(!sw.includes('navigationPreload.enable()')) fail.push('Service worker navigation preload is missing.');
if(!fs.existsSync('SELLING_CASE_PACKS.md')) fail.push('SELLING_CASE_PACKS.md is missing.');
if(!fs.existsSync('USING_CASE_PACKS.md')) fail.push('USING_CASE_PACKS.md is missing.');
else{const using=fs.readFileSync('USING_CASE_PACKS.md','utf8');if(!using.includes('Installed does not mean licensed')||!using.includes('stable pack ID')) fail.push('USING_CASE_PACKS.md is missing buyer-side delivery/update guidance.');}

if(fail.length){
  console.error('\nMR Command Center validation failed:\n');
  for(const item of fail) console.error('- '+item);
  process.exit(1);
}

console.log('MR Command Center v10.2 Live Release Identity validation passed.');
