// Test the installed Harness implementation, with synthetic profiles and controlled transport.
// No real model endpoint, account, credential file or user configuration is touched.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import vm from 'node:vm';

const sdk = process.env.DSH_SDK_ROOT ?? 'D:/npm-global/node_modules/@deepseek-ai/dsh';
const require = createRequire(sdk + '/package.json');
const ts = createRequire(new URL('../package.json', import.meta.url))('typescript');
const llmPath = require.resolve('@deepseek-ai/dsh-llm');
const piPath = require.resolve('@deepseek-ai/dsh-llm-pi-ai');
const { LlmRuntime, LlmError, normalizeApiKey, INVALID_CREDENTIAL_CODE, attributionHeaders } = await import(pathToFileURL(llmPath).href);
const catalogRoot = sdk + '/node_modules/@earendil-works/pi-ai/';
const catalogPackage = JSON.parse(readFileSync(catalogRoot + 'package.json', 'utf8'));
function importTarget(entry) { if (typeof entry === 'string') return entry; return importTarget(entry.import ?? entry.default); }
const subpath = './providers/all';
const exportKey = Object.keys(catalogPackage.exports).find(key => key === subpath || (key.includes('*') && subpath.startsWith(key.split('*')[0]) && subpath.endsWith(key.split('*')[1])));
assert.ok(exportKey, 'Catalog export not declared');
const wildcard = exportKey.includes('*') ? subpath.slice(exportKey.split('*')[0].length, exportKey.split('*')[1].length === 0 ? undefined : -exportKey.split('*')[1].length) : '';
const catalogEntry = importTarget(catalogPackage.exports[exportKey]).replaceAll('*', wildcard);
const catalogs = await import(pathToFileURL(catalogRoot + catalogEntry).href);
const piSource = readFileSync(piPath, 'utf8');
const marker = '//#region lib/types/discovery.js';
const start = piSource.indexOf(marker);
const end = piSource.indexOf('//#endregion', start);
assert.ok(start >= 0 && end > start, 'Installed discovery implementation not found');
const parsed = ts.createSourceFile('pi.js', piSource, ts.ScriptTarget.Latest, true);
const catalogNode = parsed.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === 'catalogModels');
assert.ok(catalogNode, 'Installed catalogModels helper not found');
const calls = [];
let body = { data: [{ id: 'sdk-fixture-a', name: 'SDK fixture A', context_window: 131072, max_output_tokens: 8192 }, { id: 'sdk-fixture-a' }, { id: '' }, { id: 'sdk-fixture-b', display_name: 'SDK fixture B' }] };
let status = 200;
let resolveCount = 0;
const sandbox = {
  ...catalogs, LlmError, normalizeApiKey, INVALID_CREDENTIAL_CODE, attributionHeaders,
  Headers, Response, TextDecoder, Uint8Array, Map, Set, AbortController,
  fetch: async (url, options) => {
    assert.equal(new URL(url).hostname, 'fixture.invalid', 'Blocked unexpected network target');
    calls.push({ url, method: options.method, authorization: options.headers.get('authorization'), custom: options.headers.get('x-fixture') });
    return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
  }
};
vm.createContext(sandbox);
const catalogStart = piSource.lastIndexOf('//#region', catalogNode.getStart(parsed));
const catalogEnd = piSource.indexOf('//#endregion', catalogNode.getStart(parsed));
assert.ok(catalogStart >= 0 && catalogEnd > catalogStart, 'Catalog helper region not found');
vm.runInContext(piSource.slice(catalogStart, catalogEnd) + '\n' + piSource.slice(start, end) + '\nglobalThis.actualDiscoverModels=discoverModels;', sandbox);
const runtime = { discoveries: new Map([['llm-pi-ai', request => sandbox.actualDiscoverModels(request, () => ({ headers: { 'x-fixture': 'test' }, resolveApiKey: async () => { resolveCount++; return 'sdk-fixture-key'; } }))]]) };
runtime.discoverModels = (...args) => LlmRuntime.prototype.discoverModels.call(runtime, ...args);

const known = await runtime.discoverModels('llm-pi-ai', { provider: 'openai' });
assert.ok(known.length > 0, 'Real SDK built-in catalog must return models');
assert.equal(calls.length, 0, 'Built-in catalog must not make a network call');
assert.equal(resolveCount, 0, 'Built-in catalog must not resolve credentials');
console.log(`PASS: installed built-in OpenAI catalog (${known.length} models), zero network/credential access`);

const models = await runtime.discoverModels('llm-pi-ai', { provider: 'sdk-fixture-gateway', baseURL: 'https://fixture.invalid/compatible/v1/', api: 'openai-completions' });
assert.deepEqual(models.map(m => m.id), ['sdk-fixture-a', 'sdk-fixture-b']);
assert.equal(models[0].contextWindow, 131072);
assert.equal(models[0].maxTokens, 8192);
assert.equal(calls[0].url, 'https://fixture.invalid/compatible/v1/models');
assert.equal(calls[0].method, 'GET');
assert.equal(calls[0].authorization, 'Bearer sdk-fixture-key');
assert.equal(calls[0].custom, 'test');
assert.equal(resolveCount, 1);
console.log('PASS: actual SDK listing, nested baseURL, stored-header/key seam, capacity parsing and deduplication');

const before = calls.length;
await assert.rejects(runtime.discoverModels('llm-pi-ai', { provider: 'sdk-fixture-gateway', baseURL: 'https://fixture.invalid/v1', api: 'anthropic-messages' }), e => e.code === 'DISCOVERY_UNSUPPORTED');
assert.equal(calls.length, before, 'Unsupported protocol must fail before HTTP');
await assert.rejects(runtime.discoverModels('llm-deepseek', { provider: 'deepseek-account' }), e => e.code === 'NO_DISCOVERY');
await assert.rejects(runtime.discoverModels('llm-pi-ai', {}), e => e.code === 'INVALID_DISCOVERY');
console.log('PASS: unsupported protocol, unregistered discovery namespace and missing endpoint/route are honest failures');

status = 401;
await assert.rejects(runtime.discoverModels('llm-pi-ai', { provider: 'sdk-fixture-gateway', baseURL: 'https://fixture.invalid/v1', api: 'openai-responses' }), /check the API key/);
status = 200; body = { wrong: [] };
await assert.rejects(runtime.discoverModels('llm-pi-ai', { provider: 'sdk-fixture-gateway', baseURL: 'https://fixture.invalid/v1' }), /no "data" array/);
await assert.rejects(LlmRuntime.prototype.remoteDiscoverModels.call(runtime, 'llm-deepseek', { provider: 'deepseek-account' }), e => e.code === 'llm/model-discovery-rejected');
console.log('PASS: authentication refusal, malformed catalog and remote error envelope');
console.log('ALL SDK DISCOVERY CONTRACT CHECKS PASSED (controlled transport only)');
