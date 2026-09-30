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

/* ---------------------------------------------------------------- export types */

/** The three shapes the export dialog can render. */
type ExportFormat = "json" | "yaml" | "env";

/** One provider as the export record states it. */
interface ExportedProvider {
	provider: string;
	displayName: string;
	settingsNs: string;
	settingsPath: string[];
	/**
	 * The settings value at `settingsPath`, verbatim. This is what an import
	 * writes back: the summary fields below are for humans and for tools that
	 * only need the four asked-for values, but they cannot rebuild a profile
	 * that carries fields this page does not know about.
	 */
	profile: JsonValue;
	api: string | null;
	baseURL: string | null;
	apiKeyEnv: string | null;
	apiKey: string | null;
	active: boolean;
	models: ModelRow[];
}

/** The whole JSON export document. */
interface ExportDocument {
	version: number;
	exportedAt: string;
	providers: ExportedProvider[];
}

/** What the export dialog is currently open on. */
interface ExportTarget {
	rows: ProviderRow[];
	/** ISO instant the dialog opened; frozen so the preview stops changing per render. */
	at: string;
}

/** The Host route's answer for the references one export needs. */
type SecretLookup =
	| { kind: "ok"; values: Record<string, string>; missing: string[]; refused: string[] }
	| { kind: "stale" }
	| { kind: "error"; message: string };

/** Everything the export dialog renders from. */
interface ExportState {
	status: "idle" | "loading" | "ready" | "error";
	values: Record<string, string>;
	missing: string[];
	refused: string[];
	error: string | null;
}

/* ---------------------------------------------------------------- import types */

/** How the import dialog reads what was pasted or picked. */
type ImportFormat = "auto" | "json" | "yaml" | "env";

/** One provider read out of an import document, before the target is known. */
interface ImportEntry {
	/** The route id; null when the document names a namespace but no route. */
	provider: string | null;
	settingsNs: string;
	settingsPath: string[];
	profile: JsonObject;
	apiKeyEnv: string | null;
	apiKey: string | null;
}

/** Why one entry cannot be imported as it stands. */
type ImportProblem =
	| { code: "unknownProvider" }
	| { code: "badRoute"; route: string }
	| { code: "noNamespace"; ns: string }
	| { code: "noModels" };

/** What one import document holds, independent of the live configuration. */
interface ImportDocument {
	format: "json" | "yaml" | "env";
	entries: ImportEntry[];
	/** Secret values read from a `.env` document; other formats carry theirs per entry. */
	keys: Array<{ ref: string; value: string }>;
	/** A reason the text could not be read at all, or null. */
	error: string | null;
}

/** One entry matched against the live configuration. */
interface ImportCandidate extends ImportEntry {
	displayName: string;
	modelCount: number;
	/** True when the target path already holds a value, so importing replaces it. */
	overwrite: boolean;
	problem: ImportProblem | null;
}

/** The live configuration an import is planned against. */
interface ImportContext {
	rows: readonly ProviderRow[];
	sectionOf(ns: string): JsonValue | undefined;
}

/** One significant line of the YAML subset this plugin emits. */
interface YamlLine {
	indent: number;
	text: string;
}

/** A cursor over {@link YamlLine}s while the subset parser descends. */
interface YamlState {
	lines: YamlLine[];
	index: number;
}

/** A parsed value, or the reason the text left the supported subset. */
interface YamlParse {
	value: JsonValue | undefined;
	error: string | null;
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

		/** The Host half's credential route, the only source of plaintext key values. */
		const SECRETS_PATH = "/model-config/secrets";

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
			reasoning: "Reasoning",
			reasoningOn: "Reasoning",
			reasoningLabel: "Reasoning effort for {model}",
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
			lastModelGuard: "A hand-declared provider must keep at least one model. To remove the whole provider, use Delete provider on its card.",
			deleteModelBody: "{model} will be removed from {provider}. This writes to your profile configuration and cannot be undone.",
			deleteProviderTitle: "Delete this provider?",
			deleteProviderBody: "{provider} and its {count} models will be removed from your profile configuration. This cannot be undone.",
			delete: "Delete",
			close: "Close",
			addProvider: "Add provider",
			newProviderTitle: "New provider",
			addProviderHint: "Once created it appears below like any other provider — every model supports testing, vision, and reasoning effort. Creation checks reachability first; if the check fails you can still create, skipping it.",
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
			create: "Create",
			exportLabel: "Export",
			exportAll: "Export all",
			exportTitleOne: "Export {provider}",
			exportTitleAll: "Export all providers",
			exportSub: "A read-only snapshot of what this configuration holds. Exporting only writes the file you save.",
			exportFormat: "Format",
			exportFormatJson: "JSON — full record",
			exportFormatYaml: "YAML — configuration snippet",
			exportFormatEnv: ".env — keys only",
			exportScope: "{count} providers · {models} models",
			exportIncludeKey: "Include the API key in plain text",
			exportPick: "Providers to export",
			exportPickCount: "{picked}/{total} selected",
			exportPickAll: "Select all",
			exportPickNone: "Select none",
			exportPickModels: "{count} models",
			exportPickEmpty: "Pick at least one provider.",
			exportTitlePicked: "{count} providers selected",
			exportRefsNone: "These providers declare no API key reference, so no key can be exported.",
			exportKeyLoading: "Reading the key from the credential store…",
			exportKeyMissing: "Not stored yet: {refs}",
			exportKeyRefused: "Not named by the configuration: {refs}",
			exportKeyFailed: "Could not read the key: {message}",
			exportKeyOff: "The key is left out. Switch the option on to read it from the credential store.",
			exportCopy: "Copy",
			exportCopied: "Copied",
			exportCopyFailed: "Copy failed — select the text and copy it manually.",
			exportSave: "Save file",
			exportWarning: "The exported file contains a plaintext API key. Keep it private.",
			exportHostStale: "The Host half is not answering yet, so the key cannot be read. Restart DSH (or toggle this plugin) and try again — every other field is already in the export.",
			importLabel: "Import",
			importTitle: "Import configuration",
			importSub: "Paste an export below or pick the file you saved. Nothing is written until you confirm.",
			importFormat: "Format",
			importFormatAuto: "Detect automatically",
			importFormatJson: "JSON — full record",
			importFormatYaml: "YAML — configuration snippet",
			importFormatEnv: ".env — keys only",
			importPickFile: "Choose file…",
			importPlaceholder: "Paste the exported JSON, YAML, or .env here.",
			importScope: "{add} new · {replace} replaced · {skipped} skipped · {models} models",
			importNew: "new",
			importReplace: "replace",
			importSkip: "skip",
			importIncludeKeys: "Write the keys this document carries into the credential store",
			importKeysLine: "{count} keys will be written.",
			importKeysNone: "This document carries no keys.",
			importReplaceWarn: "Replacing writes over what the configuration holds at those paths.",
			importApply: "Import {count}",
			importBusy: "Importing…",
			importedFlash: "{count} providers imported, {keys} keys stored.",
			importReadFailed: "Could not read the file: {message}",
			importNsFailed: "{ns}: {message}",
			importKeyFailed: "Key {ref}: {message}",
			importUnknownProvider: "cannot tell which provider route this section belongs to",
			importBadRoute: "not a valid provider route: {route}",
			importNoNamespace: "this configuration has no {ns} settings section",
			importNoModels: "a provider needs at least one model",
			importErrEmpty: "Nothing to read yet.",
			importErrNoProviders: "No providers found in this document.",
			importErrNoKeys: "No KEY=value lines found.",
			importErrShape: "Not an export document: expected a providers list or one provider record.",
			importErrMapping: "The YAML root has to be a mapping of settings namespaces.",
			importErrYaml: "This YAML is outside the subset this plugin writes. Use the JSON export instead.",
			importErrParse: "Could not read the document: {message}",
			importErrTooLarge: "This text is too large to read in the dialog. Save it as a file and import it from disk.",
			importReadOnly: "The settings document is read-only in this deployment, so nothing can be imported."
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
			lastModelGuard: "手动声明的提供商至少要保留一个模型；要删除整个提供商，请用卡片上的「删除品牌商」。",
			deleteModelBody: "将从 {provider} 中移除 {model}。该操作会写入你的 profile 配置，无法撤销。",
			deleteProviderTitle: "删除该品牌商？",
			deleteProviderBody: "将从 profile 配置中移除 {provider} 及其 {count} 个模型，无法撤销。",
			delete: "删除",
			close: "关闭",
			addProvider: "新增提供商",
			newProviderTitle: "新增提供商",
			addProviderHint: "创建后会像其他提供商一样出现在列表里，每个模型都可测试连通、打开识图、打开思考强度。创建时会先检查接口能否连通，检查不过也可以选择跳过。",
			reasoning: "思考",
			reasoningOn: "思考",
			reasoningLabel: "思考强度（{model}）",
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
			create: "创建",
			exportLabel: "导出",
			exportAll: "导出全部",
			exportTitleOne: "导出「{provider}」",
			exportTitleAll: "导出全部提供商",
			exportSub: "这是当前配置的只读快照，除了保存文件不会改动任何设置。",
			exportFormat: "格式",
			exportFormatJson: "JSON — 完整记录",
			exportFormatYaml: "YAML — 配置片段",
			exportFormatEnv: ".env — 仅密钥",
			exportScope: "{count} 个提供商 · {models} 个模型",
			exportIncludeKey: "以明文包含密钥",
			exportPick: "要导出的提供商",
			exportPickCount: "已选 {picked}/{total}",
			exportPickAll: "全选",
			exportPickNone: "全不选",
			exportPickModels: "{count} 个模型",
			exportPickEmpty: "至少选择一个提供商。",
			exportTitlePicked: "已选 {count} 个提供商",
			exportRefsNone: "这些提供商没有声明密钥引用，无法导出密钥。",
			exportKeyLoading: "正在从凭据库读取密钥…",
			exportKeyMissing: "尚未存储：{refs}",
			exportKeyRefused: "配置中未引用：{refs}",
			exportKeyFailed: "读取密钥失败：{message}",
			exportKeyOff: "当前不含密钥；打开上面的选项即可从凭据库读取。",
			exportCopy: "复制",
			exportCopied: "已复制",
			exportCopyFailed: "复制失败，请手动全选复制。",
			exportSave: "保存文件",
			exportWarning: "导出文件包含明文密钥，请妥善保管。",
			exportHostStale: "Host 端尚未响应，暂时读不到密钥。重启 DSH（或重新启用本插件）后再试——其他字段已经包含在导出里了。",
			importLabel: "导入",
			importTitle: "导入配置",
			importSub: "把导出内容粘在下面，或选择你保存的文件。确认之前不会写入任何东西。",
			importFormat: "格式",
			importFormatAuto: "自动识别",
			importFormatJson: "JSON — 完整记录",
			importFormatYaml: "YAML — 配置片段",
			importFormatEnv: ".env — 仅密钥",
			importPickFile: "选择文件…",
			importPlaceholder: "把导出的 JSON、YAML 或 .env 粘到这里。",
			importScope: "新增 {add} · 覆盖 {replace} · 跳过 {skipped} · 模型 {models}",
			importNew: "新增",
			importReplace: "覆盖",
			importSkip: "跳过",
			importIncludeKeys: "把文档里的密钥写入凭据库",
			importKeysLine: "将写入 {count} 个密钥。",
			importKeysNone: "这份文档不含密钥。",
			importReplaceWarn: "「覆盖」会替换配置里对应路径上的原有内容。",
			importApply: "导入 {count} 个",
			importBusy: "导入中…",
			importedFlash: "已导入 {count} 个提供商，写入 {keys} 个密钥。",
			importReadFailed: "读取文件失败：{message}",
			importNsFailed: "{ns}：{message}",
			importKeyFailed: "密钥 {ref}：{message}",
			importUnknownProvider: "无法判断这一段属于哪个提供商路由",
			importBadRoute: "不是合法的提供商路由：{route}",
			importNoNamespace: "当前配置没有 {ns} 设置分区",
			importNoModels: "提供商至少要有一个模型",
			importErrEmpty: "还没有可读取的内容。",
			importErrNoProviders: "这份文档里没有找到提供商。",
			importErrNoKeys: "没有找到 KEY=value 行。",
			importErrShape: "不是导出文档：需要 providers 列表或单条提供商记录。",
			importErrMapping: "YAML 根节点需要是「设置分区 → 内容」的映射。",
			importErrYaml: "这段 YAML 超出了本插件写出的子集，请改用 JSON 导出。",
			importErrParse: "无法解析文档：{message}",
			importErrTooLarge: "内容太大，无法在弹窗里读取。请先存成文件再导入。",
			importReadOnly: "当前部署的设置文档是只读的，无法导入。"
		};

		/** Component-local styles; unmounting the page removes them with it. */
		const MCF_CSS = `
.mcf-page{box-sizing:border-box;height:100%;overflow:auto;flex-direction:column;align-items:center;gap:24px;padding:0 32px 56px;display:flex;background:var(--mcf-bg);color:var(--mcf-text);font-family:var(--dsw-font-family,-apple-system,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif);font-size:14px;line-height:22px;--mcf-accent:#635BFF;--mcf-accent-hover:#574FE8;--mcf-accent-soft:#EEEDFF;--mcf-tag-bg:#F0F0FF;--mcf-tag-line:#E5E3FF;--mcf-accent-line:#DCD9FF;--mcf-ring:#C7C2FF;--mcf-bg:#F6F7F9;--mcf-surface:#FFFFFF;--mcf-surface-hover:#FAFAFF;--mcf-surface-open:#FBFBFF;--mcf-text:#18181B;--mcf-text-2:#71717A;--mcf-text-3:#A1A1AA;--mcf-border:#E8E8EC;--mcf-border-hover:#DDDDF0;--mcf-neutral:#F4F4F5;--mcf-track-off:#D9DCE3;--mcf-ghost-border:#E4E4E7;--mcf-ghost-text:#52525B;--mcf-danger:#D92D20;--mcf-danger-strong:#B42318;--mcf-danger-soft:#FEF3F2;--mcf-danger-line:#FDA29B;--mcf-scrim:#18181B66;--mcf-success:#067647;--mcf-warn:#B54708}
body[data-ds-dark-theme] .mcf-page{--mcf-bg:#0F0F11;--mcf-surface:#18181B;--mcf-surface-hover:#1F1F24;--mcf-surface-open:#1A1922;--mcf-text:#FAFAFA;--mcf-text-2:#A1A1AA;--mcf-text-3:#71717A;--mcf-border:#27272A;--mcf-border-hover:#3A3A45;--mcf-neutral:#232327;--mcf-accent-soft:#26243F;--mcf-tag-bg:#26243F;--mcf-tag-line:#3A3563;--mcf-accent-line:#4B45A8;--mcf-ring:#4B45A8;--mcf-track-off:#3F3F46;--mcf-ghost-border:#3F3F46;--mcf-ghost-text:#D4D4D8;--mcf-danger:#F97066;--mcf-danger-strong:#D92D20;--mcf-danger-soft:#3A1A18;--mcf-danger-line:#7A2A24;--mcf-scrim:#000000A6;--mcf-warn:#FDB022}
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
/* Data-heavy dialogs (export picker, import preview): wider box, taller body. */
.mcf-modalWide{max-width:620px}
.mcf-modalFixed.mcf-modalWide{height:min(780px,calc(100vh - 64px))}
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
/* The export picker holds every provider at once, so it scrolls only when the
   window itself is short — never at the two-rows-at-a-time size of 200px. */
.mcf-pickList{max-height:min(52vh,420px);overflow:auto}
.mcf-candRow{display:flex;gap:8px;align-items:center;padding:6px 10px;cursor:pointer;font-size:12px}
.mcf-candRow:hover{background:var(--mcf-surface-hover)}
.mcf-candId{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;color:var(--mcf-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mcf-candName{color:var(--mcf-text-3);flex-shrink:0}
.mcf-exportOpts{display:flex;flex-wrap:wrap;align-items:flex-end;gap:8px 16px}
.mcf-exportOpts>*{flex:none}
.mcf-exportSelect{width:280px}
.mcf-exportText{box-sizing:border-box;width:100%;min-height:200px;max-height:360px;resize:vertical;margin:0;padding:10px 12px;border:1px solid var(--mcf-border);border-radius:9px;background:var(--mcf-neutral);color:var(--mcf-text);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;line-height:18px;white-space:pre;overflow:auto}
.mcf-exportText:focus{outline:none;border-color:var(--mcf-accent)}
.mcf-exportNote{margin:0;color:var(--mcf-text-3);font-size:11px;line-height:16px}
.mcf-exportWarn{margin:0;color:var(--mcf-danger);font-size:11px;line-height:16px}
.mcf-importList{box-sizing:border-box;width:100%;max-height:min(44vh,360px);overflow:auto;margin:0;padding:0;border:1px solid var(--mcf-border);border-radius:9px;background:var(--mcf-neutral);list-style:none}
.mcf-importItem{display:flex;align-items:baseline;gap:8px;padding:7px 10px;border-top:1px solid var(--mcf-border);font-size:12px;line-height:17px}
.mcf-importItem:first-child{border-top:0}
.mcf-importName{color:var(--mcf-text);font-weight:600;flex:none}
.mcf-importMeta{color:var(--mcf-text-3);font-size:11px;flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mcf-importBadge{flex:none;padding:1px 7px;border-radius:999px;border:1px solid var(--mcf-border);color:var(--mcf-text-3);font-size:10px;line-height:15px}
.mcf-importBadgeNew{border-color:var(--mcf-accent);color:var(--mcf-accent)}
.mcf-importBadgeReplace{border-color:var(--mcf-warn);color:var(--mcf-warn)}
.mcf-importBadgeSkip{border-color:var(--mcf-border);color:var(--mcf-text-3)}
.mcf-importReason{color:var(--mcf-text-3);font-size:11px;line-height:16px}
.mcf-importError{margin:0;color:var(--mcf-danger);font-size:11px;line-height:16px;white-space:pre-line}
.mcf-importFile{display:none}
.mcf-pickName{color:var(--mcf-text);font-size:12px;flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mcf-copied{color:var(--mcf-success);font-size:12px;line-height:18px}
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
		/**
		 * The reasoning-effort map a hand-declared model gets when reasoning is
		 * switched on: off sends nothing, the three standard levels pass through
		 * under their OpenAI spellings, and the exotic levels stay unsupported.
		 */
		const REASONING_EFFORTS_ON: Record<string, string | null> = { off: null, low: "low", medium: "medium", high: "high" };
		/** Whether a model entry declares usable reasoning levels. */
		const reasoningOnOf = (model: ModelRow): boolean =>
			typeof model.reasoningEfforts === "object"
			&& model.reasoningEfforts !== null
			&& !Array.isArray(model.reasoningEfforts);

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
			reasoning: boolean;
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

		/* ------------------------------------------------------------ export helpers */

		/** Deep-copy one JSON value without asserting a parsed shape. */
		function cloneJson(value: JsonValue | undefined): JsonValue | undefined {
			if (Array.isArray(value)) return value.map((item) => cloneJson(item) ?? null);
			if (isJsonObject(value)) {
				const copy: JsonObject = {};
				for (const [key, entry] of Object.entries(value)) {
					if (entry === undefined) continue;
					copy[key] = cloneJson(entry) ?? null;
				}
				return copy;
			}
			return value;
		}

		/** A non-empty string profile field, or null when the profile carries none. */
		function profileString(row: ProviderRow, key: string): string | null {
			const value = getPath(row.profile, [key]);
			return typeof value === "string" && value.length > 0 ? value : null;
		}

		/** The credential reference a provider's profile declares, when it declares one. */
		function keyRefOf(row: ProviderRow): string | undefined {
			const value = getPath(row.profile, ["apiKeyEnv"]);
			return typeof value === "string" && value.length > 0 ? value : undefined;
		}

		/** Every credential reference the given providers declare, deduplicated in order. */
		function keyRefsOf(rows: readonly ProviderRow[]): string[] {
			const refs: string[] = [];
			for (const row of rows) {
				const ref = keyRefOf(row);
				if (ref !== undefined && !refs.includes(ref)) refs.push(ref);
			}
			return refs;
		}

		/** One provider's export record; the key is stated only when it was read and asked for. */
		function exportedProviderOf(
			row: ProviderRow,
			secrets: Record<string, string>,
			includeKey: boolean
		): ExportedProvider {
			const ref = keyRefOf(row) ?? null;
			const value = ref === null ? undefined : secrets[ref];
			const models: ModelRow[] = row.models.map((model) => {
				const copy: ModelRow = { id: model.id };
				for (const [key, entry] of Object.entries(model)) {
					if (key === "id" || entry === undefined) continue;
					copy[key] = cloneJson(entry) ?? null;
				}
				return copy;
			});
			return {
				provider: row.provider,
				displayName: row.displayName,
				settingsNs: row.settingsNs,
				settingsPath: [...row.settingsPath],
				profile: cloneJson(row.profile) ?? null,
				api: profileString(row, "api"),
				baseURL: profileString(row, "baseURL"),
				apiKeyEnv: ref,
				apiKey: includeKey && value !== undefined ? value : null,
				active: row.active,
				models
			};
		}

		/** The complete export document for the chosen providers. */
		function exportDocumentOf(
			rows: readonly ProviderRow[],
			secrets: Record<string, string>,
			includeKey: boolean,
			at: string
		): ExportDocument {
			return {
				version: 1,
				exportedAt: at,
				providers: rows.map((row) => exportedProviderOf(row, secrets, includeKey))
			};
		}

		/** Whether a string has to be quoted to stay a YAML scalar. */
		function yamlNeedsQuotes(text: string): boolean {
			if (text.length === 0) return true;
			if (/^\s|\s$/.test(text)) return true;
			if (/^(?:true|false|yes|no|on|off|null|~)$/i.test(text)) return true;
			if (/^[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?$/.test(text)) return true;
			/* YAML's own special floats; a bare `.inf` would come back as Infinity. */
			if (/^[-+]?\.(?:inf|nan)$/i.test(text)) return true;
			if (/^[-,?:[\]{}#&*!|>'"%@`]/.test(text)) return true;
			/* A `#` anywhere may open a comment, and a trailing `:` may read as a key. */
			if (/#/.test(text) || /:$/.test(text)) return true;
			if (/:\s/.test(text)) return true;
			if (/[\n\r\t]/.test(text)) return true;
			return false;
		}

		/** One YAML scalar; JSON string escaping is a valid YAML double-quoted form. */
		function yamlScalar(text: string): string {
			return yamlNeedsQuotes(text) ? JSON.stringify(text) : text;
		}

		/** One non-container YAML value. */
		function yamlPrimitive(value: JsonValue | undefined): string {
			if (value === undefined || value === null) return "null";
			if (typeof value === "string") return yamlScalar(value);
			if (typeof value === "boolean") return value ? "true" : "false";
			return String(value);
		}

		/**
		 * Emit one JSON value as YAML block lines at a given indent. Containers get
		 * their own lines; scalars print inline for their key, or as a `-` item.
		 * @param value - the value to emit.
		 * @param indent - current indentation width.
		 * @param lines - sink the lines are appended to.
		 */
		function emitYaml(value: JsonValue | undefined, indent: number, lines: string[]): void {
			const pad = " ".repeat(indent);
			if (Array.isArray(value)) {
				for (const item of value) {
					if (Array.isArray(item) || isJsonObject(item)) {
						if (Array.isArray(item) && item.length === 0) {
							lines.push(`${pad}- []`);
							continue;
						}
						if (isJsonObject(item) && Object.keys(item).length === 0) {
							lines.push(`${pad}- {}`);
							continue;
						}
						lines.push(`${pad}-`);
						emitYaml(item, indent + 2, lines);
						continue;
					}
					lines.push(`${pad}- ${yamlPrimitive(item)}`);
				}
				return;
			}
			if (isJsonObject(value)) {
				for (const [key, entry] of Object.entries(value)) {
					if (entry === undefined) continue;
					const label = yamlScalar(key);
					if (Array.isArray(entry) || isJsonObject(entry)) {
						if (Array.isArray(entry) && entry.length === 0) {
							lines.push(`${pad}${label}: []`);
							continue;
						}
						if (isJsonObject(entry) && Object.keys(entry).length === 0) {
							lines.push(`${pad}${label}: {}`);
							continue;
						}
						lines.push(`${pad}${label}:`);
						emitYaml(entry, indent + 2, lines);
						continue;
					}
					lines.push(`${pad}${label}: ${yamlPrimitive(entry)}`);
				}
				return;
			}
			lines.push(`${pad}${yamlPrimitive(value)}`);
		}

		/**
		 * The configuration-snippet export: one namespace section per settings
		 * namespace, each provider profile placed at its own settings path, exactly
		 * where the settings document keeps it — so the block pastes back into a
		 * profile patch unchanged. Keys live in the credential store rather than the
		 * document, so they are listed as comments.
		 * @param rows - the providers to export.
		 * @param secrets - reference → value as the Host half answered.
		 * @param includeKey - whether the key comments are written.
		 * @param at - ISO instant of the export.
		 * @returns the YAML text.
		 */
		function exportYaml(
			rows: readonly ProviderRow[],
			secrets: Record<string, string>,
			includeKey: boolean,
			at: string
		): string {
			const lines: string[] = [
				"# model-config export",
				`# exportedAt: ${at}`,
				"# Each top-level section is a settings namespace; paste it into settings.yaml",
				"# or a profile cordis.patch.yml, keeping the section name as the key."
			];
			const refs = keyRefsOf(rows);
			if (includeKey && refs.length > 0) {
				lines.push("#", "# API keys (stored in the credential store, not in this document):");
				for (const ref of refs) {
					const value = secrets[ref];
					lines.push(value === undefined ? `# ${ref}=<not stored>` : `# ${ref}=${value}`);
				}
			}
			const tree: JsonObject = {};
			const skipped: string[] = [];
			for (const row of rows) {
				if (row.settingsNs.length === 0 || !isJsonObject(row.profile)) {
					skipped.push(row.provider);
					continue;
				}
				let section = tree[row.settingsNs];
				if (!isJsonObject(section)) {
					section = {};
					tree[row.settingsNs] = section;
				}
				const path = row.settingsPath;
				if (path.length === 0) {
					const copy = cloneJson(row.profile);
					if (isJsonObject(copy)) tree[row.settingsNs] = copy;
					continue;
				}
				let cursor: JsonObject = section;
				for (const key of path.slice(0, -1)) {
					const next = cursor[key];
					if (!isJsonObject(next)) {
						const created: JsonObject = {};
						cursor[key] = created;
						cursor = created;
						continue;
					}
					cursor = next;
				}
				const leaf = path[path.length - 1];
				if (leaf !== undefined) cursor[leaf] = cloneJson(row.profile) ?? null;
			}
			if (skipped.length > 0) lines.push("#", `# not configured, skipped: ${skipped.join(", ")}`);
			if (Object.keys(tree).length === 0) {
				lines.push("#", "# nothing to export");
				return `${lines.join("\n")}\n`;
			}
			lines.push("");
			emitYaml(tree, 0, lines);
			return `${lines.join("\n")}\n`;
		}

		/** The `.env` export: one `REF=value` line per declared key reference. */
		function exportEnv(rows: readonly ProviderRow[], secrets: Record<string, string>, at: string): string {
			const lines: string[] = [`# model-config export ${at}`];
			const refs = keyRefsOf(rows);
			for (const ref of refs) {
				const value = secrets[ref];
				lines.push(value === undefined ? `# not stored: ${ref}` : `${ref}=${value}`);
			}
			return `${lines.join("\n")}\n`;
		}

		/** Render the export in the chosen format. */
		function renderExport(
			format: ExportFormat,
			rows: readonly ProviderRow[],
			secrets: Record<string, string>,
			includeKey: boolean,
			at: string
		): string {
			if (format === "yaml") return exportYaml(rows, secrets, includeKey, at);
			if (format === "env") return exportEnv(rows, secrets, at);
			return `${JSON.stringify(exportDocumentOf(rows, secrets, includeKey, at), null, 2)}\n`;
		}

		/** The MIME type one export format is saved with. */
		function exportMime(format: ExportFormat): string {
			if (format === "json") return "application/json";
			if (format === "yaml") return "text/yaml";
			return "text/plain";
		}

		/**
		 * A dated file name for one export.
		 * @param rows - the providers being exported.
		 * @param format - the export format, used as the extension.
		 * @param at - ISO instant of the export.
		 * @param total - how many providers the dialog offered; when the selection is
		 * a strict subset of that, the name says how many were chosen instead of
		 * claiming `all`.
		 */
		function exportFilename(rows: readonly ProviderRow[], format: ExportFormat, at: string, total?: number): string {
			const pad = (value: number): string => String(value).padStart(2, "0");
			const when = new Date(at);
			const stamp = `${String(when.getFullYear())}${pad(when.getMonth() + 1)}${pad(when.getDate())}-${pad(when.getHours())}${pad(when.getMinutes())}`;
			const first = rows.length === 1 ? rows[0] : undefined;
			const subset = total !== undefined && rows.length < total;
			const scope = first !== undefined
				? first.provider
				: subset ? `${String(rows.length)}providers` : "all";
			return `model-config-${scope}-${stamp}.${format}`;
		}

		/** Hand one text export to the browser as a download. */
		function downloadText(filename: string, text: string, mime: string): void {
			const blob = new Blob([text], { type: `${mime};charset=utf-8` });
			const url = URL.createObjectURL(blob);
			const anchor = document.createElement("a");
			anchor.href = url;
			anchor.download = filename;
			anchor.rel = "noopener";
			document.body.appendChild(anchor);
			anchor.click();
			anchor.remove();
			window.setTimeout(() => URL.revokeObjectURL(url), 0);
		}

		/**
		 * Read the plaintext values behind the given credential references. Only the
		 * Host half can do this: the shipped credentials Remote describes a
		 * reference and never returns its value.
		 * @param refs - reference names to resolve.
		 * @returns per-reference values, plus which are unset or unnamed by the configuration.
		 */
		async function fetchSecrets(refs: readonly string[]): Promise<SecretLookup> {
			try {
				const response = await fetch(location.origin + SECRETS_PATH, {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({ refs })
				});
				if (response.status === 404) return { kind: "stale" };
				let payload: unknown = null;
				try {
					payload = await response.json();
				} catch {
					payload = null;
				}
				const body = isRecord(payload) ? payload : undefined;
				if (!response.ok) {
					return { kind: "error", message: readProbeMessage(body) ?? `HTTP ${response.status}` };
				}
				const values: Record<string, string> = {};
				const missing: string[] = [];
				const rawValues = body?.values;
				for (const ref of refs) {
					const entry = isRecord(rawValues) ? rawValues[ref] : undefined;
					if (typeof entry === "string" && entry.length > 0) values[ref] = entry;
					else missing.push(ref);
				}
				const rawRefused = body?.refused;
				const refused = Array.isArray(rawRefused)
					? rawRefused.filter((entry): entry is string => typeof entry === "string")
					: [];
				return { kind: "ok", values, missing, refused };
			} catch (error) {
				return { kind: "error", message: messageOf(error) };
			}
		}

		/* ------------------------------------------------------------ import helpers */

		/** The shape a credential reference name has to have to be storable. */
		const KEY_REF_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

		/**
		 * Above this many characters the dialog stops parsing and asks for a file
		 * instead: the text is re-read on every keystroke, and a multi-megabyte
		 * paste would make the page stutter for no benefit.
		 */
		const IMPORT_MAX_CHARS = 1_000_000;

		/** The document an empty box stands for: nothing to read, nothing to report. */
		function emptyImportDocument(): ImportDocument {
			return { format: "json", entries: [], keys: [], error: null };
		}

		/**
		 * Display copy for a document-level read failure. The parser reports a
		 * stable code for its own failures and a thrown message for `JSON.parse`,
		 * so anything unrecognized is shown verbatim rather than swallowed.
		 * @param code - the parser's code or a thrown message.
		 * @param t - the bound dictionary lookup.
		 * @returns the sentence to show.
		 */
		function importErrorText(code: string, t: Translate): string {
			if (code === "empty") return t("importErrEmpty");
			if (code === "no-providers") return t("importErrNoProviders");
			if (code === "no-keys") return t("importErrNoKeys");
			if (code === "bad-shape") return t("importErrShape");
			if (code === "not-a-mapping") return t("importErrMapping");
			if (code === "too-large") return t("importErrTooLarge");
			if (
				code === "tab-indent" || code === "bad-indent" || code === "trailing"
				|| code === "unexpected-end" || code === "bad-key" || code === "bad-scalar"
			) {
				return t("importErrYaml");
			}
			return fill(t("importErrParse"), { message: code });
		}

		/**
		 * Read the YAML subset this plugin's own exporter emits: block mappings,
		 * block sequences, full-line comments, and JSON-quoted or bare scalars.
		 * Flow collections other than the empty `[]` / `{}` are reported as
		 * unsupported instead of guessed at, so a hand-edited document fails
		 * loudly rather than importing a half-read profile.
		 * @param text - the YAML text.
		 * @returns the parsed root value, or the reason it left the subset.
		 */
		function parseYamlSubset(text: string): YamlParse {
			const lines: YamlLine[] = [];
			for (const raw of text.split(/\r?\n/)) {
				if (/^\s*$/.test(raw) || /^\s*#/.test(raw)) continue;
				const match = /^([ \t]*)([\s\S]*?)\s*$/.exec(raw);
				if (match === null) continue;
				const pad = match[1] ?? "";
				if (pad.includes("\t")) return { value: undefined, error: "tab-indent" };
				lines.push({ indent: pad.length, text: match[2] ?? "" });
			}
			if (lines.length === 0) return { value: undefined, error: "empty" };
			const state: YamlState = { lines, index: 0 };
			const parsed = parseYamlBlock(state, lines[0]?.indent ?? 0);
			if (parsed.error !== null) return parsed;
			if (state.index !== lines.length) return { value: undefined, error: "trailing" };
			return parsed;
		}

		/** Parse one block: a sequence when the line starts with a dash, else a mapping. */
		function parseYamlBlock(state: YamlState, indent: number): YamlParse {
			const line = state.lines[state.index];
			if (line === undefined) return { value: undefined, error: "unexpected-end" };
			if (line.indent !== indent) return { value: undefined, error: "bad-indent" };
			if (line.text === "-" || line.text.startsWith("- ")) return parseYamlSequence(state, indent);
			return parseYamlMapping(state, indent);
		}

		/** Parse a `-` block at one indentation level. */
		function parseYamlSequence(state: YamlState, indent: number): YamlParse {
			const items: JsonValue[] = [];
			for (;;) {
				const line = state.lines[state.index];
				if (line === undefined || line.indent !== indent) break;
				if (line.text !== "-" && !line.text.startsWith("- ")) break;
				const inline = line.text === "-" ? "" : line.text.slice(2).trim();
				state.index += 1;
				if (inline.length === 0) {
					const next = state.lines[state.index];
					if (next === undefined || next.indent <= indent) {
						items.push(null);
						continue;
					}
					const nested = parseYamlBlock(state, next.indent);
					if (nested.error !== null) return nested;
					items.push(nested.value ?? null);
					continue;
				}
				/*
				 * `- key: value` starts a mapping on the dash line. Expanding it into
				 * a synthetic line one level in lets the one mapping parser handle
				 * both the inline entry and any keys that follow it.
				 */
				if (splitYamlEntry(inline) !== null) {
					const childIndent = indent + 2;
					state.lines.splice(state.index, 0, { indent: childIndent, text: inline });
					const nested = parseYamlBlock(state, childIndent);
					if (nested.error !== null) return nested;
					items.push(nested.value ?? null);
					continue;
				}
				const scalar = parseYamlScalar(inline);
				if (scalar.error !== null) return scalar;
				items.push(scalar.value ?? null);
			}
			return { value: items, error: null };
		}

		/** Parse a `key: value` block at one indentation level. */
		function parseYamlMapping(state: YamlState, indent: number): YamlParse {
			const value: JsonObject = {};
			for (;;) {
				const line = state.lines[state.index];
				if (line === undefined || line.indent !== indent) break;
				if (line.text === "-" || line.text.startsWith("- ")) break;
				const split = splitYamlEntry(line.text);
				if (split === null) return { value: undefined, error: "bad-key" };
				state.index += 1;
				if (split.rest.length === 0) {
					const next = state.lines[state.index];
					if (next === undefined || next.indent <= indent) {
						value[split.key] = null;
						continue;
					}
					const nested = parseYamlBlock(state, next.indent);
					if (nested.error !== null) return nested;
					value[split.key] = nested.value ?? null;
					continue;
				}
				const scalar = parseYamlScalar(split.rest);
				if (scalar.error !== null) return scalar;
				value[split.key] = scalar.value ?? null;
			}
			return { value, error: null };
		}

		/**
		 * Split `key: rest` at the key separator, unquoting a quoted key. The
		 * separator is the first `:` that ends the line or is followed by a space,
		 * so a plain key may itself contain `:` and spaces, exactly as YAML reads it.
		 */
		function splitYamlEntry(text: string): { key: string; rest: string } | null {
			if (text.startsWith("\"")) {
				let end = -1;
				for (let index = 1; index < text.length; index += 1) {
					const char = text[index];
					if (char === "\\") {
						index += 1;
						continue;
					}
					if (char === "\"") {
						end = index;
						break;
					}
				}
				if (end < 0) return null;
				let key: unknown;
				try {
					key = JSON.parse(text.slice(0, end + 1));
				} catch {
					return null;
				}
				if (typeof key !== "string") return null;
				const after = text.slice(end + 1).trim();
				if (after === ":") return { key, rest: "" };
				if (after.startsWith(": ")) return { key, rest: after.slice(2).trim() };
				return null;
			}
			let at = -1;
			for (let index = 0; index < text.length; index += 1) {
				if (text[index] !== ":") continue;
				const next = text[index + 1];
				if (next === undefined || next === " ") {
					at = index;
					break;
				}
			}
			if (at <= 0) return null;
			const key = text.slice(0, at).trim();
			if (key.length === 0) return null;
			return { key, rest: text.slice(at + 1).trim() };
		}

		/** Read one scalar: the empty containers, JSON-quoted strings, or a bare token. */
		function parseYamlScalar(text: string): YamlParse {
			if (text === "[]") return { value: [], error: null };
			if (text === "{}") return { value: {}, error: null };
			if (text === "null" || text === "~") return { value: null, error: null };
			if (text === "true") return { value: true, error: null };
			if (text === "false") return { value: false, error: null };
			if (text.startsWith("\"")) {
				let parsed: unknown;
				try {
					parsed = JSON.parse(text);
				} catch {
					return { value: undefined, error: "bad-scalar" };
				}
				if (typeof parsed !== "string") return { value: undefined, error: "bad-scalar" };
				return { value: parsed, error: null };
			}
			/* An unquoted `a: b` would be a nested mapping, which this subset does not emit. */
			if (text.includes(": ") || text.endsWith(":")) return { value: undefined, error: "bad-scalar" };
			if (/^[-+]?\d+(?:\.\d+)?(?:[eE][-+]?\d+)?$/.test(text)) {
				const number = Number(text);
				if (Number.isFinite(number)) return { value: number, error: null };
			}
			return { value: text, error: null };
		}

		/** The format a document is read as when the dialog is set to detect it. */
		function sniffImportFormat(text: string): "json" | "yaml" | "env" {
			const first = text[0];
			if (first === "{" || first === "[") return "json";
			for (const raw of text.split(/\r?\n/)) {
				const line = raw.trim();
				if (line.length === 0 || line.startsWith("#")) continue;
				return /^[A-Za-z_][A-Za-z0-9_]*\s*=/.test(line) ? "env" : "yaml";
			}
			return "yaml";
		}

		/** Read the whole document in the chosen (or detected) format. */
		function parseImportDocument(text: string, format: ImportFormat): ImportDocument {
			if (text.trim().length === 0) return { format: "json", entries: [], keys: [], error: "empty" };
			const chosen = format === "auto" ? sniffImportFormat(text) : format;
			if (chosen === "env") return parseEnvDocument(text);
			if (chosen === "json") return parseJsonDocument(text);
			const parsed = parseYamlSubset(text);
			if (parsed.error !== null) return { format: "yaml", entries: [], keys: [], error: parsed.error };
			return yamlDocumentOf(parsed.value);
		}

		/** Read a `.env` document: `REF=value` lines, comments ignored. */
		function parseEnvDocument(text: string): ImportDocument {
			const keys: Array<{ ref: string; value: string }> = [];
			for (const raw of text.split(/\r?\n/)) {
				const line = raw.trim();
				if (line.length === 0 || line.startsWith("#")) continue;
				const at = line.indexOf("=");
				if (at <= 0) continue;
				const ref = line.slice(0, at).trim();
				const value = line.slice(at + 1).trim();
				if (!KEY_REF_PATTERN.test(ref) || value.length === 0) continue;
				keys.push({ ref, value });
			}
			return { format: "env", entries: [], keys, error: keys.length === 0 ? "no-keys" : null };
		}

		/** Read the JSON export shape: a document, an array of records, or one record. */
		function parseJsonDocument(text: string): ImportDocument {
			let parsed: unknown;
			try {
				parsed = JSON.parse(text);
			} catch (error) {
				return { format: "json", entries: [], keys: [], error: messageOf(error) };
			}
			let records: unknown[] | null = null;
			if (Array.isArray(parsed)) records = parsed;
			else if (isRecord(parsed)) {
				const list = parsed["providers"];
				records = Array.isArray(list) ? list : [parsed];
			}
			if (records === null) return { format: "json", entries: [], keys: [], error: "bad-shape" };
			const entries: ImportEntry[] = [];
			for (const record of records) {
				if (!isRecord(record)) continue;
				const entry = importEntryOfRecord(record);
				if (entry !== null) entries.push(entry);
			}
			return { format: "json", entries, keys: [], error: entries.length === 0 ? "no-providers" : null };
		}

		/** One JSON export record as an import entry, tolerating a missing profile. */
		function importEntryOfRecord(record: Record<string, unknown>): ImportEntry | null {
			const provider = typeof record["provider"] === "string" && record["provider"].length > 0 ? record["provider"] : null;
			const settingsNs = typeof record["settingsNs"] === "string" && record["settingsNs"].length > 0 ? record["settingsNs"] : null;
			if (settingsNs === null) return null;
			const rawPath = record["settingsPath"];
			const settingsPath = Array.isArray(rawPath)
				? rawPath.filter((part): part is string => typeof part === "string")
				: provider === null
					? []
					: ["providers", provider];
			const rawProfile = record["profile"];
			let profile: JsonObject;
			if (isRecord(rawProfile)) profile = (cloneJson(rawProfile as JsonValue) ?? {}) as JsonObject;
			else {
				/* An older or hand-written record: rebuild the profile from its summary fields. */
				const rebuilt: JsonObject = {};
				for (const key of ["api", "baseURL", "displayName", "apiKeyEnv"]) {
					const value = record[key];
					if (typeof value === "string" && value.length > 0) rebuilt[key] = value;
				}
				if (Array.isArray(record["models"])) rebuilt["models"] = cloneJson(record["models"] as JsonValue) ?? [];
				if (Object.keys(rebuilt).length === 0) return null;
				profile = rebuilt;
			}
			const declared = profile["apiKeyEnv"];
			const apiKeyEnv = typeof record["apiKeyEnv"] === "string" && record["apiKeyEnv"].length > 0
				? record["apiKeyEnv"]
				: typeof declared === "string" && declared.length > 0
					? declared
					: null;
			const apiKey = typeof record["apiKey"] === "string" && record["apiKey"].length > 0 ? record["apiKey"] : null;
			return { provider, settingsNs, settingsPath, profile, apiKeyEnv, apiKey };
		}

		/** Read a YAML configuration snippet: namespace → providers → route → profile. */
		function yamlDocumentOf(value: JsonValue | undefined): ImportDocument {
			if (!isJsonObject(value)) return { format: "yaml", entries: [], keys: [], error: "not-a-mapping" };
			const entries: ImportEntry[] = [];
			for (const [ns, section] of Object.entries(value)) {
				if (!isJsonObject(section)) continue;
				const providers = section["providers"];
				if (isJsonObject(providers)) {
					for (const [route, profile] of Object.entries(providers)) {
						if (!isJsonObject(profile)) continue;
						entries.push(importEntryOfProfile(ns, ["providers", route], route, profile));
					}
					continue;
				}
				/* No providers map: the whole section is one provider's profile. */
				entries.push(importEntryOfProfile(ns, [], null, section));
			}
			return { format: "yaml", entries, keys: [], error: entries.length === 0 ? "no-providers" : null };
		}

		/** One profile at a known path, as an import entry. */
		function importEntryOfProfile(
			ns: string,
			path: readonly string[],
			provider: string | null,
			profile: JsonObject
		): ImportEntry {
			const copy = cloneJson(profile);
			const body = isJsonObject(copy) ? copy : {};
			const declared = body["apiKeyEnv"];
			return {
				provider,
				settingsNs: ns,
				settingsPath: [...path],
				profile: body,
				apiKeyEnv: typeof declared === "string" && declared.length > 0 ? declared : null,
				apiKey: null
			};
		}

		/** The route a namespace's root profile belongs to, from the live configuration. */
		function rowRouteFor(rows: readonly ProviderRow[], ns: string): string | null {
			for (const row of rows) {
				if (row.settingsNs === ns && row.settingsPath.length === 0) return row.provider;
			}
			return null;
		}

		/**
		 * Match a parsed document against the live configuration: resolve the route
		 * a section-level profile belongs to, drop the impossible entries with a
		 * reason, and mark the ones that would replace something that exists.
		 * Duplicate targets collapse to the last entry, which is the one the write
		 * order would leave in place.
		 * @param document - the parsed document.
		 * @param context - the live rows and a namespace-section lookup.
		 * @returns one candidate per target, in document order.
		 */
		function planImport(document: ImportDocument, context: ImportContext): ImportCandidate[] {
			const planned = new Map<string, ImportCandidate>();
			for (const entry of document.entries) {
				const provider = entry.provider ?? rowRouteFor(context.rows, entry.settingsNs);
				const section = context.sectionOf(entry.settingsNs);
				const models = entry.profile["models"];
				const problem: ImportProblem | null = provider === null
					? { code: "unknownProvider" }
					: !ROUTE_PATTERN.test(provider)
						? { code: "badRoute", route: provider }
						: section === undefined
							? { code: "noNamespace", ns: entry.settingsNs }
							: Array.isArray(models) && models.length === 0
								? { code: "noModels" }
								: null;
				const existing = getPath(section, entry.settingsPath);
				const overwrite = entry.settingsPath.length === 0
					? isJsonObject(section) && Object.keys(section).length > 0
					: existing !== undefined;
				const declared = entry.profile["displayName"];
				const displayName = typeof declared === "string" && declared.length > 0
					? declared
					: provider ?? entry.settingsNs;
				planned.set(
					`${entry.settingsNs}\u0000${entry.settingsPath.join("\u0000")}`,
					{
						...entry,
						provider,
						displayName,
						modelCount: Array.isArray(models) ? models.length : 0,
						overwrite,
						problem
					}
				);
			}
			return Array.from(planned.values());
		}

		/**
		 * The credential writes an import performs: keys carried by the document's
		 * own records first, then any `.env` lines, which win because they are the
		 * document's explicit statement about that reference.
		 */
		function importKeyWrites(
			document: ImportDocument,
			candidates: readonly ImportCandidate[]
		): Array<{ ref: string; value: string }> {
			const writes: Array<{ ref: string; value: string }> = [];
			const push = (ref: string, value: string): void => {
				if (!KEY_REF_PATTERN.test(ref) || value.length === 0) return;
				const at = writes.findIndex((entry) => entry.ref === ref);
				if (at >= 0) writes[at] = { ref, value };
				else writes.push({ ref, value });
			};
			for (const candidate of candidates) {
				if (candidate.problem !== null || candidate.apiKey === null) continue;
				const ref = candidate.apiKeyEnv
					?? (candidate.provider === null ? null : deriveKeyRef(candidate.provider));
				if (ref !== null) push(ref, candidate.apiKey);
			}
			for (const entry of document.keys) push(entry.ref, entry.value);
			return writes;
		}

		/** How many candidates an import would add, replace, or has to skip. */
		function importSummary(candidates: readonly ImportCandidate[]): {
			add: number;
			replace: number;
			blocked: number;
			models: number;
		} {
			let add = 0;
			let replace = 0;
			let blocked = 0;
			let models = 0;
			for (const candidate of candidates) {
				if (candidate.problem !== null) {
					blocked += 1;
					continue;
				}
				if (candidate.overwrite) replace += 1;
				else add += 1;
				models += candidate.modelCount;
			}
			return { add, replace, blocked, models };
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
					const [exporting, setExporting] = React.useState<ExportTarget | null>(null);
					const [exportPicked, setExportPicked] = React.useState<Set<string>>(new Set());
					const [exportFormat, setExportFormat] = React.useState<ExportFormat>("json");
					const [includeKey, setIncludeKey] = React.useState(true);
					const [exportCopy, setExportCopy] = React.useState<"idle" | "ok" | "fail">("idle");
					const [secrets, setSecrets] = React.useState<ExportState>({
						status: "idle",
						values: {},
						missing: [],
						refused: [],
						error: null
					});
					const exportTextRef = React.useRef<HTMLTextAreaElement | null>(null);
					const [importing, setImporting] = React.useState(false);
					const [importText, setImportText] = React.useState("");
					const [importFormat, setImportFormat] = React.useState<ImportFormat>("auto");
					const [importIncludeKeys, setImportIncludeKeys] = React.useState(true);
					const [importBusy, setImportBusy] = React.useState(false);
					const [importError, setImportError] = React.useState<string | null>(null);
					const importFileRef = React.useRef<HTMLInputElement | null>(null);

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

					/**
					 * Turn reasoning effort on or off for exactly one model row of a
					 * hand-declared provider. On writes the standard OpenAI-compatible
					 * level map; off writes `false` so the adapter pins the model as
					 * non-reasoning instead of falling back to catalog defaults.
					 */
					const toggleReasoning = async (row: ProviderRow, index: number): Promise<void> => {
						const source = row.models[index];
						if (source === undefined) return;
						const nextModel: ModelRow = { ...source };
						nextModel.reasoningEfforts = reasoningOnOf(source)
							? false
							: { ...REASONING_EFFORTS_ON };
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
					 * Resolve the credential references the rows declare, through the
					 * Host half. Changing the provider selection fires another lookup, so
					 * a sequence number keeps a slow earlier answer from overwriting the
					 * values of the selection the user actually has now.
					 */
					const exportSecretSeq = React.useRef(0);
					const loadExportSecrets = async (rows: readonly ProviderRow[]): Promise<void> => {
						const seq = exportSecretSeq.current + 1;
						exportSecretSeq.current = seq;
						const refs = keyRefsOf(rows);
						if (refs.length === 0) {
							setSecrets({ status: "ready", values: {}, missing: [], refused: [], error: null });
							return;
						}
						setSecrets({ status: "loading", values: {}, missing: [], refused: [], error: null });
						const answer = await fetchSecrets(refs);
						if (exportSecretSeq.current !== seq) return;
						if (answer.kind === "stale") {
							setSecrets({ status: "error", values: {}, missing: [], refused: [], error: t("exportHostStale") });
							return;
						}
						if (answer.kind === "error") {
							setSecrets({
								status: "error",
								values: {},
								missing: [],
								refused: [],
								error: fill(t("exportKeyFailed"), { message: answer.message })
							});
							return;
						}
						setSecrets({
							status: "ready",
							values: answer.values,
							missing: answer.missing,
							refused: answer.refused,
							error: null
						});
					};

					/**
					 * Open the export dialog. The whole list is the pool (so the selection
					 * can be widened), while `picked` seeds what is ticked: one provider
					 * from a card's own button, everything from the toolbar.
					 */
					const startExport = (rows: readonly ProviderRow[], picked?: readonly string[]): void => {
						if (rows.length === 0) return;
						const wanted = new Set(picked ?? rows.map((row) => row.provider));
						const chosen = rows.filter((row) => wanted.has(row.provider));
						const selected = chosen.length > 0 ? chosen : [...rows];
						setExporting({ rows: [...rows], at: new Date().toISOString() });
						setExportPicked(new Set(selected.map((row) => row.provider)));
						setExportFormat("json");
						setIncludeKey(true);
						setExportCopy("idle");
						setSecrets({ status: "idle", values: {}, missing: [], refused: [], error: null });
						void loadExportSecrets(selected);
					};

					/** Close the export dialog and drop its transient lookup state. */
					const closeExport = (): void => {
						exportSecretSeq.current += 1;
						setExporting(null);
						setExportPicked(new Set());
						setExportCopy("idle");
						setSecrets({ status: "idle", values: {}, missing: [], refused: [], error: null });
					};

					/**
					 * Copy the rendered export. The async clipboard is preferred; a
					 * selection of the read-only preview is the fallback for the
					 * contexts where the API is unavailable or refused.
					 */
					const copyExport = async (text: string): Promise<void> => {
						try {
							if (typeof navigator !== "undefined" && navigator.clipboard !== undefined) {
								await navigator.clipboard.writeText(text);
								setExportCopy("ok");
								return;
							}
						} catch {
							/* fall through to the selection fallback */
						}
						const node = exportTextRef.current;
						if (node === null) {
							setExportCopy("fail");
							return;
						}
						node.focus();
						node.select();
						let copied = false;
						try {
							copied = typeof document.execCommand === "function" && document.execCommand("copy");
						} catch {
							copied = false;
						}
						setExportCopy(copied ? "ok" : "fail");
					};

					/** Open the import dialog, empty. */
					const startImport = (): void => {
						setImporting(true);
						setImportText("");
						setImportFormat("auto");
						setImportIncludeKeys(true);
						setImportBusy(false);
						setImportError(null);
					};

					/** Close the import dialog and drop its transient state. */
					const closeImport = (): void => {
						setImporting(false);
						setImportBusy(false);
						setImportError(null);
					};

					/** Read one picked file into the paste box. */
					const pickImportFile = async (file: File | undefined): Promise<void> => {
						if (file === undefined) return;
						try {
							setImportText(await file.text());
							setImportError(null);
						} catch (error) {
							setImportError(fill(t("importReadFailed"), { message: messageOf(error) }));
						}
					};

					/**
					 * Write the planned providers and then the keys the document
					 * carried. Providers are grouped per namespace so each namespace is
					 * one revision-checked write; a namespace that refuses is reported
					 * and the others still go through. The dialog stays open while
					 * anything failed, so the reasons are readable.
					 * @param candidates - the planned entries.
					 * @param keys - credential writes to perform after the profiles land.
					 */
					const applyImport = async (
						candidates: readonly ImportCandidate[],
						keys: ReadonlyArray<{ ref: string; value: string }>
					): Promise<void> => {
						const ready = candidates.filter((candidate) => candidate.problem === null);
						if (ready.length === 0 && keys.length === 0) return;
						setImportBusy(true);
						setImportError(null);
						try {
							const byNamespace = new Map<string, ImportCandidate[]>();
							for (const candidate of ready) {
								const list = byNamespace.get(candidate.settingsNs);
								if (list === undefined) byNamespace.set(candidate.settingsNs, [candidate]);
								else list.push(candidate);
							}
							let written = 0;
							const failures: string[] = [];
							for (const [ns, list] of byNamespace) {
								const namespace = state.namespaces.get(ns);
								if (namespace === undefined) {
									failures.push(fill(t("importNsFailed"), { ns, message: t("noNamespace") }));
									continue;
								}
								const ops: SettingsPathOp[] = list.map((candidate) => ({
									op: "set",
									path: [...candidate.settingsPath],
									value: candidate.profile
								}));
								let response: RemoteResult<SettingsNamespaceView>;
								try {
									response = await ctx.remote.settings.mutate(ns, ops, namespace.revision);
								} catch (error) {
									failures.push(fill(t("importNsFailed"), { ns, message: messageOf(error) }));
									continue;
								}
								if (!response.ok) {
									const message = response.error.code === "settings/conflict"
										? t("conflict")
										: response.error.message;
									failures.push(fill(t("importNsFailed"), { ns, message }));
									continue;
								}
								written += list.length;
							}
							let stored = 0;
							if (importIncludeKeys && ctx.remote.credentials !== undefined) {
								for (const entry of keys) {
									try {
										const answer = await ctx.remote.credentials.set(entry.ref, entry.value);
										if (answer.ok) stored += 1;
										else failures.push(fill(t("importKeyFailed"), { ref: entry.ref, message: answer.error.message }));
									} catch (error) {
										failures.push(fill(t("importKeyFailed"), { ref: entry.ref, message: messageOf(error) }));
									}
								}
							}
							await load();
							if (failures.length === 0) {
								setImporting(false);
								setImportError(null);
								setFlash(fill(t("importedFlash"), { count: String(written), keys: String(stored) }));
								return;
							}
							setImportError(failures.join("\n"));
						} finally {
							setImportBusy(false);
						}
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
							models: [{ id: "", name: "", vision: true, reasoning: false }]
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

					/**
					 * Map the adapter's English validation failures onto the page's
					 * language; anything unrecognized passes through untouched.
					 */
					const translateRowError = (message: string | undefined): string | undefined => {
						if (message === undefined) return undefined;
						if (message.includes("resolves no models")) return t("lastModelGuard");
						return message;
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
								vision: Array.isArray(model.inputModalities) && model.inputModalities.includes("image"),
								reasoning: false
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
									input: model.vision ? ["text", "image"] : ["text"],
									...(model.reasoning
										? { reasoningEfforts: { ...REASONING_EFFORTS_ON } }
										: { reasoningEfforts: false })
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
									row.settingsPath.length > 0 ? (() => {
										const reasoning = reasoningOnOf(model);
										return [
											reasoning ? h("span", { className: "mcf-tag", key: "rtag" }, t("reasoningOn")) : null,
											h("span", { className: "mcf-switchWrap", key: "rswitch" },
												h("span", { className: "mcf-switchLabel" }, t("reasoning")),
												h("button", {
													type: "button",
													role: "switch",
													"aria-checked": reasoning,
													className: "mcf-switch",
													disabled: !editable || busy[row.provider] === true,
													"aria-label": fill(t("reasoningLabel"), { model: id }),
													onClick: () => void toggleReasoning(row, index)
												}, h("span", { className: "mcf-switchThumb" }))
											)
										];
									})() : null,
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
										disabled: busy[row.provider] === true
											|| (row.settingsPath.length > 0 && row.models.length <= 1),
										title: row.settingsPath.length > 0 && row.models.length <= 1
											? t("lastModelGuard")
											: t("deleteModel"),
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
									h("button", {
										type: "button",
										className: "mcf-btn mcf-btnSm",
										"aria-label": `${t("exportLabel")} ${providerName}`,
										onClick: () => startExport(state.rows, [row.provider])
									}, t("exportLabel")),
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
							row.directoryError === undefined ? null : h("p", { className: "mcf-error" }, translateRowError(row.directoryError)),
							row.models.length === 0
								? h("p", { className: "mcf-status" }, t("modelsEmpty"))
								: h("ul", { className: "mcf-models" }, row.models.map((model, index) => renderModel(row, model, index))),
							rowError[row.provider] === undefined ? null : h("p", { className: "mcf-error" }, translateRowError(rowError[row.provider]))
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

						if (importing) {
							const document = importText.trim().length === 0
								? emptyImportDocument()
								: importText.length > IMPORT_MAX_CHARS
									? { format: "json" as const, entries: [], keys: [], error: "too-large" }
									: parseImportDocument(importText, importFormat);
							const candidates = planImport(document, {
								rows: state.rows,
								sectionOf: (ns: string): JsonValue | undefined => {
									const namespace = state.namespaces.get(ns);
									return namespace === undefined ? undefined : namespace.value ?? {};
								}
							});
							const summary = importSummary(candidates);
							const keys = importIncludeKeys ? importKeyWrites(document, candidates) : [];
							const ready = summary.add + summary.replace;
							const problemText = (problem: ImportProblem): string => {
								if (problem.code === "unknownProvider") return t("importUnknownProvider");
								if (problem.code === "badRoute") return fill(t("importBadRoute"), { route: problem.route });
								if (problem.code === "noNamespace") return fill(t("importNoNamespace"), { ns: problem.ns });
								return t("importNoModels");
							};
							return h("div", {
								className: "mcf-overlay",
								onClick: (event: import("react").MouseEvent<HTMLDivElement>) => {
									if (event.target === event.currentTarget && !importBusy) closeImport();
								}
							},
								h("div", {
									className: "mcf-modal mcf-modalFixed mcf-modalWide",
									role: "dialog",
									"aria-modal": "true",
									"aria-labelledby": "mcf-import-title"
								},
									h("div", { className: "mcf-modalHead" },
										h("div", null,
											h("h2", { className: "mcf-modalTitle", id: "mcf-import-title" }, t("importTitle")),
											h("p", { className: "mcf-modalSub" }, t("importSub"))
										),
										h("button", {
											type: "button",
											className: "mcf-btn mcf-btnSm mcf-iconBtn",
											"aria-label": t("close"),
											title: t("close"),
											disabled: importBusy,
											onClick: closeImport
										}, h(CloseIcon, {}))
									),
									h("div", { className: "mcf-modalBody" },
										h("div", { className: "mcf-exportOpts" },
											h("label", { className: "mcf-field" },
												h("span", null, t("importFormat")),
												h("select", {
													className: "mcf-input mcf-exportSelect",
													value: importFormat,
													"aria-label": t("importFormat"),
													onChange: (event: import("react").ChangeEvent<HTMLSelectElement>) => {
														const next = event.target.value;
														setImportFormat(next === "json" ? "json" : next === "yaml" ? "yaml" : next === "env" ? "env" : "auto");
													}
												},
													h("option", { value: "auto" }, t("importFormatAuto")),
													h("option", { value: "json" }, t("importFormatJson")),
													h("option", { value: "yaml" }, t("importFormatYaml")),
													h("option", { value: "env" }, t("importFormatEnv"))
												)
											),
											h("button", {
												type: "button",
												className: "mcf-btn mcf-btnSm",
												onClick: () => importFileRef.current?.click()
											}, t("importPickFile")),
											h("input", {
												ref: importFileRef,
												className: "mcf-importFile",
												type: "file",
												accept: ".json,.yaml,.yml,.env,.txt,application/json,text/plain",
												"aria-label": t("importPickFile"),
												onChange: (event: import("react").ChangeEvent<HTMLInputElement>) => {
													const file = event.target.files?.[0];
													event.target.value = "";
													void pickImportFile(file);
												}
											})
										),
										h("textarea", {
											className: "mcf-exportText",
											value: importText,
											placeholder: t("importPlaceholder"),
											"aria-label": t("importTitle"),
											spellCheck: false,
											onChange: (event: import("react").ChangeEvent<HTMLTextAreaElement>) => {
												setImportText(event.target.value);
												setImportError(null);
											}
										}),
										!state.writable ? h("p", { className: "mcf-exportWarn" }, t("importReadOnly")) : null,
										document.error === null ? null
											: h("p", { className: "mcf-exportWarn", role: "status" }, importErrorText(document.error, t)),
										document.error === null && candidates.length > 0
											? h("p", { className: "mcf-importReason" },
												fill(t("importScope"), {
													add: String(summary.add),
													replace: String(summary.replace),
													skipped: String(summary.blocked),
													models: String(summary.models)
												}))
											: null,
										candidates.length === 0 ? null : h("ul", { className: "mcf-importList" },
											candidates.map((candidate, index) => h("li", {
												className: "mcf-importItem",
												key: `${candidate.settingsNs}/${candidate.settingsPath.join("/")}/${String(index)}`
											},
												h("span", { className: "mcf-importName" }, candidate.displayName),
												h("span", { className: "mcf-importMeta", title: candidate.settingsNs },
													candidate.problem === null
														? `${candidate.provider ?? "?"} · ${candidate.settingsNs} · ${String(candidate.modelCount)}`
														: problemText(candidate.problem)
												),
												h("span", {
													className: candidate.problem !== null
														? "mcf-importBadge mcf-importBadgeSkip"
														: candidate.overwrite
															? "mcf-importBadge mcf-importBadgeReplace"
															: "mcf-importBadge mcf-importBadgeNew"
												}, candidate.problem !== null ? t("importSkip") : candidate.overwrite ? t("importReplace") : t("importNew"))
											))
										),
										summary.replace > 0
											? h("p", { className: "mcf-exportNote" }, t("importReplaceWarn"))
											: null,
										document.error !== null ? null
											: document.keys.length === 0 && !document.entries.some((entry) => entry.apiKey !== null)
												? h("p", { className: "mcf-exportNote" }, t("importKeysNone"))
												: h("div", null,
													h("label", { className: "mcf-skipRow" },
														h("input", {
															className: "mcf-check",
															type: "checkbox",
															checked: importIncludeKeys,
															onChange: (event: import("react").ChangeEvent<HTMLInputElement>) => {
																setImportIncludeKeys(event.target.checked);
															}
														}),
														t("importIncludeKeys")
													),
													importIncludeKeys
														? h("p", { className: "mcf-exportNote" }, fill(t("importKeysLine"), { count: String(keys.length) }))
														: null
												),
										importError === null ? null : h("p", {
											className: "mcf-importError",
											role: "alert"
										}, importError)
									),
									h("div", { className: "mcf-modalFoot" },
										h("button", {
											type: "button",
											className: "mcf-btn",
											disabled: importBusy,
											onClick: closeImport
										}, t("close")),
										h("button", {
											type: "button",
											className: "mcf-btn mcf-btnPrimary",
											disabled: importBusy || ready === 0 || !state.writable,
											onClick: () => {
												void applyImport(candidates, keys);
											}
										}, importBusy ? t("importBusy") : fill(t("importApply"), { count: String(ready) }))
									)
								)
							);
						}

						if (exporting !== null) {
							const target = exporting;
							const rows = target.rows;
							const pickedRows = rows.filter((row) => exportPicked.has(row.provider));
							const single = pickedRows.length === 1 ? pickedRows[0] : undefined;
							const title = single !== undefined
								? fill(t("exportTitleOne"), { provider: providerNameOf(single) })
								: pickedRows.length === rows.length
									? t("exportTitleAll")
									: fill(t("exportTitlePicked"), { count: String(pickedRows.length) });
							const modelTotal = pickedRows.reduce((total, row) => total + row.models.length, 0);
							const refs = keyRefsOf(pickedRows);
							const text = renderExport(exportFormat, pickedRows, secrets.values, includeKey, target.at);
							/** Tick a provider on or off and refresh the keys the selection declares. */
							const applyPick = (next: Set<string>): void => {
								setExportPicked(next);
								setExportCopy("idle");
								const chosen = rows.filter((row) => next.has(row.provider));
								if (includeKey) void loadExportSecrets(chosen);
							};
							const notes: ReactNode[] = [];
							if (pickedRows.length > 0 && refs.length === 0) {
								notes.push(h("p", { className: "mcf-exportNote", key: "none" }, t("exportRefsNone")));
							}
							if (includeKey && secrets.status === "loading") {
								notes.push(h("p", { className: "mcf-exportNote", key: "loading" }, t("exportKeyLoading")));
							}
							if (includeKey && secrets.error !== null) {
								notes.push(h("p", { className: "mcf-exportWarn", key: "error" }, secrets.error));
							}
							if (includeKey && secrets.missing.length > 0) {
								notes.push(h("p", { className: "mcf-exportNote", key: "missing" },
									fill(t("exportKeyMissing"), { refs: secrets.missing.join(", ") })));
							}
							if (includeKey && secrets.refused.length > 0) {
								notes.push(h("p", { className: "mcf-exportNote", key: "refused" },
									fill(t("exportKeyRefused"), { refs: secrets.refused.join(", ") })));
							}
							if (!includeKey) {
								notes.push(h("p", { className: "mcf-exportNote", key: "off" }, t("exportKeyOff")));
							}
							const keyIncluded = includeKey && secrets.status === "ready" && Object.keys(secrets.values).length > 0;
							return h("div", {
								className: "mcf-overlay",
								onClick: (event: import("react").MouseEvent<HTMLDivElement>) => {
									if (event.target === event.currentTarget) closeExport();
								}
							},
								h("div", {
									className: "mcf-modal mcf-modalFixed mcf-modalWide",
									role: "dialog",
									"aria-modal": "true",
									"aria-labelledby": "mcf-export-title"
								},
									h("div", { className: "mcf-modalHead" },
										h("div", null,
											h("h2", { className: "mcf-modalTitle", id: "mcf-export-title" }, title),
											h("p", { className: "mcf-modalSub" },
												`${fill(t("exportScope"), { count: String(pickedRows.length), models: String(modelTotal) })} · ${t("exportSub")}`)
										),
										h("button", {
											type: "button",
											className: "mcf-btn mcf-btnSm mcf-iconBtn",
											"aria-label": t("close"),
											title: t("close"),
											onClick: closeExport
										}, h(CloseIcon, {}))
									),
									h("div", { className: "mcf-modalBody" },
										h("div", { className: "mcf-exportOpts" },
											h("label", { className: "mcf-field" },
												h("span", null, t("exportFormat")),
												h("select", {
													className: "mcf-input mcf-exportSelect",
													value: exportFormat,
													"aria-label": t("exportFormat"),
													onChange: (event: import("react").ChangeEvent<HTMLSelectElement>) => {
														const next = event.target.value;
														setExportFormat(next === "yaml" ? "yaml" : next === "env" ? "env" : "json");
														setExportCopy("idle");
													}
												},
													h("option", { value: "json" }, t("exportFormatJson")),
													h("option", { value: "yaml" }, t("exportFormatYaml")),
													h("option", { value: "env", disabled: !includeKey }, t("exportFormatEnv"))
												)
											),
											h("label", { className: "mcf-rowCheck" },
												h("input", {
													className: "mcf-check",
													type: "checkbox",
													checked: includeKey,
													onChange: (event: import("react").ChangeEvent<HTMLInputElement>) => {
														const next = event.target.checked;
														setIncludeKey(next);
														setExportCopy("idle");
														if (!next && exportFormat === "env") setExportFormat("yaml");
														if (next && refs.length > 0 && secrets.status !== "loading") {
															void loadExportSecrets(pickedRows);
														}
													}
												}),
												t("exportIncludeKey")
											)
										),
										h("div", {
											className: "mcf-candidates",
											role: "group",
											"aria-label": t("exportPick")
										},
											h("div", { className: "mcf-candHead" },
												h("span", { className: "mcf-candName" },
													fill(t("exportPickCount"), { picked: String(pickedRows.length), total: String(rows.length) })),
												h("div", { className: "mcf-candActions" },
													h("button", {
														type: "button",
														className: "mcf-btn mcf-btnSm",
														onClick: () => applyPick(new Set(rows.map((row) => row.provider)))
													}, t("exportPickAll")),
													h("button", {
														type: "button",
														className: "mcf-btn mcf-btnSm",
														disabled: pickedRows.length === 0,
														onClick: () => applyPick(new Set<string>())
													}, t("exportPickNone"))
												)
											),
											h("div", { className: "mcf-pickList" },
												rows.map((row) => h("label", { className: "mcf-candRow", key: row.provider },
													h("input", {
														className: "mcf-check",
														type: "checkbox",
														checked: exportPicked.has(row.provider),
														onChange: (event: import("react").ChangeEvent<HTMLInputElement>) => {
															const next = new Set(exportPicked);
															if (event.target.checked) next.add(row.provider);
															else next.delete(row.provider);
															applyPick(next);
														}
													}),
													h("span", { className: "mcf-pickName" }, providerNameOf(row)),
													h("span", { className: "mcf-candId" }, row.provider),
													h("span", { className: "mcf-candName" },
														fill(t("exportPickModels"), { count: String(row.models.length) }))
												))
											)
										),
										pickedRows.length === 0
											? h("p", { className: "mcf-exportWarn" }, t("exportPickEmpty"))
											: null,
										...notes,
										keyIncluded ? h("p", { className: "mcf-exportWarn" }, t("exportWarning")) : null,
										h("textarea", {
											className: "mcf-exportText",
											ref: exportTextRef,
											readOnly: true,
											spellCheck: false,
											value: text,
											"aria-label": title,
											onFocus: (event: import("react").FocusEvent<HTMLTextAreaElement>) => event.currentTarget.select()
										})
									),
									h("div", { className: "mcf-modalFoot" },
										exportCopy === "ok"
											? h("span", { className: "mcf-copied", role: "status" }, t("exportCopied"))
											: exportCopy === "fail"
												? h("span", { className: "mcf-exportWarn", role: "status" }, t("exportCopyFailed"))
												: null,
										h("button", {
											type: "button",
											className: "mcf-btn",
											disabled: pickedRows.length === 0,
											onClick: () => void copyExport(text)
										}, t("exportCopy")),
										h("button", {
											type: "button",
											className: "mcf-btn mcf-btnPrimary",
											disabled: pickedRows.length === 0,
											onClick: () => {
												downloadText(exportFilename(pickedRows, exportFormat, target.at, rows.length), text, exportMime(exportFormat));
											}
										}, t("exportSave")),
										h("button", {
											type: "button",
											className: "mcf-btn",
											onClick: closeExport
										}, t("close"))
									)
								)
							);
						}

						if (confirming !== null) {
							const target = confirming;
							const row = state.rows.find((candidate) => candidate.provider === target.provider);
							const error = translateRowError(rowError[target.provider]);
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
													h("label", { className: "mcf-rowCheck" },
														h("input", {
															className: "mcf-check",
															type: "checkbox",
															checked: model.reasoning,
															onChange: (event: import("react").ChangeEvent<HTMLInputElement>) =>
																patchCreateModel(index, { reasoning: event.target.checked })
														}),
														t("reasoning")
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
													models: [...draftProvider.models, { id: "", name: "", vision: true, reasoning: false }]
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
						const error = addError ?? translateRowError(rowError[row.provider]);
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
						if (adding === null && confirming === null && creating === null && exporting === null) return;
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
							setExporting(null);
							setExportPicked(new Set());
							setExportCopy("idle");
							setImporting(false);
							setImportError(null);
						};
						document.addEventListener("keydown", onKey);
						return () => document.removeEventListener("keydown", onKey);
					}, [adding, confirming, creating, exporting, importing]);

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
								state.rows.length === 0 ? null : h("button", {
									type: "button",
									className: "mcf-btn mcf-btnSm",
									onClick: () => startExport(state.rows)
								}, t("exportAll")),
								state.writable && state.status === "ready" ? h("button", {
									type: "button",
									className: "mcf-btn mcf-btnSm",
									onClick: startImport
								}, t("importLabel")) : null,
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
