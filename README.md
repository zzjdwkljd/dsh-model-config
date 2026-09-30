# @local/model-config

DSH 侧栏「模型配置」插件：在左侧栏增加一个入口，打开后按**手风琴**列出当前配置下的模型提供商，
支持以弹窗添加模型（提交前可先测试连通）、删除单个模型或整个品牌商，并可给单个模型打开识图，
以及把某个（或全部）模型商**导出**成文件、把导出内容再**导入**回来。

## 功能

- **侧栏入口** — 向 `sidebar.panellist` 注册 `model-config`，点击后由 `layout.selectPanel` 切到同 key 的 `main` 面板。
- **提供商手风琴** — 数据来自 `llm.listProviders()` + `llm.listConfigurableProviders()` + `settings.describe()` 三路合并；
  只显示**当前已注册的路由**或**用户真正配置过的提供商**，休眠目录（`amazon-bedrock`、`anthropic` 等）不渲染。一次只展开一张卡片。
- **手动添加模型** — 卡片内「添加模型」→ 弹窗（模型 ID + 显示名称），校验非空与去重后用
  `settings.mutate` 写入 `[…settingsPath, 'models']`，携带 namespace revision，冲突时提示刷新。
  弹窗内另有「测试」按钮，可在提交前先验证该 model ID 是否连通；Esc、遮罩点击或右上角 ✕ 关闭。
- **删除模型 / 删除品牌商** — 模型行与面板头部的垃圾桶按钮，两者都要经过二次确认弹窗。
  删除品牌商用 `{ op: 'unset', path: [...settingsPath] }`，与官方「模型」设置页的
  `removeProviderProfile` 同一写法，会真的写入 profile 的 `cordis.patch.yml`；
  仅当 `editable && writable && settingsPath.length > 0` 时才显示该按钮 ——
  对空路径执行 `unset` 会被 settings 服务以 `Config root must be a plain object` 拒绝。
- **测试连通** — Host 半边注册 `POST /model-config/test`，经 webserver 的信任门禁后用 `llm.stream()`
  对该 provider/model 发一次 64 token 的极小补全，按 `finish` 判定成功或返回真实错误原因。
  这条通道对 DeepSeek、pi-ai、自定义中转等所有已注册路由一致可用。
- **识图开关** — `role="switch"` + `aria-checked`；按适配器家族写 `inputModalities`（DeepSeek）或 `input`（pi-ai），
  取消识图时同步清理 `imagePixelBudget` / `imageMaxBytes`，与官方 Models 页行为一致。
- **导出（单个模型商 / 全部 / 自选）** — 面板头部与页面工具栏各有一个导出入口，弹窗里选格式后

  | 格式 | 内容 | 用途 |
  | --- | --- | --- |
  | JSON | 完整记录：`provider` / `displayName`（昵称）/ `baseURL` / `api` / `apiKeyEnv` / 明文 `apiKey` / 全部模型字段 | 迁移、备份、喂给别的工具 |
  | YAML | 按 settings 命名空间还原的配置片段，可整段粘回 `settings.yaml` 或 profile 的 `cordis.patch.yml`；密钥只作为注释列出 | 恢复配置 |
  | .env | 每行 `REF=value`（仅声明过 `apiKeyEnv` 的提供商） | 只搬钥匙 |

  弹窗里有一份**提供商勾选列表**：卡片上的「导出」按钮打开时只勾中该提供商，
  工具栏的「导出全部」打开时全部勾中，两种情况都能再随意增减，并配「全选 / 全不选」。
  标题、小标题的「N 个提供商 · M 个模型」、预览内容、文件名都跟着勾选实时变：
  只勾一个用该路由名，勾满整份列表用 `all`，勾中间几个用 `2providers` 这样的名字
  （例如 `model-config-xiaomi-20260930-1350.json`、`model-config-2providers-20260930-1350.json`）。
  一个都没勾时预览照旧显示「什么都没导出」，但「复制 / 保存文件」会禁用并提示至少选一个。

  「以明文包含密钥」默认勾选，可随时关掉（关掉后 JSON 的 `apiKey` 为 `null`，.env 选项禁用）。
  密钥只按**当前勾选**的提供商去 Host 取，改动勾选会重新取一次（带请求序号，慢到的旧响应不会覆盖新选择）。
  底部有「复制」与「保存文件」两个出口；Esc、遮罩点击或 ✕ 关闭，导出全程只读，不写任何配置。

  > 密钥值是**唯一**由 Host 半边提供的数据：`credentials` Remote 只有 `describe`/`set`/`unset`，
  > 拿不到明文。Host 侧新增 `POST /model-config/secrets`，用 `ctx.credentials.resolve(ref)` 取值，
  > 并用 `ctx.settings.describe()` 做白名单：**只有配置文档里 `apiKeyEnv` 声明过的引用才会被解析**，
  > 其余一律进 `refused`。所以这条路由不能被当成「按名字读任意凭据」的通道
  > （模型 ID 之类恰好与环境变量同名的字符串也不会被解析）。参考名不合法、超过 64 个、
  > 未声明的都在响应里分别报告，客户端据此提示「尚未存储 / 配置中未引用」。

- **导入** — 工具栏「导入」按钮（仅设置文档可写且已加载时出现）打开导入弹窗：
  可粘贴内容或选文件（`.json` / `.yaml` / `.env` / `.txt`），格式可自动识别也可手动指定。
  解析后先出**预览**：每条列出昵称、路由、命名空间、模型数，以及 `新增` / `覆盖` / `跳过` 徽标
  （跳过时写明原因），底部统计 `新增 N · 覆盖 M · 跳过 K · 模型 X`；**确认之前不写任何东西**。

  | 输入 | 能还原什么 |
  | --- | --- |
  | JSON（本插件导出的完整记录） | 昵称 / 接口地址 / 协议 / 模型全字段，外加明文密钥（可选） |
  | YAML（配置片段） | 命名空间 → 路由 → 该路由的设置值，整段写回原路径；密钥只存在于注释里，**不会**被导入 |
  | .env | 只写凭据库（`REF=value`），不动配置文档 |

  写入走与「手动添加模型」完全相同的路径：按命名空间分组，每个命名空间一次
  `settings.mutate(ns, [{ op: 'set', path, value: profile }], revision)`，带 revision 校验；
  密钥在配置落地后用 `credentials.set` 逐个写入（「把文档里的密钥写入凭据库」可关闭）。
  某个命名空间失败（revision 冲突等）不会中断其余命名空间，**弹窗保持打开**并逐条列出失败原因，
  全部成功才关闭并提示结果。

  计划阶段的判定：路由取记录里的 `provider`，YAML 的分区根（没有 `providers` 层）则回落到
  当前配置中同一命名空间、路径为空的那一行；路由不合法 → 跳过；命名空间不存在 → 跳过；
  `models` 是空数组 → 跳过；同一目标的重复条目按**最后一次**写入合并。
  `settingsPath` 为空表示整段替换该命名空间，预览里同样标成「覆盖」。

  > YAML 用的是**子集解析器**，只接受本插件导出的形态（外加手写常见的 `- key: value` 续行写法）：
  > 引号标量走 `JSON.parse`，裸标量按 `true`/`false`/`null`/数字/其余字符串判定，
  > 键分隔符取「行尾或后跟空格的 `:`」（所以键里可以有空格和 `:`）。
  > 行内 `{a: 1}`、tab 缩进、未加引号的 `a: b` 这类本插件不会写出的形态会被**明确拒绝并给出原因**，
  > 而不是猜一个结果；这时改用 JSON 导出即可。

  > 导入同样受「Host 半边需重启」的限制吗？不需要：导入只用 `settings.mutate` 与 `credentials.set`
  > 两个已存在的 Remote，Host 侧没有新增路由。

## 界面

设计变量全部定义在 `.mcf-page` 上（不外泄到全局）：主色 `#635BFF`、卡片 `#FFFFFF`、边框 `#E8E8EC`、
页面底色 `#F6F7F9`、文字 `#18181B` / `#71717A` / `#A1A1AA`，另有告警色 `--mcf-warn`
（导入预览的「覆盖」徽标）。三种卡片状态分别是白底 `#E8E8EC` 边框、
Hover `#FAFAFF` + `#DDDDF0`、展开 `#FBFBFF` + `#DCD9FF` 并带 3px 主色强调线，展开动画 180ms ease-out。
另有 `body[data-ds-dark-theme]` 的深色映射。品牌 Logo 没有素材，`.mcf-providerIcon` 以提供商 id 的
两字母缩写兜底，并已留好 `<img>` 样式钩子。

两个数据量大的弹窗（导出勾选列表、导入预览）用 `.mcf-modalWide` 放宽到 620px、加高到
`min(780px, calc(100vh - 64px))`，提供商勾选列表用 `.mcf-pickList`（`flex:0 0 auto` +
`max-height:min(52vh, 420px)`）：列表**只按内容长高、不被压缩**，窗口够高时一次看全十来个提供商，
窗口变矮时优先保住列表可读性，由**弹窗正文整块滚动**去够到预览；其余弹窗维持 460px 的窄版。
固定高度的弹窗里，预览框（`.mcf-modalFixed .mcf-exportText`）是 `flex:1 1 auto`，
**自适应占满勾选列表和提示之后的剩余高度**（窗口太矮时收到 110px 下限、再由正文滚动兜底），
不再是一个固定 200px 的小格子；点进预览框自动全选时会同步把滚动条拉回开头，
避免停在 JSON 末尾看起来像被截断。

## 目录结构

```
src/client.ts     Client 半边（TypeScript，strict）→ 编译为 ./client.js
src/index.ts      Host 半边（TypeScript，strict）→ 编译为 ./index.js
tsconfig.json     strict + noUncheckedIndexedAccess，输出到包根
locale/           展示元信息（Plugin Manager 卡片标题/描述）
cordis.patch.yml  Bundle 补丁：插入 model-config 行
icon.svg          插件图标
```

## 构建

```bash
npm install        # 安装 typescript / @types/node / @types/react
npm run build      # tsc → index.js、client.js
npm run typecheck  # 只检查不输出
```

`index.js` / `client.js` 是构建产物，随仓库一起提交，因此 `install_bundle` 不需要构建步骤。

### 模块形态约束

Client 产物会被拼进共享 combo 脚本，所以 **`client.js` 顶层只能有一条语句**（`window.__ModuleLoader__.load(...)`），
所有运行期绑定都必须写在 `factory` 函数体内 —— 这是 `tsconfig.json` 里 `rootDir: src` + 手写结构共同保证的，
改动 `src/client.ts` 时请保持这一结构。

## 安装到 DSH

在会话中用 `plugin_manager`：

1. `install_bundle` → `target` 填本目录绝对路径；
2. 之后改动 `src/*.ts` 后执行 `npm run build`，再刷新页面即可。

**两半的生效方式不同**：Client 产物（`client.js`）由 `dsh-client-modules` 盯着文件哈希，
重新构建后服务端立刻按新 rev 提供给浏览器（页面热更新或刷新一次即可）；Host 产物（`index.js`）
属于进程内模块，而模块热重载在 profile 里是**可选**的（`dsh-base` 的 `hmr` 行默认 `disabled: true`），
所以**新增/修改 Host 路由后需要重启一次 DSH**，或在启用了模块热重载的 profile 里把 bundle 关闭/开启一次。

在 Host 半边生效之前，导出弹窗会明确提示「Host 端尚未响应」，但昵称 / 接口地址 / 模型等字段照常导出，
只是 `apiKey` 取不到值 —— 弹窗不会因此卡住或报错。

## 验证

改动导入/导出逻辑时可跑这几支探针（它们位于开发工作区的 `_probe/`，**不属于本包**，所以仓库里没有；
下文的 `_probe/` 指该目录）：

```bash
node _probe/mcfg-export-format-test.mjs     # 导出三格式 + 导入解析/计划，含 YAML 用真实解析器回读
node _probe/mcfg-host-test.mjs              # 引用校验、白名单、以及带真实凭据库的路由级测试
node _probe/mcfg-i18n-test.mjs              # 中英字典键位、占位符与 fill() 参数、死键
node _probe/audit-ui.mjs                    # CSS 变量/规格与「用了没写、写了没用」的类名
node _probe/mcfg-client-bundle-check.mjs    # 运行中的服务是否已提供新的 client 产物
node _probe/mcfg-live-route-check.mjs       # 运行中的 Host 路由（需已重启进程）
```

后两支默认打本机 GUI（`http://127.0.0.1:19387`），可用 `DSH_ORIGIN` 覆盖（例如 GUI 换端口后）：

```bash
DSH_ORIGIN=http://127.0.0.1:43120 node _probe/mcfg-client-bundle-check.mjs
```

`mcfg-export-format-test.mjs` 会把 `src/client.ts` 里的导出/导入辅助函数整段切出来编译执行，
所以它验证的是**真正要发布的那份代码**，而不是复制品；导入部分覆盖：
JSON/YAML/.env 的解析、计划（新增/覆盖/跳过、路由回落、重复目标、空模型列表、未知命名空间）、
密钥写入目标（含 `apiKeyEnv` 缺失时按 `deriveKeyRef` 回退）、以及「导出的 YAML 能被自己的解析器
逐字段读回」的深比较（同时用真实 `yaml` 包对照）。
