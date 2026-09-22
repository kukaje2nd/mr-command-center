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
  'startStudySession','startStudySessionModules','startCustomSession','renderStudySession','renderSessionBuilder','renderStudySessionHistory','sessionCompleteStep','sessionStep','resumeStudySession','endStudySession','clearStudySessionHistory','syncStudySessionForModule','studySessionProgress',
  'todayFocusModule','recordEngagement','openDailyFocus','completeDailyFocus','renderReturnLoop',
  'renderCaseLab','selectCasePack','selectCase','updateCaseTaskState','openActiveCaseModule','completeActiveCase','chooseCasePackFile','importCasePack','removeImportedCasePack','downloadCasePackTemplate','downloadPayload','studySummaryData','studySummaryText','renderStudyReport','copyStudyReport','downloadStudyReportText','downloadStudyReportJson',
  'renderPackStudio','selectPackDraft','newPackDraft','deletePackDraft','updatePackStudioMeta','saveStudioCase','editStudioCase','removeStudioCase','moveStudioCase','packDraftPayload','exportPackStudio','cloneActiveCasePackToStudio','previewPackStudioInCaseLab',
  'normalizeProductMeta','syncPackStudioProductFromForm','updatePackStudioProduct','productReadiness','productCatalogManifest','productListingText','renderProductKit','copyProductListing','downloadProductListing','downloadProductManifest'
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
  'sessionBar','sessionBarIcon','sessionBarTitle','sessionBarProgressText','sessionBarProgressFill','sessionPrevBtn','sessionNextBtn','sessionCompleteBtn',
  'returnLoop','dailyFocusCard','dailyFocusIcon','dailyFocusTitle','dailyFocusPrompt','dailyFocusCompleteBtn','weeklyActivity','weeklyActiveCount','weeklyFocusCount','weeklySessionCount','weeklyQuizCount','commercialRoadmap',
  'caseLab','caseLabTitle','casePackSource','casePackSelect','casePackRemoveBtn','casePackFile','caseList','caseViewer','studyReport','studyReportTitle','studyReportPreview',
  'packStudio','packStudioDraftSelect','packStudioSaveState','studioPackId','studioPackTitle','studioPackPublisher','studioPackEdition','studioPackDescription','packStudioValidation','studioCaseEditorTitle','studioCaseId','studioCaseTitle','studioCaseModule','studioCasePrompt','studioTask1','studioTask2','studioTask3','studioCaseReflection','studioCaseSaveBtn','studioCaseCount','studioCaseList',
  'packProductKit','studioProductSku','studioProductCategory','studioProductAudience','studioProductHeadline','studioProductOutcomes','productCardPreview','productReadinessStatus','productReadinessScore','productReadinessList','copyProductListingBtn','downloadProductListingBtn','downloadProductManifestBtn'
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
  'Mark reviewed','Learning-use boundary','Settings & shortcuts','Build a focused study session','Quick review','Troubleshooting route','Safety + RF route','Full learning path','Today’s focus','Commercial roadmap','Planned Pro','Planned Department','Case Lab','Study Report','Foundations Sampler','Publisher Studio','Build case packs you can distribute'
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
if(!sw.includes("mrcc-v5.1.0")) fail.push('Service worker cache marker is not v5.1.0.');
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
if(!html.includes('id="returnLoop"')||!html.includes('id="weeklyActivity"')||!html.includes('id="dailyFocusCompleteBtn"')) fail.push('Daily / weekly return loop UI is missing.');
if(!script.includes('const dailyFocusPrompts=')||!script.includes('mrcc_engagement_days')||!script.includes('mrcc_daily_focus_history')) fail.push('Return-loop local data model is missing.');
if(!script.includes('function completeDailyFocus')||!script.includes('function renderReturnLoop')) fail.push('Return-loop behavior is missing.');
if(!script.includes("id:'dailyfocus'")) fail.push('Quick Console daily focus command is missing.');
if(!html.includes('id="commercialRoadmap"')||!html.includes('Paid plans are not active yet.')) fail.push('Transparent commercial roadmap is missing.');
if(html.includes('Buy now')||html.includes('Start subscription')||html.includes('Checkout')) fail.push('Commercial roadmap must not simulate an active checkout.');
if(!html.includes('id="caseLab"')||!html.includes('id="caseViewer"')||!html.includes('id="studyReport"')) fail.push('Case Lab / Study Report UI is missing.');
if(!script.includes('const builtInCasePacks=')||!script.includes("packId:'mrcc-foundations-sampler'")) fail.push('Built-in Case Lab sampler is missing.');
if(!script.includes('mrcc_case_packs')||!script.includes('mrcc_case_history')) fail.push('Case Lab local storage model is missing.');
if(!script.includes("raw.type!=='mrcc-case-pack'")||!script.includes("Number(raw.version)!==1")||!script.includes('file.size>150000')) fail.push('Imported case-pack validation is incomplete.');
if(!html.includes('Imported case packs are user/vendor-supplied')||!html.includes('not validated by MR Command Center')) fail.push('Imported-content verification warning is missing.');
if(!script.includes("id:'caselab'")||!script.includes("id:'studyreport'")) fail.push('Case Lab / Study Report Quick Console commands are missing.');
const caseCompleteStart=script.indexOf('function completeActiveCase(){');
const caseCompleteEnd=script.indexOf('function chooseCasePackFile(){',caseCompleteStart);
const caseCompleteBody=caseCompleteStart>=0&&caseCompleteEnd>caseCompleteStart?script.slice(caseCompleteStart,caseCompleteEnd):'';
if(!caseCompleteBody||caseCompleteBody.includes('studyState[')||caseCompleteBody.includes('toggleStudyModule')) fail.push('Case completion must remain separate from Reviewed markers.');
if(!script.includes('function studySummaryData')||!script.includes('function downloadStudyReportJson')) fail.push('Study Report export behavior is missing.');
if(!html.includes('not certification, competency documentation, CE credit, or compliance evidence')) fail.push('Study Report non-certification disclaimer is missing.');
if(!html.includes('Case Lab plus Publisher Studio can now author and deliver pack files')) fail.push('Commercial publisher-roadmap copy is missing.');
if(!html.includes('id="packStudio"')||!html.includes('id="studioCaseList"')||!html.includes('id="packStudioDraftSelect"')) fail.push('Publisher Studio UI is missing.');
if(!script.includes('const PACK_DRAFT_LIMIT=6')||!script.includes('mrcc_pack_drafts')) fail.push('Publisher Studio local draft model is missing.');
if(!script.includes('function packDraftPayload')||!script.includes("type:'mrcc-case-pack'")||!script.includes('version:1')) fail.push('Publisher Studio export schema is missing.');
if(!script.includes('function cloneActiveCasePackToStudio')||!script.includes('function previewPackStudioInCaseLab')) fail.push('Publisher Studio clone / preview workflow is missing.');
if(!script.includes("id:'packstudio'")) fail.push('Publisher Studio Quick Console command is missing.');
if(!html.includes('Do not include patient identifiers')||!html.includes('MRCC validates file structure—not clinical accuracy, authorship, copyright, or source quality')) fail.push('Publisher Studio authoring boundary is missing.');
if(!script.includes('draft.cases.length>=12')||!script.includes('packDrafts.length>=PACK_DRAFT_LIMIT')) fail.push('Publisher Studio draft / case limits are missing.');
if(!html.includes('id="packProductKit"')||!html.includes('id="productReadinessList"')||!html.includes('id="productCardPreview"')) fail.push('Product Kit UI is missing.');
if(!script.includes('function productReadiness')||!script.includes('function productCatalogManifest')||!script.includes('function productListingText')) fail.push('Productization logic is missing.');
if(!script.includes("type:'mrcc-product-manifest'")||!script.includes("format:'mrcc-case-pack'")||!script.includes("checkoutUrl:null")) fail.push('Catalog manifest contract is missing or commerce is not explicitly disconnected.');
if(!script.includes("id:'productkit'")) fail.push('Product Kit Quick Console command is missing.');
if(!html.includes('metadata completeness only')||!html.includes('No payment flow is simulated here.')) fail.push('Productization boundary copy is missing.');
if(!html.includes('Commerce connection: not configured')) fail.push('Commerce connection status is missing.');
if(html.includes('Buy now')||html.includes('Start subscription')||html.includes('Purchase pack')) fail.push('Product Kit must not simulate a live purchase flow.');
const productManifestStart=script.indexOf('function productCatalogManifest');
const productManifestEnd=script.indexOf('function productListingText',productManifestStart);
const productManifestBody=productManifestStart>=0&&productManifestEnd>productManifestStart?script.slice(productManifestStart,productManifestEnd):'';
if(!productManifestBody||!productManifestBody.includes('if(!ready.ready)return null')) fail.push('Catalog manifest must require storefront metadata readiness.');
const listingStart=script.indexOf('function productListingText');
const listingEnd=script.indexOf('function renderProductKit',listingStart);
const listingBody=listingStart>=0&&listingEnd>listingStart?script.slice(listingStart,listingEnd):'';
if(!listingBody||!listingBody.includes('if(!ready.ready)return')) fail.push('Listing export must require storefront metadata readiness.');




if(!readme.includes('v5.1 — Productization')||!readme.includes('MRI learning hub')) fail.push('README is stale.');
if(!fs.existsSync('SELLING_CASE_PACKS.md')) fail.push('SELLING_CASE_PACKS.md is missing.');

if(fail.length){
  console.error('\nMR Command Center validation failed:\n');
  for(const item of fail) console.error('- '+item);
  process.exit(1);
}

console.log('MR Command Center v5.1 Productization validation passed.');
