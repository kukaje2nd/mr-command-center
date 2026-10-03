/* v16.0 Runtime modularization — application runtime extracted from index.html */
window.__mrccRuntimeErrors=0;
window.addEventListener('error',function(){window.__mrccRuntimeErrors++;const chip=document.getElementById('engineChip'),txt=document.getElementById('engineText');if(chip)chip.classList.add('issue');if(txt)txt.textContent='Engine: issue'});
window.addEventListener('unhandledrejection',function(){window.__mrccRuntimeErrors++;const chip=document.getElementById('engineChip'),txt=document.getElementById('engineText');if(chip)chip.classList.add('issue');if(txt)txt.textContent='Engine: issue'});
const $=id=>document.getElementById(id);

let dataRepairCount=0;
function readStoredJson(storage,key,fallback){
  try{
    const raw=storage.getItem(key);
    if(raw===null)return fallback;
    return JSON.parse(raw);
  }catch(e){dataRepairCount++;return fallback}
}
function validDateString(v){return typeof v==='string'&&!Number.isNaN(new Date(v).getTime())}
function focusables(root){
  if(!root)return[];
  return [...root.querySelectorAll('button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(x=>x.offsetParent!==null);
}
function trapDialogFocus(root,e){
  if(e.key!=='Tab')return;
  const els=focusables(root);if(!els.length)return;
  const first=els[0],last=els[els.length-1];
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
}
function syncModalScrollLock(){document.body.classList.toggle('modal-open',!!document.querySelector('.prefsback.open,.paletteback.open,.premiumback.open'))}
let prefsReturnFocus=null,paletteReturnFocus=null;
function localDataHealthy(){
  try{
    return Array.isArray(sbPresets)&&Array.isArray(comparisonHistory)&&uiPrefs&&typeof uiPrefs==='object';
  }catch(e){return false}
}
function renderDataHealth(){
  const el=$('dataHealthSummary');if(!el)return;
  if(!localDataHealthy()){el.textContent='A current workspace data structure is unavailable. Run self-check.';return}
  const activeStates=['mrcc_sandbox_current','mrcc_contrast_current','mrcc_timing_current','mrcc_motion_current','mrcc_kspace_current','mrcc_spatial_current','mrcc_artifact_current'].filter(k=>{try{return !!localStorage.getItem(k)}catch(e){return false}}).length;
  el.textContent='Saved parameter setups '+sbPresets.length+' · comparisons '+comparisonHistory.length+' · active Lab states '+activeStates+'/7. '+(dataRepairCount?dataRepairCount+' malformed saved value'+(dataRepairCount===1?' was':'s were')+' repaired or ignored this load.':'Current workspace data structures look healthy.');
}
const MRCC_RETIRED_DATA_KEYS=['mrcc_case_history','mrcc_case_packs','mrcc_pack_drafts','mrcc_pack_resume','mrcc_active_case_pack','mrcc_learning_attempts','mrcc_study_progress','mrcc_study_session_history','mrcc_daily_focus_history','mrcc_engagement_days','mrcc_pins'];
function retiredLegacyDataStats(){
  let local=0,session=0;
  for(const key of MRCC_RETIRED_DATA_KEYS){try{if(localStorage.getItem(key)!==null)local++}catch(e){}}
  try{if(sessionStorage.getItem('mrcc_study_session')!==null)session++;if(sessionStorage.getItem('mrcc_recent')!==null)session++}catch(e){}
  return {local,session,total:local+session};
}
function renderRetiredDataSummary(){
  const el=$('retiredDataSummary');if(!el)return;const st=retiredLegacyDataStats();
  el.textContent=st.total?st.total+' retired data area'+(st.total===1?' remains':'s remain')+' from older course / pack features. They are no longer read by the active MRCC runtime.':'No retired course / pack browser data detected.';
}
function clearRetiredLegacyData(){
  const st=retiredLegacyDataStats();if(!st.total){renderRetiredDataSummary();toast('No retired data to clear');return}
  if(!confirm('Clear retired MRCC course, study-session, and case-pack data from this browser? Current Lab states, presets, comparisons, settings, and workspace backups are not affected.'))return;
  for(const key of MRCC_RETIRED_DATA_KEYS){try{localStorage.removeItem(key)}catch(e){}}
  try{sessionStorage.removeItem('mrcc_study_session');sessionStorage.removeItem('mrcc_recent')}catch(e){}
  renderRetiredDataSummary();renderDataHealth();toast('Retired local data cleared');
}
function runDataHealthCheck(){renderDataHealth();renderWorkspacePortability();renderRetiredDataSummary();toast(localDataHealthy()?'Local data check passed':'Local data check found an issue')}

const MRCC_WORKSPACE_BACKUP_FORMAT='mrcc-workspace';
const MRCC_WORKSPACE_BACKUP_SCHEMA=4;
const MRCC_WORKSPACE_ACTIVE_KEYS=['mrcc_sandbox_current','mrcc_contrast_current','mrcc_timing_current','mrcc_motion_current','mrcc_kspace_current','mrcc_spatial_current','mrcc_artifact_current','mrcc_sandbox_presets','mrcc_sandbox_snapshot','mrcc_compare_history','mrcc_ui_prefs','mrcc_last_lab'];
let pendingWorkspaceImport=null;
function workspaceRawValue(key){try{return localStorage.getItem(key)}catch(e){return null}}
function workspaceSnapshotData(){
  const data={};
  for(const key of MRCC_WORKSPACE_ACTIVE_KEYS){
    const raw=workspaceRawValue(key);if(raw===null)continue;
    if(key==='mrcc_last_lab'){data[key]=raw;continue}
    try{data[key]=JSON.parse(raw)}catch(e){}
  }
  return data;
}
function workspaceActiveStats(data=workspaceSnapshotData()){
  const labKeys=['mrcc_sandbox_current','mrcc_contrast_current','mrcc_timing_current','mrcc_motion_current','mrcc_kspace_current','mrcc_spatial_current','mrcc_artifact_current'];
  const labs=labKeys.filter(k=>data[k]!==undefined).length;
  const presets=Array.isArray(data.mrcc_sandbox_presets)?data.mrcc_sandbox_presets.length:0;
  const comparisons=Array.isArray(data.mrcc_compare_history)?data.mrcc_compare_history.length:0;
  const stored=Object.keys(data).length;
  const bytes=new Blob([JSON.stringify(data)]).size;
  return {labs,presets,comparisons,stored,bytes};
}
function renderWorkspacePortability(){
  const el=$('workspaceBackupStatus');if(!el)return;
  const st=workspaceActiveStats();
  el.textContent=st.stored+'/'+MRCC_WORKSPACE_ACTIVE_KEYS.length+' active data areas present · '+st.labs+'/7 Lab states · '+st.presets+' presets · '+st.comparisons+' comparisons · about '+Math.max(1,Math.round(st.bytes/1024))+' KB.';
  const apply=$('workspaceImportApplyBtn');if(apply)apply.hidden=!pendingWorkspaceImport;
}
function exportWorkspaceBackup(){
  const data=workspaceSnapshotData(),st=workspaceActiveStats(data);
  const payload={format:MRCC_WORKSPACE_BACKUP_FORMAT,schema:MRCC_WORKSPACE_BACKUP_SCHEMA,app:'MR Command Center',build:'26.0',exportedAt:new Date().toISOString(),scope:'active-workspace-only',note:'Educational workspace state only. Keep user-entered labels free of patient identifiers.',data};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a'),day=new Date().toISOString().slice(0,10);
  a.href=url;a.download='mrcc-workspace-'+day+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  toast('Workspace backup exported · '+st.stored+' data areas');
}
function sanitizeWorkspaceBackup(payload){
  if(!payload||typeof payload!=='object'||Array.isArray(payload))throw new Error('Backup file is not a valid MRCC workspace object.');
  if(payload.format!==MRCC_WORKSPACE_BACKUP_FORMAT||Number(payload.schema)<1||Number(payload.schema)>MRCC_WORKSPACE_BACKUP_SCHEMA)throw new Error('Backup format or schema is not supported.');
  const src=payload.data;if(!src||typeof src!=='object'||Array.isArray(src))throw new Error('Backup does not contain a workspace data object.');
  const clean={};
  if(src.mrcc_sandbox_current!==undefined){const v=normalizeSandboxCurrent(src.mrcc_sandbox_current);if(v)clean.mrcc_sandbox_current=v}
  if(src.mrcc_sandbox_snapshot!==undefined){const v=normalizePresetState(src.mrcc_sandbox_snapshot);if(v)clean.mrcc_sandbox_snapshot=v}
  if(Array.isArray(src.mrcc_sandbox_presets)){clean.mrcc_sandbox_presets=src.mrcc_sandbox_presets.map(normalizePresetEntry).filter(Boolean).slice(0,8)}
  if(Array.isArray(src.mrcc_compare_history)){clean.mrcc_compare_history=src.mrcc_compare_history.map(x=>{if(!x||typeof x!=='object')return null;const a=normalizePresetState(x.a),b=normalizePresetState(x.b);if(!a||!b)return null;return {label:String(x.label||'Saved comparison').slice(0,36),a,b,savedAt:validDateString(x.savedAt)?x.savedAt:new Date().toISOString(),deltas:x.deltas&&typeof x.deltas==='object'&&!Array.isArray(x.deltas)?x.deltas:{}}}).filter(Boolean).slice(0,10)}
  if(src.mrcc_contrast_current&&typeof src.mrcc_contrast_current==='object'){const x=src.mrcc_contrast_current;clean.mrcc_contrast_current={mode:x.mode==='ir'?'ir':'se',tr:Math.min(5000,Math.max(300,+x.tr||800)),te:Math.min(180,Math.max(10,+x.te||20)),ti:Math.min(2500,Math.max(50,+x.ti||600)),savedAt:validDateString(x.savedAt)?x.savedAt:new Date().toISOString()}}
  if(src.mrcc_timing_current&&typeof src.mrcc_timing_current==='object'){const v=normalizeTimingState(src.mrcc_timing_current);if(v)clean.mrcc_timing_current={...v,savedAt:validDateString(src.mrcc_timing_current.savedAt)?src.mrcc_timing_current.savedAt:new Date().toISOString()}}
  if(src.mrcc_motion_current&&typeof src.mrcc_motion_current==='object'){const v=normalizeMotionState(src.mrcc_motion_current);if(v)clean.mrcc_motion_current={...v,savedAt:validDateString(src.mrcc_motion_current.savedAt)?src.mrcc_motion_current.savedAt:new Date().toISOString()}}
  if(src.mrcc_kspace_current&&typeof src.mrcc_kspace_current==='object'){const x=src.mrcc_kspace_current,modes=['full','center','outer','truncate','undersample'],mode=modes.includes(x.mode)?x.mode:'full',amount=mode==='undersample'?Math.min(4,Math.max(1,Math.round(+x.amount||2))):Math.min(100,Math.max(20,+x.amount||100));clean.mrcc_kspace_current={mode,amount,savedAt:validDateString(x.savedAt)?x.savedAt:new Date().toISOString()}}
  if(src.mrcc_spatial_current&&typeof src.mrcc_spatial_current==='object'){const v=normalizeSpatialState(src.mrcc_spatial_current);clean.mrcc_spatial_current={...v,savedAt:validDateString(src.mrcc_spatial_current.savedAt)?src.mrcc_spatial_current.savedAt:new Date().toISOString()}}
  if(src.mrcc_artifact_current&&typeof src.mrcc_artifact_current==='object'){const x=src.mrcc_artifact_current,mode=artifacts[x.mode]?x.mode:'motion';clean.mrcc_artifact_current={mode,strength:Math.min(100,Math.max(0,+x.strength||55)),direction:x.direction==='x'?'x':'y',savedAt:validDateString(x.savedAt)?x.savedAt:new Date().toISOString()}}
  if(src.mrcc_ui_prefs&&typeof src.mrcc_ui_prefs==='object'&&!Array.isArray(src.mrcc_ui_prefs)){const x=src.mrcc_ui_prefs;clean.mrcc_ui_prefs={textSize:['standard','large','xl'].includes(x.textSize)?x.textSize:'standard',compact:!!x.compact,contrast:!!x.contrast,reduceMotion:!!x.reduceMotion}}
  if(Array.isArray(src.mrcc_pins)){const allowed=['safety','sandbox','timing','motion','spatial','rescue','artifact','burn','math','learn'];clean.mrcc_pins=[...new Set(src.mrcc_pins.filter(x=>allowed.includes(x)))].slice(0,6)}
  if(['sandbox','contrast','timing','motion','kspace','spatial','artifact'].includes(src.mrcc_last_lab))clean.mrcc_last_lab=src.mrcc_last_lab;
  if(!Object.keys(clean).length)throw new Error('Backup contains no usable active workspace data.');
  return clean;
}
function chooseWorkspaceBackup(){$('workspaceImportFile')?.click()}
async function handleWorkspaceImportFile(input){
  const file=input?.files?.[0],status=$('workspaceImportStatus');pendingWorkspaceImport=null;renderWorkspacePortability();
  if(!file){if(status)status.textContent='No backup selected.';return}
  if(file.size>1000000){if(status)status.textContent='Import blocked: backup is larger than 1 MB.';input.value='';return}
  try{
    const payload=JSON.parse(await file.text()),data=sanitizeWorkspaceBackup(payload),st=workspaceActiveStats(data),when=validDateString(payload.exportedAt)?new Date(payload.exportedAt).toLocaleString():'unknown date';
    pendingWorkspaceImport={data,source:when};
    if(status)status.textContent='Ready to import · '+st.stored+' data areas · '+st.labs+'/7 Lab states · '+st.presets+' presets · '+st.comparisons+' comparisons · exported '+when+'.';
    renderWorkspacePortability();
  }catch(e){if(status)status.textContent='Import blocked: '+(e?.message||'invalid backup file');toast('Workspace backup could not be validated')}
  input.value='';
}
function applyWorkspaceImport(){
  if(!pendingWorkspaceImport){toast('Choose a valid workspace backup first');return}
  if(!confirm('Replace the current active MRCC workspace with the selected backup? The 13 active workspace keys will be replaced; retired legacy data is not touched.'))return;
  try{
    MRCC_WORKSPACE_ACTIVE_KEYS.forEach(k=>localStorage.removeItem(k));
    for(const [key,value] of Object.entries(pendingWorkspaceImport.data))localStorage.setItem(key,key==='mrcc_last_lab'?String(value):JSON.stringify(value));
  }catch(e){toast('Workspace restore failed in browser storage');return}
  pendingWorkspaceImport=null;toast('Workspace restored · reloading');setTimeout(()=>location.reload(),120);
}
function workspaceDiagnosticsText(){
  const data=workspaceSnapshotData(),st=workspaceActiveStats(data),cache=$('cacheChip')?.textContent||'Offline cache: unknown';
  return ['MR Command Center v27.0 workspace diagnostics','Network: '+(navigator.onLine?'online':'offline'),cache,'Runtime errors this load: '+window.__mrccRuntimeErrors,'Local data health: '+(localDataHealthy()?'healthy':'issue detected'),'Active workspace areas: '+st.stored+'/'+MRCC_WORKSPACE_ACTIVE_KEYS.length,'Active Lab states: '+st.labs+'/7','Parameter presets: '+st.presets,'Saved comparisons: '+st.comparisons,'Last Lab: '+(data.mrcc_last_lab||'not recorded'),'Approx active data size: '+Math.max(1,Math.round(st.bytes/1024))+' KB','No Lab values, labels, or patient information are included in this diagnostic summary.'].join('\n');
}
async function copyWorkspaceDiagnostics(){
  const text=workspaceDiagnosticsText();
  try{await navigator.clipboard.writeText(text);toast('Workspace diagnostics copied')}
  catch(e){const t=document.createElement('textarea');t.value=text;document.body.appendChild(t);t.select();document.execCommand('copy');t.remove();toast('Workspace diagnostics copied')}
}

let uiPrefs={textSize:'standard',compact:false,contrast:false,reduceMotion:false};
{const raw=readStoredJson(localStorage,'mrcc_ui_prefs',{});if(raw&&typeof raw==='object'&&!Array.isArray(raw)){uiPrefs.textSize=['standard','large','xl'].includes(raw.textSize)?raw.textSize:'standard';uiPrefs.compact=!!raw.compact;uiPrefs.contrast=!!raw.contrast;uiPrefs.reduceMotion=!!raw.reduceMotion}else dataRepairCount++}
if(!localStorage.getItem('mrcc_ui_prefs')&&window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)uiPrefs.reduceMotion=true;
function saveUiPrefs(){try{localStorage.setItem('mrcc_ui_prefs',JSON.stringify(uiPrefs))}catch(e){}applyUiPrefs()}
function applyUiPrefs(){
  document.documentElement.classList.toggle('ui-large',uiPrefs.textSize==='large');
  document.documentElement.classList.toggle('ui-xl',uiPrefs.textSize==='xl');
  document.body.classList.toggle('ui-large',uiPrefs.textSize==='large');
  document.body.classList.toggle('ui-xl',uiPrefs.textSize==='xl');
  document.body.classList.toggle('ui-compact',!!uiPrefs.compact);
  document.body.classList.toggle('ui-high-contrast',!!uiPrefs.contrast);
  document.body.classList.toggle('ui-reduce-motion',!!uiPrefs.reduceMotion);
  document.querySelectorAll('#textSizeControls button').forEach(b=>{const on=b.dataset.size===uiPrefs.textSize;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on))});
  const cp=$('compactPref'),hp=$('contrastPref'),mp=$('motionPref');
  if(cp){cp.classList.toggle('active',!!uiPrefs.compact);cp.setAttribute('aria-pressed',String(!!uiPrefs.compact))}
  if(hp){hp.classList.toggle('active',!!uiPrefs.contrast);hp.setAttribute('aria-pressed',String(!!uiPrefs.contrast))}
  if(mp){mp.classList.toggle('active',!!uiPrefs.reduceMotion);mp.setAttribute('aria-pressed',String(!!uiPrefs.reduceMotion))}
}
function setTextSize(size){uiPrefs.textSize=['standard','large','xl'].includes(size)?size:'standard';saveUiPrefs()}
function toggleUiPref(key){if(!['compact','contrast','reduceMotion'].includes(key))return;uiPrefs[key]=!uiPrefs[key];saveUiPrefs()}
function resetUiPrefs(){uiPrefs={textSize:'standard',compact:false,contrast:false,reduceMotion:false};saveUiPrefs();toast('Presentation settings reset')}
function openPreferences(){const b=$('prefsBack');if(!b)return;prefsReturnFocus=document.activeElement;b.classList.add('open');b.setAttribute('aria-hidden','false');syncModalScrollLock();applyUiPrefs();renderDataHealth();renderWorkspacePortability();renderRetiredDataSummary();setTimeout(()=>b.querySelector('button')?.focus(),20)}
function closePreferences(){const b=$('prefsBack');if(!b)return;b.classList.remove('open');b.setAttribute('aria-hidden','true');syncModalScrollLock();const target=prefsReturnFocus;prefsReturnFocus=null;if(target&&typeof target.focus==='function')setTimeout(()=>target.focus(),0)}
function prefsBackdrop(e){if(e.target===$('prefsBack'))closePreferences()}
applyUiPrefs();

let deferredInstallPrompt=null;
function updateNetworkState(){
  const online=navigator.onLine;
  const pill=$('netState'),text=$('netText'),copy=$('offlineCopy'),sys=$('sysNetwork'),dot=$('sysNetDot');
  if(pill) pill.classList.toggle('offline',!online);
  if(text) text.textContent=online?'Online':'Offline';
  if(sys) sys.textContent=online?'Online':'Offline';
  if(dot){dot.style.background=online?'var(--mint)':'var(--amber)';dot.style.boxShadow=online?'0 0 7px rgba(72,240,178,.6)':'0 0 7px rgba(255,209,102,.7)'}
  if(copy) copy.textContent=online?'Core tools are available online and cache locally after the first successful load. Active Lab state, presets, comparisons, and preferences remain browser-local.':'Offline mode active — using the locally cached core tools. Active Lab state, presets, comparisons, and preferences remain on this browser.';
}
window.addEventListener('online',updateNetworkState);
window.addEventListener('offline',updateNetworkState);
window.addEventListener('beforeinstallprompt',e=>{
  e.preventDefault();
  deferredInstallPrompt=e;
  const b=$('installBtn'); if(b) b.style.display='inline-flex';
});
async function promptInstall(){
  if(!deferredInstallPrompt){toast('Install option is controlled by your browser');return}
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt=null;
  const b=$('installBtn'); if(b) b.style.display='none';
}
window.addEventListener('appinstalled',()=>{deferredInstallPrompt=null;const b=$('installBtn');if(b)b.style.display='none';toast('MR Command Center installed')});
let waitingServiceWorker=null;
let reloadingForUpdate=false;
function showUpdateReady(worker){
  waitingServiceWorker=worker;
  const bar=$('updateBar'); if(bar) bar.classList.add('show');
}
function applyAppUpdate(){
  if(waitingServiceWorker){waitingServiceWorker.postMessage({type:'SKIP_WAITING'});return}
  toast('No staged update is waiting');
}
if('serviceWorker' in navigator){
  navigator.serviceWorker.addEventListener('controllerchange',()=>{
    if(reloadingForUpdate)return;
    reloadingForUpdate=true;
    location.reload();
  });
  window.addEventListener('load',()=>{
    navigator.serviceWorker.register('/sw.js').then(reg=>{
      if(reg.waiting && navigator.serviceWorker.controller) showUpdateReady(reg.waiting);
      reg.addEventListener('updatefound',()=>{
        const worker=reg.installing;
        if(!worker)return;
        worker.addEventListener('statechange',()=>{
          if(worker.state==='installed' && navigator.serviceWorker.controller) showUpdateReady(worker);
        });
      });
      reg.update().catch(()=>{});
      return navigator.serviceWorker.ready;
    }).then(()=>{
      const chip=$('cacheChip');
      if(chip) chip.textContent='Offline cache: ready';
    }).catch(()=>{
      const chip=$('cacheChip');
      if(chip) chip.textContent='Offline cache: unavailable';
    });
  });
}
updateNetworkState();

const sectionTitles={protocol:'Sequence Families Lab',safety:'MR Safety Foundations',math:'Scan Math',sandbox:'Parameter Lab',contrast:'Contrast Lab',timing:'Sequence Timing Lab',motion:'Motion Lab',kspace:'K-Space Lab',spatial:'Spatial Encoding Lab',rescue:'Sequence Rescue',artifact:'Artifact Lab',burn:'Thermal / RF Foundations'};
const homeSectionTitles={premiumLabs:'Premium Labs',referenceOnboarding:'Reference & onboarding'};
const navGroups={
  protocol:{label:'Sequence families',ids:['protocol']},
  safety:{label:'Safety reference',ids:['safety','burn']},
  workspace:{label:'MRI Labs',ids:['sandbox','contrast','timing','motion','kspace','spatial','artifact']},
  reference:{label:'Supporting reference',ids:['math','rescue']}
};
const moduleAccent={protocol:'#68e1b8',safety:'#48f0b2',math:'#72b7ff',sandbox:'#52d7ff',contrast:'#b89cff',timing:'#52d7ff',motion:'#ff9c7c',kspace:'#ffd166',spatial:'#68e1b8',rescue:'#b89cff',artifact:'#ffd166',burn:'#ff9c7c',learn:'#68e1b8'};
const mobileRouteMap={protocol:'protocol',premium:'premium',safety:'safety',burn:'safety',sandbox:'labs',contrast:'labs',timing:'labs',motion:'labs',kspace:'labs',spatial:'labs',artifact:'labs',math:'reference',rescue:'reference'};
function syncMobileNav(id='home'){
  const tab=id==='home'?'home':(mobileRouteMap[id]||'reference');
  document.querySelectorAll('#mobileNav [data-workspace-tab]').forEach(b=>{const on=b.dataset.workspaceTab===tab;b.classList.toggle('active',on);if(on)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
}
function announceRoute(label){const el=$('routeAnnouncer');if(!el)return;el.textContent='';setTimeout(()=>{el.textContent=label},20)}
function routeHash(id,replace=false){try{const home=!id,target=home?location.pathname+location.search:'#'+id;if((home&&!location.hash)||(!home&&location.hash==='#'+id))return;history[replace?'replaceState':'pushState']({mrccRoute:id||'home'},'',target)}catch(e){}}
function revealHomeContainer(id){
  const direct=$(id);if(direct&&'open' in direct)direct.open=true;
  if(['toolDock','personalWorkspace'].includes(id)){const z=$('referenceOnboarding');if(z)z.open=true}
}
const workspaceViewTargets={compare:'parameterCompareWorkbench',challenges:'labChallengeLauncher',reference:'parameterReference',presets:'presetLibrary'};
const workspaceViewTitles={compare:'A/B Compare',challenges:'Constraint Challenges',reference:'Parameter Reference',presets:'Parameter Presets'};
const labRouteInfo={sandbox:{id:'parameter',label:'Parameter Lab'},contrast:{id:'contrast',label:'Contrast Lab'},timing:{id:'timing',label:'Sequence Timing Lab'},motion:{id:'motion',label:'Motion Lab'},kspace:{id:'kspace',label:'K-Space Lab'},spatial:{id:'spatial',label:'Spatial Encoding Lab'},artifact:{id:'artifact',label:'Artifact Lab'}};
let lastLabRoute='sandbox',hasSavedLastLab=false;
try{const saved=localStorage.getItem('mrcc_last_lab');if(labRouteInfo[saved]){lastLabRoute=saved;hasSavedLastLab=true}}catch(e){}
function rememberLastLabRoute(route){if(!labRouteInfo[route])return;lastLabRoute=route;hasSavedLastLab=true;try{localStorage.setItem('mrcc_last_lab',route)}catch(e){}}
function resumeLastLab(){openLab((labRouteInfo[lastLabRoute]||labRouteInfo.sandbox).id)}
function browseLabs(){document.querySelector('.labs-library-head')?.scrollIntoView({behavior:uiPrefs.reduceMotion?'auto':'smooth',block:'start'})}
function restoreRouteFromHash(){
  const id=location.hash.replace(/^#/,'');
  if(id==='sequences'||id==='protocol'){setFocusedSection('protocol');if(id==='protocol')routeHash('sequences',true);setTimeout(()=>$('protocol')?.scrollIntoView({behavior:'auto',block:'start'}),0);return}
  if(id==='premium'){openPremiumWorkspace(false,true,false);return}
  const premiumLab=Object.entries(premiumDeepRoutes).find(([,route])=>route===id)?.[0];
  if(premiumLab){openPremiumWorkspace(false,true,false);setTimeout(()=>openPremiumAccess(premiumLab,false),20);return}
  if(id==='learn'){openWorkspaceView('challenges',true);return}
  if(homeSectionTitles[id]){showHome(false,true);return}
  if(workspaceViewTargets[id]){openWorkspaceView(id,false);return}
  if(sectionTitles[id]){if(labRouteInfo[id])rememberLastLabRoute(id);setFocusedSection(id);setTimeout(()=>$(id)?.scrollIntoView({behavior:'auto',block:'start'}),0);return}
  showHome(false,true);
}
window.addEventListener('hashchange',restoreRouteFromHash);
window.addEventListener('popstate',restoreRouteFromHash);
function navGroupFor(id){return Object.values(navGroups).find(g=>g.ids.includes(id))||navGroups.reference}
function setRouteContext(label='Home'){const chip=$('routeChip');if(chip)chip.textContent=label}
function setWorkspaceTabActive(tab='home'){
  document.querySelectorAll('[data-workspace-tab]').forEach(b=>{const on=b.dataset.workspaceTab===tab;b.classList.toggle('active',on);if(on)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
}
function renderLabsHome(){
  if(!$('cockpit'))return;
  try{
    const p=sandboxState(),pm=sandboxMetrics(p),changed=sandboxChangedCount(p);
    if($('homeParameterState'))$('homeParameterState').textContent=changed?changed+' control'+(changed===1?'':'s')+' changed from baseline':'Baseline stack';
    if($('homeParameterMeta'))$('homeParameterMeta').textContent='Detail '+pct(pm.detail)+' · SNR '+pct(pm.snr)+' · time '+pct(pm.time);
  }catch(e){}
  try{
    const c=contrastState(),cue=contrastTeachingCue(c);
    if($('homeContrastState'))$('homeContrastState').textContent=(c.mode==='ir'?'IR-like':'SE-like')+' · TR '+Math.round(c.tr)+' · TE '+Math.round(c.te)+(c.mode==='ir'?' · TI '+Math.round(c.ti):'');
    if($('homeContrastMeta'))$('homeContrastMeta').textContent=cue.label+' · '+cue.detail.split('.')[0]+'.';
  }catch(e){}
  try{
    const t=timingState(),tm=timingMetrics(t);
    if($('homeTimingState'))$('homeTimingState').textContent='ETL '+t.etl+' · center echo '+t.center;
    if($('homeTimingMeta'))$('homeTimingMeta').textContent='Effective-TE-like '+Math.round(tm.effectiveTe)+' ms · '+tm.trains+' train'+(tm.trains===1?'':'s');
  }catch(e){}
  try{
    const m=motionState(),mc=motionTeachingCopy(m);
    if($('homeMotionState'))$('homeMotionState').textContent=mc.short+' · '+Number(m.amplitude).toFixed(m.amplitude%1?1:0)+' px';
    if($('homeMotionMeta'))$('homeMotionMeta').textContent=(m.order==='centric'?'Centric':'Linear')+' phase order · onset '+Math.round(m.onset)+'%';
  }catch(e){}
  try{
    const k=kspaceState(),summary=kspaceModeSummary(k);
    if($('homeKspaceState'))$('homeKspaceState').textContent=summary.title;
    if($('homeKspaceMeta'))$('homeKspaceMeta').textContent=summary.meta;
  }catch(e){}
  try{
    const sp=spatialState(),sm=spatialMetrics(sp),sc=spatialTeachingCopy(sp,sm);
    if($('homeSpatialState'))$('homeSpatialState').textContent='Phase FOV '+Math.round(sp.phaseFov)+'% · read FOV '+Math.round(sp.readFov)+'%';
    if($('homeSpatialMeta'))$('homeSpatialMeta').textContent=Math.round(sp.readSamples)+' × '+Math.round(sp.phaseSamples)+' samples · '+sc.short.toLowerCase();
  }catch(e){}
  try{
    const a=artifactLabState(),label=artifacts[a.mode]?.title||'Artifact Lab';
    if($('homeArtifactState'))$('homeArtifactState').textContent=label;
    if($('homeArtifactMeta')){const ap=artifactProfile(a.mode);$('homeArtifactMeta').textContent='Strength '+Math.round(a.strength)+'% · '+(ap.directionLabel||ap.direction||'pattern');}
  }catch(e){}
  if($('homePresetResumeCount'))$('homePresetResumeCount').textContent=sbPresets.length+' saved parameter setup'+(sbPresets.length===1?'':'s');
  if($('homeCompareResumeCount'))$('homeCompareResumeCount').textContent=comparisonHistory.length+' saved comparison'+(comparisonHistory.length===1?'':'s');
  const resume=$('homeResumeLabBtn'),info=labRouteInfo[lastLabRoute]||labRouteInfo.sandbox;
  if(resume)resume.innerHTML=(hasSavedLastLab?'Resume ':'Open ')+escapeHtml(info.label)+' <span>→</span>';
}
function keepActiveLabVisible(target){
  const section=$(target),active=section?.querySelector('.lab-switcher button[aria-current="page"]');
  if(active&&matchMedia('(max-width:760px)').matches)setTimeout(()=>active.scrollIntoView({behavior:uiPrefs.reduceMotion?'auto':'smooth',block:'nearest',inline:'center'}),30);
}
function openLab(id='parameter'){
  const target=id==='contrast'?'contrast':id==='timing'?'timing':id==='motion'?'motion':id==='kspace'?'kspace':id==='spatial'?'spatial':id==='artifact'?'artifact':'sandbox';
  rememberLastLabRoute(target);
  go(target,true);
  setWorkspaceTabActive('labs');keepActiveLabVisible(target);
  if(target==='contrast')setTimeout(()=>contrastUpdate(),20);
  if(target==='timing')setTimeout(()=>timingUpdate(false),20);
  if(target==='motion')setTimeout(()=>motionUpdate(false),20);
  if(target==='kspace')setTimeout(()=>kspaceUpdate(false),20);
  if(target==='spatial')setTimeout(()=>spatialUpdate(false),20);
  if(target==='artifact')setTimeout(()=>artifactLabUpdate(false),20);
}
function openWorkspaceView(mode='labs',updateRoute=true){
  if(mode==='labs'||mode==='workspace'){resumeLastLab();return}
  if(mode==='safety'){
    if(updateRoute)go('safety');
    else{setFocusedSection('safety');setTimeout(()=>$('safety')?.scrollIntoView({behavior:'auto',block:'start'}),0)}
    setWorkspaceTabActive('safety');return
  }
  const target=workspaceViewTargets[mode];
  if(!target){openLab('parameter');return}
  setFocusedSection('sandbox');
  if(updateRoute)routeHash(mode);
  const label=workspaceViewTitles[mode]||'Parameter Lab';
  document.title=label+' — MR Command Center';announceRoute(label+' workspace view');setRouteContext(label);
  setWorkspaceTabActive(mode==='compare'?'compare':mode==='reference'?'reference':'labs');
  setTimeout(()=>jumpParameterLab(target,mode==='presets'),40);
}
let focusPrimaryRoute='sandbox';
function runFocusPrimary(){if(focusPrimaryRoute==='compare'){openParameterWorkspace('compare');return}go(focusPrimaryRoute)}
function renderFocusBar(id){
  const bar=$('focusBar'),title=$('focusTitle'),groupEl=$('focusGroup'),position=$('focusPosition'),icon=$('focusModuleIcon'),related=$('focusRelated'),primary=$('focusPrimaryBtn'),group=navGroupFor(id);
  if(!bar)return;bar.classList.add('show');
  if(title)title.textContent=sectionTitles[id]||'Workspace tool';
  if(groupEl)groupEl.textContent=id==='sandbox'?'Primary workspace':group.label;
  if(position)position.textContent=id==='sandbox'?'· Workbench':id==='learn'?'· Optional practice':'· Reference';
  if(icon)icon.innerHTML=moduleArt[id]?.icon||'';
  bar.style.setProperty('--focus-accent',moduleAccent[id]||'#52d7ff');
  bar.style.setProperty('--focus-progress',id==='sandbox'?'100%':'0%');
  if(related)related.innerHTML=group.ids.filter(tool=>tool!==id).map(tool=>'<button type="button" onclick="go(\''+tool+'\')">'+escapeHtml(sectionTitles[tool])+'</button>').join('');
  focusPrimaryRoute=id==='sandbox'?'compare':'sandbox';
  if(primary)primary.textContent=id==='sandbox'?'Open A/B Compare →':'Parameter Lab →';
}
function setFocusedSection(id){
  const el=$(id);if(!el||!sectionTitles[id])return false;
  document.body.classList.remove('nav-home','nav-premium');document.body.classList.add('nav-focus');
  document.querySelectorAll('main>.section').forEach(s=>s.classList.toggle('active-section',s.id===id));
  document.querySelectorAll('[data-module-card]').forEach(b=>{const on=b.dataset.moduleCard===id;if(on)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
  document.title=sectionTitles[id]+' — MR Command Center';announceRoute(sectionTitles[id]+' workspace tool');setRouteContext(sectionTitles[id]);
  if(['sandbox','contrast','timing','motion','kspace','spatial','artifact'].includes(id)||id==='protocol')$('focusBar')?.classList.remove('show');else renderFocusBar(id);
  setWorkspaceTabActive(['sandbox','contrast','timing','motion','kspace','spatial','artifact'].includes(id)?'labs':id==='protocol'?'protocol':(['safety','burn'].includes(id)?'safety':'reference'));
  return true;
}
function showHome(scroll=true,replaceRoute=false,updateRoute=true){
  document.body.classList.remove('nav-focus','nav-premium');document.body.classList.add('nav-home');
  document.querySelectorAll('main>.section.active-section').forEach(x=>x.classList.remove('active-section'));
  $('focusBar')?.classList.remove('show');
  setWorkspaceTabActive('home');renderLabsHome();setRouteContext('Home');
  document.title='MR Command Center — MRI Labs';announceRoute('MR Command Center Labs home');
  if(updateRoute)routeHash('',replaceRoute);
  if(scroll)$('cockpit')?.scrollIntoView({behavior:uiPrefs.reduceMotion?'auto':'smooth',block:'start'});
}
const premiumDeepRoutes={diffusion:'premium-diffusion',parallel:'premium-parallel',rfpower:'premium-rfpower',gradient:'premium-gradient',offresonance:'premium-offresonance'};
function openPremiumWorkspace(scroll=true,replaceRoute=false,updateRoute=true){
  document.body.classList.remove('nav-home','nav-focus');document.body.classList.add('nav-premium');
  document.querySelectorAll('main>.section.active-section').forEach(x=>x.classList.remove('active-section'));$('focusBar')?.classList.remove('show');
  setWorkspaceTabActive('premium');setRouteContext('Premium Labs');setPremiumFilter(premiumFilter||'all');renderPremiumChallenge();
  document.title='Premium Labs — MR Command Center';announceRoute('Premium Labs workspace');
  if(updateRoute)routeHash('premium',replaceRoute);
  if(scroll)$('premiumLabs')?.scrollIntoView({behavior:uiPrefs.reduceMotion?'auto':'smooth',block:'start'});
}
function jumpHomeSection(id){
  const el=$(id),label=homeSectionTitles[id];if(!el||!label)return;
  showHome(false,false,false);routeHash(id);document.title=label+' — MR Command Center';announceRoute(label+' section');setRouteContext(label);
  revealHomeContainer(id);
  el.scrollIntoView({behavior:uiPrefs.reduceMotion?'auto':'smooth',block:'start'});
}
function remember(){}
function ensureModuleFooters(){
  const footerIds=['safety','math','rescue','burn'];
  footerIds.forEach(id=>{
    const section=$(id);if(!section||section.querySelector('.module-footer-nav'))return;
    const group=navGroupFor(id),related=group.ids.find(tool=>tool!==id),nav=document.createElement('nav');
    nav.className='module-footer-nav';nav.setAttribute('aria-label','Workspace navigation');
    const primary=id==='sandbox'?'<button type="button" onclick="openParameterWorkspace(\'compare\')"><small>Reusable workflow</small><b>Open A/B Compare</b></button>':'<button type="button" onclick="go(\'sandbox\')"><small>Primary workspace</small><b>Parameter Lab</b></button>';
    const relatedButton=related?'<button type="button" onclick="go(\''+related+'\')"><small>Related '+escapeHtml(group.label)+'</small><b>'+escapeHtml(sectionTitles[related])+'</b></button>':'<button type="button" onclick="jumpHomeSection(\'referenceOnboarding\')"><small>Reference desk</small><b>Browse references</b></button>';
    nav.innerHTML='<button type="button" class="module-footer-home" onclick="showHome()"><small>Return</small><b>Labs Home</b></button>'+primary+relatedButton;
    section.appendChild(nav);
  });
}
function go(id,skipTrack=false){
  if(id==='learn'){openWorkspaceView('challenges');return}
  const el=$(id);if(!el)return;
  if(sectionTitles[id]){setFocusedSection(id);routeHash(id)}else if(id==='cockpit'){showHome(false);return}
  el.scrollIntoView({behavior:uiPrefs.reduceMotion?'auto':'smooth',block:'start'});
  if(!skipTrack&&sectionTitles[id])remember(id,sectionTitles[id]);
}
const commands=[
{id:'home',title:'Labs Home',desc:'Return to the lab library, current local lab states, saved setups, and comparisons.',cat:'Labs',icon:'⌂',keys:'home labs parameter contrast k-space presets compare'},
{id:'protocol',title:'Sequence Families Lab',desc:'Explore MRI sequence families, contrast behavior, artifacts, tradeoffs, and vendor terminology.',cat:'Sequences',icon:'SE',keys:'sequence families fse tse gre stir flair dwi epi dixon lava vibe space cube fiesta propeller blade swi mra'},
{id:'unknown',title:'Unknown / unidentified device',desc:'Study the unresolved-device evidence and escalation route.',cat:'Safety',icon:'?',keys:'unknown implant device accessory safety'},
{id:'conditional',title:'MR Conditional device',desc:'Study conditions-of-use verification.',cat:'Safety',icon:'C',keys:'conditional implant device conditions SAR B1 rms'},
{id:'heating',title:'Heating / burning scenario',desc:'Study the stop / assess thermal safety route.',cat:'Safety',icon:'!',keys:'burn heating hot pain discomfort patient'},
{id:'projectile',title:'Questionable object near controlled MR area',desc:'Study access-control and projectile-risk routing.',cat:'Safety',icon:'↗',keys:'projectile ferromagnetic object zone 3 4'},
{id:'voxel',title:'Voxel / resolution calculator',desc:'Practice FOV, matrix, pixel, and voxel math.',cat:'Reference',icon:'▦',keys:'voxel pixel fov matrix resolution'},
{id:'time',title:'2D scan-time estimator',desc:'Practice TR × phase encodes × NEX ÷ ETL.',cat:'Reference',icon:'◷',keys:'time scan duration TR NEX ETL phase'},
{id:'sandbox',title:'Parameter Lab',desc:'Explore geometry, sampling, SNR, acceleration, partial Fourier, and parameter tradeoffs.',cat:'Labs',icon:'⇄',keys:'parameter lab protocol tradeoff snr bandwidth nex fov matrix etl acceleration partial Fourier'},
{id:'contrastlab',title:'Contrast Lab',desc:'Explore simplified TR, TE, and TI effects using synthetic relaxation materials.',cat:'Labs',icon:'◐',keys:'contrast lab tr te ti t1 t2 spin echo inversion recovery weighting relaxation'},
{id:'timinglab',title:'Sequence Timing Lab',desc:'Build a simplified echo train and inspect center-echo timing, train span, phase-train count, and acquisition-time proxy.',cat:'Labs',icon:'◷',keys:'sequence timing echo train echo spacing ETL effective TE TR phase encodes NEX acquisition time'},
{id:'motionlab',title:'Motion Lab',desc:'Reconstruct a synthetic line-by-line acquisition with step, periodic, or drifting translation and compare phase ordering.',cat:'Labs',icon:'↝',keys:'motion lab ghosting movement phase encode ordering centric linear drift periodic k-space acquisition'},
{id:'kspacelab',title:'K-Space Lab',desc:'Mask a synthetic Fourier dataset and inspect center, periphery, truncation, and phase undersampling effects.',cat:'Labs',icon:'⌁',keys:'k-space kspace Fourier sampling center periphery spatial frequency truncation aliasing undersampling reconstruction'},
{id:'spatiallab',title:'Spatial Encoding Lab',desc:'Explore encoded FOV, discrete sampling, relative pixel width, and periodic aliasing with a synthetic object-space model.',cat:'Labs',icon:'▦',keys:'spatial encoding fov aliasing wrap foldover matrix samples pixel resolution phase read'},
{id:'artifactlab',title:'Artifact Lab',desc:'Apply stylized MRI artifact patterns to a synthetic phantom and connect them to troubleshooting logic.',cat:'Reference',icon:'◫',keys:'artifact lab motion wrap susceptibility chemical shift zipper gibbs truncation flow dielectric visual'},
{id:'about',title:'About MR Command Center',desc:'Read the public product scope, audience, creator credit, and educational boundaries.',cat:'Reference',icon:'i',keys:'about scope creator Edon Kukaj public educational'},
{id:'privacy',title:'Privacy & local data',desc:'Read how MRCC uses browser-local storage and what is not sent to an MRCC application backend.',cat:'Reference',icon:'◌',keys:'privacy data local storage browser analytics tracking'},
{id:'premium',title:'Premium Labs',desc:'Open the Premium Labs catalog and compare subscription versus one-time unlock access.',cat:'Premium',icon:'◆',keys:'premium paid subscription one time purchase advanced labs membership'},
{id:'premium-diffusion',title:'Premium: Diffusion & b-Value Lab',desc:'Preview the planned advanced diffusion signal teaching lab.',cat:'Premium',icon:'D',keys:'premium diffusion b value adc attenuation signal advanced'},
{id:'premium-parallel',title:'Premium: Parallel Imaging Lab',desc:'Preview the planned acceleration and noise-amplification teaching lab.',cat:'Premium',icon:'PI',keys:'premium parallel imaging acceleration g factor coil k-space'},
{id:'premium-rfpower',title:'Premium: RF Power Concepts Lab',desc:'Preview the planned safety-bounded RF duty teaching lab.',cat:'Premium',icon:'RF',keys:'premium rf power sar b1 duty flip angle safety'},
{id:'premium-gradient',title:'Premium: Gradient Encoding Concepts Lab',desc:'Preview the planned normalized gradient-lobe area teaching lab.',cat:'Premium',icon:'G',keys:'premium gradient encoding lobe area amplitude duration ramp slew pns'},
{id:'premium-offresonance',title:'Premium: Off-Resonance & Phase Lab',desc:'Preview the frequency-offset phase-accrual teaching lab.',cat:'Premium',icon:'Δf',keys:'premium off resonance frequency phase accrual field offset shim chemical shift'},
{id:'goal-time',title:'Goal: reduce scan burden',desc:'Open Parameter Lab with the main sampling-burden levers highlighted.',cat:'Labs',icon:'◷',keys:'goal reduce scan time burden phase nex etl acceleration partial Fourier'},
{id:'goal-snr',title:'Goal: improve SNR',desc:'Open Parameter Lab with generic signal-efficiency levers highlighted.',cat:'Labs',icon:'≈',keys:'goal improve snr signal voxel nex bandwidth acceleration'},
{id:'goal-detail',title:'Goal: increase detail',desc:'Open Parameter Lab with spatial-sampling levers highlighted.',cat:'Labs',icon:'▦',keys:'goal resolution detail fov matrix slice spatial'},
{id:'goal-distortion',title:'Goal: reduce distortion',desc:'Open Parameter Lab with bandwidth and voxel-dimension levers highlighted.',cat:'Labs',icon:'⌁',keys:'goal distortion off resonance bandwidth voxel susceptibility'},
{id:'compare',title:'A/B Parameter Compare',desc:'Open Snapshot A versus live B comparison in Parameter Lab.',cat:'Labs',icon:'A/B',keys:'compare snapshot parameter a b history deltas'},
{id:'workspace-export',title:'Export workspace backup',desc:'Download active Lab states, Parameter presets/comparisons, preferences, pins, and continuity as JSON.',cat:'Labs',icon:'⇩',keys:'workspace backup export transfer move browser json restore recovery'},
{id:'workspace-import',title:'Import workspace backup',desc:'Validate and restore an MRCC v8 active-workspace backup from JSON.',cat:'Labs',icon:'⇧',keys:'workspace backup import restore transfer move browser json recovery'},
{id:'workspace-diagnostics',title:'Copy workspace diagnostics',desc:'Copy a non-sensitive status summary without Lab values or user-entered labels.',cat:'Labs',icon:'i',keys:'workspace diagnostics support status local storage cache errors'},
{id:'presets',title:'Saved teaching presets',desc:'Open the local teaching-preset library in Parameter Lab.',cat:'Labs',icon:'P',keys:'preset saved parameter library sandbox local reusable'},
{id:'parameterref',title:'Parameter Reference',desc:'Open the deeper reference for geometry, SNR, time, contrast, and artifact controls.',cat:'Labs',icon:'≡',keys:'parameter reference TR TE TI flip angle acceleration partial Fourier phase FOV echo spacing'},
{id:'rescue',title:'Sequence Rescue',desc:'Reason backward from scan time, SNR, motion, distortion, wrap, or fat-sat failure.',cat:'Reference',icon:'↯',keys:'rescue sequence too long noisy snr motion distortion wrap fat suppression troubleshoot'},
{id:'motion',title:'Motion / ghosting',desc:'Load the motion artifact learning stack.',cat:'Reference',icon:'≈',keys:'motion ghost ghosting movement'},
{id:'wrap',title:'Aliasing / wrap',desc:'Load wrap / aliasing troubleshooting.',cat:'Reference',icon:'↩',keys:'aliasing wrap foldover no phase wrap'},
{id:'chem',title:'Chemical shift',desc:'Load chemical-shift troubleshooting.',cat:'Reference',icon:'↔',keys:'chemical shift fat water bandwidth'},
{id:'metal',title:'Metal / susceptibility',desc:'Load metal and susceptibility troubleshooting.',cat:'Reference',icon:'◫',keys:'metal susceptibility implant distortion SEMAC MAVRIC'},
{id:'zipper',title:'Zipper / RF interference',desc:'Load RF interference troubleshooting.',cat:'Reference',icon:'≋',keys:'zipper RF interference shielding door'},
{id:'trunc',title:'Gibbs / truncation',desc:'Load Gibbs ringing troubleshooting.',cat:'Reference',icon:'≋',keys:'gibbs truncation ringing matrix'},
{id:'flow',title:'Flow / pulsation ghosting',desc:'Load flow and pulsation troubleshooting.',cat:'Reference',icon:'↝',keys:'flow pulsation csf vessel ghost'},
{id:'dielectric',title:'Dielectric shading / standing wave',desc:'Load B1 / dielectric shading troubleshooting.',cat:'Reference',icon:'◐',keys:'dielectric shading standing wave b1 3t'},
{id:'burn',title:'Thermal / RF Foundations',desc:'Study body-loop, cable, bore-spacing, and patient-feedback concepts.',cat:'Safety',icon:'T',keys:'burn thermal RF heating cable padding body loop'},
];
let paletteIndex=0,paletteCategory='all',filteredCommands=commands.slice();
function setPaletteCategory(cat){paletteCategory=cat||'all';paletteIndex=0;document.querySelectorAll('[data-palcat]').forEach(b=>{const on=b.dataset.palcat===paletteCategory;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on))});renderPalette()}
function openPalette(){const b=$('paletteBack');paletteReturnFocus=document.activeElement;b.classList.add('open');b.setAttribute('aria-hidden','false');syncModalScrollLock();$('paletteSearch').value='';paletteCategory='all';paletteIndex=0;document.querySelectorAll('[data-palcat]').forEach(b=>{const on=b.dataset.palcat==='all';b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on))});renderPalette();setTimeout(()=>$('paletteSearch').focus(),20)}
function closePalette(){const b=$('paletteBack');b.classList.remove('open');b.setAttribute('aria-hidden','true');syncModalScrollLock();const target=paletteReturnFocus;paletteReturnFocus=null;if(target&&typeof target.focus==='function')setTimeout(()=>target.focus(),0)}
function paletteBackdrop(e){if(e.target===$('paletteBack'))closePalette()}
function renderPalette(){const q=$('paletteSearch').value.trim().toLowerCase();filteredCommands=commands.filter(c=>(paletteCategory==='all'||c.cat===paletteCategory)&&(c.title+' '+c.desc+' '+c.cat+' '+c.keys).toLowerCase().includes(q));if(paletteIndex>=filteredCommands.length)paletteIndex=0;$('paletteResults').innerHTML=filteredCommands.length?filteredCommands.map((c,i)=>`<button class="palitem ${i===paletteIndex?'active':''}" onclick="runCommand('${c.id}')"><span class="palico">${c.icon}</span><span class="palcopy"><b>${c.title}</b><small>${c.desc}</small></span><span class="palcat">${c.cat}</span></button>`).join(''):'<div class="palempty">No matching tool in this category. Try All or another search.</div>';const active=document.querySelector('.palitem.active');if(active)active.scrollIntoView({block:'nearest'})}
const PREMIUM_BILLING_ENABLED=false;
const PREMIUM_ACCESS_MODE='preview-only';
const PREMIUM_PRODUCT_KEYS={membership:'premium_membership',diffusion:'premium_diffusion',parallel:'premium_parallel',rfpower:'premium_rfpower',gradient:'premium_gradient',offresonance:'premium_offresonance'};
const premiumLabCatalog={
  diffusion:{title:'Diffusion & b-Value Lab',kicker:'Advanced diffusion signal model',description:'A simplified educational diffusion experiment for relative signal attenuation across b-value and modeled diffusivity. It will not estimate pathology, diagnose tissue, or replace scanner/vendor diffusion implementation.',preview:true},
  parallel:{title:'Parallel Imaging Lab',kicker:'Advanced sampling-efficiency model',description:'An educational acceleration workspace connecting sampling burden, synthetic coil-sensitivity concepts, and a g-factor-like noise-amplification proxy. It will not reproduce a vendor reconstruction or establish protocol adequacy.',preview:true},
  rfpower:{title:'RF Power Concepts Lab',kicker:'Safety-bounded RF teaching model',description:'A relative RF-duty and sequence-variable teaching workspace. It will not calculate scanner SAR, B1+rms compliance, implant conditions, patient-specific heating, or safe operating limits.',preview:true},
  gradient:{title:'Gradient Encoding Concepts Lab',kicker:'Relative gradient-area teaching model',description:'A generic trapezoidal-lobe workspace for exploring relative amplitude, duration, ramp share, and normalized area. It will not calculate scanner gradient limits, slew rate, PNS, or protocol feasibility.',preview:true},
  offresonance:{title:'Off-Resonance & Phase Lab',kicker:'Frequency-offset phase teaching model',description:'A transparent phase-accrual workspace for exploring how a generic frequency offset accumulates phase over time. It will not act as a field map, shim tool, chemical-species classifier, or scanner correction model.',preview:true}
};
let premiumReturnFocus=null;
let activePremiumLab='diffusion';
function premiumProductKey(id){return PREMIUM_PRODUCT_KEYS[id]||''}
function premiumAccessState(){return {mode:PREMIUM_ACCESS_MODE,identity:'guest',billingReady:false,pricesReady:false,entitlementsReady:false}}
function renderPremiumAccessState(){
  const st=premiumAccessState(),identity=$('premiumAccessIdentity'),detail=$('premiumAccessDetail'),pill=$('premiumAccessPill');
  if(identity)identity.textContent='Guest access';if(detail)detail.textContent='Interactive teasers are available. Premium ownership is not active.';if(pill)pill.textContent='Preview-only';
  if($('premiumAuthState'))$('premiumAuthState').textContent='Not connected';if($('premiumPriceState'))$('premiumPriceState').textContent='Not configured';if($('premiumCheckoutState'))$('premiumCheckoutState').textContent='Not connected';if($('premiumReadinessState'))$('premiumReadinessState').textContent='Not ready';
}
function showPremiumReadiness(){renderPremiumAccessState();toast('Premium purchases are not configured yet')}
function requestPremiumPurchase(mode){
  renderPremiumAccessState();
  const product=mode==='membership'?PREMIUM_PRODUCT_KEYS.membership:premiumProductKey(activePremiumLab);
  toast('Purchase unavailable · '+product+' is not connected to billing yet');
}
let premiumFilter='all';
function setPremiumFilter(filter='all'){
  premiumFilter=['all','signal','acquisition','safety'].includes(filter)?filter:'all';
  let visible=0,total=0;
  document.querySelectorAll('.premium-grid .premium-card').forEach(card=>{total++;const show=premiumFilter==='all'||card.dataset.premiumCategory===premiumFilter;card.hidden=!show;if(show)visible++});
  document.querySelectorAll('[data-premium-filter]').forEach(b=>{const on=b.dataset.premiumFilter===premiumFilter;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on))});
  if($('premiumVisibleCount'))$('premiumVisibleCount').textContent=visible;
  if($('premiumPreviewCount'))$('premiumPreviewCount').textContent=total+' available';
}
const premiumChallengeBank=[
  {lab:'diffusion',label:'Diffusion & b-Value',prompt:'With modeled diffusivity fixed, what happens to normalized mono-exponential signal as b-value increases?',options:['It increases toward S₀','It decreases','It stays unchanged'],correct:1,feedback:'In the teaser, S/S₀ = e^(−bD). With positive D held fixed, increasing b makes the exponent more negative, so normalized signal decreases.'},
  {lab:'parallel',label:'Parallel Imaging',prompt:'In the teaching proxy, what does increasing acceleration R do if encoding diversity is otherwise unchanged?',options:['Sampling burden falls and the SNR-like efficiency tends to fall','Sampling burden rises and efficiency rises','Neither output changes'],correct:0,feedback:'The preview defines sampling burden as 1/R and SNR-like efficiency as 1/(√R·g̃), so more acceleration reduces modeled sampling burden while increasing the efficiency cost.'},
  {lab:'rfpower',label:'RF Power Concepts',prompt:'In the unitless RF teaser, increasing relative pulse scale while other controls stay fixed does what to the RF-activity index?',options:['Raises the index','Lowers the index','Guarantees a safe operating state'],correct:0,feedback:'The invented sensitivity proxy weights pulse scale upward. It is not a SAR/B1+rms or safety calculation, so it cannot establish a safe operating state.'},
  {lab:'gradient',label:'Gradient Encoding Concepts',prompt:'At fixed relative amplitude and duration, increasing combined ramp share does what to normalized trapezoid area?',options:['Raises area because ramps are longer','Lowers area because less time is spent at full amplitude','Proves the waveform exceeds hardware limits'],correct:1,feedback:'For the dimensionless trapezoid, more ramp share reduces the plateau fraction and therefore lowers normalized area. The model says nothing about scanner hardware limits.'},
  {lab:'offresonance',label:'Off-Resonance & Phase',prompt:'For a fixed nonzero frequency offset, what happens to accumulated phase cycles as observation time increases?',options:['The signed cycle count grows in magnitude','The frequency offset automatically returns to zero','Wrapped phase can never repeat'],correct:0,feedback:'Cycles are Δf·t. Their signed magnitude grows with elapsed time; the displayed angle can wrap and repeat modulo 360°.'}
];
let premiumChallengeIndex=0,premiumChallengeAnswered=false,premiumChallengeScoreValue=0,premiumChallengeAttempts=0;
function renderPremiumChallenge(){
  const q=premiumChallengeBank[premiumChallengeIndex];if(!q||!$('premiumChallengePrompt'))return;
  premiumChallengeAnswered=false;$('premiumChallengeLab').textContent=q.label;$('premiumChallengePrompt').textContent=q.prompt;$('premiumChallengeProgress').textContent='Challenge '+(premiumChallengeIndex+1)+' of '+premiumChallengeBank.length;
  $('premiumChallengeOptions').innerHTML=q.options.map((opt,i)=>'<button type="button" onclick="answerPremiumChallenge('+i+')">'+escapeHtml(opt)+'</button>').join('');
  $('premiumChallengeFeedback').className='premium-challenge-feedback';$('premiumChallengeFeedback').textContent='';$('premiumChallengeNext').disabled=true;$('premiumChallengeNext').textContent=premiumChallengeIndex===premiumChallengeBank.length-1?'Restart challenge set ↻':'Next challenge →';$('premiumChallengeScore').textContent='Session score '+premiumChallengeScoreValue+' / '+premiumChallengeAttempts;
}
function answerPremiumChallenge(choice){
  if(premiumChallengeAnswered)return;const q=premiumChallengeBank[premiumChallengeIndex];if(!q)return;premiumChallengeAnswered=true;premiumChallengeAttempts++;
  const buttons=[...$('premiumChallengeOptions').querySelectorAll('button')];buttons.forEach((b,i)=>{b.disabled=true;if(i===q.correct)b.classList.add('correct');else if(i===choice)b.classList.add('wrong')});
  const right=choice===q.correct;if(right)premiumChallengeScoreValue++;const fb=$('premiumChallengeFeedback');fb.innerHTML='<b>'+(right?'Correct.':'Not quite.')+'</b> '+escapeHtml(q.feedback);fb.classList.add('show');$('premiumChallengeNext').disabled=false;$('premiumChallengeScore').textContent='Session score '+premiumChallengeScoreValue+' / '+premiumChallengeAttempts;
}
function nextPremiumChallenge(){premiumChallengeIndex=(premiumChallengeIndex+1)%premiumChallengeBank.length;renderPremiumChallenge()}
function openPremiumChallengePreview(){const q=premiumChallengeBank[premiumChallengeIndex];if(q)openPremiumAccess(q.lab)}
function diffusionPreviewSignal(b,d){return Math.exp(-Math.max(0,b)*Math.max(0,d)*.001)}
function drawDiffusionPreview(){
  const c=$('diffPreviewCanvas');if(!c)return;
  const ctx=c.getContext('2d'),w=c.width,h=c.height,p={l:42,r:18,t:18,b:30},d=+($('diffPreviewD')?.value||1),selected=+($('diffPreviewB')?.value||800);
  ctx.clearRect(0,0,w,h);ctx.fillStyle='#030807';ctx.fillRect(0,0,w,h);
  ctx.strokeStyle='rgba(255,255,255,.10)';ctx.lineWidth=1;ctx.font='11px system-ui';ctx.fillStyle='#789a90';
  for(let i=0;i<=4;i++){const y=p.t+i*(h-p.t-p.b)/4;ctx.beginPath();ctx.moveTo(p.l,y);ctx.lineTo(w-p.r,y);ctx.stroke();ctx.fillText(String(Math.round((1-i/4)*100))+'%',5,y+4)}
  for(let i=0;i<=3;i++){const b=i*500,x=p.l+(b/1500)*(w-p.l-p.r);ctx.beginPath();ctx.moveTo(x,p.t);ctx.lineTo(x,h-p.b);ctx.stroke();ctx.fillText(String(b),x-9,h-8)}
  ctx.strokeStyle='#b89cff';ctx.lineWidth=3;ctx.beginPath();
  for(let b=0;b<=1500;b+=25){const q=diffusionPreviewSignal(b,d),x=p.l+(b/1500)*(w-p.l-p.r),y=p.t+(1-q)*(h-p.t-p.b);if(b===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)}
  ctx.stroke();
  const q=diffusionPreviewSignal(selected,d),x=p.l+(selected/1500)*(w-p.l-p.r),y=p.t+(1-q)*(h-p.t-p.b);
  ctx.fillStyle='#efeaff';ctx.beginPath();ctx.arc(x,y,5,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#52d7ff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,p.t);ctx.lineTo(x,h-p.b);ctx.stroke();
}
function updateDiffusionPreview(){
  if(!$('diffPreviewB'))return;
  const b=+($('diffPreviewB').value||800),d=+($('diffPreviewD').value||1),q=diffusionPreviewSignal(b,d);
  $('diffPreviewBOut').textContent=Math.round(b);$('diffPreviewDOut').textContent=d.toFixed(2);$('diffPreviewSignal').textContent=(q*100).toFixed(1)+'%';$('diffPreviewLoss').textContent=((1-q)*100).toFixed(1)+'%';$('diffPreviewPointLabel').textContent='selected b = '+Math.round(b);drawDiffusionPreview();
}
function parallelPreviewMetrics(r,diversity){
  const R=Math.min(4,Math.max(1,+r||1)),e=Math.min(1,Math.max(.2,+diversity||.75));
  const sampling=1/R,g=1+(R-1)*Math.pow(1-e,1.55)*.9,efficiency=1/(Math.sqrt(R)*g);
  return {R,e,sampling,g,efficiency};
}
function drawParallelPreview(){
  const c=$('parallelPreviewCanvas');if(!c)return;
  const ctx=c.getContext('2d'),w=c.width,h=c.height,m=parallelPreviewMetrics($('parallelPreviewR')?.value,$('parallelPreviewDiversity')?.value),R=m.R,e=m.e;
  ctx.clearRect(0,0,w,h);ctx.fillStyle='#030807';ctx.fillRect(0,0,w,h);
  const left=28,right=w-28,top=22,bottom=h-30,lines=32,keep=Math.max(1,Math.round(lines/R));
  ctx.fillStyle='#789a90';ctx.font='11px system-ui';ctx.fillText('phase-line burden',left,14);
  for(let i=0;i<lines;i++){const y=top+i*(bottom-top)/(lines-1),kept=i%Math.max(1,Math.round(R))===0;ctx.strokeStyle=kept?'rgba(82,215,255,.82)':'rgba(255,255,255,.07)';ctx.lineWidth=kept?2:1;ctx.beginPath();ctx.moveTo(left,y);ctx.lineTo(w*.54,y);ctx.stroke()}
  const x0=w*.62,x1=right,cy=(top+bottom)/2,amp=(bottom-top)*.34;
  ctx.fillStyle='#789a90';ctx.fillText('encoding diversity',x0,14);
  const sep=18+e*42;
  const profiles=[{phase:-sep,color:'#52d7ff'},{phase:sep,color:'#b89cff'}];
  for(const p of profiles){ctx.strokeStyle=p.color;ctx.lineWidth=3;ctx.beginPath();for(let i=0;i<=80;i++){const t=i/80,x=x0+t*(x1-x0),y=cy+Math.sin(t*Math.PI*2+p.phase*.035)*amp*(.45+.25*e);if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)}ctx.stroke()}
  ctx.fillStyle='#9fbab2';ctx.fillText(keep+' / '+lines+' line-equivalents',left,h-10);ctx.fillText('diversity '+e.toFixed(2),x0,h-10);
}
function updateParallelPreview(){
  if(!$('parallelPreviewR'))return;
  const m=parallelPreviewMetrics($('parallelPreviewR').value,$('parallelPreviewDiversity').value),kept=Math.max(1,Math.round(32/m.R));
  $('parallelPreviewROut').textContent=m.R.toFixed(m.R%1?1:0)+'×';$('parallelPreviewDiversityOut').textContent=m.e.toFixed(2);$('parallelPreviewSampling').textContent=(m.sampling*100).toFixed(0)+'%';$('parallelPreviewG').textContent=m.g.toFixed(2)+'×';$('parallelPreviewEfficiency').textContent=(m.efficiency*100).toFixed(0)+'%';$('parallelPreviewLineLabel').textContent=kept+' of 32 line-equivalents';$('parallelPreviewPenaltyLabel').textContent='g̃ '+m.g.toFixed(2)+'×';drawParallelPreview();
}
function rfPreviewMetrics(scale,pulses,rate){
  const a=Math.min(1.25,Math.max(.25,+scale||.75)),n=Math.min(16,Math.max(1,Math.round(+pulses||4))),r=Math.min(2,Math.max(.5,+rate||1));
  const pulseContribution=n/4,scaleContribution=Math.pow(a/.75,2),index=scaleContribution*pulseContribution*r;
  return {a,n,r,pulseContribution,scaleContribution,index};
}
function drawRfPreview(){
  const c=$('rfPreviewCanvas');if(!c)return;
  const ctx=c.getContext('2d'),w=c.width,h=c.height,m=rfPreviewMetrics($('rfPreviewScale')?.value,$('rfPreviewPulses')?.value,$('rfPreviewRate')?.value),left=46,right=w-24,top=20,bottom=h-34;
  ctx.clearRect(0,0,w,h);ctx.fillStyle='#030807';ctx.fillRect(0,0,w,h);
  ctx.strokeStyle='rgba(255,255,255,.10)';ctx.lineWidth=1;ctx.font='11px system-ui';ctx.fillStyle='#789a90';
  const max=4;for(let i=0;i<=4;i++){const val=i,y=bottom-(val/max)*(bottom-top);ctx.beginPath();ctx.moveTo(left,y);ctx.lineTo(right,y);ctx.stroke();ctx.fillText(val.toFixed(0)+'×',8,y+4)}
  const refY=bottom-(1/max)*(bottom-top);ctx.strokeStyle='rgba(82,215,255,.55)';ctx.setLineDash([5,5]);ctx.beginPath();ctx.moveTo(left,refY);ctx.lineTo(right,refY);ctx.stroke();ctx.setLineDash([]);
  const barW=(right-left)*.28,gap=(right-left)*.075,vals=[Math.min(max,m.scaleContribution),Math.min(max,m.pulseContribution),Math.min(max,m.index)],labels=['pulse scale²','pulse count','combined index'],colors=['#b89cff','#52d7ff','#ff9c7c'];
  vals.forEach((val,i)=>{const x=left+gap+i*(barW+gap),y=bottom-(val/max)*(bottom-top);ctx.fillStyle=colors[i];ctx.fillRect(x,y,barW,bottom-y);ctx.fillStyle='#9fbab2';ctx.fillText(labels[i],x,bottom+18)});
  ctx.fillStyle='#cfefff';ctx.fillText('1.00× reference',right-100,refY-6);
}
function updateRfPreview(){
  if(!$('rfPreviewScale'))return;
  const m=rfPreviewMetrics($('rfPreviewScale').value,$('rfPreviewPulses').value,$('rfPreviewRate').value);
  $('rfPreviewScaleOut').textContent=m.a.toFixed(2)+'×';$('rfPreviewPulsesOut').textContent=m.n;$('rfPreviewRateOut').textContent=m.r.toFixed(1)+'×';$('rfPreviewIndex').textContent=m.index.toFixed(2)+'×';$('rfPreviewPulseContribution').textContent=m.pulseContribution.toFixed(2)+'×';$('rfPreviewRateContribution').textContent=m.r.toFixed(2)+'×';$('rfPreviewIndexLabel').textContent='index '+m.index.toFixed(2)+'×';$('rfPreviewTrendLabel').textContent=m.index>1.01?'above reference':m.index<.99?'below reference':'near reference';drawRfPreview();
}
function gradientPreviewMetrics(amplitude,duration,rampShare){
  const a=Math.min(1.5,Math.max(.25,+amplitude||.75)),t=Math.min(2,Math.max(.5,+duration||1)),r=Math.min(.6,Math.max(.1,+rampShare||.2));
  const shapeEfficiency=1-r/2,rawArea=a*t*shapeEfficiency,reference=.75*1*(1-.2/2),areaIndex=rawArea/reference,plateauShare=1-r;
  return {a,t,r,shapeEfficiency,rawArea,areaIndex,plateauShare};
}
function drawGradientPreview(){
  const c=$('gradientPreviewCanvas');if(!c)return;
  const ctx=c.getContext('2d'),w=c.width,h=c.height,m=gradientPreviewMetrics($('gradientPreviewAmplitude')?.value,$('gradientPreviewDuration')?.value,$('gradientPreviewRamp')?.value),left=52,right=w-28,top=24,bottom=h-38;
  ctx.clearRect(0,0,w,h);ctx.fillStyle='#030807';ctx.fillRect(0,0,w,h);
  ctx.strokeStyle='rgba(255,255,255,.10)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(left,bottom);ctx.lineTo(right,bottom);ctx.stroke();ctx.beginPath();ctx.moveTo(left,top);ctx.lineTo(left,bottom);ctx.stroke();
  const width=(right-left)*Math.min(1,m.t/2),x0=left+(right-left-width)/2,x1=x0+width,rampPx=width*m.r/2,amp=(bottom-top)*Math.min(1,m.a/1.5),y=bottom-amp;
  ctx.fillStyle='rgba(104,225,184,.16)';ctx.beginPath();ctx.moveTo(x0,bottom);ctx.lineTo(x0+rampPx,y);ctx.lineTo(x1-rampPx,y);ctx.lineTo(x1,bottom);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#68e1b8';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x0,bottom);ctx.lineTo(x0+rampPx,y);ctx.lineTo(x1-rampPx,y);ctx.lineTo(x1,bottom);ctx.stroke();
  ctx.fillStyle='#789a90';ctx.font='11px system-ui';ctx.fillText('relative amplitude',8,top+8);ctx.fillText('relative duration →',right-104,h-10);ctx.fillStyle='#d6f8ed';ctx.fillText('normalized area '+m.areaIndex.toFixed(2)+'×',left,16);
}
function updateGradientPreview(){
  if(!$('gradientPreviewAmplitude'))return;
  const m=gradientPreviewMetrics($('gradientPreviewAmplitude').value,$('gradientPreviewDuration').value,$('gradientPreviewRamp').value);
  $('gradientPreviewAmplitudeOut').textContent=m.a.toFixed(2)+'×';$('gradientPreviewDurationOut').textContent=m.t.toFixed(2)+'×';$('gradientPreviewRampOut').textContent=Math.round(m.r*100)+'%';$('gradientPreviewArea').textContent=m.areaIndex.toFixed(2)+'×';$('gradientPreviewPlateau').textContent=Math.round(m.plateauShare*100)+'%';$('gradientPreviewEfficiency').textContent=Math.round(m.shapeEfficiency*100)+'%';$('gradientPreviewShapeLabel').textContent=Math.round(m.r*100)+'% combined ramps';$('gradientPreviewAreaLabel').textContent='area '+m.areaIndex.toFixed(2)+'×';drawGradientPreview();
}
function offresPreviewMetrics(hz,timeMs){
  const df=Math.min(250,Math.max(-250,+hz||0)),t=Math.min(20,Math.max(0,+timeMs||0)),cycles=df*t/1000,rawDegrees=cycles*360,wrapped=((rawDegrees%360)+360)%360,radians=wrapped*Math.PI/180,projection=Math.cos(radians);
  return {df,t,cycles,rawDegrees,wrapped,radians,projection};
}
function drawOffresPreview(){
  const c=$('offresPreviewCanvas');if(!c)return;
  const ctx=c.getContext('2d'),w=c.width,h=c.height,m=offresPreviewMetrics($('offresPreviewHz')?.value,$('offresPreviewTime')?.value),cx=w*.30,cy=h*.52,r=Math.min(72,h*.32);
  ctx.clearRect(0,0,w,h);ctx.fillStyle='#030807';ctx.fillRect(0,0,w,h);
  ctx.strokeStyle='rgba(255,255,255,.12)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(cx-r-12,cy);ctx.lineTo(cx+r+12,cy);ctx.stroke();ctx.beginPath();ctx.moveTo(cx,cy-r-12);ctx.lineTo(cx,cy+r+12);ctx.stroke();
  const ang=-m.radians,x=cx+Math.cos(ang)*r,y=cy+Math.sin(ang)*r;ctx.strokeStyle='#ffd166';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(x,y);ctx.stroke();ctx.fillStyle='#fff0bb';ctx.beginPath();ctx.arc(x,y,5,0,Math.PI*2);ctx.fill();
  const gx=w*.58,gy=h*.74,gw=w*.34,gh=h*.48;ctx.strokeStyle='rgba(255,255,255,.10)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(gx,gy);ctx.lineTo(gx+gw,gy);ctx.stroke();ctx.beginPath();ctx.moveTo(gx,gy-gh);ctx.lineTo(gx,gy);ctx.stroke();
  ctx.strokeStyle='#b89cff';ctx.lineWidth=3;ctx.beginPath();for(let i=0;i<=80;i++){const tt=m.t*i/80,phase=2*Math.PI*m.df*tt/1000,xx=gx+gw*i/80,yy=gy-(Math.sin(phase)*gh*.42);if(i===0)ctx.moveTo(xx,yy);else ctx.lineTo(xx,yy)}ctx.stroke();
  ctx.fillStyle='#789a90';ctx.font='11px system-ui';ctx.fillText('phase vector',cx-r,18);ctx.fillText('sin(phase) over elapsed time',gx,h-10);
}
function updateOffresPreview(){
  if(!$('offresPreviewHz'))return;
  const m=offresPreviewMetrics($('offresPreviewHz').value,$('offresPreviewTime').value),sign=m.df>0?'+':'';
  $('offresPreviewHzOut').textContent=sign+Math.round(m.df)+' Hz';$('offresPreviewTimeOut').textContent=m.t.toFixed(2)+' ms';$('offresPreviewCycles').textContent=m.cycles.toFixed(2);$('offresPreviewPhase').textContent=Math.round(m.wrapped)+'°';$('offresPreviewProjection').textContent=m.projection.toFixed(2);$('offresPreviewDirection').textContent=m.df>0?'positive offset':m.df<0?'negative offset':'on-resonance reference';$('offresPreviewPhaseLabel').textContent=Math.round(m.wrapped)+'° wrapped phase';drawOffresPreview();
}
function openPremiumAccess(id='diffusion',updateRoute=true){
  const lab=premiumLabCatalog[id];if(!lab)return;
  if(!document.body.classList.contains('nav-premium'))openPremiumWorkspace(false,false,false);
  setWorkspaceTabActive('premium');setRouteContext(lab.title);if(updateRoute)routeHash(premiumDeepRoutes[id]||'premium');
  activePremiumLab=id;premiumReturnFocus=document.activeElement;
  const back=$('premiumBack');$('premiumModalTitle').textContent=lab.title;$('premiumModalKicker').textContent=lab.kicker;$('premiumModalDescription').textContent=lab.description;if($('premiumLabProductKey'))$('premiumLabProductKey').textContent=premiumProductKey(id)||'premium_lab';renderPremiumAccessState();
  $('diffusionPreview')?.classList.toggle('show',id==='diffusion'&&!!lab.preview);
  $('parallelPreview')?.classList.toggle('show',id==='parallel'&&!!lab.preview);
  $('rfPreview')?.classList.toggle('show',id==='rfpower'&&!!lab.preview);
  $('gradientPreview')?.classList.toggle('show',id==='gradient'&&!!lab.preview);
  $('offresPreview')?.classList.toggle('show',id==='offresonance'&&!!lab.preview);
  back.classList.add('open');back.setAttribute('aria-hidden','false');syncModalScrollLock();if(id==='diffusion'&&lab.preview)setTimeout(()=>updateDiffusionPreview(),0);if(id==='parallel'&&lab.preview)setTimeout(()=>updateParallelPreview(),0);if(id==='rfpower'&&lab.preview)setTimeout(()=>updateRfPreview(),0);if(id==='gradient'&&lab.preview)setTimeout(()=>updateGradientPreview(),0);if(id==='offresonance'&&lab.preview)setTimeout(()=>updateOffresPreview(),0);setTimeout(()=>back.querySelector('.premium-close')?.focus(),20);
}
function closePremiumAccess(){const back=$('premiumBack');back.classList.remove('open');back.setAttribute('aria-hidden','true');syncModalScrollLock();if(document.body.classList.contains('nav-premium')){routeHash('premium',true);setRouteContext('Premium Labs')}const target=premiumReturnFocus;premiumReturnFocus=null;if(target&&typeof target.focus==='function')setTimeout(()=>target.focus(),0)}
function premiumBackdrop(e){if(e.target===$('premiumBack'))closePremiumAccess()}
function openPremiumCatalog(){openPremiumWorkspace()}
function runCommand(id){
  closePalette();const cmd=commands.find(c=>c.id===id);if(cmd)remember(id,cmd.title);
  if(id==='home'){showHome();return}
  const artifactIds=['motion','wrap','chem','metal','zipper','trunc','flow','dielectric'];
  if(['unknown','conditional','heating','projectile'].includes(id)){go('safety',true);$('redflag').value=id==='projectile'?'projectile':id;flagRoute();setTimeout(()=>$('route').scrollIntoView({behavior:uiPrefs.reduceMotion?'auto':'smooth',block:'center'}),250);return}
  if(id==='voxel'){go('math',true);setTimeout(()=>$('fovx').focus(),350);return}
  if(id==='time'){go('math',true);setTimeout(()=>$('tr').focus(),350);return}
  if(id==='sandbox'){openLab('parameter');return}
  if(id==='contrastlab'){openLab('contrast');return}
  if(id==='timinglab'){openLab('timing');return}
  if(id==='motionlab'){openLab('motion');return}
  if(id==='kspacelab'){openLab('kspace');return}
  if(id==='spatiallab'){openLab('spatial');return}
  if(id==='artifactlab'){openLab('artifact');return}
  if(id==='about'){location.href='/about.html';return}
  if(id==='privacy'){location.href='/privacy.html';return}
  if(id==='premium'){openPremiumCatalog();return}
  if(id==='premium-diffusion'){openPremiumWorkspace(false);setTimeout(()=>openPremiumAccess('diffusion'),40);return}
  if(id==='premium-parallel'){openPremiumWorkspace(false);setTimeout(()=>openPremiumAccess('parallel'),40);return}
  if(id==='premium-rfpower'){openPremiumWorkspace(false);setTimeout(()=>openPremiumAccess('rfpower'),40);return}
  if(id==='premium-gradient'){openPremiumWorkspace(false);setTimeout(()=>openPremiumAccess('gradient'),40);return}
  if(id==='premium-offresonance'){openPremiumWorkspace(false);setTimeout(()=>openPremiumAccess('offresonance'),40);return}
  if(id==='goal-time'){openParameterGoal('time');return}
  if(id==='goal-snr'){openParameterGoal('snr');return}
  if(id==='goal-detail'){openParameterGoal('detail');return}
  if(id==='goal-distortion'){openParameterGoal('distortion');return}
  if(id==='compare'){openParameterWorkspace('compare');return}
  if(id==='workspace-export'){exportWorkspaceBackup();return}
  if(id==='workspace-import'){openPreferences();chooseWorkspaceBackup();return}
  if(id==='workspace-diagnostics'){copyWorkspaceDiagnostics();return}
  if(id==='rescue'){go('rescue',true);return}
  if(artifactIds.includes(id)){openLab('artifact');$('artifactSelect').value=id;artifactLabUpdate();solveArtifact();setTimeout(()=>$('artifactOut').scrollIntoView({behavior:uiPrefs.reduceMotion?'auto':'smooth',block:'center'}),250);return}
  if(id==='burn'){go('burn',true);return}
  if(id==='presets'){go('sandbox',true);setTimeout(()=>{$('presetLibrary').open=true;$('presetName')?.focus()},300);return}
  if(id==='parameterref'){go('sandbox',true);setTimeout(()=>$('parameterReference')?.scrollIntoView({behavior:uiPrefs.reduceMotion?'auto':'smooth',block:'start'}),250);return}
}
document.addEventListener('keydown',e=>{const tag=(e.target.tagName||'').toLowerCase(),typing=['input','textarea','select'].includes(tag);if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openPalette();return}if(e.key==='?'&&!typing&&!$('paletteBack').classList.contains('open')){e.preventDefault();openPreferences();return}if(e.key==='Escape'&&$('prefsBack')?.classList.contains('open')){closePreferences();return}if(e.key==='/'&&!typing&&!$('paletteBack').classList.contains('open')&&!$('prefsBack')?.classList.contains('open')){e.preventDefault();openPalette();return}if(!$('paletteBack').classList.contains('open'))return;if(e.key==='Escape'){closePalette();return}if(e.key==='ArrowDown'){e.preventDefault();if(filteredCommands.length){paletteIndex=(paletteIndex+1)%filteredCommands.length;renderPalette()}return}if(e.key==='ArrowUp'){e.preventDefault();if(filteredCommands.length){paletteIndex=(paletteIndex-1+filteredCommands.length)%filteredCommands.length;renderPalette()}return}if(e.key==='Enter'&&filteredCommands.length){e.preventDefault();runCommand(filteredCommands[paletteIndex].id)}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('premiumBack')?.classList.contains('open')){closePremiumAccess();return}if(e.key!=='Tab')return;const premium=$('premiumBack'),prefs=$('prefsBack'),palette=$('paletteBack');if(premium?.classList.contains('open')){trapDialogFocus(premium,e);return}if(prefs?.classList.contains('open')){trapDialogFocus(prefs,e);return}if(palette?.classList.contains('open'))trapDialogFocus(palette,e)});
const safety=[...document.querySelectorAll('#safetyChecks input')];function updateSafety(){const n=safety.filter(x=>x.checked).length;const el=$('safetyState');if(n===safety.length){el.className='state ok';el.textContent='Documentation prompts complete — proceed only through your local MR safety review / clearance process.'}else{el.className='state warn';el.textContent=`${safety.length-n} item${safety.length-n===1?'':'s'} unchecked — documentation is incomplete.`}}safety.forEach(x=>x.addEventListener('change',updateSafety));function resetChecks(){safety.forEach(x=>x.checked=false);updateSafety()}
const routes={unknown:'TREAT AS MR UNSAFE / STOP: An unidentified device or device with unknown MRI safety status should not be treated as cleared. Establish exact identity and authoritative MR status, then follow the local MR safety review process before proceeding.',conditional:'VERIFY CONDITIONS: Do not reduce “MR Conditional” to a yes/no label. Match every applicable condition to the exact scanner, coil / RF setup, sequence limits, patient position, and scan duration.',external:'VERIFY + CONTROL: Confirm MR status, placement restrictions, cables / leads, and operating instructions for every external device and accessory. If documentation is incomplete, escalate.',projectile:'CONTROL ACCESS: Keep questionable ferromagnetic / unverified objects out of controlled MR areas until screened according to local policy.',heating:'STOP THE SCAN / ASSESS: Treat patient-reported heating or burning as a safety signal. Follow your local emergency and MR safety process; evaluate positioning, contact points, padding, cables, devices, and system factors before any decision to resume.',other:'PAUSE + ROUTE: Unresolved MR safety concerns should go to your local MR safety authority / supervising clinician rather than being normalized at the console.'};function flagRoute(){$('route').innerHTML=`<strong>${routes[$('redflag').value]}</strong>`}flagRoute();
function calcVoxel(){const fx=+$('fovx').value,my=+$('my').value,fy=+$('fovy').value,mx=+$('mx').value,t=+$('thk').value;if(!fx||!fy||!mx||!my||!t)return;const x=fx/mx,y=fy/my,v=x*y*t;$('pixx').textContent=x.toFixed(2);$('pixy').textContent=y.toFixed(2);$('vox').textContent=v.toFixed(2)}function calcTime(){const tr=+$('tr').value,pe=+$('pe').value,n=+$('nex').value,etl=+$('etl').value;if(!tr||!pe||!n||!etl)return;const s=(tr/1000)*pe*n/etl;const m=Math.floor(s/60),sec=Math.round(s%60).toString().padStart(2,'0');$('timeResult').innerHTML=`Estimated acquisition time: <strong>${s.toFixed(1)} s</strong> (~${m}:${sec})`}calcVoxel();calcTime();

const sbBase={fov:240,mx:320,phase:256,phaseFov:1,slice:4,nex:1,bw:1,etl:8,accel:1,pf:1};
const presetRanges={fov:[160,420],mx:[128,512],phase:[96,512],phaseFov:[0.5,1],slice:[1,8],nex:[1,4],bw:[0.5,2],etl:[1,32],accel:[1,4],pf:[0.625,1]};
function normalizePresetState(raw){
  if(!raw||typeof raw!=='object')return null;
  const out={};
  for(const key of Object.keys(presetRanges)){
    const source=raw[key]===undefined?sbBase[key]:raw[key],n=Number(source),range=presetRanges[key];
    if(!Number.isFinite(n)||n<range[0]||n>range[1])return null;
    out[key]=n;
  }
  return out;
}
function normalizePresetEntry(raw){
  if(!raw||typeof raw!=='object')return null;
  const name=String(raw.name||'').trim().slice(0,36),state=normalizePresetState(raw.state);
  if(!name||!state)return null;
  return {name,state,savedAt:validDateString(raw.savedAt)?raw.savedAt:new Date().toISOString()};
}
function normalizeSandboxCurrent(raw){
  if(!raw||typeof raw!=='object')return null;
  const state=normalizePresetState(raw.state);if(!state)return null;
  return {state,savedAt:validDateString(raw.savedAt)?raw.savedAt:new Date().toISOString(),goal:parameterGoals?.[raw.goal]?String(raw.goal):'',challenge:parameterChallenges?.[raw.challenge]?String(raw.challenge):''};
}
let sandboxAutosaveSuspended=false,sandboxAutosaveTimer=null;
const rawCurrentSandbox=readStoredJson(localStorage,'mrcc_sandbox_current',null);
let sbCurrentRecord=null;
const rawSnapshot=readStoredJson(localStorage,'mrcc_sandbox_snapshot',null);
let sbSnapshot=normalizePresetState(rawSnapshot);if(rawSnapshot&& !sbSnapshot)dataRepairCount++;
const rawPresets=readStoredJson(localStorage,'mrcc_sandbox_presets',[]);
let sbPresets=Array.isArray(rawPresets)?rawPresets.map(normalizePresetEntry).filter(Boolean).slice(0,8):[];
if(!Array.isArray(rawPresets)||sbPresets.length!==rawPresets.slice(0,8).length)dataRepairCount++;
const rawHistory=readStoredJson(localStorage,'mrcc_compare_history',[]);
let comparisonHistory=[];
if(Array.isArray(rawHistory)){comparisonHistory=rawHistory.map(x=>{if(!x||typeof x!=='object')return null;const a=normalizePresetState(x.a),b=normalizePresetState(x.b);if(!a||!b)return null;return {label:String(x.label||'Saved comparison').slice(0,36),a,b,savedAt:validDateString(x.savedAt)?x.savedAt:new Date().toISOString(),deltas:x.deltas&&typeof x.deltas==='object'?x.deltas:{}}}).filter(Boolean).slice(0,10);if(comparisonHistory.length!==rawHistory.slice(0,10).length)dataRepairCount++}else dataRepairCount++;
function pct(v){return Math.round(v*100)+'%'}
function savePresets(){try{localStorage.setItem('mrcc_sandbox_presets',JSON.stringify(sbPresets))}catch(e){}renderPresetLibrary();renderWorkbenchHome()}
function presetSummary(s){return 'FOV '+s.fov+' · '+s.mx+'×'+s.phase+' · pFOV '+Math.round(s.phaseFov*100)+'% · Slice '+s.slice+' · NEX '+s.nex+' · BW '+s.bw+'× · ETL '+s.etl+' · R '+s.accel+' · PF '+Math.round(s.pf*100)+'%'}
function sandboxStateText(s){return 'FOV '+s.fov+' mm | Matrix '+s.mx+'×'+s.phase+' | Phase FOV '+Math.round(s.phaseFov*100)+'% | Slice '+s.slice+' mm | NEX '+s.nex+' | BW '+s.bw+'× | ETL '+s.etl+' | R '+s.accel+' | PF '+Math.round(s.pf*100)+'%'}
function renderPresetLibrary(){
  if(typeof renderLabsHome==='function')setTimeout(renderLabsHome,0);
  const list=$('presetList'),count=$('presetCount'),search=$('presetSearch');
  const q=(search?search.value:'').trim().toLowerCase();
  const visible=sbPresets.map((p,i)=>({p,i})).filter(x=>!q||x.p.name.toLowerCase().includes(q));
  if(count)count.textContent=(q?visible.length+' shown · ':'')+sbPresets.length+' saved';
  if(!list)return;
  if(!sbPresets.length){list.innerHTML='<div class="preset-empty">No saved presets yet. Save the current Sandbox state with a generic, non-PHI name.</div>';return}
  if(!visible.length){list.innerHTML='<div class="preset-empty">No presets match that filter.</div>';return}
  list.innerHTML=visible.map(x=>'<div class="preset-row"><div class="preset-copy"><b>'+escapeHtml(x.p.name)+'</b><small>'+escapeHtml(presetSummary(x.p.state))+'</small></div><div class="preset-actions"><button onclick="loadSandboxPreset('+x.i+')">Load</button><button onclick="compareSandboxPreset('+x.i+')">Compare vs current</button><button onclick="duplicateSandboxPreset('+x.i+')">Duplicate</button><button onclick="renameSandboxPreset('+x.i+')">Rename</button><button class="delete" onclick="deleteSandboxPreset('+x.i+')">Delete</button></div></div>').join('');
}
function saveSandboxPreset(){
  const input=$('presetName'),name=(input?input.value:'').trim();
  if(!name){toast('Give the preset a generic name');return}
  if(sbPresets.length>=8){toast('Maximum 8 local presets');return}
  sbPresets.unshift({name:name,state:sandboxState(),savedAt:new Date().toISOString()});
  if(input)input.value='';
  savePresets();toast('Preset saved locally');
}
function quickSaveSandboxPreset(){
  if(sbPresets.length>=8){toast('Maximum 8 local presets');return}
  const stamp=new Date().toLocaleString([], {month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}),name=('Lab state · '+stamp).slice(0,36);
  sbPresets.unshift({name,state:sandboxState(),savedAt:new Date().toISOString()});
  savePresets();toast('Current Lab state saved as a preset');
}
function applySandboxState(s){
  const state=normalizePresetState(s);if(!state)return;
  for(const pair of [['fov','sbFov'],['mx','sbFreq'],['phase','sbPhase'],['phaseFov','sbPhaseFov'],['slice','sbSlice'],['nex','sbNex'],['bw','sbBw'],['etl','sbEtl'],['accel','sbAccel'],['pf','sbPf']]){const k=pair[0],id=pair[1];if($(id))$(id).value=state[k]}
  sandboxUpdate();
}
function loadSandboxPreset(i){const p=sbPresets[i];if(!p)return;applySandboxState(p.state);toast('Preset loaded')}
function compareSandboxPreset(i){const p=sbPresets[i];if(!p)return;sbSnapshot={...p.state};try{localStorage.setItem('mrcc_sandbox_snapshot',JSON.stringify(sbSnapshot))}catch(e){}renderSandboxCompare();renderComparisonHistory();setTimeout(()=>jumpParameterLab('parameterCompareWorkbench'),20);toast('Preset set as Snapshot A')}
function deleteSandboxPreset(i){if(i<0||i>=sbPresets.length)return;sbPresets.splice(i,1);savePresets();toast('Preset deleted')}
function duplicateSandboxPreset(i){
  const p=sbPresets[i];if(!p)return;
  if(sbPresets.length>=8){toast('Maximum 8 local presets');return}
  let name=(p.name+' copy').slice(0,36),n=2;
  while(sbPresets.some(x=>x.name.toLowerCase()===name.toLowerCase())){name=(p.name+' copy '+n).slice(0,36);n++}
  sbPresets.splice(i+1,0,{name,state:{...p.state},savedAt:new Date().toISOString()});
  savePresets();toast('Preset duplicated');
}
function renameSandboxPreset(i){
  const p=sbPresets[i];if(!p)return;
  const next=prompt('Rename preset (generic, non-PHI name):',p.name);
  if(next===null)return;
  const name=String(next).trim().slice(0,36);
  if(!name){toast('Preset name cannot be empty');return}
  p.name=name;savePresets();toast('Preset renamed');
}
function exportSandboxPresets(){
  if(!sbPresets.length){toast('No presets to export');return}
  const payload={app:'MR Command Center',type:'sandbox-presets',version:1,exportedAt:new Date().toISOString(),presets:sbPresets.map(p=>({name:p.name,state:p.state,savedAt:p.savedAt||null}))};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='mrcc-sandbox-presets.json';document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Preset library exported');
}
async function importSandboxPresets(event){
  const input=event&&event.target, file=input&&input.files&&input.files[0];
  if(!file)return;
  try{
    const raw=JSON.parse(await file.text());
    const source=Array.isArray(raw)?raw:(raw&&raw.type==='sandbox-presets'&&Array.isArray(raw.presets)?raw.presets:null);
    if(!source)throw new Error('Unsupported preset file');
    const normalized=source.map(normalizePresetEntry).filter(Boolean);
    if(!normalized.length)throw new Error('No valid presets found');
    const sig=p=>p.name.toLowerCase()+'|'+JSON.stringify(p.state);
    const existing=new Set(sbPresets.map(sig));
    let added=0;
    for(const p of normalized){
      if(sbPresets.length>=8)break;
      const key=sig(p);if(existing.has(key))continue;
      sbPresets.push(p);existing.add(key);added++;
    }
    savePresets();
    toast(added?'Imported '+added+' preset'+(added===1?'':'s'):'No new presets imported');
  }catch(e){toast('Preset import failed — check the file')}
  finally{if(input)input.value=''}
}
function sandboxState(){return {fov:+$('sbFov').value,mx:+$('sbFreq').value,phase:+$('sbPhase').value,phaseFov:+$('sbPhaseFov').value,slice:+$('sbSlice').value,nex:+$('sbNex').value,bw:+$('sbBw').value,etl:+$('sbEtl').value,accel:+$('sbAccel').value,pf:+$('sbPf').value}}
function sandboxChangedCount(state,reference=sbBase){
  const s=normalizePresetState(state)||sbBase,r=normalizePresetState(reference)||sbBase;
  return Object.keys(sbBase).filter(key=>Math.abs(Number(s[key])-Number(r[key]))>.001).length;
}
function renderLabContinuity(record=sbCurrentRecord,state){
  const title=$('labContinuityTitle'),meta=$('labContinuityMeta'),current=normalizePresetState(state)||record?.state||sandboxState(),changed=sandboxChangedCount(current);
  const context=activeParameterChallenge?(parameterChallenges[activeParameterChallenge]?.title||'Challenge'):activeParameterGoal?(parameterGoals[activeParameterGoal]?.title||'Goal'):'Free exploration';
  if(title)title.textContent=changed?changed+' control'+(changed===1?'':'s')+' changed · '+context:'Baseline stack · '+context;
  if(meta){
    const saved=record?.savedAt&&validDateString(record.savedAt)?new Date(record.savedAt).toLocaleString([], {month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}):'not saved yet';
    meta.textContent='Auto-saved in this browser · '+saved;
  }
}
function persistSandboxCurrentState(state=sandboxState()){
  if(sandboxAutosaveSuspended)return;
  const normalized=normalizePresetState(state);if(!normalized)return;
  const record={state:normalized,savedAt:new Date().toISOString(),goal:activeParameterGoal||'',challenge:activeParameterChallenge||''};
  sbCurrentRecord=record;
  try{localStorage.setItem('mrcc_sandbox_current',JSON.stringify(record))}catch(e){}
  renderLabContinuity(record,normalized);renderWorkbenchHome(normalized);
}
function queueSandboxAutosave(state=sandboxState()){
  if(sandboxAutosaveSuspended)return;
  if(sandboxAutosaveTimer)clearTimeout(sandboxAutosaveTimer);
  const normalized=normalizePresetState(state);if(!normalized)return;
  renderLabContinuity({...sbCurrentRecord,state:normalized},normalized);
  sandboxAutosaveTimer=setTimeout(()=>{sandboxAutosaveTimer=null;persistSandboxCurrentState(normalized)},180);
}
function restoreSandboxCurrentState(){
  const normalized=normalizeSandboxCurrent(rawCurrentSandbox);
  if(!normalized){if(rawCurrentSandbox)dataRepairCount++;sbCurrentRecord=null;sandboxUpdate('fov');renderLabContinuity(null,sandboxState());return}
  sbCurrentRecord=normalized;
  activeParameterChallenge=normalized.challenge||'';
  activeParameterGoal=normalized.goal||(activeParameterChallenge?parameterChallenges[activeParameterChallenge]?.goal||'':'');
  if(activeParameterChallenge)parameterGoalTargetPct=parameterChallenges[activeParameterChallenge]?.goalPct||parameterGoalTargetPct;
  sandboxAutosaveSuspended=true;applySandboxState(normalized.state);sandboxAutosaveSuspended=false;
  renderParameterGoal();renderParameterChallenge(normalized.state);renderLabContinuity(normalized,normalized.state);renderWorkbenchHome(normalized.state);
}
function sandboxMetrics(s){
  s=normalizePresetState(s)||{...sbBase};
  const px=s.fov/s.mx,py=(s.fov*s.phaseFov)/s.phase,voxel=px*py*s.slice;
  const basePx=sbBase.fov/sbBase.mx,basePy=(sbBase.fov*sbBase.phaseFov)/sbBase.phase,baseVoxel=basePx*basePy*sbBase.slice;
  return {px,py,voxel,snr:(voxel/baseVoxel)*Math.sqrt(s.nex/sbBase.nex)/Math.sqrt(s.bw/sbBase.bw)*Math.sqrt(sbBase.accel/s.accel),time:(s.phase/sbBase.phase)*(s.nex/sbBase.nex)*(sbBase.etl/s.etl)*(sbBase.accel/s.accel)*(s.pf/sbBase.pf),detail:1/((px*py)/(basePx*basePy))};
}
function fmtDelta(v){const p=Math.round((v-1)*100);return (p>0?'+':'')+p+'%'}
function persistSandboxSnapshot(){try{if(sbSnapshot)localStorage.setItem('mrcc_sandbox_snapshot',JSON.stringify(sbSnapshot));else localStorage.removeItem('mrcc_sandbox_snapshot')}catch(e){}}
function captureSandboxSnapshot(){sbSnapshot=sandboxState();persistSandboxSnapshot();renderSandboxCompare();renderComparisonHistory();renderWorkbenchHome();toast('Current workspace set as Snapshot A')}
function restoreSandboxSnapshot(){if(!sbSnapshot){toast('No Snapshot A saved');return}applySandboxState(sbSnapshot);toast('Snapshot A restored to live B')}
function clearSandboxSnapshot(){sbSnapshot=null;persistSandboxSnapshot();renderSandboxCompare();renderComparisonHistory();renderWorkbenchHome();toast('Snapshot A cleared')}
function swapSandboxComparison(){
  if(!sbSnapshot){toast('Set Snapshot A first');return}
  const live=sandboxState(),previousA={...sbSnapshot};
  sbSnapshot={...live};persistSandboxSnapshot();applySandboxState(previousA);
  renderSandboxCompare();renderComparisonHistory();renderWorkbenchHome();toast('Snapshot A and live B swapped');
}
function renderSandboxCompare(){
  const out=$('abCompare'),state=$('compareState'),restore=$('restoreSnapshotBtn'),clear=$('clearSnapshotBtn'),copy=$('copyCompareBtn'),swap=$('compareSwapBtn'),compareRestore=$('compareRestoreBtn'),compareClear=$('compareClearBtn'),aSummary=$('compareASummary'),aMeta=$('compareAMeta'),bSummary=$('compareBSummary'),bMeta=$('compareBMeta');
  const has=!!sbSnapshot;if(restore)restore.disabled=!has;if(clear)clear.disabled=!has;if(copy)copy.disabled=!has;if(swap)swap.disabled=!has;if(compareRestore)compareRestore.disabled=!has;if(compareClear)compareClear.disabled=!has;
  const b=sandboxState(),mb=sandboxMetrics(b),bChanged=sandboxChangedCount(b);
  if(bSummary)bSummary.textContent=presetSummary(b);if(bMeta)bMeta.textContent=bChanged+' control'+(bChanged===1?'':'s')+' changed from baseline · detail '+pct(mb.detail)+' · SNR '+pct(mb.snr)+' · time '+pct(mb.time);
  if(!out||!state)return;
  if(!has){
    state.textContent='No snapshot A';
    if(aSummary)aSummary.textContent='Not set';if(aMeta)aMeta.textContent='Set the live workspace or a saved preset as the comparison reference.';
    out.className='compare-empty';out.innerHTML='<b>Start an A/B experiment.</b><span>Set the current workspace as A, change one or more controls, then read only the differences that matter.</span>';return
  }
  const a=sbSnapshot,ma=sandboxMetrics(a);
  const params=[['FOV',a.fov,b.fov,' mm'],['Freq matrix',a.mx,b.mx,''],['Phase matrix',a.phase,b.phase,''],['Phase FOV',Math.round(a.phaseFov*100),Math.round(b.phaseFov*100),'%'],['Slice',a.slice,b.slice,' mm'],['NEX',a.nex,b.nex,''],['BW',a.bw,b.bw,'×'],['ETL',a.etl,b.etl,''],['R',a.accel,b.accel,'×'],['PF',Math.round(a.pf*100),Math.round(b.pf*100),'%']];
  const changedParams=params.filter(x=>Math.abs(Number(x[1])-Number(x[2]))>.001);
  state.textContent=changedParams.length+' control'+(changedParams.length===1?'':'s')+' differ';out.className='';
  if(aSummary)aSummary.textContent=presetSummary(a);if(aMeta)aMeta.textContent='Reference · detail '+pct(ma.detail)+' · SNR '+pct(ma.snr)+' · time '+pct(ma.time);
  const cards=[
    ['Spatial detail',pct(ma.detail),pct(mb.detail),fmtDelta(mb.detail/ma.detail)],
    ['SNR proxy',pct(ma.snr),pct(mb.snr),fmtDelta(mb.snr/ma.snr)],
    ['Acq. time',pct(ma.time),pct(mb.time),fmtDelta(mb.time/ma.time)],
    ['Voxel volume',ma.voxel.toFixed(2),mb.voxel.toFixed(2),fmtDelta(mb.voxel/ma.voxel)]
  ];
  out.innerHTML='<div class="compare-diff-head"><b>'+changedParams.length+' of 10 controls differ</b><span>Only changed controls are shown below.</span></div><div class="abgrid">'+cards.map(x=>'<div class="abcard"><div class="ablab">'+x[0]+'</div><div class="abvals"><span>A <b>'+x[1]+'</b></span><span>B <b>'+x[2]+'</b></span></div><div class="abdelta">B vs A '+x[3]+'</div></div>').join('')+'</div><div class="param-deltas">'+(changedParams.length?changedParams.map(x=>'<span class="param-delta">'+x[0]+': '+x[1]+x[3]+' → '+x[2]+x[3]+'</span>').join(''):'<span class="compare-identical">A and B currently use the same parameter values.</span>')+'</div>';
}
function comparisonRecord(label,a,b){
  const ma=sandboxMetrics(a),mb=sandboxMetrics(b);
  return {label,a:{...a},b:{...b},savedAt:new Date().toISOString(),deltas:{detail:fmtDelta(mb.detail/ma.detail),snr:fmtDelta(mb.snr/ma.snr),time:fmtDelta(mb.time/ma.time),voxel:fmtDelta(mb.voxel/ma.voxel)}};
}
function comparisonText(r){
  const ma=sandboxMetrics(r.a),mb=sandboxMetrics(r.b);
  return ['MR Command Center — Saved A/B parameter comparison','Educational model only; not a protocol prescription.','Label: '+r.label,'A: '+sandboxStateText(r.a),'B: '+sandboxStateText(r.b),'B vs A: spatial detail '+fmtDelta(mb.detail/ma.detail)+' | SNR proxy '+fmtDelta(mb.snr/ma.snr)+' | sampling time '+fmtDelta(mb.time/ma.time)+' | voxel volume '+fmtDelta(mb.voxel/ma.voxel)].join('\n');
}
function saveComparisonHistory(){
  if(!sbSnapshot){toast('Save or load Snapshot A first');return}
  const input=$('historyName'),label=(input&&input.value.trim())||('Comparison '+(comparisonHistory.length+1));
  comparisonHistory.unshift(comparisonRecord(label.slice(0,36),sbSnapshot,sandboxState()));
  comparisonHistory=comparisonHistory.slice(0,10);
  try{localStorage.setItem('mrcc_compare_history',JSON.stringify(comparisonHistory))}catch(e){}
  if(input)input.value='';
  renderComparisonHistory();toast('Comparison saved locally');
}
function renderComparisonHistory(){
  if(typeof renderWorkbenchHome==='function')renderWorkbenchHome();if(typeof renderLabsHome==='function')setTimeout(renderLabsHome,0);
  const list=$('comparisonHistoryList'),count=$('historyCount'),save=$('saveHistoryBtn');
  if(count)count.textContent=comparisonHistory.length+' saved';
  if(save)save.disabled=!sbSnapshot;
  if(!list)return;
  if(!comparisonHistory.length){list.innerHTML='<div class="preset-empty">No saved comparisons yet.</div>';return}
  list.innerHTML=comparisonHistory.map((r,i)=>'<div class="history-row"><div class="history-copy"><b>'+escapeHtml(r.label||('Comparison '+(i+1)))+'</b><small>'+escapeHtml(presetSummary(r.a))+' → '+escapeHtml(presetSummary(r.b))+'</small><div class="history-deltas"><span>Detail '+escapeHtml(r.deltas?.detail||'—')+'</span><span>SNR '+escapeHtml(r.deltas?.snr||'—')+'</span><span>Time '+escapeHtml(r.deltas?.time||'—')+'</span><span>Voxel '+escapeHtml(r.deltas?.voxel||'—')+'</span></div></div><div class="history-actions"><button onclick="restoreComparisonHistory('+i+')">Restore</button><button onclick="copyComparisonHistory('+i+')">Copy</button><button class="delete" onclick="deleteComparisonHistory('+i+')">Delete</button></div></div>').join('');
}
function restoreComparisonHistory(i){
  const r=comparisonHistory[i];if(!r)return;
  sbSnapshot={...r.a};try{localStorage.setItem('mrcc_sandbox_snapshot',JSON.stringify(sbSnapshot))}catch(e){}
  applySandboxState(r.b);renderSandboxCompare();renderComparisonHistory();toast('Comparison restored');
}
async function copyComparisonHistory(i){
  const r=comparisonHistory[i];if(!r)return;
  try{await navigator.clipboard.writeText(comparisonText(r));toast('Saved comparison copied')}catch(e){toast('Clipboard unavailable in this browser')}
}
function deleteComparisonHistory(i){
  if(i<0||i>=comparisonHistory.length)return;
  comparisonHistory.splice(i,1);try{localStorage.setItem('mrcc_compare_history',JSON.stringify(comparisonHistory))}catch(e){}
  renderComparisonHistory();toast('Comparison deleted');
}
async function copySandboxCompare(){
  if(!sbSnapshot){toast('Save Snapshot A first');return}
  const b=sandboxState(),a=sbSnapshot,ma=sandboxMetrics(a),mb=sandboxMetrics(b);
  const text=['MR Command Center — Parameter Lab A/B comparison','Educational model only; not a protocol prescription.','A: '+sandboxStateText(a),'B: '+sandboxStateText(b),'B vs A: spatial detail '+fmtDelta(mb.detail/ma.detail)+' | SNR proxy '+fmtDelta(mb.snr/ma.snr)+' | sampling time '+fmtDelta(mb.time/ma.time)+' | voxel volume '+fmtDelta(mb.voxel/ma.voxel)].join('\n');
  try{await navigator.clipboard.writeText(text);toast('Comparison copied')}catch(e){toast('Clipboard unavailable in this browser')}
}
function setBalanceBar(id,ratio){
  const el=$(id); if(!el)return; const r=Math.max(.25,Math.min(2,ratio));
  const pos=50+(r-1)*33.333; const left=Math.min(50,pos), right=Math.max(50,pos);
  el.style.left=left+'%'; el.style.width=Math.max(1,right-left)+'%';
}
function ledgerItem(param,primary,secondary){return `<div class="impact-item"><div class="impact-param">${param}</div><div class="impact-copy">${primary}<br><span>${secondary}</span></div></div>`}

const parameterChallenges={
  faster:{title:'Faster, preserve quality',copy:'Reduce the simplified sampling-time proxy while keeping modeled SNR and spatial detail above the guardrails.',goal:'time',goalPct:20,minChanges:2,start:{...sbBase},constraints:[{metric:'time',op:'max',ratio:.80,label:'Sampling time',target:'≤ 80% of start'},{metric:'snr',op:'min',ratio:.85,label:'SNR proxy',target:'≥ 85% of start'},{metric:'detail',op:'min',ratio:.90,label:'Spatial detail',target:'≥ 90% of start'}]},
  detail:{title:'More detail, bounded cost',copy:'Increase the spatial-detail index while limiting modeled signal loss and extra sampling burden.',goal:'detail',goalPct:20,minChanges:2,start:{...sbBase},constraints:[{metric:'detail',op:'min',ratio:1.20,label:'Spatial detail',target:'≥ 120% of start'},{metric:'snr',op:'min',ratio:.75,label:'SNR proxy',target:'≥ 75% of start'},{metric:'time',op:'max',ratio:1.20,label:'Sampling time',target:'≤ 120% of start'}]},
  signal:{title:'Recover signal efficiently',copy:'Start from a generic signal-poor stack and raise the SNR proxy without substantially increasing time or sacrificing in-plane detail.',goal:'snr',goalPct:20,minChanges:2,start:{...sbBase,bw:1.5,accel:2},constraints:[{metric:'snr',op:'min',ratio:1.20,label:'SNR proxy',target:'≥ 120% of start'},{metric:'time',op:'max',ratio:1.25,label:'Sampling time',target:'≤ 125% of start'},{metric:'detail',op:'min',ratio:.95,label:'Spatial detail',target:'≥ 95% of start'}]},
  balanced:{title:'Balanced optimization',copy:'Improve modeled time and spatial detail together while keeping the SNR proxy inside a defined guardrail.',goal:'time',goalPct:20,minChanges:2,start:{...sbBase},constraints:[{metric:'time',op:'max',ratio:.80,label:'Sampling time',target:'≤ 80% of start'},{metric:'detail',op:'min',ratio:1.10,label:'Spatial detail',target:'≥ 110% of start'},{metric:'snr',op:'min',ratio:.78,label:'SNR proxy',target:'≥ 78% of start'}]}
};
let activeParameterChallenge='';
function challengeDefinition(){return parameterChallenges[activeParameterChallenge]||null}
function parameterReferenceState(){const c=challengeDefinition();return c?c.start:sbBase}
function challengeMetricRatio(metric,state){
  const c=challengeDefinition();if(!c)return 1;
  const now=sandboxMetrics(state||sandboxState()),start=sandboxMetrics(c.start);
  return (Number(now[metric])||0)/(Number(start[metric])||1);
}
function challengeConstraintStatus(constraint,state){
  const ratio=challengeMetricRatio(constraint.metric,state),met=constraint.op==='max'?ratio<=constraint.ratio:ratio>=constraint.ratio;
  return {ratio,met};
}
function challengeChangedControlCount(start,state){
  const current=state||sandboxState();
  return Object.keys(sbBase).filter(key=>Math.abs(Number(current[key])-Number(start[key]))>.001).length;
}
function renderParameterChallenge(state){
  const panel=$('parameterChallengePanel'),c=challengeDefinition();if(panel)panel.hidden=!c;if(!c)return;
  const title=$('parameterChallengeTitle'),copy=$('parameterChallengeCopy'),ref=$('parameterChallengeReference'),wrap=$('parameterChallengeConstraints'),pill=$('parameterChallengeState');
  if(title)title.textContent=c.title;if(copy)copy.textContent=c.copy;
  const sm=sandboxMetrics(c.start);
  if(ref)ref.textContent='Reference stack: '+presetSummary(c.start)+' · model start: detail '+pct(sm.detail)+' · SNR '+pct(sm.snr)+' · time '+pct(sm.time);
  const statuses=c.constraints.map(x=>({...x,...challengeConstraintStatus(x,state)})),moves=challengeChangedControlCount(c.start,state),moveStatus={label:'Parameter moves',target:'Use ≥ '+c.minChanges+' controls',met:moves>=c.minChanges,moves},all=[...statuses,moveStatus],met=all.filter(x=>x.met).length;
  if(wrap)wrap.innerHTML=all.map(x=>'<div class="challenge-constraint '+(x.met?'met':'miss')+'"><small>'+escapeHtml(x.label)+'</small><b>'+(x.met?'Constraint met':'Keep working')+'</b><span>'+(x.moves!==undefined?escapeHtml(x.target)+' · current '+x.moves:escapeHtml(x.target)+' · current '+pct(x.ratio)+' of challenge start')+'</span></div>').join('');
  if(pill){pill.textContent=met+'/'+all.length+' constraints'+(met===all.length?' satisfied':'');pill.classList.toggle('complete',met===all.length)}
}
function startParameterChallenge(id){
  const c=parameterChallenges[id];if(!c)return;
  activeParameterChallenge=id;activeParameterGoal=c.goal;parameterGoalTargetPct=c.goalPct;
  applySandboxState(c.start);renderParameterGoal();renderParameterChallenge();persistSandboxCurrentState();
}
function openParameterChallenge(id){
  openWorkspaceView('challenges');setTimeout(()=>{startParameterChallenge(id);$('parameterChallengePanel')?.scrollIntoView({behavior:uiPrefs.reduceMotion?'auto':'smooth',block:'start'})},60);
}
function restartParameterChallenge(){const c=challengeDefinition();if(!c)return;applySandboxState(c.start);renderParameterChallenge();toast('Challenge starting stack restored')}
function exitParameterChallenge(){activeParameterChallenge='';activeParameterGoal='';renderParameterChallenge();renderParameterGoal();persistSandboxCurrentState();toast('Challenge closed')}

const parameterGoals={
  time:{title:'Reduce scan burden',copy:'Explore phase-encode burden, averages, echo-train efficiency, acceleration, and partial Fourier while watching modeled SNR and detail costs.',levers:['sbPhase','sbNex','sbEtl','sbAccel','sbPf']},
  snr:{title:'Improve SNR efficiency',copy:'Explore voxel volume, averages, bandwidth, and acceleration while watching the modeled time and spatial-detail tradeoffs.',levers:['sbFov','sbFreq','sbPhase','sbSlice','sbNex','sbBw','sbAccel']},
  detail:{title:'Increase spatial detail',copy:'Explore FOV, matrix, phase coverage, and slice thickness while watching voxel signal and sampling burden.',levers:['sbFov','sbFreq','sbPhase','sbPhaseFov','sbSlice']},
  distortion:{title:'Reduce distortion sensitivity',copy:'Explore receiver bandwidth and voxel dimensions as generic off-resonance levers. This goal stays directional because the Lab does not claim a universal distortion equation.',levers:['sbBw','sbFov','sbFreq','sbPhase','sbSlice']}
};
let activeParameterGoal='';
let parameterGoalTargetPct=20;
function setGoalCardState(el,state){if(!el)return;el.classList.remove('good','warn','bad');if(state)el.classList.add(state)}
function goalCost(items){
  const ranked=items.filter(x=>x.mag>.015).sort((a,b)=>b.mag-a.mag);
  return ranked[0]||null;
}
function parameterGoalFeedback(state,metrics){
  const s=state||sandboxState(),m=metrics||sandboxMetrics(s),reference=parameterReferenceState(),ref=sandboxMetrics(reference),target=parameterGoalTargetPct/100;
  if(activeParameterGoal==='time'){
    const timeRatio=m.time/ref.time,snrRatio=m.snr/ref.snr,detailRatio=m.detail/ref.detail,targetRatio=1-target,improvement=1-timeRatio,progress=target?improvement/target:0,cost=goalCost([{name:'SNR proxy',mag:Math.max(0,1-snrRatio),copy:pct(snrRatio)+' of reference'},{name:'Spatial detail',mag:Math.max(0,1-detailRatio),copy:pct(detailRatio)+' of reference'}]);
    return {metric:pct(timeRatio),metricLabel:'sampling-time proxy · target ≤ '+pct(targetRatio)+' of reference',progress,goalState:timeRatio<=targetRatio?'Target met':improvement>0?'Toward goal':improvement<0?'Away from goal':'At reference',progressCopy:timeRatio<=targetRatio?'The simplified time proxy has reached this teaching target.':improvement>0?Math.round(improvement*100)+'% lower than reference; '+Math.max(0,Math.round((target-improvement)*100))+' points remain to the teaching target.':improvement<0?Math.round(Math.abs(improvement)*100)+'% higher than reference.':'Move a highlighted control to reduce the simplified sampling burden.',cost};
  }
  if(activeParameterGoal==='snr'){
    const snrRatio=m.snr/ref.snr,timeRatio=m.time/ref.time,detailRatio=m.detail/ref.detail,targetRatio=1+target,improvement=snrRatio-1,progress=target?improvement/target:0,cost=goalCost([{name:'Sampling time',mag:Math.max(0,timeRatio-1),copy:pct(timeRatio)+' of reference'},{name:'Spatial detail',mag:Math.max(0,1-detailRatio),copy:pct(detailRatio)+' of reference'}]);
    return {metric:pct(snrRatio),metricLabel:'SNR proxy · target ≥ '+pct(targetRatio)+' of reference',progress,goalState:snrRatio>=targetRatio?'Target met':improvement>0?'Toward goal':improvement<0?'Away from goal':'At reference',progressCopy:snrRatio>=targetRatio?'The simplified SNR proxy has reached this teaching target.':improvement>0?Math.round(improvement*100)+'% above reference; '+Math.max(0,Math.round((target-improvement)*100))+' points remain to the teaching target.':improvement<0?Math.round(Math.abs(improvement)*100)+'% below reference.':'Move a highlighted control to improve the simplified SNR proxy.',cost};
  }
  if(activeParameterGoal==='detail'){
    const detailRatio=m.detail/ref.detail,snrRatio=m.snr/ref.snr,timeRatio=m.time/ref.time,targetRatio=1+target,improvement=detailRatio-1,progress=target?improvement/target:0,cost=goalCost([{name:'SNR proxy',mag:Math.max(0,1-snrRatio),copy:pct(snrRatio)+' of reference'},{name:'Sampling time',mag:Math.max(0,timeRatio-1),copy:pct(timeRatio)+' of reference'}]);
    return {metric:pct(detailRatio),metricLabel:'spatial-detail index · target ≥ '+pct(targetRatio)+' of reference',progress,goalState:detailRatio>=targetRatio?'Target met':improvement>0?'Toward goal':improvement<0?'Away from goal':'At reference',progressCopy:detailRatio>=targetRatio?'The spatial-detail index has reached this teaching target.':improvement>0?Math.round(improvement*100)+'% above reference; '+Math.max(0,Math.round((target-improvement)*100))+' points remain to the teaching target.':improvement<0?Math.round(Math.abs(improvement)*100)+'% below reference.':'Move a highlighted control to increase the modeled spatial-detail index.',cost};
  }
  if(activeParameterGoal==='distortion'){
    const bwRatio=s.bw/reference.bw,voxelRatio=m.voxel/ref.voxel;
    const helpful=(bwRatio>1.02?1:0)+(voxelRatio<.98?1:0),opposing=(bwRatio<.98?1:0)+(voxelRatio>1.02?1:0);
    const goalState=helpful>opposing?'Toward goal':opposing>helpful?'Away from goal':helpful&&opposing?'Mixed':'At baseline';
    const progress=goalState==='Toward goal'?1:goalState==='Away from goal'?-1:0;
    const cost=goalCost([{name:'SNR proxy',mag:Math.max(0,1-m.snr/ref.snr),copy:pct(m.snr/ref.snr)+' of reference'},{name:'Sampling time',mag:Math.max(0,m.time/ref.time-1),copy:pct(m.time/ref.time)+' of reference'}]);
    return {metric:'BW '+pct(bwRatio)+' · voxel '+pct(voxelRatio),metricLabel:'directional indicators only · higher BW / smaller voxel generally reduce sensitivity',progress,goalState,progressCopy:goalState==='Toward goal'?'Current changes point in the generic lower-sensitivity direction.':goalState==='Away from goal'?'Current changes point in the generic higher-sensitivity direction.':goalState==='Mixed'?'The generic indicators point in different directions.':'Bandwidth and voxel volume are at baseline.',cost,directional:true};
  }
  return null;
}
function renderParameterGoalFeedback(state,metrics){
  const tracker=$('parameterGoalTracker'),targetSelect=$('parameterGoalTarget'),hint=$('parameterGoalTargetHint'),feedback=parameterGoalFeedback(state,metrics);
  if(tracker)tracker.hidden=!feedback;
  if(!feedback)return;
  if(targetSelect){targetSelect.value=String(parameterGoalTargetPct);targetSelect.disabled=!!feedback.directional}
  if(hint)hint.textContent=feedback.directional?'Directional only — no universal numeric distortion target is claimed.':(activeParameterChallenge?'Relative teaching target versus the challenge starting stack.':'Relative teaching target versus the baseline model.');
  if($('parameterGoalMetric'))$('parameterGoalMetric').textContent=feedback.metric;
  if($('parameterGoalMetricLabel'))$('parameterGoalMetricLabel').textContent=feedback.metricLabel;
  if($('parameterGoalProgress'))$('parameterGoalProgress').textContent=feedback.goalState;
  if($('parameterGoalProgressCopy'))$('parameterGoalProgressCopy').textContent=feedback.progressCopy;
  const progressCard=$('parameterGoalProgressCard'),metricCard=$('parameterGoalMetricCard'),costCard=$('parameterGoalCostCard'),bar=$('parameterGoalProgressBar');
  const stateClass=feedback.goalState==='Target met'||feedback.goalState==='Toward goal'?'good':feedback.goalState==='Away from goal'?'bad':feedback.goalState==='Mixed'?'warn':'';
  setGoalCardState(progressCard,stateClass);setGoalCardState(metricCard,stateClass);
  if(bar){const clamped=Math.max(-1,Math.min(1,feedback.progress));bar.style.width=Math.round(Math.abs(clamped)*100)+'%';bar.classList.toggle('reverse',clamped<0)}
  if(feedback.cost){if($('parameterGoalCost'))$('parameterGoalCost').textContent=feedback.cost.name;if($('parameterGoalCostCopy'))$('parameterGoalCostCopy').textContent=feedback.cost.copy;setGoalCardState(costCard,'warn')}
  else{if($('parameterGoalCost'))$('parameterGoalCost').textContent='No major modeled cost';if($('parameterGoalCostCopy'))$('parameterGoalCostCopy').textContent='No opposing SNR/detail/time tradeoff exceeds the display threshold.';setGoalCardState(costCard,'good')}
}
function renderParameterGoal(){
  const goal=parameterGoals[activeParameterGoal],title=$('parameterGoalTitle'),copy=$('parameterGoalCopy');
  document.querySelectorAll('[data-parameter-goal]').forEach(b=>b.classList.toggle('active',!!goal&&b.dataset.parameterGoal===activeParameterGoal));
  document.querySelectorAll('#paramControlsCard .sliderline').forEach(row=>{const input=row.querySelector('input,select');row.classList.toggle('goal-lever',!!goal&&!!input&&goal.levers.includes(input.id))});
  if(title)title.textContent=goal?goal.title:'Explore freely';
  if(copy)copy.textContent=goal?goal.copy:'No optimization goal is active. Change any control and use the tradeoff map, impact ledger, presets, and A/B comparison freely.';
  renderParameterGoalFeedback();
}
function setParameterGoalTarget(value){const n=Number(value);parameterGoalTargetPct=[10,20,30].includes(n)?n:20;renderParameterGoalFeedback()}
function selectParameterGoal(id){activeParameterGoal=parameterGoals[id]?id:'';activeParameterChallenge='';renderParameterGoal();persistSandboxCurrentState()}
function clearParameterGoal(){activeParameterGoal='';activeParameterChallenge='';renderParameterGoal();renderParameterChallenge();persistSandboxCurrentState()}
function openParameterGoal(id){
  go('sandbox');setTimeout(()=>{selectParameterGoal(id);$('parameterGoalPanel')?.scrollIntoView({behavior:uiPrefs.reduceMotion?'auto':'smooth',block:'start'})},40);
}
function openParameterWorkspace(mode='lab'){
  if(['presets','compare','reference'].includes(mode)){openWorkspaceView(mode);return}
  go('sandbox');setTimeout(()=>{
    if(mode==='model')jumpParameterLab('paramModelCard');
    else jumpParameterLab('parameterGoalPanel');
  },40);
}
function openSavedPreset(i){if(!sbPresets[i])return;applySandboxState(sbPresets[i].state);go('sandbox');setTimeout(()=>jumpParameterLab('paramModelCard'),40)}
function renderWorkbenchHome(state){
  if(!$('workbenchLaunch'))return;
  const current=state||sandboxState(),m=sandboxMetrics(current);
  const detail=$('homeLabDetail'),snr=$('homeLabSnr'),time=$('homeLabTime'),stack=$('homeLabStack');
  if(detail)detail.textContent=pct(m.detail);if(snr)snr.textContent=pct(m.snr);if(time)time.textContent=pct(m.time);
  if(stack)stack.textContent=presetSummary(current);
  const pc=$('homePresetCount'),cc=$('homeComparisonCount'),plist=$('homePresetList'),snap=$('homeSnapshotState');
  if(pc)pc.textContent=sbPresets.length;if(cc)cc.textContent=comparisonHistory.length;
  if(plist)plist.innerHTML=sbPresets.length?sbPresets.slice(0,3).map((p,i)=>'<button type="button" onclick="openSavedPreset('+i+')" title="'+escapeHtml(presetSummary(p.state))+'">'+escapeHtml(p.name)+'</button>').join(''):'<span>No saved setups yet. Save reusable generic stacks in Parameter Lab.</span>';
  if(snap)snap.textContent=sbSnapshot?'Snapshot A is ready. Open comparison mode, change the live B state, and inspect the deltas.':'No Snapshot A saved yet. Save a state, change the controls, and compare B against A.';
}
function jumpParameterLab(id,openDetails=false){const el=$(id);if(!el)return;if(openDetails&&'open' in el)el.open=true;el.scrollIntoView({behavior:uiPrefs.reduceMotion?'auto':'smooth',block:'start'})}
function openParameterReferenceGroup(id){
  const group=$(id);if(!group)return;
  document.querySelectorAll('#parameterReference .param-ref-group').forEach(x=>{x.open=x===group});
  group.open=true;
  group.scrollIntoView({behavior:uiPrefs.reduceMotion?'auto':'smooth',block:'center'});
}
const parameterLens={
fov:{title:'Field of view',primary:'Changes in-plane pixel dimensions when matrix is held constant.',trade:'Smaller FOV improves spatial sampling but reduces voxel signal and can increase wrap risk if anatomy extends beyond coverage.',model:'Pixel size, voxel volume, spatial-detail index, and SNR proxy.',caution:'Coverage adequacy, oversampling, gradient limits, minimum TE, and diagnostic acceptability remain scanner / sequence dependent.'},
mx:{title:'Frequency matrix',primary:'Changes the number of readout samples across the frequency-encoding FOV.',trade:'More frequency samples shrink the frequency-direction pixel and voxel, improving sampling while reducing per-voxel signal.',model:'Frequency pixel size, voxel volume, spatial-detail index, and SNR proxy.',caution:'Readout duration, bandwidth-per-pixel coupling, gradient demand, and minimum TE are not modeled.'},
phase:{title:'Phase matrix',primary:'Changes phase-direction spatial sampling and the number of modeled phase encodes.',trade:'More phase encodes shrink the phase pixel and improve sampling, with lower voxel signal and a longer simplified acquisition burden.',model:'Phase pixel size, voxel volume, detail, SNR proxy, and sampling-time proxy.',caution:'Partial Fourier, acceleration reference lines, segmentation, and vendor phase-resolution conventions can change the real timing.'},
phaseFov:{title:'Phase field of view',primary:'Changes phase-direction coverage relative to the frequency-direction FOV.',trade:'Lower phase FOV can shrink the phase pixel at a fixed matrix, but increases aliasing risk when anatomy extends outside the sampled field.',model:'Phase pixel size, voxel volume, detail, and SNR proxy; time is intentionally unchanged.',caution:'Scanner implementations may couple phase FOV, phase resolution, oversampling, and reconstruction differently.'},
slice:{title:'Slice thickness',primary:'Changes through-plane voxel dimension.',trade:'Thicker slices increase voxel signal but reduce through-plane spatial detail; thinner slices do the opposite.',model:'Voxel volume and SNR proxy.',caution:'Slice count, cross-talk, gap, RF profile, 3D partitions, and total coverage are not included.'},
nex:{title:'NEX / averages',primary:'Repeats sampling to improve averaging efficiency.',trade:'SNR improves approximately with √NEX, while simplified acquisition burden rises roughly linearly.',model:'SNR proxy and sampling-time proxy.',caution:'Averages may interact with motion, gating, reconstruction, and sequence architecture.'},
bw:{title:'Receiver bandwidth',primary:'Changes the frequency range sampled per unit readout.',trade:'Higher bandwidth generally reduces chemical-shift displacement and susceptibility distortion but lowers SNR efficiency.',model:'Idealized SNR proxy plus qualitative artifact direction.',caution:'Minimum TE, readout duration, gradient demand, fat-water shift, and exact vendor units are not calculated.'},
etl:{title:'Echo train length / turbo factor',primary:'Changes how many echoes contribute within each excitation / train in compatible sequence families.',trade:'Longer trains can shorten FSE/TSE acquisition burden but may increase blurring and alter effective contrast.',model:'Sampling-time proxy plus qualitative train warning.',caution:'Echo spacing, refocusing flip-angle trains, effective TE, SAR/RF behavior, and sequence family are not modeled.'},
accel:{title:'Parallel acceleration',primary:'Reduces phase-encoding burden by reconstructing undersampled data using coil sensitivity information.',trade:'Higher R can shorten acquisition but carries an SNR penalty and can increase reconstruction / residual aliasing sensitivity.',model:'Time divided by R and an idealized SNR factor of 1/√R.',caution:'Real SNR also depends on coil geometry / g-factor, reference lines, effective acceleration, and reconstruction.'},
pf:{title:'Partial Fourier',primary:'Acquires only a fraction of k-space and reconstructs the missing portion.',trade:'Lower Fourier fraction can reduce acquisition burden, but reconstruction becomes more dependent on phase consistency and noise / artifact behavior.',model:'Sampling-time proxy only.',caution:'SNR and artifact behavior are deliberately not assigned a universal formula because they depend on acquisition and reconstruction.'}
};
function renderParameterLens(key){
  const p=parameterLens[key]||parameterLens.fov;
  if($('sbParamLensTitle'))$('sbParamLensTitle').textContent=p.title;
  if($('sbParamLensPrimary'))$('sbParamLensPrimary').textContent=p.primary;
  if($('sbParamLensTrade'))$('sbParamLensTrade').textContent=p.trade;
  if($('sbParamLensModel'))$('sbParamLensModel').textContent=p.model;
  if($('sbParamLensCaution'))$('sbParamLensCaution').textContent=p.caution;
}

const parameterInspectorMeta={
fov:{label:'Field of view',short:'FOV',unit:' mm',mechanism:'Changes both in-plane pixel dimensions when matrix is held constant.'},
mx:{label:'Frequency matrix',short:'Freq matrix',unit:'',mechanism:'Changes readout-direction pixel size at fixed FOV.'},
phase:{label:'Phase matrix',short:'Phase matrix',unit:'',mechanism:'Changes phase-direction pixel size and modeled phase-encode burden.'},
phaseFov:{label:'Phase field of view',short:'Phase FOV',unit:'%',mechanism:'Changes phase-direction coverage and pixel size at fixed phase matrix.'},
slice:{label:'Slice thickness',short:'Slice',unit:' mm',mechanism:'Changes through-plane voxel dimension.'},
nex:{label:'NEX / averages',short:'NEX',unit:'×',mechanism:'Changes averaging contribution and modeled acquisition burden.'},
bw:{label:'Receiver bandwidth',short:'Bandwidth',unit:'×',mechanism:'Changes modeled SNR efficiency and qualitative off-resonance direction.'},
etl:{label:'Echo train length',short:'ETL',unit:'',mechanism:'Changes the simplified FSE/TSE sampling burden.'},
accel:{label:'Parallel acceleration',short:'Acceleration',unit:'×',mechanism:'Changes modeled phase-encoding burden and idealized acceleration SNR penalty.'},
pf:{label:'Partial Fourier',short:'Fourier fraction',unit:'%',mechanism:'Changes the fraction of modeled phase sampling acquired.'}
};
let activeParameterInspector='fov';
function parameterFormatValue(key,value){
 if(key==='phaseFov'||key==='pf')return Math.round(Number(value)*100)+'%';
 if(key==='slice')return Number(value).toFixed(1)+' mm';
 if(key==='nex'||key==='bw'||key==='accel')return Number(value).toFixed(1)+'×';
 if(key==='fov')return Math.round(Number(value))+' mm';
 return String(Math.round(Number(value)*1000)/1000);
}
function parameterRatioChip(label,ratio){
 const delta=Math.round((ratio-1)*100),cls=delta>1?'up':delta<-1?'down':'';
 return '<span class="parameter-metric-chip '+cls+'"><b>'+escapeHtml(label)+'</b> '+(delta>0?'+':'')+delta+'%</span>';
}
function parameterFactorRow(label,ratio){
 const delta=Math.round((ratio-1)*100),cls=delta>1?'up':delta<-1?'down':'',copy=pct(ratio)+' · '+(delta>0?'+':'')+delta+'%';
 return '<div class="parameter-factor"><span>'+escapeHtml(label)+'</span><b class="'+cls+'">'+escapeHtml(copy)+'</b></div>';
}
function parameterIsolatedState(key,state=sandboxState()){
 const isolated={...sbBase};if(Object.prototype.hasOwnProperty.call(isolated,key))isolated[key]=state[key];return isolated;
}
function parameterInteractionCopy(key,isolatedMetrics,fullMetrics){
 const iso={detail:isolatedMetrics.detail,snr:isolatedMetrics.snr,time:isolatedMetrics.time},full={detail:fullMetrics.detail,snr:fullMetrics.snr,time:fullMetrics.time};
 const isoNeutral=Object.values(iso).every(v=>Math.abs(v-1)<.015),fullNeutral=Object.values(full).every(v=>Math.abs(v-1)<.015);
 if(isoNeutral&&!fullNeutral)return 'This selected lever is neutral; other changed controls are driving the displayed stack departures.';
 if(isoNeutral&&fullNeutral)return 'The selected lever and the full stack are effectively at baseline in the displayed proxies.';
 const parts=[];
 for(const [metric,label] of [['detail','detail'],['snr','SNR'],['time','time']]){
   const i=Math.abs(Math.log(Math.max(.001,iso[metric]))),f=Math.abs(Math.log(Math.max(.001,full[metric])));
   if(f>i+.06)parts.push('other controls reinforce the '+label+' departure');
   else if(f+.06<i)parts.push('other controls offset part of the '+label+' departure');
 }
 return parts.length?[...new Set(parts)].slice(0,2).join('; ')+'.':'The other current controls do not strongly reinforce or offset this lever in the displayed detail/SNR/time proxies.';
}
function renderParameterDeepDive(changed){
 if(changed&&parameterInspectorMeta[changed])activeParameterInspector=changed;
 const key=activeParameterInspector,meta=parameterInspectorMeta[key],s=sandboxState(),isolated=parameterIsolatedState(key,s),mi=sandboxMetrics(isolated),mf=sandboxMetrics(s),base=sandboxMetrics(sbBase);
 if($('parameterInspectorSelect'))$('parameterInspectorSelect').value=key;
 if($('parameterInspectorName'))$('parameterInspectorName').textContent=meta.label;
 if($('parameterInspectorBase'))$('parameterInspectorBase').textContent=parameterFormatValue(key,sbBase[key]);
 if($('parameterInspectorCurrent'))$('parameterInspectorCurrent').textContent=parameterFormatValue(key,s[key]);
 if($('parameterInspectorPrimary'))$('parameterInspectorPrimary').textContent=(parameterLens[key]||parameterLens.fov).primary;
 if($('parameterIsolatedMetrics'))$('parameterIsolatedMetrics').innerHTML=parameterRatioChip('Detail',mi.detail/base.detail)+parameterRatioChip('SNR',mi.snr/base.snr)+parameterRatioChip('Time',mi.time/base.time);
 if($('parameterFullMetrics'))$('parameterFullMetrics').innerHTML=parameterRatioChip('Detail',mf.detail/base.detail)+parameterRatioChip('SNR',mf.snr/base.snr)+parameterRatioChip('Time',mf.time/base.time);
 const unchanged=Math.abs(Number(s[key])-Number(sbBase[key]))<.001;
 if($('parameterIsolatedCopy'))$('parameterIsolatedCopy').textContent=unchanged?'This selected control is at baseline, so its isolated effect is neutral.':'This view resets every other control to baseline so you can see what this lever contributes by itself.';
 if($('parameterStackInteraction'))$('parameterStackInteraction').textContent=parameterInteractionCopy(key,mi,mf);
 if($('parameterCauseNode'))$('parameterCauseNode').textContent=meta.short+' '+(unchanged?'at baseline':parameterFormatValue(key,sbBase[key])+' → '+parameterFormatValue(key,s[key]));
 if($('parameterMechanismNode'))$('parameterMechanismNode').textContent=meta.mechanism;
 const effects=[['detail',mi.detail],['SNR',mi.snr],['time',mi.time]].map(([n,r])=>[n,Math.round((r-1)*100)]).filter(x=>Math.abs(x[1])>=1);
 if($('parameterEffectNode'))$('parameterEffectNode').textContent=effects.length?effects.map(([n,d])=>n+' '+(d>0?'↑ ':'↓ ')+Math.abs(d)+'%').join(' · ')+' in isolation':'Detail, SNR, and time remain effectively at baseline in isolation';
 renderParameterEquations(s,mf);
}
function setParameterInspector(key){if(!parameterInspectorMeta[key])return;activeParameterInspector=key;renderParameterDeepDive()}
function renderParameterEquations(state=sandboxState(),metrics=sandboxMetrics(state)){
 const s=state,m=metrics,base=sandboxMetrics(sbBase),voxelRatio=m.voxel/base.voxel,nexFactor=Math.sqrt(s.nex/sbBase.nex),bwFactor=Math.sqrt(sbBase.bw/s.bw),accelSnr=Math.sqrt(sbBase.accel/s.accel);
 const phaseFactor=s.phase/sbBase.phase,nexTime=s.nex/sbBase.nex,etlFactor=sbBase.etl/s.etl,accelTime=sbBase.accel/s.accel,pfFactor=s.pf/sbBase.pf;
 if($('parameterSpatialEquation'))$('parameterSpatialEquation').textContent=s.fov+' ÷ '+s.mx+' = '+m.px.toFixed(2)+' mm · '+Math.round(s.fov*s.phaseFov)+' ÷ '+s.phase+' = '+m.py.toFixed(2)+' mm';
 if($('parameterSpatialFactors'))$('parameterSpatialFactors').innerHTML=parameterFactorRow('Frequency pixel vs baseline',m.px/(sbBase.fov/sbBase.mx))+parameterFactorRow('Phase pixel vs baseline',m.py/((sbBase.fov*sbBase.phaseFov)/sbBase.phase))+parameterFactorRow('Voxel volume vs baseline',voxelRatio)+parameterFactorRow('Spatial-detail index',m.detail/base.detail);
 if($('parameterSpatialResult'))$('parameterSpatialResult').textContent='Live voxel = '+m.px.toFixed(2)+' × '+m.py.toFixed(2)+' × '+s.slice.toFixed(1)+' mm = '+m.voxel.toFixed(2)+' mm³.';
 if($('parameterSnrFactors'))$('parameterSnrFactors').innerHTML=parameterFactorRow('Voxel-volume factor',voxelRatio)+parameterFactorRow('√NEX factor',nexFactor)+parameterFactorRow('1/√bandwidth factor',bwFactor)+parameterFactorRow('Idealized 1/√R factor',accelSnr);
 if($('parameterSnrResult'))$('parameterSnrResult').textContent='Product of displayed factors → SNR proxy '+pct(m.snr)+' of baseline.';
 if($('parameterTimeFactors'))$('parameterTimeFactors').innerHTML=parameterFactorRow('Phase-matrix factor',phaseFactor)+parameterFactorRow('NEX factor',nexTime)+parameterFactorRow('1/ETL factor',etlFactor)+parameterFactorRow('1/R factor',accelTime)+parameterFactorRow('Partial-Fourier factor',pfFactor);
 if($('parameterTimeResult'))$('parameterTimeResult').textContent='Product of displayed factors → sampling-time proxy '+pct(m.time)+' of baseline.';
}

function sandboxUpdate(changed){
  const s=sandboxState(),{fov,mx,phase,phaseFov,slice,nex,bw,etl,accel,pf}=s;queueSandboxAutosave(s);
  $('sbFovOut').textContent=fov;$('sbFreqOut').textContent=mx;$('sbPhaseOut').textContent=phase;$('sbPhaseFovOut').textContent=Math.round(phaseFov*100)+'%';$('sbSliceOut').textContent=slice.toFixed(1);$('sbNexOut').textContent=nex.toFixed(1);$('sbBwOut').textContent=bw.toFixed(1)+'×';$('sbEtlOut').textContent=etl;$('sbAccelOut').textContent=accel.toFixed(1)+'×';$('sbPfOut').textContent=Math.round(pf*100)+'%';
  const m=sandboxMetrics(s),base=sandboxMetrics(sbBase),{px,py,voxel,snr,time,detail:detailIndex}=m,detailRatio=1/detailIndex;renderParameterGoalFeedback(s,m);renderParameterChallenge(s);renderParameterDeepDive(changed);
  $('sbRes').textContent=px.toFixed(2)+' × '+py.toFixed(2);$('sbVoxel').textContent=voxel.toFixed(2);$('sbSnr').textContent=pct(snr);$('sbTime').textContent=pct(time);
  $('mapDetail').textContent=pct(detailIndex);$('mapSnr').textContent=pct(snr);$('mapTime').textContent=pct(time);$('mapBw').textContent=pct(bw/sbBase.bw);$('mapEtl').textContent=pct(etl/sbBase.etl);$('mapAccel').textContent=pct(accel/sbBase.accel);$('mapPf').textContent=pct(pf/sbBase.pf);
  setBalanceBar('barDetail',detailIndex);setBalanceBar('barSnr',snr);setBalanceBar('barTime',time);setBalanceBar('barBw',bw/sbBase.bw);setBalanceBar('barEtl',etl/sbBase.etl);setBalanceBar('barAccel',accel/sbBase.accel);setBalanceBar('barPf',pf/sbBase.pf);
  $('sbDetail').textContent=detailRatio<0.92?'Smaller in-plane pixel area: higher spatial-sampling index, with an SNR cost.':detailRatio>1.08?'Larger in-plane pixel area: more signal efficiency, with lower spatial-sampling index.':'Near baseline spatial sampling.';
  $('sbMotion').textContent=time<0.85?'Shorter relative sampling window may reduce opportunity for motion.':time>1.15?'Longer relative sampling window increases opportunity for motion.':'Near baseline relative sampling time.';
  $('sbBand').textContent=bw>1.1?'Higher receiver bandwidth generally reduces chemical-shift / susceptibility displacement but costs SNR efficiency.':bw<0.9?'Lower receiver bandwidth can improve SNR efficiency but increases chemical-shift / susceptibility sensitivity.':'Near baseline receiver bandwidth.';
  $('sbTrain').textContent=etl>10?'Longer echo train reduces the simplified time burden, but FSE/TSE blurring and contrast behavior are sequence dependent.':etl<6?'Shorter echo train raises the simplified time burden but may reduce train-related blurring.':'Near baseline echo-train behavior.';
  $('sbAccelTrade').textContent=accel>1?'Acceleration shortens the modeled phase-encoding burden; SNR proxy includes only the idealized 1/√R penalty, not g-factor or calibration overhead.':'No parallel-acceleration penalty in the baseline model.';
  $('sbPfTrade').textContent=pf<1?'Partial Fourier shortens the modeled sampling burden; SNR / artifact effects are intentionally left reconstruction dependent.':'Full-Fourier baseline.';
  const changes=[];
  if(fov!==sbBase.fov)changes.push('FOV '+(fov>sbBase.fov?'↑':'↓'));
  if(mx!==sbBase.mx)changes.push('freq matrix '+(mx>sbBase.mx?'↑':'↓'));
  if(phase!==sbBase.phase)changes.push('phase matrix '+(phase>sbBase.phase?'↑':'↓'));
  if(Math.abs(phaseFov-sbBase.phaseFov)>.001)changes.push('phase FOV '+(phaseFov>sbBase.phaseFov?'↑':'↓'));
  if(slice!==sbBase.slice)changes.push('slice '+(slice>sbBase.slice?'↑':'↓'));
  if(nex!==sbBase.nex)changes.push('NEX '+(nex>sbBase.nex?'↑':'↓'));
  if(Math.abs(bw-sbBase.bw)>.01)changes.push('bandwidth '+(bw>sbBase.bw?'↑':'↓'));
  if(etl!==sbBase.etl)changes.push('ETL '+(etl>sbBase.etl?'↑':'↓'));
  if(Math.abs(accel-sbBase.accel)>.01)changes.push('acceleration '+(accel>sbBase.accel?'↑':'↓'));
  if(Math.abs(pf-sbBase.pf)>.001)changes.push('partial Fourier '+(pf>sbBase.pf?'↑':'↓'));
  $('sbSummary').innerHTML=changes.length?'<strong>Current stack:</strong> '+changes.join(' · ')+'<br><span class="small">Read the model as a tradeoff map, not a recommendation.</span>':'<strong>Baseline:</strong> no parameter changes.';
  const ledger=[];
  if(fov!==sbBase.fov)ledger.push(ledgerItem('FOV '+(fov>sbBase.fov?'↑':'↓'),fov>sbBase.fov?'Larger in-plane pixels when matrix is fixed → lower spatial-detail index and larger voxel volume.':'Smaller in-plane pixels when matrix is fixed → higher spatial-detail index and smaller voxel volume.','Time is unchanged in this model; real FOV changes can interact with oversampling, gradients, and sequence limits.'));
  if(mx!==sbBase.mx)ledger.push(ledgerItem('Freq matrix '+(mx>sbBase.mx?'↑':'↓'),mx>sbBase.mx?'Smaller frequency-direction pixel → higher spatial sampling and lower voxel/SNR proxy.':'Larger frequency-direction pixel → lower spatial sampling and higher voxel/SNR proxy.','Readout duration, gradient demand, bandwidth-per-pixel coupling, and minimum TE are not modeled.'));
  if(phase!==sbBase.phase)ledger.push(ledgerItem('Phase matrix '+(phase>sbBase.phase?'↑':'↓'),phase>sbBase.phase?'Smaller phase pixel → more phase sampling and lower voxel/SNR proxy.':'Larger phase pixel → less phase sampling and higher voxel/SNR proxy.',(phase>sbBase.phase?'More':'Fewer')+' modeled phase encodes '+(phase>sbBase.phase?'increase':'decrease')+' the sampling-time proxy.'));
  if(Math.abs(phaseFov-sbBase.phaseFov)>.001)ledger.push(ledgerItem('Phase FOV '+(phaseFov>sbBase.phaseFov?'↑':'↓'),phaseFov<sbBase.phaseFov?'Smaller phase-direction coverage at fixed matrix → smaller phase pixel and higher spatial-detail index.':'Larger phase-direction coverage → larger phase pixel and lower detail index.','Lower phase coverage can increase aliasing risk. Time is intentionally unchanged because vendor coupling is not universal.'));
  if(slice!==sbBase.slice)ledger.push(ledgerItem('Slice '+(slice>sbBase.slice?'↑':'↓'),slice>sbBase.slice?'Larger voxel volume → higher SNR proxy, with less through-plane detail.':'Smaller voxel volume → lower SNR proxy, with more through-plane detail.','Slice count, gap, cross-talk, and 3D partition behavior are not included.'));
  if(nex!==sbBase.nex)ledger.push(ledgerItem('NEX '+(nex>sbBase.nex?'↑':'↓'),nex>sbBase.nex?'SNR proxy rises approximately with √NEX.':'SNR proxy falls approximately with √NEX.','Sampling-time proxy changes approximately linearly with NEX.'));
  if(Math.abs(bw-sbBase.bw)>.01)ledger.push(ledgerItem('Bandwidth '+(bw>sbBase.bw?'↑':'↓'),bw>sbBase.bw?'Higher bandwidth lowers SNR proxy but generally reduces frequency-direction chemical shift and susceptibility displacement.':'Lower bandwidth raises SNR proxy but generally increases chemical-shift / susceptibility sensitivity.','Minimum TE and gradient/readout constraints are sequence dependent.'));
  if(etl!==sbBase.etl)ledger.push(ledgerItem('ETL '+(etl>sbBase.etl?'↑':'↓'),etl>sbBase.etl?'Longer echo train lowers the simplified sampling-time proxy.':'Shorter echo train raises the simplified sampling-time proxy.','FSE/TSE blurring, effective TE, refocusing trains, and contrast remain sequence specific.'));
  if(Math.abs(accel-sbBase.accel)>.01)ledger.push(ledgerItem('Acceleration R '+accel.toFixed(1),accel>1?'Modeled time falls roughly with 1/R; SNR proxy includes an idealized 1/√R penalty.':'Acceleration is at baseline.','Real parallel imaging also depends on coil geometry / g-factor, reference lines, effective acceleration, and reconstruction.'));
  if(Math.abs(pf-sbBase.pf)>.001)ledger.push(ledgerItem('Partial Fourier '+Math.round(pf*100)+'%',pf<1?'Fewer modeled phase samples reduce the sampling-time proxy.':'Full Fourier baseline.','SNR / artifact effects are omitted from the universal proxy because reconstruction and phase consistency matter.'));
  $('sbLedger').className=ledger.length?'':'impact-empty';$('sbLedger').innerHTML=ledger.length?ledger.join(''):'Move a control and the causal tradeoffs will appear here.';
  const departures=[['spatial detail',detailIndex],['SNR proxy',snr],['sampling time',time],['bandwidth',bw/sbBase.bw],['echo train',etl/sbBase.etl],['acceleration',accel/sbBase.accel],['Fourier fraction',pf/sbBase.pf]].map(([n,r])=>[n,r,Math.abs(Math.log(Math.max(.001,r)))]).sort((a,b)=>b[2]-a[2]);
  if(changes.length){const [name,r]=departures[0];$('sbDominant').innerHTML='<strong>Largest modeled departure:</strong> '+name+' is '+(r>=1?'↑':'↓')+' '+Math.round(Math.abs(r-1)*100)+'% vs baseline. This is a magnitude flag, not a quality judgment.'}else $('sbDominant').innerHTML='<strong>Largest departure:</strong> none — all modeled inputs are at baseline.';
  if(changed)renderParameterLens(changed);
  renderSandboxCompare();
  if(typeof renderLabsHome==='function')renderLabsHome();
}
function sandboxReset(){
  const values={sbFov:240,sbFreq:320,sbPhase:256,sbPhaseFov:1,sbSlice:4,sbNex:1,sbBw:1,sbEtl:8,sbAccel:1,sbPf:1};
  activeParameterChallenge='';activeParameterGoal='';
  for(const [id,value] of Object.entries(values))if($(id))$(id).value=value;
  sandboxUpdate('fov');renderParameterGoal();renderParameterChallenge();toast('Parameter Lab reset');
}
restoreSandboxCurrentState();renderPresetLibrary();renderComparisonHistory();

let rescueMode='time';
const rescueLibrary={
time:{title:'Scan is too long',summary:'Shorten the acquisition by attacking the largest time driver that is actually negotiable for this sequence.',guard:'Do not trade away required diagnostic coverage, contrast weighting, safety conditions, or protocol requirements just to hit a time target.',levers:[
{a:'Reduce phase-encode burden',d:'Lower phase matrix or use an approved partial-Fourier / acceleration option when appropriate.',cost:'detail / SNR',conf:['detail','snr']},
{a:'Reduce averages',d:'Lower NEX / NSA if the current signal margin can tolerate it.',cost:'SNR',conf:['snr']},
{a:'Use a more efficient echo train',d:'For compatible sequence families, a longer ETL / turbo factor can shorten time.',cost:'blur / contrast',conf:['contrast']},
{a:'Use approved acceleration',d:'Parallel imaging or compressed-sensing options can reduce acquisition burden when available and validated locally.',cost:'SNR / artifacts',conf:['snr']},
{a:'Trim nonessential coverage',d:'Reduce slices, slab, or phase coverage only when the required anatomy remains covered.',cost:'coverage',conf:['coverage']}
]},
snr:{title:'Image is too noisy',summary:'Improve signal efficiency before reflexively adding scan time.',guard:'A sudden SNR drop that is new, coil-element-shaped, or reproducible across patients should trigger a coil / hardware check rather than endless parameter compensation.',levers:[
{a:'Check coil + positioning first',d:'Confirm the intended coil elements, connections, centering, and anatomy-to-coil proximity before changing the protocol.',cost:'minimal',conf:[]},
{a:'Increase voxel volume',d:'Larger pixels or thicker slices generally improve signal per voxel.',cost:'spatial detail',conf:['detail']},
{a:'Increase averages',d:'More NEX / NSA improves averaging efficiency but adds acquisition time.',cost:'time',conf:['time']},
{a:'Reduce receiver bandwidth',d:'When sequence and distortion tolerance allow, lower bandwidth can improve SNR efficiency.',cost:'distortion / chemical shift',conf:[]},
{a:'Reassess acceleration',d:'High acceleration can carry an SNR penalty; reduce it only if the added time is acceptable.',cost:'time',conf:['time']}
]},
motion:{title:'Motion is ruining it',summary:'Separate voluntary motion from physiology, then choose the least disruptive control.',guard:'If patient condition, pain, anxiety, or inability to cooperate is driving motion, follow local clinical and monitoring pathways rather than treating it as a parameter-only problem.',levers:[
{a:'Fix the physical cause first',d:'Reposition, support, immobilize appropriately, coach, and improve communication before stacking sequence changes.',cost:'minimal',conf:[]},
{a:'Shorten vulnerable acquisitions',d:'Use approved time-saving levers so there is less opportunity for motion during the sequence.',cost:'SNR / detail',conf:['snr','detail']},
{a:'Move the phase direction',d:'Redirect ghosting away from critical anatomy when the new direction does not create a worse artifact.',cost:'new artifact location',conf:[]},
{a:'Use appropriate gating / triggering',d:'For periodic physiologic motion, gating or triggering may improve consistency.',cost:'time / variability',conf:['time']},
{a:'Use sat bands or motion-robust methods',d:'Apply protocol-approved suppression or motion-robust sequence options when suited to the anatomy.',cost:'contrast / coverage',conf:['contrast','coverage']}
]},
distortion:{title:'Distortion / off-resonance',summary:'Reduce sensitivity to field inhomogeneity while preserving enough signal and contrast for the diagnostic task.',guard:'Artifact mitigation does not establish implant safety. If metal or a device is involved, its MR status and scanning conditions must already be resolved through the safety pathway.',levers:[
{a:'Increase receiver bandwidth',d:'Higher bandwidth generally reduces frequency-direction displacement and off-resonance sensitivity.',cost:'SNR',conf:['snr']},
{a:'Reduce voxel dimensions',d:'Smaller voxels can reduce intravoxel dephasing and geometric distortion in some settings.',cost:'SNR',conf:['snr']},
{a:'Favor spin-echo-based methods',d:'Where contrast goals permit, spin-echo / FSE approaches are typically less susceptibility-sensitive than GRE.',cost:'contrast / time',conf:['contrast','time']},
{a:'Improve shimming / center frequency',d:'Verify positioning, prescribed shim strategy, and frequency setup before assuming the sequence itself is the problem.',cost:'minimal',conf:[]},
{a:'Use approved metal-reduction tools',d:'SEMAC / MAVRIC-family or other vendor options can help near metal when available and indicated.',cost:'time / complexity',conf:['time']}
]},
wrap:{title:'Anatomy is wrapping in',summary:'Stop outside-FOV signal from mapping into the displayed anatomy.',guard:'Before changing the protocol, confirm which encoding direction is actually wrapping; a wrong assumption can move the problem rather than solve it.',levers:[
{a:'Increase FOV in the offending direction',d:'Sample enough anatomy to keep outside signal from aliasing into the image.',cost:'detail',conf:['detail']},
{a:'Use phase oversampling / no-wrap',d:'Approved oversampling options can suppress phase-direction aliasing.',cost:'time',conf:['time']},
{a:'Swap phase and frequency',d:'Redirect wrap away from the target when the new direction is acceptable for motion and chemical-shift behavior.',cost:'artifact trade',conf:[]},
{a:'Reposition or add approved saturation',d:'Reduce signal from anatomy outside the intended field when anatomically appropriate.',cost:'coverage / contrast',conf:['coverage','contrast']}
]},
fatsat:{title:'Fat suppression is failing',summary:'Treat failed fat suppression as an off-resonance / field-homogeneity problem until proven otherwise.',guard:'The best alternative depends strongly on anatomy, field strength, sequence family, implants, and the intended contrast. Use protocol-approved methods rather than improvising a new diagnostic sequence.',levers:[
{a:'Check centering + shim volume',d:'Patient position and shim coverage can determine whether frequency-selective suppression is uniform.',cost:'minimal',conf:[]},
{a:'Verify center frequency / prescan',d:'A poor frequency setup can make otherwise appropriate fat suppression fail regionally or globally.',cost:'minimal',conf:[]},
{a:'Use a more robust approved method',d:'Dixon-family methods or STIR can be more robust in some off-resonance situations, depending on diagnostic goals.',cost:'contrast / time',conf:['contrast','time']},
{a:'Reduce local susceptibility burden',d:'Near metal, use distortion-reduction strategies and a protocol designed for the off-resonance environment.',cost:'SNR / time',conf:['snr','time']},
{a:'Escalate new regional failure',d:'A new coil- or system-pattern failure across cases may warrant applications, physics, or service review.',cost:'workflow',conf:[]}
]}}
function pickRescue(id){rescueMode=id;document.querySelectorAll('.rescue-problem').forEach(b=>b.classList.toggle('active',b.dataset.rescue===id));renderRescue();remember('rescue','Sequence Rescue')}
function renderRescue(){const r=rescueLibrary[rescueMode],p=$('protectPriority').value;const protectLabel=$('protectPriority').selectedOptions[0].text;let conflictCount=0;const rows=r.levers.map((x,i)=>{const conflict=p!=='none'&&x.conf.includes(p);if(conflict)conflictCount++;return `<div class="lever ${conflict?'conflict':''}"><span class="rank">${i+1}</span><div><b>${x.a}</b><p>${x.d}</p></div><span class="cost">${conflict?'conflicts with protected priority · ':''}${x.cost}</span></div>`}).join('');$('rescueOutput').innerHTML=`<div class="rescue-headline"><div><div class="eyebrow">Rescue queue</div><h3>${r.title}</h3><p class="sub" style="margin:0">${r.summary}</p></div><span class="rescue-status">protect: ${protectLabel.toLowerCase()}</span></div><div class="lever-list">${rows}</div><div class="rescue-guard"><strong>Boundary:</strong> ${r.guard}</div>${conflictCount?`<div class="rescue-note"><strong>${conflictCount} lever${conflictCount===1?'':'s'} flagged:</strong> those options directly trade against the priority you chose to protect. They are not prohibited; they simply deserve extra scrutiny before use.</div>`:''}`}
renderRescue();

const contextGuides={
'Brain / head':{
lead:'Prioritize motion, pulsation, skull-base off-resonance, and head-coil setup before assuming the sequence itself is failing.',
checks:[
'Compare the artifact direction with the phase-encode direction and with expected CSF / vascular pulsation.',
'Look for regional susceptibility or fat-suppression failure near air–tissue interfaces such as the skull base and paranasal sinuses.',
'If shading or signal loss looks element-shaped, verify head-coil positioning and connection before compensating with parameters.'
],
trade:'Phase-direction changes can move ghosts into critical anatomy, while bandwidth or fat-suppression changes can trade SNR or contrast for reduced off-resonance sensitivity.'
},
'Spine':{
lead:'Prioritize CSF pulsation, respiratory / shoulder motion, small-FOV wrap, and hardware-related distortion when present.',
checks:[
'Check whether ghosting follows CSF, breathing, or swallowing rather than general patient motion.',
'Confirm that the phase direction and FOV are not bringing shoulders, arms, or other anatomy back into the image.',
'For postoperative studies, separate metal-related distortion from motion or failed fat suppression before stacking corrections.'
],
trade:'Changing phase direction, saturation, gating, or FOV can move artifacts or alter coverage, scan time, and spatial detail.'
},
'MSK':{
lead:'Prioritize small-FOV aliasing, coil centering, fat-suppression uniformity, chemical shift, and postoperative metal when applicable.',
checks:[
'Verify anatomy is centered in the intended coil and that the selected coil elements cover the region of interest.',
'For small FOV exams, confirm outside anatomy is not wrapping into the joint or extremity.',
'If fat suppression is patchy, distinguish local B0 / susceptibility effects from a broader coil or prescan problem.'
],
trade:'Higher bandwidth, smaller voxels, oversampling, and metal-reduction techniques can improve artifact behavior while costing SNR, scan time, or both.'
},
'Abdomen / pelvis':{
lead:'Prioritize respiratory motion, bowel / physiologic motion, flow, fat-suppression uniformity, and large-FOV wrap.',
checks:[
'Separate breathing-related ghosts from bowel, vascular, or general patient motion before choosing a correction.',
'Check whether the phase direction places motion ghosts across the organ of interest.',
'If fat suppression is uneven, reassess centering, shim coverage, and local off-resonance before changing the diagnostic sequence.'
],
trade:'Breath-hold shortening, gating, phase swaps, saturation, and faster techniques can change SNR, contrast, temporal consistency, or coverage.'
},
'Cardiac / chest':{
lead:'Prioritize cardiac and respiratory motion, vascular flow, gating consistency, lung-interface susceptibility, and coil / electrode setup.',
checks:[
'Determine whether the artifact tracks the cardiac cycle, respiration, vascular flow, or general motion.',
'Review gating / triggering quality and whether the chosen phase direction sends ghosts through the heart or chest target.',
'Near lung–tissue interfaces, expect stronger off-resonance sensitivity and verify shimming / frequency setup before assuming hardware failure.'
],
trade:'Gating, acceleration, bandwidth, phase-direction changes, and motion compensation can affect acquisition time, SNR, temporal behavior, and intended contrast.'
},
'Other':{
lead:'Use a generic artifact-first approach: confirm encoding direction, patient / physiologic motion, coil setup, FOV, and off-resonance behavior.',
checks:[
'Verify the artifact follows a plausible physical mechanism before applying multiple corrections.',
'Change one meaningful variable at a time when practical and confirm the image response.',
'Escalate reproducible coil- or system-pattern abnormalities rather than repeatedly compensating with protocol changes.'
],
trade:'Any troubleshooting change can affect SNR, contrast, coverage, spatial detail, or acquisition time depending on sequence and implementation.'
}
};
const artifacts={
motion:{title:'Motion / ghosting',mechanism:'Periodic or nonperiodic patient / physiologic motion can create phase inconsistencies and ghost replicas, commonly along the phase-encode direction.',first:'Check the patient first: re-coach, improve comfort, and stabilize the anatomy without creating unsafe conductive loops or pressure points.',ideas:['Consider changing phase direction so ghosts move away from the anatomy of interest.','Use faster acquisition, respiratory / cardiac compensation, triggering, gating, or motion-correction options when appropriate.','Review whether averages help enough to justify added time; they do not correct every motion pattern.'],watch:'Faster techniques, phase swaps, gating, and averages can change SNR, contrast, coverage, or scan time.',escalate:'If the pattern persists despite a still patient, consider physiology, sequence behavior, coil/system issues, or service/physics review rather than repeatedly changing protocol settings.',tags:['phase direction','gating','speed','immobilization']},
wrap:{title:'Aliasing / wrap',mechanism:'Signal from anatomy outside the sampled FOV can map back into the displayed image.',first:'Confirm the wrap direction and whether anatomy extends beyond the sampled FOV.',ideas:['Increase FOV in the offending direction.','Use phase oversampling / no-phase-wrap if available.','Swap phase and frequency direction when the tradeoffs are acceptable.','Use saturation or positioning strategies where appropriate.'],watch:'Increasing FOV or oversampling can affect spatial resolution or acquisition time depending on implementation.',escalate:'If the foldover does not track the expected encoding direction, reconsider whether you are dealing with motion, reconstruction, or hardware behavior.',tags:['FOV','phase oversampling','phase swap']},
chem:{title:'Chemical shift',mechanism:'Fat and water resonate at different frequencies, producing frequency-direction misregistration or boundary effects.',first:'Confirm the effect follows the frequency-encode direction and is strongest at fat-water interfaces.',ideas:['Increase receiver bandwidth when the SNR tradeoff is acceptable.','Use appropriate fat suppression / Dixon technique.','Change frequency direction if the artifact obscures critical anatomy.','Remember field strength and bandwidth affect artifact magnitude.'],watch:'Higher receiver bandwidth generally reduces displacement but decreases SNR efficiency.',escalate:'If the appearance is severe, irregular, or concentrated around metal, treat susceptibility / off-resonance as a stronger differential.',tags:['bandwidth','fat suppression','frequency direction']},
metal:{title:'Metal / susceptibility',mechanism:'Local field distortion can produce signal loss, pile-up, geometric distortion, and failed fat suppression.',first:'Confirm the location corresponds to known or suspected metal and verify the patient/device safety pathway is already resolved separately.',ideas:['Increase receiver bandwidth and reduce voxel size when practical.','Favor spin-echo / fast-spin-echo approaches over gradient echo when appropriate.','Use robust fat suppression strategies; consider STIR where clinically appropriate.','Use vendor metal-artifact-reduction techniques (e.g., SEMAC / MAVRIC-family methods) if available and protocol-approved.'],watch:'Metal-reduction techniques may substantially increase scan time and can alter SNR, resolution, and contrast.',escalate:'Artifact mitigation never substitutes for MR safety clearance. If device identity or scanning conditions are unresolved, return to the Safety Gate and local MR safety process.',tags:['bandwidth','FSE','STIR','SEMAC/MAVRIC']},
zipper:{title:'Zipper / RF interference',mechanism:'External or system RF contamination can create a line or band artifact, often aligned with frequency encoding.',first:'Check the room and hardware workflow before changing imaging parameters.',ideas:['Check the scan room door and RF shielding workflow.','Remove / power down non-MR equipment or unauthorized RF sources per site process.','Inspect coil / cable connections and repeat a quick localizer if appropriate.','Compare whether the line persists across sequences or coils.'],watch:'Protocol changes may move or mask a zipper artifact without addressing its source.',escalate:'Persistent RF-type artifact should move to local service / engineering / physics channels rather than repeated patient rescanning.',tags:['RF shielding','hardware','service']},
trunc:{title:'Gibbs / truncation',mechanism:'Limited spatial sampling can create alternating bright and dark lines near high-contrast boundaries.',first:'Look for symmetric ringing immediately adjacent to a sharp boundary.',ideas:['Increase acquisition matrix / spatial sampling in the affected direction.','Use reconstruction filtering carefully if available.','Check whether apparent pathology aligns exactly with the boundary and ringing pattern.'],watch:'Higher matrix can reduce SNR per voxel and may affect scan time or reconstruction behavior.',escalate:'If the pattern is not boundary-linked or is asymmetric, reconsider motion, flow, or reconstruction/hardware causes.',tags:['matrix','sampling','reconstruction']},
flow:{title:'Flow / pulsation ghosting',mechanism:'Moving spins can create phase inconsistencies and ghost replicas, commonly from CSF, vessels, or cardiac motion.',first:'Identify the moving source and the ghost direction before changing parameters.',ideas:['Change phase direction to displace ghosts away from the target anatomy.','Use flow compensation / gradient moment nulling when appropriate.','Consider saturation bands, gating, or alternate sequence timing.','Balance TE / echo-spacing changes against contrast and scan time.'],watch:'Flow compensation, saturation, and gating can change TE, coverage, contrast, or scan time depending on sequence.',escalate:'If the ghosts do not track a plausible physiologic source, compare against general motion or system-related artifacts.',tags:['flow comp','sat bands','gating']},
dielectric:{title:'Dielectric shading / standing-wave pattern',mechanism:'At higher field strengths, RF wavelength effects and B1 inhomogeneity can produce central brightening or regional shading; coil sensitivity or connection problems can look similar.',first:'Before assuming dielectric behavior, verify coil selection, positioning, connection, and whether the shading follows a coil element pattern.',ideas:['Use B1-shimming / multi-transmit options if available and protocol-approved.','Consider sequence / flip-angle and coil strategies with physics or applications support.','Use vendor-approved dielectric aids only according to site and manufacturer procedures.'],watch:'B1-management strategies and sequence changes can affect contrast and RF exposure metrics.',escalate:'Abrupt new shading, element-shaped dropout, or a reproducible coil-dependent pattern deserves hardware / service evaluation.',tags:['B1','3T','coil check','multi-transmit']}
};
function artifactLabState(){return {mode:$('artifactSelect')?.value||'motion',strength:+($('artifactStrength')?.value||55),direction:$('artifactDirection')?.value==='x'?'x':'y'}}

const artifactPatternProfiles={
 motion:{pattern:'Repeated whole-anatomy replicas / blur',footprint:'Distributed; may involve much of the image',direction:'Commonly phase-encode related',directionLabel:'Phase-encode direction',directionHint:'Motion ghosts commonly propagate along the phase-encode direction.',directionLogic:'Often tracks phase encoding',directionDetail:'A phase-direction swap can move ghosts relative to anatomy, but it does not remove the motion source.',mimic:'flow',discriminator:'Ask whether the replicas follow the whole anatomy/general motion or trace to a specific pulsatile source such as CSF or a vessel.'},
 wrap:{pattern:'Anatomy folds in from outside the displayed FOV',footprint:'Edge-to-opposite-side periodic foldover',direction:'Undersampled / encoded-FOV axis',directionLabel:'Foldover direction',directionHint:'Use the direction control here to represent the encoded axis that is too small.',directionLogic:'Tracks the undersized encoded axis',directionDetail:'Changing encoding direction can move the foldover, but adequate coverage or anti-aliasing addresses the cause.',mimic:'motion',discriminator:'Wrap has anatomy that is spatially plausible outside the FOV and folds periodically; motion creates displaced replicas without requiring outside-FOV anatomy.'},
 chem:{pattern:'Paired bright / dark boundary displacement',footprint:'Fat–water interfaces',direction:'Frequency-encode direction',directionLabel:'Frequency-encode direction',directionHint:'Chemical-shift displacement is tied to frequency encoding in this teaching view.',directionLogic:'Tracks frequency encoding',directionDetail:'A frequency-direction change should move the displacement direction; phase-direction changes are not the primary test.',mimic:'metal',discriminator:'Chemical shift is orderly at fat–water boundaries and follows frequency encoding; metal susceptibility is more irregular, focal, and distortion-heavy.'},
 metal:{pattern:'Focal dropout, pile-up, distortion, failed fat suppression',footprint:'Localized around susceptibility source',direction:'Local B0 distortion; not a simple phase-axis pattern',directionLabel:'Display orientation',directionHint:'Direction is not the primary discriminator for local susceptibility around metal.',directionLogic:'Does not simply follow phase direction',directionDetail:'Sequence family, bandwidth, voxel size, and local field distortion matter more than a simple phase-direction flip.',mimic:'chem',discriminator:'Look for irregular focal dropout/distortion around metal or strong local off-resonance rather than a clean fat–water boundary displacement.'},
 zipper:{pattern:'Narrow coherent line or band crossing the image',footprint:'System-like stripe; not anatomy-shaped',direction:'Often linked to frequency encoding / RF contamination',directionLabel:'Stripe orientation',directionHint:'Orientation is displayed for teaching; persistent RF interference is a system/room clue, not an anatomy motion clue.',directionLogic:'May persist despite anatomy/phase changes',directionDetail:'Persistence across sequences, patients, or coils is more discriminating than simply rotating the line.',mimic:'trunc',discriminator:'Zipper is a coherent line/band unrelated to a sharp anatomical boundary; Gibbs ringing hugs high-contrast edges with alternating bands.'},
 trunc:{pattern:'Alternating bright / dark ringing beside a sharp edge',footprint:'Boundary-linked, usually symmetric oscillations',direction:'Limited sampling direction / boundary geometry',directionLabel:'Ringing orientation',directionHint:'Use this control as the displayed sampling/ringing orientation, not as a universal phase direction.',directionLogic:'Tied to sampling and sharp boundaries',directionDetail:'Increasing sampling can change ringing; a simple phase-direction move is not the defining test.',mimic:'zipper',discriminator:'Gibbs bands repeat immediately beside a sharp boundary; zipper artifact forms a line/band through the image independent of boundary geometry.'},
 flow:{pattern:'Ghost replicas arising from moving spins / pulsation',footprint:'Often traces to vessels, CSF, or cardiac source',direction:'Commonly phase-encode related',directionLabel:'Phase-encode direction',directionHint:'Flow/pulsation ghosts commonly propagate along the phase-encode direction.',directionLogic:'Often tracks phase encoding',directionDetail:'A phase swap may redirect ghosts, while flow compensation, saturation, gating, or timing address the source.',mimic:'motion',discriminator:'Find a plausible vessel, CSF, or cardiac source and periodicity. General motion tends to replicate broader anatomy rather than a specific moving-spin source.'},
 dielectric:{pattern:'Broad regional shading / central brightening or signal nonuniformity',footprint:'Smooth, regional intensity field',direction:'B1 / coil-field behavior; not a simple encoding axis',directionLabel:'Display orientation',directionHint:'Direction is not the primary discriminator for dielectric/B1 shading.',directionLogic:'Not expected to follow phase direction',directionDetail:'Coil setup, B1 behavior, field strength, and transmit strategy are more relevant than encoding-direction flips.',mimic:'metal',discriminator:'Dielectric/B1 shading is broad and smooth; susceptibility near metal is focal with dropout, pile-up, and geometric disruption.'}
};
const artifactChallengeQuestions=[
 {prompt:'Repeated displaced copies of much of the anatomy extend along the phase-encode direction. Re-coaching and immobilization are the first practical checks.',answer:'motion',choices:['motion','flow','wrap','zipper'],why:'Whole-anatomy replicas with a phase-direction relationship are a classic motion/ghosting clue.'},
 {prompt:'Anatomy outside the sampled field appears on the opposite side of the image. Increasing FOV or phase oversampling is the relevant correction family.',answer:'wrap',choices:['wrap','motion','trunc','chem'],why:'Periodic foldover of outside-FOV anatomy identifies aliasing / wrap.'},
 {prompt:'A paired bright/dark boundary displacement is strongest at fat–water interfaces and follows the frequency-encode direction.',answer:'chem',choices:['chem','metal','trunc','zipper'],why:'Chemical-shift displacement is organized at fat–water boundaries and tied to frequency encoding.'},
 {prompt:'There is irregular focal signal loss, pile-up, distortion, and fat-suppression failure around a known implant or susceptibility source.',answer:'metal',choices:['metal','chem','dielectric','motion'],why:'Localized irregular off-resonance around metal points to susceptibility rather than ordinary chemical shift.'},
 {prompt:'A narrow coherent line or band crosses the image and persists across otherwise different acquisitions. Room RF shielding, equipment, and coil connections become priorities.',answer:'zipper',choices:['zipper','trunc','wrap','flow'],why:'A persistent non-anatomic stripe is characteristic of zipper / RF interference behavior.'},
 {prompt:'Alternating bright and dark bands hug a sharp high-contrast boundary symmetrically; increasing spatial sampling is the relevant direction.',answer:'trunc',choices:['trunc','zipper','chem','motion'],why:'Boundary-linked oscillatory ringing is the defining Gibbs / truncation clue.'},
 {prompt:'Ghost replicas follow a vessel, CSF pulsation, or cardiac source and commonly extend along the phase-encode direction.',answer:'flow',choices:['flow','motion','wrap','metal'],why:'A plausible moving-spin or pulsatile source distinguishes flow ghosting from general patient motion.'},
 {prompt:'Broad smooth regional shading or central brightening is seen, especially at higher field, without a focal edge-displacement pattern. Coil/B1 checks matter.',answer:'dielectric',choices:['dielectric','metal','chem','zipper'],why:'Broad B1-related shading is different from focal susceptibility, boundary shift, or RF stripe artifact.'}
];
let artifactChallengeState={index:0,correct:0,answered:0,choice:null};
function artifactProfile(mode){return artifactPatternProfiles[mode]||artifactPatternProfiles.motion}
function renderArtifactFingerprint(state=artifactLabState()){
  const p=artifactProfile(state.mode),a=artifacts[state.mode]||artifacts.motion;
  if($('artifactFingerprintBadge'))$('artifactFingerprintBadge').textContent=(a.title||state.mode).toLowerCase();
  if($('artifactFingerprint'))$('artifactFingerprint').innerHTML=[
    ['Pattern',p.pattern],['Footprint',p.footprint],['Encoding relationship',p.direction],['Best discriminator',p.discriminator]
  ].map(([k,v])=>'<div class="artifact-fingerprint-row"><small>'+escapeHtml(k)+'</small><b>'+escapeHtml(v)+'</b></div>').join('');
  if($('artifactDirectionLogic'))$('artifactDirectionLogic').textContent=p.directionLogic;
  if($('artifactDirectionLogicDetail'))$('artifactDirectionLogicDetail').textContent=p.directionDetail;
  if($('artifactDirectionLabel'))$('artifactDirectionLabel').textContent=p.directionLabel;
  if($('artifactDirectionHint'))$('artifactDirectionHint').textContent=p.directionHint;
  if($('artifactPhaseLabel'))$('artifactPhaseLabel').textContent=p.directionLabel.replace(' direction','').toLowerCase()+(state.direction==='x'?' →':' ↑');
  const mimic=artifacts[p.mimic]||artifacts.motion;
  if($('artifactDifferential'))$('artifactDifferential').innerHTML='<div class="artifact-differential-vs"><div><small>Selected</small><b>'+escapeHtml(a.title)+'</b><span>'+escapeHtml(p.pattern)+'</span></div><i>vs</i><div><small>Closest teaching mimic</small><b>'+escapeHtml(mimic.title)+'</b><span>'+escapeHtml(artifactProfile(p.mimic).pattern)+'</span></div></div><div class="artifact-discriminator"><small>Separate them by</small><b>'+escapeHtml(p.discriminator)+'</b></div>';
}
function flipArtifactDirection(){if(!$('artifactDirection'))return;$('artifactDirection').value=$('artifactDirection').value==='x'?'y':'x';artifactLabUpdate();toast('Artifact display direction flipped')}
function renderArtifactChallenge(){
  const q=artifactChallengeQuestions[artifactChallengeState.index%artifactChallengeQuestions.length],choices=$('artifactChallengeChoices'),feedback=$('artifactChallengeFeedback');
  if($('artifactChallengeProgress'))$('artifactChallengeProgress').textContent='Question '+(artifactChallengeState.index+1)+' of '+artifactChallengeQuestions.length;
  if($('artifactChallengeScore'))$('artifactChallengeScore').textContent=artifactChallengeState.correct+' / '+artifactChallengeState.answered;
  if($('artifactChallengePrompt'))$('artifactChallengePrompt').textContent=q.prompt;
  if(choices)choices.innerHTML=q.choices.map(id=>{const a=artifacts[id],answered=artifactChallengeState.choice!==null,cls=answered?(id===q.answer?'correct':id===artifactChallengeState.choice?'wrong':''):'';return '<button type="button" data-artifact-challenge="'+id+'" class="'+cls+'" '+(answered?'disabled':'')+'>'+escapeHtml(a?.title||id)+'</button>'}).join('');
  if(feedback){feedback.className='artifact-challenge-feedback';if(artifactChallengeState.choice===null)feedback.innerHTML='<span>Choose the artifact that best fits the clues.</span>';else{const ok=artifactChallengeState.choice===q.answer;feedback.classList.add(ok?'good':'bad');feedback.innerHTML='<b>'+(ok?'Correct.':'Not quite.')+'</b><span>'+escapeHtml(q.why)+'</span>';}}
  if($('artifactChallengeNextBtn'))$('artifactChallengeNextBtn').disabled=artifactChallengeState.choice===null;
  if($('artifactChallengeLoadBtn'))$('artifactChallengeLoadBtn').disabled=artifactChallengeState.choice===null;
}
function answerArtifactChallenge(id){if(artifactChallengeState.choice!==null)return;const q=artifactChallengeQuestions[artifactChallengeState.index%artifactChallengeQuestions.length];artifactChallengeState.choice=id;artifactChallengeState.answered++;if(id===q.answer)artifactChallengeState.correct++;renderArtifactChallenge()}
function nextArtifactChallenge(){if(artifactChallengeState.choice===null)return;artifactChallengeState.index=(artifactChallengeState.index+1)%artifactChallengeQuestions.length;artifactChallengeState.choice=null;renderArtifactChallenge()}
function resetArtifactChallenge(){artifactChallengeState={index:0,correct:0,answered:0,choice:null};renderArtifactChallenge();toast('Artifact recognition challenge restarted')}
function loadArtifactChallengeAnswer(){const q=artifactChallengeQuestions[artifactChallengeState.index%artifactChallengeQuestions.length];if($('artifactSelect'))$('artifactSelect').value=q.answer;artifactLabUpdate();solveArtifact();$('artifactCanvas')?.scrollIntoView({behavior:uiPrefs.reduceMotion?'auto':'smooth',block:'center'});toast('Artifact pattern loaded')}
function bindArtifactDeepDive(){$('artifactChallengeChoices')?.addEventListener('click',e=>{const b=e.target.closest('[data-artifact-challenge]');if(b)answerArtifactChallenge(b.dataset.artifactChallenge)})}

function artifactTeachingCue(state){
  const cues={
    motion:['Motion / ghosting','Repeated shifted copies emphasize how periodic or inconsistent motion can propagate along the phase-encoding direction.'],
    wrap:['Aliasing / wrap','Content beyond the represented field folds to the opposite side in this stylized phase-direction view.'],
    chem:['Chemical shift','Opposed bright / dark edge bands illustrate spatial displacement between frequency-separated signals.'],
    metal:['Susceptibility','Local signal loss and geometric disruption are exaggerated around a synthetic susceptibility source.'],
    zipper:['Zipper / RF interference','A narrow high-intensity stripe illustrates coherent interference entering the image chain.'],
    trunc:['Gibbs / truncation','Oscillating bands near sharp boundaries illustrate ringing after abrupt spatial-frequency truncation.'],
    flow:['Flow / pulsation','Repeated vessel-like ghosts illustrate periodic signal displacement along the selected phase-like direction.'],
    dielectric:['Dielectric shading','A broad nonuniform intensity field illustrates B1-related shading rather than focal edge displacement.']
  };return cues[state.mode]||cues.motion;
}
function drawArtifactBase(ctx,dx=0,dy=0,alpha=1){
  ctx.save();ctx.translate(dx,dy);ctx.globalAlpha=alpha;
  const w=420,h=420;ctx.fillStyle='#0a0f0d';ctx.fillRect(0,0,w,h);
  ctx.fillStyle='#727d78';ctx.beginPath();ctx.ellipse(210,210,132,156,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#b7c0bc';ctx.beginPath();ctx.ellipse(210,205,102,125,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#313936';ctx.beginPath();ctx.ellipse(210,202,63,79,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#d9dfdc';ctx.beginPath();ctx.arc(167,170,22,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(253,170,22,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#555f5b';ctx.fillRect(145,271,130,16);
  ctx.fillStyle='#e7ece9';ctx.beginPath();ctx.arc(210,238,12,0,Math.PI*2);ctx.fill();
  ctx.restore();
}
function artifactLabRender(){
  const c=$('artifactCanvas');if(!c)return;const ctx=c.getContext('2d'),st=artifactLabState(),p=st.strength/100,axis=st.direction==='x'?'x':'y';
  ctx.clearRect(0,0,c.width,c.height);drawArtifactBase(ctx);
  const shift=(axis==='x')?[1,0]:[0,1];
  if(st.mode==='motion'){
    ctx.globalCompositeOperation='screen';
    for(let i=1;i<=4;i++){const d=(12+i*11)*p;drawArtifactBase(ctx,shift[0]*d*i,shift[1]*d*i,.11*(1-p*.2))}
    ctx.globalCompositeOperation='source-over';
  }else if(st.mode==='wrap'){
    ctx.save();ctx.globalAlpha=.65*p;ctx.beginPath();ctx.rect(0,0,420,420);ctx.clip();
    drawArtifactBase(ctx,axis==='x'?-300*p:0,axis==='y'?-300*p:0,.55);
    drawArtifactBase(ctx,axis==='x'?300*p:0,axis==='y'?300*p:0,.35);ctx.restore();
  }else if(st.mode==='chem'){
    ctx.save();ctx.globalCompositeOperation='screen';ctx.strokeStyle='rgba(255,240,190,'+(.75*p)+')';ctx.lineWidth=3+8*p;
    ctx.beginPath();ctx.ellipse(210+shift[0]*12*p,210+shift[1]*12*p,104,127,0,0,Math.PI*2);ctx.stroke();
    ctx.globalCompositeOperation='multiply';ctx.strokeStyle='rgba(0,0,0,'+(.75*p)+')';ctx.beginPath();ctx.ellipse(210-shift[0]*12*p,210-shift[1]*12*p,104,127,0,0,Math.PI*2);ctx.stroke();ctx.restore();
  }else if(st.mode==='metal'){
    ctx.save();const x=268,y=236,r=22+36*p;ctx.fillStyle='rgba(0,0,0,'+(0.82*p)+')';ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='rgba(235,245,240,'+(.28*p)+')';ctx.lineWidth=2;for(let i=0;i<12;i++){const a=i*Math.PI/6;ctx.beginPath();ctx.moveTo(x+Math.cos(a)*r*.7,y+Math.sin(a)*r*.7);ctx.lineTo(x+Math.cos(a)*r*2.2,y+Math.sin(a)*r*2.2);ctx.stroke()}ctx.restore();
  }else if(st.mode==='zipper'){
    ctx.save();ctx.fillStyle='rgba(235,250,246,'+(.82*p)+')';if(axis==='x')ctx.fillRect(0,108,420,5+8*p);else ctx.fillRect(304,0,5+8*p,420);
    ctx.fillStyle='rgba(120,210,190,'+(.28*p)+')';for(let i=0;i<7;i++){if(axis==='x')ctx.fillRect(0,80+i*11,420,1);else ctx.fillRect(278+i*9,0,1,420)}ctx.restore();
  }else if(st.mode==='trunc'){
    ctx.save();ctx.strokeStyle='rgba(245,250,248,'+(.32*p)+')';ctx.lineWidth=2;for(let k=1;k<=5;k++){const off=k*7;if(axis==='y'){ctx.beginPath();ctx.ellipse(210,210,132+off,156+off,0,0,Math.PI*2);ctx.stroke()}else{ctx.beginPath();ctx.ellipse(210,210,132+off,156+off,0,0,Math.PI*2);ctx.stroke()}}ctx.restore();
  }else if(st.mode==='flow'){
    ctx.save();ctx.globalCompositeOperation='screen';for(let i=1;i<=5;i++){const d=i*26*p;ctx.fillStyle='rgba(230,245,240,'+(0.19/(i*.7))+')';ctx.beginPath();ctx.arc(210+shift[0]*d,238+shift[1]*d,12,0,Math.PI*2);ctx.fill()}ctx.restore();
  }else if(st.mode==='dielectric'){
    const g=ctx.createRadialGradient(175,165,10,205,205,180);g.addColorStop(0,'rgba(255,255,245,'+(0.38*p)+')');g.addColorStop(.48,'rgba(90,140,125,'+(0.08*p)+')');g.addColorStop(1,'rgba(0,0,0,'+(0.55*p)+')');ctx.fillStyle=g;ctx.fillRect(0,0,420,420);
  }
  ctx.strokeStyle='rgba(255,255,255,.08)';ctx.strokeRect(.5,.5,419,419);
}
function persistArtifactLabState(state){try{localStorage.setItem('mrcc_artifact_current',JSON.stringify({...state,savedAt:new Date().toISOString()}))}catch(e){}}
function artifactLabUpdate(save=true){
  if(!$('artifactSelect')||!$('artifactStrength'))return;const st=artifactLabState(),cue=artifactTeachingCue(st);
  $('artifactStrengthOut').textContent=Math.round(st.strength)+'%';$('artifactVisualBadge').textContent=(artifacts[st.mode]?.title||st.mode).toLowerCase();$('artifactVisualCue').textContent=cue[0];$('artifactVisualDetail').textContent=cue[1];
  artifactLabRender();renderArtifactFingerprint(st);if(save)persistArtifactLabState(st);if(typeof renderLabsHome==='function')renderLabsHome();
}
function applyArtifactLabPreset(mode){if(!$('artifactSelect'))return;$('artifactSelect').value=mode;$('artifactStrength').value=mode==='metal'?70:mode==='trunc'?60:55;artifactLabUpdate();solveArtifact();toast('Artifact teaching pattern loaded')}
function restoreArtifactLabState(){
  let raw=null;try{raw=JSON.parse(localStorage.getItem('mrcc_artifact_current')||'null')}catch(e){}
  if(raw&&artifacts[raw.mode])$('artifactSelect').value=raw.mode;if(raw&&Number.isFinite(+raw.strength))$('artifactStrength').value=Math.min(100,Math.max(0,+raw.strength));if(raw&&['x','y'].includes(raw.direction))$('artifactDirection').value=raw.direction;artifactLabUpdate(false);solveArtifact();
}
function artifactLabReset(){if($('artifactSelect'))$('artifactSelect').value='motion';if($('artifactStrength'))$('artifactStrength').value=55;if($('artifactDirection'))$('artifactDirection').value='y';artifactLabUpdate();solveArtifact();toast('Artifact Lab reset')}
bindArtifactDeepDive();renderArtifactChallenge();
function solveArtifact(){const a=artifacts[$('artifactSelect').value];const ctx=$('context').value;const g=contextGuides[ctx]||contextGuides['Other'];$('artifactOut').innerHTML=`<div class="artifact-banner"><div><div class="eyebrow">Likely pattern</div><h3>${a.title}</h3></div><span class="match">selected artifact</span></div><p class="sub">${a.mechanism}</p><div class="tags">${a.tags.map(t=>`<span class="tag">${t}</span>`).join('')}<span class="tag">${ctx}</span></div><div class="solver-lane"><div class="solver-box"><div class="lab">First move</div><b>${a.first}</b><p>Start here before stacking multiple parameter changes.</p></div><div class="solver-box"><div class="lab">Watch the tradeoff</div><b>${a.watch}</b><p>Verify the image effect before propagating the change.</p></div></div><div class="context-lens"><div class="context-lens-head"><b>Context Lens</b><span class="context-badge">${ctx}</span></div><p>${g.lead}</p><ul>${g.checks.map(x=>`<li>${x}</li>`).join('')}</ul><p class="context-caution"><strong>Context tradeoff:</strong> ${g.trade}</p></div><div class="eyebrow" style="margin-top:8px">Then consider</div><ol class="steps">${a.ideas.map(x=>`<li>${x}</li>`).join('')}</ol><div class="escalate-line"><strong>Escalation cue:</strong> ${a.escalate}</div><div class="small" style="margin-top:10px">The Context Lens changes prioritization, not artifact identification. Educational troubleshooting only; scanner IFU, site protocol, radiologist direction, MR safety policy, and service guidance take precedence.</div>`}solveArtifact();
const burn=[...document.querySelectorAll('.burncheck')];function burnUpdate(){const n=burn.filter(x=>x.checked).length;const e=$('burnState');if(n===burn.length){e.className='state ok';e.textContent='Setup reminders complete — this does not establish absence of thermal risk. Follow scanner IFU and local policy.'}else{e.className='state warn';e.textContent=`${burn.length-n} thermal-risk reminder${burn.length-n===1?'':'s'} incomplete.`}}burn.forEach(x=>x.addEventListener('change',burnUpdate));
function escapeHtml(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function runSelfCheck(){
  const checks=[
    ['Brand + shell',!!$('brandMark')&&!!$('workspaceRail')&&!!$('cockpit')&&!!$('mobileNav')],
    ['Labs home',typeof renderLabsHome==='function'&&!!$('homeParameterState')&&!!$('homeContrastState')&&!!$('homeKspaceState')&&!!$('homeSpatialState')&&!!$('homeArtifactState')],
    ['Parameter Lab',typeof sandboxUpdate==='function'&&typeof sandboxMetrics==='function'&&typeof renderParameterDeepDive==='function'&&typeof renderParameterEquations==='function'&&!!$('sbFreq')&&!!$('sbAccel')&&!!$('parameterReference')&&!!$('parameterDeepCockpit')&&!!$('parameterEquationLab')],
    ['Parameter continuity',typeof restoreSandboxCurrentState==='function'&&typeof quickSaveSandboxPreset==='function'&&!!$('labContinuity')],
    ['Contrast Lab',typeof contrastUpdate==='function'&&typeof contrastSignal==='function'&&typeof renderContrastDeep==='function'&&typeof contrastDrawRecovery==='function'&&typeof renderContrastChallenge==='function'&&Array.isArray(contrastMaterialsModel)&&contrastMaterialsModel.length===3&&!!$('clTr')&&!!$('clTe')&&!!$('contrastRecoveryCanvas')&&!!$('contrastDecayCanvas')&&!!$('contrastDecomposition')&&!!$('contrastChallengeTargets')],
    ['Sequence Timing Lab',typeof timingUpdate==='function'&&typeof timingMetrics==='function'&&typeof renderTimingDeep==='function'&&typeof renderTimingChallenge==='function'&&typeof restoreTimingState==='function'&&!!$('timingTr')&&!!$('timingEtl')&&!!$('timingEchoRow')&&!!$('timingEquationBreakdown')&&!!$('timingKspaceStrip')&&!!$('timingChallengeTargets')],
    ['Motion Lab',typeof motionUpdate==='function'&&typeof motionAcquire==='function'&&typeof motionLineStats==='function'&&typeof renderMotionOrderCompare==='function'&&typeof renderMotionChallenge==='function'&&typeof restoreMotionState==='function'&&!!$('motionMode')&&!!$('motionHistoryCanvas')&&!!$('motionResultCanvas')&&!!$('motionLineMap')&&!!$('motionLinearCanvas')&&!!$('motionCentricCanvas')&&!!$('motionChallengeTargets')],
    ['K-Space Lab',typeof kspaceUpdate==='function'&&typeof kspaceDft2D==='function'&&typeof kspaceApplyMask==='function'&&typeof kspaceEnergyStats==='function'&&typeof drawKspacePsf==='function'&&typeof renderKspaceChallenge==='function'&&KS_N===32&&!!$('ksKspaceCanvas')&&!!$('ksImageCanvas')&&!!$('ksPsfCanvas')&&!!$('ksEnergyBands')&&!!$('ksChallengeTargets')],
    ['Spatial Encoding Lab',typeof spatialUpdate==='function'&&typeof spatialMetrics==='function'&&typeof spatialFeatureProvenance==='function'&&typeof spatialMatchedSamples==='function'&&typeof spatialMatchSamples==='function'&&typeof renderSpatialChallenge==='function'&&typeof restoreSpatialState==='function'&&!!$('spWorldCanvas')&&!!$('spReconCanvas')&&!!$('spatialProvenanceList')&&!!$('spatialChallengeTargets')&&!!$('spatialGridDiagnosis')],
    ['Artifact Lab',typeof artifactLabUpdate==='function'&&typeof artifactLabRender==='function'&&typeof renderArtifactFingerprint==='function'&&typeof renderArtifactChallenge==='function'&&typeof flipArtifactDirection==='function'&&!!$('artifactCanvas')&&!!$('artifactStrength')&&!!$('artifactFingerprint')&&!!$('artifactDifferential')&&!!$('artifactChallengeChoices')],
    ['Lab persistence',typeof restoreContrastState==='function'&&typeof restoreTimingState==='function'&&typeof restoreMotionState==='function'&&typeof restoreKspaceState==='function'&&typeof restoreSpatialState==='function'&&typeof restoreArtifactLabState==='function'&&typeof persistContrastState==='function'&&typeof persistTimingState==='function'&&typeof persistMotionState==='function'&&typeof persistKspaceState==='function'&&typeof persistSpatialState==='function'&&typeof persistArtifactLabState==='function'],
    ['A/B Compare',typeof swapSandboxComparison==='function'&&typeof renderSandboxCompare==='function'&&!!$('parameterCompareWorkbench')],
    ['Preset library',Array.isArray(sbPresets)&&typeof exportSandboxPresets==='function'&&typeof importSandboxPresets==='function'&&!!$('presetList')],
    ['Comparison history',Array.isArray(comparisonHistory)&&typeof saveComparisonHistory==='function'&&!!$('comparisonHistoryList')],
    ['Parameter Reference',typeof openParameterReferenceGroup==='function'&&!!$('paramRefGeometry')&&!!$('paramRefArtifact')],
    ['Supporting tools',typeof calcVoxel==='function'&&typeof calcTime==='function'&&typeof solveArtifact==='function'&&typeof renderRescue==='function'],
    ['Safety reference',typeof updateSafety==='function'&&typeof burnUpdate==='function'&&!!$('safety')&&!!$('burn')],
    ['Search + settings',typeof runCommand==='function'&&typeof openPalette==='function'&&typeof openPreferences==='function'&&!!$('paletteBack')&&!!$('prefsBack')],
    ['Sequence Families Lab',typeof openSequenceFamiliesLab==='function'&&typeof renderSequenceFamilyGrid==='function'&&typeof renderSequenceAnatomy==='function'&&typeof renderSequenceDna==='function'&&typeof scoreSequenceDna==='function'&&typeof sequenceTranslateAlias==='function'&&typeof renderSequenceCompare==='function'&&typeof renderSequenceChallenge==='function'&&typeof restoreSequenceFamiliesLab==='function'&&!!$('protocol')&&!!$('sequenceFamilyGrid')&&!!$('sequenceFamilyDetail')&&!!$('seqAnatomyTimeline')&&!!$('seqDnaResult')&&!!$('seqChallengeChoices')],
    ['Home/Labs navigation',typeof openLab==='function'&&typeof setWorkspaceTabActive==='function'&&document.querySelectorAll('[data-workspace-tab]').length===10],
    ['Mobile navigation',typeof syncMobileNav==='function'&&document.querySelectorAll('#mobileNav [data-workspace-tab]').length===5],
    ['Deep-link navigation',typeof restoreRouteFromHash==='function'&&typeof routeHash==='function'&&sectionTitles.protocol==='Sequence Families Lab'&&sectionTitles.contrast==='Contrast Lab'&&sectionTitles.kspace==='K-Space Lab'&&sectionTitles.spatial==='Spatial Encoding Lab'&&sectionTitles.artifact==='Artifact Lab'],
    ['Local data layer',typeof readStoredJson==='function'&&typeof localDataHealthy==='function'&&localDataHealthy()],
    ['Workspace portability',typeof exportWorkspaceBackup==='function'&&typeof sanitizeWorkspaceBackup==='function'&&typeof applyWorkspaceImport==='function'&&typeof copyWorkspaceDiagnostics==='function'&&MRCC_WORKSPACE_ACTIVE_KEYS.length===12&&!!$('workspaceImportFile')],
    ['Offline update flow',typeof applyAppUpdate==='function'],
    ['Runtime monitor',typeof window.__mrccRuntimeErrors==='number'],
    ['Dialog focus',typeof trapDialogFocus==='function']
  ];
  const failed=checks.filter(x=>!x[1]),chip=$('engineChip'),txt=$('engineText');
  if(failed.length){if(chip)chip.classList.add('issue');if(txt)txt.textContent='Engine: '+failed.length+' check'+(failed.length===1?'':'s')+' failed';toast('Self-check found: '+failed.map(x=>x[0]).join(', '))}
  else if(window.__mrccRuntimeErrors){if(chip)chip.classList.add('issue');if(txt)txt.textContent='Engine: '+window.__mrccRuntimeErrors+' runtime issue'+(window.__mrccRuntimeErrors===1?'':'s');toast('Self-check: runtime issue recorded')}
  else{if(chip)chip.classList.remove('issue');if(txt)txt.textContent='Engine: Labs checks passed';toast('Self-check passed')}
}
const contrastMaterialsModel=[
  {name:'Material A',t1:450,t2:70,pd:.80},
  {name:'Material B',t1:900,t2:100,pd:.90},
  {name:'Material C',t1:2400,t2:260,pd:1.00}
];
function contrastState(){
  return {mode:$('clMode')?.value==='ir'?'ir':'se',tr:+($('clTr')?.value||800),te:+($('clTe')?.value||20),ti:+($('clTi')?.value||600)};
}

function contrastLongitudinalTerm(material,state,time){
  const t1=Math.max(1,material.t1),t=Math.max(0,time),tr=Math.max(1,state.tr);
  if(state.mode==='ir')return 1-2*Math.exp(-t/t1)+Math.exp(-tr/t1);
  return 1-Math.exp(-t/t1);
}
function contrastTransverseTerm(material,time){return Math.exp(-Math.max(0,time)/Math.max(1,material.t2))}
function contrastSignalParts(material,state){
  const longitudinal=contrastLongitudinalTerm(material,state,state.mode==='ir'?state.ti:state.tr),transverse=contrastTransverseTerm(material,state.te);
  return {longitudinal,transverse,pd:material.pd,signal:Math.max(0,Math.abs(longitudinal)*transverse*material.pd)};
}
function contrastNullTi(material,tr){
  const t1=Math.max(1,material.t1),ratio=(1+Math.exp(-Math.max(1,tr)/t1))/2;
  return Math.max(0,-t1*Math.log(Math.max(.000001,ratio)));
}
const contrastPalette=['#48f0b2','#52d7ff','#b89cff'];
function contrastCanvasSetup(canvas){
  if(!canvas)return null;const rect=canvas.getBoundingClientRect(),dpr=Math.max(1,Math.min(2,window.devicePixelRatio||1)),w=Math.max(320,Math.round(rect.width||760)),h=Math.max(180,Math.round((canvas.height/canvas.width)*w));
  if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr)}
  const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);return {ctx,w,h};
}
function contrastDrawAxes(ctx,w,h,yMin,yMax,xLabel){
  const l=42,r=12,t=12,b=27,pw=w-l-r,ph=h-t-b;ctx.clearRect(0,0,w,h);ctx.strokeStyle='rgba(86,125,114,.38)';ctx.lineWidth=1;ctx.fillStyle='rgba(155,184,175,.72)';ctx.font='11px system-ui';
  for(let i=0;i<=4;i++){const y=t+ph*i/4;ctx.beginPath();ctx.moveTo(l,y);ctx.lineTo(w-r,y);ctx.stroke();const val=(yMax-(yMax-yMin)*i/4).toFixed(1);ctx.fillText(val,5,y+4)}
  ctx.beginPath();ctx.moveTo(l,t);ctx.lineTo(l,h-b);ctx.lineTo(w-r,h-b);ctx.stroke();ctx.fillText('0',l-3,h-8);ctx.fillText(xLabel,w-r-45,h-8);return {l,r,t,b,pw,ph,yMin,yMax};
}
function contrastDrawRecovery(state){
  const canvas=$('contrastRecoveryCanvas'),setup=contrastCanvasSetup(canvas);if(!setup)return;const {ctx,w,h}=setup,yMin=state.mode==='ir'?-1:0,yMax=1,ax=contrastDrawAxes(ctx,w,h,yMin,yMax,'time');
  const maxT=Math.max(300,state.tr);
  contrastMaterialsModel.forEach((m,idx)=>{ctx.strokeStyle=contrastPalette[idx];ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<=160;i++){const time=maxT*i/160,val=contrastLongitudinalTerm(m,state,time),x=ax.l+ax.pw*i/160,y=ax.t+(yMax-val)/(yMax-yMin)*ax.ph;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)}ctx.stroke()});
  const markerT=state.mode==='ir'?state.ti:state.tr,x=ax.l+ax.pw*Math.min(1,markerT/maxT);ctx.strokeStyle=state.mode==='ir'?'rgba(184,156,255,.9)':'rgba(255,226,154,.85)';ctx.setLineDash([5,4]);ctx.beginPath();ctx.moveTo(x,ax.t);ctx.lineTo(x,h-ax.b);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='rgba(225,240,235,.82)';ctx.font='11px system-ui';ctx.fillText(state.mode==='ir'?'TI':'TR',Math.min(w-28,x+4),ax.t+12);
  if(state.mode==='ir'){const zeroY=ax.t+(yMax-0)/(yMax-yMin)*ax.ph;ctx.strokeStyle='rgba(255,255,255,.25)';ctx.beginPath();ctx.moveTo(ax.l,zeroY);ctx.lineTo(w-ax.r,zeroY);ctx.stroke()}
}
function contrastDrawDecay(state){
  const canvas=$('contrastDecayCanvas'),setup=contrastCanvasSetup(canvas);if(!setup)return;const {ctx,w,h}=setup,ax=contrastDrawAxes(ctx,w,h,0,1,'TE');
  const maxT=180;contrastMaterialsModel.forEach((m,idx)=>{ctx.strokeStyle=contrastPalette[idx];ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<=160;i++){const time=maxT*i/160,val=contrastTransverseTerm(m,time),x=ax.l+ax.pw*i/160,y=ax.t+(1-val)*ax.ph;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)}ctx.stroke()});
  const x=ax.l+ax.pw*Math.min(1,state.te/maxT);ctx.strokeStyle='rgba(82,215,255,.85)';ctx.setLineDash([5,4]);ctx.beginPath();ctx.moveTo(x,ax.t);ctx.lineTo(x,h-ax.b);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='rgba(225,240,235,.82)';ctx.font='11px system-ui';ctx.fillText('TE',Math.min(w-28,x+4),ax.t+12);
}
function contrastFactorSpread(parts,key){const vals=parts.map(x=>key==='longitudinal'?Math.abs(x[key]):x[key]),mx=Math.max(...vals),mn=Math.min(...vals);return mx-mn}
function renderContrastDeep(state,signals){
  const parts=contrastMaterialsModel.map(m=>contrastSignalParts(m,state)),max=Math.max(...parts.map(x=>x.signal),.000001);
  if($('contrastCurveMode'))$('contrastCurveMode').textContent=state.mode==='ir'?'IR-like':'SE-like';
  if($('contrastRecoveryAxis'))$('contrastRecoveryAxis').textContent=state.mode==='ir'?'inverted Mz → TR window':'excited Mz → TR recovery';
  if($('contrastRecoveryMarker'))$('contrastRecoveryMarker').textContent=(state.mode==='ir'?'TI '+Math.round(state.ti)+' ms':'TR '+Math.round(state.tr)+' ms');
  if($('contrastDecayMarker'))$('contrastDecayMarker').textContent='TE '+Math.round(state.te)+' ms';
  contrastDrawRecovery(state);contrastDrawDecay(state);
  const recoveryAt=state.mode==='ir'?state.ti:state.tr,rec=contrastMaterialsModel.map(m=>contrastLongitudinalTerm(m,state,recoveryAt)),dec=contrastMaterialsModel.map(m=>contrastTransverseTerm(m,state.te));
  if($('contrastRecoverySummary'))$('contrastRecoverySummary').textContent=state.mode==='ir'?'At TI '+Math.round(state.ti)+' ms, signed longitudinal terms are '+rec.map((v,i)=>contrastMaterialsModel[i].name.replace('Material ','')+' '+(v>=0?'+':'')+v.toFixed(2)).join(' · ')+'. Zero crossing is the synthetic null condition.':'At TR '+Math.round(state.tr)+' ms, longitudinal recovery terms are '+rec.map((v,i)=>contrastMaterialsModel[i].name.replace('Material ','')+' '+v.toFixed(2)).join(' · ')+'.';
  if($('contrastDecaySummary'))$('contrastDecaySummary').textContent='At TE '+Math.round(state.te)+' ms, transverse factors are '+dec.map((v,i)=>contrastMaterialsModel[i].name.replace('Material ','')+' '+v.toFixed(2)).join(' · ')+'.';
  if($('contrastDecomposition'))$('contrastDecomposition').innerHTML=contrastMaterialsModel.map((m,i)=>{const p=parts[i],near=Math.abs(p.longitudinal)<.08;return '<div class="contrast-decomp-row"><div class="contrast-decomp-head"><b>'+m.name+'</b><strong>'+Math.round((p.signal/max)*100)+'% normalized</strong></div><div class="contrast-factor-grid"><div class="contrast-factor '+(near?'near-zero':'')+'"><small>'+(state.mode==='ir'?'signed Mz':'T1 term')+'</small><b>'+(p.longitudinal>=0?'+':'')+p.longitudinal.toFixed(2)+'</b></div><div class="contrast-factor"><small>T2 factor</small><b>'+p.transverse.toFixed(2)+'</b></div><div class="contrast-factor"><small>PD-like</small><b>'+p.pd.toFixed(2)+'</b></div><div class="contrast-factor"><small>combined</small><b>'+p.signal.toFixed(3)+'</b></div></div></div>'}).join('');
  const spreads=[['Longitudinal / T1 term',contrastFactorSpread(parts,'longitudinal'),'TR/TI is creating the largest raw factor spread across the synthetic materials.'],['Transverse / T2 term',contrastFactorSpread(parts,'transverse'),'TE is creating the largest raw factor spread across the synthetic materials.'],['PD-like term',contrastFactorSpread(parts,'pd'),'The fixed PD-like values are currently the largest raw factor spread.']].sort((a,b)=>b[1]-a[1]);
  if($('contrastDriver'))$('contrastDriver').innerHTML='<small>Largest factor spread</small><b>'+escapeHtml(spreads[0][0])+'</b><span>'+escapeHtml(spreads[0][2])+' This is a factor-range cue, not a formal attribution of all final contrast.</span>';
  if($('contrastNullButtons'))$('contrastNullButtons').innerHTML=contrastMaterialsModel.map((m,i)=>'<button type="button" onclick="setContrastSyntheticNull('+i+')">'+m.name.replace('Material ','')+' ≈ '+Math.round(contrastNullTi(m,state.tr))+' ms</button>').join('');
  if($('contrastNullBox'))$('contrastNullBox').classList.toggle('active',state.mode==='ir');
  renderContrastChallenge(state,parts);
}
function setContrastSyntheticNull(index){
  const m=contrastMaterialsModel[index];if(!m)return;if($('clMode'))$('clMode').value='ir';if($('clTi'))$('clTi').value=Math.round(contrastNullTi(m,+($('clTr')?.value||3000))/25)*25;contrastUpdate();toast('Synthetic '+m.name+' null estimate loaded');
}
const contrastChallengeDefs={
  t1:{title:'Create T1 emphasis',hint:'Use SE-like timing so longitudinal recovery differences dominate while transverse decay stays limited.'},
  t2:{title:'Create T2 emphasis',hint:'Use SE-like timing so recovery differences shrink and transverse decay differences become prominent.'},
  pd:{title:'Create PD emphasis',hint:'Use long TR and short TE so both relaxation effects are reduced relative to the fixed PD-like differences.'},
  nullA:{title:'Null Material A',hint:'Use IR-like timing and move TI until Material A approaches its synthetic zero crossing.',material:0},
  nullB:{title:'Null Material B',hint:'Use IR-like timing and move TI until Material B approaches its synthetic zero crossing.',material:1},
  nullC:{title:'Null Material C',hint:'Use IR-like timing and move TI until Material C approaches its synthetic zero crossing.',material:2}
};
let activeContrastChallenge='';
function contrastChallengeStatus(state,parts){
  const id=activeContrastChallenge,def=contrastChallengeDefs[id];if(!def)return [];
  const cue=contrastTeachingCue(state),signals=parts.map(x=>x.signal),mx=Math.max(...signals,.000001),mn=Math.min(...signals),spread=(mx-mn)/mx;
  if(id==='t1'||id==='t2'||id==='pd'){
    const targetLabel=id==='t1'?'T1-emphasis':id==='t2'?'T2-emphasis':'PD-emphasis';
    return [
      {label:'Sequence model',met:state.mode==='se',goal:'SE-like',now:state.mode==='se'?'SE-like':'IR-like'},
      {label:'Weighting region',met:cue.label===targetLabel,goal:targetLabel,now:cue.label},
      {label:'Visible separation',met:spread>=.10,goal:'≥ 10% spread',now:Math.round(spread*100)+'% spread'}
    ];
  }
  const target=def.material,ratio=signals[target]/mx,isDimmest=signals[target]===mn;
  return [
    {label:'Sequence model',met:state.mode==='ir',goal:'IR-like',now:state.mode==='ir'?'IR-like':'SE-like'},
    {label:'Target signal',met:ratio<=.08,goal:'≤ 8% of brightest',now:Math.round(ratio*100)+'%'},
    {label:'Relative order',met:isDimmest,goal:'target is dimmest',now:isDimmest?'dimmest':'not dimmest'}
  ];
}
function renderContrastChallenge(state=contrastState(),parts=contrastMaterialsModel.map(m=>contrastSignalParts(m,state))){
  const def=contrastChallengeDefs[activeContrastChallenge],wrap=$('contrastChallengeConstraints'),pill=$('contrastChallengeState');
  document.querySelectorAll('[data-contrast-target]').forEach(b=>b.classList.toggle('active',b.dataset.contrastTarget===activeContrastChallenge));
  if(!def){if($('contrastChallengeTarget'))$('contrastChallengeTarget').textContent='Choose a target above.';if($('contrastChallengeHint'))$('contrastChallengeHint').textContent='Then use the existing TR / TE / TI controls to satisfy the teaching constraints.';if(wrap)wrap.innerHTML='';if(pill)pill.textContent='free explore';return}
  if($('contrastChallengeTarget'))$('contrastChallengeTarget').textContent=def.title;if($('contrastChallengeHint'))$('contrastChallengeHint').textContent=def.hint;
  const rows=contrastChallengeStatus(state,parts),met=rows.filter(x=>x.met).length;if(pill)pill.textContent=met+'/'+rows.length+' constraints'+(met===rows.length?' met':'');
  if(wrap)wrap.innerHTML=rows.map(x=>'<div class="contrast-challenge-constraint '+(x.met?'met':'miss')+'"><small>'+escapeHtml(x.label)+'</small><b>'+(x.met?'Met':'Adjust')+'</b><span>'+escapeHtml(x.goal)+' · now '+escapeHtml(x.now)+'</span></div>').join('');
}
function setContrastChallenge(id){if(!contrastChallengeDefs[id])return;activeContrastChallenge=id;renderContrastChallenge();toast('Contrast target selected')}
function clearContrastChallenge(){activeContrastChallenge='';renderContrastChallenge();toast('Contrast challenge cleared')}
function bindContrastDeepDive(){
  $('contrastChallengeTargets')?.addEventListener('click',e=>{const b=e.target.closest('[data-contrast-target]');if(b)setContrastChallenge(b.dataset.contrastTarget)});
  window.addEventListener('resize',()=>{if(!$('contrast')||$('contrast').hidden)return;const s=contrastState();contrastDrawRecovery(s);contrastDrawDecay(s)},{passive:true});
}

function contrastSignal(material,state){
  const t1=Math.max(1,material.t1),t2=Math.max(1,material.t2),tr=Math.max(1,state.tr),te=Math.max(0,state.te);
  const transverse=Math.exp(-te/t2);
  if(state.mode==='ir'){
    const ti=Math.max(0,state.ti),longitudinal=Math.abs(1-2*Math.exp(-ti/t1)+Math.exp(-tr/t1));
    return Math.max(0,material.pd*longitudinal*transverse);
  }
  return Math.max(0,material.pd*(1-Math.exp(-tr/t1))*transverse);
}
function contrastTeachingCue(state){
  if(state.mode==='ir')return {label:'TI-sensitive',detail:'Inversion timing can selectively suppress one synthetic material when its longitudinal term approaches zero.'};
  const t1Scale=900,t2Scale=100,trRatio=state.tr/t1Scale,teRatio=state.te/t2Scale;
  if(trRatio<1.1&&teRatio<.45)return {label:'T1-emphasis',detail:'Shorter TR keeps longitudinal-recovery differences prominent while short TE limits T2 decay.'};
  if(trRatio>2&&teRatio>.65)return {label:'T2-emphasis',detail:'Long TR reduces recovery differences while longer TE makes transverse-decay differences more visible.'};
  if(trRatio>2&&teRatio<.45)return {label:'PD-emphasis',detail:'Long TR and short TE reduce relaxation weighting, leaving PD-like differences relatively more visible.'};
  return {label:'Mixed weighting',detail:'TR and TE are both contributing materially to the current synthetic signal separation.'};
}
function persistContrastState(state){
  try{localStorage.setItem('mrcc_contrast_current',JSON.stringify({...state,savedAt:new Date().toISOString()}))}catch(e){}
}
function restoreContrastState(){
  let raw=null;try{raw=JSON.parse(localStorage.getItem('mrcc_contrast_current')||'null')}catch(e){}
  if(!raw||typeof raw!=='object'){contrastUpdate(false);return}
  const mode=raw.mode==='ir'?'ir':'se',tr=Math.min(5000,Math.max(300,+raw.tr||800)),te=Math.min(180,Math.max(10,+raw.te||20)),ti=Math.min(2500,Math.max(50,+raw.ti||600));
  if($('clMode'))$('clMode').value=mode;if($('clTr'))$('clTr').value=tr;if($('clTe'))$('clTe').value=te;if($('clTi'))$('clTi').value=ti;
  contrastUpdate(false);
}
function contrastUpdate(save=true){
  if(!$('clMode'))return;
  const state=contrastState(),signals=contrastMaterialsModel.map(m=>contrastSignal(m,state)),max=Math.max(...signals,.000001),min=Math.min(...signals),cue=contrastTeachingCue(state);
  $('clTrOut').textContent=Math.round(state.tr)+' ms';$('clTeOut').textContent=Math.round(state.te)+' ms';$('clTiOut').textContent=Math.round(state.ti)+' ms';
  $('clTiRow').hidden=state.mode!=='ir';$('clInvEvent').hidden=state.mode!=='ir';$('clModeBadge').textContent=state.mode==='ir'?'IR-like':'SE-like';
  $('contrastEquation').innerHTML=state.mode==='ir'?'<b>Teaching model</b><span>|1 − 2e<sup>−TI/T1</sup> + e<sup>−TR/T1</sup>| × e<sup>−TE/T2</sup> × PD-like</span>':'<b>Teaching model</b><span>(1 − e<sup>−TR/T1</sup>) × e<sup>−TE/T2</sup> × PD-like</span>';
  $('contrastMaterials').innerHTML=contrastMaterialsModel.map((m,i)=>{const normalized=signals[i]/max,pct=Math.round(normalized*100);return '<div class="contrast-material"><div class="contrast-material-head"><span><b>'+m.name+'</b><small>normalized signal</small></span><strong>'+pct+'%</strong></div><div class="contrast-signal-track"><i style="width:'+pct+'%"></i></div><div class="contrast-material-meta"><span>T1 '+m.t1+' ms</span><span>T2 '+m.t2+' ms</span><span>PD '+m.pd.toFixed(2)+'</span></div></div>'}).join('');
  const spread=Math.round(((max-min)/max)*100),brightIndex=signals.indexOf(max);
  $('clSpread').textContent=spread+'%';$('clBrightest').textContent=contrastMaterialsModel[brightIndex]?.name||'—';$('clCue').textContent=cue.label;$('clCueDetail').textContent=cue.detail;
  $('clTimelineTe').textContent='TE '+Math.round(state.te)+' ms';$('clTimelineTr').textContent='TR '+Math.round(state.tr)+' ms';$('clTimelineTi').textContent=state.mode==='ir'?'TI '+Math.round(state.ti)+' ms':'';
  $('clEchoEvent').style.left=Math.min(82,Math.max(12,(state.te/180)*75+8))+'%';$('clTrMarker').style.left=Math.min(96,Math.max(65,(state.tr/5000)*31+65))+'%';
  if(state.mode==='ir')$('clInvEvent').style.left=Math.min(58,Math.max(10,(state.ti/2500)*48+8))+'%';
  renderContrastDeep(state,signals);
  if(save)persistContrastState(state);
  if(typeof renderLabsHome==='function')renderLabsHome();
}
function applyContrastPreset(id){
  const presets={t1:{mode:'se',tr:500,te:15,ti:600},t2:{mode:'se',tr:3000,te:100,ti:600},pd:{mode:'se',tr:3000,te:15,ti:600},ir:{mode:'ir',tr:3000,te:20,ti:600}};
  const p=presets[id]||presets.t1;$('clMode').value=p.mode;$('clTr').value=p.tr;$('clTe').value=p.te;$('clTi').value=p.ti;contrastUpdate();toast('Contrast teaching preset loaded');
}
function contrastReset(){if($('clMode'))$('clMode').value='se';if($('clTr'))$('clTr').value=800;if($('clTe'))$('clTe').value=20;if($('clTi'))$('clTi').value=600;activeContrastChallenge='';contrastUpdate();toast('Contrast Lab reset')}
bindContrastDeepDive();
const KS_N=32;
let ksBaseImage=null,ksBaseFourier=null;
function kspaceBuildPhantom(){
  const n=KS_N,a=new Float64Array(n*n);
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){
    const dx=x-(n-1)/2,dy=y-(n-1)/2;let v=.035;
    if((dx*dx)/(11*11)+(dy*dy)/(13*13)<=1)v+=.34;
    if(((x-10)*(x-10)+(y-11)*(y-11))<=16)v+=.32;
    if(x>=18&&x<=25&&y>=19&&y<=25)v+=.20;
    if(((x-21)*(x-21)+(y-10)*(y-10))<=5)v+=.55;
    if(x>=8&&x<=23&&Math.abs(y-16)<=1)v+=.12;
    a[y*n+x]=Math.min(1,v);
  }
  return a;
}
function kspaceDft1D(re,im,inverse=false){
  const n=re.length,or=new Float64Array(n),oi=new Float64Array(n),sign=inverse?1:-1;
  for(let k=0;k<n;k++){
    let sr=0,si=0;
    for(let x=0;x<n;x++){
      const ang=sign*2*Math.PI*k*x/n,c=Math.cos(ang),sn=Math.sin(ang);
      sr+=re[x]*c-im[x]*sn;si+=re[x]*sn+im[x]*c;
    }
    if(inverse){sr/=n;si/=n}or[k]=sr;oi[k]=si;
  }
  return {re:or,im:oi};
}
function kspaceDft2D(real,inverse=false,imagInput=null){
  const n=KS_N,tmpR=new Float64Array(n*n),tmpI=new Float64Array(n*n),outR=new Float64Array(n*n),outI=new Float64Array(n*n);
  for(let y=0;y<n;y++){
    const rr=new Float64Array(n),ii=new Float64Array(n);
    for(let x=0;x<n;x++){rr[x]=real[y*n+x];ii[x]=imagInput?imagInput[y*n+x]:0}
    const row=kspaceDft1D(rr,ii,inverse);for(let x=0;x<n;x++){tmpR[y*n+x]=row.re[x];tmpI[y*n+x]=row.im[x]}
  }
  for(let x=0;x<n;x++){
    const rr=new Float64Array(n),ii=new Float64Array(n);
    for(let y=0;y<n;y++){rr[y]=tmpR[y*n+x];ii[y]=tmpI[y*n+x]}
    const col=kspaceDft1D(rr,ii,inverse);for(let y=0;y<n;y++){outR[y*n+x]=col.re[y];outI[y*n+x]=col.im[y]}
  }
  return {re:outR,im:outI};
}
function ensureKspaceBase(){
  if(ksBaseFourier)return;
  ksBaseImage=kspaceBuildPhantom();ksBaseFourier=kspaceDft2D(ksBaseImage,false);
}

function normalizeTimingState(raw){
  if(!raw||typeof raw!=='object')return null;
  const tr=Math.min(8000,Math.max(400,+raw.tr||3000));
  const firstEcho=Math.min(80,Math.max(8,+raw.firstEcho||14));
  const spacing=Math.min(40,Math.max(4,+raw.spacing||9));
  const etl=Math.min(32,Math.max(1,Math.round(+raw.etl||8)));
  const center=Math.min(etl,Math.max(1,Math.round(+raw.center||Math.ceil(etl/2))));
  const phase=Math.min(512,Math.max(64,Math.round((+raw.phase||256)/32)*32));
  const nex=Math.min(4,Math.max(1,Math.round((+raw.nex||1)*2)/2));
  return {tr,firstEcho,spacing,etl,center,phase,nex};
}
function timingState(){return normalizeTimingState({tr:+($('timingTr')?.value||3000),firstEcho:+($('timingFirstEcho')?.value||14),spacing:+($('timingSpacing')?.value||9),etl:+($('timingEtl')?.value||8),center:+($('timingCenter')?.value||4),phase:+($('timingPhase')?.value||256),nex:+($('timingNex')?.value||1)})}
function timingMetrics(state){
  const s=normalizeTimingState(state)||normalizeTimingState({});
  const trainSpan=s.firstEcho+(s.etl-1)*s.spacing,effectiveTe=s.firstEcho+(s.center-1)*s.spacing,trains=Math.ceil(s.phase/s.etl),timeSec=(s.tr/1000)*trains*s.nex,fit=trainSpan<s.tr,idle=Math.max(0,s.tr-trainSpan);
  return {trainSpan,effectiveTe,trains,timeSec,fit,idle};
}

const timingChallengeDefs={
  faster:{title:'Cut toy time, protect center timing',hint:'Reduce total toy time while keeping effective-TE-like timing near the starting stack.',start:{tr:3000,firstEcho:14,spacing:9,etl:8,center:4,phase:256,nex:1}},
  later:{title:'Move the center later without paying time',hint:'Shift the center-echo timing later while keeping toy total time close to the start.',start:{tr:3000,firstEcho:14,spacing:9,etl:8,center:4,phase:256,nex:1}},
  moreLines:{title:'Encode more phase lines without more toy time',hint:'Increase simplified phase-encode burden but offset it with train efficiency.',start:{tr:3000,firstEcho:14,spacing:9,etl:8,center:4,phase:256,nex:1}},
  longTrain:{title:'Build a long train with bounded timing',hint:'Use a long train while keeping the represented train span and center time inside the challenge guardrails.',start:{tr:3000,firstEcho:14,spacing:9,etl:8,center:4,phase:256,nex:1}}
};
let activeTimingChallenge='';
function timingEquationRows(state,metrics){
  const rows=[
    ['Effective-TE-like','first echo + (center − 1) × spacing',state.firstEcho+' + ('+state.center+' − 1) × '+state.spacing+' = '+Math.round(metrics.effectiveTe)+' ms'],
    ['Train end','first echo + (ETL − 1) × spacing',state.firstEcho+' + ('+state.etl+' − 1) × '+state.spacing+' = '+Math.round(metrics.trainSpan)+' ms'],
    ['Trains needed','ceil(phase encodes ÷ ETL)','ceil('+state.phase+' ÷ '+state.etl+') = '+metrics.trains],
    ['Toy time','TR × trains × NEX',(state.tr/1000).toFixed(1)+' s × '+metrics.trains+' × '+state.nex+' = '+formatTimingDuration(metrics.timeSec)]
  ];return rows;
}
function renderTimingDeep(state=timingState(),metrics=timingMetrics(state)){
  if($('timingEquationBreakdown'))$('timingEquationBreakdown').innerHTML=timingEquationRows(state,metrics).map(r=>'<div class="timing-equation-row"><div><small>'+escapeHtml(r[0])+'</small><b>'+escapeHtml(r[1])+'</b></div><span>'+escapeHtml(r[2])+'</span><strong>'+escapeHtml(r[0]==='Toy time'?formatTimingDuration(metrics.timeSec):r[0]==='Trains needed'?String(metrics.trains):r[0]==='Effective-TE-like'?Math.round(metrics.effectiveTe)+' ms':Math.round(metrics.trainSpan)+' ms')+'</strong></div>').join('');
  if($('timingKspaceStrip')){
    $('timingKspaceStrip').style.setProperty('--timing-cells',Math.max(1,state.etl));
    $('timingKspaceStrip').innerHTML=Array.from({length:state.etl},(_,i)=>{const n=i+1,time=state.firstEcho+i*state.spacing,center=n===state.center,pos=n-state.center,label=center?'center':pos<0?'−ky-like':'+ky-like';return '<div class="timing-kspace-cell '+(center?'center':'')+'"><small>'+escapeHtml(label)+'</small><b>E'+n+'</b><span>'+Math.round(time)+' ms</span></div>'}).join('');
  }
  if($('timingKspaceBadge'))$('timingKspaceBadge').textContent='echo '+state.center+' → center';
  if($('timingKspaceCopy'))$('timingKspaceCopy').textContent='In this abstract linear map, echo '+state.center+' carries the center-like assignment at '+Math.round(metrics.effectiveTe)+' ms. Earlier and later echoes are displayed on opposite sides only to make center timing visible; real FSE/TSE view ordering is implementation dependent.';
  if($('timingFirstLandmark'))$('timingFirstLandmark').textContent=Math.round(state.firstEcho)+' ms';
  if($('timingCenterLandmark'))$('timingCenterLandmark').textContent=Math.round(metrics.effectiveTe)+' ms';
  if($('timingLastLandmark'))$('timingLastLandmark').textContent=Math.round(metrics.trainSpan)+' ms';
  renderTimingChallenge(state,metrics);
}
function timingChallengeRows(id,state,metrics){
  const def=timingChallengeDefs[id];if(!def)return[];const sm=timingMetrics(def.start);
  if(id==='faster')return[
    {label:'Toy time',met:metrics.timeSec<=sm.timeSec*.65,goal:'≤ 65% of start',now:Math.round(metrics.timeSec/sm.timeSec*100)+'%'},
    {label:'Effective TE',met:Math.abs(metrics.effectiveTe-sm.effectiveTe)<=10,goal:'within ±10 ms',now:Math.round(metrics.effectiveTe)+' ms'},
    {label:'Train fits',met:metrics.fit,goal:'train < TR',now:metrics.fit?'fits':'exceeds'}
  ];
  if(id==='later')return[
    {label:'Center timing',met:metrics.effectiveTe>=90,goal:'≥ 90 ms',now:Math.round(metrics.effectiveTe)+' ms'},
    {label:'Toy time',met:Math.abs(metrics.timeSec-sm.timeSec)<=sm.timeSec*.05,goal:'within ±5% start',now:Math.round(metrics.timeSec/sm.timeSec*100)+'%'},
    {label:'Train fits',met:metrics.fit,goal:'train < TR',now:metrics.fit?'fits':'exceeds'}
  ];
  if(id==='moreLines')return[
    {label:'Phase encodes',met:state.phase>=384,goal:'≥ 384',now:String(state.phase)},
    {label:'Toy time',met:metrics.timeSec<=sm.timeSec,goal:'≤ start time',now:Math.round(metrics.timeSec/sm.timeSec*100)+'%'},
    {label:'Train fits',met:metrics.fit,goal:'train < TR',now:metrics.fit?'fits':'exceeds'}
  ];
  return[
    {label:'Echo train',met:state.etl>=24,goal:'ETL ≥ 24',now:'ETL '+state.etl},
    {label:'Train span',met:metrics.trainSpan<=250,goal:'≤ 250 ms',now:Math.round(metrics.trainSpan)+' ms'},
    {label:'Center timing',met:metrics.effectiveTe>=60&&metrics.effectiveTe<=120,goal:'60–120 ms',now:Math.round(metrics.effectiveTe)+' ms'}
  ];
}
function renderTimingChallenge(state=timingState(),metrics=timingMetrics(state)){
  const def=timingChallengeDefs[activeTimingChallenge],wrap=$('timingChallengeConstraints'),pill=$('timingChallengeState');
  document.querySelectorAll('[data-timing-challenge]').forEach(b=>b.classList.toggle('active',b.dataset.timingChallenge===activeTimingChallenge));
  if(!def){if($('timingChallengeTarget'))$('timingChallengeTarget').textContent='Choose a challenge.';if($('timingChallengeHint'))$('timingChallengeHint').textContent='MRCC will reset to the challenge start stack, then evaluate the live sliders.';if(wrap)wrap.innerHTML='';if(pill)pill.textContent='free explore';return}
  if($('timingChallengeTarget'))$('timingChallengeTarget').textContent=def.title;if($('timingChallengeHint'))$('timingChallengeHint').textContent=def.hint;
  const rows=timingChallengeRows(activeTimingChallenge,state,metrics),met=rows.filter(x=>x.met).length;if(pill)pill.textContent=met+'/'+rows.length+' constraints'+(met===rows.length?' met':'');
  if(wrap)wrap.innerHTML=rows.map(x=>'<div class="timing-challenge-constraint '+(x.met?'met':'miss')+'"><small>'+escapeHtml(x.label)+'</small><b>'+(x.met?'Met':'Adjust')+'</b><span>'+escapeHtml(x.goal)+' · now '+escapeHtml(x.now)+'</span></div>').join('');
}
function applyTimingState(state){for(const [key,id] of [['tr','timingTr'],['firstEcho','timingFirstEcho'],['spacing','timingSpacing'],['etl','timingEtl'],['center','timingCenter'],['phase','timingPhase'],['nex','timingNex']])if($(id))$(id).value=state[key]}
function startTimingChallenge(id){const def=timingChallengeDefs[id];if(!def)return;activeTimingChallenge=id;applyTimingState(def.start);timingUpdate();toast('Timing challenge started')}
function restartTimingChallenge(){const def=timingChallengeDefs[activeTimingChallenge];if(!def){toast('Choose a timing challenge first');return}applyTimingState(def.start);timingUpdate();toast('Timing challenge restarted')}
function clearTimingChallenge(){activeTimingChallenge='';renderTimingChallenge();toast('Timing challenge closed')}
function bindTimingDeepDive(){$('timingChallengeTargets')?.addEventListener('click',e=>{const b=e.target.closest('[data-timing-challenge]');if(b)startTimingChallenge(b.dataset.timingChallenge)})}

function timingCue(state,metrics=timingMetrics(state)){
  if(!metrics.fit)return {title:'Toy timing conflict',detail:'The represented echo train extends beyond the selected TR. Treat this only as a relationship cue; real scanners enforce many timing constraints that are not modeled here.'};
  if(state.etl===1)return {title:'Single-echo reference',detail:'One represented echo fills one simplified phase line per repetition window in this model.'};
  const frac=state.center/state.etl;
  if(frac<.35)return {title:'Earlier center echo',detail:'The abstract k-space-center assignment occurs early in the train, producing an earlier effective-TE-like readout.'};
  if(frac>.65)return {title:'Later center echo',detail:'The abstract center assignment occurs later in the train, increasing the effective-TE-like readout without changing train count.'};
  return {title:'Mid-train center',detail:'The chosen center echo sits near the middle of the simplified echo train.'};
}
function formatTimingDuration(seconds){
  const total=Math.max(0,Math.round(seconds)),m=Math.floor(total/60),sec=String(total%60).padStart(2,'0');
  return m?m+':'+sec:total+' s';
}
function persistTimingState(state){try{localStorage.setItem('mrcc_timing_current',JSON.stringify({...state,savedAt:new Date().toISOString()}))}catch(e){}}
function timingUpdate(save=true){
  if(!$('timingTr'))return;
  const etl=Math.max(1,Math.round(+$('timingEtl').value||8));$('timingCenter').max=etl;if(+$('timingCenter').value>etl)$('timingCenter').value=Math.ceil(etl/2);
  const state=timingState(),m=timingMetrics(state),cue=timingCue(state,m);
  $('timingTr').value=state.tr;$('timingFirstEcho').value=state.firstEcho;$('timingSpacing').value=state.spacing;$('timingEtl').value=state.etl;$('timingCenter').value=state.center;$('timingPhase').value=state.phase;$('timingNex').value=state.nex;
  $('timingTrOut').textContent=Math.round(state.tr)+' ms';$('timingFirstEchoOut').textContent=Math.round(state.firstEcho)+' ms';$('timingSpacingOut').textContent=Math.round(state.spacing)+' ms';$('timingEtlOut').textContent=state.etl;$('timingCenterOut').textContent=state.center;$('timingPhaseOut').textContent=state.phase;$('timingNexOut').textContent=state.nex+'×';
  $('timingCueTitle').textContent=cue.title;$('timingCueDetail').textContent=cue.detail;$('timingEffectiveTe').textContent=Math.round(m.effectiveTe)+' ms';$('timingTrainSpan').textContent=Math.round(m.trainSpan)+' ms';$('timingTrainCount').textContent=m.trains;$('timingTrainCountMeta').textContent=state.phase+' phase encodes ÷ ETL '+state.etl;$('timingTimeProxy').textContent=formatTimingDuration(m.timeSec);
  const fit=$('timingFitBadge'),timeCard=$('timingTimeCard');fit.textContent=m.fit?'fits toy TR':'train exceeds toy TR';fit.style.borderColor=m.fit?'':'#6b5430';timeCard.classList.toggle('timing-alert',!m.fit);
  const scaleMax=Math.max(state.tr,m.trainSpan*1.08),trPct=Math.min(99,(state.tr/scaleMax)*100),firstPct=Math.min(99,(state.firstEcho/scaleMax)*100),lastPct=Math.min(99,(m.trainSpan/scaleMax)*100);
  $('timingTrMarker').style.left=trPct+'%';$('timingTrainBand').style.left=firstPct+'%';$('timingTrainBand').style.width=Math.max(.8,lastPct-firstPct)+'%';
  $('timingEchoRow').innerHTML=Array.from({length:state.etl},(_,i)=>{const echoTime=state.firstEcho+i*state.spacing,pct=Math.min(99,(echoTime/scaleMax)*100),center=i+1===state.center;return '<span class="timing-echo '+(center?'center':'')+'" style="left:'+pct+'%" title="Echo '+(i+1)+' · '+Math.round(echoTime)+' ms"><i></i><small>'+(i+1)+'</small></span>'}).join('');
  $('timingScaleSummary').textContent='TR '+Math.round(state.tr)+' ms · train ends '+Math.round(m.trainSpan)+' ms · idle-like remainder '+Math.round(m.idle)+' ms';
  renderTimingDeep(state,m);
  if(save)persistTimingState(state);if(typeof renderLabsHome==='function')renderLabsHome();
}
function applyTimingPreset(id){
  const p={single:{tr:2500,firstEcho:14,spacing:9,etl:1,center:1,phase:256,nex:1},short:{tr:3000,firstEcho:14,spacing:9,etl:8,center:4,phase:256,nex:1},long:{tr:3000,firstEcho:14,spacing:9,etl:24,center:12,phase:256,nex:1},late:{tr:3000,firstEcho:14,spacing:9,etl:16,center:12,phase:256,nex:1}}[id]||{tr:3000,firstEcho:14,spacing:9,etl:8,center:4,phase:256,nex:1};
  for(const [key,id2] of [['tr','timingTr'],['firstEcho','timingFirstEcho'],['spacing','timingSpacing'],['etl','timingEtl'],['center','timingCenter'],['phase','timingPhase'],['nex','timingNex']])if($(id2))$(id2).value=p[key];
  timingUpdate();toast('Sequence Timing teaching preset loaded');
}
function restoreTimingState(){
  let raw=null;try{raw=JSON.parse(localStorage.getItem('mrcc_timing_current')||'null')}catch(e){}
  const state=normalizeTimingState(raw)||normalizeTimingState({});
  for(const [key,id] of [['tr','timingTr'],['firstEcho','timingFirstEcho'],['spacing','timingSpacing'],['etl','timingEtl'],['center','timingCenter'],['phase','timingPhase'],['nex','timingNex']])if($(id))$(id).value=state[key];
  timingUpdate(false);
}
function timingReset(){const p={tr:3000,firstEcho:14,spacing:9,etl:8,center:4,phase:256,nex:1};for(const [key,id] of [['tr','timingTr'],['firstEcho','timingFirstEcho'],['spacing','timingSpacing'],['etl','timingEtl'],['center','timingCenter'],['phase','timingPhase'],['nex','timingNex']])if($(id))$(id).value=p[key];timingUpdate();toast('Sequence Timing Lab reset')}
bindTimingDeepDive();


function normalizeMotionState(raw){
  if(!raw||typeof raw!=='object')return null;
  const mode=['none','step','periodic','drift'].includes(raw.mode)?raw.mode:'step',direction=raw.direction==='y'?'y':'x',order=raw.order==='centric'?'centric':'linear';
  const amplitude=Math.min(6,Math.max(0,+raw.amplitude||3)),onset=Math.min(90,Math.max(0,+raw.onset||50)),cycles=Math.min(6,Math.max(.5,Math.round((+raw.cycles||2)*2)/2));
  return {mode,direction,order,amplitude,onset,cycles};
}
function motionState(){return normalizeMotionState({mode:$('motionMode')?.value||'step',direction:$('motionDirection')?.value||'x',order:$('motionOrder')?.value||'linear',amplitude:+($('motionAmplitude')?.value||3),onset:+($('motionOnset')?.value||50),cycles:+($('motionCycles')?.value||2)})}
function motionSignedIndex(i){return i<KS_N/2?i:i-KS_N}
function motionPhaseOrder(order='linear'){
  const n=KS_N;if(order==='centric'){const out=[0];for(let d=1;out.length<n;d++){if(d<n/2)out.push(d);if(out.length<n)out.push((n-d)%n)}return out.slice(0,n)}
  const out=[];for(let ky=-n/2;ky<n/2;ky++)out.push((ky+n)%n);return out;
}
function motionDisplacementAt(rank,state){
  if(state.mode==='none'||state.amplitude<=0)return 0;
  const t=rank/Math.max(1,KS_N-1),start=state.onset/100;if(t<start)return 0;
  const u=Math.min(1,Math.max(0,(t-start)/Math.max(.001,1-start)));
  if(state.mode==='step')return state.amplitude;
  if(state.mode==='drift')return state.amplitude*u;
  if(state.mode==='periodic')return state.amplitude*Math.sin(2*Math.PI*state.cycles*u);
  return 0;
}
function motionAcquire(state){
  ensureKspaceBase();const order=motionPhaseOrder(state.order),rankByY=new Int16Array(KS_N),dispByRank=new Float64Array(KS_N),dispByY=new Float64Array(KS_N),re=new Float64Array(KS_N*KS_N),im=new Float64Array(KS_N*KS_N);
  order.forEach((y,rank)=>{rankByY[y]=rank;const d=motionDisplacementAt(rank,state);dispByRank[rank]=d;dispByY[y]=d});
  let affected=0,peak=0;
  for(let y=0;y<KS_N;y++){
    const d=dispByY[y];if(Math.abs(d)>.05)affected++;peak=Math.max(peak,Math.abs(d));const ky=motionSignedIndex(y);
    for(let x=0;x<KS_N;x++){
      const i=y*KS_N+x,kx=motionSignedIndex(x),shift=state.direction==='x'?kx*d:ky*d,ang=-2*Math.PI*shift/KS_N,c=Math.cos(ang),sn=Math.sin(ang),br=ksBaseFourier.re[i],bi=ksBaseFourier.im[i];
      re[i]=br*c-bi*sn;im[i]=br*sn+bi*c;
    }
  }
  const inv=kspaceDft2D(re,true,im),centerRank=rankByY[0],centerShift=dispByY[0];
  return {re,im,inv,order,rankByY,dispByRank,affected,peak,centerRank,centerShift};
}

function motionLineStats(acq){
  let centerSum=0,centerN=0,centerAffected=0,outerSum=0,outerN=0;
  for(let y=0;y<KS_N;y++){const ky=Math.abs(motionSignedIndex(y)),d=Math.abs(acq.dispByRank[acq.rankByY[y]]);if(ky<=4){centerSum+=d;centerN++;if(d>.05)centerAffected++}else{outerSum+=d;outerN++}}
  return {centerMean:centerN?centerSum/centerN:0,outerMean:outerN?outerSum/outerN:0,centerAffected,centerN};
}
function motionRenderLineMap(state,acq){
  const map=$('motionLineMap'),stats=motionLineStats(acq);if(map){const ys=motionPhaseOrder('linear');map.innerHTML=ys.map(y=>{const ky=motionSignedIndex(y),rank=acq.rankByY[y],d=acq.dispByRank[rank],level=state.amplitude?Math.min(100,Math.round(Math.abs(d)/state.amplitude*100)):0,center=Math.abs(ky)<=4,centerLine=ky===0;return '<div class="motion-line-cell '+(center?'center-band ':'')+(centerLine?'center-line ':'')+(Math.abs(d)>.05?'affected':'')+'" style="--motion-level:'+level+'%"><small>ky '+(ky>0?'+':'')+ky+'</small><b>rank '+(rank+1)+'</b><span>'+(d>=0?'+':'')+d.toFixed(2)+' px</span><i></i></div>'}).join('')}
  if($('motionCenterBandMean'))$('motionCenterBandMean').textContent=stats.centerMean.toFixed(2)+' px';if($('motionOuterMean'))$('motionOuterMean').textContent=stats.outerMean.toFixed(2)+' px';if($('motionCenterBandAffected'))$('motionCenterBandAffected').textContent=stats.centerAffected+' / '+stats.centerN;
  if($('motionLineCopy'))$('motionLineCopy').textContent='The current '+(state.order==='centric'?'centric':'linear')+' order acquires the synthetic center line at rank '+(acq.centerRank+1)+' of '+KS_N+'. Center-band mean shift is '+stats.centerMean.toFixed(2)+' px versus '+stats.outerMean.toFixed(2)+' px for outer lines.';
  return stats;
}
function motionOrderComparison(state){
  const linear=motionAcquire({...state,order:'linear'}),centric=motionAcquire({...state,order:'centric'}),ls=motionLineStats(linear),cs=motionLineStats(centric);
  return {linear,centric,linearStats:ls,centricStats:cs};
}
function renderMotionOrderCompare(state,comparison){
  drawMotionImage('motionLinearCanvas',comparison.linear.inv.re,comparison.linear.inv.im);drawMotionImage('motionCentricCanvas',comparison.centric.inv.re,comparison.centric.inv.im);
  const lp=Math.round(comparison.linear.centerRank/Math.max(1,KS_N-1)*100),cp=Math.round(comparison.centric.centerRank/Math.max(1,KS_N-1)*100);
  if($('motionLinearMeta'))$('motionLinearMeta').textContent='center line at '+lp+'% of run';if($('motionCentricMeta'))$('motionCentricMeta').textContent='center line at '+cp+'% of run';
  if($('motionLinearStats'))$('motionLinearStats').textContent='center-band mean '+comparison.linearStats.centerMean.toFixed(2)+' px · center shift '+Math.abs(comparison.linear.centerShift).toFixed(2)+' px';
  if($('motionCentricStats'))$('motionCentricStats').textContent='center-band mean '+comparison.centricStats.centerMean.toFixed(2)+' px · center shift '+Math.abs(comparison.centric.centerShift).toFixed(2)+' px';
  const diff=comparison.linearStats.centerMean-comparison.centricStats.centerMean;let copy='The two orderings expose the synthetic center band similarly for this motion pattern.';
  if(Math.abs(diff)>=.15){const lower=diff>0?'centric':'linear',higher=diff>0?'linear':'centric';copy=lower.charAt(0).toUpperCase()+lower.slice(1)+' ordering gives the center band less modeled translation here than '+higher+' ordering ('+Math.abs(diff).toFixed(2)+' px mean difference). This only describes center-band exposure in the toy model—not overall image quality.'}
  if($('motionOrderCompareCopy'))$('motionOrderCompareCopy').textContent=copy;
}
const motionChallengeDefs={
  protect:{title:'Protect the center band while motion still occurs',hint:'Keep meaningful motion in the run, but arrange timing/order so low-|ky| lines see little translation.',start:{mode:'step',direction:'x',order:'linear',amplitude:3,onset:50,cycles:2}},
  hitCenter:{title:'Make the center line see the shift',hint:'Arrange the motion so the synthetic k-space center is acquired after a substantial translation.',start:{mode:'step',direction:'x',order:'centric',amplitude:3,onset:50,cycles:2}},
  periodic:{title:'Create broad periodic inconsistency',hint:'Use periodic translation so many phase lines sample different object positions.',start:{mode:'step',direction:'x',order:'linear',amplitude:2.5,onset:20,cycles:2.5}}
};
let activeMotionChallenge='';
function motionChallengeRows(id,state,acq,stats){
  if(id==='protect')return[
    {label:'Motion remains',met:acq.affected>=8,goal:'≥ 8 lines affected',now:acq.affected+' lines'},
    {label:'Center shift',met:Math.abs(acq.centerShift)<=.25,goal:'≤ 0.25 px',now:Math.abs(acq.centerShift).toFixed(2)+' px'},
    {label:'Center-band mean',met:stats.centerMean<=.50,goal:'≤ 0.50 px',now:stats.centerMean.toFixed(2)+' px'}
  ];
  if(id==='hitCenter')return[
    {label:'Motion remains',met:acq.affected>=8,goal:'≥ 8 lines affected',now:acq.affected+' lines'},
    {label:'Center shift',met:Math.abs(acq.centerShift)>=2,goal:'≥ 2.0 px',now:Math.abs(acq.centerShift).toFixed(2)+' px'},
    {label:'Peak shift',met:acq.peak>=2,goal:'≥ 2.0 px',now:acq.peak.toFixed(2)+' px'}
  ];
  return[
    {label:'Pattern',met:state.mode==='periodic',goal:'periodic mode',now:state.mode},
    {label:'Line exposure',met:acq.affected>=24,goal:'≥ 24 lines affected',now:acq.affected+' lines'},
    {label:'Cycles',met:state.cycles>=2,goal:'≥ 2 cycles',now:state.cycles+' cycles'}
  ];
}
function renderMotionChallenge(state,acq,stats){
  const def=motionChallengeDefs[activeMotionChallenge],wrap=$('motionChallengeConstraints'),pill=$('motionChallengeState');document.querySelectorAll('[data-motion-challenge]').forEach(b=>b.classList.toggle('active',b.dataset.motionChallenge===activeMotionChallenge));
  if(!def){if($('motionChallengeTarget'))$('motionChallengeTarget').textContent='Choose a challenge.';if($('motionChallengeHint'))$('motionChallengeHint').textContent='MRCC will load a toy starting state, then score the live motion controls.';if(wrap)wrap.innerHTML='';if(pill)pill.textContent='free explore';return}
  if($('motionChallengeTarget'))$('motionChallengeTarget').textContent=def.title;if($('motionChallengeHint'))$('motionChallengeHint').textContent=def.hint;const rows=motionChallengeRows(activeMotionChallenge,state,acq,stats),met=rows.filter(x=>x.met).length;if(pill)pill.textContent=met+'/'+rows.length+' constraints'+(met===rows.length?' met':'');
  if(wrap)wrap.innerHTML=rows.map(x=>'<div class="motion-challenge-constraint '+(x.met?'met':'miss')+'"><small>'+escapeHtml(x.label)+'</small><b>'+(x.met?'Met':'Adjust')+'</b><span>'+escapeHtml(x.goal)+' · now '+escapeHtml(x.now)+'</span></div>').join('');
}
function applyMotionState(state){for(const [key,id] of [['mode','motionMode'],['direction','motionDirection'],['order','motionOrder'],['amplitude','motionAmplitude'],['onset','motionOnset'],['cycles','motionCycles']])if($(id))$(id).value=state[key]}
function startMotionChallenge(id){const def=motionChallengeDefs[id];if(!def)return;activeMotionChallenge=id;applyMotionState(def.start);motionUpdate();toast('Motion challenge started')}
function restartMotionChallenge(){const def=motionChallengeDefs[activeMotionChallenge];if(!def){toast('Choose a motion challenge first');return}applyMotionState(def.start);motionUpdate();toast('Motion challenge restarted')}
function clearMotionChallenge(){activeMotionChallenge='';const state=motionState(),acq=motionAcquire(state);renderMotionChallenge(state,acq,motionLineStats(acq));toast('Motion challenge closed')}
function renderMotionDeep(state,acq){const stats=motionRenderLineMap(state,acq),comparison=motionOrderComparison(state);renderMotionOrderCompare(state,comparison);renderMotionChallenge(state,acq,stats)}
function bindMotionDeepDive(){$('motionChallengeTargets')?.addEventListener('click',e=>{const b=e.target.closest('[data-motion-challenge]');if(b)startMotionChallenge(b.dataset.motionChallenge)})}

function motionTeachingCopy(state,acq=null){
  if(state.mode==='none')return {short:'No motion',title:'Stationary reference',detail:'Every synthetic Fourier line comes from the same phantom position.',dominant:'Reference',dominantDetail:'Use this as the stationary comparison.'};
  if(state.mode==='periodic')return {short:'Periodic',title:'Repeated phase inconsistency',detail:'Periodic translation changes line phase repeatedly across the synthetic acquisition.',dominant:'Ghost-like repetition',dominantDetail:'Periodic line inconsistency can produce repeated structure in this toy reconstruction.'};
  if(state.mode==='drift')return {short:'Slow drift',title:'Progressive inconsistency',detail:'The modeled object position changes gradually across acquired phase lines.',dominant:'Blur + ghost blend',dominantDetail:'A gradual phase ramp across acquisition produces a smeared, inconsistent reconstruction.'};
  return {short:'Single shift',title:'Two-state inconsistency',detail:'A sudden translation changes the phase relationship of lines acquired after the motion event.',dominant:'Ghost-like inconsistency',dominantDetail:'Two position states are mixed into one synthetic Fourier dataset.'};
}
function drawMotionImage(canvasId,real,imag=null){
  const c=$(canvasId);if(!c)return;const ctx=c.getContext('2d'),n=KS_N,cell=c.width/n;let vals,max=0;
  if(imag){vals=new Float64Array(n*n);for(let i=0;i<vals.length;i++){vals[i]=Math.hypot(real[i],imag[i]);if(vals[i]>max)max=vals[i]}}
  else{vals=real;for(let i=0;i<vals.length;i++)if(vals[i]>max)max=vals[i]}
  ctx.fillStyle='#030706';ctx.fillRect(0,0,c.width,c.height);
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){const q=max?Math.max(0,vals[y*n+x])/max:0,g=Math.max(0,Math.min(255,Math.round(Math.pow(q,.86)*255)));ctx.fillStyle='rgb('+g+','+g+','+g+')';ctx.fillRect(x*cell,y*cell,Math.ceil(cell),Math.ceil(cell))}
}
function drawMotionHistory(state,acq){
  const c=$('motionHistoryCanvas');if(!c)return;const ctx=c.getContext('2d'),w=c.width,h=c.height,pad=18,mid=h/2,max=Math.max(1,state.amplitude);
  ctx.clearRect(0,0,w,h);ctx.fillStyle='#050b09';ctx.fillRect(0,0,w,h);ctx.strokeStyle='rgba(255,255,255,.10)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(pad,mid);ctx.lineTo(w-pad,mid);ctx.stroke();
  ctx.strokeStyle='rgba(82,215,255,.15)';for(let i=0;i<5;i++){const x=pad+i*(w-2*pad)/4;ctx.beginPath();ctx.moveTo(x,12);ctx.lineTo(x,h-12);ctx.stroke()}
  ctx.strokeStyle='#ff9c7c';ctx.lineWidth=2;ctx.beginPath();acq.dispByRank.forEach((d,i)=>{const x=pad+i*(w-2*pad)/(KS_N-1),y=mid-(d/max)*(h*.38);if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)});ctx.stroke();
  const cx=pad+acq.centerRank*(w-2*pad)/(KS_N-1);ctx.strokeStyle='#52d7ff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(cx,10);ctx.lineTo(cx,h-10);ctx.stroke();ctx.fillStyle='#cfefff';ctx.font='11px system-ui';ctx.fillText('k-space center',Math.min(w-100,cx+5),18);
}
function motionConfigure(){
  const mode=$('motionMode')?.value||'step';if($('motionCyclesRow'))$('motionCyclesRow').hidden=mode!=='periodic';if($('motionOnsetRow'))$('motionOnsetRow').hidden=mode==='none';if($('motionAmplitudeRow'))$('motionAmplitudeRow').hidden=mode==='none';
}
function persistMotionState(state){try{localStorage.setItem('mrcc_motion_current',JSON.stringify({...state,savedAt:new Date().toISOString()}))}catch(e){}}
function motionUpdate(save=true){
  if(!$('motionMode'))return;motionConfigure();const state=motionState(),acq=motionAcquire(state),copy=motionTeachingCopy(state,acq),centerPct=Math.round((acq.centerRank/Math.max(1,KS_N-1))*100);
  drawMotionHistory(state,acq);ensureKspaceBase();drawMotionImage('motionReferenceCanvas',ksBaseImage);drawMotionImage('motionResultCanvas',acq.inv.re,acq.inv.im);
  $('motionAmplitudeOut').textContent=Number(state.amplitude).toFixed(state.amplitude%1?1:0)+' px';$('motionOnsetOut').textContent=Math.round(state.onset)+'%';$('motionCyclesOut').textContent=Number(state.cycles).toFixed(state.cycles%1?1:0);
  $('motionCueTitle').textContent=copy.title;$('motionCueDetail').textContent=copy.detail;$('motionEffectBadge').textContent=copy.short.toLowerCase();$('motionOrderSummary').textContent=(state.order==='centric'?'Centric':'Linear')+' phase ordering';$('motionCenterSummary').textContent='center line acquired '+centerPct+'% through run';
  $('motionAffected').textContent=acq.affected+' / '+KS_N;$('motionPeak').textContent=acq.peak.toFixed(acq.peak%1?1:0)+' px';$('motionCenterShift').textContent=Math.abs(acq.centerShift).toFixed(Math.abs(acq.centerShift)%1?1:0)+' px';$('motionDominant').textContent=copy.dominant;$('motionDominantDetail').textContent=copy.dominantDetail;
  renderMotionDeep(state,acq);
  if(save)persistMotionState(state);if(typeof renderLabsHome==='function')renderLabsHome();
}
function applyMotionPreset(id){
  const p={step:{mode:'step',direction:'x',order:'linear',amplitude:3,onset:50,cycles:2},periodic:{mode:'periodic',direction:'x',order:'linear',amplitude:2.5,onset:10,cycles:2.5},drift:{mode:'drift',direction:'y',order:'linear',amplitude:4,onset:0,cycles:2},centric:{mode:'step',direction:'x',order:'centric',amplitude:3,onset:50,cycles:2}}[id]||{mode:'step',direction:'x',order:'linear',amplitude:3,onset:50,cycles:2};
  for(const [key,id2] of [['mode','motionMode'],['direction','motionDirection'],['order','motionOrder'],['amplitude','motionAmplitude'],['onset','motionOnset'],['cycles','motionCycles']])if($(id2))$(id2).value=p[key];
  motionUpdate();toast('Motion teaching preset loaded');
}
function restoreMotionState(){
  let raw=null;try{raw=JSON.parse(localStorage.getItem('mrcc_motion_current')||'null')}catch(e){}
  const state=normalizeMotionState(raw)||normalizeMotionState({});
  for(const [key,id] of [['mode','motionMode'],['direction','motionDirection'],['order','motionOrder'],['amplitude','motionAmplitude'],['onset','motionOnset'],['cycles','motionCycles']])if($(id))$(id).value=state[key];
  motionUpdate(false);
}
function motionReset(){const p={mode:'step',direction:'x',order:'linear',amplitude:3,onset:50,cycles:2};activeMotionChallenge='';for(const [key,id] of [['mode','motionMode'],['direction','motionDirection'],['order','motionOrder'],['amplitude','motionAmplitude'],['onset','motionOnset'],['cycles','motionCycles']])if($(id))$(id).value=p[key];motionUpdate();toast('Motion Lab reset')}
bindMotionDeepDive();

function kspaceState(){return {mode:$('ksMode')?.value||'full',amount:+($('ksAmount')?.value||100)}}
function kspaceSignedIndex(i){return i<=KS_N/2?i:i-KS_N}
function kspaceMaskValue(x,y,state){
  const dx=Math.abs(kspaceSignedIndex(x)),dy=Math.abs(kspaceSignedIndex(y)),edge=Math.max(dx,dy),half=KS_N/2;
  if(state.mode==='center'){const r=Math.max(1,Math.round((state.amount/100)*half));return edge<=r?1:0}
  if(state.mode==='outer'){const r=Math.max(1,Math.round((state.amount/100)*half));return edge>=r?1:0}
  if(state.mode==='truncate'){const r=Math.max(1,Math.round((state.amount/100)*half));return dy<=r?1:0}
  if(state.mode==='undersample'){const accel=Math.max(1,Math.round(state.amount));return (Math.abs(kspaceSignedIndex(y))%accel===0)?1:0}
  return 1;
}
function kspaceApplyMask(state){
  ensureKspaceBase();const n=KS_N,re=new Float64Array(n*n),im=new Float64Array(n*n),mask=new Uint8Array(n*n);let kept=0;
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){const i=y*n+x,m=kspaceMaskValue(x,y,state);mask[i]=m;if(m){re[i]=ksBaseFourier.re[i];im[i]=ksBaseFourier.im[i];kept++}}
  return {re,im,mask,retained:kept/(n*n)};
}

function kspaceEnergyStats(masked){
  ensureKspaceBase();let total=0,kept=0,centerTotal=0,centerKept=0,outerTotal=0,outerKept=0;
  const bands=Array.from({length:5},()=>({total:0,kept:0,samples:0,keptSamples:0}));
  const maxR=Math.hypot(KS_N/2,KS_N/2);
  for(let y=0;y<KS_N;y++)for(let x=0;x<KS_N;x++){
    const i=y*KS_N+x,kx=kspaceSignedIndex(x),ky=kspaceSignedIndex(y),e=ksBaseFourier.re[i]*ksBaseFourier.re[i]+ksBaseFourier.im[i]*ksBaseFourier.im[i],on=!!masked.mask[i],edge=Math.max(Math.abs(kx),Math.abs(ky)),r=Math.hypot(kx,ky),bin=Math.min(4,Math.floor((r/maxR)*5));
    total+=e;if(on)kept+=e;if(edge<=4){centerTotal+=e;if(on)centerKept+=e}else{outerTotal+=e;if(on)outerKept+=e}
    bands[bin].total+=e;bands[bin].samples++;if(on){bands[bin].kept+=e;bands[bin].keptSamples++}
  }
  return {energyRetained:total?kept/total:0,centerRetained:centerTotal?centerKept/centerTotal:0,outerRetained:outerTotal?outerKept/outerTotal:0,efficiency:masked.retained?((total?kept/total:0)/masked.retained):0,bands};
}
function kspaceMaskPsf(masked){
  const re=new Float64Array(KS_N*KS_N),im=new Float64Array(KS_N*KS_N);for(let i=0;i<re.length;i++)re[i]=masked.mask[i]?1:0;
  const inv=kspaceDft2D(re,true,im),mag=new Float64Array(re.length);let peak=0,side=0;for(let i=0;i<mag.length;i++){mag[i]=Math.hypot(inv.re[i],inv.im[i]);peak=Math.max(peak,mag[i])}
  const c=0; // unshifted impulse peak lives at index 0,0
  let halfCount=0;for(let y=0;y<KS_N;y++)for(let x=0;x<KS_N;x++){const i=y*KS_N+x;if(mag[i]>=peak*.5)halfCount++;const dx=Math.min(x,KS_N-x),dy=Math.min(y,KS_N-y);if(dx>1||dy>1)side=Math.max(side,mag[i])}
  return {mag,peak,sideRatio:peak?side/peak:0,halfCount};
}
function drawKspacePsf(masked){
  const c=$('ksPsfCanvas');if(!c)return null;const psf=kspaceMaskPsf(masked),ctx=c.getContext('2d'),n=KS_N,cell=c.width/n;ctx.fillStyle='#030706';ctx.fillRect(0,0,c.width,c.height);
  for(let vy=0;vy<n;vy++)for(let vx=0;vx<n;vx++){const x=(vx+n/2)%n,y=(vy+n/2)%n,i=y*n+x,q=psf.peak?psf.mag[i]/psf.peak:0,g=Math.round(Math.pow(q,.45)*255);ctx.fillStyle='rgb('+Math.round(g*.78)+','+Math.round(g*.72)+','+Math.round(g*.38)+')';ctx.fillRect(vx*cell,vy*cell,Math.ceil(cell),Math.ceil(cell))}
  return psf;
}
const kspaceChallengeDefs={
  efficient:{title:'Retain concentrated center energy with fewer samples',hint:'Use a central mask so sample count falls while the synthetic phantom’s Fourier-energy retention stays high.',start:{mode:'full',amount:100}},
  alias:{title:'Create uniform phase aliasing',hint:'Use regular phase undersampling rather than cropping the center or periphery.',start:{mode:'full',amount:100}},
  truncate:{title:'Create directional truncation',hint:'Use a hard ky cutoff with a moderate retained fraction.',start:{mode:'full',amount:100}},
  edges:{title:'Suppress broad low-frequency structure',hint:'Remove the center so the retained dataset emphasizes peripheral spatial-frequency content.',start:{mode:'full',amount:100}}
};
let activeKspaceChallenge='';
function kspaceChallengeRows(id,state,masked,stats){
  const retained=masked.retained;
  if(id==='efficient')return[
    {label:'Mask type',met:state.mode==='center',goal:'central retention',now:state.mode},
    {label:'Samples',met:retained<=.35,goal:'≤ 35%',now:Math.round(retained*100)+'%'},
    {label:'Energy',met:stats.energyRetained>=.95,goal:'≥ 95%',now:Math.round(stats.energyRetained*100)+'%'}
  ];
  if(id==='alias')return[
    {label:'Mask type',met:state.mode==='undersample',goal:'uniform undersampling',now:state.mode},
    {label:'Acceleration',met:state.mode==='undersample'&&state.amount>=2,goal:'R ≥ 2',now:state.mode==='undersample'?'R'+Math.round(state.amount):'—'},
    {label:'Samples',met:retained<=.55,goal:'≤ 55%',now:Math.round(retained*100)+'%'}
  ];
  if(id==='truncate')return[
    {label:'Mask type',met:state.mode==='truncate',goal:'hard ky cutoff',now:state.mode},
    {label:'Samples',met:retained>=.40&&retained<=.70,goal:'40–70%',now:Math.round(retained*100)+'%'},
    {label:'Off-center PSF',met:true,goal:'inspect ringing response',now:'see mask response'}
  ];
  return[
    {label:'Mask type',met:state.mode==='outer',goal:'center removed',now:state.mode},
    {label:'Center energy',met:stats.centerRetained<=.10,goal:'≤ 10% retained',now:Math.round(stats.centerRetained*100)+'%'},
    {label:'Outer energy',met:stats.outerRetained>=.35,goal:'≥ 35% retained',now:Math.round(stats.outerRetained*100)+'%'}
  ];
}
function renderKspaceChallenge(state,masked,stats){
  const def=kspaceChallengeDefs[activeKspaceChallenge],wrap=$('ksChallengeConstraints'),pill=$('ksChallengeState');document.querySelectorAll('[data-kspace-challenge]').forEach(b=>b.classList.toggle('active',b.dataset.kspaceChallenge===activeKspaceChallenge));
  if(!def){if($('ksChallengeTarget'))$('ksChallengeTarget').textContent='Choose a challenge.';if($('ksChallengeHint'))$('ksChallengeHint').textContent='MRCC will load a teaching start state, then evaluate the current mask.';if(wrap)wrap.innerHTML='';if(pill)pill.textContent='free explore';return}
  if($('ksChallengeTarget'))$('ksChallengeTarget').textContent=def.title;if($('ksChallengeHint'))$('ksChallengeHint').textContent=def.hint;const rows=kspaceChallengeRows(activeKspaceChallenge,state,masked,stats),met=rows.filter(x=>x.met).length;if(pill)pill.textContent=met+'/'+rows.length+' constraints'+(met===rows.length?' met':'');
  if(wrap)wrap.innerHTML=rows.map(x=>'<div class="kspace-challenge-constraint '+(x.met?'met':'miss')+'"><small>'+escapeHtml(x.label)+'</small><b>'+(x.met?'Met':'Adjust')+'</b><span>'+escapeHtml(x.goal)+' · now '+escapeHtml(x.now)+'</span></div>').join('');
}
function renderKspaceDeep(state,masked){
  const stats=kspaceEnergyStats(masked),psf=drawKspacePsf(masked),ret=Math.round(masked.retained*100),energy=Math.round(stats.energyRetained*100);
  if($('ksEnergyBadge'))$('ksEnergyBadge').textContent=energy+'% energy';if($('ksDeepSamples'))$('ksDeepSamples').textContent=ret+'%';if($('ksEnergyRetained'))$('ksEnergyRetained').textContent=energy+'%';if($('ksEnergyEfficiency'))$('ksEnergyEfficiency').textContent=stats.efficiency.toFixed(2)+'×';
  if($('ksEnergyBands'))$('ksEnergyBands').innerHTML=stats.bands.map((b,i)=>{const frac=b.total?b.kept/b.total:0,names=['center','low-mid','mid','high-mid','outer'];return '<div class="kspace-energy-band"><span>'+names[i]+'</span><div class="kspace-energy-track"><i style="--energy-level:'+Math.round(frac*100)+'%"></i></div><strong>'+Math.round(frac*100)+'%</strong><small>'+Math.round((b.total/(stats.bands.reduce((s,x)=>s+x.total,0)||1))*100)+'% of original energy lives in this band</small></div>'}).join('');
  if(psf){if($('ksPsfMain'))$('ksPsfMain').textContent=psf.halfCount+' px';if($('ksPsfSide'))$('ksPsfSide').textContent=Math.round(psf.sideRatio*100)+'%';if($('ksPsfBadge'))$('ksPsfBadge').textContent=state.mode==='full'?'reference impulse':state.mode+' mask';if($('ksPsfCopy'))$('ksPsfCopy').textContent=state.mode==='full'?'Full sampling produces the discrete reference impulse in this mask-only model.':'The current binary mask produces a half-peak support of '+psf.halfCount+' pixels and a largest off-center response of '+Math.round(psf.sideRatio*100)+'% of the peak. Compare pattern shape rather than treating these as scanner specifications.'}
  renderKspaceChallenge(state,masked,stats);
}
function applyKspaceState(state){if($('ksMode'))$('ksMode').value=state.mode;if($('ksAmount'))$('ksAmount').value=state.amount}
function startKspaceChallenge(id){const def=kspaceChallengeDefs[id];if(!def)return;activeKspaceChallenge=id;applyKspaceState(def.start);kspaceUpdate();toast('K-space challenge started')}
function restartKspaceChallenge(){const def=kspaceChallengeDefs[activeKspaceChallenge];if(!def){toast('Choose a k-space challenge first');return}applyKspaceState(def.start);kspaceUpdate();toast('K-space challenge restarted')}
function clearKspaceChallenge(){activeKspaceChallenge='';const state=kspaceState(),masked=kspaceApplyMask(state),stats=kspaceEnergyStats(masked);renderKspaceChallenge(state,masked,stats);toast('K-space challenge closed')}
function bindKspaceDeepDive(){$('ksChallengeTargets')?.addEventListener('click',e=>{const b=e.target.closest('[data-kspace-challenge]');if(b)startKspaceChallenge(b.dataset.kspaceChallenge)})}

function kspaceModeSummary(state){
  if(state.mode==='center')return {title:'Center only · '+Math.round(state.amount)+'% radius',meta:'Low spatial frequencies emphasized'};
  if(state.mode==='outer')return {title:'Center removed · '+Math.round(state.amount)+'% radius',meta:'High spatial frequencies emphasized'};
  if(state.mode==='truncate')return {title:'Phase truncation · '+Math.round(state.amount)+'%',meta:'Hard ky cutoff'};
  if(state.mode==='undersample')return {title:'Phase undersampling · R'+Math.round(state.amount),meta:'Every '+Math.round(state.amount)+'th ky line retained'};
  return {title:'Full sampling',meta:'100% samples retained · reference reconstruction'};
}
function kspaceTeachingCopy(state){
  if(state.mode==='center')return {effect:'Low-pass blur',detail:'Central coefficients preserve broad intensity structure while missing peripheral frequencies reduce fine edge detail.',key:'Center carries broad structure',keyDetail:'Retaining more of the center improves coarse image formation but cannot recover omitted high-frequency detail.'};
  if(state.mode==='outer')return {effect:'Edge-dominant image',detail:'Suppressing the center removes much of the slowly varying intensity information and leaves high-frequency transitions prominent.',key:'Periphery carries rapid variation',keyDetail:'Outer k-space contributes strongly to edges and fine spatial changes; it is not a standalone anatomical image.'};
  if(state.mode==='truncate')return {effect:'Directional truncation',detail:'A hard cutoff in the phase-frequency direction removes high ky content and can create blur plus ringing near sharp transitions.',key:'Hard cutoffs have consequences',keyDetail:'Abruptly limiting sampled spatial frequencies changes point-spread behavior rather than simply lowering “resolution.”'};
  if(state.mode==='undersample')return {effect:'Phase aliasing',detail:'Regularly skipping phase-encoding lines produces periodic replicas in the inverse transform of this Cartesian teaching model.',key:'Sampling pattern matters',keyDetail:'Uniform undersampling is different from merely cropping k-space; missing lines change the reconstructed field of view relationship.'};
  return {effect:'Reference',detail:'All synthetic Fourier coefficients are retained.',key:'Center + periphery contribute differently',keyDetail:'Use the full reconstruction as the comparison state for the masking experiments.'};
}
function drawKspaceMagnitude(masked){
  const c=$('ksKspaceCanvas');if(!c)return;const ctx=c.getContext('2d'),n=KS_N,cell=c.width/n;let max=0,vals=new Float64Array(n*n);
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){const src=y*n+x,mag=Math.hypot(masked.re[src],masked.im[src]),v=Math.log1p(mag);vals[src]=v;if(masked.mask[src]&&v>max)max=v}
  ctx.fillStyle='#050b09';ctx.fillRect(0,0,c.width,c.height);
  for(let vy=0;vy<n;vy++)for(let vx=0;vx<n;vx++){
    const x=(vx+n/2)%n,y=(vy+n/2)%n,i=y*n+x,on=masked.mask[i],q=max?vals[i]/max:0,g=on?Math.round(18+220*Math.pow(q,.62)):8;
    ctx.fillStyle=on?'rgb('+Math.round(g*.55)+','+Math.round(g*.82)+','+g+')':'rgb(8,14,12)';
    ctx.fillRect(vx*cell,vy*cell,Math.ceil(cell),Math.ceil(cell));
  }
  ctx.strokeStyle='rgba(255,255,255,.08)';ctx.lineWidth=1;ctx.strokeRect(c.width/2-cell/2,c.height/2-cell/2,cell,cell);
}
function drawKspaceImage(masked){
  const c=$('ksImageCanvas');if(!c)return;const ctx=c.getContext('2d'),inv=kspaceDft2D(masked.re,true,masked.im),n=KS_N,cell=c.width/n;let max=0,vals=new Float64Array(n*n);
  for(let i=0;i<vals.length;i++){vals[i]=Math.hypot(inv.re[i],inv.im[i]);if(vals[i]>max)max=vals[i]}
  ctx.fillStyle='#030706';ctx.fillRect(0,0,c.width,c.height);
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){const q=max?vals[y*n+x]/max:0,g=Math.max(0,Math.min(255,Math.round(Math.pow(q,.86)*255)));ctx.fillStyle='rgb('+g+','+g+','+g+')';ctx.fillRect(x*cell,y*cell,Math.ceil(cell),Math.ceil(cell))}
}
function persistKspaceState(state){try{localStorage.setItem('mrcc_kspace_current',JSON.stringify({...state,savedAt:new Date().toISOString()}))}catch(e){}}
function kspaceConfigureControl(state){
  const slider=$('ksAmount'),row=$('ksAmountRow'),label=$('ksAmountLabel'),hint=$('ksAmountHint');
  if(!slider||!row)return;
  if(state.mode==='full'){row.hidden=true;return}
  row.hidden=false;
  if(state.mode==='undersample'){slider.min=1;slider.max=4;slider.step=1;if(+slider.value>4||+slider.value<1)slider.value=2;label.textContent='Acceleration factor';hint.textContent='Retain every R-th phase line.'}
  else{slider.min=20;slider.max=100;slider.step=5;if(+slider.value<20||+slider.value>100)slider.value=state.mode==='outer'?40:55;label.textContent=state.mode==='outer'?'Removed-center radius':state.mode==='truncate'?'Retained phase bandwidth':'Retained-center radius';hint.textContent=state.mode==='outer'?'Larger values suppress more low spatial frequencies.':state.mode==='truncate'?'Controls the hard ky cutoff.':'Controls the central square retained.'}
}
function kspaceUpdate(save=true){
  if(!$('ksMode'))return;let state=kspaceState();kspaceConfigureControl(state);state=kspaceState();
  const masked=kspaceApplyMask(state),copy=kspaceTeachingCopy(state),summary=kspaceModeSummary(state),ret=Math.round(masked.retained*100);
  drawKspaceMagnitude(masked);drawKspaceImage(masked);
  $('ksAmountOut').textContent=state.mode==='undersample'?'R'+Math.round(state.amount):Math.round(state.amount)+'%';
  $('ksRetainedBadge').textContent=ret+'% retained';$('ksRetained').textContent=ret+'%';$('ksEffectBadge').textContent=copy.effect.toLowerCase();$('ksEffect').textContent=copy.effect;$('ksEffectDetail').textContent=copy.detail;$('ksKeyIdea').textContent=copy.key;$('ksKeyDetail').textContent=copy.keyDetail;$('ksExplain').innerHTML='<b>'+summary.title+'</b><span>'+summary.meta+'</span>';
  renderKspaceDeep(state,masked);
  if(save)persistKspaceState(state);if(typeof renderLabsHome==='function')renderLabsHome();
}
function kspaceModeChanged(){
  const mode=$('ksMode').value,slider=$('ksAmount');
  if(mode==='full')slider.value=100;else if(mode==='center')slider.value=45;else if(mode==='outer')slider.value=35;else if(mode==='truncate')slider.value=55;else slider.value=2;
  kspaceUpdate();
}
function applyKspacePreset(id){
  const p={center:{mode:'center',amount:40},outer:{mode:'outer',amount:35},truncate:{mode:'truncate',amount:55},r2:{mode:'undersample',amount:2}}[id]||{mode:'full',amount:100};
  $('ksMode').value=p.mode;$('ksAmount').value=p.amount;kspaceUpdate();toast('K-Space teaching experiment loaded');
}
function restoreKspaceState(){
  let raw=null;try{raw=JSON.parse(localStorage.getItem('mrcc_kspace_current')||'null')}catch(e){}
  if(!raw||typeof raw!=='object'){kspaceReset(false);return}
  const modes=['full','center','outer','truncate','undersample'],mode=modes.includes(raw.mode)?raw.mode:'full',amount=mode==='undersample'?Math.min(4,Math.max(1,Math.round(+raw.amount||2))):Math.min(100,Math.max(20,+raw.amount||100));
  $('ksMode').value=mode;$('ksAmount').value=amount;kspaceUpdate(false);
}
function kspaceReset(notify=true){activeKspaceChallenge='';if($('ksMode'))$('ksMode').value='full';if($('ksAmount'))$('ksAmount').value=100;kspaceUpdate();if(notify)toast('K-Space Lab reset')}
bindKspaceDeepDive();

function normalizeSpatialState(raw){
  const x=raw&&typeof raw==='object'?raw:{};
  return {
    phaseFov:Math.min(140,Math.max(50,+x.phaseFov||100)),
    readFov:Math.min(140,Math.max(50,+x.readFov||100)),
    phaseSamples:Math.min(192,Math.max(48,Math.round((+x.phaseSamples||128)/16)*16)),
    readSamples:Math.min(192,Math.max(48,Math.round((+x.readSamples||128)/16)*16))
  };
}
function spatialState(){return normalizeSpatialState({phaseFov:+($('spPhaseFov')?.value||100),readFov:+($('spReadFov')?.value||100),phaseSamples:+($('spPhaseSamples')?.value||128),readSamples:+($('spReadSamples')?.value||128)})}
const spatialFeatures=[[-.23,-.10,.105,.78],[.20,.12,.085,.96],[-.08,.25,.065,.62],[.28,-.24,.055,.72],[-.34,.25,.045,.55]];

const spatialFeatureNames=['A','B','C','D','E'];
function spatialWrapCoord(value,fov){
  const half=fov/2;let out=((value+half)%fov+fov)%fov-half;if(Math.abs(out-half)<1e-9)out=-half;return out;
}
function spatialFeatureProvenance(state){
  const rf=state.readFov/100,pf=state.phaseFov/100;
  return spatialFeatures.map((f,i)=>{const x=f[0],y=f[1],dx=spatialWrapCoord(x,rf),dy=spatialWrapCoord(y,pf),wrapX=Math.abs(dx-x)>.0001,wrapY=Math.abs(dy-y)>.0001;return {name:spatialFeatureNames[i],x,y,dx,dy,wrapX,wrapY,wrapped:wrapX||wrapY}});
}
function spatialCoord(v){return (v>=0?'+':'')+v.toFixed(2)}
function renderSpatialProvenance(state,metrics){
  const rows=spatialFeatureProvenance(state),wrapped=rows.filter(x=>x.wrapped),box=$('spatialProvenanceList');
  if($('spatialProvenanceBadge'))$('spatialProvenanceBadge').textContent=wrapped.length?wrapped.length+' feature center'+(wrapped.length===1?'':'s')+' wrapped':'no feature-center wrap';
  if(box)box.innerHTML=rows.map(r=>{const why=!r.wrapped?'inside encoded interval':r.wrapX&&r.wrapY?'read + phase periodic remap':r.wrapX?'read periodic remap':'phase periodic remap';return '<div class="spatial-provenance-row '+(r.wrapped?'wrap':'')+'"><b>Feature '+r.name+'</b><span>read '+spatialCoord(r.x)+' · phase '+spatialCoord(r.y)+'</span><span class="spatial-provenance-arrow">read '+spatialCoord(r.dx)+' · phase '+spatialCoord(r.dy)+'</span><span>'+why+'</span></div>'}).join('');
}
function spatialAxisAnatomy(state,metrics){
  const readCoverage=Math.min(100,state.readFov/140*100),phaseCoverage=Math.min(100,state.phaseFov/140*100),readPixel=Math.min(100,metrics.readPixel/1.5*100),phasePixel=Math.min(100,metrics.phasePixel/1.5*100);
  if($('spatialReadEquation'))$('spatialReadEquation').textContent=Math.round(state.readFov)+'% ÷ '+state.readSamples+' = '+metrics.readPixel.toFixed(2)+'× baseline pixel width';
  if($('spatialPhaseEquation'))$('spatialPhaseEquation').textContent=Math.round(state.phaseFov)+'% ÷ '+state.phaseSamples+' = '+metrics.phasePixel.toFixed(2)+'× baseline pixel width';
  if($('spatialReadCoverageBar'))$('spatialReadCoverageBar').style.setProperty('--coverage',readCoverage+'%');if($('spatialReadPixelBar'))$('spatialReadPixelBar').style.setProperty('--pixel',readPixel+'%');
  if($('spatialPhaseCoverageBar'))$('spatialPhaseCoverageBar').style.setProperty('--coverage',phaseCoverage+'%');if($('spatialPhasePixelBar'))$('spatialPhasePixelBar').style.setProperty('--pixel',phasePixel+'%');
  if($('spatialReadAnatomy'))$('spatialReadAnatomy').textContent=Math.round(state.readFov)+'% coverage · '+metrics.readPixel.toFixed(2)+'× relative pixel width · '+state.readSamples+' samples';
  if($('spatialPhaseAnatomy'))$('spatialPhaseAnatomy').textContent=Math.round(state.phaseFov)+'% coverage · '+metrics.phasePixel.toFixed(2)+'× relative pixel width · '+state.phaseSamples+' samples';
  const wrap=metrics.phaseWrap||metrics.readWrap,coarse=metrics.phasePixel>1.08||metrics.readPixel>1.08,fine=metrics.phasePixel<.92||metrics.readPixel<.92;
  let diagnosis='Both axes are close to the 100% FOV / 128-sample reference.';
  if(wrap)diagnosis='Coverage is the active problem: '+(metrics.phaseWrap&&metrics.readWrap?'both encoded axes are undersized.':metrics.phaseWrap?'phase FOV is undersized while read coverage remains contained.':'read FOV is undersized while phase coverage remains contained.')+' Sample count changes pixel width but does not repair periodic wrap by itself.';
  else if(coarse)diagnosis='Coverage is contained, but at least one axis has a larger-than-baseline pixel width because FOV is large relative to its sample count.';
  else if(fine)diagnosis='Coverage is contained and at least one axis has a smaller-than-baseline pixel width because sample density is higher relative to its FOV.';
  if($('spatialGridDiagnosis'))$('spatialGridDiagnosis').textContent=diagnosis;
}
const spatialChallengeDefs={
  phaseOnly:{title:'Create phase-only wrap',hint:'Undersize phase coverage while keeping read coverage contained.',start:{phaseFov:100,readFov:100,phaseSamples:128,readSamples:128}},
  coarse:{title:'Keep coverage contained but make the grid coarse',hint:'Change sample density rather than FOV wrap.',start:{phaseFov:100,readFov:100,phaseSamples:128,readSamples:128}},
  expand:{title:'Expand coverage without substantially coarsening pixels',hint:'Increase FOV and raise sample count with it.',start:{phaseFov:100,readFov:100,phaseSamples:128,readSamples:128}},
  repair:{title:'Repair a two-axis wrapped field',hint:'Start undersized, remove wrap, and keep both relative pixel widths at or below 1.10×.',start:{phaseFov:65,readFov:65,phaseSamples:96,readSamples:96}}
};
let activeSpatialChallenge='';
function spatialChallengeRows(id,state,m){
  if(id==='phaseOnly')return[
    {label:'Phase coverage',met:m.phaseWrap,goal:'phase wrap active',now:state.phaseFov+'%'},
    {label:'Read coverage',met:!m.readWrap,goal:'read contained',now:state.readFov+'%'},
    {label:'Phase pixel',met:m.phasePixel<=1,goal:'≤ 1.00×',now:m.phasePixel.toFixed(2)+'×'}
  ];
  if(id==='coarse')return[
    {label:'Coverage',met:!m.phaseWrap&&!m.readWrap,goal:'no wrap',now:(m.phaseWrap||m.readWrap)?'wrapped':'contained'},
    {label:'Read pixel',met:m.readPixel>=1.5,goal:'≥ 1.50×',now:m.readPixel.toFixed(2)+'×'},
    {label:'Phase pixel',met:m.phasePixel>=1.5,goal:'≥ 1.50×',now:m.phasePixel.toFixed(2)+'×'}
  ];
  if(id==='expand')return[
    {label:'Coverage',met:state.phaseFov>=120&&state.readFov>=120,goal:'both FOV ≥ 120%',now:state.readFov+'% / '+state.phaseFov+'%'},
    {label:'Read pixel',met:m.readPixel<=1.05,goal:'≤ 1.05×',now:m.readPixel.toFixed(2)+'×'},
    {label:'Phase pixel',met:m.phasePixel<=1.05,goal:'≤ 1.05×',now:m.phasePixel.toFixed(2)+'×'}
  ];
  return[
    {label:'Wrap repaired',met:!m.phaseWrap&&!m.readWrap,goal:'both axes contained',now:(m.phaseWrap||m.readWrap)?'still wrapped':'contained'},
    {label:'Read pixel',met:m.readPixel<=1.10,goal:'≤ 1.10×',now:m.readPixel.toFixed(2)+'×'},
    {label:'Phase pixel',met:m.phasePixel<=1.10,goal:'≤ 1.10×',now:m.phasePixel.toFixed(2)+'×'}
  ];
}
function renderSpatialChallenge(state,m){
  const def=spatialChallengeDefs[activeSpatialChallenge],wrap=$('spatialChallengeConstraints'),pill=$('spatialChallengeState');document.querySelectorAll('[data-spatial-challenge]').forEach(b=>b.classList.toggle('active',b.dataset.spatialChallenge===activeSpatialChallenge));
  if(!def){if($('spatialChallengeTarget'))$('spatialChallengeTarget').textContent='Choose a challenge.';if($('spatialChallengeHint'))$('spatialChallengeHint').textContent='MRCC will load a teaching start state, then evaluate the live FOV and sample controls.';if(wrap)wrap.innerHTML='';if(pill)pill.textContent='free explore';return}
  if($('spatialChallengeTarget'))$('spatialChallengeTarget').textContent=def.title;if($('spatialChallengeHint'))$('spatialChallengeHint').textContent=def.hint;const rows=spatialChallengeRows(activeSpatialChallenge,state,m),met=rows.filter(x=>x.met).length;if(pill)pill.textContent=met+'/'+rows.length+' constraints'+(met===rows.length?' met':'');
  if(wrap)wrap.innerHTML=rows.map(x=>'<div class="spatial-challenge-constraint '+(x.met?'met':'miss')+'"><small>'+escapeHtml(x.label)+'</small><b>'+(x.met?'Met':'Adjust')+'</b><span>'+escapeHtml(x.goal)+' · now '+escapeHtml(x.now)+'</span></div>').join('');
}
function applySpatialState(state){if($('spPhaseFov'))$('spPhaseFov').value=state.phaseFov;if($('spReadFov'))$('spReadFov').value=state.readFov;if($('spPhaseSamples'))$('spPhaseSamples').value=state.phaseSamples;if($('spReadSamples'))$('spReadSamples').value=state.readSamples}
function startSpatialChallenge(id){const def=spatialChallengeDefs[id];if(!def)return;activeSpatialChallenge=id;applySpatialState(def.start);spatialUpdate();toast('Spatial challenge started')}
function restartSpatialChallenge(){const def=spatialChallengeDefs[activeSpatialChallenge];if(!def){toast('Choose a spatial challenge first');return}applySpatialState(def.start);spatialUpdate();toast('Spatial challenge restarted')}
function clearSpatialChallenge(){activeSpatialChallenge='';const state=spatialState(),m=spatialMetrics(state);renderSpatialChallenge(state,m);toast('Spatial challenge closed')}
function spatialMatchedSamples(fov){
  return Math.min(192,Math.max(48,Math.round((128*(Number(fov)||100)/100)/16)*16));
}
function spatialMatchSamples(axis='both'){
  const state=spatialState();
  if((axis==='read'||axis==='both')&&$('spReadSamples'))$('spReadSamples').value=spatialMatchedSamples(state.readFov);
  if((axis==='phase'||axis==='both')&&$('spPhaseSamples'))$('spPhaseSamples').value=spatialMatchedSamples(state.phaseFov);
  spatialUpdate();toast(axis==='both'?'Read + phase samples matched to FOV':'Samples matched to '+axis+' FOV');
}
function renderSpatialDeep(state,m){renderSpatialProvenance(state,m);spatialAxisAnatomy(state,m);renderSpatialChallenge(state,m)}
function bindSpatialDeepDive(){$('spatialChallengeTargets')?.addEventListener('click',e=>{const b=e.target.closest('[data-spatial-challenge]');if(b)startSpatialChallenge(b.dataset.spatialChallenge)})}

let spatialWorldBase=null;
function spatialObject(x,y){
  let v=0;
  if((x*x)/(.43*.43)+(y*y)/(.47*.47)<=1)v=.18;
  for(const [cx,cy,r,a] of spatialFeatures){const dx=x-cx,dy=y-cy;if(dx*dx+dy*dy<=r*r)v=Math.max(v,a)}
  if(Math.abs(x)<.035&&Math.abs(y)<.31)v=Math.max(v,.38);
  return v;
}
function spatialMetrics(state){
  const pf=state.phaseFov/100,rf=state.readFov/100;
  return {
    phaseRatio:pf,readRatio:rf,
    phasePixel:(pf/state.phaseSamples)/(1/128),
    readPixel:(rf/state.readSamples)/(1/128),
    sampleBurden:(state.phaseSamples*state.readSamples)/(128*128),
    phaseWrap:pf<.98,readWrap:rf<.98
  };
}
function spatialTeachingCopy(state,m=spatialMetrics(state)){
  if(m.phaseWrap&&m.readWrap)return {short:'Two-axis wrap',title:'Both encoded dimensions are smaller than the reference object',detail:'Periodic copies fold content across both axes in the synthetic reconstruction.'};
  if(m.phaseWrap)return {short:'Phase wrap',title:'Phase coverage is undersized',detail:'Object content outside the encoded phase FOV re-enters from the opposite side in this periodic teaching model.'};
  if(m.readWrap)return {short:'Read wrap',title:'Read coverage is undersized',detail:'Object content outside the encoded read FOV folds periodically into the displayed field in this teaching model.'};
  if(state.phaseSamples<96||state.readSamples<96)return {short:'Coarse sampling',title:'Coverage is contained, but the discrete grid is coarse',detail:'Fewer samples increase relative pixel width without creating FOV wrap in this simplified model.'};
  if(state.phaseFov>110||state.readFov>110)return {short:'Expanded coverage',title:'The encoded FOV extends beyond the reference object',detail:'Extra coverage avoids modeled wrap, but relative pixel width grows unless sample count rises with the FOV.'};
  return {short:'No modeled wrap',title:'Reference coverage',detail:'The teaching object fits within both encoded dimensions; sampling controls the discrete grid and relative pixel width.'};
}
function drawSpatialWorld(state){
  const c=$('spWorldCanvas');if(!c)return;const ctx=c.getContext('2d'),w=c.width,h=c.height,extent=.70;
  if(!spatialWorldBase||spatialWorldBase.width!==w||spatialWorldBase.height!==h){
    const img=ctx.createImageData(w,h);
    for(let py=0;py<h;py++)for(let px=0;px<w;px++){
      const x=(px/(w-1)*2-1)*extent,y=(py/(h-1)*2-1)*extent,v=spatialObject(x,y),i=(py*w+px)*4,g=Math.round(18+v*220);
      img.data[i]=Math.round(g*.75);img.data[i+1]=g;img.data[i+2]=Math.round(g*.91);img.data[i+3]=255;
    }
    spatialWorldBase=img;
  }
  ctx.putImageData(spatialWorldBase,0,0);
  const fw=(state.readFov/100)/(extent*2)*w,fh=(state.phaseFov/100)/(extent*2)*h;
  ctx.fillStyle='rgba(82,215,255,.035)';ctx.fillRect((w-fw)/2,(h-fh)/2,fw,fh);
  ctx.strokeStyle='rgba(82,215,255,.92)';ctx.lineWidth=3;ctx.setLineDash([8,6]);ctx.strokeRect((w-fw)/2,(h-fh)/2,fw,fh);ctx.setLineDash([]);
  ctx.fillStyle='rgba(6,17,15,.88)';ctx.fillRect(8,8,108,23);ctx.fillStyle='#bfefff';ctx.font='700 12px system-ui';ctx.fillText('encoded FOV',16,24);
}
function drawSpatialRecon(state){
  const c=$('spReconCanvas');if(!c)return;const ctx=c.getContext('2d'),nx=state.readSamples,ny=state.phaseSamples,rf=state.readFov/100,pf=state.phaseFov/100;
  const off=document.createElement('canvas');off.width=nx;off.height=ny;const ox=off.getContext('2d'),img=ox.createImageData(nx,ny);
  for(let iy=0;iy<ny;iy++)for(let ix=0;ix<nx;ix++){
    const x=((ix+.5)/nx-.5)*rf,y=((iy+.5)/ny-.5)*pf;let v=0;
    for(let ky=-2;ky<=2;ky++)for(let kx=-2;kx<=2;kx++)v+=spatialObject(x+kx*rf,y+ky*pf);
    v=Math.min(1,v);const i=(iy*nx+ix)*4,g=Math.round(12+v*240);img.data[i]=g;img.data[i+1]=g;img.data[i+2]=g;img.data[i+3]=255;
  }
  ox.putImageData(img,0,0);ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,c.width,c.height);ctx.drawImage(off,0,0,c.width,c.height);
  ctx.strokeStyle='rgba(104,225,184,.55)';ctx.lineWidth=2;ctx.strokeRect(1,1,c.width-2,c.height-2);
}
function persistSpatialState(state){try{localStorage.setItem('mrcc_spatial_current',JSON.stringify({...state,savedAt:new Date().toISOString()}))}catch(e){}}
function spatialUpdate(save=true){
  if(!$('spPhaseFov'))return;const state=spatialState(),m=spatialMetrics(state),copy=spatialTeachingCopy(state,m);
  $('spPhaseFovOut').textContent=Math.round(state.phaseFov)+'%';$('spReadFovOut').textContent=Math.round(state.readFov)+'%';$('spPhaseSamplesOut').textContent=Math.round(state.phaseSamples);$('spReadSamplesOut').textContent=Math.round(state.readSamples);
  $('spatialCoverageBadge').textContent=m.phaseWrap||m.readWrap?'cropped':'contained';$('spatialWrapBadge').textContent=copy.short.toLowerCase();$('spatialWrapCue').textContent=copy.short;$('spatialWrapDetail').textContent=copy.detail;$('spatialPixelProxy').textContent=m.readPixel.toFixed(2)+'× · '+m.phasePixel.toFixed(2)+'×';$('spatialSampleBurden').textContent=Math.round(m.sampleBurden*100)+'%';$('spatialExplain').innerHTML='<b>'+copy.title+'</b><span>'+copy.detail+'</span>';
  drawSpatialWorld(state);drawSpatialRecon(state);renderSpatialDeep(state,m);if(save)persistSpatialState(state);if(typeof renderLabsHome==='function')renderLabsHome();
}
function applySpatialPreset(id){
  const p={phasewrap:{phaseFov:65,readFov:100,phaseSamples:128,readSamples:128},readwrap:{phaseFov:100,readFov:65,phaseSamples:128,readSamples:128},coarse:{phaseFov:100,readFov:100,phaseSamples:64,readSamples:64},compensate:{phaseFov:125,readFov:125,phaseSamples:160,readSamples:160}}[id]||{phaseFov:100,readFov:100,phaseSamples:128,readSamples:128};
  $('spPhaseFov').value=p.phaseFov;$('spReadFov').value=p.readFov;$('spPhaseSamples').value=p.phaseSamples;$('spReadSamples').value=p.readSamples;spatialUpdate();toast('Spatial encoding teaching preset loaded');
}
function restoreSpatialState(){
  let raw=null;try{raw=JSON.parse(localStorage.getItem('mrcc_spatial_current')||'null')}catch(e){}
  const v=normalizeSpatialState(raw||{});if($('spPhaseFov'))$('spPhaseFov').value=v.phaseFov;if($('spReadFov'))$('spReadFov').value=v.readFov;if($('spPhaseSamples'))$('spPhaseSamples').value=v.phaseSamples;if($('spReadSamples'))$('spReadSamples').value=v.readSamples;spatialUpdate(false);
}
function spatialReset(notify=true){activeSpatialChallenge='';if($('spPhaseFov'))$('spPhaseFov').value=100;if($('spReadFov'))$('spReadFov').value=100;if($('spPhaseSamples'))$('spPhaseSamples').value=128;if($('spReadSamples'))$('spReadSamples').value=128;spatialUpdate();if(notify)toast('Spatial Encoding Lab reset')}
bindSpatialDeepDive();




/* v18.0 Sequence Families Lab */
const MRCC_SEQUENCE_FAMILY_KEY='mrcc_sequence_family_lab_v1';
const sequenceFamilies=[
{id:'se',code:'SE',group:'spin',title:'Conventional Spin Echo',short:'The reference spin-echo family: excitation followed by RF refocusing.',tags:['T1','T2','PD'],mechanism:'A 90° excitation is followed by a 180° refocusing pulse to form a spin echo. The RF refocusing pulse reduces dephasing from static B0 inhomogeneity compared with gradient echo.',contrast:'TR and TE are the classic weighting controls: short TR/short TE tends toward T1 weighting; long TR/long TE tends toward T2 weighting; long TR/short TE tends toward proton-density weighting.',console:'Look for SE / Spin Echo. Many routine protocols use faster FSE/TSE descendants instead of conventional SE because of time.',strengths:['Predictable contrast model','True spin-echo refocusing reduces static-field dephasing','Useful conceptual baseline for understanding FSE/TSE'],tradeoffs:['Slow because one or few phase-encode lines are acquired per TR','Multiple RF pulses can increase RF power burden depending on implementation'],artifacts:['Motion and flow can still ghost','Imperfect refocusing can alter signal'],uses:['Foundational T1/T2/PD imaging','Situations where conventional spin-echo contrast is specifically desired'],vendor:{generic:'SE / Spin Echo',ge:'SE',siemens:'SE',philips:'SE'},aliases:['spin echo','se'],traits:{'Refocusing':'180° RF spin echo','Speed':'Slow','Susceptibility sensitivity':'Lower than GRE','Motion behavior':'Conventional Cartesian','Typical dimensionality':'2D','Key control':'TR + TE'}},
{id:'fse',code:'FSE',group:'spin',title:'Fast / Turbo Spin Echo',short:'Multiple spin echoes per TR make spin-echo imaging much faster.',tags:['FSE','TSE','echo train'],mechanism:'One excitation is followed by a train of refocusing pulses. Different echoes fill multiple k-space lines within one TR, reducing scan time compared with conventional spin echo.',contrast:'Effective TE and which parts of k-space are filled by which echoes influence image contrast. Long echo trains can introduce T2-related blurring and stimulated-echo effects.',console:'Common labels include FSE, FRFSE, TSE, Turbo Spin Echo, RARE-derived methods.',strengths:['Workhorse T1/T2/PD family','Much faster than conventional SE','Less susceptibility-sensitive than GRE/EPI'],tradeoffs:['Long echo trains can blur','RF refocusing trains can increase RF power burden','Echo-train ordering affects contrast'],artifacts:['Motion/flow ghosting','T2 blurring with long trains','Fat can look relatively bright on some FSE implementations'],uses:['Routine neuro, spine, MSK, body T2/PD/T1 families','Foundation for many 2D and 3D anatomic sequences'],vendor:{generic:'FSE / TSE',ge:'FSE / FRFSE',siemens:'TSE',philips:'TSE'},aliases:['fse','frfse','tse','turbo spin echo','rare'],traits:{'Refocusing':'RF echo train','Speed':'Moderate-fast','Susceptibility sensitivity':'Low-moderate','Motion behavior':'Cartesian echo train','Typical dimensionality':'2D / 3D variants','Key control':'Effective TE + echo train'}},
{id:'ir',code:'IR',group:'spin',title:'Inversion Recovery',short:'An inversion pulse plus TI intentionally nulls or reshapes tissue signal.',tags:['STIR','FLAIR','TI'],mechanism:'A 180° inversion pulse is applied before excitation. The inversion time (TI) selects where longitudinal magnetization has recovered when signal is sampled.',contrast:'TI can null a tissue with a particular T1. STIR is commonly used for robust fat suppression; FLAIR uses inversion recovery to suppress CSF while retaining T2-like lesion contrast.',console:'Look for STIR, FLAIR, IR, TIRM, or an explicit TI parameter. The readout itself is often spin-echo/FSE based.',strengths:['Powerful tissue-nulling contrast','STIR is comparatively robust to B0/B1 variation for fat suppression','FLAIR suppresses free CSF signal'],tradeoffs:['Longer timing burden','TI must be appropriate for the intended null','STIR suppresses based on T1 rather than chemical identity'],artifacts:['Incomplete nulling if timing/field conditions differ','Motion during long inversion-recovery acquisitions'],uses:['Fluid-sensitive fat-suppressed imaging','Brain FLAIR','Tissue-nulling applications'],vendor:{generic:'STIR / FLAIR / IR',ge:'STIR / FLAIR',siemens:'STIR / TIRM / FLAIR',philips:'STIR / FLAIR'},aliases:['stir','flair','tirm','inversion recovery','ir'],traits:{'Preparation':'180° inversion pulse','Speed':'Depends on readout','Susceptibility sensitivity':'Mostly readout-dependent','Motion behavior':'Long preparation may add sensitivity','Typical dimensionality':'2D / 3D','Key control':'TI + readout TR/TE'}},
{id:'ssfse',code:'SS-FSE',group:'fast',title:'Single-Shot FSE / TSE',short:'Most or all of k-space is collected after one excitation for very rapid T2-weighted imaging.',tags:['SSFSE','HASTE','single-shot'],mechanism:'A very long refocusing echo train acquires a large fraction of k-space after one excitation. Half-Fourier strategies are often used to shorten the train.',contrast:'Typically strongly T2 weighted. Effective TE and echo-train behavior determine the appearance; very long trains trade sharpness for speed.',console:'Common labels include SSFSE, single-shot TSE, HASTE, single-shot fast spin echo.',strengths:['Very fast','Useful when motion is difficult to control','Excellent for fluid-heavy anatomy'],tradeoffs:['Lower spatial detail than multi-shot approaches in many implementations','T2 decay across the long train causes blurring'],artifacts:['T2 blurring','Motion between repeated slices','Flow-related signal changes'],uses:['Rapid body T2 imaging','MRCP-style heavily T2 concepts','Motion-limited imaging'],vendor:{generic:'SSFSE / single-shot TSE',ge:'SSFSE',siemens:'HASTE',philips:'single-shot TSE'},aliases:['ssfse','ss-fse','single shot fse','single-shot fse','haste','single shot tse','single-shot tse'],traits:{'Refocusing':'Long RF echo train','Speed':'Very fast','Susceptibility sensitivity':'Low-moderate','Motion behavior':'Strong for through-time motion','Typical dimensionality':'Usually 2D','Key control':'Effective TE + long echo train'}},
{id:'gre',code:'GRE',group:'gre',title:'Gradient Echo',short:'Fast gradient refocusing without a 180° spin-echo pulse.',tags:['GRE','T2*','flip angle'],mechanism:'An RF excitation—often with a flip angle below 90°—is followed by gradient reversal/refocusing to form an echo. There is no 180° spin-echo refocusing pulse.',contrast:'TR, TE, flip angle, spoiling/coherence, and steady-state behavior shape contrast. GRE is intrinsically sensitive to T2* effects and off-resonance.',console:'Look for GRE, gradient echo, SPGR/FLASH/FFE families, or low flip angles with short TR/TE.',strengths:['Fast','Flexible 2D/3D acquisition','Can provide T1-weighted, T2*-weighted, or steady-state contrasts'],tradeoffs:['More sensitive to susceptibility and B0 inhomogeneity than spin echo','Steady-state details matter'],artifacts:['Susceptibility blooming','Chemical shift/off-resonance','Flow and phase effects'],uses:['Fast T1 imaging','Dynamic 3D imaging','T2* and susceptibility-sensitive imaging'],vendor:{generic:'GRE',ge:'GRE / SPGR',siemens:'GRE / FLASH',philips:'FFE'},aliases:['gre','gradient echo','spgr','flash','ffe'],traits:{'Refocusing':'Gradient echo','Speed':'Fast','Susceptibility sensitivity':'High vs spin echo','Motion behavior':'Short acquisitions possible','Typical dimensionality':'2D / 3D','Key control':'TR + TE + flip angle'}},
{id:'spgr3d',code:'3D T1 GRE',group:'gre',title:'Spoiled 3D T1 GRE',short:'Fast 3D T1-weighted GRE used heavily for dynamic and post-contrast imaging.',tags:['LAVA','VIBE','THRIVE'],mechanism:'A spoiled gradient-echo steady state is used with short TR/TE and a T1-oriented flip angle. 3D slab excitation supports thin partitions and reformats.',contrast:'Primarily T1 weighted. Fat suppression or Dixon water-fat separation is often paired with the acquisition, especially in body imaging.',console:'Typical family names include LAVA/LAVA Flex, VIBE, THRIVE/T1-FFE, FSPGR/SPGR variants.',strengths:['Fast 3D coverage','Thin partitions and multiplanar reformats','Well suited to dynamic contrast phases'],tradeoffs:['Breath-hold timing may matter in body applications','Sensitive to B0/B1 and motion depending on implementation'],artifacts:['Motion between/during phases','Water-fat swap or poor fat separation when Dixon is used','Susceptibility/off-resonance'],uses:['Dynamic/post-contrast body imaging','3D T1-weighted anatomy','Pre/post contrast comparisons'],vendor:{generic:'spoiled 3D GRE',ge:'LAVA / LAVA Flex / FSPGR',siemens:'VIBE / Dixon VIBE',philips:'THRIVE / T1-FFE / mDIXON variants'},aliases:['lava','lava flex','vibe','dixon vibe','thrive','fspgr','3d spgr','t1 ffe'],traits:{'Refocusing':'Spoiled gradient echo','Speed':'Fast','Susceptibility sensitivity':'Moderate-high','Motion behavior':'Often breath-hold / short 3D','Typical dimensionality':'3D','Key control':'TR + TE + flip angle + fat strategy'}},
{id:'bssfp',code:'bSSFP',group:'gre',title:'Balanced SSFP',short:'A coherent steady-state family with high signal efficiency and characteristically bright fluid/blood.',tags:['FIESTA','TrueFISP','bTFE'],mechanism:'All gradient moments are balanced each TR, preserving transverse coherence and establishing a steady state that depends strongly on the T2/T1 ratio and off-resonance.',contrast:'Fluids and blood often appear bright because of high T2/T1 ratios. Contrast is not described by simple spin-echo T1/T2 rules.',console:'Common names: FIESTA, TrueFISP, bTFE. Very short TR and balanced gradients are key clues.',strengths:['High SNR efficiency','Fast','Excellent fluid/blood contrast'],tradeoffs:['Strong off-resonance sensitivity','Banding becomes more problematic with field inhomogeneity'],artifacts:['Dark banding','Flow/phase effects','Susceptibility near air/metal'],uses:['Cardiac/cine concepts','Cranial nerve/cisternographic applications','Fast fluid-bright anatomy'],vendor:{generic:'balanced SSFP',ge:'FIESTA / FIESTA-C',siemens:'TrueFISP',philips:'bTFE'},aliases:['fiesta','truefisp','true fisp','btfe','b-tfe','balanced ssfp','bssfp'],traits:{'Refocusing':'Balanced coherent gradients','Speed':'Very fast','Susceptibility sensitivity':'Off-resonance banding','Motion behavior':'Excellent temporal efficiency','Typical dimensionality':'2D / 3D / cine','Key control':'TR + flip angle + off-resonance'}},
{id:'epi',code:'EPI / DWI',group:'special',title:'Echo Planar / Diffusion Family',short:'Very rapid readout used for diffusion and other time-sensitive acquisitions.',tags:['EPI','DWI','ADC'],mechanism:'EPI traverses many k-space lines after one excitation using rapidly oscillating readout gradients. Diffusion preparation adds motion-sensitizing gradients before the readout.',contrast:'DWI signal reflects diffusion weighting plus T2 contribution; ADC maps estimate diffusion-related signal decay across b-values. EPI geometry strongly affects image quality.',console:'Look for DWI, ADC, EPI, b-values, diffusion directions, or trace images.',strengths:['Extremely fast readout','Core platform for diffusion imaging','Motion can be frozen within a single-shot readout'],tradeoffs:['Geometric distortion and susceptibility sensitivity','Lower spatial fidelity than many conventional readouts'],artifacts:['Susceptibility distortion','Nyquist / N/2 ghosting','Eddy-current effects','T2 shine-through on DWI'],uses:['Diffusion-weighted imaging','Perfusion/fMRI readout concepts','Rapid single-shot acquisitions'],vendor:{generic:'EPI / DWI / ADC',ge:'EPI DWI',siemens:'EPI DWI',philips:'EPI DWI'},aliases:['epi','dwi','diffusion','adc','trace diffusion'],traits:{'Refocusing':'Rapid gradient-echo train','Speed':'Extremely fast','Susceptibility sensitivity':'Very high','Motion behavior':'Fast readout; distortion sensitive','Typical dimensionality':'2D multi-slice commonly','Key control':'b-value + TE + EPI factor'}},
{id:'vfa3dfse',code:'3D FSE',group:'spin',title:'3D Variable-Flip FSE / TSE',short:'Long 3D spin-echo trains use variable refocusing angles to make isotropic FSE practical.',tags:['CUBE','SPACE','VISTA'],mechanism:'A 3D FSE/TSE echo train uses variable refocusing flip angles to manage signal evolution and RF power while collecting a volumetric dataset.',contrast:'Can be T1, T2, PD, or fluid-sensitive depending on timing and flip-angle design. Contrast is more complex than a single fixed 180° refocusing train.',console:'Common names include CUBE, SPACE, VISTA. Thin isotropic or near-isotropic 3D partitions are a clue.',strengths:['3D isotropic/near-isotropic coverage','Multiplanar reformats','Spin-echo-like contrast with volumetric acquisition'],tradeoffs:['Long echo trains can blur','Scan time and motion can become important','Variable-flip signal evolution is complex'],artifacts:['T2 blurring','Motion across long 3D acquisition','Variable contrast across the echo train'],uses:['3D neuro/MSK/spine/body anatomy','Reformat-friendly volumetric T2/PD/T1 imaging'],vendor:{generic:'3D variable-flip FSE/TSE',ge:'CUBE',siemens:'SPACE',philips:'VISTA'},aliases:['cube','space','vista','3d fse','3d tse','variable flip fse'],traits:{'Refocusing':'Variable-angle RF echo train','Speed':'Moderate','Susceptibility sensitivity':'Low-moderate','Motion behavior':'Long 3D volume can be motion sensitive','Typical dimensionality':'3D','Key control':'Echo train + variable flip schedule'}},
{id:'dixon',code:'Dixon',group:'special',title:'Dixon Water–Fat Separation',short:'Multi-echo phase behavior separates water and fat rather than simply saturating fat.',tags:['Dixon','IDEAL','mDIXON'],mechanism:'Images are acquired at different water-fat phase relationships. Reconstruction estimates separate water and fat components, often with field-map correction.',contrast:'Dixon is a water-fat separation strategy layered onto GRE or spin-echo-based acquisitions; the underlying sequence still determines T1/T2 weighting.',console:'Look for Dixon, IDEAL, mDIXON, water-only, fat-only, in-phase, out-of-phase, or Flex outputs.',strengths:['Uniform fat-water separation over larger fields than spectral fat sat in many situations','Produces multiple useful image sets from one acquisition'],tradeoffs:['Reconstruction depends on field modeling','Acquisition/reconstruction complexity varies by implementation'],artifacts:['Water-fat swaps','Field-map failure','Motion between echoes can degrade separation'],uses:['Body and MSK fat suppression','T1 dynamic imaging with water-only reconstructions','Chemical-shift characterization'],vendor:{generic:'Dixon water-fat separation',ge:'IDEAL / LAVA Flex',siemens:'Dixon / VIBE Dixon',philips:'mDIXON'},aliases:['dixon','ideal','mdixon','m dixon','lava flex','water only','fat only','in phase','out of phase'],traits:{'Preparation':'Multi-echo water-fat phase sampling','Speed':'Readout-dependent','Susceptibility sensitivity':'Field-map dependent','Motion behavior':'Echo consistency matters','Typical dimensionality':'2D / 3D','Key control':'Echo times + reconstruction'}},
{id:'swi',code:'SWI',group:'special',title:'Susceptibility-Sensitive GRE',short:'GRE magnitude/phase behavior is deliberately used to emphasize susceptibility effects.',tags:['SWI','SWAN','T2*'],mechanism:'Longer-TE gradient-echo data preserve phase and magnitude effects from local field perturbations. Susceptibility-weighted processing may combine phase and magnitude information.',contrast:'Veins, blood products, mineralization, metal, and air interfaces can produce strong susceptibility-related signal changes or blooming.',console:'Common labels include SWI, SWAN, SWIp, T2* GRE. MinIP reformats may be part of the workflow.',strengths:['Highly sensitive to susceptibility effects','Excellent venous/blood-product conspicuity'],tradeoffs:['Motion and field inhomogeneity can degrade image quality','Blooming exaggerates apparent size of susceptibility sources'],artifacts:['Blooming','Phase wraps / off-resonance','Motion'],uses:['Susceptibility-sensitive neuro imaging','Venous visualization','Blood-product / mineralization assessment concepts'],vendor:{generic:'SWI / susceptibility GRE',ge:'SWAN',siemens:'SWI',philips:'SWIp'},aliases:['swi','swan','swip','susceptibility weighted','t2* gre','t2 star gre'],traits:{'Refocusing':'Gradient echo','Speed':'Moderate','Susceptibility sensitivity':'Very high by design','Motion behavior':'Phase/magnitude sensitive','Typical dimensionality':'3D commonly','Key control':'TE + phase processing'}},
{id:'mra',code:'MRA',group:'special',title:'Flow-Sensitive Angiography',short:'TOF and phase-contrast methods create vascular contrast from flowing spins without relying on ordinary tissue weighting alone.',tags:['TOF','PC','MRA'],mechanism:'TOF emphasizes inflowing unsaturated spins relative to saturated stationary tissue. Phase-contrast encodes velocity into phase using bipolar gradients.',contrast:'TOF signal depends on inflow and saturation; phase-contrast depends on velocity encoding and flow direction. These are flow mechanisms rather than classic T1/T2 weighting alone.',console:'Look for TOF, 2D/3D TOF, PC, phase contrast, VENC, MRA/MRV.',strengths:['Non-contrast vascular techniques','Can emphasize direction/velocity information with PC'],tradeoffs:['Slow/in-plane flow can saturate on TOF','VENC selection matters for PC','Turbulence can cause signal loss'],artifacts:['Saturation','Turbulent-flow dephasing','Venetian-blind/slab-boundary effects in multi-slab TOF'],uses:['Intracranial/neck angiographic concepts','Flow direction and velocity concepts','Non-contrast MRA/MRV'],vendor:{generic:'TOF / phase-contrast MRA',ge:'TOF / PC',siemens:'TOF / PC',philips:'TOF / PCA'},aliases:['tof','time of flight','phase contrast','phase-contrast','pc mra','mra','mrv','venc'],traits:{'Contrast mechanism':'Flow / velocity','Speed':'Method-dependent','Susceptibility sensitivity':'GRE-like for TOF','Motion behavior':'Flow consistency matters','Typical dimensionality':'2D / 3D','Key control':'Flip/TR for TOF; VENC for PC'}},
{id:'radial',code:'Blade FSE',group:'fast',title:'Radial / Blade FSE Variants',short:'Rotated strips or radial-like k-space coverage trade efficiency for motion robustness.',tags:['PROPELLER','BLADE','MultiVane'],mechanism:'Rather than conventional line-by-line Cartesian phase encoding, overlapping rotating blades/strips repeatedly sample central k-space. Motion correction/averaging can use the redundant center data.',contrast:'Usually built on an FSE/TSE-style contrast engine, so T1/T2/PD weighting still comes from the underlying spin-echo timing.',console:'Common names include PROPELLER, BLADE, MultiVane. The exact implementation and available contrasts vary by vendor and scanner.',strengths:['Improved robustness to some in-plane motion','Central k-space oversampling can support motion correction'],tradeoffs:['May be slower than a comparable Cartesian acquisition','Not all motion types are corrected equally'],artifacts:['Residual motion','Radial/blade streaking','Longer scan time can invite additional motion'],uses:['Motion-challenged neuro/MSK/body applications where locally approved','Reducing repeat risk in selected exams'],vendor:{generic:'radial/blade FSE',ge:'PROPELLER',siemens:'BLADE',philips:'MultiVane'},aliases:['propeller','blade','multivane','multi vane','radial fse','blade tse'],traits:{'Refocusing':'FSE/TSE-based blades','Speed':'Moderate-slower','Susceptibility sensitivity':'Spin-echo-like','Motion behavior':'Motion-robust for selected motion','Typical dimensionality':'2D commonly','Key control':'Blade coverage + FSE timing'}}
];
let sequenceFamilyState={selected:'fse',filter:'all',vendor:'generic',query:''};

const sequenceAnatomyModels={
se:{prep:['none'],rf:['90° excitation','180° refocus'],echo:['single spin echo'],read:['one/few phase lines per TR'],key:'Classic spin-echo anatomy: an RF refocusing pulse forms the echo and reduces static-field dephasing compared with GRE.',finger:{speed:1,sus:1,motion:1,rf:2}},
fse:{prep:['optional prep'],rf:['90° excitation','180°-like refocusing train'],echo:['multiple spin echoes'],read:['many k-space lines per TR'],key:'The defining move is the refocusing echo train: speed rises because several phase-encode lines are collected after one excitation.',finger:{speed:2,sus:1,motion:2,rf:3}},
ir:{prep:['180° inversion','wait TI'],rf:['excitation','spin-echo/FSE readout often'],echo:['null / reshape signal'],read:['readout family-dependent'],key:'Inversion recovery is a preparation strategy: TI is used to null or reshape tissue signal before the readout.',finger:{speed:1,sus:1,motion:1,rf:3}},
ssfse:{prep:['optional prep'],rf:['90° excitation','very long refocusing train'],echo:['long train of spin echoes'],read:['most/all k-space in one shot'],key:'Single-shot FSE compresses acquisition into one very long echo train, trading sharpness for extreme speed and motion tolerance.',finger:{speed:3,sus:1,motion:3,rf:3}},
gre:{prep:['optional prep'],rf:['low/variable flip excitation','no 180° refocus'],echo:['gradient echo'],read:['gradient-refocused k-space'],key:'GRE has no 180° spin-echo refocusing pulse; that makes it fast and flexible but more exposed to T2* and off-resonance effects.',finger:{speed:3,sus:3,motion:2,rf:1}},
spgr3d:{prep:['fat sat / Dixon optional'],rf:['spoiled low-flip RF train'],echo:['gradient echoes'],read:['3D partitions / volume'],key:'Spoiled 3D GRE maintains a T1-oriented spoiled steady state and collects a volume suited to thin reformats and dynamic phases.',finger:{speed:3,sus:2,motion:2,rf:1}},
bssfp:{prep:['steady-state setup'],rf:['rapid repeating RF'],echo:['coherent balanced steady state'],read:['balanced gradients every TR'],key:'Balanced SSFP preserves transverse coherence with balanced gradients, producing high signal efficiency but strong off-resonance banding sensitivity.',finger:{speed:3,sus:3,motion:3,rf:2}},
epi:{prep:['diffusion gradients when DWI'],rf:['excitation ± spin-echo refocus'],echo:['single rapid echo train'],read:['oscillating EPI zig-zag readout'],key:'EPI races through k-space after one excitation. That speed is powerful, but long readout trains magnify susceptibility distortion and ghosting.',finger:{speed:3,sus:3,motion:3,rf:1}},
vfa3dfse:{prep:['optional prep'],rf:['excitation','variable-angle refocusing train'],echo:['long controlled spin-echo train'],read:['3D volume / partitions'],key:'Variable refocusing angles make long 3D FSE/TSE echo trains practical by managing signal evolution and RF burden.',finger:{speed:2,sus:1,motion:1,rf:2}},
dixon:{prep:['water-fat phase sampling'],rf:['underlying GRE/FSE RF'],echo:['multiple echo times'],read:['water / fat reconstruction'],key:'Dixon is a water-fat separation layer: multiple echo times sample changing water-fat phase, then reconstruction separates components.',finger:{speed:2,sus:2,motion:2,rf:1}},
swi:{prep:['phase preserved'],rf:['low-flip GRE train'],echo:['longer-TE gradient echoes'],read:['3D magnitude + phase'],key:'Susceptibility-sensitive GRE deliberately preserves phase/magnitude effects from local field changes, making blooming and veins conspicuous.',finger:{speed:2,sus:3,motion:1,rf:1}},
mra:{prep:['flow mechanism'],rf:['repeated GRE-like excitation'],echo:['flow-dependent signal / phase'],read:['2D/3D vascular k-space'],key:'TOF and phase-contrast angiography derive contrast from inflow or velocity encoding rather than ordinary T1/T2 weighting alone.',finger:{speed:2,sus:2,motion:1,rf:1}},
radial:{prep:['optional prep'],rf:['FSE/TSE excitation + refocus'],echo:['spin echoes in rotating blades'],read:['overlapping radial/blade strips'],key:'Radial/blade FSE repeatedly samples central k-space while rotating strips, creating redundancy that can improve robustness to selected motion.',finger:{speed:1,sus:1,motion:3,rf:3}}
};
const sequenceDnaDimensions={
  prep:{label:'Preparation',values:{none:'none / optional',inversion:'inversion + TI',diffusion:'diffusion sensitization',waterfat:'water–fat phase sampling',flow:'flow / velocity mechanism',susceptibility:'susceptibility phase/magnitude',steady:'steady-state setup'}},
  echo:{label:'Echo engine',values:{spin:'single spin echo',refocusTrain:'RF refocusing train',gradient:'gradient echo',balanced:'balanced coherent steady state'}},
  readout:{label:'Readout',values:{cartesian:'conventional Cartesian',singleShot:'single-shot long FSE/TSE train',epi:'EPI rapid train',volume3d:'3D volume / partitions',blade:'rotating blades / radial-like strips'}},
  output:{label:'Output clue',values:{anatomic:'routine anatomic weighting',nulling:'tissue nulling / TI',t1dynamic:'fast 3D T1 / dynamic volume',fluidbright:'bright fluid/blood steady state',diffusion:'DWI / ADC',waterfat:'water-only / fat-only outputs',magnitudePhase:'magnitude + phase susceptibility output',vascular:'TOF / PC vascular output',motionRobust:'motion-robust blade acquisition'}}
};
const sequenceDnaProfiles={
  se:{prep:['none'],echo:['spin'],readout:['cartesian'],output:['anatomic']},
  fse:{prep:['none'],echo:['refocusTrain'],readout:['cartesian'],output:['anatomic']},
  ir:{prep:['inversion'],echo:['spin','refocusTrain'],readout:['cartesian','volume3d'],output:['nulling']},
  ssfse:{prep:['none'],echo:['refocusTrain'],readout:['singleShot'],output:['anatomic']},
  gre:{prep:['none'],echo:['gradient'],readout:['cartesian'],output:['anatomic']},
  spgr3d:{prep:['none','waterfat'],echo:['gradient'],readout:['volume3d'],output:['t1dynamic']},
  bssfp:{prep:['steady'],echo:['balanced'],readout:['cartesian','volume3d'],output:['fluidbright']},
  epi:{prep:['diffusion','none'],echo:['gradient','spin'],readout:['epi'],output:['diffusion']},
  vfa3dfse:{prep:['none'],echo:['refocusTrain'],readout:['volume3d'],output:['anatomic']},
  dixon:{prep:['waterfat'],echo:['gradient','refocusTrain'],readout:['cartesian','volume3d'],output:['waterfat']},
  swi:{prep:['susceptibility'],echo:['gradient'],readout:['volume3d'],output:['magnitudePhase']},
  mra:{prep:['flow'],echo:['gradient'],readout:['cartesian','volume3d'],output:['vascular']},
  radial:{prep:['none'],echo:['refocusTrain'],readout:['blade'],output:['motionRobust']}
};
const sequenceDnaWeights={prep:1.15,echo:1,readout:1.25,output:1.35};
let sequenceDnaBestId='';
function sequenceDnaState(){
  return {prep:$('seqDnaPrep')?.value||'any',echo:$('seqDnaEcho')?.value||'any',readout:$('seqDnaReadout')?.value||'any',output:$('seqDnaOutput')?.value||'any'};
}
function sequenceDnaActive(state=sequenceDnaState()){return Object.entries(state).filter(([,v])=>v!=='any')}
function sequenceDnaLabel(dim,value){return sequenceDnaDimensions[dim]?.values?.[value]||value}
function scoreSequenceDna(id,state=sequenceDnaState()){
  const profile=sequenceDnaProfiles[id],active=sequenceDnaActive(state);if(!profile||!active.length)return {id,score:0,matched:[],missed:[],active:active.length};
  let earned=0,total=0;const matched=[],missed=[];
  for(const [dim,value] of active){const weight=sequenceDnaWeights[dim]||1,totalValues=profile[dim]||[];total+=weight;if(totalValues.includes(value)){earned+=weight;matched.push([dim,value])}else missed.push([dim,value])}
  return {id,score:total?earned/total:0,matched,missed,active:active.length};
}
function sequenceDnaRank(state=sequenceDnaState()){
  return sequenceFamilies.map(f=>({...scoreSequenceDna(f.id,state),family:f})).sort((a,b)=>b.score-a.score||b.matched.length-a.matched.length||a.family.title.localeCompare(b.family.title));
}
function sequenceDnaMatchCopy(row){
  if(!row.active)return 'Add clues to begin.';
  if(row.score===1)return row.active===1?'Compatible with the single active clue. Add another clue to narrow the family.':'All active clues are compatible with this family-level model.';
  if(row.score>=.65)return 'Most clues fit, but '+row.missed.map(([d,v])=>sequenceDnaDimensions[d].label.toLowerCase()+' ≠ '+sequenceDnaLabel(d,v)).join('; ')+'.';
  return 'Partial match only; '+row.missed.length+' active clue'+(row.missed.length===1?'':'s')+' conflict with this family model.';
}
function sequenceDnaDifferentiator(a,b){
  if(!a||!b)return 'Add another clue to narrow the match.';
  const pa=sequenceDnaProfiles[a.id],pb=sequenceDnaProfiles[b.id],diff=[];
  for(const dim of ['prep','echo','readout','output']){
    const av=(pa[dim]||[]).map(v=>sequenceDnaLabel(dim,v)).join(' / '),bv=(pb[dim]||[]).map(v=>sequenceDnaLabel(dim,v)).join(' / ');
    if(av!==bv)diff.push(sequenceDnaDimensions[dim].label+': '+a.family.code+' → '+av+' · '+b.family.code+' → '+bv);
  }
  return diff.length?'Best separating clue: '+diff[0]+'.':'These entries overlap strongly in the simplified DNA model; use the full family descriptions and console context.';
}
function renderSequenceDna(){
  const state=sequenceDnaState(),active=sequenceDnaActive(state),box=$('seqDnaResult'),ambiguity=$('seqDnaAmbiguity'),rank=sequenceDnaRank(state),top=rank.slice(0,3);
  if($('seqDnaClueCount'))$('seqDnaClueCount').textContent=active.length+' clue'+(active.length===1?'':'s')+' active';
  if(!active.length){sequenceDnaBestId='';if(box)box.innerHTML='<div class="seqfam-dna-empty">Choose one or more clues to rank compatible families.</div>';if(ambiguity)ambiguity.innerHTML='<b>Why ambiguity is useful</b><span>One console label can describe a preparation, a readout, or a reconstruction layer. Add another physics clue instead of forcing a premature family match.</span>';if($('seqDnaOpenBest'))$('seqDnaOpenBest').disabled=true;return}
  sequenceDnaBestId=top[0]?.family.id||'';
  if(box)box.innerHTML=top.map((row,i)=>{const pct=Math.round(row.score*100),matched=row.matched.map(([d,v])=>'<span>'+escapeHtml(sequenceDnaDimensions[d].label)+': '+escapeHtml(sequenceDnaLabel(d,v))+'</span>').join('');return '<button type="button" class="seqfam-dna-match '+(i===0?'best':'')+'" data-seq-dna-family="'+row.family.id+'"><div class="seqfam-dna-match-head"><div><small>'+(i===0?'Top compatibility':'Alternate')+'</small><b>'+escapeHtml(row.family.title)+'</b></div><strong>'+pct+'%</strong></div><div class="seqfam-dna-score"><i style="width:'+pct+'%"></i></div><p>'+escapeHtml(sequenceDnaMatchCopy(row))+'</p><div class="seqfam-dna-match-tags">'+(matched||'<span>No active clue matched</span>')+'</div></button>'}).join('');
  if(ambiguity){const exact=rank.filter(r=>r.score===1);ambiguity.innerHTML=exact.length>1?'<b>'+exact.length+' families satisfy every active clue</b><span>'+escapeHtml(sequenceDnaDifferentiator(exact[0],exact[1]))+'</span>':'<b>'+escapeHtml(top[0].family.title)+' is the strongest simplified match</b><span>'+escapeHtml(sequenceDnaDifferentiator(top[0],top[1]))+'</span>'}
  if($('seqDnaOpenBest'))$('seqDnaOpenBest').disabled=!sequenceDnaBestId;
}
function applySequenceDnaProfile(id){
  const p=sequenceDnaProfiles[id];if(!p)return;const canonical={prep:p.prep[0]||'any',echo:p.echo[0]||'any',readout:p.readout[0]||'any',output:p.output[0]||'any'};
  for(const [dim,value] of Object.entries(canonical)){const el=$('seqDna'+dim.charAt(0).toUpperCase()+dim.slice(1));if(el)el.value=value}
  renderSequenceDna();
}
function loadSelectedSequenceDna(){applySequenceDnaProfile(sequenceFamilyState.selected);toast('Selected family DNA loaded')}
function resetSequenceDna(){for(const id of ['seqDnaPrep','seqDnaEcho','seqDnaReadout','seqDnaOutput'])if($(id))$(id).value='any';renderSequenceDna()}
function openBestSequenceDna(){if(!sequenceDnaBestId)return;selectSequenceFamily(sequenceDnaBestId);$('sequenceFamilyDetail')?.scrollIntoView({behavior:uiPrefs.reduceMotion?'auto':'smooth',block:'start'})}
function bindSequenceDna(){
  $('seqDnaResult')?.addEventListener('click',e=>{const b=e.target.closest('[data-seq-dna-family]');if(b){selectSequenceFamily(b.dataset.seqDnaFamily);sequenceDnaBestId=b.dataset.seqDnaFamily}});
  document.querySelectorAll('[data-seq-dna-preset]').forEach(b=>b.addEventListener('click',()=>applySequenceDnaProfile(b.dataset.seqDnaPreset)));
}

const sequenceChallengeQuestions=[
{prompt:'Multiple RF refocusing pulses form an echo train so several k-space lines can be acquired during one TR. Which family?',answer:'fse',choices:['fse','gre','bssfp','epi'],why:'That is the defining Fast/Turbo Spin Echo idea: one excitation followed by a refocusing echo train.'},
{prompt:'No 180° spin-echo refocusing pulse, fast gradient refocusing, and strong T2* / susceptibility sensitivity. Which family?',answer:'gre',choices:['se','gre','ir','radial'],why:'Gradient Echo forms the echo with gradients rather than a 180° RF refocusing pulse.'},
{prompt:'A 180° inversion pulse is followed by a delay TI so a tissue can be nulled before the readout. Which family?',answer:'ir',choices:['ir','ssfse','spgr3d','mra'],why:'Inversion Recovery uses an inversion pulse and TI; STIR and FLAIR are common examples.'},
{prompt:'Balanced gradients every TR maintain a coherent steady state; fluid and blood can be very bright, while off-resonance banding is a classic problem.',answer:'bssfp',choices:['bssfp','swi','fse','dixon'],why:'Balanced SSFP is the FIESTA / TrueFISP / bTFE family.'},
{prompt:'CUBE, SPACE, and VISTA are vendor examples of which broad family?',answer:'vfa3dfse',choices:['vfa3dfse','spgr3d','epi','mra'],why:'They are 3D variable-flip FSE/TSE families designed for volumetric spin-echo-like imaging.'},
{prompt:'A very rapid oscillating readout traverses many k-space lines after one excitation; geometric distortion and N/2 ghosting are major concerns.',answer:'epi',choices:['epi','radial','se','spgr3d'],why:'Echo Planar Imaging uses an extremely rapid gradient readout train and is the common platform for DWI.'},
{prompt:'PROPELLER, BLADE, and MultiVane rotate overlapping strips/blades through k-space to improve robustness to selected motion.',answer:'radial',choices:['radial','ssfse','gre','swi'],why:'Those are radial/blade FSE/TSE variants with redundant central k-space sampling.'},
{prompt:'Multiple echo times exploit changing water-fat phase, then reconstruction produces water-only and fat-only images.',answer:'dixon',choices:['dixon','ir','bssfp','mra'],why:'That is the Dixon / IDEAL / mDIXON water-fat separation concept.'},
{prompt:'SWAN, SWI, and SWIp intentionally emphasize local susceptibility effects using GRE magnitude and/or phase information.',answer:'swi',choices:['swi','gre','fse','ssfse'],why:'Susceptibility-weighted GRE preserves sensitivity to local field perturbations and blooming.'},
{prompt:'LAVA, VIBE, and THRIVE are examples of a fast 3D T1-weighted spoiled GRE family often used for dynamic or post-contrast volumes.',answer:'spgr3d',choices:['spgr3d','vfa3dfse','bssfp','epi'],why:'These are spoiled 3D T1 GRE families; Dixon variants may add water-fat separation.'},
{prompt:'Most or all k-space is acquired after one excitation using a very long FSE/TSE echo train. HASTE is a classic vendor label.',answer:'ssfse',choices:['ssfse','fse','radial','gre'],why:'Single-shot FSE/TSE trades some sharpness for very rapid, motion-tolerant T2-weighted acquisition.'},
{prompt:'TOF emphasizes inflowing unsaturated spins, while phase-contrast encodes velocity into phase. Which family?',answer:'mra',choices:['mra','dixon','swi','ir'],why:'These are flow-sensitive angiography mechanisms rather than ordinary tissue-weighting methods.'}
];
let sequenceChallengeState={index:0,correct:0,answered:0,choice:null};

const sequenceAliasRules=[
{re:/\b(propeller|blade|multivane|multi vane)\b/i,ids:['radial'],note:'Motion-robust radial/blade FSE/TSE variant.'},
{re:/\b(cube|space|vista)\b/i,ids:['vfa3dfse'],note:'3D variable-flip FSE/TSE family.'},
{re:/\b(fiesta|truefisp|true fisp|btfe|b-tfe)\b/i,ids:['bssfp'],note:'Balanced SSFP family.'},
{re:/\b(lava flex)\b/i,ids:['spgr3d','dixon'],note:'A 3D spoiled GRE body family with Dixon-style water-fat separation.'},
{re:/\b(lava|vibe|thrive|fspgr|3d spgr)\b/i,ids:['spgr3d'],note:'Spoiled 3D T1-weighted GRE family.'},
{re:/\b(ideal|mdixon|m dixon|dixon|water only|fat only)\b/i,ids:['dixon'],note:'Water-fat separation strategy layered onto an underlying readout.'},
{re:/\b(swan|swip|swi)\b/i,ids:['swi'],note:'Susceptibility-sensitive GRE family.'},
{re:/\b(haste|ssfse|ss-fse|single[- ]shot fse|single[- ]shot tse)\b/i,ids:['ssfse'],note:'Single-shot FSE/TSE family.'},
{re:/\b(stir|flair|tirm|inversion recovery)\b/i,ids:['ir'],note:'Inversion-recovery preparation/readout family.'},
{re:/\b(dwi|diffusion|adc|epi)\b/i,ids:['epi'],note:'Diffusion/EPI family; DWI usually uses a very rapid EPI readout.'},
{re:/\b(tof|time of flight|phase[- ]contrast|pc mra|venc|mrv|mra)\b/i,ids:['mra'],note:'Flow-sensitive angiography family.'},
{re:/\b(frfse|fse|turbo spin echo|\btse\b)\b/i,ids:['fse'],note:'Fast/turbo spin-echo family.'},
{re:/\b(spgr|flash|\bffe\b|gradient echo|\bgre\b)\b/i,ids:['gre'],note:'Gradient-echo family; check whether the sequence is a specialized 3D/steady-state variant.'}
];
function sequenceFamilyById(id){return sequenceFamilies.find(f=>f.id===id)||sequenceFamilies[0]}

function sequenceAnatomyLabel(value){
  const labels={speed:['','slow','moderate','fast'],sus:['','lower','moderate','high'],motion:['','limited','moderate','strong'],rf:['','lower','moderate','higher']};
  return labels[value.type]?.[value.level]||'varies';
}
function sequenceAnatomyNodes(items,type){return items.map((x,i)=>'<span class="seqfam-anatomy-node '+type+'">'+escapeHtml(x)+'</span>'+(i<items.length-1?'<span class="seqfam-anatomy-arrow">→</span>':'')).join('')}
function renderSequenceAnatomy(){
 const f=sequenceFamilyById(sequenceFamilyState.selected),m=sequenceAnatomyModels[f.id]||sequenceAnatomyModels.fse,timeline=$('seqAnatomyTimeline'),finger=$('seqAnatomyFingerprint');
 if($('seqAnatomyFamilyBadge'))$('seqAnatomyFamilyBadge').textContent=f.code;
 if($('seqAnatomyTitle'))$('seqAnatomyTitle').textContent=f.title+' · simplified acquisition anatomy';
 if(timeline)timeline.innerHTML=[
  ['Preparation',m.prep,'prep'],['RF / refocus',m.rf,'rf'],['Echo / signal',m.echo,'echo'],['Readout',m.read,'read']
 ].map(([label,items,type])=>'<div class="seqfam-anatomy-lane"><span>'+escapeHtml(label)+'</span><div class="seqfam-anatomy-flow">'+sequenceAnatomyNodes(items,type)+'</div></div>').join('');
 if($('seqAnatomyKey'))$('seqAnatomyKey').textContent=m.key;
 const defs=[['Speed tendency','speed'],['Susceptibility sensitivity','sus'],['Motion robustness','motion'],['RF pulse burden','rf']];
 if(finger)finger.innerHTML=defs.map(([label,key])=>{const level=m.finger[key]||2,word=sequenceAnatomyLabel({type:key,level});return '<div class="seqfam-fingerprint-row"><span>'+escapeHtml(label)+'</span><div class="seqfam-fingerprint-track" aria-label="'+escapeHtml(label)+' '+escapeHtml(word)+'">'+[1,2,3].map(n=>'<i class="'+(n<=level?'on':'')+'"></i>').join('')+'</div><b>'+escapeHtml(word)+'</b></div>'}).join('');
}
function renderSequenceChallenge(){
 const q=sequenceChallengeQuestions[sequenceChallengeState.index%sequenceChallengeQuestions.length],choices=$('seqChallengeChoices'),feedback=$('seqChallengeFeedback');
 if($('seqChallengeProgress'))$('seqChallengeProgress').textContent='Question '+(sequenceChallengeState.index+1)+' of '+sequenceChallengeQuestions.length;
 if($('seqChallengeScore'))$('seqChallengeScore').textContent=sequenceChallengeState.correct+' / '+sequenceChallengeState.answered;
 if($('seqChallengePrompt'))$('seqChallengePrompt').textContent=q.prompt;
 if(choices)choices.innerHTML=q.choices.map(id=>{const f=sequenceFamilyById(id),answered=sequenceChallengeState.choice!==null,cls=answered?(id===q.answer?'correct':id===sequenceChallengeState.choice?'wrong':''):'';return '<button type="button" data-seq-challenge-choice="'+id+'" class="'+cls+'" '+(answered?'disabled':'')+'>'+escapeHtml(f.title)+'</button>'}).join('');
 if(feedback){feedback.className='seqfam-challenge-feedback';if(sequenceChallengeState.choice===null)feedback.innerHTML='<span>Choose the family that best matches the acquisition clues.</span>';else{const ok=sequenceChallengeState.choice===q.answer;feedback.classList.add(ok?'good':'bad');feedback.innerHTML='<b>'+(ok?'Correct.':'Not quite.')+'</b><span>'+escapeHtml(q.why)+'</span>';}}
 if($('seqChallengeNextBtn'))$('seqChallengeNextBtn').disabled=sequenceChallengeState.choice===null;
 if($('seqChallengeOpenBtn'))$('seqChallengeOpenBtn').hidden=sequenceChallengeState.choice===null;
}
function answerSequenceChallenge(id){
 if(sequenceChallengeState.choice!==null)return;const q=sequenceChallengeQuestions[sequenceChallengeState.index%sequenceChallengeQuestions.length];
 sequenceChallengeState.choice=id;sequenceChallengeState.answered++;if(id===q.answer)sequenceChallengeState.correct++;renderSequenceChallenge();
}
function nextSequenceChallenge(){
 if(sequenceChallengeState.choice===null)return;sequenceChallengeState.index=(sequenceChallengeState.index+1)%sequenceChallengeQuestions.length;sequenceChallengeState.choice=null;renderSequenceChallenge();
}
function resetSequenceChallenge(){sequenceChallengeState={index:0,correct:0,answered:0,choice:null};renderSequenceChallenge();toast('Sequence recognition challenge restarted')}
function openChallengeFamily(){const q=sequenceChallengeQuestions[sequenceChallengeState.index%sequenceChallengeQuestions.length];selectSequenceFamily(q.answer);$('sequenceFamilyDetail')?.scrollIntoView({behavior:uiPrefs.reduceMotion?'auto':'smooth',block:'start'})}

function sequenceFamilyVendorText(f){const v=sequenceFamilyState.vendor;return f.vendor[v]||f.vendor.generic}
function sequenceFamilyPersist(){try{localStorage.setItem(MRCC_SEQUENCE_FAMILY_KEY,JSON.stringify(sequenceFamilyState))}catch(e){}}
function clearRetiredProtocolWorkspace(){try{localStorage.removeItem('mrcc_protocol_workspace_v1');localStorage.removeItem('mrcc_protocol_scanner_profiles_v1')}catch(e){}}
function renderSequenceFamilyGrid(){
 const box=$('sequenceFamilyGrid');if(!box)return;const q=(sequenceFamilyState.query||'').trim().toLowerCase(),filter=sequenceFamilyState.filter;
 const rows=sequenceFamilies.filter(f=>(filter==='all'||f.group===filter)&&(!q||[f.title,f.short,f.code,...f.tags,...f.aliases,Object.values(f.vendor).join(' ')].join(' ').toLowerCase().includes(q)));
 box.innerHTML=rows.map(f=>'<button type="button" class="seqfam-family '+(f.id===sequenceFamilyState.selected?'active':'')+'" data-seq-family="'+f.id+'"><div class="seqfam-family-top"><b>'+escapeHtml(f.title)+'</b><span class="seqfam-family-code">'+escapeHtml(f.code)+'</span></div><p>'+escapeHtml(f.short)+'</p><div class="seqfam-tags">'+f.tags.slice(0,3).map(t=>'<span>'+escapeHtml(t)+'</span>').join('')+'</div></button>').join('');
 if($('seqFamilyCount'))$('seqFamilyCount').textContent=rows.length+' famil'+(rows.length===1?'y':'ies');
 if(!rows.some(f=>f.id===sequenceFamilyState.selected)&&rows.length)sequenceFamilyState.selected=rows[0].id;
 renderSequenceFamilyDetail();
}
function sequenceList(items){return '<ul>'+items.map(x=>'<li>'+escapeHtml(x)+'</li>').join('')+'</ul>'}
function renderSequenceFamilyDetail(){
 const box=$('sequenceFamilyDetail');if(!box)return;const f=sequenceFamilyById(sequenceFamilyState.selected),vendors=[['Generic',f.vendor.generic],['GE',f.vendor.ge],['Siemens',f.vendor.siemens],['Philips',f.vendor.philips]];
 box.innerHTML='<div class="seqfam-detail-hero"><small>'+escapeHtml(f.code)+' · '+escapeHtml(f.group==='spin'?'spin-echo lineage':f.group==='gre'?'gradient-echo lineage':f.group==='fast'?'fast / motion family':'specialty family')+'</small><h3>'+escapeHtml(f.title)+'</h3><p>'+escapeHtml(f.short)+'</p><div class="seqfam-dna">'+f.tags.map(t=>'<span>'+escapeHtml(t)+'</span>').join('')+'<span>'+escapeHtml(sequenceFamilyVendorText(f))+'</span></div></div><div class="seqfam-detail-grid"><div class="seqfam-detail-block wide"><small>How it works</small><p>'+escapeHtml(f.mechanism)+'</p></div><div class="seqfam-detail-block wide"><small>Contrast behavior</small><p>'+escapeHtml(f.contrast)+'</p></div><div class="seqfam-detail-block"><small>Console clues</small><p>'+escapeHtml(f.console)+'</p></div><div class="seqfam-detail-block"><small>Common roles</small>'+sequenceList(f.uses)+'</div><div class="seqfam-detail-block"><small>Strengths</small>'+sequenceList(f.strengths)+'</div><div class="seqfam-detail-block"><small>Tradeoffs / failure modes</small>'+sequenceList([...f.tradeoffs,...f.artifacts])+'</div><div class="seqfam-detail-block wide"><small>Vendor-name examples</small><div class="seqfam-vendor-list">'+vendors.map(([k,v])=>'<div class="seqfam-vendor-row"><span>'+escapeHtml(k)+'</span><span>'+escapeHtml(v)+'</span></div>').join('')+'</div></div></div>';
 document.querySelectorAll('[data-seq-family]').forEach(b=>b.classList.toggle('active',b.dataset.seqFamily===f.id));
 renderSequenceAnatomy();
}
function selectSequenceFamily(id){if(!sequenceFamilies.some(f=>f.id===id))return;sequenceFamilyState.selected=id;sequenceFamilyPersist();renderSequenceFamilyDetail()}
function setSequenceFamilyFilter(filter){sequenceFamilyState.filter=['all','spin','gre','fast','special'].includes(filter)?filter:'all';sequenceFamilyPersist();document.querySelectorAll('[data-seqfam-filter]').forEach(b=>b.classList.toggle('active',b.dataset.seqfamFilter===sequenceFamilyState.filter));renderSequenceFamilyGrid()}
function sequenceTranslateAlias(){
 const input=$('seqAliasInput'),result=$('seqAliasResult');if(!input||!result)return;const q=input.value.trim();
 if(!q){result.innerHTML='<span>Type a sequence name first.</span>';return}
 if(/^t1$|^t2$|^pd$|^proton density$/i.test(q)){result.innerHTML='<b>'+escapeHtml(q.toUpperCase())+' is a weighting, not a sequence family.</b><span>Look for the readout family too: FSE/TSE, GRE, IR, EPI, 3D FSE, etc.</span>';return}
 const rule=sequenceAliasRules.find(r=>r.re.test(q));
 if(!rule){result.innerHTML='<b>No confident family match.</b><span>Look for clues such as FSE/TSE, GRE, EPI, STIR/FLAIR, Dixon, TOF, or a vendor family name. Scanner/software naming varies.</span>';return}
 const fams=rule.ids.map(sequenceFamilyById);result.innerHTML='<b>'+fams.map(f=>escapeHtml(f.title)).join(' + ')+'</b><span>'+escapeHtml(rule.note)+' Vendor label: '+escapeHtml(q)+'.</span>';
 sequenceFamilyState.selected=fams[0].id;sequenceFamilyPersist();renderSequenceFamilyDetail();
}
function populateSequenceCompare(){
 const a=$('seqCompareA'),b=$('seqCompareB');if(!a||!b)return;const options=sequenceFamilies.map(f=>'<option value="'+f.id+'">'+escapeHtml(f.title)+'</option>').join('');a.innerHTML=options;b.innerHTML=options;a.value=sequenceFamilyState.selected||'fse';b.value=a.value==='gre'?'fse':'gre';renderSequenceCompare();
}
function renderSequenceCompare(){
 const a=sequenceFamilyById($('seqCompareA')?.value||'fse'),b=sequenceFamilyById($('seqCompareB')?.value||'gre'),box=$('seqCompareResult');if(!box)return;
 const keys=[...new Set([...Object.keys(a.traits),...Object.keys(b.traits)])];
 box.innerHTML='<table class="seqfam-compare-table"><thead><tr><th>Concept</th><th>'+escapeHtml(a.title)+'</th><th>'+escapeHtml(b.title)+'</th></tr></thead><tbody>'+keys.map(k=>'<tr><td>'+escapeHtml(k)+'</td><td>'+escapeHtml(a.traits[k]||'—')+'</td><td>'+escapeHtml(b.traits[k]||'—')+'</td></tr>').join('')+'<tr><td>Console names</td><td>'+escapeHtml(sequenceFamilyVendorText(a))+'</td><td>'+escapeHtml(sequenceFamilyVendorText(b))+'</td></tr></tbody></table>';
}
function restoreSequenceFamiliesLab(){
 clearRetiredProtocolWorkspace();
 let raw=null;try{raw=JSON.parse(localStorage.getItem(MRCC_SEQUENCE_FAMILY_KEY)||'null')}catch(e){}
 if(raw&&typeof raw==='object')sequenceFamilyState={...sequenceFamilyState,...raw,query:''};
 if(!sequenceFamilies.some(f=>f.id===sequenceFamilyState.selected))sequenceFamilyState.selected='fse';
 if(!['all','spin','gre','fast','special'].includes(sequenceFamilyState.filter))sequenceFamilyState.filter='all';
 if(!['generic','ge','siemens','philips'].includes(sequenceFamilyState.vendor))sequenceFamilyState.vendor='generic';
 if($('seqFamilyVendor'))$('seqFamilyVendor').value=sequenceFamilyState.vendor;
 document.querySelectorAll('[data-seqfam-filter]').forEach(b=>b.classList.toggle('active',b.dataset.seqfamFilter===sequenceFamilyState.filter));
 renderSequenceFamilyGrid();populateSequenceCompare();renderSequenceAnatomy();renderSequenceChallenge();renderSequenceDna();
}
function bindSequenceFamiliesLab(){
 $('sequenceFamilyGrid')?.addEventListener('click',e=>{const b=e.target.closest('[data-seq-family]');if(b)selectSequenceFamily(b.dataset.seqFamily)});
 $('seqFamilySearch')?.addEventListener('input',e=>{sequenceFamilyState.query=e.target.value;renderSequenceFamilyGrid()});
 document.querySelectorAll('[data-seqfam-filter]').forEach(b=>b.addEventListener('click',()=>setSequenceFamilyFilter(b.dataset.seqfamFilter)));
 $('seqFamilyVendor')?.addEventListener('change',e=>{sequenceFamilyState.vendor=e.target.value;sequenceFamilyPersist();renderSequenceFamilyDetail();renderSequenceCompare()});
 $('seqAliasBtn')?.addEventListener('click',sequenceTranslateAlias);$('seqAliasInput')?.addEventListener('keydown',e=>{if(e.key==='Enter')sequenceTranslateAlias()});
 document.querySelectorAll('[data-seq-alias]').forEach(b=>b.addEventListener('click',()=>{if($('seqAliasInput'))$('seqAliasInput').value=b.dataset.seqAlias;sequenceTranslateAlias()}));
 $('seqCompareA')?.addEventListener('change',renderSequenceCompare);$('seqCompareB')?.addEventListener('change',renderSequenceCompare);
 $('seqChallengeChoices')?.addEventListener('click',e=>{const b=e.target.closest('[data-seq-challenge-choice]');if(b)answerSequenceChallenge(b.dataset.seqChallengeChoice)});
 $('seqChallengeNextBtn')?.addEventListener('click',nextSequenceChallenge);$('seqChallengeResetBtn')?.addEventListener('click',resetSequenceChallenge);$('seqChallengeOpenBtn')?.addEventListener('click',openChallengeFamily);
}
bindSequenceDna();
function openSequenceFamiliesLab(){setFocusedSection('protocol');routeHash('sequences');$('protocol')?.scrollIntoView({behavior:uiPrefs.reduceMotion?'auto':'smooth',block:'start'});remember('protocol','Sequence Families Lab');setWorkspaceTabActive('protocol')}
function openProtocolWorkspace(){openSequenceFamiliesLab()}
bindSequenceFamiliesLab();

window.addEventListener('pagehide',()=>{if(sandboxAutosaveTimer){clearTimeout(sandboxAutosaveTimer);sandboxAutosaveTimer=null}try{persistSandboxCurrentState()}catch(e){}});
restoreContrastState();restoreTimingState();restoreMotionState();restoreKspaceState();restoreSpatialState();restoreArtifactLabState();restoreSequenceFamiliesLab();renderLabsHome();
applyModuleArt();ensureModuleFooters();renderParameterGoal();renderParameterChallenge();renderWorkbenchHome();renderDataHealth();renderRetiredDataSummary();restoreRouteFromHash();
