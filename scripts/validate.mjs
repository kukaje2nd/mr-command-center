import fs from 'node:fs';

const fail = [];
const html = fs.readFileSync('index.html', 'utf8');
const trimmed = html.trim();

if (!trimmed.endsWith('</html>')) fail.push('index.html does not end cleanly with </html>.');
const htmlCloseCount = (html.match(/<\/html>/g) || []).length;
if (htmlCloseCount !== 1) fail.push('Expected exactly one </html> closing tag; found ' + htmlCloseCount + '.');

const scriptOpenCount = (html.match(/<script>/g) || []).length;
const scriptCloseCount = (html.match(/<\/script>/g) || []).length;
if (scriptOpenCount !== 1 || scriptCloseCount !== 1) {
  fail.push('Expected exactly one inline <script> block.');
}

const match = html.match(/<script>([\s\S]*?)<\/script>/);
if (!match) {
  fail.push('Inline application script was not found.');
} else {
  try {
    new Function(match[1]);
  } catch (error) {
    fail.push('JavaScript parse failure: ' + error.message);
  }

  const script = match[1];
  const requiredFunctions = [
    'go',
    'openPalette',
    'sandboxUpdate',
    'solveArtifact',
    'renderTasks',
    'openPreferences',
    'runSelfCheck',
    'saveSandboxPreset',
    'exportSandboxPresets',
    'importSandboxPresets',
    'duplicateSandboxPreset',
    'renameSandboxPreset',
    'saveComparisonHistory',
    'renderComparisonHistory',
    'restoreComparisonHistory',
    'copyComparisonHistory',
    'deleteComparisonHistory',
    'trackUsage',
    'usageSummary',
    'renderUsageInsights',
    'exportUsageInsights',
    'resetUsageInsights',
    'renderLearningProgress',
    'saveLearningAttempt',
    'exportLearningProgress',
    'resetLearningProgress',
    'workspaceReportText',
    'buildWorkspaceReport',
    'copyWorkspaceReport',
    'downloadWorkspaceReport',
    'printWorkspaceReport'
  ];

  for (const name of requiredFunctions) {
    const declaration = new RegExp('function\\s+' + name + '\\s*\\(');
    const assignment = new RegExp('(?:const|let|var)\\s+' + name + '\\s*=');
    if (!declaration.test(script) && !assignment.test(script)) {
      fail.push('Required function is missing: ' + name);
    }
  }

  const handlerAttrs = [...html.matchAll(/on(?:click|change|input|keydown)="([^"]+)"/g)];
  const referenced = new Set();
  for (const attr of handlerAttrs) {
    for (const call of attr[1].matchAll(/\b([A-Za-z_$][\w$]*)\s*\(/g)) {
      referenced.add(call[1]);
    }
  }

  const ignored = new Set(['if']);
  for (const name of referenced) {
    if (ignored.has(name)) continue;
    const declaration = new RegExp('function\\s+' + name + '\\s*\\(');
    const assignment = new RegExp('(?:const|let|var)\\s+' + name + '\\s*=');
    if (!declaration.test(script) && !assignment.test(script)) {
      fail.push('Inline event handler references an undefined function: ' + name);
    }
  }
}

const requiredIds = [
  'cockpit',
  'safety',
  'math',
  'sandbox',
  'rescue',
  'artifact',
  'burn',
  'shift',
  'learn',
  'artifactSelect',
  'context',
  'sbFov',
  'sbSnr',
  'taskInput',
  'prefsBack',
  'presetList',
  'presetSearch',
  'comparisonHistoryList',
  'historyName',
  'usageInsights',
  'usageTopList',
  'usageShift',
  'usageAll',
  'usageDistinct',
  'usageTopName',
  'learningProgress',
  'learnHistory',
  'learnAttempts',
  'learnBest',
  'learnLatest',
  'learnDays',
  'reports',
  'workspaceReportPreview',
  'reportHandoff',
  'reportProtocol',
  'reportUsage',
  'reportLearning'
];

for (const id of requiredIds) {
  if (!html.includes('id="' + id + '"')) fail.push('Required element id is missing: ' + id);
}

const requiredWorkflowCopy = [
  'Thermal / RF Setup Check',
  'TREAT AS MR UNSAFE / STOP',
  'Completion ≠ clearance',
  'not a clinical report or patient clearance'
];

for (const text of requiredWorkflowCopy) {
  if (!html.toLowerCase().includes(text.toLowerCase())) {
    fail.push('Required safety/workflow copy is missing: ' + text);
  }
}

if (fail.length) {
  console.error('\nMR Command Center validation failed:\n');
  for (const item of fail) console.error('- ' + item);
  process.exit(1);
}

console.log('MR Command Center validation passed.');
