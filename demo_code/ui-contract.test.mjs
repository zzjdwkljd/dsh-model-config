// Preserve old controllers except the explicitly authorized discovery picker, draft and feedback changes. No real Host or credentials.
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(import.meta.url);
const ts = require('typescript');
const baseline = JSON.parse(readFileSync(new URL('./ui-business-baseline.json', import.meta.url), 'utf8'));
const source = readFileSync(root + 'src/client.ts', 'utf8');
const artifact = readFileSync(root + 'client.js', 'utf8');
const printer = ts.createPrinter({ removeComments: true });
const hash = text => createHash('sha256').update(text).digest('hex');

function collect(text) {
  const file = ts.createSourceFile('client.ts', text, ts.ScriptTarget.Latest, true);
  const functions = {};
  const expressions = [];
  function visit(node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer
      && (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer))) {
      functions[node.name.text] = hash(printer.printNode(ts.EmitHint.Unspecified, node.initializer, file));
    }
    if (ts.isFunctionDeclaration(node) && node.name) {
      functions[node.name.text] = hash(printer.printNode(ts.EmitHint.Unspecified, node, file));
    }
    if (ts.isPropertyAssignment(node)
      && ['onClick', 'onChange', 'onKeyDown', 'onSubmit', 'disabled', 'aria-checked'].includes(node.name.getText(file).replaceAll('"', ''))) {
      expressions.push(node.name.getText(file) + ':' + printer.printNode(ts.EmitHint.Unspecified, node.initializer, file));
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  return { functions, expressions: expressions.sort() };
}

// These nine earlier functions were intentionally changed for the user-requested
// selectable catalog, visible new-provider discovery, cancellation, localized errors
// and for the create path speaking up: the form now reports a rejected field, and a
// rejected discovery or write call no longer escapes a `void`-called promise (which
// left the dialog looking like the button had done nothing).
// Pin their NEW hashes rather than broadly exempting them from regression checks.
const authorizedFunctionReplacements = {
  commit: '25fb299d483fdc2b244c7cf23bdc8bba90cbb65b6a626e561ea725c2dc8b86b1',
  startCreate: '31c401bacd7af518c487f3f85518072b15fb85f700ca756381a6b0a4c1dc4081',
  closeCreate: '916d2864f18f67089338c64c91113b6b63e79f06c23c843b0a8c0d7b6cd9153d',
  describeFetchFailure: 'd7b0ec94262d541a78e7835463c7d7dd4de1e91099acc542857678504973aac8',
  patchCreate: '1e956f35665ace785ec548db84d0e4146cef73fb7c65256650fac072575e099b',
  runFetchModels: 'bb4fc84102e4b11268ab606c978fb140101e9034acc3e86e035d3e9875f8e75b',
  adoptPickedModels: 'f752afe838d8ae68c4c4b29055cc87e00fd8e129614b1e4126d72689d4a09089',
  submitCreate: 'a696105aa78df50846d35641856bd6e6c32a3c3954ff84533bca99b3a8c562b6',
  onKey: 'c19bf4fc8209391710104e7ac25c2b1ff5daecdbc4e1adfce7a3ecf53fa67844'
};
// Replaced expressions: former URL-dependent disabled state, the inline draft
// candidate bar's check/select/submit handlers, and closing the entire draft
// when clicking its overlay (the picker now returns to the draft instead).
const authorizedExpressionReplacements = new Set([
  '1c59b057911bfbef44e5a841a21a9272a91a87e517518c2dccb98484f0991458',
  '51c9908d083e0cad88ec15fb5a826f67154db46d736d728b261838d51eba05b6',
  '06172b817bc0c3f31d6d04e155a0b63e5b9b0b03afffcd317b0f09cecef8dfe1',
  '0f669d8cfa813505492de0f67c6bcf6177bb8b977cfa070765af5f567eee9ae2',
  '50643fbfee906ee2dd8cbd0c20d5a161d73794667a19dc59ea02139c7aad91fd'
]);
const actual = collect(source);
for (const [name, expected] of Object.entries(baseline.functions)) {
  assert.equal(actual.functions[name], authorizedFunctionReplacements[name] ?? expected,
    `Original business/helper function unexpectedly changed: ${name}`);
}
const expressionCounts = {};
for (const expression of actual.expressions) { const key = hash(expression); expressionCounts[key] = (expressionCounts[key] ?? 0) + 1; }
for (const [key, count] of Object.entries(baseline.expressionCounts)) {
  if (authorizedExpressionReplacements.has(key)) {
    assert.equal(count, 1, 'The documented replaced expression should have occurred only once');
    assert.equal(expressionCounts[key] ?? 0, 0, 'An obsolete discovery-form control was retained');
  } else assert.ok((expressionCounts[key] ?? 0) >= count,
    'A non-exempt original event/permission/checked expression was removed or changed');
}

const output = ts.createSourceFile('client.js', artifact, ts.ScriptTarget.Latest, true);
assert.equal(output.statements.length, 1, 'The shared combo bundle must have exactly one top-level statement');
assert.match(output.statements[0].getText(output), /^window\.__ModuleLoader__\.load\(/);
assert.ok(source.includes('mcf-modelRow mcf-configModelRow'), 'Config rows lost their scoped layout hook');
assert.ok(source.includes('mcf-testResult mcf-modelFeedback '), 'Test feedback is no longer attached to the model card');
assert.ok(source.includes('--mcf-scrim:rgba(22,32,52,.30)'), 'The light scrim must be translucent');
assert.ok(source.includes('--mcf-scrim:rgba(4,8,18,.62)'), 'The dark scrim must be translucent');
assert.ok(source.includes('corner-shape:round;overflow:hidden'), 'Modal child backgrounds must respect the round clip');
assert.ok(source.includes('container-name:mcf-provider;container-type:inline-size'), 'Narrow host panes need a container breakpoint');
assert.ok(source.includes('body[data-ds-dark-theme] .mcf-page .mcf-btnPrimary'), 'Dark primary-button text override is missing');

console.log(`PASS: ${Object.keys(baseline.functions).length - Object.keys(authorizedFunctionReplacements).length} original functions unchanged; ${Object.keys(authorizedFunctionReplacements).length} authorized functions pinned to new hashes`);
console.log(`PASS: ${baseline.expressionCount - authorizedExpressionReplacements.size} original controller expressions retained; ${authorizedExpressionReplacements.size} documented replacements; ${actual.expressions.length} total expressions`);
console.log('PASS: client combo contract, scoped rows, attached feedback, translucent/rounded overlays and narrow-pane hooks');
assert.ok(source.includes('className: "mcf-modelList", ref: modelScrollRef'), 'The model scroll area lost its measurement/ref hook');
assert.ok(source.includes('className: "mcf-createModelRow"'), 'The new-provider form lost its independent row class');
assert.ok(source.includes('provider: row.provider'), 'Model lookup must identify the configured provider');
assert.ok(source.includes('controller.signal'), 'Query cancellation must reach the SDK');
assert.ok(source.includes('const saveLookup = async (): Promise<void>'), 'Selected catalog models need an explicit save controller');
assert.ok(source.includes('await commit(row, [...row.models, ...additions]'), 'Catalog must reuse the revision-checked writer');
assert.ok(source.includes('disabled: fetching || createBusy || probeBusy'), 'Fetch must stay clickable when the URL is absent');
assert.ok(source.includes('className: "mcf-createModelEditor"'), 'The draft must have an independent scrolling model editor');
assert.ok(source.includes('disabled: selectedCount === 0'), 'An empty candidate selection must not be submitted');
console.log('Note: structural safety gates are supplemented by controlled browser success/error/conflict/scroll regression.');
