import fs from 'node:fs';

const documentHtml=fs.readFileSync('index.html','utf8');
const appCss=fs.existsSync('app.css')?fs.readFileSync('app.css','utf8'):'';
const script=fs.existsSync('app.js')?fs.readFileSync('app.js','utf8'):'';
const html=documentHtml+'\n'+appCss+'\n'+script;
const manifest=fs.readFileSync('manifest.webmanifest','utf8');
const brand=fs.readFileSync('brand-mark.svg','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const readme=fs.readFileSync('README.md','utf8');
const premiumDoc=fs.existsSync('PREMIUM_LABS.md')?fs.readFileSync('PREMIUM_LABS.md','utf8'):'';
const premiumProducts=fs.existsSync('premium-products.json')?fs.readFileSync('premium-products.json','utf8'):'';
const about=fs.existsSync('about.html')?fs.readFileSync('about.html','utf8'):'';
const privacy=fs.existsSync('privacy.html')?fs.readFileSync('privacy.html','utf8'):'';
const robots=fs.existsSync('robots.txt')?fs.readFileSync('robots.txt','utf8'):'';
const sitemap=fs.existsSync('sitemap.xml')?fs.readFileSync('sitemap.xml','utf8'):'';
const vercelConfig=fs.existsSync('vercel.json')?fs.readFileSync('vercel.json','utf8'):'';
const fail=[];

if((documentHtml.match(/<\/html>/g)||[]).length!==1||!documentHtml.trim().endsWith('</html>')) fail.push('HTML must end cleanly with exactly one </html>.');
if(!appCss) fail.push('app.css is missing or empty.');
if(!script) fail.push('app.js is missing or empty.');
if(documentHtml.includes('<style>')) fail.push('Production HTML must not contain the monolithic application <style> block.');
const inlineAppScripts=[...documentHtml.matchAll(/<script>([\s\S]*?)<\/script>/g)];
if(inlineAppScripts.length) fail.push('Production HTML must not contain the monolithic inline application <script> block.');
if(!documentHtml.includes('<link rel="stylesheet" href="/app.css?v=27.1" />')) fail.push('index.html does not load cache-busted app.css.');
if(!documentHtml.includes('<script src="/app.js?v=27.1"></script>')) fail.push('index.html does not load cache-busted app.js.');
if(script){try{new Function(script)}catch(e){fail.push('app.js does not parse: '+e.message)}}

const requiredFunctions=[
  'go','showHome','setFocusedSection','openWorkspaceView','setWorkspaceTabActive','openLab','renderLabsHome',
  'artifactLabUpdate','artifactLabRender','artifactTeachingCue','artifactProfile','renderArtifactFingerprint','flipArtifactDirection','renderArtifactChallenge','answerArtifactChallenge','nextArtifactChallenge','resetArtifactChallenge','loadArtifactChallengeAnswer','bindArtifactDeepDive','applyArtifactLabPreset','restoreArtifactLabState','artifactLabReset',
  'kspaceUpdate','kspaceDft1D','kspaceDft2D','kspaceApplyMask','kspaceEnergyStats','kspaceMaskPsf','drawKspacePsf','renderKspaceDeep','kspaceChallengeRows','renderKspaceChallenge','startKspaceChallenge','restartKspaceChallenge','clearKspaceChallenge','bindKspaceDeepDive','kspaceModeChanged','applyKspacePreset','restoreKspaceState','kspaceReset',
  'normalizeSpatialState','spatialState','spatialFeatureProvenance','renderSpatialProvenance','spatialAxisAnatomy','spatialMatchedSamples','spatialMatchSamples','spatialMetrics','spatialTeachingCopy','spatialChallengeRows','renderSpatialChallenge','startSpatialChallenge','restartSpatialChallenge','clearSpatialChallenge','renderSpatialDeep','bindSpatialDeepDive','drawSpatialWorld','drawSpatialRecon','spatialUpdate','persistSpatialState','applySpatialPreset','restoreSpatialState','spatialReset',
  'openPalette','setPaletteCategory','openPreferences','runSelfCheck','openSequenceFamiliesLab','openProtocolWorkspace','renderSequenceFamilyGrid','renderSequenceFamilyDetail','selectSequenceFamily','setSequenceFamilyFilter','sequenceDnaState','scoreSequenceDna','sequenceDnaRank','renderSequenceDna','applySequenceDnaProfile','loadSelectedSequenceDna','resetSequenceDna','openBestSequenceDna','bindSequenceDna','sequenceTranslateAlias','populateSequenceCompare','renderSequenceCompare','restoreSequenceFamiliesLab','bindSequenceFamiliesLab','clearRetiredProtocolWorkspace',
  'routeHash','restoreRouteFromHash','syncMobileNav',
  'sandboxUpdate','renderParameterLens','renderParameterDeepDive','renderParameterEquations','setParameterInspector','parameterIsolatedState','jumpParameterLab',
  'openParameterGoal','renderParameterGoalFeedback',
  'openParameterChallenge','renderParameterChallenge',
  'restoreSandboxCurrentState','quickSaveSandboxPreset',
  'saveSandboxPreset','exportSandboxPresets','importSandboxPresets',
  'swapSandboxComparison','saveComparisonHistory','renderComparisonHistory',
  'openParameterReferenceGroup',
  'contrastUpdate','contrastSignal','contrastTeachingCue','contrastLongitudinalTerm','contrastTransverseTerm','contrastSignalParts','contrastNullTi','contrastDrawRecovery','contrastDrawDecay','renderContrastDeep','setContrastSyntheticNull','renderContrastChallenge','setContrastChallenge','clearContrastChallenge','bindContrastDeepDive','applyContrastPreset','contrastReset','restoreContrastState',
  'normalizeTimingState','timingState','timingMetrics','timingEquationRows','renderTimingDeep','timingChallengeRows','renderTimingChallenge','startTimingChallenge','restartTimingChallenge','clearTimingChallenge','bindTimingDeepDive','timingUpdate','persistTimingState','applyTimingPreset','restoreTimingState','timingReset',
  'normalizeMotionState','motionState','motionPhaseOrder','motionDisplacementAt','motionAcquire','motionLineStats','motionRenderLineMap','motionOrderComparison','renderMotionOrderCompare','motionChallengeRows','renderMotionChallenge','startMotionChallenge','restartMotionChallenge','clearMotionChallenge','renderMotionDeep','bindMotionDeepDive','motionTeachingCopy','drawMotionImage','drawMotionHistory','motionConfigure','motionUpdate','persistMotionState','applyMotionPreset','restoreMotionState','motionReset',
  'calcVoxel','calcTime','solveArtifact','updateSafety','burnUpdate',
  'readStoredJson','trapDialogFocus','localDataHealthy','renderDataHealth','retiredLegacyDataStats','renderRetiredDataSummary','clearRetiredLegacyData',
  'openPremiumAccess','closePremiumAccess','premiumBackdrop','openPremiumCatalog',
  'diffusionPreviewSignal','drawDiffusionPreview','updateDiffusionPreview',
  'parallelPreviewMetrics','drawParallelPreview','updateParallelPreview',
  'rfPreviewMetrics','drawRfPreview','updateRfPreview',
  'gradientPreviewMetrics','drawGradientPreview','updateGradientPreview',
  'offresPreviewMetrics','drawOffresPreview','updateOffresPreview','setPremiumFilter',
  'openPremiumWorkspace','renderPremiumChallenge','answerPremiumChallenge','nextPremiumChallenge','openPremiumChallengePreview',
  'premiumProductKey','premiumAccessState','renderPremiumAccessState','showPremiumReadiness','requestPremiumPurchase'
];
for(const name of requiredFunctions){
  const declaration=new RegExp('function\\s+'+name+'\\s*\\(');
  const assignment=new RegExp('(?:const|let|var)\\s+'+name+'\\s*=');
  if(!declaration.test(script)&&!assignment.test(script)) fail.push('Required function is missing: '+name);
}

const handlerAttrs=[...documentHtml.matchAll(/on(?:click|change|input|keydown)="([^"]+)"/g)];
const referenced=new Set();
for(const attr of handlerAttrs){for(const call of attr[1].matchAll(/\b([A-Za-z_$][\w$]*)\s*\(/g)) referenced.add(call[1]);}
const ignored=new Set(['if','confirm','prompt','openV27ReferenceHub','openV27MoreMenu']);
for(const name of referenced){
  if(ignored.has(name)) continue;
  const declaration=new RegExp('function\\s+'+name+'\\s*\\(');
  const assignment=new RegExp('(?:const|let|var)\\s+'+name+'\\s*=');
  if(!declaration.test(script)&&!assignment.test(script)) fail.push('Inline event handler references an undefined function: '+name);
}

const requiredIds=[
  'workspaceRail','protocol','sequenceFamilyTitle','seqFamilySearch','seqFamilyVendor','seqFamilyCount','sequenceFamilyGrid','sequenceFamilyDetail','seqDnaPrep','seqDnaEcho','seqDnaReadout','seqDnaOutput','seqDnaFromSelected','seqDnaClueCount','seqDnaResult','seqDnaAmbiguity','seqDnaBoundary','seqDnaOpenBest','seqAliasInput','seqAliasBtn','seqAliasResult','seqCompareA','seqCompareB','seqCompareResult','cockpit','cockpitTitle','homeParameterState','homeParameterMeta','homeContrastState','homeContrastMeta','homeTimingState','homeTimingMeta','homeMotionState','homeMotionMeta','homeKspaceState','homeKspaceMeta','homeSpatialState','homeSpatialMeta','homeArtifactState','homeArtifactMeta','homePresetResumeCount','homeCompareResumeCount','sandbox','contrast','timing','motion','kspace','spatial','artifact','mobileNav',
  'artifactCanvas','artifactStrength','artifactStrengthOut','artifactDirection','artifactDirectionLabel','artifactDirectionHint','artifactVisualCue','artifactVisualDetail','artifactVisualBadge','artifactPhaseLabel','artifactFingerprintBadge','artifactFingerprint','artifactDirectionLogic','artifactDirectionLogicDetail','artifactDifferential','artifactChallengeScore','artifactChallengeProgress','artifactChallengePrompt','artifactChallengeChoices','artifactChallengeFeedback','artifactChallengeLoadBtn','artifactChallengeNextBtn',
  'ksMode','ksAmount','ksAmountRow','ksAmountLabel','ksAmountHint','ksAmountOut','ksExplain','ksKspaceCanvas','ksImageCanvas','ksRetainedBadge','ksEffectBadge','ksRetained','ksEffect','ksEffectDetail','ksKeyIdea','ksKeyDetail','ksEnergyBadge','ksDeepSamples','ksEnergyRetained','ksEnergyEfficiency','ksEnergyBands','ksPsfCanvas','ksPsfBadge','ksPsfMain','ksPsfSide','ksPsfCopy','ksChallengeTargets','ksChallengeTarget','ksChallengeHint','ksChallengeConstraints','ksChallengeState',
  'spPhaseFov','spReadFov','spPhaseSamples','spReadSamples','spPhaseFovOut','spReadFovOut','spPhaseSamplesOut','spReadSamplesOut','spWorldCanvas','spReconCanvas','spatialCoverageBadge','spatialWrapBadge','spatialWrapCue','spatialWrapDetail','spatialPixelProxy','spatialSampleBurden','spatialExplain','spatialProvenanceList','spatialProvenanceBadge','spatialReadEquation','spatialPhaseEquation','spatialReadCoverageBar','spatialReadPixelBar','spatialPhaseCoverageBar','spatialPhasePixelBar','spatialGridDiagnosis','spatialChallengeTargets','spatialChallengeTarget','spatialChallengeHint','spatialChallengeConstraints','spatialChallengeState',
  'labContinuity','labContinuityTitle','labContinuityMeta','labChallengeLauncher',
  'paramControlsCard','paramModelCard','parameterLens','parameterDeepCockpit','parameterInspectorSelect','parameterInspectorName','parameterInspectorBase','parameterInspectorCurrent','parameterIsolatedMetrics','parameterFullMetrics','parameterCauseNode','parameterMechanismNode','parameterEffectNode','parameterEquationLab','parameterSpatialEquation','parameterSpatialFactors','parameterSnrFactors','parameterTimeFactors','parameterReference','workspaceReferenceHub',
  'clMode','clTr','clTe','clTi','clTiRow','clTrOut','clTeOut','clTiOut','contrastMaterials','clModeBadge','clSpread','clBrightest','clCue','clCueDetail','contrastEquation','contrastRecoveryCanvas','contrastDecayCanvas','contrastRecoverySummary','contrastDecaySummary','contrastDecomposition','contrastDriver','contrastNullButtons','contrastChallengeTargets','contrastChallengeTarget','contrastChallengeHint','contrastChallengeConstraints','contrastChallengeState',
  'timingTr','timingFirstEcho','timingSpacing','timingEtl','timingCenter','timingPhase','timingNex','timingCueTitle','timingCueDetail','timingFitBadge','timingTrMarker','timingTrainBand','timingEchoRow','timingEffectiveTe','timingTrainSpan','timingTrainCount','timingTimeProxy','timingEquationBreakdown','timingKspaceStrip','timingKspaceBadge','timingKspaceCopy','timingFirstLandmark','timingCenterLandmark','timingLastLandmark','timingChallengeTargets','timingChallengeTarget','timingChallengeHint','timingChallengeConstraints','timingChallengeState',
  'motionMode','motionDirection','motionOrder','motionAmplitude','motionOnset','motionCycles','motionCueTitle','motionCueDetail','motionEffectBadge','motionHistoryCanvas','motionReferenceCanvas','motionResultCanvas','motionAffected','motionPeak','motionCenterShift','motionDominant','motionLineMap','motionCenterBandMean','motionOuterMean','motionCenterBandAffected','motionLinearCanvas','motionCentricCanvas','motionLinearMeta','motionCentricMeta','motionLinearStats','motionCentricStats','motionOrderCompareCopy','motionChallengeTargets','motionChallengeTarget','motionChallengeHint','motionChallengeConstraints','motionChallengeState',
  'presetLibrary','presetList','presetSearch',
  'parameterChallengePanel','parameterChallengeTitle','parameterChallengeCopy','parameterChallengeState','parameterChallengeReference','parameterChallengeConstraints',
  'parameterGoalPanel','parameterGoalTitle','parameterGoalCopy','parameterGoalTabs','parameterGoalTracker','parameterGoalTarget','parameterGoalMetric','parameterGoalMetricLabel','parameterGoalProgress','parameterGoalProgressCopy','parameterGoalCost','parameterGoalCostCopy','parameterGoalProgressBar',
  'parameterCompareWorkbench','compareContext','compareASummary','compareAMeta','compareBSummary','compareBMeta','compareSwapBtn','compareRestoreBtn','compareClearBtn','comparisonHistoryList',
  'paramRefGeometry','paramRefSignal','paramRefTime','paramRefContrast','paramRefArtifact',
  'math','rescue','artifact','safety','burn',
  'brandMark','paletteBack','paletteFilters','prefsBack','dataHealthSummary','retiredDataSummary','clearRetiredDataBtn',
  'premiumLabs','premiumLabsTitle','premiumBack','premiumModalTitle','premiumModalKicker','premiumModalDescription',
  'diffusionPreview','diffusionPreviewTitle','diffPreviewB','diffPreviewD','diffPreviewBOut','diffPreviewDOut','diffPreviewSignal','diffPreviewLoss','diffPreviewCanvas','diffPreviewPointLabel',
  'parallelPreview','parallelPreviewTitle','parallelPreviewR','parallelPreviewDiversity','parallelPreviewROut','parallelPreviewDiversityOut','parallelPreviewSampling','parallelPreviewG','parallelPreviewEfficiency','parallelPreviewCanvas','parallelPreviewLineLabel','parallelPreviewPenaltyLabel',
  'rfPreview','rfPreviewTitle','rfPreviewScale','rfPreviewPulses','rfPreviewRate','rfPreviewScaleOut','rfPreviewPulsesOut','rfPreviewRateOut','rfPreviewIndex','rfPreviewPulseContribution','rfPreviewRateContribution','rfPreviewCanvas','rfPreviewTrendLabel','rfPreviewIndexLabel',
  'gradientPreview','gradientPreviewTitle','gradientPreviewAmplitude','gradientPreviewDuration','gradientPreviewRamp','gradientPreviewAmplitudeOut','gradientPreviewDurationOut','gradientPreviewRampOut','gradientPreviewArea','gradientPreviewPlateau','gradientPreviewEfficiency','gradientPreviewCanvas','gradientPreviewShapeLabel','gradientPreviewAreaLabel',
  'offresPreview','offresPreviewTitle','offresPreviewHz','offresPreviewTime','offresPreviewHzOut','offresPreviewTimeOut','offresPreviewCycles','offresPreviewPhase','offresPreviewProjection','offresPreviewCanvas','offresPreviewDirection','offresPreviewPhaseLabel',
  'premiumPreviewCount','premiumVisibleCount',
  'premiumChallengeZone','premiumChallengeHeading','premiumChallengeProgress','premiumChallengeLab','premiumChallengePrompt','premiumChallengeOptions','premiumChallengeFeedback','premiumChallengeNext','premiumChallengeScore',
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
  'Spatial Encoding Lab','Change coverage and sampling. Watch periodic wrap emerge.','Periodic encoding','Folded teaching image',
  'Artifact Lab','Change the pattern. Connect it to the troubleshooting logic.','Visualization boundary','Troubleshooting reference',
  'Current workspace','Problem mode','Start from a constraint',
  'A/B Parameter Compare','Parameter Reference','Related tools',
  'MR Safety Reference','RF / thermal details',
  'Premium Labs · interactive previews','Advanced MRI concepts you can manipulate now.','MR Command Center · Premium workspace','Premium concept challenge','Diffusion & b-Value Lab','Parallel Imaging Lab','RF Power Concepts Lab','Gradient Encoding Concepts Lab','Off-Resonance & Phase Lab',
  'Learning-use boundary','Settings & shortcuts'
]
for(const text of requiredCopy){if(!html.includes(text)) fail.push('Required v7 workspace copy is missing: '+text);}

const removedLogic=['normalizeTaskRecord','saveWorkspaceProfile','trackUsage','workspaceReportText','buildLocalBackupPayload','newShift','moduleMeta'];
for(const name of removedLogic){if(script.includes(name)) fail.push('Obsolete logic is still present: '+name);}

if(!fs.existsSync('brand-mark.svg')) fail.push('brand-mark.svg is missing.');
if(fs.existsSync('brand-mark.png')) fail.push('Legacy brand-mark.png should not remain in the repository.');
if(!brand.includes('MR Command Center Resonance Core')||!brand.includes('#56e9ff')||!brand.includes('#8a78ff')) fail.push('Brand mark does not contain the v27 Resonance Core identity markers.');
if(!manifest.includes('Sequence Timing')||!manifest.includes('K-Space')||!manifest.includes('Artifact')||!manifest.includes('Sequence Families')) fail.push('Manifest description is not aligned with the v27 MRI Labs product.');
if(!manifest.includes('/icon.svg')) fail.push('Manifest does not include the SVG application icon.');
if(!sw.includes("mrcc-v27.1.0")) fail.push('Service worker cache marker is not v27.1.0.');
if(!sw.includes('/brand-mark.svg')) fail.push('Service worker core assets do not include the brand mark.');
if(!html.includes('<title>MR Command Center — MRI Labs</title>')) fail.push('Page title is not the MRI Labs title.');
if(!html.includes('rel="canonical" href="https://mr-command-center.vercel.app/"')) fail.push('Canonical production URL is missing.');
if(!html.includes('property="og:title" content="MR Command Center — MRI Labs"')) fail.push('Open Graph title metadata is missing.');
if(!html.includes('<meta name="author" content="Edon Kukaj" />')) fail.push('Edon Kukaj author metadata is missing.');
if(!html.includes('<span class="brandcredit">Edon Kukaj</span>')||!html.includes('aria-label="MR Command Center by Edon Kukaj"')) fail.push('Edon Kukaj brand credit is missing from the header.');
if(!html.includes('class="top-actions"')) fail.push('Header action grouping is missing.');
if(!html.includes('/* v10.1 Interface refinement */')||!html.includes('scroll-snap-type:x proximity')||!html.includes('.workspace-rail button.active:before')||!html.includes('.lab-home-card:hover,.lab-home-card:focus-within')) fail.push('v10.1 interface refinement styles are incomplete.');
if(!html.includes('/* v10.2 Live release identity + navigation */')||!html.includes('class="releasebadge" aria-label="Current build version">v27.1</span>')||!html.includes('id="routeChip"')||!html.includes('Created by <b>Edon Kukaj</b>')||!html.includes('class="footer-version">v27.1</span>')) fail.push('Current live release identity is incomplete.');
if(!script.includes("function setRouteContext(label='Home')")||!script.includes('function keepActiveLabVisible(target)')||!script.includes("setRouteContext(sectionTitles[id])")) fail.push('v10.2 route context or active-Lab mobile navigation is incomplete.');
if(!html.includes('env(safe-area-inset-bottom)')) fail.push('v10.2 mobile safe-area handling is missing.');
if(documentHtml.includes('active v15 workspace keys')) fail.push('Workspace restore copy references an outdated workspace generation.');
if(!html.includes('/* v11.0 Premium Labs foundation */')||!html.includes('id="premiumLabs"')||!html.includes('id="premiumBack"')) fail.push('v11.0 Premium Labs product surface is incomplete.');
if(!script.includes('const PREMIUM_BILLING_ENABLED=false')||!script.includes('const premiumLabCatalog=')||!script.includes("premiumLabs:'Premium Labs'")) fail.push('v11.0 Premium Labs client contract is incomplete.');
if(!documentHtml.includes('Premium Labs · interactive previews')||!documentHtml.includes('premium-preview-banner')) fail.push('Premium preview UX is incomplete.');
if(script.includes("localStorage.setItem('premium")||script.includes('localStorage.premium')) fail.push('Premium access must not rely on browser-local entitlement flags.');
if(!html.includes('data-palcat="Premium"')||!script.includes("id:'premium-diffusion'")||!script.includes("id:'premium-parallel'")||!script.includes("id:'premium-rfpower'")||!script.includes("id:'premium-gradient'")||!script.includes("id:'premium-offresonance'")) fail.push('Premium Quick Console discovery is incomplete.');
if(!premiumDoc.includes('Premium Labs architecture')||!premiumDoc.includes('server is authoritative for identity and entitlements')||!premiumDoc.includes('POST /api/billing/webhook')||!premiumDoc.includes('STRIPE_WEBHOOK_SECRET')) fail.push('PREMIUM_LABS.md is missing the secure billing architecture contract.');
if(!html.includes('/* v11.1 Diffusion premium teaser */')||!html.includes('id="diffusionPreview"')||!html.includes('id="diffPreviewCanvas"')) fail.push('v11.1 Diffusion premium teaser UI is incomplete.');
if(!script.includes('function diffusionPreviewSignal')||!script.includes('Math.exp(-Math.max(0,b)*Math.max(0,d)*.001)')||!script.includes('function drawDiffusionPreview')||!script.includes('function updateDiffusionPreview')) fail.push('v11.1 Diffusion preview model is incomplete.');
if(!script.includes("diffusion:{title:'Diffusion & b-Value Lab'")||!script.includes('preview:true')) fail.push('Diffusion preview is not attached to the Premium catalog.');
if(!html.includes('generic diffusivity coefficient')||!html.includes('diagnostic tissue classification')||!premiumDoc.includes('Public teaser rule')) fail.push('Diffusion preview educational boundary is incomplete.');
if(html.includes('ischemia')||html.includes('infarct')||html.includes('malignant diffusion')||html.includes('benign diffusion')) fail.push('Diffusion teaser contains diagnostic or pathology-specific language.');
if(!html.includes('/* v11.2 Parallel Imaging premium teaser */')||!html.includes('id="parallelPreview"')||!html.includes('id="parallelPreviewCanvas"')) fail.push('v11.2 Parallel Imaging premium teaser UI is incomplete.');
if(!script.includes('function parallelPreviewMetrics')||!script.includes('1/(Math.sqrt(R)*g)')||!script.includes('function drawParallelPreview')||!script.includes('function updateParallelPreview')) fail.push('v11.2 Parallel Imaging preview model is incomplete.');
if(!script.includes("parallel:{title:'Parallel Imaging Lab'")||!script.includes("id==='parallel'&&!!lab.preview")) fail.push('Parallel Imaging preview is not attached to the Premium catalog.');
if(!html.includes('g̃ is an invented teaching proxy')||!html.includes('generic 0–1 sensitivity-separation proxy')||!premiumDoc.includes('Parallel Imaging teaser rule')) fail.push('Parallel Imaging preview educational boundary is incomplete.');
if(html.includes('GRAPPA factor recommendation')||html.includes('SENSE factor recommendation')||html.includes('optimal acceleration factor')) fail.push('Parallel Imaging teaser contains scanner- or protocol-prescriptive language.');
if(!html.includes('/* v11.3 RF Power Concepts premium teaser */')||!html.includes('id="rfPreview"')||!html.includes('id="rfPreviewCanvas"')) fail.push('v11.3 RF Power Concepts premium teaser UI is incomplete.');
if(!script.includes('function rfPreviewMetrics')||!script.includes('index=scaleContribution*pulseContribution*r')||!script.includes('function drawRfPreview')||!script.includes('function updateRfPreview')) fail.push('v11.3 RF Power Concepts preview model is incomplete.');
if(!script.includes("rfpower:{title:'RF Power Concepts Lab'")||!script.includes("id==='rfpower'&&!!lab.preview")) fail.push('RF Power Concepts preview is not attached to the Premium catalog.');
if(!html.includes('invented sensitivity proxy')||!html.includes('never means “safe” or “unsafe.”')||!premiumDoc.includes('RF Power Concepts teaser rule')) fail.push('RF Power Concepts preview safety boundary is incomplete.');
if(html.includes('SAR estimate:')||html.includes('B1+rms estimate:')||html.includes('safe RF setting')||html.includes('unsafe RF setting')) fail.push('RF Power Concepts teaser contains prohibited compliance or safety outputs.');
if(documentHtml.includes('premium-access-table')||documentHtml.includes('premiumReadinessState')||documentHtml.includes('premium-product-key')) fail.push('Retired Premium commerce scaffolding remains visible.');
if(!script.includes("const PREMIUM_ACCESS_MODE='preview-only'")||!script.includes("premium_membership")||!script.includes("premium_diffusion")||!script.includes("premium_parallel")||!script.includes("premium_rfpower")||!script.includes("premium_gradient")||!script.includes("premium_offresonance")) fail.push('Stable Premium product-key contract is incomplete.');
if(!script.includes('function requestPremiumPurchase')) fail.push('Premium purchase guard function is missing.');
if(!premiumProducts.includes('"billing_enabled": false')||!premiumProducts.includes('"access_mode": "preview-only"')||!premiumProducts.includes('"key": "premium_membership"')||!premiumProducts.includes('"key": "premium_diffusion"')||!premiumProducts.includes('"key": "premium_parallel"')||!premiumProducts.includes('"key": "premium_rfpower"')||!premiumProducts.includes('"key": "premium_gradient"')||!premiumProducts.includes('"key": "premium_offresonance"')) fail.push('premium-products.json is missing the expected provider-neutral product catalog.');
if(!premiumDoc.includes('v11.4 product-key contract')||!premiumDoc.includes('These are MRCC product identifiers, not payment-provider price IDs.')) fail.push('PREMIUM_LABS.md is missing the v11.4 product-key contract.');
if(html.includes('$9.99')||html.includes('$19.99')||html.includes('$29.99')) fail.push('Premium UI contains invented launch pricing.');
if(!html.includes('/* v11.5 Gradient Encoding Concepts premium teaser */')||!html.includes('id="gradientPreview"')||!html.includes('id="gradientPreviewCanvas"')) fail.push('v11.5 Gradient Encoding Concepts premium teaser UI is incomplete.');
if(!script.includes('function gradientPreviewMetrics')||!script.includes('shapeEfficiency=1-r/2')||!script.includes('areaIndex=rawArea/reference')||!script.includes('function drawGradientPreview')||!script.includes('function updateGradientPreview')) fail.push('v11.5 Gradient Encoding preview model is incomplete.');
if(!script.includes("gradient:{title:'Gradient Encoding Concepts Lab'")||!script.includes("id==='gradient'&&!!lab.preview")) fail.push('Gradient Encoding preview is not attached to the Premium catalog.');
if(!html.includes('It does not output gradient strength, slew rate, PNS')||!premiumDoc.includes('Gradient Encoding Concepts teaser rule')) fail.push('Gradient Encoding preview boundary is incomplete.');
if(html.includes('mT/m')||html.includes('T/m/s')||html.includes('PNS threshold')||html.includes('gradient hardware limit')) fail.push('Gradient Encoding teaser contains physical scanner-limit output.');
if(!html.includes('/* v12.0 Premium Lab Hub + Off-Resonance Concepts */')||!html.includes('class="premium-hub-toolbar"')||!html.includes('id="premiumVisibleCount"')||!html.includes('data-premium-filter="signal"')||!html.includes('data-premium-filter="acquisition"')||!html.includes('data-premium-filter="safety"')) fail.push('v12.0 Premium Lab Hub UI is incomplete.');
if(!script.includes("function setPremiumFilter(filter='all')")||!script.includes("card.dataset.premiumCategory===premiumFilter")) fail.push('v12.0 Premium Lab Hub filtering is incomplete.');
if((html.match(/class="premium-card /g)||[]).length!==5) fail.push('v12.0 Premium Lab Hub must expose five Premium preview cards.');
if(!html.includes('id="offresPreview"')||!html.includes('id="offresPreviewCanvas"')||!script.includes('function offresPreviewMetrics')||!script.includes('cycles=df*t/1000')||!script.includes('rawDegrees=cycles*360')) fail.push('v12.0 Off-Resonance preview model is incomplete.');
if(!script.includes("offresonance:{title:'Off-Resonance & Phase Lab'")||!script.includes("id==='offresonance'&&!!lab.preview")) fail.push('Off-Resonance preview is not attached to the Premium catalog.');
if(!html.includes('not a field-map, shim prescription, chemical-species classifier')&&!html.includes('not a field map, shim tool, chemical-species classifier')) fail.push('Off-Resonance preview boundary is incomplete.');
if(!premiumDoc.includes('Premium Lab Hub')||!premiumDoc.includes('Off-Resonance & Phase teaser rule')) fail.push('PREMIUM_LABS.md is missing v12.0 Hub / Off-Resonance contracts.');
if(!html.includes('/* v13.0 Premium workspace + challenge mode */')||!html.includes('body.nav-premium #cockpit{display:block!important}')||!html.includes('MR Command Center · Premium workspace')) fail.push('v13.0 dedicated Premium workspace UI is incomplete.');
if((documentHtml.match(/data-workspace-tab="premium" onclick="openPremiumWorkspace\(\)"/g)||[]).length!==1||!documentHtml.includes('data-workspace-tab="more"')) fail.push('v27 Premium/More navigation contract is incomplete.');
if(!script.includes("const premiumDeepRoutes={diffusion:'premium-diffusion'")||!script.includes("if(id==='premium'){openPremiumWorkspace(false,true,false);return}")||!script.includes('openPremiumAccess(premiumLab,false)')) fail.push('v13.0 Premium deep routing is incomplete.');
if(!html.includes('id="premiumChallengeZone"')||!html.includes('id="premiumChallengeOptions"')||!script.includes('const premiumChallengeBank=[')||!script.includes('function answerPremiumChallenge(choice)')||!script.includes('function nextPremiumChallenge()')) fail.push('v13.0 Premium Concept Challenge is incomplete.');
if((script.match(/\{lab:'(?:diffusion|parallel|rfpower|gradient|offresonance)'/g)||[]).length!==5) fail.push('Premium Concept Challenge must cover all five Premium preview models.');
if(script.includes("localStorage.setItem('mrcc_premium_challenge")||script.includes("localStorage.setItem('premiumChallenge")) fail.push('Premium challenge progress must remain session-only and must not resemble an entitlement.');
if(!premiumDoc.includes('v13.0 Premium workspace routing')||!premiumDoc.includes('Premium Concept Challenge')) fail.push('PREMIUM_LABS.md is missing the v13.0 workspace/challenge contract.');








if(!html.includes('/* v14.0 Spatial Encoding Lab */')||!html.includes('id="spatial" class="section spatial-lab"')||!script.includes('function spatialMetrics')||!script.includes("localStorage.setItem('mrcc_spatial_current'")||!html.includes('id="homeSpatialState"')) fail.push('v14.0 Spatial Encoding Lab is incomplete.');
if(!html.includes('/* v15.0 Public launch + runtime hygiene */')||!documentHtml.includes('href="/about.html"')||!documentHtml.includes('href="/privacy.html"')||!documentHtml.includes('application/ld+json')||!documentHtml.includes('"@type":"WebApplication"')) fail.push('v15.0 public-launch shell is incomplete.');
if(!appCss.includes('/* v16.0 Runtime modularization')||!script.includes('/* v16.0 Runtime modularization')||!documentHtml.includes('/app.css')||!documentHtml.includes('/app.js')) fail.push('v16.0 runtime modularization markers are incomplete.');
if(!script.includes("build:'27.1'")) fail.push('Current workspace export build marker is not v27.1.');
if(documentHtml.length>180000) fail.push('v16.0 HTML shell regression: index.html is unexpectedly large.');
if(appCss.length<150000||script.length<150000) fail.push('v16.0 extracted runtime assets look incomplete.');
if(!sw.includes("'/app.css?v=27.1'")||!sw.includes("'/app.js?v=27.1'")||!sw.includes("'/v27.css?v=27.1'")||!sw.includes("'/v27.js?v=27.1'")) fail.push('v27.1 runtime assets are missing from the offline core cache.');
if(!vercelConfig.includes('X-Content-Type-Options')||!vercelConfig.includes('X-Frame-Options')||!vercelConfig.includes('Referrer-Policy')||!vercelConfig.includes('Permissions-Policy')||!vercelConfig.includes('must-revalidate')) fail.push('v16.0 Vercel public hardening headers are incomplete.');
if(!script.includes('const MRCC_RETIRED_DATA_KEYS=')||!script.includes('function clearRetiredLegacyData')||!html.includes('id="retiredDataSummary"')||!html.includes('id="clearRetiredDataBtn"')) fail.push('v15.0 retired-data controls are incomplete.');
for(const retiredFn of ['renderPackLibrary','renderCaseLab','renderPackStudio','renderStudyReport','renderStudySession','renderContinueLearning','renderLearningProgress','scoreQuiz']){if(script.includes('function '+retiredFn+'(')) fail.push('Retired runtime function returned: '+retiredFn);}
if(html.includes('<section id="learn"')||html.includes('data-palcat="Learning"')) fail.push('Retired Micro-Lab / Learning UI returned to production.');
for(const retiredCommand of ["{id:'learn'","{id:'learningprogress'","{id:'studyprogress'","{id:'caselab'","{id:'packlibrary'","{id:'studyreport'","{id:'packstudio'","{id:'productkit'"]){if(script.includes(retiredCommand)) fail.push('Retired Quick Console command returned: '+retiredCommand);}
if(!about.includes('About & Scope — MR Command Center')||!about.includes('Created by Edon Kukaj')||!about.includes('No patient-specific clearance')) fail.push('Public About page is missing scope or creator markers.');
if(!privacy.includes('Privacy & Data — MR Command Center')||!privacy.includes('browser-local Lab state')||!privacy.includes('does not include client-side analytics')||!privacy.includes('Do not enter patient-identifying information')) fail.push('Public Privacy page is incomplete.');
if(!robots.includes('User-agent: *')||!robots.includes('Sitemap: https://mr-command-center.vercel.app/sitemap.xml')) fail.push('robots.txt is missing public crawl/sitemap markers.');
if(!sitemap.includes('https://mr-command-center.vercel.app/about.html')||!sitemap.includes('https://mr-command-center.vercel.app/privacy.html')) fail.push('sitemap.xml is missing public pages.');
if(!html.includes('@media(prefers-reduced-motion:reduce)')) fail.push('Native reduced-motion fallback is missing.');
if(!documentHtml.includes('v27-resonance-scene')||!documentHtml.includes('homeArtifactPreview')||!documentHtml.includes('homeTimingPreview')||!documentHtml.includes('homeMotionPreview')||!documentHtml.includes('homeSpatialPreview')) fail.push('v27 Labs Home visual system is incomplete.');
if((html.match(/<span>Search workspace<\/span><kbd>\/<\/kbd>/g)||[]).length!==1) fail.push('Keyboard shortcut list contains a duplicate Search workspace entry.');
if(!html.includes('aria-label="Search tools and problems"')) fail.push('Quick Console search field lacks an accessible name.');
if(!html.includes('id="homeResumeLabBtn"')||!script.includes("mrcc_last_lab")||!script.includes('function resumeLastLab')) fail.push('Persistent last-Lab resume flow is missing.');
if(!script.includes("workspaceViewTargets={compare:'parameterCompareWorkbench'")||!script.includes("challenges:'labChallengeLauncher'")||!script.includes("presets:'presetLibrary'")) fail.push('Deep-link workspace route aliases are missing.');
const labSwitchers=[...documentHtml.matchAll(/<div class="lab-switcher" data-v27-shared-switcher><\/div>/g)];
if(labSwitchers.length!==7) fail.push('All seven Lab sections must expose the shared v27 Lab switcher placeholder.');
if(appCss.includes('.lab-switcher button:nth-child(3){display:none}')) fail.push('Legacy mobile Lab-switcher rule still hides the third destination.');
if(!appCss.includes('/* v16.1 Mobile Lab Navigation Integrity */')||!appCss.includes('@media(max-width:680px){.lab-switcher button{display:grid}}')) fail.push('v16.1 mobile Lab navigation visibility guard is missing.');
if(!html.includes('id="protocol" class="section sequence-family-lab"')||!html.includes('id="sequenceFamilyGrid"')||!html.includes('id="sequenceFamilyDetail"')||!html.includes('id="seqAnatomyTimeline"')||!html.includes('id="seqAnatomyFingerprint"')||!html.includes('id="seqDnaResult"')||!html.includes('id="seqChallengeChoices"')||!html.includes('id="seqAliasInput"')||!html.includes('id="seqCompareResult"')||!html.includes('Sequence Families Lab')) fail.push('Current Sequence Families Lab UI is incomplete.');
if((documentHtml.match(/data-workspace-tab="protocol"/g)||[]).length!==2) fail.push('Desktop and mobile navigation must both expose Sequence Families Lab.');
if(!script.includes("const MRCC_SEQUENCE_FAMILY_KEY='mrcc_sequence_family_lab_v1'")||!script.includes('const sequenceFamilies=')||!script.includes('const sequenceAnatomyModels=')||!script.includes('const sequenceDnaProfiles=')||!script.includes('const sequenceChallengeQuestions=')||!script.includes('function renderSequenceFamilyGrid')||!script.includes('function renderSequenceFamilyDetail')||!script.includes('function renderSequenceAnatomy')||!script.includes('function renderSequenceDna')||!script.includes('function scoreSequenceDna')||!script.includes('function sequenceTranslateAlias')||!script.includes('function renderSequenceCompare')||!script.includes('function renderSequenceChallenge')||!script.includes('function answerSequenceChallenge')||!script.includes('function restoreSequenceFamiliesLab')) fail.push('Current Sequence Families Lab runtime is incomplete.');
if(!script.includes("sectionTitles={protocol:'Sequence Families Lab'")||!script.includes("protocol:'protocol'")) fail.push('Sequence Families Lab routing is incomplete.');
if(!appCss.includes('/* v18.0 Sequence Families Lab */')||!appCss.includes('/* v18.1 Interactive Sequence Anatomy + Recognition Challenge */')||!appCss.includes('.seqfam-anatomy-timeline')||!appCss.includes('.seqfam-fingerprint')||!appCss.includes('.seqfam-challenge-choices')||!appCss.includes('.seqfam-compare-table')) fail.push('v18.1 Sequence Families Lab responsive styling is incomplete.');
if(!html.includes('Educational scope')||!html.includes('does not prescribe patient-specific protocols')||!html.includes('Console translator')||!html.includes('Compare lab')) fail.push('Sequence Families Lab educational boundary or interactive tools are incomplete.');
if(!script.includes("'PROPELLER'")&&!html.includes('PROPELLER')) fail.push('Sequence Families Lab is missing practical vendor-name examples.');
if(!script.includes("localStorage.removeItem('mrcc_protocol_workspace_v1')")||!script.includes("localStorage.removeItem('mrcc_protocol_scanner_profiles_v1')")) fail.push('v18.0 must clear retired Protocol Workspace browser-local keys.');
if(script.includes('MRCC_PROTOCOL_OCR_SCRIPT')||script.includes('function protocolRunOcr')||html.includes('protocolImageDrop')||privacy.includes('Tesseract.js')||privacy.includes('Protocol images & local OCR')) fail.push('Retired Protocol/OCR workflow is still present in v18.0.');
if(!privacy.includes('Sequence Families Lab preferences')||!privacy.includes('old browser-local Protocol Workspace keys are cleared')) fail.push('Privacy page does not document the v18.0 Sequence Families transition.');

if((html.match(/data-workspace-tab="labs" onclick="resumeLastLab\(\)"/g)||[]).length!==2) fail.push('Desktop and mobile Labs navigation must resume the last Lab.');
if(!html.includes('id="workspaceImportFile"')||!html.includes('id="workspaceExportBtn"')||!html.includes('id="workspaceDiagnosticsBtn"')) fail.push('Workspace portability controls are missing from Settings.');
if(!script.includes("const MRCC_WORKSPACE_BACKUP_FORMAT='mrcc-workspace'")||!script.includes('MRCC_WORKSPACE_BACKUP_SCHEMA=4')) fail.push('Workspace backup format/schema markers are missing.');
if(!script.includes('function exportWorkspaceBackup')||!script.includes('function sanitizeWorkspaceBackup')||!script.includes('function handleWorkspaceImportFile')||!script.includes('function applyWorkspaceImport')||!script.includes('function copyWorkspaceDiagnostics')) fail.push('Workspace portability implementation is incomplete.');
const backupKeyMatch=script.match(/const MRCC_WORKSPACE_ACTIVE_KEYS=\[([^\]]+)\]/);
const backupKeys=backupKeyMatch?[...backupKeyMatch[1].matchAll(/'([^']+)'/g)].map(x=>x[1]):[];
const expectedBackupKeys=['mrcc_sandbox_current','mrcc_contrast_current','mrcc_timing_current','mrcc_motion_current','mrcc_kspace_current','mrcc_spatial_current','mrcc_artifact_current','mrcc_sandbox_presets','mrcc_sandbox_snapshot','mrcc_compare_history','mrcc_ui_prefs','mrcc_last_lab'];
if(backupKeys.length!==expectedBackupKeys.length||expectedBackupKeys.some(k=>!backupKeys.includes(k))) fail.push('Workspace backup allowlist is not the expected 12 active keys.');
const retiredBackupKeys=['mrcc_case_history','mrcc_case_packs','mrcc_pack_drafts','mrcc_pack_resume','mrcc_learning_attempts','mrcc_study_progress','mrcc_study_session_history','mrcc_daily_focus_history','mrcc_engagement_days'];
if(retiredBackupKeys.some(k=>backupKeys.includes(k))) fail.push('Retired product data leaked into the v10 workspace backup allowlist.');
if(!script.includes('file.size>1000000')||!script.includes("scope:'active-workspace-only'")) fail.push('Workspace import size guard or active-only scope marker is missing.');
if(!script.includes("Number(payload.schema)<1||Number(payload.schema)>MRCC_WORKSPACE_BACKUP_SCHEMA")) fail.push('v10 workspace import must remain backward-compatible with schema-1 and schema-2 backups.');
if(!script.includes("id:'workspace-export'")||!script.includes("id:'workspace-import'")||!script.includes("id:'workspace-diagnostics'")) fail.push('Workspace portability Quick Console commands are missing.');
if(!script.includes("['Workspace portability'")||!script.includes('MRCC_WORKSPACE_ACTIVE_KEYS.length===12')) fail.push('Workspace portability is missing from self-check coverage.');
if(!html.includes('src="/brand-mark.svg"')) fail.push('Header is not using the SVG brand mark.');
if(!html.includes('class="system-panel" id="offlineBar"')) fail.push('Compact system-status drawer is missing.');
if(!script.includes("document.querySelectorAll('[data-workspace-tab]').length===10")||!script.includes("document.querySelectorAll('#mobileNav [data-workspace-tab]').length===5")) fail.push('Workspace self-check navigation counts are stale.');
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
if(!script.includes("restoreContrastState();restoreTimingState();restoreMotionState();restoreKspaceState();restoreSpatialState();restoreArtifactLabState();restoreSequenceFamiliesLab();renderLabsHome();")) fail.push('Lab restoration order is missing Motion or Spatial Lab.');

if(!script.includes("const target=id==='contrast'?'contrast':id==='timing'?'timing'")||!script.includes("timing:{id:'timing',label:'Sequence Timing Lab'}")) fail.push('Sequence Timing Lab routing / resume integration is missing.');
if(!script.includes("restoreContrastState();restoreTimingState();restoreMotionState();restoreKspaceState();restoreSpatialState();restoreArtifactLabState();restoreSequenceFamiliesLab();renderLabsHome();")) fail.push('Lab restoration order is missing Sequence Timing, Motion, or Spatial Lab.');

if(!html.includes('not scanner data, patient anatomy, or a physical MRI artifact simulator')||!html.includes('Look for structure, not realism.')) fail.push('Artifact Lab visualization boundary is missing.');
if(!script.includes("timing:'labs'")||!script.includes("motion:'labs'")||!script.includes("spatial:'labs'")||!script.includes("artifact:'labs'")||!script.includes("ids:['sandbox','contrast','timing','motion','kspace','spatial','artifact']")) fail.push('Active Labs are not fully represented in Labs routing.');
const artifactRestorePos=script.lastIndexOf('restoreArtifactLabState();'),artifactEnginePos=script.indexOf('function artifactLabRender');
if(artifactEnginePos<0||artifactRestorePos<=artifactEnginePos) fail.push('Artifact Lab state restoration runs before its engine initializes.');
if(!script.includes("sectionTitles.artifact==='Artifact Lab'")||!script.includes("['Artifact Lab',typeof artifactLabUpdate==='function'")) fail.push('Built-in self-check does not include Artifact Lab.');
if(!script.includes("active Lab states '+activeStates+'/7")||script.includes("practice attempts '+learningAttempts.length")) fail.push('Local data health is not using the seven-Lab active-state contract.');


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
if(script.includes('retiredV7Commands')) fail.push('Obsolete retired-command search filter should not remain after v15 cleanup.');
if(!script.includes("if(id==='learn'){openWorkspaceView('challenges',true);return}")) fail.push('Retired Micro-Lab route does not redirect to current Challenges.');
if(!documentHtml.includes('data-workspace-tab="home"')||!documentHtml.includes('data-workspace-tab="labs"')||!documentHtml.includes('data-workspace-tab="protocol"')||!documentHtml.includes('data-workspace-tab="reference"')||!documentHtml.includes('data-workspace-tab="premium"')||!documentHtml.includes('data-workspace-tab="more"')) fail.push('v27 workspace navigation is incomplete.');
if(!documentHtml.includes('onclick="openLab(\'kspace\')"')||!documentHtml.includes('data-v27-shared-switcher')) fail.push('K-Space Lab is not fully activated across v27 Labs navigation and home.');
const contrastModelPos=script.indexOf('const contrastMaterialsModel='),contrastRestorePos=script.lastIndexOf('restoreContrastState();');
const kspaceModelPos=script.indexOf('const KS_N=32'),kspaceRestorePos=script.lastIndexOf('restoreKspaceState();');
if(contrastModelPos<0||contrastRestorePos<=contrastModelPos||kspaceModelPos<0||kspaceRestorePos<=kspaceModelPos) fail.push('Contrast/K-Space state restoration runs before the lab engines initialize.');
if(script.includes('restoreSandboxCurrentState();restoreContrastState()')||script.includes('restoreContrastState();restoreKspaceState();renderPresetLibrary')) fail.push('Early lab restore ordering regression detected.');
if(!script.includes("#mobileNav [data-workspace-tab]")||script.includes("document.querySelectorAll('[data-mobile-route]')")) fail.push('Mobile active-state sync is using the retired navigation contract.');
if(!script.includes("Engine: Labs checks passed")||!script.includes("['K-Space Lab',typeof kspaceUpdate==='function'")) fail.push('Built-in self-check is not aligned with the current Labs product.');
const bootMarker="restoreContrastState();restoreTimingState();restoreMotionState();restoreKspaceState();restoreSpatialState();restoreArtifactLabState();restoreSequenceFamiliesLab();renderLabsHome();";
const bootPos=script.lastIndexOf(bootMarker);
if(bootPos<0) fail.push('Current Lab boot restore chain is missing.');
for(const retired of ['renderLearningProgress();','renderCaseLab();','renderPackLibrary();','renderPackStudio();','renderStudyReport();','renderSessionBuilder();','renderStudyProgress();','renderContinueLearning();','renderStudySession();','renderStudySessionHistory();','recordEngagement();','renderReturnLoop();']){if(script.includes(retired)) fail.push('Retired runtime call returned: '+retired);}
if(script.includes('syncLearningPathCurrent')||script.includes('syncStudySessionForModule')) fail.push('Retired study/session route hooks returned.');
if(!script.includes("const footerIds=['safety','math','rescue','burn']")) fail.push('Workspace footer generation is not scoped to current supporting tools.');
if(script.includes("updateSafety();renderCockpit()")||script.includes("burnUpdate();renderCockpit()")) fail.push('Safety tools still trigger retired cockpit rendering.');








if(!readme.includes('v27.1 — Completion Pass')||!readme.includes('v27.1 release notes')||!readme.includes('v27.0 release notes')||!readme.includes('v26.0 release notes')||!readme.includes('v25.0 release notes')||!readme.includes('v24.0 release notes')||!readme.includes('v23.0 release notes')||!readme.includes('v22.0 release notes')||!readme.includes('v21.0 release notes')||!readme.includes('v20.0 release notes')||!readme.includes('v19.0 release notes')||!readme.includes('v18.1 release notes')||!readme.includes('v18.0 release notes')||!readme.includes('v17.2 release notes')||!readme.includes('v17.1 release notes')||!readme.includes('v17.0 release notes')||!readme.includes('v16.1 release notes')||!readme.includes('v16.0 release notes')||!readme.includes('v15.0 release notes')||!readme.includes('v14.0 release notes')||!readme.includes('v13.0 release notes')||!readme.includes('v12.0 release notes')||!readme.includes('v11.5 release notes')||!readme.includes('v11.4 release notes')||!readme.includes('v11.3 release notes')||!readme.includes('v11.2 release notes')||!readme.includes('v11.1 release notes')||!readme.includes('v11.0 release notes')||!readme.includes('PREMIUM_LABS.md')||!readme.includes('premium-products.json')||!readme.includes('v10.2 release notes')||!readme.includes('v10.1 release notes')||!readme.includes('v10.0 release notes')||!readme.includes('v9.0 release notes')||!readme.includes('v8.0 release notes')||!readme.includes('v7.8 release notes')||!readme.includes('v7.7 release notes')||!readme.includes('stylized artifact patterns')) fail.push('README is stale.');
if(!manifest.includes('"id": "/"')||!manifest.includes('"shortcuts"')||!manifest.includes('/#sequences')||!manifest.includes('/#timing')||!manifest.includes('/#motion')||!manifest.includes('/#spatial')||!manifest.includes('/#artifact')) fail.push('Manifest is missing app identity or workspace shortcuts.');
if(!sw.includes('navigationPreload.enable()')) fail.push('Service worker navigation preload is missing.');
if(!sw.includes("'/about.html'")||!sw.includes("'/privacy.html'")) fail.push('v15 public pages are not in the core offline cache.');
if(!fs.existsSync('app.css')||!fs.existsSync('app.js')||!fs.existsSync('vercel.json')) fail.push('v16 runtime/public-hardening files are missing.');
if(!fs.existsSync('PREMIUM_LABS.md')) fail.push('PREMIUM_LABS.md is missing.');
if(!fs.existsSync('premium-products.json')) fail.push('premium-products.json is missing.');

if((script.match(/prompt:/g)||[]).length<12||!script.includes("answer:'fse'")||!script.includes("answer:'gre'")||!script.includes("answer:'bssfp'")||!script.includes("answer:'epi'")) fail.push('v18.1 Sequence Recognition Challenge question bank is incomplete.');
if(!script.includes("id==='sequences'||id==='protocol'")||!script.includes("routeHash('sequences')")||!manifest.includes('/#sequences')) fail.push('v18.1 canonical #sequences route or legacy #protocol redirect is incomplete.');
if(!html.includes('Interactive anatomy')||!html.includes('Recognition challenge')||!html.includes('family-level · not scanner limits')) fail.push('v18.1 anatomy/challenge educational framing is incomplete.');
if(!html.includes('id="parameterDeepCockpit"')||!html.includes('id="parameterEquationLab"')||!html.includes('Causal Explorer')||!html.includes('Model anatomy')) fail.push('v19.0 Parameter Lab deep-dive UI is incomplete.');
if(!script.includes('const parameterInspectorMeta=')||!script.includes('function parameterIsolatedState')||!script.includes('function renderParameterDeepDive')||!script.includes('function renderParameterEquations')||!script.includes('function setParameterInspector')) fail.push('v19.0 Parameter Lab deep-dive runtime is incomplete.');
if(!appCss.includes('/* v19.0 Parameter Lab Deep Dive */')||!appCss.includes('.parameter-causal-grid')||!appCss.includes('.parameter-equation-grid')||!appCss.includes('.parameter-factor-list')) fail.push('v19.0 Parameter Lab deep-dive responsive styling is incomplete.');
if(!html.includes('Every factor below is part of MRCC’s teaching model—not a scanner prediction.')||!html.includes('What stays outside this model')) fail.push('v19.0 Parameter Lab model-boundary copy is incomplete.');
if(!script.includes("voxel × √NEX")&&!html.includes('voxel × √NEX')) fail.push('v19.0 SNR model anatomy is missing.');

if(!html.includes('id="contrastRecoveryCanvas"')||!html.includes('id="contrastDecayCanvas"')||!html.includes('id="contrastDecomposition"')||!html.includes('id="contrastChallengeTargets"')||!html.includes('Relaxation curves')||!html.includes('Signal anatomy')||!html.includes('Target challenge')) fail.push('v20.0 Contrast Lab deep-dive UI is incomplete.');
if(!script.includes('function contrastLongitudinalTerm')||!script.includes('function contrastTransverseTerm')||!script.includes('function contrastSignalParts')||!script.includes('function contrastNullTi')||!script.includes('function contrastDrawRecovery')||!script.includes('function contrastDrawDecay')||!script.includes('function renderContrastDeep')||!script.includes('function renderContrastChallenge')||!script.includes('function setContrastSyntheticNull')) fail.push('v20.0 Contrast Lab deep-dive runtime is incomplete.');
if(!appCss.includes('/* v20.0 Contrast Lab Deep Dive */')||!appCss.includes('.contrast-deep-grid')||!appCss.includes('.contrast-decomposition')||!appCss.includes('.contrast-challenge-targets')) fail.push('v20.0 Contrast Lab deep-dive responsive styling is incomplete.');
if(!script.includes("t1:{title:'Create T1 emphasis'")||!script.includes("t2:{title:'Create T2 emphasis'")||!script.includes("nullB:{title:'Null Material B'")) fail.push('v20.0 Contrast target challenge definitions are incomplete.');
if(!html.includes('arbitrary teaching values')||!html.includes('not human tissue values')||!html.includes('Success only means this simplified synthetic model met the displayed target.')) fail.push('v20.0 Contrast Lab educational boundary is incomplete.');

if(!html.includes('id="timingEquationBreakdown"')||!html.includes('id="timingKspaceStrip"')||!html.includes('id="timingChallengeTargets"')||!html.includes('Timing anatomy')||!html.includes('Center-of-k-space logic')||!html.includes('Constraint challenges')) fail.push('v21.0 Timing Lab deep-dive UI is incomplete.');
if(!script.includes('const timingChallengeDefs=')||!script.includes('function timingEquationRows')||!script.includes('function renderTimingDeep')||!script.includes('function timingChallengeRows')||!script.includes('function renderTimingChallenge')||!script.includes('function startTimingChallenge')) fail.push('v21.0 Timing Lab deep-dive runtime is incomplete.');
if(!appCss.includes('/* v21.0 Timing Lab Deep Dive */')||!appCss.includes('.timing-equation-breakdown')||!appCss.includes('.timing-kspace-strip')||!appCss.includes('.timing-challenge-targets')) fail.push('v21.0 Timing Lab deep-dive styling is incomplete.');
if(!html.includes('abstract linear k-space train')||!html.includes('real FSE/TSE view ordering is implementation dependent')) fail.push('v21.0 Timing Lab view-ordering boundary is incomplete.');

if(!html.includes('id="motionLineMap"')||!html.includes('id="motionLinearCanvas"')||!html.includes('id="motionCentricCanvas"')||!html.includes('id="motionChallengeTargets"')||!html.includes('Phase-line influence map')||!html.includes('Ordering A/B')) fail.push('v22.0 Motion Lab deep-dive UI is incomplete.');
if(!script.includes('function motionLineStats')||!script.includes('function motionOrderComparison')||!script.includes('function renderMotionOrderCompare')||!script.includes('const motionChallengeDefs=')||!script.includes('function motionChallengeRows')||!script.includes('function renderMotionChallenge')||!script.includes('function renderMotionDeep')) fail.push('v22.0 Motion Lab deep-dive runtime is incomplete.');
if(!appCss.includes('/* v22.0 Motion Lab Deep Dive */')||!appCss.includes('.motion-line-map')||!appCss.includes('.motion-order-images')||!appCss.includes('.motion-challenge-targets')) fail.push('v22.0 Motion Lab deep-dive styling is incomplete.');
if(!html.includes('It does not guarantee that one reconstruction is globally “better.”')||!html.includes('mean |translation| for |ky| ≤ 4')) fail.push('v22.0 Motion Lab comparison boundary is incomplete.');

if(!html.includes('id="ksEnergyBands"')||!html.includes('id="ksPsfCanvas"')||!html.includes('id="ksChallengeTargets"')||!html.includes('Frequency-energy anatomy')||!html.includes('Mask response')||!html.includes('Sampling challenges')) fail.push('v23.0 K-Space Lab deep-dive UI is incomplete.');
if(!script.includes('function kspaceEnergyStats')||!script.includes('function kspaceMaskPsf')||!script.includes('function drawKspacePsf')||!script.includes('const kspaceChallengeDefs=')||!script.includes('function kspaceChallengeRows')||!script.includes('function renderKspaceChallenge')||!script.includes('function renderKspaceDeep')) fail.push('v23.0 K-Space Lab deep-dive runtime is incomplete.');
if(!appCss.includes('/* v23.0 K-Space Lab Deep Dive */')||!appCss.includes('.kspace-energy-bands')||!appCss.includes('.kspace-psf-shell')||!appCss.includes('.kspace-challenge-targets')) fail.push('v23.0 K-Space Lab deep-dive styling is incomplete.');
if(!html.includes('Fourier energy concentration is not diagnostic importance')||!html.includes('not a scanner’s measured modulation-transfer function or physical MRI point-spread function')) fail.push('v23.0 K-Space Lab model-boundary copy is incomplete.');
if(!script.includes("goal:'≥ 95%'")||!script.includes("goal:'R ≥ 2'")||!script.includes("goal:'40–70%'")) fail.push('v23.0 K-Space challenge thresholds are incomplete.');

if(!html.includes('id="spatialProvenanceList"')||!html.includes('id="spatialGridDiagnosis"')||!html.includes('id="spatialChallengeTargets"')||!html.includes('Wrap provenance')||!html.includes('Encoding anatomy')||!html.includes('Encoding challenges')) fail.push('v24.0 Spatial Encoding Lab deep-dive UI is incomplete.');
if(!script.includes('function spatialFeatureProvenance')||!script.includes('function renderSpatialProvenance')||!script.includes('function spatialAxisAnatomy')||!script.includes('function spatialMatchedSamples')||!script.includes('function spatialMatchSamples')||!script.includes('const spatialChallengeDefs=')||!script.includes('function spatialChallengeRows')||!script.includes('function renderSpatialChallenge')||!script.includes('function renderSpatialDeep')) fail.push('v24.0 Spatial Encoding Lab deep-dive runtime is incomplete.');
if(!appCss.includes('/* v24.0 Spatial Encoding Lab Deep Dive */')||!appCss.includes('.spatial-provenance-list')||!appCss.includes('.spatial-axis-anatomy')||!appCss.includes('.spatial-challenge-targets')||!appCss.includes('.spatial-match-solver')) fail.push('v24.0 Spatial Encoding Lab deep-dive styling is incomplete.');
if(!html.includes('Feature centers are used as landmarks')||!html.includes('Fewer samples alone do not create periodic FOV wrap in this model.')||!html.includes('Preserve baseline pixel width')) fail.push('v24.0 Spatial Encoding Lab teaching boundary or causal distinction is incomplete.');
if(!script.includes("phaseOnly:{title:'Create phase-only wrap'")||!script.includes("expand:{title:'Expand coverage without substantially coarsening pixels'")||!script.includes("repair:{title:'Repair a two-axis wrapped field'")) fail.push('v24.0 Spatial challenge definitions are incomplete.');

if(!html.includes('id="artifactFingerprint"')||!html.includes('id="artifactDifferential"')||!html.includes('id="artifactChallengeChoices"')||!html.includes('id="artifactDirectionLabel"')||!html.includes('id="artifactDirectionHint"')||!html.includes('Pattern DNA')||!html.includes('Look-alike differential')||!html.includes('Recognition challenge')) fail.push('v25.0 Artifact Lab deep-dive UI is incomplete.');
if(!script.includes('const artifactPatternProfiles=')||!script.includes('function artifactProfile')||!script.includes('function renderArtifactFingerprint')||!script.includes('function flipArtifactDirection')||!script.includes('const artifactChallengeQuestions=')||!script.includes('function renderArtifactChallenge')||!script.includes('function answerArtifactChallenge')||!script.includes('function loadArtifactChallengeAnswer')) fail.push('v25.0 Artifact Lab deep-dive runtime is incomplete.');
if(!appCss.includes('/* v25.0 Artifact Lab Deep Dive */')||!appCss.includes('.artifact-fingerprint')||!appCss.includes('.artifact-differential')||!appCss.includes('.artifact-challenge-choices')) fail.push('v25.0 Artifact Lab deep-dive styling is incomplete.');
if(!html.includes('Do not force a fit.')||!script.includes("directionLabel:'Frequency-encode direction'")||!script.includes("directionLabel:'Phase-encode direction'")||!script.includes("directionLogic:'Does not simply follow phase direction'")) fail.push('v25.0 Artifact direction/discrimination teaching boundary is incomplete.');
if(!script.includes("answer:'motion'")||!script.includes("answer:'wrap'")||!script.includes("answer:'chem'")||!script.includes("answer:'metal'")||!script.includes("answer:'zipper'")||!script.includes("answer:'trunc'")||!script.includes("answer:'flow'")||!script.includes("answer:'dielectric'")) fail.push('v25.0 Artifact recognition question coverage is incomplete.');

if(!html.includes('Sequence DNA Builder')||!html.includes('physics clues—not vendor names')||!html.includes('Family-level educational matching only · not protocol selection.')||!html.includes('data-seq-dna-preset="epi"')||!html.includes('data-seq-dna-preset="dixon"')) fail.push('v27.1 Sequence DNA educational UI or boundary is incomplete.');
if(!script.includes('const sequenceDnaDimensions=')||!script.includes('const sequenceDnaProfiles=')||!script.includes('const sequenceDnaWeights=')||!script.includes('function scoreSequenceDna')||!script.includes('function sequenceDnaRank')||!script.includes('function sequenceDnaDifferentiator')||!script.includes('function renderSequenceDna')||!script.includes('function loadSelectedSequenceDna')||!script.includes('function openBestSequenceDna')) fail.push('v27.1 Sequence DNA runtime is incomplete.');
if(!appCss.includes('/* v26.0 Sequence DNA Builder */')||!appCss.includes('.seqfam-dna-controls')||!appCss.includes('.seqfam-dna-results')||!appCss.includes('.seqfam-dna-ambiguity')) fail.push('v26.0 Sequence DNA responsive styling is incomplete.');
if((script.match(/^[ ]{2}[a-z0-9]+:\{prep:/gm)||[]).length<13||!script.includes("radial:{prep:['none'],echo:['refocusTrain'],readout:['blade']")||!script.includes("dixon:{prep:['waterfat'],echo:['gradient','refocusTrain']")||!script.includes("ir:{prep:['inversion'],echo:['spin','refocusTrain']")) fail.push('v27.1 Sequence DNA family profile coverage is incomplete.');

if(!fs.existsSync('v27.js')||!fs.existsSync('v27.css')) fail.push('v27.1 completion assets are missing.');
if(!fs.readFileSync('v27.js','utf8').includes('Which phase lines are vulnerable?')||!fs.readFileSync('v27.js','utf8').includes('Match the evidence before choosing the label')) fail.push('v27.1 deep Lab Intelligence is incomplete.');
if(!fs.readFileSync('v27.css','utf8').includes('v27.1 Completion Pass')) fail.push('v27.1 completion visual layer is missing.');
if(fail.length){
  console.error('\nMR Command Center validation failed:\n');
  for(const item of fail) console.error('- '+item);
  process.exit(1);
}

console.log('MR Command Center v27.1 completion validation passed.');
