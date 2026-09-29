/*
 * Sidebar "Model configuration" page: a provider accordion over the current
 * configuration, hand-written model add, a real connectivity probe, and a
 * per-model vision switch.
 *
 * Type policy: every value crossing a seam (Remote results, the settings
 * document, the loader contract) is declared as a concrete type below. There
 * is no `any` anywhere in this file — the only assertions are the ones a
 * runtime predicate has already narrowed.
 *
 * Module shape: client artifacts are concatenated into shared combo scripts,
 * so the file's ONLY top-level statement is the loader call and every runtime
 * binding lives inside the factory body, exactly like a shipped module.
 */

/* ------------------------------------------------------------------ wire types */

/** JSON as it crosses the settings and Remote seams. */
type JsonValue = null | boolean | number | string | JsonValue[] | JsonObject;

/** A JSON object; values may be absent because JSON keys can be unset. */
interface JsonObject {
	[key: string]: JsonValue | undefined;
}

/** Input types a model row declares. */
type InputModality = "text" | "image";

/** Which model field one adapter family stores input types under. */
type InputField = "inputModalities" | "input";

/** One row of a provider's `models` catalog as the settings document holds it. */
interface ModelRow {
	id: string;
	name?: string;
	contextWindow?: number;
	maxTokens?: number;
	inputModalities?: InputModality[];
	input?: InputModality[];
	imagePixelBudget?: number;
	imageMaxBytes?: number;
	[key: string]: JsonValue | undefined;
}

/** A Remote answer: business failures arrive as data and narrow on `ok`. */
type RemoteResult<T> =
	| { ok: true; value: T }
	| { ok: false; error: { code: string; message: string } };

/** `llm/listProviders` row. */
interface LlmProviderInfo {
	id: string;
	name: string;
}

/** `llm/listConfigurableProviders` row. */
interface LlmConfigurableProvider {
	provider: string;
	displayName: string;
	settingsNs: string;
	settingsPath: string[];
	declared?: boolean;
	error?: string;
}

/** One served namespace inside `settings/describe`. */
interface SettingsNamespaceView {
	ns: string;
	revision: number;
	value: JsonValue;
	base?: JsonValue;
	user?: JsonValue;
}

/** The settings document answer. */
interface SettingsDescribeValue {
	writable: boolean;
	hasDocument: boolean;
	namespaces: SettingsNamespaceView[];
}

/** One path-addressed settings write. */
type SettingsPathOp =
	| { op: "set"; path: string[]; value: JsonValue }
	| { op: "unset"; path: string[] };

/* ------------------------------------------------------------ client contracts */

/** `llm/discoverModels` request: an endpoint to ask, with optional overrides. */
interface LlmModelDiscoveryRequest {
	provider?: string;
	baseURL?: string;
	api?: string;
	apiKey?: string;
}

/** One model a discover call found on the endpoint. */
interface LlmDiscoveredModel {
	id: string;
	name?: string;
	contextWindow?: number;
	maxTokens?: number;
	inputModalities?: readonly string[];
}

/** `llm/listProviders` + `llm/discoverModels`, the only llm methods this page calls. */
interface LlmRemote {
	listProviders(): Promise<RemoteResult<LlmProviderInfo[]>>;
	listConfigurableProviders(): Promise<RemoteResult<LlmConfigurableProvider[]>>;
	discoverModels(
		settingsNs: string,
		request: LlmModelDiscoveryRequest,
	): Promise<RemoteResult<LlmDiscoveredModel[]>>;
}

interface SettingsRemote {
	describe(): Promise<RemoteResult<SettingsDescribeValue>>;
	mutate(
		ns: string,
		ops: SettingsPathOp[],
		expectedRevision?: number,
	): Promise<RemoteResult<SettingsNamespaceView>>;
}

/** The credential store: named secret references keyed by `deriveKeyRef`. */
interface CredentialsRemote {
	set(ref: string, value: string): Promise<RemoteResult<unknown>>;
}

interface RemoteService {
	readonly llm: LlmRemote;
	readonly settings: SettingsRemote;
	readonly credentials?: CredentialsRemote;
	$on?(event: string, listener: () => void): () => void;
}

/** A bound dictionary lookup; one argument, no formatting helpers. */
type Translate = (key: string) => string;

interface LocaleService {
	register(ns: string, dicts: Record<string, Record<string, string>>): () => void;
	bind(ns: string): Translate;
	subscribe(listener: () => void): () => void;
}

type SlotScope = "root" | "session" | "session-maybe";
type SlotKind = "list" | "keyed" | "single" | "chain";

interface SlotChildDeclaration {
	kind: SlotKind;
	scope: SlotScope;
}

interface SlotRegistrationOptions {
	name: string;
	id?: string;
	key?: string;
	order?: number;
	locale?: string;
	label?: () => string;
	children?: Record<string, SlotChildDeclaration>;
}

/** The child-dispatch binding the renderer hands to entries that declare children. */
type RenderSlot = (
	key: string,
	owner?: Record<string, unknown>,
	opts?: Record<string, unknown>,
) => ReactNode;

/** Props every slot entry receives; declared members keep their precise types. */
interface SlotProps {
	t?: Translate;
	renderSlot?: RenderSlot;
	[key: string]: unknown;
}

interface SlotsService {
	inject(key: string, callback: () => unknown): () => void;
	register(options: SlotRegistrationOptions, component: ComponentType<SlotProps>): unknown;
}

interface ClientContext {
	readonly slots: SlotsService;
	readonly locale: LocaleService;
	readonly remote: RemoteService;
	effect(callback: () => unknown, label?: string): () => void;
}

interface ClientPlugin {
	inject?: string[];
	apply(ctx: ClientContext): void;
}

/** The loader hands each factory a typed module table; `require` is its parameter. */
type ClientRequire = <T>(id: string) => T;

interface ModuleLoader {
	load(config: { id: string; factory: (require: ClientRequire) => ClientPlugin }): void;
}

interface Window {
	/** Guaranteed before any client module runs: the loader installs it at boot. */
	__ModuleLoader__: ModuleLoader;
}

type ReactNode = import("react").ReactNode;
type ComponentType<P> = import("react").ComponentType<P>;

/* ------------------------------------------------------------------ page types */

/** One provider row after the directory, live routes, and settings are joined. */
interface ProviderRow {
	provider: string;
	displayName: string;
	settingsNs: string;
	settingsPath: string[];
	directoryError?: string;
	active: boolean;
	editable: boolean;
	configured: boolean;
	profile: JsonValue | undefined;
	models: ModelRow[];
}

/** One directory entry before it is joined with settings. */
interface DirectoryEntry {
	provider: string;
	displayName: string;
	settingsNs: string;
	settingsPath: string[];
	directoryError?: string;
}

type PageStatus = "loading" | "ready" | "error";

/** A pending destructive confirmation: one model or one whole provider. */
interface ConfirmTarget {
	kind: "model" | "provider";
	provider: string;
	index?: number;
	title: string;
	detail: string;
}

interface PageState {
	status: PageStatus;
	error: string | null;
	/** True from the moment a load starts until it settles; drives the refresh affordance. */
	refreshing: boolean;
	/** Local time of the last settled load, shown in the toolbar as evidence it ran. */
	updatedAt: string | null;
	writable: boolean;
	rows: ProviderRow[];
	namespaces: Map<string, SettingsNamespaceView>;
}

type TestStatus = "testing" | "ok" | "fail";

interface TestState {
	status: TestStatus;
	message: string;
}

/** The Host half's probe answer. */
interface ProbeResult {
	ok: boolean;
	message: string;
}

/* ------------------------------------------------------------------- module body */

window.__ModuleLoader__.load({
	id: "@local/model-config",
	factory(require: ClientRequire): ClientPlugin {
		const React = require<typeof import("react")>("react");
		const h = React.createElement;

		/** Dictionary namespace owned by this plugin. */
		const NS = "model-config";

		/** Sidebar entry id; also the `main` panel key it selects. */
		const PANEL_ID = "model-config";

		/** The Host half's probe route, same origin as this page. */
		const TEST_PATH = "/model-config/test";

		/** English strings (the key-set source of truth for this pair). */
		const en: Record<string, string> = {
			panel: "Model config",
			title: "Model configuration",
			intro: "Model providers in the current configuration. Add models by hand, test that a model answers, and switch vision on per model.",
			refresh: "Refresh",
			refreshing: "Refreshing…",
			updated: "Updated {time}",
			loading: "Loading providers…",
			loadFailed: "Could not load the provider directory",
			retry: "Retry",
			empty: "This configuration has no model providers.",
			readOnly: "The settings document is read-only in this deployment, so nothing can be saved here.",
			active: "Enabled",
			inactive: "Disabled",
			inactiveHint: "This provider route is not registered, so it cannot be called.",
			notEditable: "This provider's models come from the deployment composition and cannot be edited here.",
			models: "Models",
			modelCount: "{count} models",
			modelsEmpty: "No models yet. Add one below.",
			addModel: "Add model",
			modelId: "Model ID",
			modelName: "Display name",
			modelIdPlaceholder: "e.g. deepseek-chat",
			add: "Add",
			cancel: "Cancel",
			idRequired: "Model ID is required.",
			idDuplicate: "Model ID must be unique.",
			vision: "Vision",
			visionOn: "Vision",
			visionLabel: "Vision for {model}",
			test: "Test",
			testing: "Testing…",
			testOk: "Connected — the model answered.",
			conflict: "These settings changed elsewhere. Refresh and try again.",
			noNamespace: "The settings section for this provider was not found.",
			nameDeepseekAccount: "DeepSeek Official Account",
			nameDeepseekOfficial: "DeepSeek Official API Key",
			addModelFor: "Add a model to {provider}",
			addHint: "Enter the model ID, test it if you like, then add it.",
			deleteModel: "Delete model",
			deleteProvider: "Delete provider",
			deleteModelTitle: "Delete this model?",
			deleteModelBody: "{model} will be removed from {provider}. This writes to your profile configuration and cannot be undone.",
			deleteProviderTitle: "Delete this provider?",
			deleteProviderBody: "{provider} and its {count} models will be removed from your profile configuration. This cannot be undone.",
			delete: "Delete",
			close: "Close",
			addProvider: "Add provider",
			newProviderTitle: "New provider",
			addProviderHint: "Once created it appears below like any other provider — every model supports testing and vision. Creation checks reachability first; if the check fails you can still create, skipping it.",
			probing: "Checking reachability…",
			skipProbe: "Skip the reachability check and create anyway (other checks still apply)",
			createdFlash: "Provider {provider} created.",
			keyStoreFailed: "The provider is created, but storing the API key failed: {message}",
			providerRoute: "Provider ID",
			providerRouteHint: "Lowercase letters, digits and dashes; starts with a letter. Becomes the key under providers.",
			providerRouteInvalid: "The ID may only use lowercase letters, digits and dashes, and must start with a letter.",
			routeTaken: "This ID is already taken by a provider in the list. Pick another ID, or delete that provider first.",
			providerName: "Display name (optional)",
			protocol: "API protocol",
			protocolOpenAiCompletions: "OpenAI-compatible",
			protocolOpenAiResponses: "OpenAI-compatible (Responses)",
			protocolAnthropicMessages: "Anthropic-compatible",
			sectionProvider: "Provider details",
			fetchUnreachable: "Could not reach {url}. Check the Base URL and your network.",
			fetchUnauthorized: "The endpoint rejected the key. Check the API key.",
			fetchStatus: "The endpoint answered {code}. Check the Base URL.",
			baseURLLabel: "Base URL",
			baseURLRequired: "A Base URL is required.",
			baseURLInvalid: "The Base URL must be an http(s) address.",
			apiKeyLabel: "API key",
			apiKeyHint: "Stored under the reference {ref}, derived from the provider ID.",
			keyRequired: "Enter the API key for this provider.",
			fetchModels: "Fetch available models",
			fetching: "Fetching…",
			fetchEmpty: "The endpoint answered with no models.",
			fetchNeedsBaseURL: "Enter the Base URL first.",
			adoptModels: "Add selected ({count})",
			search: "Search",
			toggleAll: "Toggle all",
			addModelRow: "Add a model",
			removeRow: "Remove",
			needOneModel: "Add at least one model.",
			create: "Create"
		};

		/** Chinese strings. */
		const zh: Record<string, string> = {
			panel: "模型配置",
			title: "模型配置",
			intro: "当前配置下的模型提供商。可手动添加模型、测试模型是否能够连通，并为单个模型打开识图。",
			refresh: "刷新",
			refreshing: "刷新中…",
			updated: "已更新 {time}",
			loading: "正在加载提供商…",
			loadFailed: "无法加载提供商目录",
			retry: "重试",
			empty: "当前配置中没有任何模型提供商。",
			readOnly: "设置文档在当前部署中为只读，此处无法保存修改。",
			active: "启用",
			inactive: "未启用",
			inactiveHint: "该提供商路由未注册，无法调用。",
			notEditable: "该提供商的模型由部署组合提供，无法在此编辑。",
			models: "模型",
			modelCount: "{count} 个模型",
			modelsEmpty: "还没有模型，可在下方手动添加。",
			addModel: "添加模型",
			modelId: "模型 ID",
			modelName: "显示名称",
			modelIdPlaceholder: "例如 deepseek-chat",
			add: "添加",
			cancel: "取消",
			idRequired: "模型 ID 不能为空。",
			idDuplicate: "模型 ID 不能重复。",
			vision: "识图",
			visionOn: "视觉",
			visionLabel: "识图（{model}）",
			test: "测试",
			testing: "测试中…",
			testOk: "连通正常，模型已应答。",
			conflict: "设置已在别处被修改，请刷新后重试。",
			noNamespace: "找不到该提供商的设置分区。",
			nameDeepseekAccount: "DeepSeek 官方账号",
			nameDeepseekOfficial: "DeepSeek 官方 API Key",
			addModelFor: "添加到 {provider}",
			addHint: "填写模型 ID，可先测试连通性再添加。",
			deleteModel: "删除模型",
			deleteProvider: "删除品牌商",
			deleteModelTitle: "删除该模型？",
			deleteModelBody: "将从 {provider} 中移除 {model}。该操作会写入你的 profile 配置，无法撤销。",
			deleteProviderTitle: "删除该品牌商？",
			deleteProviderBody: "将从 profile 配置中移除 {provider} 及其 {count} 个模型，无法撤销。",
			delete: "删除",
			close: "关闭",
			addProvider: "新增提供商",
			newProviderTitle: "新增提供商",
			addProviderHint: "创建后会像其他提供商一样出现在列表里，每个模型都可测试连通、打开识图。创建时会先检查接口能否连通，检查不过也可以选择跳过。",
			probing: "正在检查连通…",
			skipProbe: "跳过连通性检查，仍然创建（其他校验仍会生效）",
			createdFlash: "已创建提供商 {provider}。",
			keyStoreFailed: "提供商已创建，但密钥保存失败：{message}",
			providerRoute: "提供商 ID",
			providerRouteHint: "小写字母、数字和中划线，字母开头；将作为 providers 下的键名。",
			providerRouteInvalid: "ID 只能使用小写字母、数字和中划线，且以字母开头。",
			routeTaken: "该 ID 已被列表里已有的提供商占用。请换一个 ID，或先删除原来的卡片。",
			providerName: "显示名称（可留空）",
			protocol: "接口协议",
			protocolOpenAiCompletions: "OpenAI 兼容接口",
			protocolOpenAiResponses: "OpenAI 兼容接口（新版）",
			protocolAnthropicMessages: "Anthropic 兼容接口",
			sectionProvider: "提供商信息",
			fetchUnreachable: "连不上 {url}，请检查接口地址和网络。",
			fetchUnauthorized: "服务端拒绝了这个密钥，请检查 API Key 是否正确。",
			fetchStatus: "服务端返回了 {code}，请检查接口地址。",
			baseURLLabel: "接口地址",
			baseURLRequired: "请填写接口地址。",
			baseURLInvalid: "接口地址必须是 http(s) 开头的网址。",
			apiKeyLabel: "API Key",
			apiKeyHint: "密钥将按提供商 ID 派生的引用名 {ref} 保存。",
			keyRequired: "请填写该提供商的 API Key。",
			fetchModels: "获取可用模型",
			fetching: "获取中…",
			fetchEmpty: "端点没有返回任何模型。",
			fetchNeedsBaseURL: "请先填写接口地址。",
			adoptModels: "添加所选（{count}）",
			search: "搜索",
			toggleAll: "全选 / 反选",
			addModelRow: "添加一个模型",
			removeRow: "移除",
			needOneModel: "至少填写一个模型。",
			create: "创建"
		};

		/** Component-local styles; unmounting the page removes them with it. */
		const MCF_CSS = `
.mcf-page{box-sizing:border-box;height:100%;overflow:auto;flex-direction:column;align-items:center;gap:24px;padding:0 32px 56px;display:flex;background:var(--mcf-bg);color:var(--mcf-text);font-family:var(--dsw-font-family,-apple-system,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif);font-size:14px;line-height:22px;--mcf-accent:#635BFF;--mcf-accent-hover:#574FE8;--mcf-accent-soft:#EEEDFF;--mcf-tag-bg:#F0F0FF;--mcf-tag-line:#E5E3FF;--mcf-accent-line:#DCD9FF;--mcf-ring:#C7C2FF;--mcf-bg:#F6F7F9;--mcf-surface:#FFFFFF;--mcf-surface-hover:#FAFAFF;--mcf-surface-open:#FBFBFF;--mcf-text:#18181B;--mcf-text-2:#71717A;--mcf-text-3:#A1A1AA;--mcf-border:#E8E8EC;--mcf-border-hover:#DDDDF0;--mcf-neutral:#F4F4F5;--mcf-track-off:#D9DCE3;--mcf-ghost-border:#E4E4E7;--mcf-ghost-text:#52525B;--mcf-danger:#D92D20;--mcf-danger-strong:#B42318;--mcf-danger-soft:#FEF3F2;--mcf-danger-line:#FDA29B;--mcf-scrim:#18181B66;--mcf-success:#067647}
body[data-ds-dark-theme] .mcf-page{--mcf-bg:#0F0F11;--mcf-surface:#18181B;--mcf-surface-hover:#1F1F24;--mcf-surface-open:#1A1922;--mcf-text:#FAFAFA;--mcf-text-2:#A1A1AA;--mcf-text-3:#71717A;--mcf-border:#27272A;--mcf-border-hover:#3A3A45;--mcf-neutral:#232327;--mcf-accent-soft:#26243F;--mcf-tag-bg:#26243F;--mcf-tag-line:#3A3563;--mcf-accent-line:#4B45A8;--mcf-ring:#4B45A8;--mcf-track-off:#3F3F46;--mcf-ghost-border:#3F3F46;--mcf-ghost-text:#D4D4D8;--mcf-danger:#F97066;--mcf-danger-strong:#D92D20;--mcf-danger-soft:#3A1A18;--mcf-danger-line:#7A2A24;--mcf-scrim:#000000A6}
.mcf-page>*{width:100%;max-width:1104px}
.mcf-pageHead{box-sizing:border-box;justify-content:space-between;align-items:flex-start;gap:16px;padding-top:32px;display:flex}
.mcf-pageTitle{margin:0;color:var(--mcf-text);font-size:20px;font-weight:600;line-height:28px;letter-spacing:-.01em}
.mcf-pageIntro{color:var(--mcf-text-2);margin:6px 0 0;font-size:13px;line-height:20px;max-width:640px}
.mcf-toolbar{justify-content:flex-end;align-items:center;gap:10px;display:flex}
.mcf-toolbar>*{flex-shrink:0}
.mcf-updated{color:var(--mcf-text-3);align-self:center;white-space:nowrap;font-size:12px;line-height:18px}
@keyframes mcf-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
.mcf-spin{animation:mcf-spin .8s linear infinite;transform-origin:50% 50%}
.mcf-status{color:var(--mcf-text-3);margin:0;font-size:13px;line-height:20px}
.mcf-failure{color:var(--mcf-danger);align-items:center;gap:12px;display:flex}
.mcf-failure p{margin:0;font-size:13px;line-height:20px}
.mcf-notice{border-radius:9px;background:var(--mcf-neutral);color:var(--mcf-text-2);margin:0;padding:9px 12px;font-size:12px;line-height:18px}
.mcf-error{color:var(--mcf-danger);margin:0;font-size:12px;line-height:18px}
.mcf-groups{flex-direction:column;gap:12px;display:flex}
.mcf-group{box-sizing:border-box;position:relative;border:1px solid var(--mcf-border);border-radius:16px;background:var(--mcf-surface);flex-direction:column;display:flex;overflow:hidden;transition:background-color 180ms ease-out,border-color 180ms ease-out}
.mcf-group::before{content:"";position:absolute;top:0;bottom:0;left:0;width:3px;background:var(--mcf-accent);opacity:0;transition:opacity 180ms ease-out}
.mcf-group:hover:not([data-open=true]){background:var(--mcf-surface-hover);border-color:var(--mcf-border-hover)}
.mcf-group[data-open=true]{background:var(--mcf-surface-open);border-color:var(--mcf-accent-line)}
.mcf-group[data-open=true]::before{opacity:1}
.mcf-provider{box-sizing:border-box;border:0;background:0 0;color:inherit;font:inherit;cursor:pointer;text-align:left;align-items:center;gap:12px;width:100%;padding:12px 16px;display:flex}
.mcf-provider:focus-visible{outline:2px solid var(--mcf-ring);outline-offset:-3px;border-radius:16px}
.mcf-providerIcon{box-sizing:border-box;flex:none;justify-content:center;align-items:center;width:32px;height:32px;border-radius:9px;background:var(--mcf-accent-soft);color:var(--mcf-accent);font-size:12px;font-weight:600;line-height:1;letter-spacing:.02em;display:inline-flex;overflow:hidden}
.mcf-providerIcon img{width:100%;height:100%;object-fit:contain;display:block}
.mcf-providerIdentity{flex-direction:column;flex:1 1 auto;gap:1px;min-width:0;display:flex}
.mcf-providerName{color:var(--mcf-text);font-size:14px;font-weight:600;line-height:20px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mcf-providerId{color:var(--mcf-text-3);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;line-height:18px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mcf-providerMeta{margin-left:auto;flex:none;align-items:center;gap:10px;display:inline-flex}
.mcf-statusBadge{color:var(--mcf-text-2);white-space:nowrap;align-items:center;gap:6px;font-size:12px;line-height:18px;display:inline-flex}
.mcf-statusBadge[data-on=false]{color:var(--mcf-text-3)}
.mcf-dot{box-sizing:border-box;flex:none;width:7px;height:7px;border-radius:50%;background:var(--mcf-accent)}
.mcf-statusBadge[data-on=false] .mcf-dot{background:0 0;border:1.5px solid var(--mcf-text-3)}
.mcf-countBadge{box-sizing:border-box;height:22px;padding:0 8px;border-radius:6px;background:var(--mcf-neutral);color:var(--mcf-text-2);white-space:nowrap;font-variant-numeric:tabular-nums;font-size:11px;line-height:22px}
.mcf-chevron{flex:none;color:var(--mcf-text-3);justify-content:center;align-items:center;width:16px;height:16px;display:inline-flex}
.mcf-chevron svg{transition:transform 180ms ease-out}
.mcf-provider[aria-expanded=true] .mcf-chevron svg{transform:rotate(90deg)}
.mcf-panelWrap{display:grid;grid-template-rows:0fr;transition:grid-template-rows 180ms ease-out}
.mcf-panelWrap[data-open=true]{grid-template-rows:1fr}
.mcf-panelClip{min-height:0;overflow:hidden;visibility:hidden;transition:visibility 180ms}
.mcf-panelWrap[data-open=true] .mcf-panelClip{visibility:visible}
.mcf-panel{box-sizing:border-box;border-top:1px solid var(--mcf-border);flex-direction:column;gap:12px;padding:14px 16px 16px;display:flex}
.mcf-panelHead{justify-content:space-between;align-items:center;gap:12px;display:flex}
.mcf-panelActions{align-items:center;gap:8px;display:flex}
.mcf-panelTitle{color:var(--mcf-text-3);font-size:11px;font-weight:600;line-height:16px;letter-spacing:.08em;text-transform:uppercase}
.mcf-models{flex-direction:column;gap:8px;margin:0;padding:0;list-style:none;display:flex}
.mcf-model{box-sizing:border-box;border:1px solid var(--mcf-border);border-radius:12px;background:var(--mcf-surface);flex-direction:column;gap:8px;padding:12px 14px;display:flex;transition:border-color 180ms ease-out}
.mcf-model:hover{border-color:var(--mcf-border-hover)}
.mcf-modelMain{align-items:center;gap:12px;flex-wrap:wrap;display:flex}
.mcf-modelText{flex-direction:column;flex:1 1 auto;gap:1px;min-width:0;display:flex}
.mcf-modelId{color:var(--mcf-text);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:13px;font-weight:500;line-height:20px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mcf-modelName{color:var(--mcf-text-2);font-size:12px;line-height:18px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mcf-modelActions{margin-left:auto;flex:none;align-items:center;gap:10px;display:inline-flex}
.mcf-tag{box-sizing:border-box;height:22px;padding:0 8px;border-radius:6px;border:1px solid var(--mcf-tag-line);background:var(--mcf-tag-bg);color:var(--mcf-accent);white-space:nowrap;align-items:center;font-size:11px;font-weight:500;line-height:1;display:inline-flex}
.mcf-switchWrap{align-items:center;gap:8px;display:inline-flex}
.mcf-switchLabel{color:var(--mcf-text-2);font-size:12px;line-height:18px}
.mcf-switch{box-sizing:border-box;position:relative;flex:none;width:44px;height:24px;padding:0;border:0;border-radius:999px;corner-shape:round;background:var(--mcf-track-off);cursor:pointer;font:inherit;transition:background-color 180ms ease-out}
.mcf-switch[aria-checked=true]{background:var(--mcf-accent)}
.mcf-switch:disabled{cursor:default;opacity:.45}
.mcf-switch:focus-visible{outline:2px solid var(--mcf-ring);outline-offset:2px}
.mcf-switchThumb{position:absolute;top:2px;left:2px;width:20px;height:20px;border-radius:50%;corner-shape:round;background:#FFF;box-shadow:0 1px 2px #18181B2E;transition:transform 180ms ease-out}
.mcf-switch[aria-checked=true] .mcf-switchThumb{transform:translateX(20px)}
.mcf-testResult{margin:0;color:var(--mcf-text-3);font-size:12px;line-height:18px}
.mcf-testResultOk{color:var(--mcf-success)}
.mcf-testResultFail{color:var(--mcf-danger)}
.mcf-field{flex-direction:column;gap:6px;display:flex}
.mcf-field>span{color:var(--mcf-text-2);font-size:12px;font-weight:500;line-height:18px}
.mcf-input{box-sizing:border-box;width:100%;height:34px;padding:0 12px;border-radius:9px;border:1px solid var(--mcf-border);background:var(--mcf-surface);color:var(--mcf-text);font:inherit;font-size:13px;line-height:20px;transition:border-color 160ms ease-out,box-shadow 160ms ease-out}
.mcf-input::placeholder{color:var(--mcf-text-3)}
.mcf-input:focus{outline:none;border-color:var(--mcf-accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--mcf-accent) 22%,transparent)}
.mcf-btn{box-sizing:border-box;justify-content:center;align-items:center;gap:6px;height:34px;padding:0 14px;border-radius:9px;border:1px solid var(--mcf-ghost-border);background:0 0;color:var(--mcf-ghost-text);font:inherit;font-size:13px;font-weight:500;line-height:20px;white-space:nowrap;cursor:pointer;display:inline-flex;transition:background-color 160ms ease-out,border-color 160ms ease-out,color 160ms ease-out}
.mcf-btn:hover:not(:disabled){background:var(--mcf-surface-hover)}
.mcf-btn:disabled{cursor:default;opacity:.45}
.mcf-btn:focus-visible{outline:2px solid var(--mcf-ring);outline-offset:2px}
.mcf-btnPrimary{background:var(--mcf-accent);border-color:var(--mcf-accent);color:#FFF}
.mcf-btnPrimary:hover:not(:disabled){background:var(--mcf-accent-hover)}
.mcf-btnSm{height:32px;padding:0 12px;font-size:12px}
.mcf-iconBtn{width:34px;padding:0}
.mcf-btnSm.mcf-iconBtn{width:32px}
.mcf-btnDanger{background:var(--mcf-danger);border-color:var(--mcf-danger);color:#FFF}
.mcf-btnDanger:hover:not(:disabled){background:var(--mcf-danger-strong);border-color:var(--mcf-danger-strong)}
.mcf-iconDanger:hover:not(:disabled){background:var(--mcf-danger-soft);border-color:var(--mcf-danger-line);color:var(--mcf-danger)}
.mcf-page>.mcf-overlay{box-sizing:border-box;position:fixed;inset:0;z-index:60;width:auto;max-width:none;height:auto;background:var(--mcf-scrim);justify-content:center;align-items:center;padding:24px;display:flex;animation:mcf-fade 160ms ease-out}
@keyframes mcf-fade{from{opacity:0}to{opacity:1}}
@keyframes mcf-rise{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
.mcf-modal{box-sizing:border-box;width:100%;max-width:460px;background:var(--mcf-surface);border:1px solid var(--mcf-border);border-radius:16px;box-shadow:0 16px 40px #18181B26;flex-direction:column;display:flex;animation:mcf-rise 160ms ease-out}
.mcf-modalFixed{height:min(640px,calc(100vh - 96px))}
.mcf-modalFixed .mcf-modalBody{flex:1 1 auto;min-height:0;overflow:auto}
.mcf-modalHead{justify-content:space-between;align-items:flex-start;gap:12px;padding:18px 18px 0;display:flex}
.mcf-modalTitle{margin:0;color:var(--mcf-text);font-size:15px;font-weight:600;line-height:22px}
.mcf-modalSub{margin:2px 0 0;color:var(--mcf-text-3);font-size:12px;line-height:18px}
.mcf-modalBody{flex-direction:column;gap:14px;padding:16px 18px;display:flex}
.mcf-modalFoot{border-top:1px solid var(--mcf-border);justify-content:flex-end;gap:8px;padding:14px 18px;display:flex}
.mcf-confirmText{margin:0;color:var(--mcf-text-2);font-size:13px;line-height:20px}
.mcf-testRow{flex-wrap:wrap;align-items:center;gap:10px;min-height:24px;display:flex}
.mcf-modalHint{color:var(--mcf-text-3);font-size:12px;line-height:18px}
.mcf-formGrid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.mcf-span2{grid-column:1/-1}
.mcf-fieldHint{color:var(--mcf-text-3);font-size:11px;line-height:15px}
.mcf-modelRows{display:flex;flex-direction:column;gap:8px}
.mcf-modelRow{display:grid;grid-template-columns:1.2fr 1fr auto 32px;gap:8px;align-items:center}
.mcf-rowCheck{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--mcf-text-2);white-space:nowrap;cursor:pointer}
.mcf-check{width:14px;height:14px;margin:0;accent-color:var(--mcf-accent);cursor:pointer}
.mcf-addRowWrap{margin-top:10px}
select.mcf-input{appearance:auto;height:34px}
.mcf-modelsHead{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:16px}
.mcf-sectionLabel{margin:0;font-size:12px;font-weight:600;line-height:18px;color:var(--mcf-text-2);letter-spacing:.02em}
.mcf-fieldError{color:var(--mcf-danger);font-size:11px;line-height:15px}
.mcf-inputInvalid{border-color:var(--mcf-danger-line)!important}
.mcf-inputInvalid:focus{border-color:var(--mcf-danger)!important;box-shadow:0 0 0 3px var(--mcf-danger-soft)}
.mcf-skipRow{display:flex;align-items:center;gap:8px;margin-top:10px;font-size:12px;color:var(--mcf-text-2);cursor:pointer}
.mcf-pulse{animation:mcf-pulse 560ms ease-out}
@keyframes mcf-pulse{0%{box-shadow:0 0 0 0 var(--mcf-danger-soft)}100%{box-shadow:0 0 0 8px transparent}}
.mcf-candidates{margin-top:10px;border:1px solid var(--mcf-border);border-radius:10px;background:var(--mcf-surface);overflow:hidden}
.mcf-candHead{display:flex;gap:8px;align-items:center;padding:8px;border-bottom:1px solid var(--mcf-border);background:var(--mcf-surface-hover)}
.mcf-candSearch{flex:1;min-width:0}
.mcf-candActions{display:flex;gap:8px;flex-shrink:0}
.mcf-candList{max-height:200px;overflow:auto}
.mcf-candRow{display:flex;gap:8px;align-items:center;padding:6px 10px;cursor:pointer;font-size:12px}
.mcf-candRow:hover{background:var(--mcf-surface-hover)}
.mcf-candId{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;color:var(--mcf-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mcf-candName{color:var(--mcf-text-3);flex-shrink:0}
@media (prefers-reduced-motion:reduce){.mcf-spin,.mcf-overlay,.mcf-modal,.mcf-pulse{animation:none}.mcf-group,.mcf-group::before,.mcf-chevron svg,.mcf-panelWrap,.mcf-switch,.mcf-switchThumb,.mcf-model,.mcf-btn,.mcf-input{transition:none}}
`;

		/** Render a translate result with `{name}` placeholders filled in. */
		function fill(text: string, params: Record<string, string>): string {
			return text.replace(/\{(\w+)\}/g, (whole: string, name: string) => params[name] ?? whole);
		}

		/** Read a thrown value as displayable copy. */
		function messageOf(error: unknown): string {
			if (error instanceof Error) return error.message;
			return String(error);
		}

		/** Whether an unknown value is a plain JSON object. */
		function isRecord(value: unknown): value is Record<string, unknown> {
			return typeof value === "object" && value !== null && !Array.isArray(value);
		}

		/** Whether a JSON value is a non-null, non-array object. */
		function isJsonObject(value: JsonValue | undefined): value is JsonObject {
			return typeof value === "object" && value !== null && !Array.isArray(value);
		}

		/** Whether a JSON value is one of the two input modality literals. */
		function isInputModality(value: JsonValue | undefined): value is InputModality {
			return value === "text" || value === "image";
		}

		/** Walk a plain JSON path; anything off the path is simply absent. */
		function getPath(source: JsonValue | undefined, path: readonly string[]): JsonValue | undefined {
			let node: JsonValue | undefined = source;
			for (const key of path) {
				if (!isJsonObject(node)) return undefined;
				node = node[key];
			}
			return node;
		}

		/**
		 * Read a settings subtree as model rows. Entries that are not JSON objects
		 * cannot be rendered or edited, so they are dropped instead of asserted.
		 */
		function asModelRows(value: JsonValue | undefined): ModelRow[] | undefined {
			if (!Array.isArray(value)) return undefined;
			const rows: ModelRow[] = [];
			for (const entry of value) {
				if (isJsonObject(entry)) rows.push(entry as ModelRow);
			}
			return rows;
		}

		/** The model rows a namespace serves, effective value first. */
		function modelsOf(
			namespace: SettingsNamespaceView | undefined,
			settingsPath: readonly string[],
		): ModelRow[] {
			if (namespace === undefined) return [];
			const effective = asModelRows(getPath(namespace.value, [...settingsPath, "models"]));
			if (effective !== undefined) return effective;
			return asModelRows(getPath(namespace.base, [...settingsPath, "models"])) ?? [];
		}

		/** Wire protocols a hand-declared route may speak, as the official page names them. */
		const KNOWN_PROTOCOLS: readonly string[] = ["openai-completions", "openai-responses", "anthropic-messages"];

		/** A route id the pi-ai adapter accepts, same rule the Models page enforces. */
		const ROUTE_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

		/**
		 * The credential reference a new route will use, derived exactly the way the
		 * Models settings page derives it (`ZAI-CODING-CN` → `ZAI_CODING_CN_API_KEY`).
		 * @param route - the provider route id.
		 * @returns the reference name to store the key under.
		 */
		function deriveKeyRef(route: string): string {
			return `${route.toUpperCase().replace(/[^A-Z0-9]+/g, "_")}_API_KEY`;
		}

		/**
		 * Whether the value points at an http(s) endpoint.
		 * @param value - the candidate Base URL.
		 * @returns true when URL-parsable with an http(s) protocol.
		 */
		function isHttpUrl(value: string): boolean {
			try {
				const protocol = new URL(value).protocol;
				return protocol === "http:" || protocol === "https:";
			} catch {
				return false;
			}
		}

		/**
		 * The route ids already declared under a namespace's `providers` map.
		 * @param namespace - the namespace view to inspect.
		 * @returns the existing route keys, effective values first.
		 */
		function providerRoutesOf(namespace: SettingsNamespaceView | undefined): string[] {
			if (namespace === undefined) return [];
			for (const source of [namespace.value, namespace.base]) {
				const providers = getPath(source, ["providers"]);
				if (isRecord(providers)) return Object.keys(providers);
			}
			return [];
		}

		/**
		 * Protocol choices for a hand-declared route: what sibling providers already
		 * speak first, then the protocols the official page knows, deduplicated.
		 * @param namespace - the namespace view to inspect.
		 * @returns the identifiers a select should offer.
		 */
		function protocolChoicesOf(namespace: SettingsNamespaceView | undefined): string[] {
			const choices: string[] = [];
			for (const source of [namespace?.value, namespace?.base]) {
				const providers = getPath(source, ["providers"]);
				if (!isRecord(providers)) continue;
				for (const profile of Object.values(providers)) {
					if (!isRecord(profile)) continue;
					const api = profile.api;
					if (typeof api === "string" && api.length > 0 && !choices.includes(api)) choices.push(api);
				}
			}
			for (const known of KNOWN_PROTOCOLS) {
				if (!choices.includes(known)) choices.push(known);
			}
			return choices;
		}

		/** One model row inside the new-provider draft. */
		interface NewModelDraft {
			id: string;
			name: string;
			vision: boolean;
		}

		/** Everything the new-provider dialog collects before the first write. */
		interface NewProviderDraft {
			ns: string;
			route: string;
			displayName: string;
			protocol: string;
			baseURL: string;
			apiKey: string;
			models: NewModelDraft[];
		}

		/**
		 * Join the declared configurable directory with the live routes, the same
		 * order the Models settings page uses: account first, official second.
		 * @param registered - live provider routes in registration order.
		 * @param declared - declared configurable providers in declaration order.
		 * @param nameOf - locale-aware display-name resolver, supplied by the page.
		 * @returns one row per provider, deduplicated by route id.
		 */		function joinDirectory(
			registered: readonly LlmProviderInfo[],
			declared: readonly LlmConfigurableProvider[],
			nameOf: (provider: string, fallback: string) => string
		): DirectoryEntry[] {
			const directory: DirectoryEntry[] = declared.map((entry) => ({
				provider: entry.provider,
				displayName: nameOf(entry.provider, entry.displayName),
				settingsNs: entry.settingsNs,
				settingsPath: [...entry.settingsPath],
				directoryError: typeof entry.error === "string" ? entry.error : undefined
			}));
			const known = new Set(directory.map((row) => row.provider));
			for (const provider of registered) {
				if (known.has(provider.id)) continue;
				directory.push({
					provider: provider.id,
					displayName: nameOf(provider.id, provider.name),
					settingsNs: "",
					settingsPath: [],
					directoryError: undefined
				});
			}
			const rank = (provider: string): number =>
				provider === "deepseek-account" ? 0 : provider === "deepseek-official" ? 1 : 2;
			return directory.sort((left, right) => rank(left.provider) - rank(right.provider));
		}

		/**
		 * One rendered provider row: directory entry joined with its settings.
		 * @param registered - live provider routes.
		 * @param declared - declared configurable providers.
		 * @param view - the settings document answer.
		 * @returns only rows that are live routes or actually configured.
		 */
		function buildRows(
			registered: readonly LlmProviderInfo[],
			declared: readonly LlmConfigurableProvider[],
			view: SettingsDescribeValue,
			nameOf: (provider: string, fallback: string) => string
		): ProviderRow[] {
			const active = new Set(registered.map((provider) => provider.id));
			const namespaces = new Map(view.namespaces.map((namespace) => [namespace.ns, namespace]));
			const rows = joinDirectory(registered, declared, nameOf).map((entry): ProviderRow => {
				const namespace = entry.settingsNs === "" ? undefined : namespaces.get(entry.settingsNs);
				const profile = namespace === undefined ? undefined : getPath(namespace.value, entry.settingsPath);
				return {
					provider: entry.provider,
					displayName: entry.displayName,
					settingsNs: entry.settingsNs,
					settingsPath: entry.settingsPath,
					directoryError: entry.directoryError,
					active: active.has(entry.provider),
					editable: namespace !== undefined,
					configured: namespace !== undefined && (entry.settingsPath.length === 0 || profile !== undefined),
					profile,
					models: modelsOf(namespace, entry.settingsPath)
				};
			});
			/*
			* The directory also carries every dormant route an adapter merely COULD
			* serve, so an unconfigured deployment would otherwise list dozens of
			* unusable rows. A provider is worth showing only when it is a live route
			* or when the user actually configured it.
			*/
			return rows.filter((row) => row.active || row.configured);
		}

		/**
		 * Which model field this family stores input types under. DeepSeek writes
		 * `inputModalities`, pi-ai writes `input`; an unknown namespace is read by
		 * whichever field its own rows already carry, else the pi-ai spelling.
		 * @param row - the provider row being rendered.
		 * @returns the field name to read and write.
		 */
		function inputFieldOf(row: ProviderRow): InputField {
			const ns = row.settingsNs;
			if (ns.startsWith("llm-deepseek")) return "inputModalities";
			if (ns === "llm-pi-ai") return "input";
			return row.models.some((model) => Array.isArray(model.inputModalities)) ? "inputModalities" : "input";
		}

		/**
		 * Effective input types for one row: explicit, else provider default, else text.
		 * @param row - the provider row.
		 * @param index - the model's position.
		 * @param field - the family's input field.
		 * @returns the modalities the model accepts right now.
		 */
		function effectiveInputTypes(row: ProviderRow, index: number, field: InputField): InputModality[] {
			const model = row.models[index];
			if (model === undefined) return ["text"];
			const explicit = model[field];
			if (Array.isArray(explicit) && explicit.length > 0) return [...explicit];
			const fallback = getPath(row.profile, ["defaultInput"]);
			if (Array.isArray(fallback) && fallback.every(isInputModality)) return [...fallback];
			return ["text"];
		}

		/** The error message a probe body carries, when it carries a readable one. */
		function readProbeMessage(body: Record<string, unknown> | undefined): string | undefined {
			const value = body === undefined ? undefined : body.message;
			return typeof value === "string" && value.length > 0 ? value : undefined;
		}

		/** Whether a probe body reports success. */
		function probeSucceeded(body: Record<string, unknown> | undefined): boolean {
			const flag = body === undefined ? undefined : body.ok;
			return typeof flag === "boolean" && flag;
		}

		/** Chevron for the accordion header; CSS rotates it 90° while expanded. */
		function Chevron() {
			return h("svg", {
				viewBox: "0 0 16 16", width: 16, height: 16, fill: "none", stroke: "currentColor",
				strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true"
			}, h("path", { d: "M6.5 4l4 4-4 4" }));
		}

		/**
		 * Two-letter monogram standing in for a provider logo: the brand mark is
		 * not bundled, so the icon container falls back to initials taken from the
		 * route id (or, failing that, the first display-name character).
		 * @param row - the provider row being rendered.
		 * @returns 1-2 characters for the 32px icon container.
		 */
		function monogramOf(row: ProviderRow): string {
			const source = row.provider.length > 0 ? row.provider : row.displayName;
			const parts = source.split(/[^A-Za-z0-9]+/).filter((part) => part.length > 0);
			const first = parts[0];
			if (first === undefined) {
				const chars = Array.from(row.displayName);
				return chars.length > 0 ? chars[0] ?? "?" : "?";
			}
			const second = parts[1];
			if (second === undefined) return first.slice(0, 2).toUpperCase();
			return (first.slice(0, 1) + second.slice(0, 1)).toUpperCase();
		}

		/** Trash glyph for the destructive model / provider actions. */
		function TrashIcon() {
			return h("svg", {
				viewBox: "0 0 16 16", width: 14, height: 14, fill: "none", stroke: "currentColor",
				strokeWidth: 1.4, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true"
			},
				h("path", { d: "M2.7 4.4h10.6" }),
				h("path", { d: "M6.2 4.4V3.2a.7.7 0 0 1 .7-.7h2.2a.7.7 0 0 1 .7.7v1.2" }),
				h("path", { d: "M12.1 4.4l-.6 8.2a.8.8 0 0 1-.8.8H5.3a.8.8 0 0 1-.8-.8L3.9 4.4" }),
				h("path", { d: "M6.7 7v3.9" }),
				h("path", { d: "M9.3 7v3.9" })
			);
		}

		/** Close glyph for the dialog header. */
		function CloseIcon() {
			return h("svg", {
				viewBox: "0 0 16 16", width: 14, height: 14, fill: "none", stroke: "currentColor",
				strokeWidth: 1.5, strokeLinecap: "round", "aria-hidden": "true"
			},
				h("path", { d: "M4.5 4.5l7 7" }),
				h("path", { d: "M11.5 4.5l-7 7" })
			);
		}

		/** Refresh glyph for the page toolbar; spins while a load is in flight. */
		function RefreshIcon(props: SlotProps) {
			return h("svg", {
				viewBox: "0 0 16 16", width: 15, height: 15, fill: "none", stroke: "currentColor",
				strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true",
				className: props.spin === true ? "mcf-spin" : undefined
			}, h("path", { d: "M13.5 8a5.5 5.5 0 1 1-1.7-3.9" }), h("path", { d: "M13.5 2.6v3.2h-3.2" }));
		}

		/** The sidebar glyph for this panel. */
		function PanelIcon(props: SlotProps) {
			const size = typeof props.size === "number" ? props.size : 18;
			return h("svg", {
				viewBox: "0 0 24 24", width: size, height: size, fill: "none", stroke: "currentColor",
				strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true",
				style: { display: "block" }
			},
				h("path", { d: "M3 7h6" }), h("path", { d: "M15 7h6" }), h("circle", { cx: 12, cy: 7, r: 2.4 }),
				h("path", { d: "M3 17h9" }), h("path", { d: "M18 17h3" }), h("circle", { cx: 15.6, cy: 17, r: 2.4 }));
		}

		/** Ask the Host half to run one minimal completion. */
		async function testConnection(provider: string, model: string): Promise<ProbeResult> {
			try {
				const response = await fetch(location.origin + TEST_PATH, {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({ provider, model })
				});
				let payload: unknown = null;
				try {
					payload = await response.json();
				} catch {
					payload = null;
				}
				const body = isRecord(payload) ? payload : undefined;
				if (!response.ok) return { ok: false, message: readProbeMessage(body) ?? `HTTP ${response.status}` };
				if (probeSucceeded(body)) return { ok: true, message: "" };
				return { ok: false, message: readProbeMessage(body) ?? "connection failed" };
			} catch (error) {
				return { ok: false, message: messageOf(error) };
			}
		}

		return {
			inject: ["slots", "locale", "remote", "remote.llm", "remote.settings", "remote.credentials"],
			apply(ctx: ClientContext): void {
				ctx.effect(() => ctx.locale.register(NS, { zh, en }), "model-config: dictionaries");
				const t: Translate = ctx.locale.bind(NS);

				/**
				 * Display name for one provider: the two built-in DeepSeek routes get
				 * locale-aware names that say which channel they are, everything else
				 * keeps the name the adapter itself reports.
				 * @param provider - the route id.
				 * @param fallback - the name reported by the directory or adapter.
				 * @returns the name to render.
				 */
				function displayNameOf(provider: string, fallback: string): string {
					if (provider === "deepseek-account") return t("nameDeepseekAccount");
					if (provider === "deepseek-official") return t("nameDeepseekOfficial");
					return fallback;
				}

				/** The page: provider accordion, model rows, add form, probe results. */
				function ModelConfigPage(props: SlotProps) {
					const [state, setState] = React.useState<PageState>({
						status: "loading",
						error: null,
						refreshing: true,
						updatedAt: null,
						writable: false,
						rows: [],
						namespaces: new Map()
					});
					const [openId, setOpenId] = React.useState<string | null>(null);
					const [busy, setBusy] = React.useState<Record<string, boolean>>({});
					const [tests, setTests] = React.useState<Record<string, TestState>>({});
					const [adding, setAdding] = React.useState<string | null>(null);
					const [draft, setDraft] = React.useState({ id: "", name: "" });
					const [addError, setAddError] = React.useState<string | null>(null);
					const [rowError, setRowError] = React.useState<Record<string, string | undefined>>({});
					const [modalTest, setModalTest] = React.useState<TestState | null>(null);
					const [confirming, setConfirming] = React.useState<ConfirmTarget | null>(null);
					const [creating, setCreating] = React.useState<NewProviderDraft | null>(null);
					const [createError, setCreateError] = React.useState<string | null>(null);
					const [createBusy, setCreateBusy] = React.useState(false);
					const [createAttempted, setCreateAttempted] = React.useState(false);
					const [probePassed, setProbePassed] = React.useState(false);
					const [skipProbe, setSkipProbe] = React.useState(false);
					const [probeBusy, setProbeBusy] = React.useState(false);
					const [probeError, setProbeError] = React.useState<string | null>(null);
					const [flash, setFlash] = React.useState<string | null>(null);
					const [pulseTick, setPulseTick] = React.useState(0);
					const [pulse, setPulse] = React.useState(false);

					/* The creation-success note clears itself; no timer to manage by hand. */
					React.useEffect(() => {
						if (flash === null) return;
						const timer = window.setTimeout(() => setFlash(null), 5000);
						return () => window.clearTimeout(timer);
					}, [flash]);

					/* A failed submit briefly pulses the offending fields. */
					React.useEffect(() => {
						if (pulseTick === 0) return;
						setPulse(true);
						const timer = window.setTimeout(() => setPulse(false), 600);
						return () => window.clearTimeout(timer);
					}, [pulseTick]);
					const [fetching, setFetching] = React.useState(false);
					const [fetchError, setFetchError] = React.useState<string | null>(null);
					const [candidates, setCandidates] = React.useState<LlmDiscoveredModel[] | null>(null);
					const [picked, setPicked] = React.useState<ReadonlySet<string>>(new Set<string>());
					const [candidateQuery, setCandidateQuery] = React.useState("");
					const [, setLocaleTick] = React.useState(0);
					const generation = React.useRef(0);

					const load = React.useCallback(async (): Promise<void> => {
						const mine = ++generation.current;
						setState((previous) => ({
							...previous,
							refreshing: true,
							status: previous.rows.length > 0 ? previous.status : "loading"
						}));
						try {
							const [registered, declared, described] = await Promise.all([
								ctx.remote.llm.listProviders(),
								ctx.remote.llm.listConfigurableProviders(),
								ctx.remote.settings.describe()
							]);
							if (!registered.ok) throw new Error(registered.error.message);
							if (!declared.ok) throw new Error(declared.error.message);
							if (!described.ok) throw new Error(described.error.message);
							const view = described.value;
							if (mine !== generation.current) return;
							setState({
								status: "ready",
								error: null,
								refreshing: false,
								updatedAt: new Date().toLocaleTimeString(),
								writable: view.writable === true,
								rows: buildRows(registered.value, declared.value, view, displayNameOf),
								namespaces: new Map(view.namespaces.map((namespace) => [namespace.ns, namespace]))
							});
						} catch (error) {
							if (mine !== generation.current) return;
							setState((previous) => ({ ...previous, status: "error", refreshing: false, error: messageOf(error) }));
						}
					}, []);

					React.useEffect(() => {
						void load();
						const disposers: Array<() => void> = [];
						const remote = ctx.remote;
						if (typeof remote.$on === "function") {
							disposers.push(remote.$on("settings/document-updated", load));
							disposers.push(remote.$on("llm/adapters-updated", load));
						}
						disposers.push(ctx.locale.subscribe(() => setLocaleTick((value) => value + 1)));
						return () => {
							for (const dispose of disposers) dispose();
						};
					}, [load]);

					/** Replace one provider's model catalog through the settings wire. */
					const commit = async (row: ProviderRow, nextModels: ModelRow[]): Promise<boolean> => {
						const namespace = state.namespaces.get(row.settingsNs);
						if (namespace === undefined) {
							setRowError((current) => ({ ...current, [row.provider]: t("noNamespace") }));
							return false;
						}
						setBusy((current) => ({ ...current, [row.provider]: true }));
						try {
							const ops: SettingsPathOp[] = [{
								op: "set",
								path: [...row.settingsPath, "models"],
								value: nextModels
							}];
							const response = await ctx.remote.settings.mutate(row.settingsNs, ops, namespace.revision);
							if (!response.ok) {
								const conflict = response.error.code === "settings/conflict";
								const message = conflict ? t("conflict") : response.error.message;
								setRowError((current) => ({ ...current, [row.provider]: message }));
								if (conflict) await load();
								return false;
							}
							setRowError((current) => ({ ...current, [row.provider]: undefined }));
							await load();
							return true;
						} finally {
							setBusy((current) => ({ ...current, [row.provider]: false }));
						}
					};

					/** Turn the image input type on or off for exactly one model row. */
					const toggleVision = async (row: ProviderRow, index: number): Promise<void> => {
						const field = inputFieldOf(row);
						const current = effectiveInputTypes(row, index, field);
						const hasImage = current.includes("image");
						const next = hasImage
							? current.filter((type) => type !== "image")
							: [...new Set<InputModality>([...current, "image"])];
						const chosen: InputModality[] = next.length > 0 ? next : ["text"];
						const source = row.models[index];
						if (source === undefined) return;
						const nextModel: ModelRow = { ...source };
						if (field === "inputModalities") nextModel.inputModalities = chosen;
						else nextModel.input = chosen;
						if (field === "inputModalities" && !chosen.includes("image")) {
							delete nextModel.imagePixelBudget;
							delete nextModel.imageMaxBytes;
						}
						await commit(row, row.models.map((model, at) => at === index ? nextModel : model));
					};

					/** Append a hand-written model id to one provider's catalog. */
					const submitAdd = async (row: ProviderRow): Promise<void> => {
						const id = draft.id.trim();
						if (id.length === 0) {
							setAddError(t("idRequired"));
							return;
						}
						if (row.models.some((model) => model.id === id)) {
							setAddError(t("idDuplicate"));
							return;
						}
						const name = draft.name.trim();
						const next: ModelRow[] = [...row.models, name.length === 0 ? { id } : { id, name }];
						const saved = await commit(row, next);
						if (saved) {
							setDraft({ id: "", name: "" });
							setAddError(null);
							setModalTest(null);
							setAdding(null);
						}
					};

					/** Probe one exact model through the Host route. */
					const runTest = async (row: ProviderRow, id: string, key: string): Promise<void> => {
						setTests((current) => ({ ...current, [key]: { status: "testing", message: "" } }));
						const result = await testConnection(row.provider, id);
						setTests((current) => ({
							...current,
							[key]: result.ok
								? { status: "ok", message: t("testOk") }
								: { status: "fail", message: result.message }
						}));
					};

					const startAdd = (row: ProviderRow): void => {
						setAdding(row.provider);
						setDraft({ id: "", name: "" });
						setAddError(null);
						setModalTest(null);
					};

					/** Close the add-model dialog and drop its transient probe state. */
					const closeAdd = (): void => {
						setAdding(null);
						setAddError(null);
						setModalTest(null);
					};

					/**
					 * Open the new-provider dialog over the first namespace whose schema
					 * hosts a `providers` map — in practice the pi-ai namespace.
					 */
					const startCreate = (): void => {
						const eligible = [...state.namespaces.values()].filter((namespace) =>
							isRecord(getPath(namespace.value, ["providers"])) || isRecord(getPath(namespace.base, ["providers"]))
						);
						const target = eligible[0];
						if (target === undefined) return;
						setCreateError(null);
						setCreateAttempted(false);
						setProbePassed(false);
						setSkipProbe(false);
						setProbeError(null);
						setCreating({
							ns: target.ns,
							route: "",
							displayName: "",
							protocol: protocolChoicesOf(target)[0] ?? "",
							baseURL: "",
							apiKey: "",
							models: [{ id: "", name: "", vision: true }]
						});
					};

					/** Close the new-provider dialog. */
					const closeCreate = (): void => {
						setCreating(null);
						setCreateError(null);
						setCreateAttempted(false);
						setProbePassed(false);
						setSkipProbe(false);
						setProbeError(null);
						setFetchError(null);
						setCandidates(null);
						setPicked(new Set<string>());
						setCandidateQuery("");
					};

					/**
					 * Translate the llm runtime's English discovery failures into the
					 * page's language; unknown shapes pass through untouched.
					 */
					const describeFetchFailure = (message: string): string => {
						const unreachable = /^could not reach (\S+)/.exec(message);
						if (unreachable !== null && unreachable[1] !== undefined) {
							return fill(t("fetchUnreachable"), { url: unreachable[1] });
						}
						const status = /answered (\d+)/.exec(message);
						if (status !== null && status[1] !== undefined) {
							const code = status[1];
							return code === "401" || code === "403"
								? t("fetchUnauthorized")
								: fill(t("fetchStatus"), { code });
						}
						return message;
					};

					/** The picker label for a protocol identifier; unknown ids stay raw. */
					const protocolLabel = (identifier: string): string => {
						if (identifier === "openai-completions") return t("protocolOpenAiCompletions");
						if (identifier === "openai-responses") return t("protocolOpenAiResponses");
						if (identifier === "anthropic-messages") return t("protocolAnthropicMessages");
						return identifier;
					};

					/** Patch one field of the new-provider draft; endpoint edits un-pass the probe. */
					const patchCreate = (patch: Partial<NewProviderDraft>): void => {
						if (patch.baseURL !== undefined || patch.apiKey !== undefined || patch.protocol !== undefined) {
							setProbePassed(false);
							setSkipProbe(false);
							setProbeError(null);
						}
						setCreating((current) => (current === null ? current : { ...current, ...patch }));
					};

					/** Patch one model row of the new-provider draft. */
					const patchCreateModel = (index: number, patch: Partial<NewModelDraft>): void => {
						setCreating((current) => {
							if (current === null) return current;
							return {
								...current,
								models: current.models.map((model, at) => (at === index ? { ...model, ...patch } : model))
							};
						});
					};

					/**
					 * Ask the endpoint what models it serves, via the llm runtime's
					 * discover remote — the same channel the Models settings page uses.
					 * The candidates land in a picker; adopting appends only the ids the
					 * draft does not list yet, so refetching never duplicates rows.
					 */
					const runFetchModels = async (): Promise<void> => {
						const current = creating;
						if (current === null) return;
						const baseURL = current.baseURL.trim();
						if (baseURL.length === 0) {
							setFetchError(t("fetchNeedsBaseURL"));
							return;
						}
						setFetching(true);
						setFetchError(null);
						try {
							const apiKey = current.apiKey.trim();
							const response = await ctx.remote.llm.discoverModels(current.ns, {
								baseURL,
								api: current.protocol,
								...(apiKey.length === 0 ? {} : { apiKey })
							});
							if (!response.ok) {
								setFetchError(describeFetchFailure(response.error.message));
								return;
							}
							const found = response.value;
							if (found.length === 0) {
								setFetchError(t("fetchEmpty"));
								return;
							}
							const known = new Set(current.models.map((model) => model.id.trim()));
							setCandidates(found);
							setPicked(new Set(found.filter((model) => !known.has(model.id)).map((model) => model.id)));
							setCandidateQuery("");
						} finally {
							setFetching(false);
						}
					};

					/** Append every picked candidate the draft does not already list. */
					const adoptPickedModels = (): void => {
						const current = creating;
						const found = candidates;
						if (current === null || found === null) return;
						const known = new Set(current.models.map((model) => model.id.trim()));
						const additions = found
							.filter((model) => picked.has(model.id) && !known.has(model.id))
							.map((model) => ({
								id: model.id,
								name: typeof model.name === "string" ? model.name : "",
								vision: Array.isArray(model.inputModalities) && model.inputModalities.includes("image")
							}));
						patchCreate({ models: [...current.models, ...additions] });
						setCandidates(null);
						setPicked(new Set<string>());
						setCandidateQuery("");
					};

					/**
					 * Write the new provider's profile at ["providers", route] in one set
					 * op — the same shape and location the shipped Models page writes —
					 * then store the typed key under the derived reference when given.
					 */
					const submitCreate = async (): Promise<void> => {
						const current = creating;
						if (current === null) return;
						/*
						 * Field problems never go to the bottom line — they mark the
						 * offending inputs inline (the render computes the same checks),
						 * so the user can see exactly which box to fix.
						 */
						setCreateAttempted(true);
						setCreateError(null);
						const namespace = state.namespaces.get(current.ns);
						const route = current.route.trim();
						const baseURL = current.baseURL.trim();
						const models = current.models
							.map((model) => ({ ...model, id: model.id.trim(), name: model.name.trim() }))
							.filter((model) => model.id.length > 0);
						if (!ROUTE_PATTERN.test(route) || providerRoutesOf(namespace).includes(route)) {
							setPulseTick((tick) => tick + 1);
							return;
						}
						if (baseURL.length === 0 || !isHttpUrl(baseURL)) {
							setPulseTick((tick) => tick + 1);
							return;
						}
						if (current.apiKey.trim().length === 0) {
							setPulseTick((tick) => tick + 1);
							return;
						}
						if (models.length === 0) {
							setPulseTick((tick) => tick + 1);
							return;
						}
						const seen = new Set<string>();
						for (const model of models) {
							if (seen.has(model.id)) {
								setPulseTick((tick) => tick + 1);
								return;
							}
							seen.add(model.id);
						}
						if (namespace === undefined) {
							setCreateError(t("noNamespace"));
							return;
						}
						/*
						 * Reachability gate: an unreachable endpoint never silently becomes
						 * a provider. The probe asks the endpoint the same question the
						 * fetch-models helper does; once it passes (or the user chooses to
						 * skip after a failure) the write proceeds.
						 */
						if (!probePassed && !skipProbe) {
							setProbeBusy(true);
							setProbeError(null);
							try {
								const answer = await ctx.remote.llm.discoverModels(current.ns, {
									baseURL,
									api: current.protocol,
									apiKey: current.apiKey.trim()
								});
								if (answer.ok) {
									setProbePassed(true);
								} else {
									setProbeError(describeFetchFailure(answer.error.message));
									return;
								}
							} finally {
								setProbeBusy(false);
							}
						}
						setCreateBusy(true);
						try {
							const profile: Record<string, JsonValue> = {
								api: current.protocol,
								baseURL,
								models: models.map((model) => ({
									id: model.id,
									...(model.name.length > 0 ? { name: model.name } : {}),
									input: model.vision ? ["text", "image"] : ["text"]
								}))
							};
							if (current.displayName.trim().length > 0) profile.displayName = current.displayName.trim();
							profile.apiKeyEnv = deriveKeyRef(route);
							const response = await ctx.remote.settings.mutate(
								current.ns,
								[{ op: "set", path: ["providers", route], value: profile }],
								namespace.revision
							);
							if (!response.ok) {
								setCreateError(response.error.code === "settings/conflict" ? t("conflict") : response.error.message);
								if (response.error.code === "settings/conflict") await load();
								return;
							}
							/*
							 * The profile landed — close the dialog FIRST. The key write is
							 * best-effort from here: whether it answers an error shape or
							 * throws outright, it must never trap the dialog open again.
							 */
							setCreating(null);
							setCreateError(null);
							setCreateAttempted(false);
							setFlash(fill(t("createdFlash"), { provider: route }));
							const key = current.apiKey.trim();
							if (key.length > 0 && ctx.remote.credentials !== undefined) {
								try {
									const stored = await ctx.remote.credentials.set(deriveKeyRef(route), key);
									if (!stored.ok) {
										setRowError((previous) => ({
											...previous,
											[route]: fill(t("keyStoreFailed"), { message: stored.error.message })
										}));
									}
								} catch (error) {
									const message = error instanceof Error ? error.message : String(error);
									setRowError((previous) => ({
										...previous,
										[route]: fill(t("keyStoreFailed"), { message })
									}));
								}
							}
							await load();
						} finally {
							setCreateBusy(false);
						}
					};

					/** Probe the id currently typed in the dialog, before it is saved. */
					const runModalTest = async (row: ProviderRow): Promise<void> => {
						const id = draft.id.trim();
						if (id.length === 0) return;
						setModalTest({ status: "testing", message: "" });
						const result = await testConnection(row.provider, id);
						setModalTest(result.ok
							? { status: "ok", message: t("testOk") }
							: { status: "fail", message: result.message });
					};

					/**
					 * Remove one provider's whole profile from the settings document.
					 * The `unset` op names the profile path rather than rebuilding the
					 * namespace from a partial view — the same shape the shipped Models
					 * settings page writes, so the profile patch stays the source of truth.
					 */
					const removeProvider = async (row: ProviderRow): Promise<void> => {
						const namespace = state.namespaces.get(row.settingsNs);
						if (namespace === undefined) {
							setRowError((current) => ({ ...current, [row.provider]: t("noNamespace") }));
							return;
						}
						setBusy((current) => ({ ...current, [row.provider]: true }));
						try {
							const response = await ctx.remote.settings.mutate(
								row.settingsNs,
								[{ op: "unset", path: [...row.settingsPath] }],
								namespace.revision
							);
							if (!response.ok) {
								const conflict = response.error.code === "settings/conflict";
								const message = conflict ? t("conflict") : response.error.message;
								setRowError((current) => ({ ...current, [row.provider]: message }));
								if (conflict) await load();
								return;
							}
							setRowError((current) => ({ ...current, [row.provider]: undefined }));
							setConfirming(null);
							setOpenId(null);
							await load();
						} finally {
							setBusy((current) => ({ ...current, [row.provider]: false }));
						}
					};

					/** Dispatch the confirmed destructive action. */
					const runConfirm = async (target: ConfirmTarget): Promise<void> => {
						const row = state.rows.find((candidate) => candidate.provider === target.provider);
						if (row === undefined) {
							setConfirming(null);
							return;
						}
						if (target.kind === "model") {
							const index = target.index;
							if (index === undefined || row.models[index] === undefined) {
								setConfirming(null);
								return;
							}
							const saved = await commit(row, row.models.filter((_, at) => at !== index));
							if (saved) setConfirming(null);
							return;
						}
						await removeProvider(row);
					};

					/** Whether a whole provider may be removed from this page at all. */
					const canRemoveProvider = (row: ProviderRow): boolean =>
						row.editable && state.writable && row.settingsPath.length > 0;

					const renderModel = (row: ProviderRow, model: ModelRow, index: number) => {
						const field = inputFieldOf(row);
						const vision = effectiveInputTypes(row, index, field).includes("image");
						const id = model.id;
						const key = `${row.provider}::${id}::${String(index)}`;
						const result = tests[key];
						const testing = result !== undefined && result.status === "testing";
						const editable = row.editable && state.writable;
						const name = typeof model.name === "string" && model.name.length > 0 ? model.name : undefined;
						const providerName = row.displayName.length === 0 ? row.provider : row.displayName;
						return h("li", { className: "mcf-model", key },
							h("div", { className: "mcf-modelMain" },
								h("div", { className: "mcf-modelText" },
									h("code", { className: "mcf-modelId", title: id }, id),
									name === undefined ? null : h("span", { className: "mcf-modelName", title: name }, name)
								),
								h("div", { className: "mcf-modelActions" },
									vision ? h("span", { className: "mcf-tag" }, t("visionOn")) : null,
									h("span", { className: "mcf-switchWrap" },
										h("span", { className: "mcf-switchLabel" }, t("vision")),
										h("button", {
											type: "button",
											role: "switch",
											"aria-checked": vision,
											className: "mcf-switch",
											disabled: !editable || busy[row.provider] === true,
											"aria-label": fill(t("visionLabel"), { model: id }),
											onClick: () => void toggleVision(row, index)
										}, h("span", { className: "mcf-switchThumb" }))
									),
									h("button", {
										type: "button",
										className: "mcf-btn mcf-btnSm",
										disabled: testing || !row.active,
										title: row.active ? undefined : t("inactiveHint"),
										onClick: () => void runTest(row, id, key)
									}, testing ? t("testing") : t("test")),
									editable ? h("button", {
										type: "button",
										className: "mcf-btn mcf-btnSm mcf-iconBtn mcf-iconDanger",
										disabled: busy[row.provider] === true,
										title: t("deleteModel"),
										"aria-label": `${t("deleteModel")} ${id}`,
										onClick: () => setConfirming({
											kind: "model",
											provider: row.provider,
											index,
											title: t("deleteModelTitle"),
											detail: fill(t("deleteModelBody"), { model: id, provider: providerName })
										})
									}, h(TrashIcon, {})) : null
								)
							),
							result === undefined || result.status === "testing" ? null : h("p", {
								className: "mcf-testResult " + (result.status === "ok" ? "mcf-testResultOk" : "mcf-testResultFail")
							}, result.message)
						);
					};

					const renderPanel = (row: ProviderRow, panelId: string) => {
						const editable = row.editable && state.writable;
						const providerName = row.displayName.length === 0 ? row.provider : row.displayName;
						return h("div", { className: "mcf-panel", id: panelId },
							h("div", { className: "mcf-panelHead" },
								h("span", { className: "mcf-panelTitle" }, t("models")),
								h("div", { className: "mcf-panelActions" },
									editable && canRemoveProvider(row) ? h("button", {
										type: "button",
										className: "mcf-btn mcf-btnSm mcf-iconBtn mcf-iconDanger",
										disabled: busy[row.provider] === true,
										title: t("deleteProvider"),
										"aria-label": `${t("deleteProvider")} ${providerName}`,
										onClick: () => setConfirming({
											kind: "provider",
											provider: row.provider,
											title: t("deleteProviderTitle"),
											detail: fill(t("deleteProviderBody"), {
												provider: providerName,
												count: String(row.models.length)
											})
										})
									}, h(TrashIcon, {})) : null,
									editable ? h("button", {
										type: "button",
										className: "mcf-btn mcf-btnSm mcf-btnPrimary",
										disabled: busy[row.provider] === true,
										onClick: () => startAdd(row)
									}, t("addModel")) : null
								)
							),
							row.editable ? null : h("p", { className: "mcf-notice" }, t("notEditable")),
							row.editable && !state.writable ? h("p", { className: "mcf-notice" }, t("readOnly")) : null,
							row.directoryError === undefined ? null : h("p", { className: "mcf-error" }, row.directoryError),
							row.models.length === 0
								? h("p", { className: "mcf-status" }, t("modelsEmpty"))
								: h("ul", { className: "mcf-models" }, row.models.map((model, index) => renderModel(row, model, index))),
							rowError[row.provider] === undefined ? null : h("p", { className: "mcf-error" }, rowError[row.provider])
						);
					};

					const renderProvider = (row: ProviderRow, index: number) => {
						const open = openId === row.provider;
						const panelId = `mcf-panel-${String(index)}`;
						const name = row.displayName.length === 0 ? row.provider : row.displayName;
						return h("section", { className: "mcf-group", key: row.provider, "data-open": open ? "true" : "false" },
							h("button", {
								type: "button",
								className: "mcf-provider",
								"aria-expanded": open,
								"aria-controls": panelId,
								onClick: () => {
									setOpenId(open ? null : row.provider);
									if (!open) {
										setAdding(null);
										setAddError(null);
									}
								}
							},
								h("span", { className: "mcf-providerIcon", "aria-hidden": "true" }, monogramOf(row)),
								h("span", { className: "mcf-providerIdentity" },
									h("span", { className: "mcf-providerName", title: name }, name),
									row.displayName === row.provider ? null : h("span", { className: "mcf-providerId", title: row.provider }, row.provider)
								),
								h("span", { className: "mcf-providerMeta" },
									h("span", {
										className: "mcf-statusBadge",
										"data-on": row.active ? "true" : "false",
										title: row.active ? undefined : t("inactiveHint")
									},
										h("span", { className: "mcf-dot", "aria-hidden": "true" }),
										row.active ? t("active") : t("inactive")
									),
									h("span", { className: "mcf-countBadge" }, fill(t("modelCount"), { count: String(row.models.length) }))
								),
								h("span", { className: "mcf-chevron", "aria-hidden": "true" }, h(Chevron, {}))
							),
							h("div", { className: "mcf-panelWrap", "data-open": open ? "true" : "false" },
								h("div", { className: "mcf-panelClip" }, renderPanel(row, panelId))
							)
						);
					};

					/**
					* The one overlay the page may show: the add-model dialog, or the
					* confirmation for a destructive removal. Both live outside the
					* accordion so the panel's overflow clip cannot cut them off.
					*/
					const renderDialog = (): ReactNode => {
						const providerNameOf = (row: ProviderRow): string =>
							row.displayName.length === 0 ? row.provider : row.displayName;

						if (confirming !== null) {
							const target = confirming;
							const row = state.rows.find((candidate) => candidate.provider === target.provider);
							const error = rowError[target.provider];
							return h("div", {
								className: "mcf-overlay",
								onClick: (event: import("react").MouseEvent<HTMLDivElement>) => {
									if (event.target === event.currentTarget) setConfirming(null);
								}
							},
								h("div", {
									className: "mcf-modal",
									role: "alertdialog",
									"aria-modal": "true",
									"aria-label": target.title
								},
									h("div", { className: "mcf-modalHead" },
										h("h2", { className: "mcf-modalTitle" }, target.title),
										h("button", {
											type: "button",
											className: "mcf-btn mcf-btnSm mcf-iconBtn",
											"aria-label": t("close"),
											title: t("close"),
											onClick: () => setConfirming(null)
										}, h(CloseIcon, {}))
									),
									h("div", { className: "mcf-modalBody" },
										h("p", { className: "mcf-confirmText" }, target.detail),
										error === undefined ? null : h("p", { className: "mcf-error" }, error)
									),
									h("div", { className: "mcf-modalFoot" },
										h("button", {
											type: "button",
											className: "mcf-btn",
											disabled: row !== undefined && busy[row.provider] === true,
											onClick: () => setConfirming(null)
										}, t("cancel")),
										h("button", {
											type: "button",
											className: "mcf-btn mcf-btnDanger",
											disabled: row !== undefined && busy[row.provider] === true,
											onClick: () => void runConfirm(target)
										}, t("delete"))
									)
								)
							);
						}

						if (creating !== null) {
							const draftProvider = creating;
							const namespace = state.namespaces.get(draftProvider.ns);
							const routes = providerRoutesOf(namespace);
							const route = draftProvider.route.trim();
							const baseURL = draftProvider.baseURL.trim();
							const filled = draftProvider.models.filter((model) => model.id.trim().length > 0);
							const routeInvalid = route.length > 0 && !ROUTE_PATTERN.test(route);
							const routeTaken = route.length > 0 && routes.includes(route);
							const baseURLInvalid = baseURL.length > 0 && !isHttpUrl(baseURL);
							/* Inline field problems: route and Base URL speak up live, the
							 * rest only after a submit attempt, so untouched boxes stay calm. */
							const routeError = route.length === 0
								? null
								: routeInvalid
									? t("providerRouteInvalid")
									: routeTaken
										? t("routeTaken")
										: null;
							const baseURLLive = baseURL.length === 0
								? null
								: baseURLInvalid ? t("baseURLInvalid") : null;
							const keyBlank = draftProvider.apiKey.trim().length === 0;
							const keyError = createAttempted && keyBlank ? t("keyRequired") : null;
							const duplicateIds = new Set<string>();
							const counted = new Set<string>();
							for (const model of filled) {
								if (counted.has(model.id)) duplicateIds.add(model.id);
								else counted.add(model.id);
							}
							const modelRowInvalid = (id: string): boolean => {
								if (!createAttempted) return false;
								const trimmed = id.trim();
								return trimmed.length === 0 || duplicateIds.has(trimmed);
							};
							const modelsError = createAttempted && filled.length === 0
								? t("needOneModel")
								: duplicateIds.size > 0 && createAttempted
									? t("idDuplicate")
									: null;
							const query = candidateQuery.trim().toLowerCase();
							const visibleCandidates = (): LlmDiscoveredModel[] =>
								query.length === 0
									? candidates ?? []
									: (candidates ?? []).filter((model) =>
										model.id.toLowerCase().includes(query)
										|| (typeof model.name === "string" && model.name.toLowerCase().includes(query))
									);
							const inputCls = (invalid: boolean): string => {
								if (!invalid) return "mcf-input";
								return pulse ? "mcf-input mcf-inputInvalid mcf-pulse" : "mcf-input mcf-inputInvalid";
							};
							return h("div", {
								className: "mcf-overlay",
								onClick: (event: import("react").MouseEvent<HTMLDivElement>) => {
									if (event.target === event.currentTarget) closeCreate();
								}
							},
								h("div", {
									className: "mcf-modal mcf-modalFixed",
									role: "dialog",
									"aria-modal": "true",
									"aria-labelledby": "mcf-create-title"
								},
									h("div", { className: "mcf-modalHead" },
										h("div", null,
											h("h2", { className: "mcf-modalTitle", id: "mcf-create-title" }, t("newProviderTitle")),
											h("p", { className: "mcf-modalSub" }, t("addProviderHint"))
										),
										h("button", {
											type: "button",
											className: "mcf-btn mcf-btnSm mcf-iconBtn",
											"aria-label": t("close"),
											title: t("close"),
											onClick: closeCreate
										}, h(CloseIcon, {}))
									),
									h("div", { className: "mcf-modalBody" },
										h("p", { className: "mcf-sectionLabel" }, t("sectionProvider")),
										h("div", { className: "mcf-formGrid" },
											h("label", { className: "mcf-field" },
												h("span", null, t("providerRoute")),
												h("input", {
													className: inputCls(routeError !== null),
													type: "text",
													value: draftProvider.route,
													autoFocus: true,
													spellCheck: false,
													"aria-invalid": routeError !== null,
													placeholder: "my-relay",
													onChange: (event: import("react").ChangeEvent<HTMLInputElement>) =>
														patchCreate({ route: event.target.value })
												}),
												routeError === null
													? h("span", { className: "mcf-fieldHint" }, t("providerRouteHint"))
													: h("span", { className: "mcf-fieldError" }, routeError)
											),
											h("label", { className: "mcf-field" },
												h("span", null, t("providerName")),
												h("input", {
													className: "mcf-input",
													type: "text",
													value: draftProvider.displayName,
													onChange: (event: import("react").ChangeEvent<HTMLInputElement>) =>
														patchCreate({ displayName: event.target.value })
												})
											),
											h("label", { className: "mcf-field" },
												h("span", null, t("protocol")),
												h("select", {
													className: "mcf-input",
													value: draftProvider.protocol,
													onChange: (event: import("react").ChangeEvent<HTMLSelectElement>) =>
														patchCreate({ protocol: event.target.value })
												}, protocolChoicesOf(namespace).map((choice) =>
													h("option", { key: choice, value: choice }, protocolLabel(choice))
												))
											),
											h("label", { className: "mcf-field" },
												h("span", null, t("baseURLLabel")),
												h("input", {
													className: inputCls(baseURLLive !== null),
													type: "text",
													value: draftProvider.baseURL,
													spellCheck: false,
													"aria-invalid": baseURLLive !== null,
													placeholder: "https://api.example.com/v1",
													onChange: (event: import("react").ChangeEvent<HTMLInputElement>) =>
														patchCreate({ baseURL: event.target.value })
												}),
												baseURLLive === null
													? null
													: h("span", { className: "mcf-fieldError" }, baseURLLive)
											),
											h("label", { className: "mcf-field mcf-span2" },
												h("span", null, t("apiKeyLabel"), " *"),
												h("input", {
													className: inputCls(keyError !== null),
													type: "password",
													value: draftProvider.apiKey,
													spellCheck: false,
													"aria-invalid": keyError !== null,
													placeholder: draftProvider.route.length > 0
														? deriveKeyRef(draftProvider.route.trim())
														: undefined,
													onChange: (event: import("react").ChangeEvent<HTMLInputElement>) =>
														patchCreate({ apiKey: event.target.value })
												}),
												keyError === null
													? h("span", { className: "mcf-fieldHint" },
														fill(t("apiKeyHint"), { ref: route.length > 0 ? deriveKeyRef(route) : "…" }))
													: h("span", { className: "mcf-fieldError" }, keyError)
											)
										),
										h("div", { className: "mcf-modelsHead" },
											h("p", { className: "mcf-sectionLabel" }, t("models")),
											h("button", {
												type: "button",
												className: "mcf-btn mcf-btnSm",
												disabled: fetching || baseURLInvalid || baseURL.length === 0 || createBusy,
												title: baseURL.length === 0 ? t("fetchNeedsBaseURL") : undefined,
												onClick: () => void runFetchModels()
											}, fetching ? t("fetching") : t("fetchModels"))
										),
										h("div", { className: "mcf-modelRows" },
											draftProvider.models.map((model, index) =>
												h("div", { className: "mcf-modelRow", key: index },
													h("input", {
														className: inputCls(modelRowInvalid(model.id)),
														type: "text",
														value: model.id,
														spellCheck: false,
														placeholder: t("modelId"),
														"aria-label": t("modelId"),
														onChange: (event: import("react").ChangeEvent<HTMLInputElement>) =>
															patchCreateModel(index, { id: event.target.value })
													}),
													h("input", {
														className: "mcf-input",
														type: "text",
														value: model.name,
														placeholder: t("modelName"),
														"aria-label": t("modelName"),
														onChange: (event: import("react").ChangeEvent<HTMLInputElement>) =>
															patchCreateModel(index, { name: event.target.value })
													}),
													h("label", { className: "mcf-rowCheck" },
														h("input", {
															className: "mcf-check",
															type: "checkbox",
															checked: model.vision,
															onChange: (event: import("react").ChangeEvent<HTMLInputElement>) =>
																patchCreateModel(index, { vision: event.target.checked })
														}),
														t("vision")
													),
													draftProvider.models.length === 1
														? null
														: h("button", {
															type: "button",
															className: "mcf-btn mcf-btnSm mcf-iconBtn",
															"aria-label": t("removeRow"),
															title: t("removeRow"),
															onClick: () => patchCreate({
																models: draftProvider.models.filter((_, at) => at !== index)
															})
														}, h(CloseIcon, {}))
												)
											)
										),
										h("div", { className: "mcf-addRowWrap" },
											h("button", {
												type: "button",
												className: "mcf-btn mcf-btnSm",
												onClick: () => patchCreate({
													models: [...draftProvider.models, { id: "", name: "", vision: true }]
												})
											}, t("addModelRow"))
										),
										modelsError === null ? null : h("p", { className: "mcf-fieldError" }, modelsError),
										fetchError === null ? null : h("p", { className: "mcf-error" }, fetchError),
										candidates === null ? null : h("div", { className: "mcf-candidates" },
											h("div", { className: "mcf-candHead" },
												h("input", {
													className: "mcf-input mcf-candSearch",
													type: "text",
													value: candidateQuery,
													placeholder: t("search"),
													onChange: (event: import("react").ChangeEvent<HTMLInputElement>) =>
														setCandidateQuery(event.target.value)
												}),
												h("div", { className: "mcf-candActions" },
													h("button", {
														type: "button",
														className: "mcf-btn mcf-btnSm",
														onClick: () => {
															const visible = visibleCandidates();
															const all = visible.length > 0 && visible.every((model) => picked.has(model.id));
															setPicked((current) => {
																const next = new Set(current);
																for (const model of visible) {
																	if (all) next.delete(model.id);
																	else next.add(model.id);
																}
																return next;
															});
														}
													}, t("toggleAll")),
													h("button", {
														type: "button",
														className: "mcf-btn mcf-btnSm mcf-btnPrimary",
														disabled: picked.size === 0,
														onClick: adoptPickedModels
													}, fill(t("adoptModels"), { count: String(picked.size) }))
												)
											),
											h("div", { className: "mcf-candList", role: "listbox", "aria-multiselectable": true },
												visibleCandidates().map((model) =>
													h("label", { className: "mcf-candRow", key: model.id },
														h("input", {
															className: "mcf-check",
															type: "checkbox",
															checked: picked.has(model.id),
															onChange: () => {
																setPicked((current) => {
																	const next = new Set(current);
																	if (next.has(model.id)) next.delete(model.id);
																	else next.add(model.id);
																	return next;
																});
															}
														}),
														h("span", { className: "mcf-candId" }, model.id),
														typeof model.name === "string" && model.name !== model.id
															? h("span", { className: "mcf-candName" }, model.name)
															: null
													)
												)
											)
										),
										probeError === null ? null : h("p", { className: "mcf-error" }, probeError),
										probeError === null ? null : h("label", { className: "mcf-skipRow" },
											h("input", {
												className: "mcf-check",
												type: "checkbox",
												checked: skipProbe,
												onChange: (event: import("react").ChangeEvent<HTMLInputElement>) => {
													setSkipProbe(event.target.checked);
													if (event.target.checked) setProbeError(null);
												}
											}),
											t("skipProbe")
										),
										createError === null ? null : h("p", { className: "mcf-error" }, createError)
									),
									h("div", { className: "mcf-modalFoot" },
										h("button", {
											type: "button",
											className: "mcf-btn",
											disabled: createBusy || probeBusy,
											onClick: closeCreate
										}, t("cancel")),
										h("button", {
											type: "button",
											className: "mcf-btn mcf-btnPrimary",
											disabled: createBusy || probeBusy,
											onClick: () => void submitCreate()
										}, createBusy ? t("testing") : probeBusy ? t("probing") : t("create"))
									)
								)
							);
						}

						const row = adding === null
							? undefined
							: state.rows.find((candidate) => candidate.provider === adding);
						if (row === undefined) return null;

						const id = draft.id.trim();
						const testing = modalTest !== null && modalTest.status === "testing";
						const canTest = row.active && id.length > 0 && !testing;
						const error = addError ?? rowError[row.provider];
						return h("div", {
							className: "mcf-overlay",
							onClick: (event: import("react").MouseEvent<HTMLDivElement>) => {
								if (event.target === event.currentTarget) closeAdd();
							}
						},
							h("div", {
								className: "mcf-modal",
								role: "dialog",
								"aria-modal": "true",
								"aria-labelledby": "mcf-add-title"
							},
								h("div", { className: "mcf-modalHead" },
									h("div", null,
										h("h2", { className: "mcf-modalTitle", id: "mcf-add-title" }, t("addModel")),
										h("p", { className: "mcf-modalSub" }, fill(t("addModelFor"), { provider: providerNameOf(row) }))
									),
									h("button", {
										type: "button",
										className: "mcf-btn mcf-btnSm mcf-iconBtn",
										"aria-label": t("close"),
										title: t("close"),
										onClick: closeAdd
									}, h(CloseIcon, {}))
								),
								h("div", { className: "mcf-modalBody" },
									h("label", { className: "mcf-field" },
										h("span", null, t("modelId")),
										h("input", {
											className: "mcf-input",
											type: "text",
											value: draft.id,
											placeholder: t("modelIdPlaceholder"),
											"aria-label": t("modelId"),
											autoFocus: true,
											onChange: (event) => {
												setDraft((current) => ({ ...current, id: event.target.value }));
												setModalTest(null);
											},
											onKeyDown: (event) => {
												if (event.key === "Enter") {
													event.preventDefault();
													void submitAdd(row);
												}
											}
										})
									),
									h("label", { className: "mcf-field" },
										h("span", null, t("modelName")),
										h("input", {
											className: "mcf-input",
											type: "text",
											value: draft.name,
											"aria-label": t("modelName"),
											onChange: (event) => setDraft((current) => ({ ...current, name: event.target.value }))
										})
									),
									h("div", { className: "mcf-testRow" },
										h("button", {
											type: "button",
											className: "mcf-btn mcf-btnSm",
											disabled: !canTest,
											title: row.active ? undefined : t("inactiveHint"),
											onClick: () => void runModalTest(row)
										}, testing ? t("testing") : t("test")),
										modalTest === null || testing
											? h("span", { className: "mcf-modalHint" }, t("addHint"))
											: h("span", {
												className: "mcf-testResult " + (modalTest.status === "ok" ? "mcf-testResultOk" : "mcf-testResultFail")
											}, modalTest.message)
									),
									error == null ? null : h("p", { className: "mcf-error" }, error)
								),
								h("div", { className: "mcf-modalFoot" },
									h("button", {
										type: "button",
										className: "mcf-btn",
										disabled: busy[row.provider] === true,
										onClick: closeAdd
									}, t("cancel")),
									h("button", {
										type: "button",
										className: "mcf-btn mcf-btnPrimary",
										disabled: busy[row.provider] === true,
										onClick: () => void submitAdd(row)
									}, t("add"))
								)
							)
						);
					};

					/* Escape closes whichever overlay is open, wherever focus happens to be. */
					React.useEffect(() => {
						if (adding === null && confirming === null && creating === null) return;
						const onKey = (event: KeyboardEvent): void => {
							if (event.key !== "Escape") return;
							setConfirming(null);
							setAdding(null);
							setAddError(null);
							setModalTest(null);
							setCreating(null);
							setCreateError(null);
							setCreateAttempted(false);
							setProbePassed(false);
							setSkipProbe(false);
							setProbeError(null);
							setFetchError(null);
							setCandidates(null);
							setPicked(new Set<string>());
							setCandidateQuery("");
						};
						document.addEventListener("keydown", onKey);
						return () => document.removeEventListener("keydown", onKey);
					}, [adding, confirming, creating]);

					const loading = state.status === "loading" && state.rows.length === 0;
					const failed = state.status === "error";
					const renderSlot = props.renderSlot;
					/* A provider can only be hand-declared where a `providers` map exists. */
					const creatableView = state.writable && [...state.namespaces.values()].some((namespace) =>
						isRecord(getPath(namespace.value, ["providers"])) || isRecord(getPath(namespace.base, ["providers"]))
					);

					return h("section", { className: "mcf-page", "aria-busy": loading },
						h("style", null, MCF_CSS),
						h("header", { className: "mcf-pageHead", "data-window-drag": true },
							h("div", null,
								h("h1", { className: "mcf-pageTitle" }, t("title")),
								h("p", { className: "mcf-pageIntro" }, t("intro"))
							),
							h("div", { className: "mcf-toolbar" },
								typeof renderSlot === "function" ? renderSlot("model-config.action", {}) : null,
								creatableView ? h("button", {
									type: "button",
									className: "mcf-btn mcf-btnSm mcf-btnPrimary",
									onClick: startCreate
								}, t("addProvider")) : null,
								state.updatedAt === null ? null : h("span", {
									className: "mcf-updated",
									role: "status"
								}, fill(t("updated"), { time: state.updatedAt })),
								h("button", {
									type: "button",
									className: "mcf-btn mcf-iconBtn",
									"aria-label": state.refreshing ? t("refreshing") : t("refresh"),
									title: state.refreshing ? t("refreshing") : t("refresh"),
									"aria-busy": state.refreshing,
									disabled: state.refreshing,
									onClick: load
								}, h(RefreshIcon, { spin: state.refreshing }))
							)
						),
						flash === null ? null : h("p", { className: "mcf-status", role: "status" }, flash),
						loading ? h("p", { className: "mcf-status", role: "status" }, t("loading")) : null,
						failed ? h("div", { className: "mcf-failure" },
							h("p", null, state.error ?? t("loadFailed")),
							h("button", { type: "button", className: "mcf-btn mcf-btnSm", onClick: load }, t("retry"))
						) : null,
						!failed && !loading && state.rows.length === 0 ? h("p", { className: "mcf-status" }, t("empty")) : null,
						state.rows.length > 0 ? h("div", { className: "mcf-groups" }, state.rows.map(renderProvider)) : null,
						!state.writable && state.rows.length > 0 ? h("p", { className: "mcf-notice" }, t("readOnly")) : null,
						renderDialog()
					);
				}

				ctx.slots.inject("main", () => ctx.slots.register({
					name: "main",
					key: PANEL_ID,
					locale: NS,
					children: {
						"model-config.action": { kind: "list", scope: "root" }
					}
				}, ModelConfigPage));
				ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({
					name: "sidebar.panellist",
					id: PANEL_ID,
					order: 20,
					locale: NS,
					label: () => t("panel")
				}, PanelIcon));
			}
		};
	}
});
