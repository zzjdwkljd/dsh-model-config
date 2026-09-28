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

interface LlmRemote {
	listProviders(): Promise<RemoteResult<LlmProviderInfo[]>>;
	listConfigurableProviders(): Promise<RemoteResult<LlmConfigurableProvider[]>>;
}

interface SettingsRemote {
	describe(): Promise<RemoteResult<SettingsDescribeValue>>;
	mutate(
		ns: string,
		ops: SettingsPathOp[],
		expectedRevision?: number,
	): Promise<RemoteResult<SettingsNamespaceView>>;
}

interface RemoteService {
	readonly llm: LlmRemote;
	readonly settings: SettingsRemote;
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

interface PageState {
	status: PageStatus;
	error: string | null;
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
			visionOn: "Vision on",
			visionLabel: "Vision for {model}",
			test: "Test",
			testing: "Testing…",
			testOk: "Connected — the model answered.",
			conflict: "These settings changed elsewhere. Refresh and try again.",
			noNamespace: "The settings section for this provider was not found."
		};

		/** Chinese strings. */
		const zh: Record<string, string> = {
			panel: "模型配置",
			title: "模型配置",
			intro: "当前配置下的模型提供商。可手动添加模型、测试模型是否能够连通，并为单个模型打开识图。",
			refresh: "刷新",
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
			visionOn: "支持识图",
			visionLabel: "识图（{model}）",
			test: "测试",
			testing: "测试中…",
			testOk: "连通正常，模型已应答。",
			conflict: "设置已在别处被修改，请刷新后重试。",
			noNamespace: "找不到该提供商的设置分区。"
		};

		/** Component-local styles; unmounting the page removes them with it. */
		const MCF_CSS = `
.mcf-page{box-sizing:border-box;height:100%;color:var(--dsw-alias-label-primary);flex-direction:column;align-items:center;gap:32px;padding:0 clamp(24px,4vw,48px) 48px;display:flex;overflow:auto}
.mcf-page>*{width:100%;max-width:960px}
.mcf-pageHead{box-sizing:border-box;justify-content:space-between;align-items:flex-start;gap:16px;padding-top:28px;display:flex}
.mcf-pageTitle{margin:0;font-size:20px;font-weight:500;line-height:28px}
.mcf-pageIntro{color:var(--dsw-alias-label-secondary);margin:4px 0 0;font-size:13px;line-height:20px;max-width:70ch}
.mcf-toolbar{justify-content:flex-end;align-items:center;gap:8px;display:flex}
.mcf-status{color:var(--dsw-alias-label-tertiary);margin:0;font-size:13px;line-height:20px}
.mcf-failure{color:var(--dsw-alias-state-error-primary);align-items:center;gap:12px;display:flex}
.mcf-failure p{margin:0;font-size:13px;line-height:20px}
.mcf-notice{border-radius:var(--dsw-radius-md);background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary);margin:0;padding:8px 12px;font-size:12px;line-height:18px}
.mcf-groups{flex-direction:column;gap:10px;display:flex}
.mcf-group{flex-direction:column;display:flex}
.mcf-provider{box-sizing:border-box;border:.5px solid var(--dsw-alias-settings-card-stroke);background:var(--dsw-alias-settings-card-fill);border-radius:var(--dsw-radius-xl);color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer;text-align:left;align-items:center;gap:12px;width:100%;padding:12px 14px;display:flex}
.mcf-provider:hover{background:var(--dsw-alias-interactive-bg-hover)}
.mcf-provider:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:2px}
.mcf-provider[aria-expanded=true]{border-bottom-left-radius:0;border-bottom-right-radius:0;background:var(--dsw-alias-settings-card-fill)}
.mcf-provider[aria-expanded=true]:hover{background:var(--dsw-alias-settings-card-fill)}
.mcf-providerIdentity{align-items:baseline;gap:8px;min-width:0;display:inline-flex}
.mcf-providerName{font-size:14px;font-weight:500;line-height:22px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mcf-providerId{color:var(--dsw-alias-label-tertiary);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;line-height:18px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mcf-providerTags{align-items:center;gap:8px;margin-left:auto;display:inline-flex}
.mcf-tag{box-sizing:border-box;border:.5px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-xs);color:var(--dsw-alias-label-secondary);white-space:nowrap;padding:1px 6px;font-size:11px;line-height:16px}
.mcf-tagOn{border-color:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary)}
.mcf-count{color:var(--dsw-alias-label-caption);font-variant-numeric:tabular-nums;white-space:nowrap;font-size:12px;line-height:18px}
.mcf-chevron{color:var(--dsw-alias-label-tertiary);flex:none;justify-content:center;align-items:center;width:16px;height:16px;display:inline-flex}
.mcf-panel{box-sizing:border-box;border:.5px solid var(--dsw-alias-settings-card-stroke);border-top:none;background:var(--dsw-alias-settings-card-fill);border-bottom-left-radius:var(--dsw-radius-xl);border-bottom-right-radius:var(--dsw-radius-xl);flex-direction:column;gap:12px;padding:12px 14px 14px;display:flex}
.mcf-panelHead{justify-content:space-between;align-items:center;gap:12px;display:flex}
.mcf-panelTitle{color:var(--dsw-alias-label-secondary);font-size:12px;font-weight:500;line-height:18px;letter-spacing:.04em;text-transform:uppercase}
.mcf-models{flex-direction:column;gap:8px;margin:0;padding:0;list-style:none;display:flex}
.mcf-model{box-sizing:border-box;border:.5px solid var(--dsw-alias-border-l4);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-bg-layer-1);flex-direction:column;gap:8px;padding:10px 12px;display:flex}
.mcf-modelMain{align-items:center;gap:10px;flex-wrap:wrap;display:flex}
.mcf-modelId{color:var(--dsw-alias-label-primary);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:13px;line-height:20px;max-width:46%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mcf-modelName{color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mcf-modelActions{margin-left:auto;align-items:center;gap:12px;display:inline-flex}
.mcf-switchWrap{align-items:center;gap:6px;display:inline-flex}
.mcf-switchLabel{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}
.mcf-switch{box-sizing:border-box;position:relative;flex:none;width:34px;height:20px;border-radius:999px;border:.5px solid var(--dsw-alias-border-l3);background:var(--dsw-alias-bg-layer-2);cursor:pointer;padding:0;transition:background-color .15s ease,border-color .15s ease}
.mcf-switch[aria-checked=true]{background:var(--dsw-alias-button-primary-fill);border-color:transparent}
.mcf-switch:disabled{cursor:default;opacity:.5}
.mcf-switch:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:2px}
.mcf-switchThumb{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;background:var(--dsw-alias-label-primary);transition:transform .15s ease,background-color .15s ease}
.mcf-switch[aria-checked=true] .mcf-switchThumb{transform:translateX(14px);background:var(--dsw-alias-label-primary-foreground)}
.mcf-testResult{margin:0;font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary)}
.mcf-testResultOk{color:var(--dsw-alias-state-success-primary)}
.mcf-testResultFail{color:var(--dsw-alias-state-error-primary)}
.mcf-error{color:var(--dsw-alias-state-error-primary);margin:0;font-size:12px;line-height:18px}
.mcf-addForm{box-sizing:border-box;border:.5px dashed var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-lg);flex-direction:column;gap:10px;padding:12px;display:flex}
.mcf-field{flex-direction:column;gap:4px;display:flex}
.mcf-field>span{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}
.mcf-input{box-sizing:border-box;border:.5px solid var(--dsw-alias-border-l4);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;height:32px;padding:0 10px;font-size:13px;line-height:20px;width:100%}
.mcf-input::placeholder{color:var(--dsw-alias-label-caption)}
.mcf-input:focus{outline:none;border-color:var(--dsw-alias-border-l3);box-shadow:0 0 0 1px var(--dsw-alias-state-business-primary)}
.mcf-actions{gap:8px;display:flex}
.mcf-btn{box-sizing:border-box;border-radius:var(--dsw-radius-md);height:32px;font:inherit;cursor:pointer;justify-content:center;align-items:center;gap:4px;padding:0 12px;font-size:13px;line-height:20px;display:inline-flex;background:0 0;border:.5px solid var(--dsw-alias-border-l3);color:var(--dsw-alias-label-primary)}
.mcf-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}
.mcf-btn:disabled{cursor:default;opacity:.5}
.mcf-btn:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:2px}
.mcf-btnPrimary{background:var(--dsw-alias-button-primary-fill);border-color:transparent;color:var(--dsw-alias-label-primary-foreground)}
.mcf-btnPrimary:hover:not(:disabled){background:var(--dsw-alias-button-primary-fill)}
.mcf-btnSm{height:28px;padding:0 10px;font-size:12px;line-height:18px}
.mcf-iconBtn{width:32px;padding:0}
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

		/**
		 * Join the declared configurable directory with the live routes, the same
		 * order the Models settings page uses: account first, official second.
		 * @param registered - live provider routes in registration order.
		 * @param declared - declared configurable providers in declaration order.
		 * @returns one row per provider, deduplicated by route id.
		 */
		function joinDirectory(
			registered: readonly LlmProviderInfo[],
			declared: readonly LlmConfigurableProvider[],
		): DirectoryEntry[] {
			const directory: DirectoryEntry[] = declared.map((entry) => ({
				provider: entry.provider,
				displayName: entry.displayName,
				settingsNs: entry.settingsNs,
				settingsPath: [...entry.settingsPath],
				directoryError: typeof entry.error === "string" ? entry.error : undefined
			}));
			const known = new Set(directory.map((row) => row.provider));
			for (const provider of registered) {
				if (known.has(provider.id)) continue;
				directory.push({
					provider: provider.id,
					displayName: provider.name,
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
		): ProviderRow[] {
			const active = new Set(registered.map((provider) => provider.id));
			const namespaces = new Map(view.namespaces.map((namespace) => [namespace.ns, namespace]));
			const rows = joinDirectory(registered, declared).map((entry): ProviderRow => {
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

		/** Chevron for the accordion header. */
		function Chevron(props: SlotProps) {
			const open = props.open === true;
			return h("svg", {
				viewBox: "0 0 16 16", width: 16, height: 16, fill: "none", stroke: "currentColor",
				strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true"
			}, open ? h("path", { d: "M4 6.5l4 4 4-4" }) : h("path", { d: "M6.5 4l4 4-4 4" }));
		}

		/** Refresh glyph for the page toolbar. */
		function RefreshIcon(_props: SlotProps) {
			return h("svg", {
				viewBox: "0 0 16 16", width: 15, height: 15, fill: "none", stroke: "currentColor",
				strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true"
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
			inject: ["slots", "locale", "remote", "remote.llm", "remote.settings"],
			apply(ctx: ClientContext): void {
				ctx.effect(() => ctx.locale.register(NS, { zh, en }), "model-config: dictionaries");
				const t: Translate = ctx.locale.bind(NS);

				/** The page: provider accordion, model rows, add form, probe results. */
				function ModelConfigPage(props: SlotProps) {
					const [state, setState] = React.useState<PageState>({
						status: "loading",
						error: null,
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
					const [, setLocaleTick] = React.useState(0);
					const generation = React.useRef(0);

					const load = React.useCallback(async (): Promise<void> => {
						const mine = ++generation.current;
						setState((previous) => ({
							...previous,
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
								writable: view.writable === true,
								rows: buildRows(registered.value, declared.value, view),
								namespaces: new Map(view.namespaces.map((namespace) => [namespace.ns, namespace]))
							});
						} catch (error) {
							if (mine !== generation.current) return;
							setState((previous) => ({ ...previous, status: "error", error: messageOf(error) }));
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
					};

					const renderModel = (row: ProviderRow, model: ModelRow, index: number) => {
						const field = inputFieldOf(row);
						const vision = effectiveInputTypes(row, index, field).includes("image");
						const id = model.id;
						const key = `${row.provider}::${id}::${String(index)}`;
						const result = tests[key];
						const testing = result !== undefined && result.status === "testing";
						const editable = row.editable && state.writable;
						const name = typeof model.name === "string" && model.name.length > 0 ? model.name : undefined;
						return h("li", { className: "mcf-model", key },
							h("div", { className: "mcf-modelMain" },
								h("code", { className: "mcf-modelId", title: id }, id),
								name === undefined ? null : h("span", { className: "mcf-modelName", title: name }, name),
								vision ? h("span", { className: "mcf-tag mcf-tagOn" }, t("visionOn")) : null,
								h("div", { className: "mcf-modelActions" },
									h("span", { className: "mcf-switchWrap" },
										h("button", {
											type: "button",
											role: "switch",
											"aria-checked": vision,
											className: "mcf-switch",
											disabled: !editable || busy[row.provider] === true,
											"aria-label": fill(t("visionLabel"), { model: id }),
											onClick: () => void toggleVision(row, index)
										}, h("span", { className: "mcf-switchThumb" })),
										h("span", { className: "mcf-switchLabel" }, t("vision"))
									),
									h("button", {
										type: "button",
										className: "mcf-btn mcf-btnSm",
										disabled: testing || !row.active,
										title: row.active ? undefined : t("inactiveHint"),
										onClick: () => void runTest(row, id, key)
									}, testing ? t("testing") : t("test"))
								)
							),
							result === undefined || result.status === "testing" ? null : h("p", {
								className: "mcf-testResult " + (result.status === "ok" ? "mcf-testResultOk" : "mcf-testResultFail")
							}, result.message)
						);
					};

					const renderPanel = (row: ProviderRow, panelId: string) => {
						const editable = row.editable && state.writable;
						return h("div", { className: "mcf-panel", id: panelId },
							h("div", { className: "mcf-panelHead" },
								h("span", { className: "mcf-panelTitle" }, t("models")),
								editable ? h("button", {
									type: "button",
									className: "mcf-btn mcf-btnSm",
									disabled: busy[row.provider] === true,
									onClick: () => startAdd(row)
								}, t("addModel")) : null
							),
							row.editable ? null : h("p", { className: "mcf-notice" }, t("notEditable")),
							row.editable && !state.writable ? h("p", { className: "mcf-notice" }, t("readOnly")) : null,
							row.directoryError === undefined ? null : h("p", { className: "mcf-error" }, row.directoryError),
							row.models.length === 0
								? h("p", { className: "mcf-status" }, t("modelsEmpty"))
								: h("ul", { className: "mcf-models" }, row.models.map((model, index) => renderModel(row, model, index))),
							adding === row.provider ? h("div", { className: "mcf-addForm" },
								h("label", { className: "mcf-field" },
									h("span", null, t("modelId")),
									h("input", {
										className: "mcf-input",
										type: "text",
										value: draft.id,
										placeholder: t("modelIdPlaceholder"),
										"aria-label": t("modelId"),
										autoFocus: true,
										onChange: (event) => setDraft((current) => ({ ...current, id: event.target.value })),
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
								h("div", { className: "mcf-actions" },
									h("button", {
										type: "button",
										className: "mcf-btn mcf-btnPrimary",
										disabled: busy[row.provider] === true,
										onClick: () => void submitAdd(row)
									}, t("add")),
									h("button", {
										type: "button",
										className: "mcf-btn",
										disabled: busy[row.provider] === true,
										onClick: () => {
											setAdding(null);
											setAddError(null);
										}
									}, t("cancel"))
								),
								addError === null ? null : h("p", { className: "mcf-error" }, addError)
							) : null,
							rowError[row.provider] === undefined ? null : h("p", { className: "mcf-error" }, rowError[row.provider])
						);
					};

					const renderProvider = (row: ProviderRow, index: number) => {
						const open = openId === row.provider;
						const panelId = `mcf-panel-${String(index)}`;
						return h("section", { className: "mcf-group", key: row.provider },
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
								h("span", { className: "mcf-providerIdentity" },
									h("span", { className: "mcf-providerName" }, row.displayName.length === 0 ? row.provider : row.displayName),
									row.displayName === row.provider ? null : h("span", { className: "mcf-providerId" }, row.provider)
								),
								h("span", { className: "mcf-providerTags" },
									h("span", { className: "mcf-tag" }, row.active ? t("active") : t("inactive")),
									h("span", { className: "mcf-count" }, fill(t("modelCount"), { count: String(row.models.length) }))
								),
								h("span", { className: "mcf-chevron" }, h(Chevron, { open }))
							),
							open ? renderPanel(row, panelId) : null
						);
					};

					const loading = state.status === "loading" && state.rows.length === 0;
					const failed = state.status === "error";
					const renderSlot = props.renderSlot;

					return h("section", { className: "mcf-page", "aria-busy": loading },
						h("style", null, MCF_CSS),
						h("header", { className: "mcf-pageHead", "data-window-drag": true },
							h("div", null,
								h("h1", { className: "mcf-pageTitle" }, t("title")),
								h("p", { className: "mcf-pageIntro" }, t("intro"))
							),
							h("div", { className: "mcf-toolbar" },
								typeof renderSlot === "function" ? renderSlot("model-config.action", {}) : null,
								h("button", {
									type: "button",
									className: "mcf-btn mcf-iconBtn",
									"aria-label": t("refresh"),
									title: t("refresh"),
									disabled: loading,
									onClick: load
								}, h(RefreshIcon))
							)
						),
						loading ? h("p", { className: "mcf-status", role: "status" }, t("loading")) : null,
						failed ? h("div", { className: "mcf-failure" },
							h("p", null, state.error ?? t("loadFailed")),
							h("button", { type: "button", className: "mcf-btn mcf-btnSm", onClick: load }, t("retry"))
						) : null,
						!failed && !loading && state.rows.length === 0 ? h("p", { className: "mcf-status" }, t("empty")) : null,
						state.rows.length > 0 ? h("div", { className: "mcf-groups" }, state.rows.map(renderProvider)) : null,
						!state.writable && state.rows.length > 0 ? h("p", { className: "mcf-notice" }, t("readOnly")) : null
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
