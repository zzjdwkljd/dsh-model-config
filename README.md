# @local/model-config

DSH 侧栏「模型配置」插件：在左侧栏增加一个入口，打开后按**手风琴**列出当前配置下的模型提供商，
支持手动添加模型、测试模型是否能够连通，并可给单个模型打开识图。

## 功能

- **侧栏入口** — 向 `sidebar.panellist` 注册 `model-config`，点击后由 `layout.selectPanel` 切到同 key 的 `main` 面板。
- **提供商手风琴** — 数据来自 `llm.listProviders()` + `llm.listConfigurableProviders()` + `settings.describe()` 三路合并；
  只显示**当前已注册的路由**或**用户真正配置过的提供商**，休眠目录（`amazon-bedrock`、`anthropic` 等）不渲染。一次只展开一张卡片。
- **手动添加模型** — 卡片内「添加模型」→ 内联表单（模型 ID + 显示名称），校验非空与去重后用
  `settings.mutate` 写入 `[…settingsPath, 'models']`，携带 namespace revision，冲突时提示刷新。
- **测试连通** — Host 半边注册 `POST /model-config/test`，经 webserver 的信任门禁后用 `llm.stream()`
  对该 provider/model 发一次 64 token 的极小补全，按 `finish` 判定成功或返回真实错误原因。
  这条通道对 DeepSeek、pi-ai、自定义中转等所有已注册路由一致可用。
- **识图开关** — `role="switch"` + `aria-checked`；按适配器家族写 `inputModalities`（DeepSeek）或 `input`（pi-ai），
  取消识图时同步清理 `imagePixelBudget` / `imageMaxBytes`，与官方 Models 页行为一致。

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
2. 之后改动 `src/*.ts` 后执行 `npm run build`，再把 bundle 关闭/开启一次以推送新的 Client 产物。
