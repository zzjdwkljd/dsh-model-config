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
/* ------------------------------------------------------------------- module body */
window.__ModuleLoader__.load({
    id: "@local/model-config",
    factory(require) {
        const React = require("react");
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
        const en = {
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
            providers: "Providers",
            factBaseURL: "Base URL",
            factApi: "Protocol",
            factKeyRef: "Key reference",
            factState: "State",
            stateConfigured: "Configured · key stored",
            stateNotConfigured: "Not configured",
            factContext: "Context",
            interfaceInfo: "Connection details",
            factUnavailable: "Not provided",
            actionsLabel: "Actions",
            lookupReadonly: "Directory results do not confirm account access or connectivity. Closing this dialog never saves a model.",
            lookupOutput: "Max output",
            lookupFailed: "Could not read the model directory.",
            lookupUnsupported: "The host cannot read a model directory for this protocol. Keep using manual model entry.",
            lookupNoDiscovery: "The host has not registered model discovery for this provider. You can still add model IDs manually.",
            lookupNoNamespace: "This provider has no settings namespace for model discovery.",
            lookupNoMatch: "No model matches this search.",
            lookupEmpty: "The provider returned an empty model directory.",
            lookupConfigured: "Configured",
            lookupCount: "{shown}/{total} models",
            lookupSearch: "Search model IDs or names",
            lookupLoading: "Reading the model directory…",
            lookupIntro: "Choose a model; only Add selected writes to this provider. The directory does not guarantee account access.",
            lookupTitle: "Available models · {provider}",
            lookupPick: "Select {model}",
            lookupSelected: "{count} selected · {available} available",
            lookupAddSelected: "Add selected models",
            lookupSaving: "Adding…",
            lookupAdded: "Added {count} models to {provider}.",
            lookupNotWritable: "This provider cannot be edited here. Copy the model ID to use it elsewhere.",
            lookupNothingNew: "No new model is selected. Select an unconfigured model and try again.",
            lookupNoNew: "All returned models are already added.",
            selectVisible: "Select visible",
            clearVisible: "Clear visible",
            chooseDraftModels: "Choose available models",
            chooseDraftHint: "Select models to add to this draft; nothing is saved until Create.",
            chooseDraftKnown: "In draft",
            chooseDraftBack: "Back to provider",
            fetchHelp: "Enter a Base URL first; some endpoints also need an API key. Fetching does not create the provider.",
            draftAdded: "Added {count} models to the draft. Nothing is saved until Create.",
            lookupModels: "View available models",
            providerModelHeading: "Models",
            visionCount: "{count} vision",
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
            providerRouteRequired: "Enter a provider ID.",
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
            keyMissingRejected: "The server refused the request because no API key was sent. Fill the key in if this endpoint needs one, then retry.",
            fixFields: "Fix the highlighted fields before creating this provider.",
            createFailed: "Creating this provider failed: {message}",
            fetchModels: "Fetch available models",
            fetching: "Fetching…",
            fetchEmpty: "The endpoint returned no models. You can still enter model IDs manually.",
            fetchNeedsBaseURL: "Enter the Base URL first.",
            adoptModels: "Add selected ({count})",
            search: "Search",
            toggleAll: "Toggle all",
            addModelRow: "Add a model",
            removeRow: "Remove",
            needOneModel: "Add at least one model.",
            create: "Create",
            exportLabel: "Export",
            editLabel: "Edit",
            editTitle: "Edit “{provider}”",
            editHint: "Change this provider's endpoint and model list. The provider ID is the key in your configuration and cannot be renamed here; the API key may be left blank to keep the stored one.",
            editRouteLocked: "Provider ID · fixed",
            editBaseURLHint: "Leave blank to keep this endpoint unset (a route the installed catalog ships needs no Base URL).",
            editKeyHint: "Blank keeps the stored key; typing one stores it under {ref}.",
            keyStateStored: "a key is stored",
            keyStateAbsent: "no key stored yet",
            keyStateUnknown: "key state unavailable",
            keyBlankOnly: "The key cannot be whitespace only.",
            saveEdit: "Save",
            saving: "Saving…",
            saveFailed: "Saving failed: {message}",
            editedFlash: "Saved the configuration of {provider}.",
            editModelsHint: "Model IDs are saved as written; the vision and reasoning switches are only written for the rows you actually change.",
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
            exportPickProvider: "Select this provider",
            exportSearchModel: "Search models…",
            exportPreview: "Export preview",
            exportNoModel: "No model matches the search.",
            exportSummary: "{picked}/{total} providers · {models} models selected",
            exportFocusScope: "{name} · {route} · {count} models",
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
        const zh = {
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
            providers: "提供商",
            factBaseURL: "接口地址",
            factApi: "协议",
            factKeyRef: "密钥引用",
            factState: "状态",
            stateConfigured: "已配置 · 密钥已存储",
            stateNotConfigured: "未配置",
            factContext: "上下文",
            interfaceInfo: "接口信息",
            factUnavailable: "未提供",
            actionsLabel: "操作",
            lookupReadonly: "目录不保证账号权限或连通；关闭此窗口不会保存模型。",
            lookupOutput: "输出上限",
            lookupFailed: "查询模型目录失败。",
            lookupUnsupported: "当前宿主不支持此接口协议的模型目录查询，请继续手动填写模型 ID。",
            lookupNoDiscovery: "宿主尚未为此提供商注册模型目录查询，可继续手动添加模型。",
            lookupNoNamespace: "此提供商没有可用于查询的设置命名空间。",
            lookupNoMatch: "没有匹配的模型。",
            lookupEmpty: "提供商返回的模型目录为空。",
            lookupConfigured: "已添加",
            lookupCount: "显示 {shown}/{total} 个模型",
            lookupSearch: "搜索模型 ID 或名称",
            lookupLoading: "正在查询模型目录…",
            lookupIntro: "勾选目录模型后点击「添加所选模型」才写入当前提供商；目录不代表账号已有权限。",
            lookupTitle: "可用模型 · {provider}",
            lookupPick: "选择模型 {model}",
            lookupSelected: "已选 {count} 个 · 可添加 {available} 个",
            lookupAddSelected: "添加所选模型",
            lookupSaving: "添加中…",
            lookupAdded: "已向 {provider} 添加 {count} 个模型。",
            lookupNotWritable: "当前提供商不可在此编辑；可复制模型 ID 到其他可编辑配置。",
            lookupNothingNew: "尚未选中可添加的新模型，请勾选后重试。",
            lookupNoNew: "查询到的模型均已添加。",
            selectVisible: "全选当前结果",
            clearVisible: "取消当前选择",
            chooseDraftModels: "选择可用模型",
            chooseDraftHint: "勾选后加入新增提供商草稿；点击「创建」前不会写入配置。",
            chooseDraftKnown: "草稿中已有",
            chooseDraftBack: "返回编辑",
            fetchHelp: "先填写接口地址；部分服务还需 API Key。查询不会创建提供商。",
            draftAdded: "已将 {count} 个模型加入草稿；点击「创建」前不会写入配置。",
            lookupModels: "查看更多模型",
            providerModelHeading: "模型数",
            visionCount: "识图 {count} 个",
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
            providerRouteRequired: "请填写提供商 ID。",
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
            keyMissingRejected: "这次没有发送 API Key，服务端据此拒绝了请求。若该端点需要密钥，请先填写再重试。",
            fixFields: "请先修正标红字段后再创建。",
            createFailed: "创建失败：{message}",
            fetchModels: "获取可用模型",
            fetching: "获取中…",
            fetchEmpty: "端点没有返回任何模型，仍可手动填写模型 ID。",
            fetchNeedsBaseURL: "请先填写接口地址。",
            adoptModels: "添加所选（{count}）",
            search: "搜索",
            toggleAll: "全选 / 反选",
            addModelRow: "添加一个模型",
            removeRow: "移除",
            needOneModel: "至少填写一个模型。",
            create: "创建",
            exportLabel: "导出",
            editLabel: "编辑",
            editTitle: "编辑「{provider}」",
            editHint: "修改这个提供商的接口信息与模型列表。提供商 ID 是配置里的键名，不在这里改名；密钥留空表示保留已保存的那一个。",
            editRouteLocked: "提供商 ID · 不可修改",
            editBaseURLHint: "留空表示不设置该端点（由安装的目录提供的路由不需要接口地址）。",
            editKeyHint: "留空保留原密钥；填写则把密钥保存到 {ref}。",
            keyStateStored: "已保存密钥",
            keyStateAbsent: "尚未保存密钥",
            keyStateUnknown: "无法确认密钥状态",
            keyBlankOnly: "密钥不能只有空白字符。",
            saveEdit: "保存",
            saving: "保存中…",
            saveFailed: "保存失败：{message}",
            editedFlash: "已保存「{provider}」的配置。",
            editModelsHint: "模型 ID 按填写内容保存；识图与思考开关只对你真正改动过的行写入。",
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
            exportPickProvider: "该商全选",
            exportSearchModel: "搜索模型…",
            exportPreview: "导出预览",
            exportNoModel: "没有匹配的模型。",
            exportSummary: "已选 {picked}/{total} 个提供商 · {models} 个模型",
            exportFocusScope: "{name} · {route} · {count} 个模型",
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
.mcf-page{--mcf-font-sans:var(--dsw-font-family,-apple-system,BlinkMacSystemFont,"Segoe UI Variable Text","Segoe UI","PingFang SC","Hiragino Sans GB","Microsoft YaHei UI","Microsoft YaHei","Noto Sans SC",system-ui,"Helvetica Neue",Arial,sans-serif);--mcf-font-mono:ui-monospace,SFMono-Regular,"SF Mono",Menlo,Consolas,"Liberation Mono","Courier New",monospace;--mcf-fs-micro:11px;--mcf-lh-micro:16px;--mcf-fs-meta:12px;--mcf-lh-meta:18px;--mcf-fs-body:13px;--mcf-lh-body:20px;--mcf-fs-lead:14px;--mcf-lh-lead:22px;--mcf-fs-section:15px;--mcf-lh-section:22px;--mcf-fs-title:17px;--mcf-lh-title:24px;--mcf-fs-headline:19px;--mcf-lh-headline:26px;--mcf-fs-display:22px;--mcf-lh-display:30px;box-sizing:border-box;height:100%;overflow:auto;flex-direction:column;align-items:center;gap:24px;padding:0 32px 56px;display:flex;background:var(--mcf-bg);color:var(--mcf-text);font-family:var(--mcf-font-sans);font-size:var(--mcf-fs-lead);line-height:var(--mcf-lh-lead);--mcf-accent:#635BFF;--mcf-accent-hover:#574FE8;--mcf-accent-soft:#EEEDFF;--mcf-tag-bg:#F0F0FF;--mcf-tag-line:#E5E3FF;--mcf-accent-line:#DCD9FF;--mcf-ring:#C7C2FF;--mcf-bg:#F6F7F9;--mcf-surface:#FFFFFF;--mcf-surface-hover:#FAFAFF;--mcf-surface-open:#FBFBFF;--mcf-text:#18181B;--mcf-text-2:#71717A;--mcf-text-3:#A1A1AA;--mcf-border:#E8E8EC;--mcf-border-hover:#DDDDF0;--mcf-neutral:#F4F4F5;--mcf-track-off:#D9DCE3;--mcf-ghost-border:#E4E4E7;--mcf-ghost-text:#52525B;--mcf-danger:#D92D20;--mcf-danger-strong:#B42318;--mcf-danger-soft:#FEF3F2;--mcf-danger-line:#FDA29B;--mcf-scrim:#18181B66;--mcf-success:#067647;--mcf-warn:#B54708}
body[data-ds-dark-theme] .mcf-page{--mcf-bg:#0F0F11;--mcf-surface:#18181B;--mcf-surface-hover:#1F1F24;--mcf-surface-open:#1A1922;--mcf-text:#FAFAFA;--mcf-text-2:#A1A1AA;--mcf-text-3:#71717A;--mcf-border:#27272A;--mcf-border-hover:#3A3A45;--mcf-neutral:#232327;--mcf-accent-soft:#26243F;--mcf-tag-bg:#26243F;--mcf-tag-line:#3A3563;--mcf-accent-line:#4B45A8;--mcf-ring:#4B45A8;--mcf-track-off:#3F3F46;--mcf-ghost-border:#3F3F46;--mcf-ghost-text:#D4D4D8;--mcf-danger:#F97066;--mcf-danger-strong:#D92D20;--mcf-danger-soft:#3A1A18;--mcf-danger-line:#7A2A24;--mcf-scrim:#000000A6;--mcf-warn:#FDB022}
.mcf-page>*{width:100%;max-width:1104px}
.mcf-pageHead{box-sizing:border-box;justify-content:space-between;align-items:flex-start;gap:16px;padding-top:32px;display:flex}
.mcf-pageTitle{margin:0;color:var(--mcf-text);font-size:var(--mcf-fs-headline);font-weight:600;line-height:var(--mcf-lh-headline);letter-spacing:-.02em}
.mcf-pageIntro{color:var(--mcf-text-2);margin:6px 0 0;font-size:var(--mcf-fs-lead);line-height:var(--mcf-lh-lead);max-width:640px}
.mcf-toolbar{justify-content:flex-end;align-items:center;gap:10px;display:flex}
.mcf-toolbar>*{flex-shrink:0}
.mcf-updated{color:var(--mcf-text-3);align-self:center;white-space:nowrap;font-size:var(--mcf-fs-body);line-height:var(--mcf-lh-body)}
@keyframes mcf-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
.mcf-spin{animation:mcf-spin .8s linear infinite;transform-origin:50% 50%}
.mcf-status{color:var(--mcf-text-3);margin:0;font-size:var(--mcf-fs-lead);line-height:var(--mcf-lh-lead)}
.mcf-failure{color:var(--mcf-danger);align-items:center;gap:12px;display:flex}
.mcf-failure p{margin:0;font-size:var(--mcf-fs-lead);line-height:var(--mcf-lh-lead)}
.mcf-notice{border-radius:9px;background:var(--mcf-neutral);color:var(--mcf-text-2);margin:0;padding:9px 12px;font-size:var(--mcf-fs-body);line-height:var(--mcf-lh-body)}
.mcf-error{color:var(--mcf-danger);margin:0;font-size:var(--mcf-fs-body);line-height:var(--mcf-lh-body)}
.mcf-switch{box-sizing:border-box;position:relative;flex:none;width:44px;height:24px;padding:0;border:0;border-radius:999px;corner-shape:round;background:var(--mcf-track-off);cursor:pointer;font:inherit;transition:background-color 180ms ease-out}
.mcf-switch[aria-checked=true]{background:var(--mcf-accent)}
.mcf-switch:disabled{cursor:default;opacity:.45}
.mcf-switch:focus-visible{outline:2px solid var(--mcf-ring);outline-offset:2px}
.mcf-switchThumb{position:absolute;top:2px;left:2px;width:20px;height:20px;border-radius:50%;corner-shape:round;background:#FFF;box-shadow:0 1px 2px #18181B2E;transition:transform 180ms ease-out}
.mcf-switch[aria-checked=true] .mcf-switchThumb{transform:translateX(20px)}
.mcf-testResult{margin:0;color:var(--mcf-text-3);font-size:var(--mcf-fs-body);line-height:var(--mcf-lh-body)}
.mcf-testResultOk{color:var(--mcf-success)}
.mcf-testResultFail{color:var(--mcf-danger)}
.mcf-field{flex-direction:column;gap:6px;display:flex}
.mcf-field>span{color:var(--mcf-text-2);font-size:var(--mcf-fs-body);font-weight:500;line-height:var(--mcf-lh-body)}
.mcf-input{box-sizing:border-box;width:100%;height:34px;padding:0 12px;border-radius:9px;border:1px solid var(--mcf-border);background:var(--mcf-surface);color:var(--mcf-text);font:inherit;font-size:var(--mcf-fs-lead);line-height:var(--mcf-lh-lead);transition:border-color 160ms ease-out,box-shadow 160ms ease-out}
.mcf-input::placeholder{color:var(--mcf-text-3)}
.mcf-input:focus{outline:none;border-color:var(--mcf-accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--mcf-accent) 22%,transparent)}
.mcf-btn{box-sizing:border-box;justify-content:center;align-items:center;gap:6px;height:34px;padding:0 14px;border-radius:9px;border:1px solid var(--mcf-ghost-border);background:0 0;color:var(--mcf-ghost-text);font:inherit;font-size:var(--mcf-fs-lead);font-weight:500;line-height:var(--mcf-lh-lead);white-space:nowrap;cursor:pointer;display:inline-flex;transition:background-color 160ms ease-out,border-color 160ms ease-out,color 160ms ease-out}
.mcf-btn:hover:not(:disabled){background:var(--mcf-surface-hover)}
.mcf-btn:disabled{cursor:default;opacity:.45}
.mcf-btn:focus-visible{outline:2px solid var(--mcf-ring);outline-offset:2px}
.mcf-btnPrimary{background:var(--mcf-accent);border-color:var(--mcf-accent);color:#FFF}
.mcf-btnPrimary:hover:not(:disabled){background:var(--mcf-accent-hover)}
.mcf-btnSm{height:32px;padding:0 12px;font-size:var(--mcf-fs-body)}
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
.mcf-modalHead{justify-content:space-between;align-items:flex-start;gap:12px;padding:16px 16px 0;display:flex}
.mcf-modalTitle{margin:0;color:var(--mcf-text);font-size:var(--mcf-fs-section);font-weight:600;line-height:var(--mcf-lh-section)}
.mcf-modalSub{margin:2px 0 0;color:var(--mcf-text-3);font-size:var(--mcf-fs-body);line-height:var(--mcf-lh-body)}
.mcf-modalBody{flex-direction:column;gap:14px;padding:16px 16px;display:flex}
.mcf-modalFoot{border-top:1px solid var(--mcf-border);justify-content:flex-end;gap:8px;padding:14px 16px;display:flex}
.mcf-confirmText{margin:0;color:var(--mcf-text-2);font-size:var(--mcf-fs-lead);line-height:var(--mcf-lh-lead)}
.mcf-testRow{flex-wrap:wrap;align-items:center;gap:10px;min-height:24px;display:flex}
.mcf-modalHint{color:var(--mcf-text-3);font-size:var(--mcf-fs-body);line-height:var(--mcf-lh-body)}
.mcf-formGrid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.mcf-span2{grid-column:1/-1}
.mcf-fieldHint{color:var(--mcf-text-3);font-size:var(--mcf-fs-meta);line-height:var(--mcf-lh-meta)}
.mcf-modelRows{display:flex;flex-direction:column;gap:8px}
.mcf-modelRow{display:grid;grid-template-columns:1.2fr 1fr auto 32px;gap:8px;align-items:center}
.mcf-rowCheck{display:flex;align-items:center;gap:6px;font-size:var(--mcf-fs-body);color:var(--mcf-text-2);white-space:nowrap;cursor:pointer}
.mcf-check{width:14px;height:14px;margin:0;accent-color:var(--mcf-accent);cursor:pointer}
.mcf-addRowWrap{margin-top:10px}
select.mcf-input{appearance:auto;height:34px}
.mcf-modelsHead{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:16px}
.mcf-sectionLabel{margin:0;font-size:var(--mcf-fs-body);font-weight:600;line-height:var(--mcf-lh-body);color:var(--mcf-text-2);letter-spacing:.02em}
.mcf-fieldError{color:var(--mcf-danger);font-size:var(--mcf-fs-meta);line-height:var(--mcf-lh-meta)}
.mcf-inputInvalid{border-color:var(--mcf-danger-line)!important}
.mcf-inputInvalid:focus{border-color:var(--mcf-danger)!important;box-shadow:0 0 0 3px var(--mcf-danger-soft)}
.mcf-skipRow{display:flex;align-items:center;gap:8px;margin-top:10px;font-size:var(--mcf-fs-body);color:var(--mcf-text-2);cursor:pointer}
.mcf-pulse{animation:mcf-pulse 560ms ease-out}
@keyframes mcf-pulse{0%{box-shadow:0 0 0 0 var(--mcf-danger-soft)}100%{box-shadow:0 0 0 8px transparent}}
.mcf-candidates{margin-top:10px;border:1px solid var(--mcf-border);border-radius:10px;background:var(--mcf-surface);overflow:hidden}
.mcf-candHead{display:flex;gap:8px;align-items:center;padding:8px;border-bottom:1px solid var(--mcf-border);background:var(--mcf-surface-hover)}
.mcf-candSearch{flex:1;min-width:0}
.mcf-candActions{display:flex;gap:8px;flex-shrink:0}
.mcf-candList{max-height:200px;overflow:auto}
/* The export picker needs a real scrollbar when the window cannot show every
   row. The scroll container has to be the list inside the bordered wrapper:
   the wrapper is the flex item, so if IT were the shrinkable, clipping one the
   list's own scrollbar would land outside the visible box and be unreachable.
   max-height caps it on a tall window; min-height keeps about five rows before
   the dialog body starts scrolling instead. */
.mcf-pickList{flex:1 1 auto;min-height:0;overflow-y:auto;overflow-x:hidden;scrollbar-gutter:stable;flex-direction:column;display:flex}
.mcf-candRow{display:flex;gap:8px;align-items:center;padding:6px 10px;cursor:pointer;font-size:var(--mcf-fs-body)}
.mcf-candRow:hover{background:var(--mcf-surface-hover)}
.mcf-candId{font-family:var(--mcf-font-mono);font-size:var(--mcf-fs-meta);color:var(--mcf-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mcf-candName{color:var(--mcf-text-3);flex-shrink:0}
.mcf-exportOpts{display:flex;flex-wrap:wrap;align-items:flex-end;gap:8px 16px}
.mcf-exportOpts>*{flex:none}
.mcf-exportSelect{width:280px}
.mcf-exportText{box-sizing:border-box;width:100%;min-height:200px;max-height:360px;resize:vertical;margin:0;padding:10px 12px;border:1px solid var(--mcf-border);border-radius:9px;background:var(--mcf-neutral);color:var(--mcf-text);font-family:var(--mcf-font-mono);font-size:var(--mcf-fs-body);line-height:var(--mcf-lh-body);white-space:pre;overflow:auto}
.mcf-exportText:focus{outline:none;border-color:var(--mcf-accent)}
/* Inside a fixed-height dialog the preview is the point: let it absorb whatever
   height the picker and the notes leave over, instead of staying a 200px slot. */
.mcf-modalFixed .mcf-exportText{flex:1 1 auto;min-height:110px;max-height:none}
.mcf-exportNote{margin:0;color:var(--mcf-text-3);font-size:var(--mcf-fs-meta);line-height:var(--mcf-lh-meta)}
.mcf-exportWarn{margin:0;color:var(--mcf-danger);font-size:var(--mcf-fs-meta);line-height:var(--mcf-lh-meta)}
.mcf-importList{box-sizing:border-box;width:100%;max-height:min(44vh,360px);overflow:auto;margin:0;padding:0;border:1px solid var(--mcf-border);border-radius:9px;background:var(--mcf-neutral);list-style:none}
.mcf-importItem{display:flex;align-items:baseline;gap:8px;padding:7px 10px;border-top:1px solid var(--mcf-border);font-size:var(--mcf-fs-body);line-height:var(--mcf-lh-body)}
.mcf-importItem:first-child{border-top:0}
.mcf-importName{color:var(--mcf-text);font-weight:600;flex:none}
.mcf-importMeta{color:var(--mcf-text-3);font-size:var(--mcf-fs-meta);flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mcf-importBadge{flex:none;padding:1px 7px;border-radius:999px;border:1px solid var(--mcf-border);color:var(--mcf-text-3);font-size:var(--mcf-fs-meta);line-height:var(--mcf-lh-meta)}
.mcf-importBadgeNew{border-color:var(--mcf-accent);color:var(--mcf-accent)}
.mcf-importBadgeReplace{border-color:var(--mcf-warn);color:var(--mcf-warn)}
.mcf-importBadgeSkip{border-color:var(--mcf-border);color:var(--mcf-text-3)}
.mcf-importReason{color:var(--mcf-text-3);font-size:var(--mcf-fs-meta);line-height:var(--mcf-lh-meta)}
/* Key-read status inside the export dialog's code pane: it must not add a grid
   child to the modal body, whose rows the visual system places explicitly. */
.mcf-codeNote{margin:0;padding:6px 14px 0;color:var(--mcf-warn);font-size:var(--mcf-fs-meta);line-height:var(--mcf-lh-meta)}
.mcf-importError{margin:0;color:var(--mcf-danger);font-size:var(--mcf-fs-meta);line-height:var(--mcf-lh-meta);white-space:pre-line}
.mcf-importFile{display:none}
.mcf-pickName{color:var(--mcf-text);font-size:var(--mcf-fs-body);flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
@media (prefers-reduced-motion:reduce){.mcf-spin,.mcf-overlay,.mcf-modal,.mcf-pulse{animation:none}.mcf-group,.mcf-group::before,.mcf-chevron svg,.mcf-panelWrap,.mcf-switch,.mcf-switchThumb,.mcf-model,.mcf-btn,.mcf-input{transition:none}}

/* Main-view detail pieces the visual system styles only through its own selectors. */
.mcf-modelList{flex-direction:column;display:flex}
.mcf-modelBlock{min-width:0}
.mcf-detailActions{flex:none;align-items:center;gap:6px;display:flex}
/* Two-pane (master-detail) skeleton: the visual system below styles these
   classes but deliberately does not lay them out, so the base rules live here. */
.mcf-split{display:grid;grid-template-columns:232px minmax(0,1fr);flex:1 1 auto;min-height:260px;min-width:0;border:1px solid var(--mcf-border);border-radius:10px;overflow:hidden;background:var(--mcf-surface)}
.mcf-splitNav{border-right:1px solid var(--mcf-border);background:var(--mcf-surface-hover);flex-direction:column;min-width:0;display:flex}
.mcf-splitHead{flex:0 0 auto;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px;border-bottom:1px solid var(--mcf-border);color:var(--mcf-text-3);font-size:var(--mcf-fs-meta);line-height:var(--mcf-lh-meta);display:flex;min-width:0}
.mcf-splitTitle{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mcf-splitItem{align-items:center;gap:8px;padding:7px 10px;border-left:3px solid transparent;cursor:pointer;font-size:var(--mcf-fs-body);line-height:var(--mcf-lh-body);display:flex}
/* Nav items are buttons, so the UA chrome has to go before the layer styles them. */
.mcf-splitItem{box-sizing:border-box;appearance:none;border:0;background:transparent;color:inherit;font:inherit;text-align:left}
.mcf-splitItem:hover{background:var(--mcf-surface)}
.mcf-splitItem[aria-selected="true"]{background:var(--mcf-accent-soft);border-left-color:var(--mcf-accent)}
.mcf-splitIcon{flex:none;width:20px;height:20px;border-radius:6px;background:var(--mcf-accent-soft);color:var(--mcf-accent);font-size:var(--mcf-fs-meta);font-weight:600;align-items:center;justify-content:center;display:flex}
.mcf-splitMain{flex-direction:column;min-width:0;display:flex}
.mcf-splitBody{flex:1 1 auto;min-height:0;overflow:auto}
.mcf-modelRow{align-items:center;gap:8px;padding:6px 10px;cursor:pointer;font-size:var(--mcf-fs-body);line-height:var(--mcf-lh-body);display:flex}
.mcf-modelRow:hover{background:var(--mcf-surface-hover)}
.mcf-modelMeta{color:var(--mcf-text-3);font-size:var(--mcf-fs-meta);flex:none}
.mcf-splitEmpty{padding:14px 10px;color:var(--mcf-text-3);font-size:var(--mcf-fs-body)}
.mcf-badge{flex:none;padding:1px 7px;border:1px solid var(--mcf-border);border-radius:999px;color:var(--mcf-text-3);font-size:var(--mcf-fs-meta);line-height:var(--mcf-lh-meta)}
.mcf-badgeOn{border-color:var(--mcf-accent);color:var(--mcf-accent)}
/* Detail pane: stacked by default, side by side on request. */
.mcf-detail{flex:1 1 auto;min-height:0;overflow:auto}
.mcf-detail[data-side="true"]{display:grid;grid-template-columns:284px minmax(0,1fr);overflow:hidden}
.mcf-detail[data-side="true"]>.mcf-detailFacts{border-right:1px solid var(--mcf-border);overflow:auto}
.mcf-detail[data-side="true"]>.mcf-detailModels{overflow:auto}
.mcf-facts{margin:0;padding:10px 12px;border-bottom:1px solid var(--mcf-border);background:var(--mcf-surface-hover);gap:4px 14px;grid-template-columns:auto minmax(0,1fr);font-size:var(--mcf-fs-body);line-height:var(--mcf-lh-body);display:grid}
.mcf-detail[data-side="true"] .mcf-facts{border-bottom:0;background:transparent;grid-template-columns:minmax(0,1fr);gap:2px}
.mcf-facts dt{color:var(--mcf-text-3)}
.mcf-facts dd{margin:0;color:var(--mcf-text);font-family:var(--mcf-font-mono);font-size:var(--mcf-fs-meta);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mcf-detailBar{flex:0 0 auto;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px;border-bottom:1px solid var(--mcf-border);font-size:var(--mcf-fs-body);color:var(--mcf-text-2);display:flex}
.mcf-seg{border:1px solid var(--mcf-border);border-radius:8px;padding:2px;background:var(--mcf-neutral);gap:2px;display:inline-flex}
.mcf-seg>button{border:0;background:transparent;color:var(--mcf-text-2);font-size:var(--mcf-fs-meta);line-height:var(--mcf-lh-meta);padding:3px 9px;border-radius:6px;cursor:pointer}
.mcf-seg>button[aria-pressed="true"]{background:var(--mcf-surface);color:var(--mcf-text);box-shadow:0 1px 2px #18181B14}
/* Composer model selector popover. */
.mcf-pop{width:100%;max-width:520px;background:var(--mcf-surface);border:1px solid var(--mcf-border);border-radius:14px;box-shadow:0 18px 44px #18181B26;overflow:hidden;margin-bottom:12px;flex-direction:column;display:flex}
.mcf-popTop{align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid var(--mcf-border);display:flex}
.mcf-popSearch{flex:1 1 auto;min-width:0;border:0;background:transparent;color:var(--mcf-text);font-size:var(--mcf-fs-lead);line-height:var(--mcf-lh-lead);outline:none}
.mcf-popSearch::placeholder{color:var(--mcf-text-3)}
.mcf-popCols{grid-template-columns:192px minmax(0,1fr);height:262px;display:grid}
.mcf-popNav{border-right:1px solid var(--mcf-border);background:var(--mcf-surface-hover);overflow:auto;padding:6px;flex-direction:column;gap:2px;display:flex}
.mcf-popNavItem{align-items:center;gap:8px;padding:6px 8px;border-radius:8px;cursor:pointer;font-size:var(--mcf-fs-body);line-height:var(--mcf-lh-body);display:flex}
.mcf-popNavItem:hover{background:var(--mcf-surface)}
.mcf-popNavItem[aria-selected="true"]{background:var(--mcf-surface);box-shadow:inset 0 0 0 1px var(--mcf-border-hover)}
.mcf-popMain{flex-direction:column;min-width:0;display:flex}
.mcf-popHead{flex:0 0 auto;align-items:center;justify-content:space-between;gap:8px;padding:9px 12px 4px;color:var(--mcf-text-3);font-size:var(--mcf-fs-meta);line-height:var(--mcf-lh-meta);display:flex}
.mcf-popList{flex:1 1 auto;min-height:0;overflow:auto;padding:2px 6px 6px}
.mcf-popRow{align-items:center;gap:8px;padding:7px 8px;border-radius:8px;cursor:pointer;font-size:var(--mcf-fs-lead);line-height:var(--mcf-lh-lead);color:var(--mcf-text);display:flex}
.mcf-popRow:hover{background:var(--mcf-surface-hover)}
.mcf-popRow[aria-current="true"]{background:var(--mcf-accent-soft);color:var(--mcf-accent);font-weight:600}
.mcf-popCheck{flex:none;width:14px;color:var(--mcf-accent)}
.mcf-popTag{margin-left:auto;color:var(--mcf-text-3);font-size:var(--mcf-fs-meta);font-weight:400}
.mcf-popFoot{flex:0 0 auto;align-items:center;gap:6px;padding:8px 12px;border-top:1px solid var(--mcf-border);color:var(--mcf-text-3);font-size:var(--mcf-fs-meta);line-height:var(--mcf-lh-meta);display:flex}
.mcf-key{border:1px solid var(--mcf-border);border-radius:5px;padding:0 5px;color:var(--mcf-text-2);font-size:var(--mcf-fs-meta);line-height:var(--mcf-lh-meta)}
.mcf-popChip{margin-left:auto;border:1px solid var(--mcf-border);border-radius:999px;padding:2px 9px;color:var(--mcf-text-2);font-size:var(--mcf-fs-meta);cursor:pointer;background:var(--mcf-surface)}
.mcf-popChip b{color:var(--mcf-text);font-weight:600;margin-left:4px}
/* A stand-in for the DSH composer under the popover. */
.mcf-composerMock{width:100%;max-width:720px;margin:0 auto;padding:0 0 36px;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;display:flex}
.mcf-composer{width:100%;max-width:520px;border:1px solid var(--mcf-border);border-radius:14px;background:var(--mcf-surface);padding:12px}
.mcf-composerInput{color:var(--mcf-text-3);font-size:var(--mcf-fs-lead);line-height:var(--mcf-lh-lead);padding:6px 2px 14px}
.mcf-chipRow{align-items:center;gap:8px;display:flex}
.mcf-chip{border:1px solid var(--mcf-border);border-radius:999px;padding:3px 10px;color:var(--mcf-text-2);font-size:var(--mcf-fs-meta);line-height:var(--mcf-lh-meta)}
.mcf-chip b{color:var(--mcf-text);font-weight:600;margin-left:4px}
@media (max-width:460px){.mcf-split{grid-template-columns:minmax(0,1fr);grid-template-rows:auto minmax(0,1fr)}.mcf-splitNav{border-right:0;border-bottom:1px solid var(--mcf-border);max-height:180px}}
/* ===================== VISUAL SYSTEM (设计定稿 2026-09-30) ===================== */
/* MODEL CONFIG · VISUAL SYSTEM
   Appearance only. The original HTML controls, data and JavaScript are retained.
   Inline this stylesheet after the existing styles in all three views. */
body[data-ds-dark-theme]{color-scheme:dark}
.mcf-page{
 --mcf-accent:#735bd5;--mcf-accent-hover:#634bc4;--mcf-accent-soft:#f1edf9;--mcf-tag-bg:#f3effb;--mcf-tag-line:#e7dff5;--mcf-accent-line:#ded4f2;--mcf-ring:#b9a3eb;
 --mcf-bg:#f5f6fa;--mcf-surface:#fff;--mcf-surface-hover:#f9f8fc;--mcf-surface-open:#faf9fd;
 --mcf-text:#293044;--mcf-text-2:#7c8495;--mcf-text-3:#a3a9b7;--mcf-border:#e9ebf2;--mcf-border-hover:#dcd7ea;--mcf-neutral:#f4f5f8;--mcf-track-off:#dfe2ea;
 --mcf-ghost-border:#e4e6ef;--mcf-ghost-text:#697287;--mcf-danger:#cc6575;--mcf-danger-strong:#b34a5d;--mcf-danger-soft:#fcf2f4;--mcf-danger-line:#f0cbd3;
 --mcf-scrim:#edf0f8;--mcf-success:#428b76;--mcf-warn:#b18243;--mcf-shadow:0 16px 45px #353b5810,0 2px 7px #353b5804;--mcf-panel-shadow:0 12px 35px #353b580c;
 --mcf-code-bg:#282b3c;--mcf-code-border:#343849;--mcf-code-text:#dce0ef;--mcf-code-muted:#929bb3;
 font-family:var(--dsw-font-family,-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei","Noto Sans CJK SC",sans-serif);
 font-size:var(--mcf-fs-lead);line-height:1.65;letter-spacing:.01em;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;gap:24px;padding:32px 40px 32px;background:var(--mcf-bg)
}
body[data-ds-dark-theme] .mcf-page{
 --mcf-bg:#141620;--mcf-surface:#1e212d;--mcf-surface-hover:#252735;--mcf-surface-open:#232533;--mcf-text:#e6e8f2;--mcf-text-2:#a2a8bc;--mcf-text-3:#717a92;--mcf-border:#2e3243;--mcf-border-hover:#474059;--mcf-neutral:#262a39;
 --mcf-accent:#ae95f1;--mcf-accent-hover:#bda5fb;--mcf-accent-soft:#322b46;--mcf-tag-bg:#322b46;--mcf-tag-line:#493b65;--mcf-accent-line:#554478;--mcf-ring:#766098;--mcf-track-off:#414658;--mcf-ghost-border:#373c50;--mcf-ghost-text:#b6bdd0;
 --mcf-danger:#e397a4;--mcf-danger-strong:#d18190;--mcf-danger-soft:#392936;--mcf-danger-line:#68404e;--mcf-scrim:#12141e;--mcf-success:#85bca9;--mcf-warn:#c4a16e;
 --mcf-shadow:0 18px 50px #00000032,0 1px 4px #00000020;--mcf-panel-shadow:0 15px 38px #00000026;--mcf-code-bg:#161923;--mcf-code-border:#2c3040;--mcf-code-text:#c4ccde;--mcf-code-muted:#6e7992
}
.mcf-page *, .mcf-page *:before,.mcf-page *:after{box-sizing:border-box}
.mcf-page button,.mcf-page input,.mcf-page select,.mcf-page textarea{font-family:inherit}
.mcf-page>*{max-width:1180px}
.mcf-page button{-webkit-tap-highlight-color:transparent}
.mcf-page svg{flex-shrink:0}
.mcf-page :focus-visible{outline:2px solid var(--mcf-ring);outline-offset:3px}
.mcf-page input:focus-visible,.mcf-page textarea:focus-visible{outline:none}
.mcf-page ::selection{background:#c9bbec66}
.mcf-page [role="listbox"],.mcf-detail,.mcf-detailFacts,.mcf-detailModels,.mcf-modalBody,.mcf-splitBody,.mcf-popList{scrollbar-width:thin;scrollbar-color:color-mix(in srgb,var(--mcf-text-3) 40%,transparent) transparent}
.mcf-page ::-webkit-scrollbar{width:5px;height:5px}
.mcf-page ::-webkit-scrollbar-thumb{background:color-mix(in srgb,var(--mcf-text-3) 34%,transparent);border-radius:8px}
.mcf-page ::-webkit-scrollbar-track{background:transparent}
.mcf-pageHead{padding:0;align-items:center;gap:24px;flex-shrink:0}
.mcf-pageIdentity,.mcf-modalIdentity{display:flex;align-items:flex-start;gap:12px;min-width:0}
.mcf-titleIcon{width:40px;height:40px;flex-shrink:0;border:1px solid var(--mcf-tag-line);border-radius:11px;background:var(--mcf-accent-soft);color:var(--mcf-accent);display:grid;place-items:center;margin-top:3px}
.mcf-titleIcon svg{width:21px;height:21px}
.mcf-pageTitle{font-size:var(--mcf-fs-display);line-height:1.35;font-weight:650;letter-spacing:-.025em;color:var(--mcf-text)}
.mcf-pageIntro{max-width:470px;margin-top:8px;font-size:var(--mcf-fs-body);line-height:1.85;color:var(--mcf-text-2)}
.mcf-toolbar{gap:8px;flex-wrap:wrap;row-gap:9px}
.mcf-updated{font-size:var(--mcf-fs-meta);color:var(--mcf-text-3);margin:0 3px;white-space:nowrap}
.mcf-btn{height:36px;border-radius:8px;font-size:var(--mcf-fs-body);font-weight:500;line-height:1.4;padding:0 12px;background:var(--mcf-surface);color:var(--mcf-ghost-text);border-color:var(--mcf-ghost-border);gap:6px;box-shadow:0 1px 2px #25274203;transition:background-color .15s,border-color .15s,box-shadow .15s,color .15s}
.mcf-btn:hover:not(:disabled){border-color:var(--mcf-border-hover);background:var(--mcf-surface-hover);box-shadow:0 2px 5px #38304905}
.mcf-btnPrimary{background:var(--mcf-accent);border-color:var(--mcf-accent);color:#fff;box-shadow:0 3px 7px #735bd518;font-weight:600}
.mcf-btnPrimary:hover:not(:disabled){background:var(--mcf-accent-hover);border-color:var(--mcf-accent-hover);box-shadow:0 4px 11px #735bd526}
body[data-ds-dark-theme] .mcf-btnPrimary{color:#211a34}
.mcf-btnSm{height:33px;font-size:var(--mcf-fs-meta);padding:0 11px}
.mcf-iconBtn{width:36px;padding:0;display:inline-grid;place-items:center}
.mcf-btnSm.mcf-iconBtn{width:33px}
.mcf-btnDanger{color:white;background:var(--mcf-danger);border-color:var(--mcf-danger)}
.mcf-btnDanger:hover:not(:disabled){background:var(--mcf-danger-strong);border-color:var(--mcf-danger-strong)}
.mcf-iconDanger{color:#9c8597}
.mcf-iconDanger:hover:not(:disabled){color:var(--mcf-danger);border-color:var(--mcf-danger-line);background:var(--mcf-danger-soft);box-shadow:none}
.mcf-themeMoon,.mcf-themeSun{width:15px;height:15px;color:var(--mcf-text-2)}
.mcf-themeSun{display:none}
body[data-ds-dark-theme] .mcf-themeMoon{display:none}
body[data-ds-dark-theme] .mcf-themeSun{display:block}
.mcf-seg{height:36px;padding:3px;border-radius:8px;background:var(--mcf-neutral);border-color:var(--mcf-border);gap:2px;align-items:center}
.mcf-seg>button{height:28px;display:inline-flex;align-items:center;justify-content:center;gap:5px;padding:0 9px;border-radius:5px;font-family:inherit;font-size:var(--mcf-fs-meta);color:var(--mcf-text-3)}
.mcf-seg>button svg{width:12px;height:12px}
.mcf-seg>button[aria-pressed="true"]{color:var(--mcf-text);background:var(--mcf-surface);box-shadow:0 1px 4px #3e344010}
.mcf-input{height:36px;border-radius:7px;border-color:var(--mcf-ghost-border);background:var(--mcf-surface);font-size:var(--mcf-fs-body);line-height:1.5;color:var(--mcf-text)}
.mcf-input:focus{border-color:var(--mcf-ring);box-shadow:0 0 0 3px color-mix(in srgb,var(--mcf-accent) 9%,transparent)}
select.mcf-input{height:36px;font-size:var(--mcf-fs-body)}
.mcf-check{width:15px;height:15px;flex-shrink:0;accent-color:var(--mcf-accent);margin:0}
.mcf-rowCheck{font-size:var(--mcf-fs-body);color:var(--mcf-text-2);gap:8px;line-height:var(--mcf-lh-body)}
.mcf-split{border-color:var(--mcf-border);border-radius:16px;background:var(--mcf-surface);box-shadow:var(--mcf-panel-shadow);grid-template-columns:250px minmax(0,1fr);overflow:hidden;min-height:320px}
.mcf-splitNav{background:color-mix(in srgb,var(--mcf-surface) 65%,var(--mcf-bg));border-right-color:var(--mcf-border);min-height:0;padding-bottom:10px}
.mcf-splitHead{padding:16px 16px 12px;min-height:50px;color:var(--mcf-text-3);font-size:var(--mcf-fs-meta);line-height:1.6;font-weight:500;letter-spacing:.025em;border-bottom-color:var(--mcf-border)}
.mcf-splitNav .mcf-splitHead{border-bottom-color:transparent;padding-bottom:10px;min-height:48px}
.mcf-splitHead #navCount{font-size:var(--mcf-fs-meta);letter-spacing:0;background:var(--mcf-neutral);border:1px solid var(--mcf-border);border-radius:5px;padding:1px 6px;font-variant-numeric:tabular-nums;color:var(--mcf-text-3)}
.mcf-pickList{min-height:0;scrollbar-gutter:auto;overflow:auto}
.mcf-splitItem{border:1px solid transparent;border-radius:9px;margin:3px 10px;min-height:46px;padding:9px;gap:9px;font-size:var(--mcf-fs-body);line-height:1.5;transition:background .15s,border-color .15s;position:relative}
.mcf-splitItem:hover{background:var(--mcf-neutral)}
.mcf-splitItem[aria-selected="true"]{background:var(--mcf-accent-soft);border:1px solid var(--mcf-tag-line);box-shadow:0 1px 4px #49366804}
.mcf-splitIcon{width:29px;height:29px;border-radius:8px;border:1px solid var(--mcf-border);background:var(--mcf-surface);color:var(--mcf-text-2);font-size:var(--mcf-fs-meta);font-weight:600;letter-spacing:-.2px}
.mcf-splitItem[aria-selected="true"] .mcf-splitIcon{border-color:var(--mcf-accent);background:var(--mcf-accent);color:white;box-shadow:0 2px 5px #735bd514}
body[data-ds-dark-theme] .mcf-splitItem[aria-selected="true"] .mcf-splitIcon{color:#241b3b}
.mcf-pickName{font-size:var(--mcf-fs-body);font-weight:500;line-height:1.5;color:var(--mcf-text-2)}
.mcf-splitItem[aria-selected="true"] .mcf-pickName{color:var(--mcf-accent);font-weight:600}
.mcf-splitItem>.mcf-modelMeta{display:grid;place-items:center;background:color-mix(in srgb,var(--mcf-text-3) 9%,transparent);min-width:19px;height:19px;padding:0 4px;border-radius:5px;font-size:var(--mcf-fs-micro);color:var(--mcf-text-3)}
.mcf-splitItem[aria-selected="true"]>.mcf-modelMeta{background:color-mix(in srgb,var(--mcf-accent) 10%,transparent);color:var(--mcf-accent)}
.mcf-splitMain{min-height:0}
.mcf-splitTitle{font-size:var(--mcf-fs-lead);line-height:1.6;color:var(--mcf-text);font-weight:600;letter-spacing:-.005em}
.mcf-modelMeta{font-size:var(--mcf-fs-meta);color:var(--mcf-text-3)}
.mcf-splitEmpty{padding:24px 16px;font-size:var(--mcf-fs-body);color:var(--mcf-text-3)}
.mcf-switch{width:36px;height:20px;vertical-align:middle;background:var(--mcf-track-off);box-shadow:inset 0 0 0 1px #37394c05}
.mcf-switchThumb{width:16px;height:16px;top:2px;left:2px;box-shadow:0 1px 3px #26324b21}
.mcf-switch[aria-checked="true"]{background:var(--mcf-accent)}
.mcf-switch[aria-checked="true"] .mcf-switchThumb{transform:translateX(16px)}
/* 02 · model settings */
.mcf-page[data-view="main"]{gap:24px}
.mcf-page[data-view="main"]>.mcf-split{max-width:1180px!important;flex:1;min-height:390px}
.mcf-page[data-view="main"] .mcf-splitMain>.mcf-splitHead{padding:16px 24px;min-height:66px;background:var(--mcf-surface);gap:14px}
.mcf-page[data-view="main"] .mcf-splitMain>.mcf-splitHead>.mcf-splitTitle{font-size:var(--mcf-fs-lead);font-weight:600;white-space:normal;overflow:visible}
.mcf-page[data-view="main"] .mcf-splitMain>.mcf-splitHead .mcf-iconDanger{font-size:var(--mcf-fs-meta);color:var(--mcf-danger);background:transparent;border-color:var(--mcf-danger-line);box-shadow:none}
.mcf-detail{min-height:0;background:var(--mcf-surface)}
.mcf-detailFacts{padding:20px 24px 0}
.mcf-detailFacts:before{content:"接口信息";display:block;color:var(--mcf-text-2);font-size:var(--mcf-fs-meta);font-weight:600;letter-spacing:.02em;margin-bottom:12px}
.mcf-facts{grid-template-columns:75px minmax(0,1fr);gap:10px 14px;border:1px solid var(--mcf-border);border-radius:10px;background:color-mix(in srgb,var(--mcf-surface) 58%,var(--mcf-bg));padding:16px;font-size:var(--mcf-fs-body);line-height:1.65;align-items:center}
.mcf-facts dt{font-size:var(--mcf-fs-meta);color:var(--mcf-text-3)}
.mcf-facts dd{font-family:var(--mcf-font-mono);font-size:var(--mcf-fs-meta);color:var(--mcf-text-2);letter-spacing:0;min-width:0;white-space:normal;word-break:break-word;overflow:visible;line-height:1.75}
.mcf-facts dd:nth-of-type(4){font-family:inherit;justify-self:start;color:var(--mcf-success);font-size:var(--mcf-fs-meta);border:1px solid color-mix(in srgb,var(--mcf-success) 13%,transparent);background:color-mix(in srgb,var(--mcf-success) 5%,transparent);border-radius:5px;padding:2px 7px;line-height:1.6}
.mcf-facts dd:nth-of-type(5){justify-self:start;border:1px solid var(--mcf-tag-line);background:var(--mcf-tag-bg);color:var(--mcf-accent);font-size:var(--mcf-fs-meta);line-height:1.6;padding:2px 7px;border-radius:5px;font-weight:500}
.mcf-detailModels{padding:20px 24px 24px}
.mcf-detailBar{border-bottom:0;padding:0 0 14px;gap:12px;min-height:42px;font-size:var(--mcf-fs-meta);color:var(--mcf-text-3)}
.mcf-page[data-view="main"] .mcf-modelRow{display:grid;grid-template-columns:minmax(0,1fr) auto 26px 36px 29px;gap:11px;min-height:58px;padding:12px;border:1px solid var(--mcf-border);border-radius:9px;margin-bottom:8px;background:var(--mcf-surface);transition:background .15s,border-color .15s}
.mcf-page[data-view="main"] .mcf-modelRow:hover{background:var(--mcf-surface-hover);border-color:var(--mcf-border-hover)}
.mcf-candId{font-family:var(--mcf-font-mono);font-size:var(--mcf-fs-body);font-weight:500;line-height:1.75;letter-spacing:-.2px;white-space:normal;word-break:break-word;color:var(--mcf-text)}
.mcf-page[data-view="main"] .mcf-modelRow>.mcf-modelMeta:nth-child(2){font-size:var(--mcf-fs-meta);padding:2px 6px;line-height:1.5;border-radius:4px;color:var(--mcf-text-3);background:var(--mcf-neutral);white-space:nowrap}
.mcf-page[data-view="main"] .mcf-modelRow>.mcf-modelMeta:nth-child(3){font-size:var(--mcf-fs-micro);margin-left:0!important;color:var(--mcf-text-3)}
.mcf-page[data-view="main"] .mcf-modelRow>.mcf-iconBtn{width:27px;height:27px;border-radius:6px;background:transparent;border-color:transparent;box-shadow:none;color:var(--mcf-text-3)}
.mcf-page[data-view="main"] .mcf-modelRow>.mcf-iconBtn:hover{color:var(--mcf-danger);border-color:var(--mcf-danger-line);background:var(--mcf-danger-soft)}
.mcf-detail[data-side="true"]{grid-template-columns:270px minmax(0,1fr);overflow:hidden}
.mcf-detail[data-side="true"]>.mcf-detailFacts{padding:20px 16px;border-right-color:var(--mcf-border);background:color-mix(in srgb,var(--mcf-surface) 75%,var(--mcf-bg))}
.mcf-detail[data-side="true"]>.mcf-detailModels{padding:20px 20px 24px}
.mcf-detail[data-side="true"] .mcf-facts{padding:0;border:0;background:transparent;border-radius:0;grid-template-columns:minmax(0,1fr);gap:4px}
.mcf-detail[data-side="true"] .mcf-facts dt{font-size:var(--mcf-fs-meta);margin-top:12px}
.mcf-detail[data-side="true"] .mcf-facts dt:first-child{margin-top:0}
.mcf-detail[data-side="true"] .mcf-facts dd{font-size:var(--mcf-fs-meta)}
.mcf-detail[data-side="true"] .mcf-modelRow{grid-template-columns:minmax(0,1fr) auto 36px 27px;gap:8px}
.mcf-detail[data-side="true"] .mcf-modelRow>.mcf-modelMeta:nth-child(3){grid-row:2;grid-column:2;justify-self:end}
.mcf-detail[data-side="true"] .mcf-modelRow>.mcf-switch{grid-row:1/3;grid-column:3}
.mcf-detail[data-side="true"] .mcf-modelRow>.mcf-iconBtn{grid-row:1/3;grid-column:4}
.mcf-detail[data-side="true"] .mcf-modelRow>.mcf-candId{grid-row:1/3;grid-column:1}
.mcf-detail[data-side="true"] .mcf-modelRow>.mcf-modelMeta:nth-child(2){grid-row:1;grid-column:2}
/* 01 · export. Reflow the existing JSON textarea; add no new control. */
.mcf-page[data-view="export"]{padding:0}
.mcf-page[data-view="export"]>.mcf-overlay{background:var(--mcf-scrim);padding:24px;animation:none}
.mcf-page[data-view="export"] .mcf-modalWide{max-width:1030px;width:100%;height:min(754px,calc(100dvh - 48px));border-radius:18px;border-color:var(--mcf-border);box-shadow:var(--mcf-shadow);background:var(--mcf-surface);overflow:hidden}
.mcf-modalHead{padding:24px 24px 20px;align-items:flex-start;border-bottom:1px solid var(--mcf-border);gap:20px;background:var(--mcf-surface);flex-shrink:0}
.mcf-modalIdentity{gap:12px}
.mcf-modalIdentity .mcf-titleIcon{width:36px;height:36px;border-radius:10px;margin-top:2px}
.mcf-modalIdentity .mcf-titleIcon svg{width:19px;height:19px}
.mcf-modalTitle{font-size:var(--mcf-fs-headline);line-height:1.5;letter-spacing:-.018em;font-weight:650}
.mcf-modalSub{font-size:var(--mcf-fs-meta);line-height:1.85;margin-top:7px;max-width:720px;color:var(--mcf-text-3)}
.mcf-page[data-view="export"] .mcf-modalBody{display:grid;grid-template-columns:minmax(0,1.72fr) minmax(270px,1fr);grid-template-rows:auto minmax(260px,1fr) auto;gap:16px 20px;min-height:0;padding:20px 24px 20px;overflow:auto}
.mcf-exportOpts{grid-column:1/-1;grid-row:1;display:flex;align-items:center;gap:16px;margin:0;padding-bottom:2px;min-width:0}
.mcf-exportOpts>.mcf-field{display:flex;flex-direction:row;align-items:center;gap:10px}
.mcf-exportOpts .mcf-field>span{font-size:var(--mcf-fs-meta);color:var(--mcf-text-3);white-space:nowrap}
.mcf-exportSelect{width:235px}
.mcf-exportOpts>.mcf-rowCheck{margin-left:auto;font-size:var(--mcf-fs-meta);gap:7px;padding:7px 10px;background:var(--mcf-neutral);border:1px solid var(--mcf-border);border-radius:7px}
.mcf-page[data-view="export"] .mcf-modalBody>.mcf-split{grid-column:1;grid-row:2;grid-template-columns:205px minmax(0,1fr);box-shadow:none;min-height:260px;border-radius:10px;min-width:0}
.mcf-page[data-view="export"] .mcf-splitHead{padding:12px 12px 10px;min-height:43px;font-size:var(--mcf-fs-meta)}
.mcf-page[data-view="export"] .mcf-splitNav{padding-bottom:7px}
.mcf-page[data-view="export"] .mcf-splitItem{padding:8px 7px;gap:7px;margin:3px 6px;min-height:45px;border-radius:7px}
.mcf-page[data-view="export"] .mcf-splitItem .mcf-splitIcon{width:25px;height:25px;border-radius:6px;font-size:var(--mcf-fs-micro)}
.mcf-page[data-view="export"] .mcf-splitItem .mcf-check{width:13px;height:13px}
.mcf-page[data-view="export"] .mcf-pickName{font-size:var(--mcf-fs-meta);white-space:normal;line-height:1.5;overflow:visible;text-overflow:clip}
.mcf-page[data-view="export"] .mcf-splitItem>.mcf-modelMeta{font-size:var(--mcf-fs-micro);min-width:15px;height:17px;padding:0 3px}
.mcf-page[data-view="export"] .mcf-splitMain>.mcf-splitHead{display:flex;flex-direction:column;align-items:stretch;gap:12px;flex-shrink:0;padding:14px 14px 12px}
.mcf-page[data-view="export"] #mainHead{font-size:var(--mcf-fs-meta);line-height:1.75;font-weight:600;white-space:normal;overflow:visible}
.mcf-page[data-view="export"] .mcf-splitMain>.mcf-splitHead>span:last-child{width:100%;gap:6px!important;display:flex;align-items:center}
.mcf-page[data-view="export"] #q{flex:1;min-width:0;width:100%!important;height:31px!important;font-size:var(--mcf-fs-meta)!important;border-radius:6px;padding:0 9px;background:var(--mcf-neutral)}
.mcf-page[data-view="export"] #provAll{height:31px;padding:0 8px;font-size:var(--mcf-fs-meta);flex-shrink:0;border-radius:6px;box-shadow:none}
.mcf-page[data-view="export"] .mcf-modelRow{display:grid;grid-template-columns:15px minmax(0,1fr) auto;gap:8px;border:1px solid transparent;margin:5px 7px;padding:10px 9px;min-height:43px;border-radius:7px;transition:background .15s,border-color .15s}
.mcf-page[data-view="export"] .mcf-modelRow:hover{background:var(--mcf-surface-hover)}
.mcf-page[data-view="export"] .mcf-modelRow:has(input:checked){background:var(--mcf-accent-soft);border-color:var(--mcf-tag-line)}
.mcf-page[data-view="export"] .mcf-modelRow:has(input:checked)>.mcf-candId{color:var(--mcf-accent)}
.mcf-page[data-view="export"] .mcf-modelRow>.mcf-candId{font-size:var(--mcf-fs-meta);line-height:1.6;letter-spacing:-.012em}
.mcf-page[data-view="export"] .mcf-modelRow>.mcf-modelMeta{font-size:var(--mcf-fs-micro);padding:2px 5px;line-height:1.5;border-radius:4px;background:color-mix(in srgb,var(--mcf-text-3) 7%,transparent);color:var(--mcf-text-3);margin-left:0!important;white-space:nowrap}
.mcf-codePane{grid-column:2;grid-row:2;display:flex;flex-direction:column;min-width:0;min-height:0;border:1px solid var(--mcf-code-border);border-radius:10px;overflow:hidden;background:var(--mcf-code-bg)}
.mcf-codeHead{padding:12px 14px;display:flex;align-items:center;justify-content:space-between;gap:10px;color:var(--mcf-code-text);border-bottom:1px solid var(--mcf-code-border);font-size:var(--mcf-fs-meta);flex-shrink:0}
.mcf-codeKind{font-family:var(--mcf-font-mono);font-size:var(--mcf-fs-micro);color:var(--mcf-code-muted);letter-spacing:.06em;padding:2px 5px;border:1px solid var(--mcf-code-border);border-radius:4px}
.mcf-page[data-view="export"] .mcf-codePane .mcf-exportText{font-family:var(--mcf-font-mono);flex:1;min-height:110px;width:100%;max-height:none;background:var(--mcf-code-bg);color:var(--mcf-code-text);border:0;border-radius:0;box-shadow:none;line-height:1.9;font-size:var(--mcf-fs-meta);letter-spacing:0;padding:14px;resize:vertical;scrollbar-color:#62697e55 transparent}
.mcf-page[data-view="export"] .mcf-codePane .mcf-exportText:focus{outline:none;box-shadow:inset 0 0 0 1px #9585ca55}
.mcf-exportWarn{grid-column:1/-1;grid-row:3;display:flex;align-items:center;gap:7px;padding:9px 11px;margin:0;color:var(--mcf-warn);border:1px solid color-mix(in srgb,var(--mcf-warn) 18%,transparent);background:color-mix(in srgb,var(--mcf-warn) 5%,var(--mcf-surface));border-radius:7px;font-size:var(--mcf-fs-meta);line-height:1.7}
.mcf-exportWarn svg{width:13px;height:13px;flex-shrink:0}
.mcf-modalFoot{padding:16px 24px;border-top-color:var(--mcf-border);gap:8px;background:color-mix(in srgb,var(--mcf-surface) 80%,var(--mcf-bg));flex-shrink:0}
.mcf-modalFoot #sum{font-size:var(--mcf-fs-meta);line-height:1.7;color:var(--mcf-text-2)}
.mcf-modalFoot .mcf-btn{height:35px;font-size:var(--mcf-fs-meta);padding:0 12px}
/* 04 · composer model selector. No extra button, no new input. */
.mcf-page[data-view="composer"]{padding:26px 28px 34px}
.mcf-composerMock{max-width:700px;width:100%;height:100%;min-height:0;margin:0 auto;justify-content:flex-end;padding:0;flex-shrink:0}
.mcf-pop{max-width:624px;min-height:0;margin-bottom:15px;border-radius:17px;background:var(--mcf-surface);border-color:var(--mcf-border);box-shadow:var(--mcf-shadow)}
.mcf-popTop{padding:14px 16px;border-bottom-color:var(--mcf-border);gap:10px;min-height:57px}
.mcf-popTop>svg{width:15px;height:15px;color:var(--mcf-text-3)!important}
.mcf-popSearch{font-family:inherit;font-size:var(--mcf-fs-body);line-height:1.75;color:var(--mcf-text);padding:0;outline:0}
.mcf-popTop:focus-within{box-shadow:inset 0 -1px 0 var(--mcf-tag-line)}
.mcf-popTop #theme{width:30px;height:30px;border-radius:6px;background:var(--mcf-neutral);border-color:transparent;box-shadow:none}
.mcf-popCols{grid-template-columns:227px minmax(0,1fr);height:340px;min-height:0}
.mcf-popNav{background:color-mix(in srgb,var(--mcf-surface) 65%,var(--mcf-bg));padding:9px 7px;gap:4px;border-right-color:var(--mcf-border)}
.mcf-popNavItem{min-height:42px;border:1px solid transparent;border-radius:8px;padding:8px 9px;gap:8px;transition:background .15s,border-color .15s;font-size:var(--mcf-fs-meta)}
.mcf-popNavItem:hover{background:var(--mcf-neutral)}
.mcf-popNavItem[aria-selected="true"]{background:var(--mcf-accent-soft);box-shadow:none;border-color:var(--mcf-tag-line)}
.mcf-popNavItem[aria-selected="true"] .mcf-pickName{color:var(--mcf-accent);font-weight:600}
.mcf-popNavItem .mcf-splitIcon{width:26px;height:26px;border-radius:7px;font-size:var(--mcf-fs-micro)}
.mcf-popNavItem[aria-selected="true"] .mcf-splitIcon{background:var(--mcf-accent);border-color:var(--mcf-accent);color:white}
body[data-ds-dark-theme] .mcf-popNavItem[aria-selected="true"] .mcf-splitIcon{color:#221932}
.mcf-popNavItem .mcf-pickName{font-size:var(--mcf-fs-meta);line-height:1.5;white-space:normal;overflow:visible;text-overflow:clip}
.mcf-popNavItem>.mcf-modelMeta{font-size:var(--mcf-fs-meta);color:var(--mcf-accent)}
.mcf-popNavItem>.mcf-modelMeta:empty{display:none}
.mcf-popMain{min-height:0;background:var(--mcf-surface)}
.mcf-popHead{padding:16px 16px 12px;min-height:43px;font-size:var(--mcf-fs-meta);color:var(--mcf-text-3);gap:10px;align-items:center}
.mcf-popHead .mcf-splitTitle{font-size:var(--mcf-fs-body);font-weight:600;white-space:normal;line-height:1.6}
.mcf-popHead #mainCount{font-size:var(--mcf-fs-micro);white-space:nowrap;color:var(--mcf-text-3)}
.mcf-popList{padding:0 9px 9px}
.mcf-popRow{display:grid;grid-template-columns:14px minmax(0,1fr) auto;gap:9px;border:1px solid transparent;border-radius:8px;min-height:47px;margin:4px 0;padding:11px 10px;transition:background .15s,border-color .15s;font-size:var(--mcf-fs-body);line-height:1.6;font-weight:500}
.mcf-popRow:hover{background:var(--mcf-surface-hover)}
.mcf-popRow[aria-current="true"]{background:var(--mcf-accent-soft);border-color:var(--mcf-tag-line);font-weight:600;color:var(--mcf-accent)}
.mcf-popRow>span:not(.mcf-popCheck):not(.mcf-popTag){min-width:0;white-space:normal;word-break:break-word;overflow-wrap:anywhere;line-height:1.75}
.mcf-popCheck{width:13px;height:13px;color:var(--mcf-accent)}
.mcf-popTag{font-size:var(--mcf-fs-micro);line-height:1.6;padding:2px 5px;border-radius:4px;background:var(--mcf-neutral);color:var(--mcf-text-3);margin-left:0;white-space:nowrap}
.mcf-popRow[aria-current="true"] .mcf-popTag{background:color-mix(in srgb,var(--mcf-accent) 9%,transparent);color:var(--mcf-accent)}
.mcf-popFoot{padding:12px 16px;border-top-color:var(--mcf-border);gap:6px;background:color-mix(in srgb,var(--mcf-surface) 90%,var(--mcf-bg));font-size:var(--mcf-fs-meta);color:var(--mcf-text-3);line-height:1.5;min-height:46px}
.mcf-key{border-color:var(--mcf-border);color:var(--mcf-text-3);background:var(--mcf-surface);font-family:var(--mcf-font-mono);font-size:var(--mcf-fs-micro);border-radius:4px;line-height:var(--mcf-lh-micro);padding:0 4px;box-shadow:0 1px 1px #39304404}
.mcf-popChip{display:inline-flex;align-items:center;gap:7px;border-color:var(--mcf-tag-line);border-radius:6px;background:var(--mcf-accent-soft);color:var(--mcf-accent);font-size:var(--mcf-fs-meta);padding:5px 9px;margin-left:auto;white-space:nowrap}
.mcf-popChip b{color:var(--mcf-accent);font-weight:600;margin:0;font-size:var(--mcf-fs-meta)}
.mcf-popChip:hover{border-color:var(--mcf-ring);background:var(--mcf-tag-bg)}
.mcf-composer{max-width:624px;padding:17px 19px 14px;min-width:0;min-height:135px;border-radius:17px;border-color:var(--mcf-border);background:var(--mcf-surface);box-shadow:var(--mcf-panel-shadow)}
.mcf-composerInput{font-size:var(--mcf-fs-lead);line-height:1.8;color:var(--mcf-text-3);padding:2px 0 30px;min-height:66px}
.mcf-chipRow{gap:7px;flex-wrap:wrap}
.mcf-chip{display:inline-flex;align-items:center;gap:6px;border-color:var(--mcf-border);border-radius:6px;background:var(--mcf-surface-hover);padding:4px 8px;color:var(--mcf-text-3);font-size:var(--mcf-fs-meta);line-height:1.6;max-width:100%;min-width:0}
.mcf-chip b{font-size:var(--mcf-fs-meta);line-height:1.6;color:var(--mcf-text-2);font-weight:500;margin:0;min-width:0;overflow-wrap:anywhere;word-break:break-word}
.mcf-chipRow>.mcf-btnPrimary{height:31px;font-size:var(--mcf-fs-meta);padding:0 13px;border-radius:7px}
/* Responsive rules keep every existing control reachable. */
@media(max-width:1100px){
 .mcf-page[data-view="main"]{padding:24px}.mcf-pageHead{align-items:flex-start;flex-direction:column;gap:16px}.mcf-toolbar{justify-content:flex-start}.mcf-pageIntro{max-width:720px}.mcf-split{grid-template-columns:225px minmax(0,1fr)}
 .mcf-detail[data-side="true"]{grid-template-columns:230px minmax(0,1fr)}.mcf-detail[data-side="true"] .mcf-modelRow{grid-template-columns:minmax(0,1fr) 36px 27px;gap:7px}.mcf-detail[data-side="true"] .mcf-modelRow>.mcf-candId{grid-row:1;grid-column:1}.mcf-detail[data-side="true"] .mcf-modelRow>.mcf-modelMeta:nth-child(2){grid-row:2;grid-column:1;justify-self:start}.mcf-detail[data-side="true"] .mcf-modelRow>.mcf-modelMeta:nth-child(3){grid-row:2;grid-column:2;justify-self:center}.mcf-detail[data-side="true"] .mcf-modelRow>.mcf-switch{grid-row:1;grid-column:2}.mcf-detail[data-side="true"] .mcf-modelRow>.mcf-iconBtn{grid-row:1/3;grid-column:3}
 .mcf-page[data-view="export"] .mcf-modalWide{max-width:960px}.mcf-page[data-view="export"] .mcf-modalBody{grid-template-columns:minmax(0,1.6fr) minmax(240px,1fr);padding-left:20px;padding-right:20px;gap:16px}.mcf-page[data-view="export"] .mcf-modalBody>.mcf-split{grid-template-columns:188px minmax(0,1fr)}
}
@media(max-width:840px){
 .mcf-page[data-view="main"]{padding:20px;gap:16px}.mcf-pageTitle{font-size:var(--mcf-fs-display)}.mcf-pageIntro{font-size:var(--mcf-fs-meta)}.mcf-pageIdentity{gap:11px}.mcf-split{grid-template-columns:197px minmax(0,1fr)}.mcf-splitItem{gap:7px;margin-left:7px;margin-right:7px;padding:8px;min-height:45px}.mcf-pickName{font-size:var(--mcf-fs-meta);white-space:normal}.mcf-splitIcon{width:25px;height:25px;font-size:var(--mcf-fs-micro)}.mcf-page[data-view="main"] .mcf-splitMain>.mcf-splitHead{padding:14px 16px;flex-wrap:wrap;gap:10px}.mcf-page[data-view="main"] .mcf-splitMain>.mcf-splitHead>.mcf-splitTitle{font-size:var(--mcf-fs-body)}.mcf-detailFacts{padding:16px 16px 0}.mcf-detailModels{padding:16px 16px 20px}.mcf-page[data-view="main"] .mcf-modelRow{grid-template-columns:minmax(0,1fr) 36px 27px;gap:6px 8px;min-height:65px;padding:10px}.mcf-page[data-view="main"] .mcf-modelRow>.mcf-candId{grid-column:1;grid-row:1}.mcf-page[data-view="main"] .mcf-modelRow>.mcf-modelMeta:nth-child(2){grid-column:1;grid-row:2;justify-self:start}.mcf-page[data-view="main"] .mcf-modelRow>.mcf-modelMeta:nth-child(3){grid-column:2;grid-row:2;justify-self:center}.mcf-page[data-view="main"] .mcf-modelRow>.mcf-switch{grid-column:2;grid-row:1}.mcf-page[data-view="main"] .mcf-modelRow>.mcf-iconBtn{grid-column:3;grid-row:1/3}.mcf-candId{font-size:var(--mcf-fs-meta)}.mcf-facts{padding:12px;grid-template-columns:61px minmax(0,1fr);gap:9px 10px}.mcf-facts dt{font-size:var(--mcf-fs-meta)}.mcf-facts dd{font-size:var(--mcf-fs-meta)}.mcf-detail[data-side="true"]{grid-template-columns:195px minmax(225px,1fr);overflow:auto}.mcf-detail[data-side="true"]>.mcf-detailFacts,.mcf-detail[data-side="true"]>.mcf-detailModels{overflow:auto}
 .mcf-page[data-view="export"]>.mcf-overlay{padding:20px}.mcf-page[data-view="export"] .mcf-modalWide{height:calc(100dvh - 40px);max-height:850px}.mcf-modalTitle{font-size:var(--mcf-fs-headline)}.mcf-modalHead{padding:20px 20px 16px}.mcf-modalSub{font-size:var(--mcf-fs-meta)}.mcf-page[data-view="export"] .mcf-modalBody{grid-template-columns:minmax(0,1fr);grid-template-rows:auto minmax(270px,1fr) auto minmax(170px,.65fr);overflow:auto;padding:16px 20px}.mcf-page[data-view="export"] .mcf-modalBody>.mcf-split{grid-row:2;grid-column:1;grid-template-columns:205px minmax(0,1fr);min-height:270px}.mcf-codePane{grid-row:4;grid-column:1;min-height:175px}.mcf-exportWarn{grid-row:3;grid-column:1}.mcf-modalFoot{padding:16px 20px}.mcf-exportOpts>.mcf-rowCheck{padding:7px 9px}.mcf-exportSelect{width:210px}.mcf-modalFoot #sum{font-size:var(--mcf-fs-meta)}
}
@media(max-width:580px){
 .mcf-page[data-view="main"]{padding:20px 14px;gap:16px;overflow:auto}.mcf-pageIdentity{gap:10px}.mcf-titleIcon{width:34px;height:34px;border-radius:9px;margin-top:1px}.mcf-titleIcon svg{width:19px;height:19px}.mcf-pageTitle{font-size:var(--mcf-fs-display)}.mcf-pageIntro{font-size:var(--mcf-fs-meta);line-height:1.9;margin-top:6px}.mcf-toolbar{gap:6px}.mcf-updated{font-size:var(--mcf-fs-micro)}.mcf-btnSm{height:31px;font-size:var(--mcf-fs-meta);padding:0 9px}.mcf-btnSm.mcf-iconBtn{width:31px}.mcf-seg{height:33px;padding:3px}.mcf-seg>button{height:25px;font-size:var(--mcf-fs-micro);padding:0 7px;gap:4px}.mcf-seg>button svg{width:10px;height:10px}.mcf-page[data-view="main"]>.mcf-split{grid-template-columns:minmax(0,1fr);grid-template-rows:166px minmax(0,1fr);min-height:545px;border-radius:12px}.mcf-page[data-view="main"] .mcf-splitNav{border-right:0;border-bottom:1px solid var(--mcf-border);max-height:none;padding-bottom:6px}.mcf-page[data-view="main"] .mcf-splitNav .mcf-splitHead{padding:10px 14px 6px;min-height:34px}.mcf-page[data-view="main"] .mcf-splitItem{min-height:38px;padding:6px 9px;margin-top:2px;margin-bottom:2px}.mcf-page[data-view="main"] .mcf-pickName{white-space:nowrap;font-size:var(--mcf-fs-meta)}.mcf-page[data-view="main"] .mcf-splitMain>.mcf-splitHead{padding:12px 14px;min-height:55px}.mcf-detailFacts{padding:14px 14px 0}.mcf-detailModels{padding:16px 14px 20px}.mcf-facts{gap:8px 10px;padding:12px}.mcf-detailFacts:before{margin-bottom:9px;font-size:var(--mcf-fs-meta)}.mcf-detailBar{font-size:var(--mcf-fs-meta);padding-bottom:11px}.mcf-detail[data-side="true"]{grid-template-columns:170px minmax(210px,1fr)}.mcf-detail[data-side="true"]>.mcf-detailFacts{padding:16px 12px}.mcf-detail[data-side="true"]>.mcf-detailModels{padding:16px 12px}
 .mcf-page[data-view="export"]>.mcf-overlay{padding:12px}.mcf-page[data-view="export"] .mcf-modalWide{height:calc(100dvh - 24px);max-height:none;border-radius:14px}.mcf-modalHead{padding:16px;gap:11px}.mcf-modalIdentity{gap:9px}.mcf-modalIdentity .mcf-titleIcon{width:30px;height:30px;border-radius:8px}.mcf-modalIdentity .mcf-titleIcon svg{width:16px;height:16px}.mcf-modalTitle{font-size:var(--mcf-fs-title)}.mcf-modalSub{font-size:var(--mcf-fs-micro);margin-top:6px}.mcf-modalHead #theme{width:30px;height:30px;border-radius:6px}.mcf-page[data-view="export"] .mcf-modalBody{padding:16px 16px;gap:12px;grid-template-rows:auto minmax(280px,1fr) auto 190px}.mcf-page[data-view="export"] .mcf-modalBody>.mcf-split{grid-template-columns:165px minmax(0,1fr);grid-template-rows:none;min-height:280px}.mcf-page[data-view="export"] .mcf-splitNav{max-height:none;border-right:1px solid var(--mcf-border);border-bottom:0}.mcf-page[data-view="export"] .mcf-splitItem{margin-left:4px;margin-right:4px;padding:7px 5px;gap:5px}.mcf-page[data-view="export"] .mcf-splitItem .mcf-splitIcon{width:20px;height:20px;border-radius:5px;font-size:var(--mcf-fs-micro)}.mcf-page[data-view="export"] .mcf-pickName{font-size:var(--mcf-fs-micro)}.mcf-page[data-view="export"] .mcf-splitItem .mcf-check{width:12px;height:12px}.mcf-page[data-view="export"] .mcf-splitItem>.mcf-modelMeta{font-size:var(--mcf-fs-micro);min-width:12px;height:15px;padding:0 2px}.mcf-page[data-view="export"] .mcf-splitMain>.mcf-splitHead{padding:11px 10px 10px;gap:8px}.mcf-page[data-view="export"] #mainHead{font-size:var(--mcf-fs-meta)}.mcf-page[data-view="export"] #q{height:29px!important;font-size:var(--mcf-fs-meta)!important;padding:0 6px}.mcf-page[data-view="export"] #provAll{font-size:var(--mcf-fs-micro);padding:0 6px;height:29px}.mcf-page[data-view="export"] .mcf-modelRow{margin:4px 4px;padding:8px 6px;grid-template-columns:13px minmax(0,1fr);gap:3px 6px}.mcf-page[data-view="export"] .mcf-modelRow>.mcf-check{grid-row:1/3;grid-column:1;width:13px;height:13px}.mcf-page[data-view="export"] .mcf-modelRow>.mcf-candId{grid-column:2;grid-row:1;font-size:var(--mcf-fs-meta)}.mcf-page[data-view="export"] .mcf-modelRow>.mcf-modelMeta{grid-column:2;grid-row:2;font-size:var(--mcf-fs-micro);justify-self:start}.mcf-exportOpts{flex-wrap:wrap;gap:10px}.mcf-exportOpts>.mcf-field{flex:1}.mcf-exportSelect{width:100%;min-width:120px}.mcf-exportOpts>.mcf-rowCheck{margin-left:0;font-size:var(--mcf-fs-meta);padding:7px 9px}.mcf-exportOpts .mcf-field>span{font-size:var(--mcf-fs-meta)}.mcf-modalFoot{padding:12px 16px;flex-wrap:wrap;gap:6px}.mcf-modalFoot #sum{flex:1 0 100%;font-size:var(--mcf-fs-meta);margin:0 0 4px!important}.mcf-modalFoot .mcf-btn{height:31px;font-size:var(--mcf-fs-meta);padding:0 11px}.mcf-codeHead{padding:11px 12px}.mcf-codePane{min-height:180px}.mcf-page[data-view="export"] .mcf-codePane .mcf-exportText{padding:12px;font-size:var(--mcf-fs-micro)}.mcf-exportWarn{font-size:var(--mcf-fs-micro);padding:8px 10px}
 .mcf-page[data-view="composer"]{padding:18px 14px 22px}.mcf-pop{border-radius:14px;margin-bottom:12px}.mcf-popTop{padding:12px 13px;gap:8px;min-height:50px}.mcf-popSearch{font-size:var(--mcf-fs-meta)}.mcf-popCols{grid-template-columns:174px minmax(0,1fr);height:322px}.mcf-popNav{padding:7px 5px;gap:3px}.mcf-popNavItem{gap:6px;padding:7px 7px;min-height:39px;border-radius:7px}.mcf-popNavItem .mcf-splitIcon{width:22px;height:22px;font-size:var(--mcf-fs-micro);border-radius:6px}.mcf-popNavItem .mcf-pickName{font-size:var(--mcf-fs-meta)}.mcf-popNavItem>.mcf-modelMeta{font-size:var(--mcf-fs-micro)}.mcf-popHead{padding:14px 12px 9px;flex-wrap:wrap;row-gap:4px}.mcf-popHead .mcf-splitTitle{font-size:var(--mcf-fs-meta)}.mcf-popHead #mainCount{font-size:var(--mcf-fs-micro)}.mcf-popList{padding:0 6px 7px}.mcf-popRow{grid-template-columns:12px minmax(0,1fr);gap:5px 6px;padding:9px 7px;min-height:53px;font-size:var(--mcf-fs-meta)}.mcf-popRow .mcf-popCheck{grid-column:1;grid-row:1/3;width:12px;height:12px}.mcf-popRow>span:not(.mcf-popCheck):not(.mcf-popTag){grid-column:2;grid-row:1}.mcf-popRow .mcf-popTag{grid-column:2;grid-row:2;justify-self:start;font-size:var(--mcf-fs-micro)}.mcf-popFoot{padding:10px 12px;font-size:var(--mcf-fs-micro);gap:4px;flex-wrap:wrap;row-gap:7px}.mcf-key{font-size:var(--mcf-fs-micro)}.mcf-popChip{font-size:var(--mcf-fs-micro);padding:4px 7px;gap:5px}.mcf-popChip b{font-size:var(--mcf-fs-micro)}.mcf-composer{min-height:126px;border-radius:14px;padding:14px 15px 12px}.mcf-composerInput{font-size:var(--mcf-fs-body);padding-bottom:23px;min-height:59px}.mcf-chip{font-size:var(--mcf-fs-micro);padding:4px 7px;gap:5px}.mcf-chip b{font-size:var(--mcf-fs-micro)}.mcf-chipRow>.mcf-btnPrimary{font-size:var(--mcf-fs-micro);height:29px}
}
@media(max-width:390px){
 .mcf-page[data-view="export"] .mcf-modalBody>.mcf-split{grid-template-columns:minmax(0,1fr);grid-template-rows:143px minmax(185px,1fr);min-height:333px}.mcf-page[data-view="export"] .mcf-splitNav{border-right:0;border-bottom:1px solid var(--mcf-border);padding-bottom:5px}.mcf-page[data-view="export"] .mcf-splitNav .mcf-splitHead{min-height:33px;padding-top:9px;padding-bottom:4px}.mcf-page[data-view="export"] .mcf-splitItem{min-height:34px;margin:1px 6px;padding:5px 7px}.mcf-page[data-view="export"] .mcf-pickName{font-size:var(--mcf-fs-meta);white-space:nowrap}.mcf-page[data-view="export"] .mcf-modalBody{grid-template-rows:auto 333px auto 190px}.mcf-page[data-view="export"] .mcf-modelRow{grid-template-columns:13px minmax(0,1fr) auto;min-height:38px;padding:8px}.mcf-page[data-view="export"] .mcf-modelRow>.mcf-check{grid-row:1;grid-column:1}.mcf-page[data-view="export"] .mcf-modelRow>.mcf-candId{grid-row:1;grid-column:2}.mcf-page[data-view="export"] .mcf-modelRow>.mcf-modelMeta{grid-row:1;grid-column:3;font-size:var(--mcf-fs-micro)}.mcf-exportWarn{align-items:flex-start}.mcf-exportWarn svg{margin-top:2px}.mcf-modalTitle{font-size:var(--mcf-fs-section)}
 .mcf-popCols{grid-template-columns:151px minmax(0,1fr);height:305px}.mcf-popNavItem{padding:7px 5px;gap:5px}.mcf-popNavItem .mcf-pickName{font-size:var(--mcf-fs-micro)}.mcf-popNavItem .mcf-splitIcon{width:20px;height:20px;font-size:var(--mcf-fs-micro)}.mcf-popHead .mcf-splitTitle{font-size:var(--mcf-fs-meta)}.mcf-popRow{font-size:var(--mcf-fs-micro);padding:8px 6px}.mcf-popFoot>.mcf-popChip{margin-left:auto}.mcf-popFoot{font-size:var(--mcf-fs-micro)}.mcf-page[data-view="composer"]{padding-left:11px;padding-right:11px}.mcf-chipRow>.mcf-chip:first-child{max-width:100%}
}
@media(max-height:650px){
 .mcf-page[data-view="composer"]{padding-top:14px;padding-bottom:15px;overflow:auto}.mcf-composerMock{height:auto;min-height:100%;justify-content:flex-end}.mcf-popCols{height:255px}.mcf-composer{min-height:115px}.mcf-composerInput{min-height:48px;padding-bottom:18px}
 .mcf-page[data-view="export"] .mcf-modalWide{max-height:calc(100dvh - 30px)}.mcf-page[data-view="export"] .mcf-modalHead{padding-top:16px;padding-bottom:14px}.mcf-page[data-view="export"] .mcf-modalBody{grid-template-rows:auto minmax(200px,1fr) auto}.mcf-page[data-view="export"] .mcf-modalBody>.mcf-split{min-height:200px}.mcf-page[data-view="export"] .mcf-modalFoot{padding-top:12px;padding-bottom:12px}
}
@media(max-width:840px) and (max-height:650px){.mcf-page[data-view="export"] .mcf-modalBody{grid-template-rows:auto 300px auto 170px}.mcf-page[data-view="export"] .mcf-modalBody>.mcf-split{min-height:300px}}
@media(prefers-reduced-motion:reduce){.mcf-page *, .mcf-page *:before,.mcf-page *:after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
/* The supplied composer renderer emits .mcf-splitItem (not .mcf-popNavItem).
   Style that existing DOM without changing or patching its JavaScript. */
.mcf-popNav .mcf-splitItem{margin:0;min-height:42px;padding:8px 9px;gap:8px;border-radius:8px;font-size:var(--mcf-fs-meta)}
.mcf-popNav .mcf-splitItem .mcf-splitIcon{width:26px;height:26px;border-radius:7px;font-size:var(--mcf-fs-micro)}
.mcf-popNav .mcf-splitItem .mcf-pickName{font-size:var(--mcf-fs-meta);line-height:1.5;white-space:normal;overflow:visible;text-overflow:clip;font-weight:500}
.mcf-popNav .mcf-splitItem[aria-selected="true"] .mcf-pickName{font-weight:600}
.mcf-popNav .mcf-splitItem>.mcf-modelMeta{font-size:var(--mcf-fs-micro);min-width:17px;height:17px;padding:0 3px;color:var(--mcf-accent);background:color-mix(in srgb,var(--mcf-accent) 9%,transparent)}
.mcf-popNav .mcf-splitItem>.mcf-modelMeta:empty{display:none}
.mcf-page[data-view="export"] .mcf-codePane .mcf-exportText{font-size:var(--mcf-fs-body);line-height:1.85}
@media(min-width:841px){
 .mcf-page[data-view="main"] .mcf-pickName{font-size:var(--mcf-fs-lead)}
 .mcf-page[data-view="main"] .mcf-facts dd{font-size:var(--mcf-fs-body)}
 .mcf-page[data-view="main"] .mcf-facts dt{font-size:var(--mcf-fs-meta)}
 .mcf-page[data-view="main"] .mcf-facts dd:nth-of-type(4),.mcf-page[data-view="main"] .mcf-facts dd:nth-of-type(5){font-size:var(--mcf-fs-meta)}
 .mcf-page[data-view="main"] .mcf-candId{font-size:var(--mcf-fs-lead)}
 .mcf-page[data-view="main"] .mcf-splitMain>.mcf-splitHead>.mcf-splitTitle{font-size:var(--mcf-fs-section)}
}
@media(min-width:581px) and (max-width:840px){.mcf-page[data-view="main"] .mcf-facts dd{font-size:var(--mcf-fs-meta)}}
@media(max-width:580px){
 .mcf-popNav .mcf-splitItem{gap:6px;padding:7px;min-height:39px;border-radius:7px}
 .mcf-popNav .mcf-splitItem .mcf-splitIcon{width:22px;height:22px;font-size:var(--mcf-fs-micro);border-radius:6px}
 .mcf-popNav .mcf-splitItem .mcf-pickName{font-size:var(--mcf-fs-meta)}
 .mcf-popNav .mcf-splitItem>.mcf-modelMeta{font-size:var(--mcf-fs-micro);min-width:14px;height:15px}
 .mcf-page[data-view="export"] .mcf-codePane .mcf-exportText{font-size:var(--mcf-fs-meta)}
}
@media(max-width:390px){
 .mcf-popNav .mcf-splitItem{padding:7px 5px;gap:5px}
 .mcf-popNav .mcf-splitItem .mcf-splitIcon{width:20px;height:20px;font-size:var(--mcf-fs-micro)}
 .mcf-popNav .mcf-splitItem .mcf-pickName{font-size:var(--mcf-fs-micro)}
}
/* Final text/spacing polish, still presentation only. */
.mcf-page[data-view="export"] .mcf-pickName,.mcf-popNav .mcf-pickName{text-wrap:balance}
@media(min-width:1101px){.mcf-page[data-view="export"] .mcf-modalBody>.mcf-split{grid-template-columns:218px minmax(0,1fr)}}
@media(max-width:580px){
 .mcf-page[data-view="main"] .mcf-pageHead{position:relative}
 .mcf-page[data-view="main"] .mcf-pageIdentity{padding-right:39px}
 .mcf-page[data-view="main"] .mcf-toolbar #theme{position:absolute;right:0;top:1px;width:31px;height:31px}
 .mcf-popNav .mcf-splitItem .mcf-pickName{font-size:var(--mcf-fs-meta)}
 .mcf-popHead .mcf-splitTitle{font-size:var(--mcf-fs-meta)}
 .mcf-popRow{font-size:var(--mcf-fs-meta)}
 .mcf-popRow .mcf-popTag{font-size:var(--mcf-fs-micro)}
}

.mcf-page[data-view="export"] .mcf-pickName,.mcf-popNav .mcf-pickName{word-break:keep-all;overflow-wrap:anywhere}
/* 主色回到插件原色（用户指定：不要 visual-system 的紫） */
.mcf-page{--mcf-accent:#635BFF;--mcf-accent-hover:#574FE8;--mcf-accent-soft:#EEEDFF;--mcf-tag-bg:#F0F0FF;--mcf-tag-line:#E5E3FF;--mcf-accent-line:#DCD9FF;--mcf-ring:#C7C2FF}
body[data-ds-dark-theme] .mcf-page{--mcf-accent:#635BFF;--mcf-accent-hover:#574FE8;--mcf-accent-soft:#26243F;--mcf-tag-bg:#26243F;--mcf-tag-line:#3A3563;--mcf-accent-line:#4B45A8;--mcf-ring:#4B45A8}

/* Plugin additions the locked design does not draw: the reasoning switch and the
   connectivity test keep the row's shape but take their own grid column. */
.mcf-page[data-view="main"] .mcf-modelRow{grid-template-columns:minmax(0,1fr) 36px auto 27px}
.mcf-page[data-view="main"] .mcf-modelRow>.mcf-switch{grid-column:2;grid-row:1}
.mcf-page[data-view="main"] .mcf-modelRow>.mcf-modelMeta:nth-child(2){grid-column:1;grid-row:2;justify-self:start;max-width:max-content}
.mcf-page[data-view="main"] .mcf-modelRow>.mcf-iconBtn{grid-column:4;grid-row:1/3;justify-self:end}


/* Production UI repair: clear hierarchy, stable action columns and real overlays. */
.mcf-page{--mcf-text:#263249;--mcf-text-2:#53627a;--mcf-text-3:#64718a;--mcf-success:#247763;--mcf-danger:#b1475c;--mcf-scrim:rgba(22,32,52,.30)}
.mcf-page .mcf-splitItem>.mcf-modelMeta{font-size:var(--mcf-fs-meta);min-width:22px;height:21px;color:var(--mcf-text-2)}
body[data-ds-dark-theme] .mcf-page{--mcf-text:#eef1f8;--mcf-text-2:#b6c0d3;--mcf-text-3:#98a6c0;--mcf-success:#91cfb8;--mcf-scrim:rgba(4,8,18,.62)}
.mcf-page .mcf-btnPrimary{color:#fff}
body[data-ds-dark-theme] .mcf-page .mcf-btnPrimary,body[data-ds-dark-theme] .mcf-page .mcf-splitItem[aria-selected="true"] .mcf-splitIcon{color:#fff}
.mcf-page .mcf-pageIntro{font-size:var(--mcf-fs-lead);line-height:1.85;color:var(--mcf-text-2)}
.mcf-page .mcf-updated{font-size:var(--mcf-fs-meta);color:var(--mcf-text-3)}
.mcf-page .mcf-split{grid-template-columns:clamp(180px,24%,250px) minmax(0,1fr)}
.mcf-page .mcf-splitItem .mcf-pickName{font-size:var(--mcf-fs-lead);line-height:1.6;white-space:normal;word-break:keep-all;overflow-wrap:anywhere;color:var(--mcf-text-2)}
.mcf-page .mcf-splitItem[aria-selected="true"] .mcf-pickName{color:var(--mcf-text);font-weight:650}
.mcf-page .mcf-splitNav>.mcf-splitHead{font-size:var(--mcf-fs-body);color:var(--mcf-text-2)}
.mcf-page .mcf-splitMain{container-name:mcf-provider;container-type:inline-size;min-height:0}
.mcf-page .mcf-providerIdentity{display:flex;align-items:baseline;flex-wrap:wrap;gap:7px 12px;min-width:0}
.mcf-page .mcf-providerDisplayName{font-size:var(--mcf-fs-title);font-weight:650;line-height:1.6;color:var(--mcf-text)}
.mcf-page .mcf-providerRoute{font-family:var(--mcf-font-mono);font-size:var(--mcf-fs-body);line-height:1.7;color:var(--mcf-text-2);padding:2px 7px;border-radius:5px;background:var(--mcf-neutral);overflow-wrap:anywhere}
.mcf-page .mcf-detailFacts{padding:20px 24px 0}
.mcf-page .mcf-detailFacts:before{display:none;content:none}
.mcf-page .mcf-sectionTitle{display:flex;align-items:center;gap:12px;margin:0 0 12px;color:var(--mcf-text);font-size:var(--mcf-fs-lead);font-weight:650;line-height:var(--mcf-lh-lead)}
.mcf-page .mcf-sectionTitle:after{content:"";height:1px;flex:1;background:var(--mcf-border)}
.mcf-page .mcf-facts{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr) minmax(0,1.2fr);gap:0;margin:0;padding:0;border:1px solid var(--mcf-border);border-radius:11px;overflow:hidden;background:var(--mcf-surface)}
.mcf-page .mcf-factItem{min-width:0;padding:14px 16px}
.mcf-page .mcf-factItem:nth-child(2),.mcf-page .mcf-factItem:nth-child(3){border-left:1px solid var(--mcf-border)}
.mcf-page .mcf-factItem dt{margin:0 0 6px;color:var(--mcf-text-2);font-size:var(--mcf-fs-body);font-weight:500;line-height:var(--mcf-lh-body)}
.mcf-page .mcf-facts .mcf-factValue{min-width:0;margin:0;color:var(--mcf-text);font-family:var(--mcf-font-mono);font-size:var(--mcf-fs-lead);font-weight:500;line-height:1.8;white-space:normal;word-break:break-word;overflow-wrap:anywhere;background:transparent;border:0;border-radius:0;padding:0}
.mcf-page .mcf-factItem[data-empty="true"] .mcf-factValue{font-family:inherit;font-weight:400;color:var(--mcf-text-2)}
.mcf-page .mcf-factState,.mcf-page .mcf-factContext{display:flex;align-items:center;gap:12px;padding:11px 16px;border-top:1px solid var(--mcf-border);background:color-mix(in srgb,var(--mcf-neutral) 55%,var(--mcf-surface))}
.mcf-page .mcf-factState{grid-column:1/3;grid-row:2}
.mcf-page .mcf-factContext{grid-column:3;grid-row:2;border-left:1px solid var(--mcf-border)}
.mcf-page .mcf-factState dt,.mcf-page .mcf-factContext dt{margin:0;flex:none}
.mcf-page .mcf-factState .mcf-factValue{font-family:inherit;font-size:var(--mcf-fs-body);font-weight:600;line-height:1.7;padding:3px 8px;border:1px solid color-mix(in srgb,var(--mcf-success) 20%,var(--mcf-border));border-radius:5px;background:color-mix(in srgb,var(--mcf-success) 5%,var(--mcf-surface));color:var(--mcf-success)}
.mcf-page .mcf-facts[data-configured="false"] .mcf-factState .mcf-factValue{color:var(--mcf-text-2);background:var(--mcf-neutral);border-color:var(--mcf-border)}
.mcf-page .mcf-factContext .mcf-factValue{font-weight:650}
.mcf-page .mcf-detailModels{padding:24px 24px 24px}
.mcf-page .mcf-detailBar{font-size:var(--mcf-fs-body);color:var(--mcf-text-2);padding-bottom:12px}
.mcf-page .mcf-modelGridHead,.mcf-page .mcf-configModelRow{display:grid;grid-template-columns:minmax(0,1fr) 64px 64px 96px 32px;column-gap:12px;align-items:center}
.mcf-page .mcf-modelGridHead{padding:0 16px 9px;color:var(--mcf-text-2);font-size:var(--mcf-fs-body);font-weight:600;line-height:var(--mcf-lh-body)}
.mcf-page .mcf-modelGridHead>span:not(:first-child){text-align:center}
.mcf-page .mcf-modelList{gap:10px}
.mcf-page .mcf-modelBlock{border:1px solid var(--mcf-border);border-radius:11px;background:var(--mcf-surface);overflow:hidden;min-width:0;transition:border-color .15s}
.mcf-page .mcf-modelBlock:hover{border-color:var(--mcf-border-hover)}
.mcf-page .mcf-modelBlock[data-test-state="ok"]{border-color:color-mix(in srgb,var(--mcf-success) 22%,var(--mcf-border))}
.mcf-page .mcf-modelBlock[data-test-state="fail"]{border-color:color-mix(in srgb,var(--mcf-danger) 28%,var(--mcf-border))}
.mcf-page .mcf-modelBlock>.mcf-configModelRow{grid-template-columns:minmax(0,1fr) 64px 64px 96px 32px;column-gap:12px;row-gap:12px;min-height:80px;padding:15px 16px;margin:0;border:0;border-radius:0;background:transparent;cursor:default}
.mcf-page .mcf-configModelRow>.mcf-modelIdentity{grid-column:1;grid-row:1;display:flex;flex-direction:column;align-items:flex-start;gap:5px;min-width:0}
.mcf-page .mcf-modelIdentity .mcf-candId{width:100%;min-width:0;color:var(--mcf-text);font-size:var(--mcf-fs-lead);font-weight:600;line-height:1.75;white-space:normal;word-break:break-word;overflow-wrap:anywhere}
.mcf-page .mcf-modelIdentity .mcf-modelName{min-width:0;max-width:100%;color:var(--mcf-text-2);font-size:var(--mcf-fs-body);line-height:1.65;white-space:normal;overflow-wrap:anywhere}
.mcf-page .mcf-configModelRow>.mcf-modelVision{grid-column:2;grid-row:1}
.mcf-page .mcf-configModelRow>.mcf-modelReasoning{grid-column:3;grid-row:1}
.mcf-page .mcf-configModelRow>.mcf-modelTestCell{grid-column:4;grid-row:1}
.mcf-page .mcf-configModelRow>.mcf-modelDeleteCell{grid-column:5;grid-row:1}
.mcf-page .mcf-modelControl,.mcf-page .mcf-modelTestCell,.mcf-page .mcf-modelDeleteCell{display:flex;justify-content:center;align-items:center;gap:7px;min-width:0}
.mcf-page .mcf-modelControlLabel{display:none;font-size:var(--mcf-fs-body);line-height:var(--mcf-lh-body);color:var(--mcf-text-2)}
.mcf-page .mcf-modelUnavailable{color:var(--mcf-text-3);font-size:var(--mcf-fs-lead)}
.mcf-page .mcf-modelTestCell>.mcf-btn{width:96px;height:34px;padding:0 8px;font-size:var(--mcf-fs-body)}
.mcf-page .mcf-modelDeleteCell>.mcf-iconBtn{width:30px;height:30px;padding:0;border-color:transparent;background:transparent;box-shadow:none;color:var(--mcf-text-3)}
.mcf-page .mcf-modelDeleteCell>.mcf-iconBtn:hover:not(:disabled){color:var(--mcf-danger);background:var(--mcf-danger-soft);border-color:var(--mcf-danger-line)}
.mcf-page .mcf-modelBlock>.mcf-modelFeedback{display:flex;align-items:flex-start;gap:8px;padding:10px 16px;margin:0;border-top:1px solid color-mix(in srgb,var(--mcf-success) 15%,var(--mcf-border));background:color-mix(in srgb,var(--mcf-success) 5%,var(--mcf-surface));font-size:var(--mcf-fs-body);line-height:var(--mcf-lh-body);word-break:break-word;overflow-wrap:anywhere}
.mcf-page .mcf-modelFeedback.mcf-testResultFail{border-color:color-mix(in srgb,var(--mcf-danger) 15%,var(--mcf-border));background:color-mix(in srgb,var(--mcf-danger) 5%,var(--mcf-surface))}
.mcf-page .mcf-modelFeedback>svg{width:15px;height:15px;margin-top:2px;flex:none}
/* Modal child backgrounds must be clipped; a translucent scrim preserves context. */
.mcf-page>.mcf-overlay{background:var(--mcf-scrim);padding:24px;z-index:100;overscroll-behavior:contain}
.mcf-page .mcf-modal{max-height:calc(100dvh - 48px);min-height:0;border:1px solid var(--mcf-border);border-radius:16px;corner-shape:round;overflow:hidden;box-shadow:0 22px 68px #10192e30,0 3px 12px #10192e12}
.mcf-page .mcf-modalAdd{max-width:500px}
.mcf-page .mcf-modal>.mcf-modalHead{flex:none;padding:20px 24px 16px;border-bottom:1px solid var(--mcf-border)}
.mcf-page .mcf-modal .mcf-modalTitle{font-size:var(--mcf-fs-headline);font-weight:650;line-height:1.5}
.mcf-page .mcf-modal .mcf-modalSub{font-size:var(--mcf-fs-body);color:var(--mcf-text-2);line-height:1.8}
.mcf-page .mcf-modal>.mcf-modalBody{min-height:0;overflow-y:auto;overscroll-behavior:contain}
.mcf-page .mcf-modalAdd>.mcf-modalBody{gap:16px;padding:20px 24px 20px}
.mcf-page .mcf-modalAdd .mcf-field>span{font-size:var(--mcf-fs-lead);font-weight:600;color:var(--mcf-text)}
.mcf-page .mcf-modalAdd .mcf-input{height:40px;font-size:var(--mcf-fs-lead)}
.mcf-page .mcf-modalAdd .mcf-testRow{padding:11px 12px;border:1px solid var(--mcf-border);border-radius:8px;background:var(--mcf-neutral);align-items:flex-start}
.mcf-page .mcf-modalAdd .mcf-testRow>.mcf-btn{min-width:60px}
.mcf-page .mcf-modalAdd .mcf-testRow>.mcf-modalHint,.mcf-page .mcf-modalAdd .mcf-testRow>.mcf-testResult{flex:1;min-width:140px;padding-top:5px;font-size:var(--mcf-fs-body);line-height:1.8}
.mcf-page .mcf-modal>.mcf-modalFoot{flex:none;padding:16px 24px;background:var(--mcf-surface-hover)}
.mcf-page .mcf-modalFoot .mcf-btn{font-size:var(--mcf-fs-body);min-height:35px}
@container mcf-provider (max-width:600px){
 .mcf-detailFacts,.mcf-detailModels{padding-left:16px!important;padding-right:16px!important}
 .mcf-facts{grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important}
 .mcf-factBaseURL{grid-column:1/-1}
 .mcf-factItem:nth-child(2){border-left:0;border-top:1px solid var(--mcf-border)}
 .mcf-factItem:nth-child(3){border-top:1px solid var(--mcf-border)}
 .mcf-factState{grid-column:1!important;grid-row:3!important}
 .mcf-factContext{grid-column:2!important;grid-row:3!important}
 .mcf-modelGridHead{display:none!important}
 .mcf-modelBlock>.mcf-configModelRow{grid-template-columns:minmax(0,1fr) minmax(0,1fr) 96px 32px!important;column-gap:8px;padding:13px 14px!important}
 .mcf-configModelRow>.mcf-modelIdentity{grid-column:1/-1!important;grid-row:1!important}
 .mcf-configModelRow>.mcf-modelVision{grid-column:1!important;grid-row:2!important}
 .mcf-configModelRow>.mcf-modelReasoning{grid-column:2!important;grid-row:2!important}
 .mcf-configModelRow>.mcf-modelTestCell{grid-column:3!important;grid-row:2!important}
 .mcf-configModelRow>.mcf-modelDeleteCell{grid-column:4!important;grid-row:2!important}
 .mcf-modelControlLabel{display:block!important}
}
@container mcf-provider (max-width:380px){
 .mcf-facts{grid-template-columns:minmax(0,1fr)!important}
 .mcf-factItem{grid-column:1!important;grid-row:auto!important;border-left:0!important}
 .mcf-factItem:not(:first-child){border-top:1px solid var(--mcf-border)}
 .mcf-modelBlock>.mcf-configModelRow{grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important}
 .mcf-configModelRow>.mcf-modelTestCell{grid-column:1!important;grid-row:3!important}
 .mcf-configModelRow>.mcf-modelDeleteCell{grid-column:2!important;grid-row:3!important;justify-content:flex-end}
 .mcf-modelControl{justify-content:flex-start}
}
@media(max-width:580px){
 .mcf-page>.mcf-split{grid-template-columns:minmax(0,1fr)!important}
 .mcf-page .mcf-providerDisplayName{font-size:var(--mcf-fs-section)}
 .mcf-page .mcf-pageIntro{font-size:var(--mcf-fs-body)}
 .mcf-page>.mcf-overlay{padding:12px}
 .mcf-page .mcf-modal{max-height:calc(100dvh - 24px);border-radius:13px}
 .mcf-page .mcf-modal>.mcf-modalHead,.mcf-page .mcf-modalAdd>.mcf-modalBody,.mcf-page .mcf-modal>.mcf-modalFoot{padding-left:18px;padding-right:18px}
}

/* Scroll ownership: headings are siblings of, never children of, the lists. */
.mcf-page .mcf-splitNav{overflow:hidden;min-height:0}
.mcf-page .mcf-providerNavHead{flex:none;min-height:52px;padding:12px 16px;border-bottom:1px solid var(--mcf-border);background:var(--mcf-surface-hover)}
.mcf-page .mcf-navHeadingTitle{display:flex;align-items:center;gap:8px;min-width:0;color:var(--mcf-text);font-size:var(--mcf-fs-lead);font-weight:650}
.mcf-page .mcf-providerModelHeading{font-size:var(--mcf-fs-meta);font-weight:600;color:var(--mcf-text-2);white-space:nowrap}
.mcf-page .mcf-providerNavHead #navCount{font-size:var(--mcf-fs-meta);font-weight:500;line-height:var(--mcf-lh-meta);min-width:21px;text-align:center;padding:0 5px;background:var(--mcf-neutral);border:1px solid var(--mcf-border);border-radius:5px;color:var(--mcf-text-2)}
.mcf-page .mcf-splitMain>.mcf-splitHead{flex:none}
.mcf-page .mcf-detail{display:flex;flex-direction:column;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;min-height:0}
.mcf-page .mcf-detailFacts{display:flex;flex-direction:column;flex:0 0 auto;max-height:none;min-height:0;overflow:visible;padding-top:16px}
.mcf-page .mcf-detailFacts>.mcf-sectionTitle{flex:none;margin-bottom:10px}
.mcf-page .mcf-detailFacts>.mcf-facts{flex:none;min-height:0;overflow:hidden}
.mcf-page .mcf-detailModels{display:flex;flex-direction:column;flex:1 0 340px;min-height:340px;overflow:hidden;padding-top:16px;padding-bottom:16px}
.mcf-page .mcf-detailBar{flex:none;align-items:center;gap:10px;padding-bottom:12px;flex-wrap:wrap}
.mcf-page .mcf-modelBarActions{display:flex;align-items:center;gap:8px;flex:none;margin-left:auto}
.mcf-page .mcf-modelTable{display:flex;flex-direction:column;flex:1 1 auto;min-height:0;overflow:hidden}
.mcf-page .mcf-modelTable>.mcf-modelGridHead{display:grid;flex:none;grid-template-columns:minmax(0,1fr) 64px 64px 96px 32px;column-gap:12px;padding:11px calc(17px + var(--mcf-model-gutter,15px)) 11px 17px;margin:0 0 9px;border-bottom:1px solid var(--mcf-border);background:var(--mcf-neutral);border-radius:7px 7px 0 0;font-size:var(--mcf-fs-body);font-weight:600;color:var(--mcf-text-2)}
.mcf-page .mcf-modelTable>.mcf-modelList{flex:1 1 auto;min-height:0;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;scrollbar-gutter:stable;scrollbar-width:auto;padding:0 0 3px;gap:10px}
.mcf-page .mcf-modelTable>.mcf-modelList>.mcf-modelBlock{flex:0 0 auto}
.mcf-page .mcf-modelTable>.mcf-modelList::-webkit-scrollbar{width:8px}
.mcf-page .mcf-modelTable>.mcf-modelList::-webkit-scrollbar-thumb{background:color-mix(in srgb,var(--mcf-text-3) 35%,transparent);border-radius:8px;border:2px solid var(--mcf-surface)}
.mcf-page .mcf-modelTable>.mcf-modelList>.mcf-status{padding:14px}
/* The draft model editor has one shared header and compact editable rows. */
.mcf-page .mcf-createModelHeader,.mcf-page .mcf-createModelRow{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,.9fr) 46px 46px 32px;align-items:center;column-gap:9px}
.mcf-page .mcf-createModelHeader{position:sticky;top:0;z-index:1;padding:8px 9px;border-bottom:1px solid var(--mcf-border);background:var(--mcf-neutral);border-radius:7px 7px 0 0;color:var(--mcf-text-2);font-size:var(--mcf-fs-meta);font-weight:600;line-height:var(--mcf-lh-meta)}
.mcf-page .mcf-createModelHeader>span:nth-child(n+3){text-align:center}
.mcf-page .mcf-createModelRow{min-width:0;min-height:55px;gap:6px 9px;padding:8px 9px;border:0;border-bottom:1px solid var(--mcf-border);border-radius:0;background:var(--mcf-surface)}
.mcf-page .mcf-createModelRow:last-child{border-bottom:0}
.mcf-page .mcf-createModelRow>.mcf-field{min-width:0;gap:0}
.mcf-page .mcf-createModelRow>.mcf-field>span{display:none}
.mcf-page .mcf-createModelRow .mcf-input{min-width:0;width:100%;height:35px;font-size:var(--mcf-fs-body)}
.mcf-page .mcf-createModelActions{display:contents}
.mcf-page .mcf-createModelActions>.mcf-rowCheck{justify-self:center;justify-content:center;width:34px;height:34px;font-size:0;gap:0}
.mcf-page .mcf-createModelActions>.mcf-rowCheck:first-child{grid-column:3}
.mcf-page .mcf-createModelActions>.mcf-rowCheck:nth-child(2){grid-column:4}
.mcf-page .mcf-createModelActions>.mcf-iconBtn{grid-column:5;justify-self:center;width:29px;height:29px;color:var(--mcf-danger);border-color:transparent;background:transparent;box-shadow:none}
.mcf-page .mcf-createModelActions>.mcf-iconBtn:hover{border-color:var(--mcf-danger-line);background:var(--mcf-danger-soft)}
.mcf-page .mcf-modalCreate{max-width:670px;height:min(780px,calc(100dvh - 48px))}
/* A rejected create stays legible without scrolling: the reason sits in the
   fixed footer, not only at the end of the scrollable body, and takes its own
   row so a long message never squeezes the buttons. */
.mcf-page .mcf-modalCreate>.mcf-modalFoot{flex-wrap:wrap}
.mcf-page .mcf-modalCreate>.mcf-modalFoot>.mcf-footError{flex:1 0 100%;min-width:0;margin:0;color:var(--mcf-danger);font-size:var(--mcf-fs-meta);line-height:var(--mcf-lh-meta)}
/* A rejected field has to read as an error at a glance: the danger border
   doubles to 2px. Every descendant of the page is border-box, so the edge
   grows inward and nothing shifts; the locked focus ring stays as it is, and
   the message under the field keeps carrying the actual reason. */
.mcf-page .mcf-inputInvalid{border-width:2px}
.mcf-page .mcf-fieldError{font-weight:500}
/* The check-failure block keeps the body's own rhythm once wrapped in one
   scroll target (14px column gap plus the row's own 10px). */
.mcf-page .mcf-createStatus{display:flex;flex-direction:column;gap:14px}
/* The edit dialog states the one thing it cannot change: the route id, which is
   the configuration key and the source of the credential reference. */
.mcf-page .mcf-editRoute{display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin:0;font-size:var(--mcf-fs-meta);line-height:var(--mcf-lh-meta);color:var(--mcf-text-2)}
.mcf-page .mcf-modalCreate .mcf-formGrid{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
.mcf-page .mcf-createModelEditor{flex:none;max-height:310px;overflow-y:auto;overscroll-behavior:contain;border:1px solid var(--mcf-border);border-radius:8px;background:var(--mcf-surface)}
.mcf-page .mcf-modalCreate .mcf-modelRows{gap:0;min-height:55px;overflow:visible;border:0;border-radius:0;background:var(--mcf-surface)}
.mcf-page .mcf-createModelRow .mcf-check{width:15px;height:15px}
.mcf-page .mcf-fetchHint{margin:0;font-size:var(--mcf-fs-meta);line-height:1.7;color:var(--mcf-text-2)}
.mcf-page .mcf-modalCreate .mcf-modelsHead{margin-top:7px}
.mcf-page .mcf-modalCreate .mcf-addRowWrap{margin-top:0}
.mcf-page .mcf-fetchButton{color:var(--mcf-accent);border-color:var(--mcf-tag-line);background:var(--mcf-accent-soft)}
.mcf-page .mcf-fetchButton:hover:not(:disabled){color:var(--mcf-accent);border-color:var(--mcf-accent);background:var(--mcf-accent-soft)}
/* Model discovery: selection is explicit; dialogs fit their content when results are short. */
.mcf-page .mcf-modalLookup{max-width:650px;height:auto;max-height:calc(100dvh - 48px)}
.mcf-page .mcf-modalLookup>.mcf-modalBody{display:flex;flex:0 1 auto;min-height:0;overflow:hidden;gap:11px;padding:16px 20px}
.mcf-page .mcf-lookupToolbar{display:flex;align-items:center;gap:9px;flex:none}
.mcf-page .mcf-lookupSearch{flex:1;min-width:0;width:auto;height:36px;font-size:var(--mcf-fs-lead)}
.mcf-page .mcf-lookupSummary{display:flex;align-items:center;justify-content:space-between;gap:12px;color:var(--mcf-text-2);font-size:var(--mcf-fs-body);line-height:1.6;flex:none}
.mcf-page .mcf-lookupList{flex:0 1 auto;min-height:0;max-height:min(370px,calc(100dvh - 320px));overflow:auto;overscroll-behavior:contain;border:1px solid var(--mcf-border);border-radius:9px;background:var(--mcf-surface)}
.mcf-page .mcf-lookupRow{display:grid;grid-template-columns:18px minmax(0,1fr) auto;gap:3px 11px;align-items:center;padding:10px 12px;border-bottom:1px solid var(--mcf-border);cursor:pointer}
.mcf-page .mcf-lookupRow:hover{background:var(--mcf-surface-hover)}
.mcf-page .mcf-lookupRow:last-child{border-bottom:0}
.mcf-page .mcf-lookupRow[data-configured="true"]{cursor:default}
.mcf-page .mcf-lookupRow>.mcf-check{grid-column:1;grid-row:1/3}
.mcf-page .mcf-lookupIdentity{grid-column:2;display:flex;flex-direction:column;gap:2px;min-width:0}
.mcf-page .mcf-lookupIdentity>code{font-family:inherit;font-size:var(--mcf-fs-lead);font-weight:600;line-height:1.6;word-break:break-word;overflow-wrap:anywhere;color:var(--mcf-text)}
.mcf-page .mcf-lookupName{font-size:var(--mcf-fs-body);line-height:1.6;color:var(--mcf-text-2);overflow-wrap:anywhere}
.mcf-page .mcf-lookupBadge{grid-column:3;grid-row:1/3;font-size:var(--mcf-fs-meta);white-space:nowrap;color:var(--mcf-success);padding:2px 7px;border:1px solid color-mix(in srgb,var(--mcf-success) 20%,var(--mcf-border));border-radius:5px;background:color-mix(in srgb,var(--mcf-success) 4%,var(--mcf-surface))}
.mcf-page .mcf-lookupCaps{grid-column:2/-1;display:flex;flex-wrap:wrap;gap:4px 14px;font-size:var(--mcf-fs-meta);line-height:1.6;color:var(--mcf-text-2)}
.mcf-page .mcf-lookupNotice{font-size:var(--mcf-fs-meta);line-height:1.7;color:var(--mcf-text-2);margin:0}
.mcf-page .mcf-lookupStatus{display:flex;align-items:center;justify-content:center;gap:9px;min-height:66px;padding:8px;color:var(--mcf-text-2);font-size:var(--mcf-fs-body);text-align:center}
.mcf-page .mcf-lookupError{padding:10px 12px;border:1px solid var(--mcf-danger-line);border-radius:9px;background:var(--mcf-danger-soft);color:var(--mcf-danger);font-size:var(--mcf-fs-body);line-height:1.7;white-space:pre-wrap;overflow-wrap:anywhere}
.mcf-page .mcf-modalLookup>.mcf-modalFoot{align-items:center;justify-content:flex-end;gap:8px 12px;flex-wrap:wrap}
.mcf-page .mcf-lookupPicked{margin-right:auto;font-size:var(--mcf-fs-body);color:var(--mcf-text-2);line-height:1.6;font-variant-numeric:tabular-nums}
.mcf-page .mcf-lookupBulk{font-size:var(--mcf-fs-meta)}
@media(max-height:540px){.mcf-page .mcf-modalLookup>.mcf-modalBody{overflow-y:auto}.mcf-page .mcf-lookupList{max-height:none;min-height:110px;flex:none}}
@container mcf-provider (max-width:600px){
 .mcf-page .mcf-detailModels{flex-basis:360px;min-height:360px}
 .mcf-page .mcf-modelBlock>.mcf-configModelRow{column-gap:8px}
 .mcf-page .mcf-modelTable>.mcf-modelGridHead{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1fr) 96px 32px;gap:7px 8px;padding-left:15px;padding-right:calc(15px + var(--mcf-model-gutter,15px))}
 .mcf-modelGridHead>span:first-child{grid-column:1/-1;grid-row:1}
 .mcf-modelGridHead>span:nth-child(2){grid-column:1;grid-row:2}
 .mcf-modelGridHead>span:nth-child(3){grid-column:2;grid-row:2}
 .mcf-modelGridHead>span:nth-child(4){grid-column:3;grid-row:2}
 .mcf-modelGridHead>span:nth-child(5){grid-column:4;grid-row:2}
 .mcf-detailBar>span{font-size:var(--mcf-fs-body)}
}
@container mcf-provider (max-width:380px){
 .mcf-page .mcf-detailModels{flex-basis:410px;min-height:410px}
 .mcf-page .mcf-modelTable>.mcf-modelGridHead{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
 .mcf-modelGridHead>span:nth-child(4){grid-column:1;grid-row:3}
 .mcf-modelGridHead>span:nth-child(5){grid-column:2;grid-row:3;text-align:right}
 .mcf-detailBar>span{flex:1 0 100%}
 .mcf-modelBarActions{margin-left:0;width:100%;justify-content:flex-end}
}
@media(max-width:580px){
 .mcf-page .mcf-providerNavHead{min-height:40px;padding:9px 14px}
 .mcf-page .mcf-createModelHeader,.mcf-page .mcf-createModelRow{grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:6px 9px}
 .mcf-page .mcf-createModelHeader>span:nth-child(n+3){display:none}
 .mcf-page .mcf-createModelActions{grid-column:1/-1;display:flex;align-items:center;justify-content:flex-end;gap:15px}
 .mcf-page .mcf-createModelActions>.mcf-rowCheck{justify-content:flex-start;width:auto;height:25px;font-size:var(--mcf-fs-meta);gap:5px}
 .mcf-page .mcf-createModelActions>.mcf-iconBtn{margin-left:auto}
 .mcf-page .mcf-modalCreate .mcf-formGrid{grid-template-columns:minmax(0,1fr)}
 .mcf-page .mcf-modalCreate .mcf-span2{grid-column:1}
 .mcf-page .mcf-modalLookup{height:auto;max-height:calc(100dvh - 24px)}
 .mcf-page .mcf-modalLookup>.mcf-modalBody{padding:15px 18px;gap:10px}
 .mcf-page .mcf-lookupRow{padding:10px 11px}
}
@media(max-width:420px){
 .mcf-page .mcf-createModelHeader{display:none}
 .mcf-page .mcf-createModelRow{grid-template-columns:minmax(0,1fr);padding:9px 11px}
 .mcf-page .mcf-createModelRow>.mcf-field{gap:3px}
 .mcf-page .mcf-createModelRow>.mcf-field>span{display:block;font-size:var(--mcf-fs-meta);font-weight:500;color:var(--mcf-text-2)}
 .mcf-page .mcf-createModelActions{grid-column:1}
 .mcf-page .mcf-createModelEditor{max-height:275px}
 .mcf-page .mcf-modalLookup .mcf-lookupPicked{width:100%;margin-right:0}
}

.mcf-page{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility}
.mcf-page input,.mcf-page select,.mcf-page textarea,.mcf-page button{font-family:inherit}
.mcf-page .mcf-candId,.mcf-page .mcf-facts dd{letter-spacing:.01em}
.mcf-page .mcf-sectionLabel,.mcf-page .mcf-sectionTitle,.mcf-page .mcf-modelGridHead,.mcf-page .mcf-createModelHeader,.mcf-page .mcf-splitHead,.mcf-page .mcf-popHead{letter-spacing:.03em}
.mcf-page .mcf-modelMeta,.mcf-page .mcf-badge,.mcf-page .mcf-popTag,.mcf-page .mcf-importBadge,.mcf-page .mcf-lookupBadge,.mcf-page .mcf-lookupCaps{font-variant-numeric:tabular-nums}
@media(max-width:1180px){.mcf-page{--mcf-fs-display:21px;--mcf-lh-display:29px;--mcf-fs-headline:18px;--mcf-lh-headline:25px}}
@media(max-width:840px){.mcf-page{--mcf-fs-display:20px;--mcf-lh-display:28px;--mcf-fs-headline:17px;--mcf-lh-headline:24px}}
@media(max-width:580px){.mcf-page{--mcf-fs-display:19px;--mcf-lh-display:27px;--mcf-fs-headline:17px;--mcf-lh-headline:24px}}
.mcf-page[data-view] .mcf-splitItem>.mcf-modelMeta,.mcf-page[data-view] .mcf-modelRow>.mcf-modelMeta{height:auto;min-height:0}

/* ===================== 视觉规范落地 2026-10-02 =====================
   重点更重、辅助更轻。三层文字对比度从 12.85/6.18/4.92 拉开到
   14.27/7.88/4.92（浅）与 14.17/7.67/5.52（深）。
   主色的「填充」与「文字」两种用法分开：#635BFF 作填充 + 白字是
   4.70:1 达标，作文字在深色卡面上只有 3.41:1 不达标。
   本块只覆盖 token 与颜色/字距，不动布局、控制器与事件表达式。 */
.mcf-page{
 /* 字距五档：字号越大越负，越小越正（光学补偿） */
 --mcf-ls-tight:-.02em;--mcf-ls-snug:-.01em;--mcf-ls-normal:0;--mcf-ls-wide:.02em;--mcf-ls-caps:.06em;
 /* 字重四档，与字号反向搭配：字越小越不能轻 */
 --mcf-fw-regular:400;--mcf-fw-medium:500;--mcf-fw-semibold:600;--mcf-fw-bold:650;
 /* 间距 4px 栅格十二档 */
 --mcf-sp-1:4px;--mcf-sp-2:6px;--mcf-sp-3:8px;--mcf-sp-4:10px;--mcf-sp-5:12px;--mcf-sp-6:14px;
 --mcf-sp-7:16px;--mcf-sp-8:20px;--mcf-sp-9:24px;--mcf-sp-10:32px;--mcf-sp-11:40px;--mcf-sp-12:56px;
 /* 文字三层：对白底 14.27 / 7.88 / 4.92
    原为 12.85 / 6.18 / 4.92 —— 次层与辅层只差 1.26，「辅」轻不下来 */
 --mcf-text:#1f2b3d;--mcf-text-2:#44526b;--mcf-text-3:#64718a;
 /* 语义色：warn 由 3.42 提到 5.62，达到 AA */
 --mcf-success:#247763;--mcf-warn:#8a5f1f;--mcf-danger:#b1475c;
 /* 主色填充保持 #635BFF 不动；文字形态另给一个达标值 */
 --mcf-accent-text:#574FE8;
}
body[data-ds-dark-theme] .mcf-page{
 /* 对卡面 14.17 / 7.67 / 5.52
    原为 14.17 / 8.75 / 6.52 —— 深色的「辅」比浅色的「次」还亮，两套主题手感不一致 */
 --mcf-text:#eef1f8;--mcf-text-2:#a9b4c9;--mcf-text-3:#8b98b2;
 --mcf-success:#91cfb8;--mcf-warn:#c4a16e;--mcf-danger:#e397a4;
 --mcf-accent-text:#a89bff;
}
/* 主色作「文字」出现的地方：改用达标的 accent-text。
   选择器与原文逐字相同，靠位置在后取胜，因此不改变布局与继承。 */
.mcf-importBadgeNew{border-color:var(--mcf-accent);color:var(--mcf-accent-text)}
.mcf-badgeOn{border-color:var(--mcf-accent);color:var(--mcf-accent-text)}
.mcf-splitItem[aria-selected="true"]>.mcf-modelMeta{color:var(--mcf-accent-text)}
.mcf-page[data-view="export"] .mcf-modelRow:has(input:checked)>.mcf-candId{color:var(--mcf-accent-text)}
.mcf-popNavItem[aria-selected="true"] .mcf-pickName{color:var(--mcf-accent-text)}
.mcf-popNavItem>.mcf-modelMeta{color:var(--mcf-accent-text)}
.mcf-popRow[aria-current="true"]{color:var(--mcf-accent-text)}
.mcf-popCheck{color:var(--mcf-accent-text)}
.mcf-popRow[aria-current="true"] .mcf-popTag{color:var(--mcf-accent-text)}
.mcf-popChip{color:var(--mcf-accent-text)}
.mcf-popChip b{color:var(--mcf-accent-text)}
.mcf-popNav .mcf-splitItem>.mcf-modelMeta{color:var(--mcf-accent-text)}
.mcf-page .mcf-fetchButton{color:var(--mcf-accent-text)}
.mcf-page .mcf-fetchButton:hover:not(:disabled){color:var(--mcf-accent-text)}
/* 危险操作默认中性，hover 才转红：常驻红会让整页紧张。
   :not(:hover) 让原 :hover 规则继续生效，不抢它的红。 */
.mcf-page[data-view="main"] .mcf-splitMain>.mcf-splitHead .mcf-iconDanger:not(:hover){color:var(--mcf-text-3);border-color:var(--mcf-border)}
/* 字距收口：-.025em / -.2px / .03em 收敛到三档 token */
.mcf-page .mcf-pageTitle{letter-spacing:var(--mcf-ls-tight)}
.mcf-page .mcf-candId,.mcf-page .mcf-splitIcon{letter-spacing:var(--mcf-ls-normal)}
.mcf-page .mcf-sectionLabel,.mcf-page .mcf-sectionTitle,.mcf-page .mcf-modelGridHead,.mcf-page .mcf-createModelHeader,.mcf-page .mcf-splitHead,.mcf-page .mcf-popHead{letter-spacing:var(--mcf-ls-wide)}
/* 间距收口：主视图 23px 与基础 24px 差 1px 无意义，统一到栅格。
   限定 >1100px，避免盖掉窄屏那两档收紧。 */
`;
        /** Render a translate result with `{name}` placeholders filled in. */
        function fill(text, params) {
            return text.replace(/\{(\w+)\}/g, (whole, name) => params[name] ?? whole);
        }
        /** Read a thrown value as displayable copy. */
        function messageOf(error) {
            if (error instanceof Error)
                return error.message;
            return String(error);
        }
        /** Whether an unknown value is a plain JSON object. */
        function isRecord(value) {
            return typeof value === "object" && value !== null && !Array.isArray(value);
        }
        /** Whether a JSON value is a non-null, non-array object. */
        function isJsonObject(value) {
            return typeof value === "object" && value !== null && !Array.isArray(value);
        }
        /** Whether a JSON value is one of the two input modality literals. */
        function isInputModality(value) {
            return value === "text" || value === "image";
        }
        /** Walk a plain JSON path; anything off the path is simply absent. */
        function getPath(source, path) {
            let node = source;
            for (const key of path) {
                if (!isJsonObject(node))
                    return undefined;
                node = node[key];
            }
            return node;
        }
        /**
         * Read a settings subtree as model rows. Entries that are not JSON objects
         * cannot be rendered or edited, so they are dropped instead of asserted.
         */
        function asModelRows(value) {
            if (!Array.isArray(value))
                return undefined;
            const rows = [];
            for (const entry of value) {
                if (isJsonObject(entry))
                    rows.push(entry);
            }
            return rows;
        }
        /** The model rows a namespace serves, effective value first. */
        function modelsOf(namespace, settingsPath) {
            if (namespace === undefined)
                return [];
            const effective = asModelRows(getPath(namespace.value, [...settingsPath, "models"]));
            if (effective !== undefined)
                return effective;
            return asModelRows(getPath(namespace.base, [...settingsPath, "models"])) ?? [];
        }
        /** Wire protocols a hand-declared route may speak, as the official page names them. */
        const KNOWN_PROTOCOLS = ["openai-completions", "openai-responses", "anthropic-messages"];
        /**
         * The reasoning-effort map a hand-declared model gets when reasoning is
         * switched on. Keys are the levels the model offers, values the wire
         * spelling dispatch sends; the adapter pins every level this map omits to
         * "unsupported", so the map decides what the effort selector can show.
         * `off` carries no value because not thinking is the parameter's absence.
         * The ladder is the adapter's own: off, minimal, low, medium, high, xhigh,
         * max. `max` is the declared ceiling here; `minimal`/`xhigh` stay unsupported
         * until an endpoint is known to accept those spellings — adding one is a
         * single entry in this map.
         */
        const REASONING_EFFORTS_ON = { off: null, low: "low", medium: "medium", high: "high", max: "max" };
        /** Whether a model entry declares usable reasoning levels. */
        const reasoningOnOf = (model) => typeof model.reasoningEfforts === "object"
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
        function deriveKeyRef(route) {
            return `${route.toUpperCase().replace(/[^A-Z0-9]+/g, "_")}_API_KEY`;
        }
        /**
         * Whether the value points at an http(s) endpoint.
         * @param value - the candidate Base URL.
         * @returns true when URL-parsable with an http(s) protocol.
         */
        function isHttpUrl(value) {
            try {
                const protocol = new URL(value).protocol;
                return protocol === "http:" || protocol === "https:";
            }
            catch {
                return false;
            }
        }
        /**
         * The route ids already declared under a namespace's `providers` map.
         * @param namespace - the namespace view to inspect.
         * @returns the existing route keys, effective values first.
         */
        function providerRoutesOf(namespace) {
            if (namespace === undefined)
                return [];
            for (const source of [namespace.value, namespace.base]) {
                const providers = getPath(source, ["providers"]);
                if (isRecord(providers))
                    return Object.keys(providers);
            }
            return [];
        }
        /**
         * Protocol choices for a hand-declared route: what sibling providers already
         * speak first, then the protocols the official page knows, deduplicated.
         * @param namespace - the namespace view to inspect.
         * @returns the identifiers a select should offer.
         */
        function protocolChoicesOf(namespace) {
            const choices = [];
            for (const source of [namespace?.value, namespace?.base]) {
                const providers = getPath(source, ["providers"]);
                if (!isRecord(providers))
                    continue;
                for (const profile of Object.values(providers)) {
                    if (!isRecord(profile))
                        continue;
                    const api = profile.api;
                    if (typeof api === "string" && api.length > 0 && !choices.includes(api))
                        choices.push(api);
                }
            }
            for (const known of KNOWN_PROTOCOLS) {
                if (!choices.includes(known))
                    choices.push(known);
            }
            return choices;
        }
        /**
         * Join the declared configurable directory with the live routes, the same
         * order the Models settings page uses: account first, official second.
         * @param registered - live provider routes in registration order.
         * @param declared - declared configurable providers in declaration order.
         * @param nameOf - locale-aware display-name resolver, supplied by the page.
         * @returns one row per provider, deduplicated by route id.
         */ function joinDirectory(registered, declared, nameOf) {
            const directory = declared.map((entry) => ({
                provider: entry.provider,
                displayName: nameOf(entry.provider, entry.displayName),
                settingsNs: entry.settingsNs,
                settingsPath: [...entry.settingsPath],
                directoryError: typeof entry.error === "string" ? entry.error : undefined
            }));
            const known = new Set(directory.map((row) => row.provider));
            for (const provider of registered) {
                if (known.has(provider.id))
                    continue;
                directory.push({
                    provider: provider.id,
                    displayName: nameOf(provider.id, provider.name),
                    settingsNs: "",
                    settingsPath: [],
                    directoryError: undefined
                });
            }
            const rank = (provider) => provider === "deepseek-account" ? 0 : provider === "deepseek-official" ? 1 : 2;
            return directory.sort((left, right) => rank(left.provider) - rank(right.provider));
        }
        /**
         * One rendered provider row: directory entry joined with its settings.
         * @param registered - live provider routes.
         * @param declared - declared configurable providers.
         * @param view - the settings document answer.
         * @returns only rows that are live routes or actually configured.
         */
        function buildRows(registered, declared, view, nameOf) {
            const active = new Set(registered.map((provider) => provider.id));
            const namespaces = new Map(view.namespaces.map((namespace) => [namespace.ns, namespace]));
            const rows = joinDirectory(registered, declared, nameOf).map((entry) => {
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
        function inputFieldOf(row) {
            const ns = row.settingsNs;
            if (ns.startsWith("llm-deepseek"))
                return "inputModalities";
            if (ns === "llm-pi-ai")
                return "input";
            return row.models.some((model) => Array.isArray(model.inputModalities)) ? "inputModalities" : "input";
        }
        /**
         * Effective input types for one row: explicit, else provider default, else text.
         * @param row - the provider row.
         * @param index - the model's position.
         * @param field - the family's input field.
         * @returns the modalities the model accepts right now.
         */
        function effectiveInputTypes(row, index, field) {
            const model = row.models[index];
            if (model === undefined)
                return ["text"];
            const explicit = model[field];
            if (Array.isArray(explicit) && explicit.length > 0)
                return [...explicit];
            const fallback = getPath(row.profile, ["defaultInput"]);
            if (Array.isArray(fallback) && fallback.every(isInputModality))
                return [...fallback];
            return ["text"];
        }
        /** The error message a probe body carries, when it carries a readable one. */
        function readProbeMessage(body) {
            const value = body === undefined ? undefined : body.message;
            return typeof value === "string" && value.length > 0 ? value : undefined;
        }
        /** Whether a probe body reports success. */
        function probeSucceeded(body) {
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
        function monogramOf(row) {
            const source = row.provider.length > 0 ? row.provider : row.displayName;
            const parts = source.split(/[^A-Za-z0-9]+/).filter((part) => part.length > 0);
            const first = parts[0];
            if (first === undefined) {
                const chars = Array.from(row.displayName);
                return chars.length > 0 ? chars[0] ?? "?" : "?";
            }
            const second = parts[1];
            if (second === undefined)
                return first.slice(0, 2).toUpperCase();
            return (first.slice(0, 1) + second.slice(0, 1)).toUpperCase();
        }
        /** Trash glyph for the destructive model / provider actions. */
        function TrashIcon() {
            return h("svg", {
                viewBox: "0 0 16 16", width: 14, height: 14, fill: "none", stroke: "currentColor",
                strokeWidth: 1.4, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true"
            }, h("path", { d: "M2.7 4.4h10.6" }), h("path", { d: "M6.2 4.4V3.2a.7.7 0 0 1 .7-.7h2.2a.7.7 0 0 1 .7.7v1.2" }), h("path", { d: "M12.1 4.4l-.6 8.2a.8.8 0 0 1-.8.8H5.3a.8.8 0 0 1-.8-.8L3.9 4.4" }), h("path", { d: "M6.7 7v3.9" }), h("path", { d: "M9.3 7v3.9" }));
        }
        /** Close glyph for the dialog header. */
        function CloseIcon() {
            return h("svg", {
                viewBox: "0 0 16 16", width: 14, height: 14, fill: "none", stroke: "currentColor",
                strokeWidth: 1.5, strokeLinecap: "round", "aria-hidden": "true"
            }, h("path", { d: "M4.5 4.5l7 7" }), h("path", { d: "M11.5 4.5l-7 7" }));
        }
        /** Download/export glyph: the dialog title tile and the save button. */
        function ExportIcon(props) {
            const size = typeof props.size === "number" ? props.size : 15;
            return h("svg", {
                viewBox: "0 0 24 24", width: size, height: size, fill: "none", stroke: "currentColor",
                strokeWidth: 1.65, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true"
            }, h("path", { d: "M12 3v12m-4-4 4 4 4-4M4 14v6h16v-6" }));
        }
        /** Copy glyph for the export dialog's copy button. */
        function CopyIcon() {
            return h("svg", {
                viewBox: "0 0 24 24", width: 15, height: 15, fill: "none", stroke: "currentColor",
                strokeWidth: 1.65, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true"
            }, h("rect", { x: 8, y: 8, width: 12, height: 12, rx: 2 }), h("path", { d: "M16 8V4H4v12h4" }));
        }
        /** Plaintext-key warning glyph for the export dialog's notice bar. */
        function WarnIcon() {
            return h("svg", {
                viewBox: "0 0 24 24", width: 13, height: 13, fill: "none", stroke: "currentColor",
                strokeWidth: 1.65, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true"
            }, h("path", { d: "m12 3 10 18H2L12 3Z" }), h("path", { d: "M12 9v5M12 17h.1" }));
        }
        /** Refresh glyph for the page toolbar; spins while a load is in flight. */
        function RefreshIcon(props) {
            return h("svg", {
                viewBox: "0 0 16 16", width: 15, height: 15, fill: "none", stroke: "currentColor",
                strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true",
                className: props.spin === true ? "mcf-spin" : undefined
            }, h("path", { d: "M13.5 8a5.5 5.5 0 1 1-1.7-3.9" }), h("path", { d: "M13.5 2.6v3.2h-3.2" }));
        }
        /** The sidebar glyph for this panel. */
        function PanelIcon(props) {
            const size = typeof props.size === "number" ? props.size : 18;
            return h("svg", {
                viewBox: "0 0 24 24", width: size, height: size, fill: "none", stroke: "currentColor",
                strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true",
                style: { display: "block" }
            }, h("path", { d: "M3 7h6" }), h("path", { d: "M15 7h6" }), h("circle", { cx: 12, cy: 7, r: 2.4 }), h("path", { d: "M3 17h9" }), h("path", { d: "M18 17h3" }), h("circle", { cx: 15.6, cy: 17, r: 2.4 }));
        }
        /** Ask the Host half to run one minimal completion. */
        async function testConnection(provider, model) {
            try {
                const response = await fetch(location.origin + TEST_PATH, {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({ provider, model })
                });
                let payload = null;
                try {
                    payload = await response.json();
                }
                catch {
                    payload = null;
                }
                const body = isRecord(payload) ? payload : undefined;
                if (!response.ok)
                    return { ok: false, message: readProbeMessage(body) ?? `HTTP ${response.status}` };
                if (probeSucceeded(body))
                    return { ok: true, message: "" };
                return { ok: false, message: readProbeMessage(body) ?? "connection failed" };
            }
            catch (error) {
                return { ok: false, message: messageOf(error) };
            }
        }
        /** Selection key for one model inside the export dialog. */
        function exportModelKey(provider, modelId) {
            return `${provider}\u0000${modelId}`;
        }
        /**
         * A copy of one row carrying only the ticked models, so an export can ship a
         * subset of a provider's models without touching what the configuration holds.
         * Undefined when no model of that provider is ticked.
         */
        function subsetRow(row, picked) {
            const models = row.models.filter((model) => picked.has(exportModelKey(row.provider, model.id)));
            if (models.length === 0)
                return undefined;
            const stored = getPath(row.profile, ["models"]);
            const ids = new Set(models.map((model) => model.id));
            const profile = isRecord(row.profile) && Array.isArray(stored)
                ? { ...row.profile, models: stored.filter((item) => isRecord(item) && typeof item.id === "string" && ids.has(item.id)) }
                : row.profile;
            return { ...row, models, profile };
        }
        /* ------------------------------------------------------------ export helpers */
        /** Deep-copy one JSON value without asserting a parsed shape. */
        function cloneJson(value) {
            if (Array.isArray(value))
                return value.map((item) => cloneJson(item) ?? null);
            if (isJsonObject(value)) {
                const copy = {};
                for (const [key, entry] of Object.entries(value)) {
                    if (entry === undefined)
                        continue;
                    copy[key] = cloneJson(entry) ?? null;
                }
                return copy;
            }
            return value;
        }
        /** A non-empty string profile field, or null when the profile carries none. */
        function profileString(row, key) {
            const value = getPath(row.profile, [key]);
            return typeof value === "string" && value.length > 0 ? value : null;
        }
        /** The credential reference a provider's profile declares, when it declares one. */
        function keyRefOf(row) {
            const value = getPath(row.profile, ["apiKeyEnv"]);
            return typeof value === "string" && value.length > 0 ? value : undefined;
        }
        /** Every credential reference the given providers declare, deduplicated in order. */
        function keyRefsOf(rows) {
            const refs = [];
            for (const row of rows) {
                const ref = keyRefOf(row);
                if (ref !== undefined && !refs.includes(ref))
                    refs.push(ref);
            }
            return refs;
        }
        /** One provider's export record; the key is stated only when it was read and asked for. */
        function exportedProviderOf(row, secrets, includeKey) {
            const ref = keyRefOf(row) ?? null;
            const value = ref === null ? undefined : secrets[ref];
            const models = row.models.map((model) => {
                const copy = { id: model.id };
                for (const [key, entry] of Object.entries(model)) {
                    if (key === "id" || entry === undefined)
                        continue;
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
        function exportDocumentOf(rows, secrets, includeKey, at) {
            return {
                version: 1,
                exportedAt: at,
                providers: rows.map((row) => exportedProviderOf(row, secrets, includeKey))
            };
        }
        /** Whether a string has to be quoted to stay a YAML scalar. */
        function yamlNeedsQuotes(text) {
            if (text.length === 0)
                return true;
            if (/^\s|\s$/.test(text))
                return true;
            if (/^(?:true|false|yes|no|on|off|null|~)$/i.test(text))
                return true;
            if (/^[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?$/.test(text))
                return true;
            /* YAML's own special floats; a bare `.inf` would come back as Infinity. */
            if (/^[-+]?\.(?:inf|nan)$/i.test(text))
                return true;
            if (/^[-,?:[\]{}#&*!|>'"%@`]/.test(text))
                return true;
            /* A `#` anywhere may open a comment, and a trailing `:` may read as a key. */
            if (/#/.test(text) || /:$/.test(text))
                return true;
            if (/:\s/.test(text))
                return true;
            if (/[\n\r\t]/.test(text))
                return true;
            return false;
        }
        /** One YAML scalar; JSON string escaping is a valid YAML double-quoted form. */
        function yamlScalar(text) {
            return yamlNeedsQuotes(text) ? JSON.stringify(text) : text;
        }
        /** One non-container YAML value. */
        function yamlPrimitive(value) {
            if (value === undefined || value === null)
                return "null";
            if (typeof value === "string")
                return yamlScalar(value);
            if (typeof value === "boolean")
                return value ? "true" : "false";
            return String(value);
        }
        /**
         * Emit one JSON value as YAML block lines at a given indent. Containers get
         * their own lines; scalars print inline for their key, or as a `-` item.
         * @param value - the value to emit.
         * @param indent - current indentation width.
         * @param lines - sink the lines are appended to.
         */
        function emitYaml(value, indent, lines) {
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
                    if (entry === undefined)
                        continue;
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
        function exportYaml(rows, secrets, includeKey, at) {
            const lines = [
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
            const tree = {};
            const skipped = [];
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
                    if (isJsonObject(copy))
                        tree[row.settingsNs] = copy;
                    continue;
                }
                let cursor = section;
                for (const key of path.slice(0, -1)) {
                    const next = cursor[key];
                    if (!isJsonObject(next)) {
                        const created = {};
                        cursor[key] = created;
                        cursor = created;
                        continue;
                    }
                    cursor = next;
                }
                const leaf = path[path.length - 1];
                if (leaf !== undefined)
                    cursor[leaf] = cloneJson(row.profile) ?? null;
            }
            if (skipped.length > 0)
                lines.push("#", `# not configured, skipped: ${skipped.join(", ")}`);
            if (Object.keys(tree).length === 0) {
                lines.push("#", "# nothing to export");
                return `${lines.join("\n")}\n`;
            }
            lines.push("");
            emitYaml(tree, 0, lines);
            return `${lines.join("\n")}\n`;
        }
        /** The `.env` export: one `REF=value` line per declared key reference. */
        function exportEnv(rows, secrets, at) {
            const lines = [`# model-config export ${at}`];
            const refs = keyRefsOf(rows);
            for (const ref of refs) {
                const value = secrets[ref];
                lines.push(value === undefined ? `# not stored: ${ref}` : `${ref}=${value}`);
            }
            return `${lines.join("\n")}\n`;
        }
        /** Render the export in the chosen format. */
        function renderExport(format, rows, secrets, includeKey, at) {
            if (format === "yaml")
                return exportYaml(rows, secrets, includeKey, at);
            if (format === "env")
                return exportEnv(rows, secrets, at);
            return `${JSON.stringify(exportDocumentOf(rows, secrets, includeKey, at), null, 2)}\n`;
        }
        /** The MIME type one export format is saved with. */
        function exportMime(format) {
            if (format === "json")
                return "application/json";
            if (format === "yaml")
                return "text/yaml";
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
        function exportFilename(rows, format, at, total) {
            const pad = (value) => String(value).padStart(2, "0");
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
        function downloadText(filename, text, mime) {
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
        async function fetchSecrets(refs) {
            try {
                const response = await fetch(location.origin + SECRETS_PATH, {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({ refs })
                });
                if (response.status === 404)
                    return { kind: "stale" };
                let payload = null;
                try {
                    payload = await response.json();
                }
                catch {
                    payload = null;
                }
                const body = isRecord(payload) ? payload : undefined;
                if (!response.ok) {
                    return { kind: "error", message: readProbeMessage(body) ?? `HTTP ${response.status}` };
                }
                const values = {};
                const missing = [];
                const rawValues = body?.values;
                for (const ref of refs) {
                    const entry = isRecord(rawValues) ? rawValues[ref] : undefined;
                    if (typeof entry === "string" && entry.length > 0)
                        values[ref] = entry;
                    else
                        missing.push(ref);
                }
                const rawRefused = body?.refused;
                const refused = Array.isArray(rawRefused)
                    ? rawRefused.filter((entry) => typeof entry === "string")
                    : [];
                return { kind: "ok", values, missing, refused };
            }
            catch (error) {
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
        function emptyImportDocument() {
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
        function importErrorText(code, t) {
            if (code === "empty")
                return t("importErrEmpty");
            if (code === "no-providers")
                return t("importErrNoProviders");
            if (code === "no-keys")
                return t("importErrNoKeys");
            if (code === "bad-shape")
                return t("importErrShape");
            if (code === "not-a-mapping")
                return t("importErrMapping");
            if (code === "too-large")
                return t("importErrTooLarge");
            if (code === "tab-indent" || code === "bad-indent" || code === "trailing"
                || code === "unexpected-end" || code === "bad-key" || code === "bad-scalar") {
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
        function parseYamlSubset(text) {
            const lines = [];
            for (const raw of text.split(/\r?\n/)) {
                if (/^\s*$/.test(raw) || /^\s*#/.test(raw))
                    continue;
                const match = /^([ \t]*)([\s\S]*?)\s*$/.exec(raw);
                if (match === null)
                    continue;
                const pad = match[1] ?? "";
                if (pad.includes("\t"))
                    return { value: undefined, error: "tab-indent" };
                lines.push({ indent: pad.length, text: match[2] ?? "" });
            }
            if (lines.length === 0)
                return { value: undefined, error: "empty" };
            const state = { lines, index: 0 };
            const parsed = parseYamlBlock(state, lines[0]?.indent ?? 0);
            if (parsed.error !== null)
                return parsed;
            if (state.index !== lines.length)
                return { value: undefined, error: "trailing" };
            return parsed;
        }
        /** Parse one block: a sequence when the line starts with a dash, else a mapping. */
        function parseYamlBlock(state, indent) {
            const line = state.lines[state.index];
            if (line === undefined)
                return { value: undefined, error: "unexpected-end" };
            if (line.indent !== indent)
                return { value: undefined, error: "bad-indent" };
            if (line.text === "-" || line.text.startsWith("- "))
                return parseYamlSequence(state, indent);
            return parseYamlMapping(state, indent);
        }
        /** Parse a `-` block at one indentation level. */
        function parseYamlSequence(state, indent) {
            const items = [];
            for (;;) {
                const line = state.lines[state.index];
                if (line === undefined || line.indent !== indent)
                    break;
                if (line.text !== "-" && !line.text.startsWith("- "))
                    break;
                const inline = line.text === "-" ? "" : line.text.slice(2).trim();
                state.index += 1;
                if (inline.length === 0) {
                    const next = state.lines[state.index];
                    if (next === undefined || next.indent <= indent) {
                        items.push(null);
                        continue;
                    }
                    const nested = parseYamlBlock(state, next.indent);
                    if (nested.error !== null)
                        return nested;
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
                    if (nested.error !== null)
                        return nested;
                    items.push(nested.value ?? null);
                    continue;
                }
                const scalar = parseYamlScalar(inline);
                if (scalar.error !== null)
                    return scalar;
                items.push(scalar.value ?? null);
            }
            return { value: items, error: null };
        }
        /** Parse a `key: value` block at one indentation level. */
        function parseYamlMapping(state, indent) {
            const value = {};
            for (;;) {
                const line = state.lines[state.index];
                if (line === undefined || line.indent !== indent)
                    break;
                if (line.text === "-" || line.text.startsWith("- "))
                    break;
                const split = splitYamlEntry(line.text);
                if (split === null)
                    return { value: undefined, error: "bad-key" };
                state.index += 1;
                if (split.rest.length === 0) {
                    const next = state.lines[state.index];
                    if (next === undefined || next.indent <= indent) {
                        value[split.key] = null;
                        continue;
                    }
                    const nested = parseYamlBlock(state, next.indent);
                    if (nested.error !== null)
                        return nested;
                    value[split.key] = nested.value ?? null;
                    continue;
                }
                const scalar = parseYamlScalar(split.rest);
                if (scalar.error !== null)
                    return scalar;
                value[split.key] = scalar.value ?? null;
            }
            return { value, error: null };
        }
        /**
         * Split `key: rest` at the key separator, unquoting a quoted key. The
         * separator is the first `:` that ends the line or is followed by a space,
         * so a plain key may itself contain `:` and spaces, exactly as YAML reads it.
         */
        function splitYamlEntry(text) {
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
                if (end < 0)
                    return null;
                let key;
                try {
                    key = JSON.parse(text.slice(0, end + 1));
                }
                catch {
                    return null;
                }
                if (typeof key !== "string")
                    return null;
                const after = text.slice(end + 1).trim();
                if (after === ":")
                    return { key, rest: "" };
                if (after.startsWith(": "))
                    return { key, rest: after.slice(2).trim() };
                return null;
            }
            let at = -1;
            for (let index = 0; index < text.length; index += 1) {
                if (text[index] !== ":")
                    continue;
                const next = text[index + 1];
                if (next === undefined || next === " ") {
                    at = index;
                    break;
                }
            }
            if (at <= 0)
                return null;
            const key = text.slice(0, at).trim();
            if (key.length === 0)
                return null;
            return { key, rest: text.slice(at + 1).trim() };
        }
        /** Read one scalar: the empty containers, JSON-quoted strings, or a bare token. */
        function parseYamlScalar(text) {
            if (text === "[]")
                return { value: [], error: null };
            if (text === "{}")
                return { value: {}, error: null };
            if (text === "null" || text === "~")
                return { value: null, error: null };
            if (text === "true")
                return { value: true, error: null };
            if (text === "false")
                return { value: false, error: null };
            if (text.startsWith("\"")) {
                let parsed;
                try {
                    parsed = JSON.parse(text);
                }
                catch {
                    return { value: undefined, error: "bad-scalar" };
                }
                if (typeof parsed !== "string")
                    return { value: undefined, error: "bad-scalar" };
                return { value: parsed, error: null };
            }
            /* An unquoted `a: b` would be a nested mapping, which this subset does not emit. */
            if (text.includes(": ") || text.endsWith(":"))
                return { value: undefined, error: "bad-scalar" };
            if (/^[-+]?\d+(?:\.\d+)?(?:[eE][-+]?\d+)?$/.test(text)) {
                const number = Number(text);
                if (Number.isFinite(number))
                    return { value: number, error: null };
            }
            return { value: text, error: null };
        }
        /** The format a document is read as when the dialog is set to detect it. */
        function sniffImportFormat(text) {
            const first = text[0];
            if (first === "{" || first === "[")
                return "json";
            for (const raw of text.split(/\r?\n/)) {
                const line = raw.trim();
                if (line.length === 0 || line.startsWith("#"))
                    continue;
                return /^[A-Za-z_][A-Za-z0-9_]*\s*=/.test(line) ? "env" : "yaml";
            }
            return "yaml";
        }
        /** Read the whole document in the chosen (or detected) format. */
        function parseImportDocument(text, format) {
            if (text.trim().length === 0)
                return { format: "json", entries: [], keys: [], error: "empty" };
            const chosen = format === "auto" ? sniffImportFormat(text) : format;
            if (chosen === "env")
                return parseEnvDocument(text);
            if (chosen === "json")
                return parseJsonDocument(text);
            const parsed = parseYamlSubset(text);
            if (parsed.error !== null)
                return { format: "yaml", entries: [], keys: [], error: parsed.error };
            return yamlDocumentOf(parsed.value);
        }
        /** Read a `.env` document: `REF=value` lines, comments ignored. */
        function parseEnvDocument(text) {
            const keys = [];
            for (const raw of text.split(/\r?\n/)) {
                const line = raw.trim();
                if (line.length === 0 || line.startsWith("#"))
                    continue;
                const at = line.indexOf("=");
                if (at <= 0)
                    continue;
                const ref = line.slice(0, at).trim();
                const value = line.slice(at + 1).trim();
                if (!KEY_REF_PATTERN.test(ref) || value.length === 0)
                    continue;
                keys.push({ ref, value });
            }
            return { format: "env", entries: [], keys, error: keys.length === 0 ? "no-keys" : null };
        }
        /** Read the JSON export shape: a document, an array of records, or one record. */
        function parseJsonDocument(text) {
            let parsed;
            try {
                parsed = JSON.parse(text);
            }
            catch (error) {
                return { format: "json", entries: [], keys: [], error: messageOf(error) };
            }
            let records = null;
            if (Array.isArray(parsed))
                records = parsed;
            else if (isRecord(parsed)) {
                const list = parsed["providers"];
                records = Array.isArray(list) ? list : [parsed];
            }
            if (records === null)
                return { format: "json", entries: [], keys: [], error: "bad-shape" };
            const entries = [];
            for (const record of records) {
                if (!isRecord(record))
                    continue;
                const entry = importEntryOfRecord(record);
                if (entry !== null)
                    entries.push(entry);
            }
            return { format: "json", entries, keys: [], error: entries.length === 0 ? "no-providers" : null };
        }
        /** One JSON export record as an import entry, tolerating a missing profile. */
        function importEntryOfRecord(record) {
            const provider = typeof record["provider"] === "string" && record["provider"].length > 0 ? record["provider"] : null;
            const settingsNs = typeof record["settingsNs"] === "string" && record["settingsNs"].length > 0 ? record["settingsNs"] : null;
            if (settingsNs === null)
                return null;
            const rawPath = record["settingsPath"];
            const settingsPath = Array.isArray(rawPath)
                ? rawPath.filter((part) => typeof part === "string")
                : provider === null
                    ? []
                    : ["providers", provider];
            const rawProfile = record["profile"];
            let profile;
            if (isRecord(rawProfile))
                profile = (cloneJson(rawProfile) ?? {});
            else {
                /* An older or hand-written record: rebuild the profile from its summary fields. */
                const rebuilt = {};
                for (const key of ["api", "baseURL", "displayName", "apiKeyEnv"]) {
                    const value = record[key];
                    if (typeof value === "string" && value.length > 0)
                        rebuilt[key] = value;
                }
                if (Array.isArray(record["models"]))
                    rebuilt["models"] = cloneJson(record["models"]) ?? [];
                if (Object.keys(rebuilt).length === 0)
                    return null;
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
        function yamlDocumentOf(value) {
            if (!isJsonObject(value))
                return { format: "yaml", entries: [], keys: [], error: "not-a-mapping" };
            const entries = [];
            for (const [ns, section] of Object.entries(value)) {
                if (!isJsonObject(section))
                    continue;
                const providers = section["providers"];
                if (isJsonObject(providers)) {
                    for (const [route, profile] of Object.entries(providers)) {
                        if (!isJsonObject(profile))
                            continue;
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
        function importEntryOfProfile(ns, path, provider, profile) {
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
        function rowRouteFor(rows, ns) {
            for (const row of rows) {
                if (row.settingsNs === ns && row.settingsPath.length === 0)
                    return row.provider;
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
        function planImport(document, context) {
            const planned = new Map();
            for (const entry of document.entries) {
                const provider = entry.provider ?? rowRouteFor(context.rows, entry.settingsNs);
                const section = context.sectionOf(entry.settingsNs);
                const models = entry.profile["models"];
                const problem = provider === null
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
                planned.set(`${entry.settingsNs}\u0000${entry.settingsPath.join("\u0000")}`, {
                    ...entry,
                    provider,
                    displayName,
                    modelCount: Array.isArray(models) ? models.length : 0,
                    overwrite,
                    problem
                });
            }
            return Array.from(planned.values());
        }
        /**
         * The credential writes an import performs: keys carried by the document's
         * own records first, then any `.env` lines, which win because they are the
         * document's explicit statement about that reference.
         */
        function importKeyWrites(document, candidates) {
            const writes = [];
            const push = (ref, value) => {
                if (!KEY_REF_PATTERN.test(ref) || value.length === 0)
                    return;
                const at = writes.findIndex((entry) => entry.ref === ref);
                if (at >= 0)
                    writes[at] = { ref, value };
                else
                    writes.push({ ref, value });
            };
            for (const candidate of candidates) {
                if (candidate.problem !== null || candidate.apiKey === null)
                    continue;
                const ref = candidate.apiKeyEnv
                    ?? (candidate.provider === null ? null : deriveKeyRef(candidate.provider));
                if (ref !== null)
                    push(ref, candidate.apiKey);
            }
            for (const entry of document.keys)
                push(entry.ref, entry.value);
            return writes;
        }
        /** How many candidates an import would add, replace, or has to skip. */
        function importSummary(candidates) {
            let add = 0;
            let replace = 0;
            let blocked = 0;
            let models = 0;
            for (const candidate of candidates) {
                if (candidate.problem !== null) {
                    blocked += 1;
                    continue;
                }
                if (candidate.overwrite)
                    replace += 1;
                else
                    add += 1;
                models += candidate.modelCount;
            }
            return { add, replace, blocked, models };
        }
        return {
            inject: ["slots", "locale", "remote", "remote.llm", "remote.settings", "remote.credentials"],
            apply(ctx) {
                ctx.effect(() => ctx.locale.register(NS, { zh, en }), "model-config: dictionaries");
                const t = ctx.locale.bind(NS);
                /**
                 * Display name for one provider: the two built-in DeepSeek routes get
                 * locale-aware names that say which channel they are, everything else
                 * keeps the name the adapter itself reports.
                 * @param provider - the route id.
                 * @param fallback - the name reported by the directory or adapter.
                 * @returns the name to render.
                 */
                function displayNameOf(provider, fallback) {
                    if (provider === "deepseek-account")
                        return t("nameDeepseekAccount");
                    if (provider === "deepseek-official")
                        return t("nameDeepseekOfficial");
                    return fallback;
                }
                /** The page: provider accordion, model rows, add form, probe results. */
                function ModelConfigPage(props) {
                    const [state, setState] = React.useState({
                        status: "loading",
                        error: null,
                        refreshing: true,
                        updatedAt: null,
                        writable: false,
                        rows: [],
                        namespaces: new Map()
                    });
                    const [focusProvider, setFocusProvider] = React.useState(null);
                    const [lookup, setLookup] = React.useState(null);
                    const [lookupQuery, setLookupQuery] = React.useState("");
                    const [lookupPicked, setLookupPicked] = React.useState(new Set());
                    const [lookupSaving, setLookupSaving] = React.useState(false);
                    const lookupSavingRef = React.useRef(false);
                    const lookupGeneration = React.useRef(0);
                    const lookupAbort = React.useRef(null);
                    const modelScrollRef = React.useRef(null);
                    const [busy, setBusy] = React.useState({});
                    const [tests, setTests] = React.useState({});
                    const [adding, setAdding] = React.useState(null);
                    const [draft, setDraft] = React.useState({ id: "", name: "" });
                    const [addError, setAddError] = React.useState(null);
                    const [rowError, setRowError] = React.useState({});
                    const [modalTest, setModalTest] = React.useState(null);
                    const [confirming, setConfirming] = React.useState(null);
                    const [creating, setCreating] = React.useState(null);
                    const [createError, setCreateError] = React.useState(null);
                    const [editing, setEditing] = React.useState(null);
                    const [editError, setEditError] = React.useState(null);
                    const [editAttempted, setEditAttempted] = React.useState(false);
                    const [editBusy, setEditBusy] = React.useState(false);
                    const [createBusy, setCreateBusy] = React.useState(false);
                    const [createAttempted, setCreateAttempted] = React.useState(false);
                    const [probePassed, setProbePassed] = React.useState(false);
                    const [skipProbe, setSkipProbe] = React.useState(false);
                    const [probeBusy, setProbeBusy] = React.useState(false);
                    const [probeError, setProbeError] = React.useState(null);
                    const [flash, setFlash] = React.useState(null);
                    const [pulseTick, setPulseTick] = React.useState(0);
                    const [pulse, setPulse] = React.useState(false);
                    const [exporting, setExporting] = React.useState(null);
                    const [exportPicked, setExportPicked] = React.useState(new Set());
                    const [exportFocus, setExportFocus] = React.useState(null);
                    const [exportQuery, setExportQuery] = React.useState("");
                    const [exportFormat, setExportFormat] = React.useState("json");
                    const [includeKey, setIncludeKey] = React.useState(true);
                    const [exportCopy, setExportCopy] = React.useState("idle");
                    const [secrets, setSecrets] = React.useState({
                        status: "idle",
                        values: {},
                        missing: [],
                        refused: [],
                        error: null
                    });
                    const exportTextRef = React.useRef(null);
                    const [importing, setImporting] = React.useState(false);
                    const [importText, setImportText] = React.useState("");
                    const [importFormat, setImportFormat] = React.useState("auto");
                    const [importIncludeKeys, setImportIncludeKeys] = React.useState(true);
                    const [importBusy, setImportBusy] = React.useState(false);
                    const [importError, setImportError] = React.useState(null);
                    const importFileRef = React.useRef(null);
                    /* The creation-success note clears itself; no timer to manage by hand. */
                    React.useEffect(() => {
                        if (flash === null)
                            return;
                        const timer = window.setTimeout(() => setFlash(null), 5000);
                        return () => window.clearTimeout(timer);
                    }, [flash]);
                    /* A failed submit briefly pulses the offending fields and lands the
                     * caret in the first one, so a rejection is never silent. Both dialogs
                     * share the counter; each focus helper ignores the draft it does not own. */
                    React.useEffect(() => {
                        if (pulseTick === 0)
                            return;
                        setPulse(true);
                        focusFirstInvalidCreateField();
                        focusFirstInvalidEditField();
                        const timer = window.setTimeout(() => setPulse(false), 600);
                        return () => window.clearTimeout(timer);
                    }, [pulseTick]);
                    const [fetching, setFetching] = React.useState(false);
                    const [fetchError, setFetchError] = React.useState(null);
                    const [candidates, setCandidates] = React.useState(null);
                    const [picked, setPicked] = React.useState(new Set());
                    const [candidateQuery, setCandidateQuery] = React.useState("");
                    const [draftAddedCount, setDraftAddedCount] = React.useState(0);
                    const fetchGeneration = React.useRef(0);
                    const fetchAbort = React.useRef(null);
                    const createBaseURLRef = React.useRef(null);
                    const createModelsRef = React.useRef(null);
                    const createRouteRef = React.useRef(null);
                    const createKeyRef = React.useRef(null);
                    const createStatusRef = React.useRef(null);
                    const editBaseURLRef = React.useRef(null);
                    const editKeyRef = React.useRef(null);
                    const editModelsRef = React.useRef(null);
                    const [, setLocaleTick] = React.useState(0);
                    const generation = React.useRef(0);
                    React.useEffect(() => {
                        if (draftAddedCount === 0 || candidates !== null)
                            return;
                        const frame = window.requestAnimationFrame(() => createModelsRef.current?.scrollIntoView({ block: "start" }));
                        const timer = window.setTimeout(() => setDraftAddedCount(0), 5000);
                        return () => { window.cancelAnimationFrame(frame); window.clearTimeout(timer); };
                    }, [draftAddedCount, candidates]);
                    /* A failed check or a refused write must not sit unseen below a
                     * scrollable body: bring its line into view as soon as it appears. */
                    React.useEffect(() => {
                        if (probeError === null)
                            return;
                        createStatusRef.current?.scrollIntoView({ block: "nearest" });
                    }, [probeError]);
                    React.useEffect(() => () => {
                        ++fetchGeneration.current;
                        fetchAbort.current?.abort();
                    }, []);
                    const load = React.useCallback(async () => {
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
                            if (!registered.ok)
                                throw new Error(registered.error.message);
                            if (!declared.ok)
                                throw new Error(declared.error.message);
                            if (!described.ok)
                                throw new Error(described.error.message);
                            const view = described.value;
                            if (mine !== generation.current)
                                return;
                            setState({
                                status: "ready",
                                error: null,
                                refreshing: false,
                                updatedAt: new Date().toLocaleTimeString(),
                                writable: view.writable === true,
                                rows: buildRows(registered.value, declared.value, view, displayNameOf),
                                namespaces: new Map(view.namespaces.map((namespace) => [namespace.ns, namespace]))
                            });
                        }
                        catch (error) {
                            if (mine !== generation.current)
                                return;
                            setState((previous) => ({ ...previous, status: "error", refreshing: false, error: messageOf(error) }));
                        }
                    }, []);
                    React.useEffect(() => {
                        void load();
                        const disposers = [];
                        const remote = ctx.remote;
                        if (typeof remote.$on === "function") {
                            disposers.push(remote.$on("settings/document-updated", load));
                            disposers.push(remote.$on("llm/adapters-updated", load));
                        }
                        disposers.push(ctx.locale.subscribe(() => setLocaleTick((value) => value + 1)));
                        return () => {
                            for (const dispose of disposers)
                                dispose();
                        };
                    }, [load]);
                    /* Use the real platform gutter, not a guessed scrollbar width, for column alignment. */
                    React.useLayoutEffect(() => {
                        const scroller = modelScrollRef.current;
                        if (scroller === null)
                            return;
                        const measureModelGutter = () => {
                            scroller.parentElement?.style.setProperty("--mcf-model-gutter", `${Math.max(0, scroller.offsetWidth - scroller.clientWidth)}px`);
                        };
                        measureModelGutter();
                        const observer = new ResizeObserver(measureModelGutter);
                        observer.observe(scroller);
                        return () => observer.disconnect();
                    }, [focusProvider, state.status, state.rows.length]);
                    /** Read candidates through the installed SDK; never write settings or credentials. */
                    const runLookup = async (row) => {
                        lookupAbort.current?.abort();
                        const controller = new AbortController();
                        lookupAbort.current = controller;
                        const mine = ++lookupGeneration.current;
                        setLookupPicked(new Set());
                        const name = row.displayName.length === 0 ? row.provider : row.displayName;
                        setLookup({ provider: row.provider, name, status: "loading", models: [], error: null });
                        try {
                            if (row.settingsNs.length === 0) {
                                setLookup({ provider: row.provider, name, status: "error", models: [], error: t("lookupNoNamespace") });
                                return;
                            }
                            const baseURL = profileString(row, "baseURL");
                            const api = profileString(row, "api");
                            const answer = await ctx.remote.llm.discoverModels(row.settingsNs, {
                                provider: row.provider,
                                ...(baseURL === null ? {} : { baseURL }),
                                ...(api === null ? {} : { api })
                            }, controller.signal);
                            if (mine !== lookupGeneration.current || controller.signal.aborted)
                                return;
                            if (!answer.ok) {
                                const message = answer.error.message;
                                const explained = message.includes("no model discovery is registered")
                                    ? t("lookupNoDiscovery")
                                    : message.includes("has no model listing this build can read")
                                        ? t("lookupUnsupported")
                                        : message.length === 0 ? t("lookupFailed") : describeFetchFailure(message);
                                setLookup({ provider: row.provider, name, status: "error", models: [], error: explained });
                                return;
                            }
                            const models = new Map();
                            for (const model of answer.value) {
                                if (typeof model.id === "string" && model.id.length > 0 && !models.has(model.id))
                                    models.set(model.id, model);
                            }
                            setLookup({ provider: row.provider, name, status: "ready", models: [...models.values()], error: null });
                        }
                        catch (error) {
                            if (mine !== lookupGeneration.current || controller.signal.aborted)
                                return;
                            setLookup({ provider: row.provider, name, status: "error", models: [], error: messageOf(error) || t("lookupFailed") });
                        }
                    };
                    const closeLookup = () => {
                        if (lookupSavingRef.current)
                            return;
                        ++lookupGeneration.current;
                        lookupAbort.current?.abort();
                        lookupAbort.current = null;
                        setLookup(null);
                        setLookupQuery("");
                        setLookupPicked(new Set());
                    };
                    const startLookup = (row) => {
                        if (adding !== null || creating !== null || exporting !== null || confirming !== null || importing)
                            return;
                        setLookupQuery("");
                        void runLookup(row);
                    };
                    React.useEffect(() => {
                        if (lookup === null)
                            return;
                        const onLookupKey = (event) => {
                            if (event.key === "Escape")
                                closeLookup();
                        };
                        document.addEventListener("keydown", onLookupKey);
                        return () => document.removeEventListener("keydown", onLookupKey);
                    }, [lookup !== null]);
                    React.useEffect(() => () => {
                        ++lookupGeneration.current;
                        lookupAbort.current?.abort();
                    }, []);
                    /** Replace one provider's model catalog through the settings wire. */
                    const commit = async (row, nextModels, reportError) => {
                        const namespace = state.namespaces.get(row.settingsNs);
                        if (namespace === undefined) {
                            setRowError((current) => ({ ...current, [row.provider]: t("noNamespace") }));
                            reportError?.(t("noNamespace"));
                            return false;
                        }
                        setBusy((current) => ({ ...current, [row.provider]: true }));
                        try {
                            const ops = [{
                                    op: "set",
                                    path: [...row.settingsPath, "models"],
                                    value: nextModels
                                }];
                            const response = await ctx.remote.settings.mutate(row.settingsNs, ops, namespace.revision);
                            if (!response.ok) {
                                const conflict = response.error.code === "settings/conflict";
                                const message = conflict ? t("conflict") : response.error.message;
                                setRowError((current) => ({ ...current, [row.provider]: message }));
                                reportError?.(message);
                                if (conflict)
                                    await load();
                                return false;
                            }
                            setRowError((current) => ({ ...current, [row.provider]: undefined }));
                            await load();
                            return true;
                        }
                        finally {
                            setBusy((current) => ({ ...current, [row.provider]: false }));
                        }
                    };
                    /** Commit only newly selected catalog IDs through the original revision-checked model writer. */
                    const saveLookup = async () => {
                        const current = lookup;
                        if (current?.status !== "ready" || lookupSavingRef.current)
                            return;
                        const row = state.rows.find((entry) => entry.provider === current.provider);
                        if (row === undefined || !row.editable || !state.writable) {
                            setLookup((previous) => previous === null ? previous : { ...previous, error: t("lookupNotWritable") });
                            return;
                        }
                        if (busy[row.provider] === true)
                            return;
                        const existing = new Set(row.models.map((model) => model.id));
                        const additions = current.models
                            .filter((model) => lookupPicked.has(model.id) && !existing.has(model.id))
                            .map((model) => ({
                            id: model.id,
                            ...(typeof model.name === "string" && model.name.trim().length > 0 ? { name: model.name.trim() } : {}),
                            ...(typeof model.contextWindow === "number" && Number.isFinite(model.contextWindow) && model.contextWindow > 0
                                ? { contextWindow: model.contextWindow } : {}),
                            ...(typeof model.maxTokens === "number" && Number.isFinite(model.maxTokens) && model.maxTokens > 0
                                ? { maxTokens: model.maxTokens } : {})
                        }));
                        if (additions.length === 0) {
                            setLookup((previous) => previous === null ? previous : { ...previous, error: t("lookupNothingNew") });
                            return;
                        }
                        lookupSavingRef.current = true;
                        setLookupSaving(true);
                        let saved = false;
                        try {
                            saved = await commit(row, [...row.models, ...additions], (message) => {
                                setLookup((previous) => previous === null ? previous : { ...previous, error: message });
                            });
                            if (saved)
                                setFlash(fill(t("lookupAdded"), { count: String(additions.length), provider: current.name }));
                        }
                        catch (error) {
                            setLookup((previous) => previous === null ? previous : { ...previous, error: messageOf(error) || t("lookupFailed") });
                        }
                        finally {
                            lookupSavingRef.current = false;
                            setLookupSaving(false);
                            if (saved)
                                closeLookup();
                        }
                    };
                    /** Turn the image input type on or off for exactly one model row. */
                    const toggleVision = async (row, index) => {
                        const field = inputFieldOf(row);
                        const current = effectiveInputTypes(row, index, field);
                        const hasImage = current.includes("image");
                        const next = hasImage
                            ? current.filter((type) => type !== "image")
                            : [...new Set([...current, "image"])];
                        const chosen = next.length > 0 ? next : ["text"];
                        const source = row.models[index];
                        if (source === undefined)
                            return;
                        const nextModel = { ...source };
                        if (field === "inputModalities")
                            nextModel.inputModalities = chosen;
                        else
                            nextModel.input = chosen;
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
                    const toggleReasoning = async (row, index) => {
                        const source = row.models[index];
                        if (source === undefined)
                            return;
                        const nextModel = { ...source };
                        nextModel.reasoningEfforts = reasoningOnOf(source)
                            ? false
                            : { ...REASONING_EFFORTS_ON };
                        await commit(row, row.models.map((model, at) => at === index ? nextModel : model));
                    };
                    /** Append a hand-written model id to one provider's catalog. */
                    const submitAdd = async (row) => {
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
                        const next = [...row.models, name.length === 0 ? { id } : { id, name }];
                        const saved = await commit(row, next);
                        if (saved) {
                            setDraft({ id: "", name: "" });
                            setAddError(null);
                            setModalTest(null);
                            setAdding(null);
                        }
                    };
                    /** Probe one exact model through the Host route. */
                    const runTest = async (row, id, key) => {
                        setTests((current) => ({ ...current, [key]: { status: "testing", message: "" } }));
                        const result = await testConnection(row.provider, id);
                        setTests((current) => ({
                            ...current,
                            [key]: result.ok
                                ? { status: "ok", message: t("testOk") }
                                : { status: "fail", message: result.message }
                        }));
                    };
                    const startAdd = (row) => {
                        setAdding(row.provider);
                        setDraft({ id: "", name: "" });
                        setAddError(null);
                        setModalTest(null);
                    };
                    /** Close the add-model dialog and drop its transient probe state. */
                    const closeAdd = () => {
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
                    const loadExportSecrets = async (rows) => {
                        const seq = exportSecretSeq.current + 1;
                        exportSecretSeq.current = seq;
                        const refs = keyRefsOf(rows);
                        if (refs.length === 0) {
                            setSecrets({ status: "ready", values: {}, missing: [], refused: [], error: null });
                            return;
                        }
                        setSecrets({ status: "loading", values: {}, missing: [], refused: [], error: null });
                        const answer = await fetchSecrets(refs);
                        if (exportSecretSeq.current !== seq)
                            return;
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
                     * from a card's own button, everything from the toolbar. Selection is
                     * per model, so a provider can be exported partially.
                     */
                    const startExport = (rows, picked) => {
                        if (rows.length === 0)
                            return;
                        const wanted = new Set(picked ?? rows.map((row) => row.provider));
                        const chosen = rows.filter((row) => wanted.has(row.provider));
                        const selected = chosen.length > 0 ? chosen : [...rows];
                        setExporting({ rows: [...rows], at: new Date().toISOString() });
                        setExportPicked(new Set(selected.flatMap((row) => row.models.map((model) => exportModelKey(row.provider, model.id)))));
                        setExportFocus(selected[0]?.provider ?? rows[0]?.provider ?? null);
                        setExportQuery("");
                        setExportFormat("json");
                        setIncludeKey(true);
                        setExportCopy("idle");
                        setSecrets({ status: "idle", values: {}, missing: [], refused: [], error: null });
                        void loadExportSecrets(selected);
                    };
                    /** Close the export dialog and drop its transient lookup state. */
                    const closeExport = () => {
                        exportSecretSeq.current += 1;
                        setExporting(null);
                        setExportPicked(new Set());
                        setExportFocus(null);
                        setExportQuery("");
                        setExportCopy("idle");
                        setSecrets({ status: "idle", values: {}, missing: [], refused: [], error: null });
                    };
                    /**
                     * Copy the rendered export. The async clipboard is preferred; a
                     * selection of the read-only preview is the fallback for the
                     * contexts where the API is unavailable or refused.
                     */
                    const copyExport = async (text) => {
                        try {
                            if (typeof navigator !== "undefined" && navigator.clipboard !== undefined) {
                                await navigator.clipboard.writeText(text);
                                setExportCopy("ok");
                                return;
                            }
                        }
                        catch {
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
                        }
                        catch {
                            copied = false;
                        }
                        setExportCopy(copied ? "ok" : "fail");
                    };
                    /** Open the import dialog, empty. */
                    const startImport = () => {
                        setImporting(true);
                        setImportText("");
                        setImportFormat("auto");
                        setImportIncludeKeys(true);
                        setImportBusy(false);
                        setImportError(null);
                    };
                    /** Close the import dialog and drop its transient state. */
                    const closeImport = () => {
                        setImporting(false);
                        setImportBusy(false);
                        setImportError(null);
                    };
                    /** Read one picked file into the paste box. */
                    const pickImportFile = async (file) => {
                        if (file === undefined)
                            return;
                        try {
                            setImportText(await file.text());
                            setImportError(null);
                        }
                        catch (error) {
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
                    const applyImport = async (candidates, keys) => {
                        const ready = candidates.filter((candidate) => candidate.problem === null);
                        if (ready.length === 0 && keys.length === 0)
                            return;
                        setImportBusy(true);
                        setImportError(null);
                        try {
                            const byNamespace = new Map();
                            for (const candidate of ready) {
                                const list = byNamespace.get(candidate.settingsNs);
                                if (list === undefined)
                                    byNamespace.set(candidate.settingsNs, [candidate]);
                                else
                                    list.push(candidate);
                            }
                            let written = 0;
                            const failures = [];
                            for (const [ns, list] of byNamespace) {
                                const namespace = state.namespaces.get(ns);
                                if (namespace === undefined) {
                                    failures.push(fill(t("importNsFailed"), { ns, message: t("noNamespace") }));
                                    continue;
                                }
                                const ops = list.map((candidate) => ({
                                    op: "set",
                                    path: [...candidate.settingsPath],
                                    value: candidate.profile
                                }));
                                let response;
                                try {
                                    response = await ctx.remote.settings.mutate(ns, ops, namespace.revision);
                                }
                                catch (error) {
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
                                        if (answer.ok)
                                            stored += 1;
                                        else
                                            failures.push(fill(t("importKeyFailed"), { ref: entry.ref, message: answer.error.message }));
                                    }
                                    catch (error) {
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
                        }
                        finally {
                            setImportBusy(false);
                        }
                    };
                    /**
                     * Open the new-provider dialog over the first namespace whose schema
                     * hosts a `providers` map — in practice the pi-ai namespace.
                     */
                    const startCreate = () => {
                        const eligible = [...state.namespaces.values()].filter((namespace) => isRecord(getPath(namespace.value, ["providers"])) || isRecord(getPath(namespace.base, ["providers"])));
                        const target = eligible[0];
                        if (target === undefined)
                            return;
                        setCreateError(null);
                        setCreateAttempted(false);
                        setProbePassed(false);
                        setSkipProbe(false);
                        setProbeError(null);
                        ++fetchGeneration.current;
                        fetchAbort.current?.abort();
                        setFetching(false);
                        setFetchError(null);
                        setCandidates(null);
                        setPicked(new Set());
                        setDraftAddedCount(0);
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
                    /** Leave the model-selection step without discarding the provider draft. */
                    const closeCandidatePicker = () => {
                        setCandidates(null);
                        setPicked(new Set());
                        setCandidateQuery("");
                    };
                    /** Close the new-provider dialog. */
                    const closeCreate = () => {
                        ++fetchGeneration.current;
                        fetchAbort.current?.abort();
                        setFetching(false);
                        setDraftAddedCount(0);
                        setCreating(null);
                        setCreateError(null);
                        setCreateAttempted(false);
                        setProbePassed(false);
                        setSkipProbe(false);
                        setProbeError(null);
                        setFetchError(null);
                        setCandidates(null);
                        setPicked(new Set());
                        setCandidateQuery("");
                    };
                    /**
                     * Put the caret in the first box a rejected create complained about,
                     * with the same checks submitCreate applies. The pulse effect calls
                     * this on every failed submit, not just the first, so pressing
                     * 「创建」 can never look like it did nothing.
                     */
                    const focusFirstInvalidCreateField = () => {
                        const draft = creating;
                        if (draft === null)
                            return;
                        const namespace = state.namespaces.get(draft.ns);
                        const route = draft.route.trim();
                        if (!ROUTE_PATTERN.test(route) || providerRoutesOf(namespace).includes(route)) {
                            createRouteRef.current?.focus();
                            return;
                        }
                        const baseURL = draft.baseURL.trim();
                        if (baseURL.length === 0 || !isHttpUrl(baseURL)) {
                            createBaseURLRef.current?.focus();
                            return;
                        }
                        if (draft.apiKey.trim().length === 0) {
                            createKeyRef.current?.focus();
                            return;
                        }
                        createModelsRef.current?.scrollIntoView({ block: "start" });
                    };
                    /**
                     * Translate the llm runtime's English discovery failures into the
                     * page's language; unknown shapes pass through untouched.
                     */
                    const describeFetchFailure = (message) => {
                        if (message.includes("no model discovery is registered"))
                            return t("lookupNoDiscovery");
                        if (message.includes("has no model listing this build can read"))
                            return t("lookupUnsupported");
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
                    const protocolLabel = (identifier) => {
                        if (identifier === "openai-completions")
                            return t("protocolOpenAiCompletions");
                        if (identifier === "openai-responses")
                            return t("protocolOpenAiResponses");
                        if (identifier === "anthropic-messages")
                            return t("protocolAnthropicMessages");
                        return identifier;
                    };
                    /**
                     * Map the adapter's English validation failures onto the page's
                     * language; anything unrecognized passes through untouched.
                     */
                    const translateRowError = (message) => {
                        if (message === undefined)
                            return undefined;
                        if (message.includes("resolves no models"))
                            return t("lastModelGuard");
                        return message;
                    };
                    /** Patch one field of the new-provider draft; endpoint edits un-pass the probe. */
                    const patchCreate = (patch) => {
                        if (patch.baseURL !== undefined || patch.apiKey !== undefined || patch.protocol !== undefined) {
                            ++fetchGeneration.current;
                            fetchAbort.current?.abort();
                            setFetching(false);
                            setFetchError(null);
                            closeCandidatePicker();
                            setProbePassed(false);
                            setSkipProbe(false);
                            setProbeError(null);
                        }
                        setCreating((current) => (current === null ? current : { ...current, ...patch }));
                    };
                    /** Patch one model row of the new-provider draft. */
                    const patchCreateModel = (index, patch) => {
                        setCreating((current) => {
                            if (current === null)
                                return current;
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
                    const runFetchModels = async () => {
                        const current = creating;
                        if (current === null || fetching)
                            return;
                        const baseURL = current.baseURL.trim();
                        if (!isHttpUrl(baseURL)) {
                            setFetchError(baseURL.length === 0 ? t("fetchNeedsBaseURL") : t("baseURLInvalid"));
                            createBaseURLRef.current?.focus();
                            return;
                        }
                        fetchAbort.current?.abort();
                        const controller = new AbortController();
                        fetchAbort.current = controller;
                        const mine = ++fetchGeneration.current;
                        setFetching(true);
                        setFetchError(null);
                        try {
                            const apiKey = current.apiKey.trim();
                            const response = await ctx.remote.llm.discoverModels(current.ns, {
                                baseURL,
                                api: current.protocol,
                                ...(apiKey.length === 0 ? {} : { apiKey })
                            }, controller.signal);
                            if (mine !== fetchGeneration.current || controller.signal.aborted)
                                return;
                            if (!response.ok) {
                                setFetchError(describeFetchFailure(response.error.message) || t("lookupFailed"));
                                return;
                            }
                            const unique = new Map();
                            for (const model of response.value) {
                                if (typeof model.id !== "string")
                                    continue;
                                const id = model.id.trim();
                                if (id.length > 0 && !unique.has(id))
                                    unique.set(id, { ...model, id });
                            }
                            if (unique.size === 0) {
                                setFetchError(t("fetchEmpty"));
                                return;
                            }
                            setCandidates([...unique.values()]);
                            setPicked(new Set());
                            setCandidateQuery("");
                        }
                        catch (error) {
                            if (mine !== fetchGeneration.current || controller.signal.aborted)
                                return;
                            setFetchError(describeFetchFailure(messageOf(error)) || t("lookupFailed"));
                        }
                        finally {
                            if (mine === fetchGeneration.current)
                                setFetching(false);
                        }
                    };
                    /** Append every picked candidate the draft does not already list. */
                    const adoptPickedModels = () => {
                        const current = creating;
                        const found = candidates;
                        if (current === null || found === null)
                            return;
                        const known = new Set(current.models.map((model) => model.id.trim()));
                        const additions = found
                            .filter((model) => picked.has(model.id) && !known.has(model.id))
                            .map((model) => ({
                            id: model.id,
                            name: typeof model.name === "string" ? model.name : "",
                            vision: Array.isArray(model.inputModalities) && model.inputModalities.includes("image"),
                            reasoning: false
                        }));
                        if (additions.length === 0)
                            return;
                        const retained = current.models.filter((model) => model.id.trim().length > 0 || model.name.trim().length > 0);
                        patchCreate({ models: [...retained, ...additions] });
                        setDraftAddedCount(additions.length);
                        closeCandidatePicker();
                    };
                    /**
                     * Write the new provider's profile at ["providers", route] in one set
                     * op — the same shape and location the shipped Models page writes —
                     * then store the typed key under the derived reference when given.
                     */
                    const submitCreate = async () => {
                        const current = creating;
                        if (current === null)
                            return;
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
                        const seen = new Set();
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
                                }
                                else {
                                    setProbeError(describeFetchFailure(answer.error.message));
                                    return;
                                }
                            }
                            catch (error) {
                                /*
                                 * A rejected call — a transport failure or an abort — must not
                                 * escape: the button's handler discards this promise, so an
                                 * escape is indistinguishable from the button doing nothing.
                                 */
                                setProbeError(describeFetchFailure(messageOf(error)) || t("lookupFailed"));
                                return;
                            }
                            finally {
                                setProbeBusy(false);
                            }
                        }
                        setCreateBusy(true);
                        try {
                            const profile = {
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
                            if (current.displayName.trim().length > 0)
                                profile.displayName = current.displayName.trim();
                            profile.apiKeyEnv = deriveKeyRef(route);
                            const response = await ctx.remote.settings.mutate(current.ns, [{ op: "set", path: ["providers", route], value: profile }], namespace.revision);
                            if (!response.ok) {
                                setCreateError(response.error.code === "settings/conflict" ? t("conflict") : response.error.message);
                                if (response.error.code === "settings/conflict")
                                    await load();
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
                                }
                                catch (error) {
                                    const message = error instanceof Error ? error.message : String(error);
                                    setRowError((previous) => ({
                                        ...previous,
                                        [route]: fill(t("keyStoreFailed"), { message })
                                    }));
                                }
                            }
                            await load();
                        }
                        catch (error) {
                            /*
                             * The write itself can reject — a dropped request, an abort — and
                             * escape is not an option: the button's handler discards this
                             * promise, so a rejected write used to look exactly like the button
                             * doing nothing. Everything else in this try reports its own
                             * failures (load() stores them, the key write is caught above), so
                             * this line names the creation itself.
                             */
                            setCreateError(fill(t("createFailed"), { message: messageOf(error) }));
                        }
                        finally {
                            setCreateBusy(false);
                        }
                    };
                    /**
                     * Open the edit dialog for one provider. The draft is a copy: nothing
                     * reaches the configuration until 「保存」 writes it back.
                     */
                    const startEdit = (row) => {
                        if (adding !== null || creating !== null || editing !== null || exporting !== null || confirming !== null || importing)
                            return;
                        if (row.settingsPath.length === 0 || !isJsonObject(row.profile))
                            return;
                        const inputField = inputFieldOf(row);
                        const keyRef = keyRefOf(row) ?? deriveKeyRef(row.provider);
                        setEditError(null);
                        setEditAttempted(false);
                        setEditBusy(false);
                        setEditing({
                            provider: row.provider,
                            ns: row.settingsNs,
                            settingsPath: [...row.settingsPath],
                            displayName: typeof row.profile.displayName === "string" ? row.profile.displayName : "",
                            protocol: typeof row.profile.api === "string" ? row.profile.api : "",
                            baseURL: typeof row.profile.baseURL === "string" ? row.profile.baseURL : "",
                            apiKey: "",
                            inputField,
                            keyRef,
                            keyState: "unknown",
                            models: row.models.map((model, index) => ({
                                id: typeof model.id === "string" ? model.id : "",
                                name: typeof model.name === "string" ? model.name : "",
                                vision: effectiveInputTypes(row, index, inputField).includes("image"),
                                reasoning: reasoningOnOf(model),
                                visionTouched: false,
                                reasoningTouched: false,
                                raw: model
                            }))
                        });
                        void loadEditKeyState(keyRef);
                    };
                    /**
                     * Ask the Host whether this provider's reference already holds a key.
                     * Read-only: the answer only labels the dialog's key field.
                     */
                    const loadEditKeyState = async (ref) => {
                        const answer = await fetchSecrets([ref]);
                        setEditing((current) => {
                            if (current === null || current.keyRef !== ref)
                                return current;
                            if (answer.kind !== "ok")
                                return { ...current, keyState: "unknown" };
                            return { ...current, keyState: answer.values[ref] === undefined ? "absent" : "stored" };
                        });
                    };
                    /** Close the edit dialog and drop its transient state. */
                    const closeEdit = () => {
                        setEditing(null);
                        setEditError(null);
                        setEditAttempted(false);
                        setEditBusy(false);
                    };
                    /** Patch one provider-level field of the edit draft. */
                    const patchEdit = (patch) => {
                        setEditing((current) => (current === null ? current : { ...current, ...patch }));
                    };
                    /** Patch one model row of the edit draft. */
                    const patchEditModel = (index, patch) => {
                        setEditing((current) => {
                            if (current === null)
                                return current;
                            return {
                                ...current,
                                models: current.models.map((model, at) => (at === index ? { ...model, ...patch } : model))
                            };
                        });
                    };
                    /** Caret to the first box a rejected edit complained about. */
                    const focusFirstInvalidEditField = () => {
                        const current = editing;
                        if (current === null)
                            return;
                        const baseURL = current.baseURL.trim();
                        if (baseURL.length > 0 && !isHttpUrl(baseURL)) {
                            editBaseURLRef.current?.focus();
                            return;
                        }
                        const filled = current.models.filter((model) => model.id.trim().length > 0);
                        const seen = new Set();
                        let duplicated = false;
                        for (const model of filled) {
                            const id = model.id.trim();
                            if (seen.has(id))
                                duplicated = true;
                            else
                                seen.add(id);
                        }
                        if (filled.length === 0 || duplicated) {
                            editModelsRef.current?.scrollIntoView({ block: "start" });
                            return;
                        }
                        if (current.apiKey.length > 0 && current.apiKey.trim().length === 0) {
                            editKeyRef.current?.focus();
                        }
                    };
                    /**
                     * Write the edited profile back at its own path. Only the fields this
                     * dialog owns are replaced: every other key of the stored profile and
                     * of each stored model is carried over verbatim, and a capability switch
                     * the user never flipped stays unwritten — writing it would pin a model
                     * that inherits its catalog defaults as explicitly non-reasoning.
                     */
                    const submitEdit = async () => {
                        const current = editing;
                        if (current === null || editBusy)
                            return;
                        setEditAttempted(true);
                        setEditError(null);
                        const row = state.rows.find((entry) => entry.provider === current.provider);
                        const namespace = state.namespaces.get(current.ns);
                        if (row === undefined || namespace === undefined || !isJsonObject(row.profile)) {
                            setEditError(t("noNamespace"));
                            return;
                        }
                        const displayName = current.displayName.trim();
                        const baseURL = current.baseURL.trim();
                        const models = current.models.map((model) => ({ ...model, id: model.id.trim(), name: model.name.trim() }));
                        const filled = models.filter((model) => model.id.length > 0);
                        const seen = new Set();
                        const duplicates = new Set();
                        for (const model of filled) {
                            if (seen.has(model.id))
                                duplicates.add(model.id);
                            else
                                seen.add(model.id);
                        }
                        const key = current.apiKey.trim();
                        const keyBlankOnly = current.apiKey.length > 0 && key.length === 0;
                        const baseURLInvalid = baseURL.length > 0 && !isHttpUrl(baseURL);
                        if (baseURLInvalid || filled.length === 0 || duplicates.size > 0 || keyBlankOnly) {
                            setEditError(t("fixFields"));
                            setPulseTick((tick) => tick + 1);
                            return;
                        }
                        setEditBusy(true);
                        try {
                            const stored = cloneJson(row.profile);
                            const profile = isJsonObject(stored) ? stored : {};
                            if (displayName.length > 0)
                                profile.displayName = displayName;
                            else
                                delete profile.displayName;
                            if (current.protocol.length > 0)
                                profile.api = current.protocol;
                            if (baseURL.length > 0)
                                profile.baseURL = baseURL;
                            else
                                delete profile.baseURL;
                            profile.models = models.map((model) => {
                                const carried = model.raw === null ? undefined : cloneJson(model.raw);
                                const entry = isJsonObject(carried) ? carried : {};
                                entry.id = model.id;
                                if (model.name.length > 0)
                                    entry.name = model.name;
                                else
                                    delete entry.name;
                                if (model.visionTouched)
                                    entry[current.inputField] = model.vision ? ["text", "image"] : ["text"];
                                if (model.reasoningTouched) {
                                    entry.reasoningEfforts = model.reasoning ? { ...REASONING_EFFORTS_ON } : false;
                                }
                                return entry;
                            });
                            /* A key can only be stored under a reference the profile names. */
                            if (key.length > 0)
                                profile.apiKeyEnv = current.keyRef;
                            let response;
                            try {
                                response = await ctx.remote.settings.mutate(current.ns, [{ op: "set", path: [...current.settingsPath], value: profile }], namespace.revision);
                            }
                            catch (error) {
                                /* A rejected write must name itself: the handler discards this
                                 * promise, so an escape would look like the button doing nothing. */
                                setEditError(fill(t("saveFailed"), { message: messageOf(error) }));
                                return;
                            }
                            if (!response.ok) {
                                setEditError(response.error.code === "settings/conflict" ? t("conflict") : response.error.message);
                                if (response.error.code === "settings/conflict")
                                    await load();
                                return;
                            }
                            setEditing(null);
                            setEditError(null);
                            setEditAttempted(false);
                            setFlash(fill(t("editedFlash"), { provider: current.provider }));
                            /* Same best-effort key write the create flow uses. */
                            if (key.length > 0 && ctx.remote.credentials !== undefined) {
                                try {
                                    const answer = await ctx.remote.credentials.set(current.keyRef, key);
                                    if (!answer.ok) {
                                        setRowError((previous) => ({
                                            ...previous,
                                            [current.provider]: fill(t("keyStoreFailed"), { message: answer.error.message })
                                        }));
                                    }
                                }
                                catch (error) {
                                    setRowError((previous) => ({
                                        ...previous,
                                        [current.provider]: fill(t("keyStoreFailed"), { message: messageOf(error) })
                                    }));
                                }
                            }
                            await load();
                        }
                        finally {
                            setEditBusy(false);
                        }
                    };
                    /** Probe the id currently typed in the dialog, before it is saved. */
                    const runModalTest = async (row) => {
                        const id = draft.id.trim();
                        if (id.length === 0)
                            return;
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
                    const removeProvider = async (row) => {
                        const namespace = state.namespaces.get(row.settingsNs);
                        if (namespace === undefined) {
                            setRowError((current) => ({ ...current, [row.provider]: t("noNamespace") }));
                            return;
                        }
                        setBusy((current) => ({ ...current, [row.provider]: true }));
                        try {
                            const response = await ctx.remote.settings.mutate(row.settingsNs, [{ op: "unset", path: [...row.settingsPath] }], namespace.revision);
                            if (!response.ok) {
                                const conflict = response.error.code === "settings/conflict";
                                const message = conflict ? t("conflict") : response.error.message;
                                setRowError((current) => ({ ...current, [row.provider]: message }));
                                if (conflict)
                                    await load();
                                return;
                            }
                            setRowError((current) => ({ ...current, [row.provider]: undefined }));
                            setConfirming(null);
                            setFocusProvider(null);
                            await load();
                        }
                        finally {
                            setBusy((current) => ({ ...current, [row.provider]: false }));
                        }
                    };
                    /** Dispatch the confirmed destructive action. */
                    const runConfirm = async (target) => {
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
                            if (saved)
                                setConfirming(null);
                            return;
                        }
                        await removeProvider(row);
                    };
                    /** Whether a whole provider may be removed from this page at all. */
                    const canRemoveProvider = (row) => row.editable && state.writable && row.settingsPath.length > 0;
                    const renderModel = (row, model, index) => {
                        const field = inputFieldOf(row);
                        const vision = effectiveInputTypes(row, index, field).includes("image");
                        const reasoning = reasoningOnOf(model);
                        const id = model.id;
                        const key = `${row.provider}::${id}::${String(index)}`;
                        const result = tests[key];
                        const testing = result !== undefined && result.status === "testing";
                        const editable = row.editable && state.writable;
                        const name = typeof model.name === "string" && model.name.length > 0 ? model.name : undefined;
                        const providerName = row.displayName.length === 0 ? row.provider : row.displayName;
                        const feedbackId = `mcf-test-${row.provider}-${String(index)}`;
                        return h("div", { className: "mcf-modelBlock", key, "data-test-state": result?.status }, h("div", { className: "mcf-modelRow mcf-configModelRow" }, h("div", { className: "mcf-modelIdentity" }, h("code", { className: "mcf-candId", title: id }, id), name === undefined ? null : h("span", { className: "mcf-modelName", title: name }, name)), h("div", { className: "mcf-modelControl mcf-modelVision" }, h("span", { className: "mcf-modelControlLabel", "aria-hidden": "true" }, t("vision")), h("button", {
                            type: "button",
                            role: "switch",
                            "aria-checked": vision,
                            className: "mcf-switch",
                            disabled: !editable || busy[row.provider] === true,
                            "aria-label": fill(t("visionLabel"), { model: id }),
                            onClick: () => void toggleVision(row, index)
                        }, h("span", { className: "mcf-switchThumb" }))), h("div", { className: "mcf-modelControl mcf-modelReasoning" }, h("span", { className: "mcf-modelControlLabel", "aria-hidden": "true" }, t("reasoning")), row.settingsPath.length > 0 ? h("button", {
                            type: "button",
                            role: "switch",
                            "aria-checked": reasoning,
                            className: "mcf-switch",
                            disabled: !editable || busy[row.provider] === true,
                            "aria-label": fill(t("reasoningLabel"), { model: id }),
                            onClick: () => void toggleReasoning(row, index)
                        }, h("span", { className: "mcf-switchThumb" }))
                            : h("span", { className: "mcf-modelUnavailable", "aria-hidden": "true" }, "—")), h("div", { className: "mcf-modelTestCell" }, h("button", {
                            type: "button",
                            className: "mcf-btn mcf-btnSm",
                            disabled: testing || !row.active,
                            title: row.active ? undefined : t("inactiveHint"),
                            "aria-describedby": result === undefined || testing ? undefined : feedbackId,
                            onClick: () => void runTest(row, id, key)
                        }, testing ? t("testing") : t("test"))), h("div", { className: "mcf-modelDeleteCell" }, editable ? h("button", {
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
                        }, h(TrashIcon, {})) : null)), result === undefined || result.status === "testing" ? null : h("p", {
                            id: feedbackId,
                            role: "status",
                            "aria-live": "polite",
                            className: "mcf-testResult mcf-modelFeedback " + (result.status === "ok" ? "mcf-testResultOk" : "mcf-testResultFail")
                        }, h("svg", { viewBox: "0 0 20 20", fill: "none", stroke: "currentColor", strokeWidth: 1.6, "aria-hidden": "true" }, h("circle", { cx: 10, cy: 10, r: 7.5 }), h("path", { d: result.status === "ok" ? "m6.5 10 2.4 2.4 4.7-4.7" : "M10 6v5m0 3h.01" })), h("span", null, result.message)));
                    };
                    /** One provider in the left navigation column. */
                    const renderProviderNav = (row) => {
                        const name = row.displayName.length === 0 ? row.provider : row.displayName;
                        return h("button", {
                            type: "button",
                            className: "mcf-splitItem",
                            key: row.provider,
                            role: "option",
                            "aria-selected": focused?.provider === row.provider,
                            onClick: () => {
                                setFocusProvider(row.provider);
                                setAdding(null);
                                setAddError(null);
                            }
                        }, h("span", { className: "mcf-splitIcon", "aria-hidden": "true" }, monogramOf(row)), h("span", { className: "mcf-pickName", title: name }, name), h("span", { className: "mcf-modelMeta" }, String(row.models.length)));
                    };
                    /** One value of the detail pane's fact list, falling back to a dash. */
                    const factOf = (row, key) => {
                        const value = getPath(row.profile, [key]);
                        return typeof value === "string" && value.length > 0 ? value : "—";
                    };
                    /** The detail pane: interface facts, then that provider's models. */
                    const renderProviderDetail = (row) => {
                        const editable = row.editable && state.writable;
                        const visionCount = row.models.filter((model, index) => effectiveInputTypes(row, index, inputFieldOf(row)).includes("image")).length;
                        const widest = row.models.reduce((best, model) => Math.max(best, typeof model.contextWindow === "number" ? model.contextWindow : 0), 0);
                        const contextText = widest === 0
                            ? "—"
                            : widest >= 1_000_000
                                ? `${String(Math.round(widest / 100_000) / 10)}M`
                                : `${String(Math.round(widest / 1_000))}K`;
                        const renderFact = (label, value, className) => h("div", { className: "mcf-factItem " + className, "data-empty": value === "—" }, h("dt", null, label), h("dd", { className: "mcf-factValue" }, value === "—" ? t("factUnavailable") : value));
                        return h("div", { className: "mcf-detail" }, h("div", { className: "mcf-detailFacts" }, h("h3", { className: "mcf-sectionTitle" }, t("interfaceInfo")), h("dl", { className: "mcf-facts", "data-configured": row.configured }, renderFact(t("factBaseURL"), factOf(row, "baseURL"), "mcf-factBaseURL"), renderFact(t("factApi"), factOf(row, "api"), "mcf-factApi"), renderFact(t("factKeyRef"), factOf(row, "apiKeyEnv"), "mcf-factKeyRef"), renderFact(t("factState"), row.configured ? t("stateConfigured") : t("stateNotConfigured"), "mcf-factState"), renderFact(t("factContext"), contextText, "mcf-factContext"))), h("div", { className: "mcf-detailModels" }, h("div", { className: "mcf-detailBar" }, h("span", null, `${fill(t("modelCount"), { count: String(row.models.length) })} · ${fill(t("visionCount"), { count: String(visionCount) })}`), h("div", { className: "mcf-modelBarActions" }, h("button", {
                            type: "button",
                            className: "mcf-btn mcf-btnSm",
                            onClick: () => startLookup(row)
                        }, t("lookupModels")), editable ? h("button", {
                            type: "button",
                            className: "mcf-btn mcf-btnSm mcf-btnPrimary",
                            disabled: busy[row.provider] === true,
                            onClick: () => startAdd(row)
                        }, t("addModel")) : null)), row.editable ? null : h("p", { className: "mcf-notice" }, t("notEditable")), row.editable && !state.writable ? h("p", { className: "mcf-notice" }, t("readOnly")) : null, row.directoryError === undefined
                            ? null
                            : h("p", { className: "mcf-error" }, translateRowError(row.directoryError)), h("div", { className: "mcf-modelTable" }, h("div", { className: "mcf-modelGridHead", "aria-hidden": "true" }, h("span", null, t("modelId")), h("span", null, t("vision")), h("span", null, t("reasoning")), h("span", null, t("test")), h("span", null, t("actionsLabel"))), h("div", { className: "mcf-modelList", ref: modelScrollRef }, row.models.length === 0
                            ? h("p", { className: "mcf-status" }, t("modelsEmpty"))
                            : row.models.map((model, index) => renderModel(row, model, index)))), rowError[row.provider] === undefined
                            ? null
                            : h("p", { className: "mcf-error" }, translateRowError(rowError[row.provider]))));
                    };
                    /** The detail head: provider identity plus its own actions. */
                    const renderProviderHead = (row) => {
                        const editable = row.editable && state.writable;
                        const providerName = row.displayName.length === 0 ? row.provider : row.displayName;
                        return h("div", { className: "mcf-splitHead" }, h("div", { className: "mcf-providerIdentity" }, h("span", { className: "mcf-providerDisplayName" }, providerName), h("code", { className: "mcf-providerRoute" }, row.provider)), h("span", { className: "mcf-detailActions" }, h("button", {
                            type: "button",
                            className: "mcf-btn mcf-btnSm",
                            "aria-label": `${t("exportLabel")} ${providerName}`,
                            onClick: () => startExport(state.rows, [row.provider])
                        }, t("exportLabel")), editable && row.settingsPath.length > 0 && isJsonObject(row.profile) ? h("button", {
                            type: "button",
                            className: "mcf-btn mcf-btnSm",
                            disabled: busy[row.provider] === true,
                            "aria-label": `${t("editLabel")} ${providerName}`,
                            onClick: () => startEdit(row)
                        }, t("editLabel")) : null, editable && canRemoveProvider(row) ? h("button", {
                            type: "button",
                            className: "mcf-btn mcf-btnSm mcf-iconDanger",
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
                        }, t("deleteProvider")) : null));
                    };
                    /**
                    * The one overlay the page may show: the add-model dialog, or the
                    * confirmation for a destructive removal. Both live outside the
                    * accordion so the panel's overflow clip cannot cut them off.
                    */
                    const renderDialog = () => {
                        const providerNameOf = (row) => row.displayName.length === 0 ? row.provider : row.displayName;
                        if (lookup !== null) {
                            const target = state.rows.find((row) => row.provider === lookup.provider);
                            const known = new Set(target?.models.map((model) => model.id) ?? []);
                            const canEdit = target !== undefined && target.editable && state.writable;
                            const query = lookupQuery.trim().toLowerCase();
                            const visible = lookup.models.filter((model) => query.length === 0 || model.id.toLowerCase().includes(query)
                                || (model.name ?? "").toLowerCase().includes(query));
                            const available = lookup.models.filter((model) => !known.has(model.id));
                            const selectedCount = available.filter((model) => lookupPicked.has(model.id)).length;
                            const visibleNew = visible.filter((model) => !known.has(model.id));
                            const allVisible = visibleNew.length > 0 && visibleNew.every((model) => lookupPicked.has(model.id));
                            const loadingCatalog = lookup.status === "loading";
                            return h("div", {
                                className: "mcf-overlay",
                                onClick: (event) => {
                                    if (event.target === event.currentTarget)
                                        closeLookup();
                                }
                            }, h("div", {
                                className: "mcf-modal mcf-modalLookup",
                                role: "dialog",
                                "aria-modal": "true",
                                "aria-labelledby": "mcf-lookup-title"
                            }, h("div", { className: "mcf-modalHead" }, h("div", null, h("h2", { className: "mcf-modalTitle", id: "mcf-lookup-title" }, fill(t("lookupTitle"), { provider: lookup.name })), h("p", { className: "mcf-modalSub" }, t("lookupIntro"))), h("button", {
                                type: "button", className: "mcf-btn mcf-btnSm mcf-iconBtn",
                                "aria-label": t("close"), title: t("close"), disabled: lookupSaving, onClick: closeLookup
                            }, h(CloseIcon, {}))), h("div", { className: "mcf-modalBody" }, h("div", { className: "mcf-lookupToolbar" }, h("input", {
                                className: "mcf-input mcf-lookupSearch", type: "search",
                                value: lookupQuery, placeholder: t("lookupSearch"),
                                "aria-label": t("lookupSearch"), autoFocus: true,
                                disabled: lookupSaving,
                                onChange: (event) => setLookupQuery(event.target.value)
                            }), h("button", {
                                type: "button", className: "mcf-btn mcf-btnSm",
                                disabled: loadingCatalog || lookupSaving || target === undefined,
                                onClick: () => { if (target !== undefined)
                                    void runLookup(target); }
                            }, h(RefreshIcon, { spin: loadingCatalog }), t("refresh"))), loadingCatalog ? h("div", { className: "mcf-lookupStatus", role: "status" }, h(RefreshIcon, { spin: true }), t("lookupLoading")) : null, lookup.error === null ? null : h("div", { className: "mcf-lookupError", role: "alert" }, lookup.error), lookup.status !== "ready" ? null : h("div", { className: "mcf-lookupSummary", role: "status" }, h("span", null, fill(t("lookupCount"), { shown: String(visible.length), total: String(lookup.models.length) })), canEdit && visibleNew.length > 0 ? h("button", {
                                type: "button", className: "mcf-btn mcf-btnSm mcf-lookupBulk",
                                disabled: lookupSaving || busy[target.provider] === true,
                                onClick: () => setLookupPicked((current) => {
                                    const next = new Set(current);
                                    for (const model of visibleNew) {
                                        if (allVisible)
                                            next.delete(model.id);
                                        else
                                            next.add(model.id);
                                    }
                                    return next;
                                })
                            }, allVisible ? t("clearVisible") : t("selectVisible")) : null), lookup.status !== "ready" ? null : h("div", { className: "mcf-lookupList", role: "group", "aria-label": t("lookupTitle").replace("{provider}", lookup.name) }, lookup.models.length === 0 ? h("p", { className: "mcf-lookupStatus" }, t("lookupEmpty"))
                                : visible.length === 0 ? h("p", { className: "mcf-lookupStatus" }, t("lookupNoMatch"))
                                    : visible.map((model) => h("label", { className: "mcf-lookupRow", key: model.id, "data-configured": known.has(model.id) }, h("input", {
                                        className: "mcf-check", type: "checkbox",
                                        checked: !known.has(model.id) && lookupPicked.has(model.id),
                                        disabled: !canEdit || lookupSaving || busy[lookup.provider] === true || known.has(model.id),
                                        "aria-label": fill(t("lookupPick"), { model: model.id }),
                                        onChange: (event) => {
                                            setLookupPicked((current) => {
                                                const next = new Set(current);
                                                if (event.target.checked)
                                                    next.add(model.id);
                                                else
                                                    next.delete(model.id);
                                                return next;
                                            });
                                        }
                                    }), h("span", { className: "mcf-lookupIdentity" }, h("code", null, model.id), typeof model.name === "string" && model.name !== model.id
                                        ? h("span", { className: "mcf-lookupName" }, model.name) : null), known.has(model.id) ? h("span", { className: "mcf-lookupBadge" }, t("lookupConfigured")) : null, h("span", { className: "mcf-lookupCaps" }, typeof model.contextWindow === "number"
                                        ? h("span", null, `${t("factContext")} · ${model.contextWindow.toLocaleString()}`) : null, typeof model.maxTokens === "number"
                                        ? h("span", null, `${t("lookupOutput")} · ${model.maxTokens.toLocaleString()}`) : null)))), lookup.status === "ready" && lookup.models.length > 0 && available.length === 0
                                ? h("p", { className: "mcf-lookupNotice" }, t("lookupNoNew")) : null, h("p", { className: "mcf-lookupNotice" }, t("lookupReadonly")), !canEdit && lookup.status === "ready"
                                ? h("p", { className: "mcf-lookupNotice" }, t("lookupNotWritable")) : null), h("div", { className: "mcf-modalFoot" }, h("span", { className: "mcf-lookupPicked", role: "status" }, fill(t("lookupSelected"), { count: String(selectedCount), available: String(available.length) })), h("button", { type: "button", className: "mcf-btn", disabled: lookupSaving, onClick: closeLookup }, t("close")), canEdit ? h("button", {
                                type: "button", className: "mcf-btn mcf-btnPrimary",
                                disabled: lookup.status !== "ready" || selectedCount === 0 || lookupSaving || busy[lookup.provider] === true,
                                onClick: () => void saveLookup()
                            }, lookupSaving ? t("lookupSaving") : t("lookupAddSelected")) : null)));
                        }
                        if (importing) {
                            const document = importText.trim().length === 0
                                ? emptyImportDocument()
                                : importText.length > IMPORT_MAX_CHARS
                                    ? { format: "json", entries: [], keys: [], error: "too-large" }
                                    : parseImportDocument(importText, importFormat);
                            const candidates = planImport(document, {
                                rows: state.rows,
                                sectionOf: (ns) => {
                                    const namespace = state.namespaces.get(ns);
                                    return namespace === undefined ? undefined : namespace.value ?? {};
                                }
                            });
                            const summary = importSummary(candidates);
                            const keys = importIncludeKeys ? importKeyWrites(document, candidates) : [];
                            const ready = summary.add + summary.replace;
                            const problemText = (problem) => {
                                if (problem.code === "unknownProvider")
                                    return t("importUnknownProvider");
                                if (problem.code === "badRoute")
                                    return fill(t("importBadRoute"), { route: problem.route });
                                if (problem.code === "noNamespace")
                                    return fill(t("importNoNamespace"), { ns: problem.ns });
                                return t("importNoModels");
                            };
                            return h("div", {
                                className: "mcf-overlay",
                                onClick: (event) => {
                                    if (event.target === event.currentTarget && !importBusy)
                                        closeImport();
                                }
                            }, h("div", {
                                className: "mcf-modal mcf-modalFixed mcf-modalWide",
                                role: "dialog",
                                "aria-modal": "true",
                                "aria-labelledby": "mcf-import-title"
                            }, h("div", { className: "mcf-modalHead" }, h("div", null, h("h2", { className: "mcf-modalTitle", id: "mcf-import-title" }, t("importTitle")), h("p", { className: "mcf-modalSub" }, t("importSub"))), h("button", {
                                type: "button",
                                className: "mcf-btn mcf-btnSm mcf-iconBtn",
                                "aria-label": t("close"),
                                title: t("close"),
                                disabled: importBusy,
                                onClick: closeImport
                            }, h(CloseIcon, {}))), h("div", { className: "mcf-modalBody" }, h("div", { className: "mcf-exportOpts" }, h("label", { className: "mcf-field" }, h("span", null, t("importFormat")), h("select", {
                                className: "mcf-input mcf-exportSelect",
                                value: importFormat,
                                "aria-label": t("importFormat"),
                                onChange: (event) => {
                                    const next = event.target.value;
                                    setImportFormat(next === "json" ? "json" : next === "yaml" ? "yaml" : next === "env" ? "env" : "auto");
                                }
                            }, h("option", { value: "auto" }, t("importFormatAuto")), h("option", { value: "json" }, t("importFormatJson")), h("option", { value: "yaml" }, t("importFormatYaml")), h("option", { value: "env" }, t("importFormatEnv")))), h("button", {
                                type: "button",
                                className: "mcf-btn mcf-btnSm",
                                onClick: () => importFileRef.current?.click()
                            }, t("importPickFile")), h("input", {
                                ref: importFileRef,
                                className: "mcf-importFile",
                                type: "file",
                                accept: ".json,.yaml,.yml,.env,.txt,application/json,text/plain",
                                "aria-label": t("importPickFile"),
                                onChange: (event) => {
                                    const file = event.target.files?.[0];
                                    event.target.value = "";
                                    void pickImportFile(file);
                                }
                            })), h("textarea", {
                                className: "mcf-exportText",
                                value: importText,
                                placeholder: t("importPlaceholder"),
                                "aria-label": t("importTitle"),
                                spellCheck: false,
                                onChange: (event) => {
                                    setImportText(event.target.value);
                                    setImportError(null);
                                }
                            }), !state.writable ? h("p", { className: "mcf-exportWarn" }, t("importReadOnly")) : null, document.error === null ? null
                                : h("p", { className: "mcf-exportWarn", role: "status" }, importErrorText(document.error, t)), document.error === null && candidates.length > 0
                                ? h("p", { className: "mcf-importReason" }, fill(t("importScope"), {
                                    add: String(summary.add),
                                    replace: String(summary.replace),
                                    skipped: String(summary.blocked),
                                    models: String(summary.models)
                                }))
                                : null, candidates.length === 0 ? null : h("ul", { className: "mcf-importList" }, candidates.map((candidate, index) => h("li", {
                                className: "mcf-importItem",
                                key: `${candidate.settingsNs}/${candidate.settingsPath.join("/")}/${String(index)}`
                            }, h("span", { className: "mcf-importName" }, candidate.displayName), h("span", { className: "mcf-importMeta", title: candidate.settingsNs }, candidate.problem === null
                                ? `${candidate.provider ?? "?"} · ${candidate.settingsNs} · ${String(candidate.modelCount)}`
                                : problemText(candidate.problem)), h("span", {
                                className: candidate.problem !== null
                                    ? "mcf-importBadge mcf-importBadgeSkip"
                                    : candidate.overwrite
                                        ? "mcf-importBadge mcf-importBadgeReplace"
                                        : "mcf-importBadge mcf-importBadgeNew"
                            }, candidate.problem !== null ? t("importSkip") : candidate.overwrite ? t("importReplace") : t("importNew"))))), summary.replace > 0
                                ? h("p", { className: "mcf-exportNote" }, t("importReplaceWarn"))
                                : null, document.error !== null ? null
                                : document.keys.length === 0 && !document.entries.some((entry) => entry.apiKey !== null)
                                    ? h("p", { className: "mcf-exportNote" }, t("importKeysNone"))
                                    : h("div", null, h("label", { className: "mcf-skipRow" }, h("input", {
                                        className: "mcf-check",
                                        type: "checkbox",
                                        checked: importIncludeKeys,
                                        onChange: (event) => {
                                            setImportIncludeKeys(event.target.checked);
                                        }
                                    }), t("importIncludeKeys")), importIncludeKeys
                                        ? h("p", { className: "mcf-exportNote" }, fill(t("importKeysLine"), { count: String(keys.length) }))
                                        : null), importError === null ? null : h("p", {
                                className: "mcf-importError",
                                role: "alert"
                            }, importError)), h("div", { className: "mcf-modalFoot" }, h("button", {
                                type: "button",
                                className: "mcf-btn",
                                disabled: importBusy,
                                onClick: closeImport
                            }, t("close")), h("button", {
                                type: "button",
                                className: "mcf-btn mcf-btnPrimary",
                                disabled: importBusy || ready === 0 || !state.writable,
                                onClick: () => {
                                    void applyImport(candidates, keys);
                                }
                            }, importBusy ? t("importBusy") : fill(t("importApply"), { count: String(ready) })))));
                        }
                        if (exporting !== null) {
                            const target = exporting;
                            const rows = target.rows;
                            const needle = exportQuery.trim().toLowerCase();
                            const navRows = needle.length === 0
                                ? rows
                                : rows.filter((row) => providerNameOf(row).toLowerCase().includes(needle)
                                    || row.provider.toLowerCase().includes(needle)
                                    || row.models.some((model) => model.id.toLowerCase().includes(needle)));
                            const pickedRows = rows
                                .map((row) => subsetRow(row, exportPicked))
                                .filter((row) => row !== undefined);
                            const focus = rows.find((row) => row.provider === exportFocus) ?? navRows[0] ?? rows[0];
                            const single = pickedRows.length === 1 ? pickedRows[0] : undefined;
                            const title = single !== undefined
                                ? fill(t("exportTitleOne"), { provider: providerNameOf(single) })
                                : pickedRows.length === rows.length
                                    ? t("exportTitleAll")
                                    : fill(t("exportTitlePicked"), { count: String(pickedRows.length) });
                            const modelTotal = pickedRows.reduce((total, row) => total + row.models.length, 0);
                            const refs = keyRefsOf(pickedRows);
                            const text = renderExport(exportFormat, pickedRows, secrets.values, includeKey, target.at);
                            const keyIncluded = includeKey && secrets.status === "ready" && Object.keys(secrets.values).length > 0;
                            const kind = exportFormat === "yaml" ? "YAML" : exportFormat === "env" ? "ENV" : "JSON";
                            /** How many of one provider's models are ticked. */
                            const pickedOf = (row) => row.models.reduce((total, model) => total + (exportPicked.has(exportModelKey(row.provider, model.id)) ? 1 : 0), 0);
                            /** Tick models on or off, then refresh the keys the selection declares. */
                            const applyPick = (next) => {
                                setExportPicked(next);
                                setExportCopy("idle");
                                const chosen = rows.filter((row) => row.models.some((model) => next.has(exportModelKey(row.provider, model.id))));
                                if (includeKey)
                                    void loadExportSecrets(chosen);
                            };
                            const notes = [];
                            if (includeKey && secrets.status === "loading")
                                notes.push(t("exportKeyLoading"));
                            if (includeKey && secrets.error !== null)
                                notes.push(secrets.error);
                            if (includeKey && secrets.missing.length > 0) {
                                notes.push(fill(t("exportKeyMissing"), { refs: secrets.missing.join(", ") }));
                            }
                            if (includeKey && secrets.refused.length > 0) {
                                notes.push(fill(t("exportKeyRefused"), { refs: secrets.refused.join(", ") }));
                            }
                            if (pickedRows.length > 0 && refs.length === 0)
                                notes.push(t("exportRefsNone"));
                            /* Paired here so the row callbacks below never re-read a possibly
                               undefined focus. */
                            const focusModels = focus === undefined
                                ? []
                                : focus.models
                                    .filter((model) => needle.length === 0
                                    || model.id.toLowerCase().includes(needle)
                                    || providerNameOf(focus).toLowerCase().includes(needle))
                                    .map((model) => ({ provider: focus.provider, model }));
                            return h("div", {
                                className: "mcf-overlay",
                                onClick: (event) => {
                                    if (event.target === event.currentTarget)
                                        closeExport();
                                }
                            }, h("div", {
                                className: "mcf-modal mcf-modalFixed mcf-modalWide",
                                role: "dialog",
                                "aria-modal": "true",
                                "aria-labelledby": "mcf-export-title"
                            }, h("div", { className: "mcf-modalHead" }, h("div", { className: "mcf-modalIdentity" }, h("span", { className: "mcf-titleIcon", "aria-hidden": "true" }, h(ExportIcon, { size: 15 })), h("div", null, h("h2", { className: "mcf-modalTitle", id: "mcf-export-title" }, title), h("p", { className: "mcf-modalSub" }, `${fill(t("exportScope"), { count: String(pickedRows.length), models: String(modelTotal) })} · ${t("exportSub")}`))), h("button", {
                                type: "button",
                                className: "mcf-btn mcf-btnSm mcf-iconBtn",
                                "aria-label": t("close"),
                                title: t("close"),
                                onClick: closeExport
                            }, h(CloseIcon, {}))), h("div", { className: "mcf-modalBody" }, h("div", { className: "mcf-exportOpts" }, h("label", { className: "mcf-field" }, h("span", null, t("exportFormat")), h("select", {
                                className: "mcf-input mcf-exportSelect",
                                value: exportFormat,
                                "aria-label": t("exportFormat"),
                                onChange: (event) => {
                                    const next = event.target.value;
                                    setExportFormat(next === "yaml" ? "yaml" : next === "env" ? "env" : "json");
                                    setExportCopy("idle");
                                }
                            }, h("option", { value: "json" }, t("exportFormatJson")), h("option", { value: "yaml" }, t("exportFormatYaml")), h("option", { value: "env", disabled: !includeKey }, t("exportFormatEnv")))), h("label", { className: "mcf-rowCheck" }, h("input", {
                                className: "mcf-check",
                                type: "checkbox",
                                checked: includeKey,
                                onChange: (event) => {
                                    const next = event.target.checked;
                                    setIncludeKey(next);
                                    setExportCopy("idle");
                                    if (!next && exportFormat === "env")
                                        setExportFormat("yaml");
                                    if (next && refs.length > 0 && secrets.status !== "loading") {
                                        void loadExportSecrets(pickedRows);
                                    }
                                }
                            }), t("exportIncludeKey"))), h("div", { className: "mcf-split" }, h("div", { className: "mcf-splitNav" }, h("div", { className: "mcf-splitHead" }, h("span", null, t("exportPick")), h("span", { id: "navCount" }, `${String(navRows.length)}/${String(rows.length)}`)), h("div", { className: "mcf-pickList", role: "listbox", "aria-label": t("exportPick") }, navRows.map((row) => {
                                const on = pickedOf(row);
                                return h("label", {
                                    className: "mcf-splitItem",
                                    key: row.provider,
                                    "aria-selected": focus !== undefined && focus.provider === row.provider
                                }, h("input", {
                                    className: "mcf-check",
                                    type: "checkbox",
                                    checked: on === row.models.length && on > 0,
                                    ref: (node) => {
                                        if (node !== null)
                                            node.indeterminate = on > 0 && on < row.models.length;
                                    },
                                    onChange: (event) => {
                                        const next = new Set(exportPicked);
                                        for (const model of row.models) {
                                            const id = exportModelKey(row.provider, model.id);
                                            if (event.target.checked)
                                                next.add(id);
                                            else
                                                next.delete(id);
                                        }
                                        setExportFocus(row.provider);
                                        applyPick(next);
                                    }
                                }), h("span", { className: "mcf-splitIcon", "aria-hidden": "true" }, monogramOf(row)), h("span", { className: "mcf-pickName" }, providerNameOf(row)), h("span", { className: "mcf-modelMeta" }, String(row.models.length)));
                            }))), h("div", { className: "mcf-splitMain" }, h("div", { className: "mcf-splitHead" }, h("span", { className: "mcf-splitTitle", id: "mainHead" }, focus === undefined
                                ? t("exportPick")
                                : fill(t("exportFocusScope"), {
                                    name: providerNameOf(focus),
                                    route: focus.provider,
                                    count: String(focus.models.length)
                                })), h("span", null, h("input", {
                                className: "mcf-input",
                                id: "q",
                                value: exportQuery,
                                placeholder: t("exportSearchModel"),
                                "aria-label": t("exportSearchModel"),
                                onChange: (event) => {
                                    setExportQuery(event.target.value);
                                }
                            }), h("button", {
                                type: "button",
                                className: "mcf-btn mcf-btnSm",
                                id: "provAll",
                                disabled: focus === undefined,
                                onClick: () => {
                                    if (focus === undefined)
                                        return;
                                    const next = new Set(exportPicked);
                                    const all = pickedOf(focus) < focus.models.length;
                                    for (const model of focus.models) {
                                        const id = exportModelKey(focus.provider, model.id);
                                        if (all)
                                            next.add(id);
                                        else
                                            next.delete(id);
                                    }
                                    applyPick(next);
                                }
                            }, t("exportPickProvider")))), h("div", { className: "mcf-splitBody" }, focusModels.length === 0
                                ? h("p", { className: "mcf-splitEmpty" }, t("exportNoModel"))
                                : focusModels.map(({ provider, model }) => h("label", { className: "mcf-modelRow", key: model.id }, h("input", {
                                    className: "mcf-check",
                                    type: "checkbox",
                                    checked: exportPicked.has(exportModelKey(provider, model.id)),
                                    onChange: (event) => {
                                        const next = new Set(exportPicked);
                                        const id = exportModelKey(provider, model.id);
                                        if (event.target.checked)
                                            next.add(id);
                                        else
                                            next.delete(id);
                                        applyPick(next);
                                    }
                                }), h("span", { className: "mcf-candId" }, model.id), typeof model.name === "string" && model.name.length > 0 && model.name !== model.id
                                    ? h("span", { className: "mcf-modelMeta" }, model.name)
                                    : null))))), h("p", { className: "mcf-exportWarn" }, h(WarnIcon, {}), h("span", null, keyIncluded ? t("exportWarning") : t("exportKeyOff"))), h("section", { className: "mcf-codePane", "aria-label": t("exportPreview") }, h("header", { className: "mcf-codeHead" }, h("span", null, t("exportPreview")), h("span", { className: "mcf-codeKind" }, kind)), notes.length === 0 ? null : h("p", { className: "mcf-codeNote" }, notes.join(" · ")), h("textarea", {
                                className: "mcf-exportText",
                                ref: exportTextRef,
                                readOnly: true,
                                spellCheck: false,
                                value: text,
                                "aria-label": title,
                                onFocus: (event) => {
                                    event.currentTarget.select();
                                    /* Selecting everything scrolls to the tail; show the head instead. */
                                    event.currentTarget.scrollTop = 0;
                                }
                            }))), h("div", { className: "mcf-modalFoot" }, h("span", { className: "mcf-importReason", id: "sum" }, `${exportCopy === "ok"
                                ? `${t("exportCopied")} · `
                                : exportCopy === "fail" ? `${t("exportCopyFailed")} · ` : ""}${fill(t("exportSummary"), {
                                picked: String(pickedRows.length),
                                total: String(rows.length),
                                models: String(modelTotal)
                            })}`), h("button", {
                                type: "button",
                                className: "mcf-btn",
                                onClick: closeExport
                            }, t("close")), h("button", {
                                type: "button",
                                className: "mcf-btn",
                                disabled: pickedRows.length === 0,
                                onClick: () => void copyExport(text)
                            }, h(CopyIcon, {}), h("span", null, t("exportCopy"))), h("button", {
                                type: "button",
                                className: "mcf-btn mcf-btnPrimary",
                                disabled: pickedRows.length === 0,
                                onClick: () => {
                                    downloadText(exportFilename(pickedRows, exportFormat, target.at, rows.length), text, exportMime(exportFormat));
                                }
                            }, h(ExportIcon, { size: 15 }), h("span", null, t("exportSave"))))));
                        }
                        if (confirming !== null) {
                            const target = confirming;
                            const row = state.rows.find((candidate) => candidate.provider === target.provider);
                            const error = translateRowError(rowError[target.provider]);
                            return h("div", {
                                className: "mcf-overlay",
                                onClick: (event) => {
                                    if (event.target === event.currentTarget)
                                        setConfirming(null);
                                }
                            }, h("div", {
                                className: "mcf-modal",
                                role: "alertdialog",
                                "aria-modal": "true",
                                "aria-label": target.title
                            }, h("div", { className: "mcf-modalHead" }, h("h2", { className: "mcf-modalTitle" }, target.title), h("button", {
                                type: "button",
                                className: "mcf-btn mcf-btnSm mcf-iconBtn",
                                "aria-label": t("close"),
                                title: t("close"),
                                onClick: () => setConfirming(null)
                            }, h(CloseIcon, {}))), h("div", { className: "mcf-modalBody" }, h("p", { className: "mcf-confirmText" }, target.detail), error === undefined ? null : h("p", { className: "mcf-error" }, error)), h("div", { className: "mcf-modalFoot" }, h("button", {
                                type: "button",
                                className: "mcf-btn",
                                disabled: row !== undefined && busy[row.provider] === true,
                                onClick: () => setConfirming(null)
                            }, t("cancel")), h("button", {
                                type: "button",
                                className: "mcf-btn mcf-btnDanger",
                                disabled: row !== undefined && busy[row.provider] === true,
                                onClick: () => void runConfirm(target)
                            }, t("delete")))));
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
                                ? (createAttempted ? t("providerRouteRequired") : null)
                                : routeInvalid
                                    ? t("providerRouteInvalid")
                                    : routeTaken
                                        ? t("routeTaken")
                                        : null;
                            const baseURLError = baseURL.length === 0
                                ? (createAttempted ? t("baseURLRequired") : null)
                                : baseURLInvalid ? t("baseURLInvalid") : null;
                            const fetchNeedsBaseURL = fetchError === t("fetchNeedsBaseURL");
                            /* The fetch helper and the create form complain about the same
                             * box, so both messages share the one slot under it. */
                            const baseURLProblem = baseURLError ?? (fetchNeedsBaseURL ? fetchError : null);
                            const keyBlank = draftProvider.apiKey.trim().length === 0;
                            /*
                             * The one discovery copy that names the key is the auth refusal,
                             * and it is attributed to the key box: an empty box means no key
                             * was sent at all, a filled one means those characters were
                             * rejected. The local blank check speaks only after a submit
                             * attempt, so an untouched box stays calm.
                             */
                            const keyRefused = fetchError === t("fetchUnauthorized") || probeError === t("fetchUnauthorized");
                            const keyError = keyRefused
                                ? (keyBlank ? t("keyMissingRejected") : t("fetchUnauthorized"))
                                : createAttempted && keyBlank ? t("keyRequired") : null;
                            const duplicateIds = new Set();
                            const counted = new Set();
                            for (const model of filled) {
                                if (counted.has(model.id))
                                    duplicateIds.add(model.id);
                                else
                                    counted.add(model.id);
                            }
                            const modelRowInvalid = (id) => {
                                if (!createAttempted)
                                    return false;
                                const trimmed = id.trim();
                                return trimmed.length === 0 || duplicateIds.has(trimmed);
                            };
                            const modelsError = createAttempted && filled.length === 0
                                ? t("needOneModel")
                                : duplicateIds.size > 0 && createAttempted
                                    ? t("idDuplicate")
                                    : null;
                            /*
                             * The footer locates the problem instead of repeating it: the
                             * field slot under the offending box carries the exact reason, so
                             * this line only has to say that a marked box is waiting — and it
                             * clears itself as soon as the boxes are corrected. Write-time
                             * failures (no namespace, a conflicting revision) have no field to
                             * point at, so those keep their own message.
                             */
                            const fieldProblem = routeError ?? baseURLError ?? keyError ?? modelsError;
                            const dialogError = createError ?? (createAttempted && fieldProblem !== null ? t("fixFields") : null);
                            const query = candidateQuery.trim().toLowerCase();
                            const visibleCandidates = () => query.length === 0
                                ? candidates ?? []
                                : (candidates ?? []).filter((model) => model.id.toLowerCase().includes(query)
                                    || (typeof model.name === "string" && model.name.toLowerCase().includes(query)));
                            const inputCls = (invalid) => {
                                if (!invalid)
                                    return "mcf-input";
                                return pulse ? "mcf-input mcf-inputInvalid mcf-pulse" : "mcf-input mcf-inputInvalid";
                            };
                            if (candidates !== null) {
                                const known = new Set(draftProvider.models.map((model) => model.id.trim()).filter(Boolean));
                                const visible = visibleCandidates();
                                const available = candidates.filter((model) => !known.has(model.id));
                                const selectedCount = available.filter((model) => picked.has(model.id)).length;
                                const visibleNew = visible.filter((model) => !known.has(model.id));
                                const allVisible = visibleNew.length > 0 && visibleNew.every((model) => picked.has(model.id));
                                return h("div", {
                                    className: "mcf-overlay",
                                    onClick: (event) => {
                                        if (event.target === event.currentTarget)
                                            closeCandidatePicker();
                                    }
                                }, h("div", { className: "mcf-modal mcf-modalLookup mcf-modalCreatePicker", role: "dialog", "aria-modal": "true", "aria-labelledby": "mcf-create-picker-title" }, h("div", { className: "mcf-modalHead" }, h("div", null, h("h2", { className: "mcf-modalTitle", id: "mcf-create-picker-title" }, t("chooseDraftModels")), h("p", { className: "mcf-modalSub" }, t("chooseDraftHint"))), h("button", { type: "button", className: "mcf-btn mcf-btnSm mcf-iconBtn", "aria-label": t("close"), title: t("close"), onClick: closeCandidatePicker }, h(CloseIcon, {}))), h("div", { className: "mcf-modalBody" }, h("input", {
                                    className: "mcf-input mcf-lookupSearch", type: "search", value: candidateQuery, autoFocus: true,
                                    placeholder: t("lookupSearch"), "aria-label": t("lookupSearch"),
                                    onChange: (event) => setCandidateQuery(event.target.value)
                                }), h("div", { className: "mcf-lookupSummary", role: "status" }, h("span", null, fill(t("lookupCount"), { shown: String(visible.length), total: String(candidates.length) })), visibleNew.length > 0 ? h("button", {
                                    type: "button", className: "mcf-btn mcf-btnSm mcf-lookupBulk",
                                    onClick: () => setPicked((current) => {
                                        const next = new Set(current);
                                        for (const model of visibleNew) {
                                            if (allVisible)
                                                next.delete(model.id);
                                            else
                                                next.add(model.id);
                                        }
                                        return next;
                                    })
                                }, allVisible ? t("clearVisible") : t("selectVisible")) : null), h("div", { className: "mcf-lookupList", role: "group", "aria-label": t("chooseDraftModels") }, visible.length === 0 ? h("p", { className: "mcf-lookupStatus" }, t("lookupNoMatch"))
                                    : visible.map((model) => h("label", { className: "mcf-lookupRow", key: model.id, "data-configured": known.has(model.id) }, h("input", {
                                        className: "mcf-check", type: "checkbox", checked: !known.has(model.id) && picked.has(model.id),
                                        disabled: known.has(model.id), "aria-label": fill(t("lookupPick"), { model: model.id }),
                                        onChange: (event) => setPicked((current) => {
                                            const next = new Set(current);
                                            if (event.target.checked)
                                                next.add(model.id);
                                            else
                                                next.delete(model.id);
                                            return next;
                                        })
                                    }), h("span", { className: "mcf-lookupIdentity" }, h("code", null, model.id), typeof model.name === "string" && model.name !== model.id ? h("span", { className: "mcf-lookupName" }, model.name) : null), known.has(model.id) ? h("span", { className: "mcf-lookupBadge" }, t("chooseDraftKnown")) : null, h("span", { className: "mcf-lookupCaps" }, typeof model.contextWindow === "number" ? h("span", null, `${t("factContext")} · ${model.contextWindow.toLocaleString()}`) : null, typeof model.maxTokens === "number" ? h("span", null, `${t("lookupOutput")} · ${model.maxTokens.toLocaleString()}`) : null)))), available.length === 0 ? h("p", { className: "mcf-lookupNotice" }, t("lookupNoNew")) : null), h("div", { className: "mcf-modalFoot" }, h("span", { className: "mcf-lookupPicked", role: "status" }, fill(t("lookupSelected"), { count: String(selectedCount), available: String(available.length) })), h("button", { type: "button", className: "mcf-btn", onClick: closeCandidatePicker }, t("chooseDraftBack")), h("button", { type: "button", className: "mcf-btn mcf-btnPrimary", disabled: selectedCount === 0,
                                    onClick: adoptPickedModels }, fill(t("adoptModels"), { count: String(selectedCount) })))));
                            }
                            return h("div", {
                                className: "mcf-overlay",
                                onClick: (event) => {
                                    if (event.target === event.currentTarget && !createBusy && !probeBusy)
                                        closeCreate();
                                }
                            }, h("div", {
                                className: "mcf-modal mcf-modalFixed mcf-modalCreate",
                                role: "dialog",
                                "aria-modal": "true",
                                "aria-labelledby": "mcf-create-title"
                            }, h("div", { className: "mcf-modalHead" }, h("div", null, h("h2", { className: "mcf-modalTitle", id: "mcf-create-title" }, t("newProviderTitle")), h("p", { className: "mcf-modalSub" }, t("addProviderHint"))), h("button", {
                                type: "button",
                                className: "mcf-btn mcf-btnSm mcf-iconBtn",
                                "aria-label": t("close"),
                                title: t("close"),
                                disabled: createBusy || probeBusy,
                                onClick: closeCreate
                            }, h(CloseIcon, {}))), h("div", { className: "mcf-modalBody" }, h("p", { className: "mcf-sectionLabel" }, t("sectionProvider")), h("div", { className: "mcf-formGrid" }, h("label", { className: "mcf-field" }, h("span", null, t("providerRoute")), h("input", {
                                className: inputCls(routeError !== null),
                                type: "text",
                                value: draftProvider.route,
                                ref: createRouteRef,
                                autoFocus: true,
                                spellCheck: false,
                                "aria-invalid": routeError !== null,
                                placeholder: "my-relay",
                                onChange: (event) => patchCreate({ route: event.target.value })
                            }), routeError === null
                                ? h("span", { className: "mcf-fieldHint" }, t("providerRouteHint"))
                                : h("span", { className: "mcf-fieldError" }, routeError)), h("label", { className: "mcf-field" }, h("span", null, t("providerName")), h("input", {
                                className: "mcf-input",
                                type: "text",
                                value: draftProvider.displayName,
                                onChange: (event) => patchCreate({ displayName: event.target.value })
                            })), h("label", { className: "mcf-field" }, h("span", null, t("protocol")), h("select", {
                                className: "mcf-input",
                                value: draftProvider.protocol,
                                onChange: (event) => patchCreate({ protocol: event.target.value })
                            }, protocolChoicesOf(namespace).map((choice) => h("option", { key: choice, value: choice }, protocolLabel(choice))))), h("label", { className: "mcf-field" }, h("span", null, t("baseURLLabel")), h("input", {
                                className: inputCls(baseURLProblem !== null),
                                type: "text",
                                value: draftProvider.baseURL,
                                ref: createBaseURLRef,
                                spellCheck: false,
                                "aria-invalid": baseURLProblem !== null,
                                placeholder: "https://api.example.com/v1",
                                onChange: (event) => patchCreate({ baseURL: event.target.value })
                            }), baseURLProblem === null
                                ? null
                                : h("span", { className: "mcf-fieldError" }, baseURLProblem)), h("label", { className: "mcf-field mcf-span2" }, h("span", null, t("apiKeyLabel"), " *"), h("input", {
                                className: inputCls(keyError !== null),
                                type: "password",
                                value: draftProvider.apiKey,
                                ref: createKeyRef,
                                spellCheck: false,
                                "aria-invalid": keyError !== null,
                                placeholder: draftProvider.route.length > 0
                                    ? deriveKeyRef(draftProvider.route.trim())
                                    : undefined,
                                onChange: (event) => patchCreate({ apiKey: event.target.value })
                            }), keyError === null
                                ? h("span", { className: "mcf-fieldHint" }, fill(t("apiKeyHint"), { ref: route.length > 0 ? deriveKeyRef(route) : "…" }))
                                : h("span", { className: "mcf-fieldError" }, keyError))), h("div", { className: "mcf-modelsHead", ref: createModelsRef }, h("p", { className: "mcf-sectionLabel" }, t("models")), h("button", {
                                type: "button",
                                className: "mcf-btn mcf-btnSm mcf-fetchButton",
                                disabled: fetching || createBusy || probeBusy,
                                onClick: () => void runFetchModels()
                            }, fetching ? t("fetching") : t("fetchModels"))), h("p", { className: "mcf-fetchHint" }, t("fetchHelp")), fetchError === null ? null : h("p", { className: "mcf-error", role: "alert" }, fetchError), draftAddedCount === 0 ? null : h("p", { className: "mcf-fetchHint", role: "status" }, fill(t("draftAdded"), { count: String(draftAddedCount) })), h("div", { className: "mcf-createModelEditor" }, h("div", { className: "mcf-createModelHeader", "aria-hidden": "true" }, h("span", null, t("modelId")), h("span", null, t("modelName")), h("span", null, t("vision")), h("span", null, t("reasoning")), h("span", null, t("actionsLabel"))), h("div", { className: "mcf-modelRows" }, draftProvider.models.map((model, index) => h("div", { className: "mcf-createModelRow", key: index }, h("label", { className: "mcf-field" }, h("span", null, t("modelId")), h("input", {
                                className: inputCls(modelRowInvalid(model.id)),
                                type: "text",
                                value: model.id,
                                spellCheck: false,
                                placeholder: undefined,
                                "aria-label": t("modelId"),
                                "aria-invalid": modelRowInvalid(model.id),
                                onChange: (event) => patchCreateModel(index, { id: event.target.value })
                            })), h("label", { className: "mcf-field" }, h("span", null, t("modelName")), h("input", {
                                className: "mcf-input",
                                type: "text",
                                value: model.name,
                                placeholder: undefined,
                                "aria-label": t("modelName"),
                                onChange: (event) => patchCreateModel(index, { name: event.target.value })
                            })), h("div", { className: "mcf-createModelActions" }, h("label", { className: "mcf-rowCheck" }, h("input", {
                                className: "mcf-check",
                                type: "checkbox",
                                checked: model.vision,
                                onChange: (event) => patchCreateModel(index, { vision: event.target.checked })
                            }), t("vision")), h("label", { className: "mcf-rowCheck" }, h("input", {
                                className: "mcf-check",
                                type: "checkbox",
                                checked: model.reasoning,
                                onChange: (event) => patchCreateModel(index, { reasoning: event.target.checked })
                            }), t("reasoning")), draftProvider.models.length === 1
                                ? null
                                : h("button", {
                                    type: "button",
                                    className: "mcf-btn mcf-btnSm mcf-iconBtn",
                                    "aria-label": t("removeRow"),
                                    title: t("removeRow"),
                                    onClick: () => patchCreate({
                                        models: draftProvider.models.filter((_, at) => at !== index)
                                    })
                                }, h(CloseIcon, {}))))))), h("div", { className: "mcf-addRowWrap" }, h("button", {
                                type: "button",
                                className: "mcf-btn mcf-btnSm",
                                onClick: () => patchCreate({
                                    models: [...draftProvider.models, { id: "", name: "", vision: true, reasoning: false }]
                                })
                            }, t("addModelRow"))), modelsError === null ? null : h("p", { className: "mcf-fieldError" }, modelsError), probeError === null ? null : h("div", { className: "mcf-createStatus", ref: createStatusRef }, h("p", { className: "mcf-error", role: "alert" }, probeError), h("label", { className: "mcf-skipRow" }, h("input", {
                                className: "mcf-check",
                                type: "checkbox",
                                checked: skipProbe,
                                onChange: (event) => {
                                    setSkipProbe(event.target.checked);
                                    if (event.target.checked)
                                        setProbeError(null);
                                }
                            }), t("skipProbe")))), h("div", { className: "mcf-modalFoot" }, dialogError === null ? null : h("p", { className: "mcf-footError", role: "alert" }, dialogError), h("button", {
                                type: "button",
                                className: "mcf-btn",
                                disabled: createBusy || probeBusy,
                                onClick: closeCreate
                            }, t("cancel")), h("button", {
                                type: "button",
                                className: "mcf-btn mcf-btnPrimary",
                                disabled: createBusy || probeBusy || fetching,
                                onClick: () => void submitCreate()
                            }, createBusy ? t("testing") : probeBusy ? t("probing") : t("create")))));
                        }
                        if (editing !== null) {
                            const draftProvider = editing;
                            const protocolChoices = protocolChoicesOf(state.namespaces.get(draftProvider.ns));
                            const baseURL = draftProvider.baseURL.trim();
                            const baseURLError = baseURL.length > 0 && !isHttpUrl(baseURL) ? t("baseURLInvalid") : null;
                            const keyBlankOnly = draftProvider.apiKey.length > 0 && draftProvider.apiKey.trim().length === 0;
                            const keyError = keyBlankOnly ? t("keyBlankOnly") : null;
                            const filled = draftProvider.models.filter((model) => model.id.trim().length > 0);
                            const duplicateIds = new Set();
                            const counted = new Set();
                            for (const model of filled) {
                                const id = model.id.trim();
                                if (counted.has(id))
                                    duplicateIds.add(id);
                                else
                                    counted.add(id);
                            }
                            const editModelRowInvalid = (id) => {
                                if (!editAttempted)
                                    return false;
                                const trimmed = id.trim();
                                return trimmed.length === 0 || duplicateIds.has(trimmed);
                            };
                            const modelsError = editAttempted && filled.length === 0
                                ? t("needOneModel")
                                : editAttempted && duplicateIds.size > 0
                                    ? t("idDuplicate")
                                    : null;
                            const fieldProblem = baseURLError ?? keyError ?? modelsError;
                            const dialogError = editError ?? (editAttempted && fieldProblem !== null ? t("fixFields") : null);
                            const keyStateText = draftProvider.keyState === "stored"
                                ? t("keyStateStored")
                                : draftProvider.keyState === "absent"
                                    ? t("keyStateAbsent")
                                    : t("keyStateUnknown");
                            const editInputCls = (invalid) => {
                                if (!invalid)
                                    return "mcf-input";
                                return pulse ? "mcf-input mcf-inputInvalid mcf-pulse" : "mcf-input mcf-inputInvalid";
                            };
                            return h("div", {
                                className: "mcf-overlay",
                                onClick: (event) => {
                                    if (event.target === event.currentTarget && !editBusy)
                                        closeEdit();
                                }
                            }, h("div", {
                                className: "mcf-modal mcf-modalFixed mcf-modalCreate mcf-modalEdit",
                                role: "dialog",
                                "aria-modal": "true",
                                "aria-labelledby": "mcf-edit-title"
                            }, h("div", { className: "mcf-modalHead" }, h("div", null, h("h2", { className: "mcf-modalTitle", id: "mcf-edit-title" }, fill(t("editTitle"), { provider: draftProvider.provider })), h("p", { className: "mcf-modalSub" }, t("editHint"))), h("button", {
                                type: "button",
                                className: "mcf-btn mcf-btnSm mcf-iconBtn",
                                "aria-label": t("close"),
                                title: t("close"),
                                disabled: editBusy,
                                onClick: closeEdit
                            }, h(CloseIcon, {}))), h("div", { className: "mcf-modalBody" }, h("p", { className: "mcf-sectionLabel" }, t("sectionProvider")), h("p", { className: "mcf-editRoute" }, h("code", { className: "mcf-providerRoute" }, draftProvider.provider), h("span", null, t("editRouteLocked"))), h("div", { className: "mcf-formGrid" }, h("label", { className: "mcf-field" }, h("span", null, t("providerName")), h("input", {
                                className: "mcf-input",
                                type: "text",
                                value: draftProvider.displayName,
                                onChange: (event) => patchEdit({ displayName: event.target.value })
                            })), h("label", { className: "mcf-field" }, h("span", null, t("protocol")), h("select", {
                                className: "mcf-input",
                                value: draftProvider.protocol,
                                onChange: (event) => patchEdit({ protocol: event.target.value })
                            }, (draftProvider.protocol.length > 0 && !protocolChoices.includes(draftProvider.protocol)
                                ? [draftProvider.protocol, ...protocolChoices]
                                : protocolChoices).map((choice) => h("option", { key: choice, value: choice }, protocolLabel(choice))))), h("label", { className: "mcf-field mcf-span2" }, h("span", null, t("baseURLLabel")), h("input", {
                                className: editInputCls(baseURLError !== null),
                                type: "text",
                                value: draftProvider.baseURL,
                                ref: editBaseURLRef,
                                spellCheck: false,
                                "aria-invalid": baseURLError !== null,
                                placeholder: "https://api.example.com/v1",
                                onChange: (event) => patchEdit({ baseURL: event.target.value })
                            }), baseURLError === null
                                ? h("span", { className: "mcf-fieldHint" }, t("editBaseURLHint"))
                                : h("span", { className: "mcf-fieldError" }, baseURLError)), h("label", { className: "mcf-field mcf-span2" }, h("span", null, t("apiKeyLabel")), h("input", {
                                className: editInputCls(keyError !== null),
                                type: "password",
                                value: draftProvider.apiKey,
                                ref: editKeyRef,
                                spellCheck: false,
                                "aria-invalid": keyError !== null,
                                placeholder: draftProvider.keyRef,
                                onChange: (event) => patchEdit({ apiKey: event.target.value })
                            }), keyError === null
                                ? h("span", { className: "mcf-fieldHint" }, `${fill(t("editKeyHint"), { ref: draftProvider.keyRef })} · ${keyStateText}`)
                                : h("span", { className: "mcf-fieldError" }, keyError))), h("div", { className: "mcf-modelsHead", ref: editModelsRef }, h("p", { className: "mcf-sectionLabel" }, t("models"))), h("p", { className: "mcf-fetchHint" }, t("editModelsHint")), h("div", { className: "mcf-createModelEditor" }, h("div", { className: "mcf-createModelHeader", "aria-hidden": "true" }, h("span", null, t("modelId")), h("span", null, t("modelName")), h("span", null, t("vision")), h("span", null, t("reasoning")), h("span", null, t("actionsLabel"))), h("div", { className: "mcf-modelRows" }, draftProvider.models.map((model, index) => h("div", { className: "mcf-createModelRow", key: index }, h("label", { className: "mcf-field" }, h("span", null, t("modelId")), h("input", {
                                className: editInputCls(editModelRowInvalid(model.id)),
                                type: "text",
                                value: model.id,
                                spellCheck: false,
                                placeholder: undefined,
                                "aria-label": t("modelId"),
                                "aria-invalid": editModelRowInvalid(model.id),
                                onChange: (event) => patchEditModel(index, { id: event.target.value })
                            })), h("label", { className: "mcf-field" }, h("span", null, t("modelName")), h("input", {
                                className: "mcf-input",
                                type: "text",
                                value: model.name,
                                placeholder: undefined,
                                "aria-label": t("modelName"),
                                onChange: (event) => patchEditModel(index, { name: event.target.value })
                            })), h("div", { className: "mcf-createModelActions" }, h("label", { className: "mcf-rowCheck" }, h("input", {
                                className: "mcf-check",
                                type: "checkbox",
                                checked: model.vision,
                                onChange: (event) => patchEditModel(index, { vision: event.target.checked, visionTouched: true })
                            }), t("vision")), h("label", { className: "mcf-rowCheck" }, h("input", {
                                className: "mcf-check",
                                type: "checkbox",
                                checked: model.reasoning,
                                onChange: (event) => patchEditModel(index, { reasoning: event.target.checked, reasoningTouched: true })
                            }), t("reasoning")), draftProvider.models.length === 1
                                ? null
                                : h("button", {
                                    type: "button",
                                    className: "mcf-btn mcf-btnSm mcf-iconBtn",
                                    "aria-label": t("removeRow"),
                                    title: t("removeRow"),
                                    onClick: () => patchEdit({
                                        models: draftProvider.models.filter((_, at) => at !== index)
                                    })
                                }, h(CloseIcon, {}))))))), h("div", { className: "mcf-addRowWrap" }, h("button", {
                                type: "button",
                                className: "mcf-btn mcf-btnSm",
                                onClick: () => patchEdit({
                                    models: [...draftProvider.models, {
                                            id: "",
                                            name: "",
                                            /* Same defaults as the create dialog: a new row is
                                             * written explicitly, so both switches are touched. */
                                            vision: true,
                                            reasoning: false,
                                            visionTouched: true,
                                            reasoningTouched: true,
                                            raw: null
                                        }]
                                })
                            }, t("addModelRow"))), modelsError === null ? null : h("p", { className: "mcf-fieldError" }, modelsError)), h("div", { className: "mcf-modalFoot" }, dialogError === null ? null : h("p", { className: "mcf-footError", role: "alert" }, dialogError), h("button", {
                                type: "button",
                                className: "mcf-btn",
                                disabled: editBusy,
                                onClick: closeEdit
                            }, t("cancel")), h("button", {
                                type: "button",
                                className: "mcf-btn mcf-btnPrimary",
                                disabled: editBusy,
                                onClick: () => void submitEdit()
                            }, editBusy ? t("saving") : t("saveEdit")))));
                        }
                        const row = adding === null
                            ? undefined
                            : state.rows.find((candidate) => candidate.provider === adding);
                        if (row === undefined)
                            return null;
                        const id = draft.id.trim();
                        const testing = modalTest !== null && modalTest.status === "testing";
                        const canTest = row.active && id.length > 0 && !testing;
                        const error = addError ?? translateRowError(rowError[row.provider]);
                        return h("div", {
                            className: "mcf-overlay",
                            onClick: (event) => {
                                if (event.target === event.currentTarget)
                                    closeAdd();
                            }
                        }, h("div", {
                            className: "mcf-modal mcf-modalAdd",
                            role: "dialog",
                            "aria-modal": "true",
                            "aria-labelledby": "mcf-add-title"
                        }, h("div", { className: "mcf-modalHead" }, h("div", null, h("h2", { className: "mcf-modalTitle", id: "mcf-add-title" }, t("addModel")), h("p", { className: "mcf-modalSub" }, fill(t("addModelFor"), { provider: providerNameOf(row) }))), h("button", {
                            type: "button",
                            className: "mcf-btn mcf-btnSm mcf-iconBtn",
                            "aria-label": t("close"),
                            title: t("close"),
                            onClick: closeAdd
                        }, h(CloseIcon, {}))), h("div", { className: "mcf-modalBody" }, h("label", { className: "mcf-field" }, h("span", null, t("modelId")), h("input", {
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
                        })), h("label", { className: "mcf-field" }, h("span", null, t("modelName")), h("input", {
                            className: "mcf-input",
                            type: "text",
                            value: draft.name,
                            "aria-label": t("modelName"),
                            onChange: (event) => setDraft((current) => ({ ...current, name: event.target.value }))
                        })), h("div", { className: "mcf-testRow" }, h("button", {
                            type: "button",
                            className: "mcf-btn mcf-btnSm",
                            disabled: !canTest,
                            title: row.active ? undefined : t("inactiveHint"),
                            onClick: () => void runModalTest(row)
                        }, testing ? t("testing") : t("test")), modalTest === null || testing
                            ? h("span", { className: "mcf-modalHint" }, t("addHint"))
                            : h("span", {
                                className: "mcf-testResult " + (modalTest.status === "ok" ? "mcf-testResultOk" : "mcf-testResultFail")
                            }, modalTest.message)), error == null ? null : h("p", { className: "mcf-error" }, error)), h("div", { className: "mcf-modalFoot" }, h("button", {
                            type: "button",
                            className: "mcf-btn",
                            disabled: busy[row.provider] === true,
                            onClick: closeAdd
                        }, t("cancel")), h("button", {
                            type: "button",
                            className: "mcf-btn mcf-btnPrimary",
                            disabled: busy[row.provider] === true,
                            onClick: () => void submitAdd(row)
                        }, t("add")))));
                    };
                    /* Escape closes whichever overlay is open, wherever focus happens to be. */
                    React.useEffect(() => {
                        if (adding === null && confirming === null && creating === null && exporting === null)
                            return;
                        const onKey = (event) => {
                            if (event.key !== "Escape")
                                return;
                            if (creating !== null) {
                                if (candidates !== null)
                                    closeCandidatePicker();
                                else if (!createBusy && !probeBusy)
                                    closeCreate();
                                return;
                            }
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
                            setPicked(new Set());
                            setCandidateQuery("");
                            setExporting(null);
                            setExportPicked(new Set());
                            setExportCopy("idle");
                            setImporting(false);
                            setImportError(null);
                        };
                        document.addEventListener("keydown", onKey);
                        return () => document.removeEventListener("keydown", onKey);
                    }, [adding, confirming, creating, exporting, importing, candidates, createBusy, probeBusy]);
                    /* The shared Escape handler above predates the edit dialog, so this one
                     * covers it: exactly one overlay is ever open, so exactly one listener
                     * is ever attached. */
                    React.useEffect(() => {
                        if (editing === null)
                            return;
                        const onEditKey = (event) => {
                            if (event.key !== "Escape")
                                return;
                            if (!editBusy)
                                closeEdit();
                        };
                        document.addEventListener("keydown", onEditKey);
                        return () => document.removeEventListener("keydown", onEditKey);
                    }, [editing === null, editBusy]);
                    const loading = state.status === "loading" && state.rows.length === 0;
                    const failed = state.status === "error";
                    const renderSlot = props.renderSlot;
                    /* The detail pane follows the selected provider, falling back to the first row. */
                    const focused = state.rows.find((row) => row.provider === focusProvider) ?? state.rows[0];
                    /* A provider can only be hand-declared where a `providers` map exists. */
                    const creatableView = state.writable && [...state.namespaces.values()].some((namespace) => isRecord(getPath(namespace.value, ["providers"])) || isRecord(getPath(namespace.base, ["providers"])));
                    return h("section", {
                        className: "mcf-page",
                        "aria-busy": loading,
                        /* The visual system keys its layout off the active view. */
                        "data-view": exporting !== null ? "export" : "main"
                    }, h("style", null, MCF_CSS), h("header", { className: "mcf-pageHead", "data-window-drag": true }, h("div", { className: "mcf-pageIdentity" }, h("span", { className: "mcf-titleIcon", "aria-hidden": "true" }, h(PanelIcon, { size: 21 })), h("div", null, h("h1", { className: "mcf-pageTitle" }, t("title")), h("p", { className: "mcf-pageIntro" }, t("intro")))), h("div", { className: "mcf-toolbar" }, typeof renderSlot === "function" ? renderSlot("model-config.action", {}) : null, state.rows.length === 0 ? null : h("button", {
                        type: "button",
                        className: "mcf-btn mcf-btnSm",
                        onClick: () => startExport(state.rows)
                    }, t("exportAll")), state.writable && state.status === "ready" ? h("button", {
                        type: "button",
                        className: "mcf-btn mcf-btnSm",
                        onClick: startImport
                    }, t("importLabel")) : null, creatableView ? h("button", {
                        type: "button",
                        className: "mcf-btn mcf-btnSm mcf-btnPrimary",
                        onClick: startCreate
                    }, t("addProvider")) : null, state.updatedAt === null ? null : h("span", {
                        className: "mcf-updated",
                        role: "status"
                    }, fill(t("updated"), { time: state.updatedAt })), h("button", {
                        type: "button",
                        className: "mcf-btn mcf-iconBtn",
                        "aria-label": state.refreshing ? t("refreshing") : t("refresh"),
                        title: state.refreshing ? t("refreshing") : t("refresh"),
                        "aria-busy": state.refreshing,
                        disabled: state.refreshing,
                        onClick: load
                    }, h(RefreshIcon, { spin: state.refreshing })))), flash === null ? null : h("p", { className: "mcf-status", role: "status" }, flash), loading ? h("p", { className: "mcf-status", role: "status" }, t("loading")) : null, failed ? h("div", { className: "mcf-failure" }, h("p", null, state.error ?? t("loadFailed")), h("button", { type: "button", className: "mcf-btn mcf-btnSm", onClick: load }, t("retry"))) : null, !failed && !loading && state.rows.length === 0 ? h("p", { className: "mcf-status" }, t("empty")) : null, state.rows.length > 0 ? h("div", { className: "mcf-split" }, h("div", { className: "mcf-splitNav" }, h("div", { className: "mcf-splitHead mcf-providerNavHead" }, h("span", { className: "mcf-navHeadingTitle" }, h("span", null, t("providers")), h("span", { id: "navCount" }, String(state.rows.length))), h("span", { className: "mcf-providerModelHeading" }, t("providerModelHeading"))), h("div", { className: "mcf-pickList", role: "listbox", "aria-label": t("providers") }, state.rows.map(renderProviderNav))), h("div", { className: "mcf-splitMain" }, focused === undefined
                        ? h("p", { className: "mcf-splitEmpty" }, t("empty"))
                        : [renderProviderHead(focused), renderProviderDetail(focused)])) : null, !state.writable && state.rows.length > 0 ? h("p", { className: "mcf-notice" }, t("readOnly")) : null, renderDialog());
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
