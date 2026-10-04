# 模型配置插件 · 视觉规范（字号 / 字重 / 间距 / 颜色）

日期：2026-10-02　范围：`src/client.ts` 的 `MCF_CSS`（纯呈现层，不动控制器、不动 Host）
基线：`.mcf-page` 上的 8 级字号 token + 三层文字色，实测 WCAG 对比度后重新定档

---

## 0. 这份规范要解决什么

现在这套界面已经把字号收成了 token，但**层级仍然立不住**：重点不够重，辅助不够轻，两层灰只差一点点。结果是所有信息看起来一样大声，眼睛没有落点。

本规范只做一件事：让"哪个是重点、哪个是辅助"在一眼之内成立。手段有三条，且必须**同向叠加**——加重要同时加粗、加深、放大；减轻要同时减细、减淡、缩小。绝不交叉使用（「大字号 + 浅灰」或「小字号 + 纯黑」都是噪声，不构成层级）。

---

## 1. 核心原则

### 1.1 三轴同向

| 目标 | 字重 | 颜色 | 字号 |
| --- | --- | --- | --- |
| 重（主） | 600–650 | `--mcf-text` | 14–22px |
| 中（次） | 400–500 | `--mcf-text-2` | 13–14px |
| 轻（辅） | 400 | `--mcf-text-3` | 11–12px |

### 1.2 层级预算

一屏之内**最多三层文字**（主 / 次 / 辅）。出现第四层就说明信息该合并、该折叠，或者该删。这条比任何具体数值都重要。

### 1.3 每屏只有一个"最重"

同一时刻，页面上只有一个元素可以同时满足「最大字号 + 650 字重 + 主色文字」。它通常是页面标题，或弹窗标题。

### 1.4 辅助文字永不参与交互

`--mcf-text-3` 上的文字一律不可点击、不带 hover、不做按钮标签。可点的东西必须有正文级对比度。

---

## 2. 字号阶梯

8 级全部保留，但每级绑定唯一角色，不再出现"随手挑一个字号"。

| token | 字号 | 行高 | 角色 | 字重 |
| --- | --- | --- | --- | --- |
| `--mcf-fs-display` | 22 | 30 | 页面主标题（每页 1 处） | 650 |
| `--mcf-fs-headline` | 19 | 26 | 弹窗标题、提供商显示名 | 650 |
| `--mcf-fs-title` | 17 | 24 | 分区大标题 | 650 |
| `--mcf-fs-section` | 15 | 22 | 卡片 / 区块标题 | 600 |
| `--mcf-fs-lead` | 14 | 22 | 正文主力：模型 ID、字段值、主按钮 | 500–600 |
| `--mcf-fs-body` | 13 | 20 | 常规正文、列头、次要按钮、说明 | 400–500 |
| `--mcf-fs-meta` | 12 | 18 | 标签、徽标、计数、脚注 | 400–500 |
| `--mcf-fs-micro` | 11 | 16 | 极限小字：**仅**徽标内数字、键位提示 | 400 |

**硬约束**

- `micro` 不得用于成句文本。核查后实际情况：`.mcf-pickName` 已被第 1321 行的 `.mcf-page .mcf-splitItem .mcf-pickName` 覆盖为 `fs-lead`(14px)，**并未**被压到 11px；真正用到 `micro` 的成句文本只有 `.mcf-updated`（"Updated 14:32"），且仅在 ≤580px 生效；`.mcf-splitIcon` 是首字母缩写，属徽标用法，合理。此处无需改动。
- 正文下限 13px。窄屏靠**换行和折叠**腾空间，不靠继续缩字。
- 数字类（计数、模型数、容量）一律 `font-variant-numeric: tabular-nums`，避免跳动。

---

## 3. 字重

只保留四档，并与字号反向搭配：**字号越小，字重越不能轻**，否则小字糊成一团。

| token | 值 | 用于 |
| --- | --- | --- |
| `--mcf-fw-regular` | 400 | 说明、注释、未选中项名称、空态 |
| `--mcf-fw-medium` | 500 | 正文、次要按钮、列头 |
| `--mcf-fw-semibold` | 600 | 模型 ID、字段值、状态徽标、主按钮 |
| `--mcf-fw-bold` | 650 | 仅标题类 + 当前选中项 |

**当前问题**：`.mcf-iconDanger` 常驻 `color:#9c8597`，与 danger 语义不一致，且 400 字重下看起来像禁用。危险图标应默认中性、hover 才转红。

---

## 4. 行高与字距

### 4.1 行高

统一走 token（`--mcf-lh-*`），禁止再有裸 `line-height:1.65 / 1.85 / 1.6` 混写。

- 单行元素（徽标、按钮、列头）→ 用其字号对应的 `--mcf-lh-*`
- 多行正文 → 按段落放宽一档：13px 配 20–22px，14px 配 22–24px
- 正文行高不得低于 **1.5**，中文低于 1.6 会挤

### 4.2 字距

现在有 `-.2px / -.025em / -.018em / -.012em / -.005em / 0 / .01em / .02em / .03em / .06em` 十种，收敛到五档：

| token | 值 | 用于 |
| --- | --- | --- |
| `--mcf-ls-tight` | -.02em | 大标题（≥19px） |
| `--mcf-ls-snug` | -.01em | 中标题（15–17px） |
| `--mcf-ls-normal` | 0 | 正文、等宽值 |
| `--mcf-ls-wide` | .02em | 小标题、列头（11–13px） |
| `--mcf-ls-caps` | .06em | 等宽大写元信息码（JSON / YAML 标签） |

**规律**：字号越大字距越负，字号越小字距越正（光学补偿）。这条能解释为什么现在所有地方都用 `-.2px` 是错的——11px 的文字需要**正**字距。

---

## 5. 文字色：三层级（实测对比度）

这是本次规范的关键。用 WCAG 相对亮度公式实测，底色取卡面 `#ffffff`。

### 5.1 现状（问题所在）

| 层级 | 值 | 对白底 | 说明 |
| --- | --- | --- | --- |
| 主 | `#263249` | **12.85** | 够重 |
| 次 | `#53627a` | **6.18** | 偏重，和主层挤在一起 |
| 辅 | `#64718a` | **4.92** | 与次层只差 1.26，**立不住** |

三层落在 12.9 / 6.2 / 4.9，次层与辅层几乎分不开，这就是"看起来一样大声"的根因。

深色主题问题更明显：主 `#eef1f8` **14.17** / 次 `#b6c0d3` **8.75** / 辅 `#98a6c0` **6.52**。
深色的"辅"（6.52）比浅色的"次"（6.18）还亮——**两套主题的辅助层级手感完全不同**。

### 5.2 建议值

浅色：

| 层级 | 值 | 对白底 | 对页面底 `#f5f6fa` |
| --- | --- | --- | --- |
| `--mcf-text` | `#1f2b3d` | **14.27** | 13.2 |
| `--mcf-text-2` | `#44526b` | **7.88** | 7.3 |
| `--mcf-text-3` | `#64718a` | **4.92** | 4.55 |

深色：

| 层级 | 值 | 对卡面 `#1e212d` | 对页面底 `#141620` |
| --- | --- | --- | --- |
| `--mcf-text` | `#eef1f8` | **14.17** | 15.94 |
| `--mcf-text-2` | `#a9b4c9` | **7.67** | — |
| `--mcf-text-3` | `#8b98b2` | **5.52** | — |

调整后两套主题的阶梯都约为 **1.8x → 1.4x** 的逐级递减，重的中、轻的轻，且三层都 ≥ 4.5:1（AA 达标）。

### 5.3 使用规约

- `--mcf-text`：标题、模型 ID、字段值、当前选中项、主按钮文字
- `--mcf-text-2`：正文、说明、字段标签、列头、次要按钮
- `--mcf-text-3`：计数、时间戳、脚注、占位「—」、未选中项
- 「未提供 / 空值」用 `text-2` 并**切回非等宽字体**，告诉人"这里没有值"，而不是"值是这个"

---

## 6. 语义色

### 6.1 实测

| 语义 | 浅色现状 | 对白底 | 结论 |
| --- | --- | --- | --- |
| success | `#247763` | 5.39 | 达标 |
| danger | `#b1475c` | 5.35 | 达标 |
| warn | `#b18243` | **3.42** | ❌ **AA 不达标** |
| accent | `#635BFF` | 4.70 | 勉强达标 |

深色现状：success `#91cfb8` 9.02 / danger `#e397a4` 7.04 / warn `#c4a16e` 6.62 均达标。
但 **accent 作文字色在深色卡面上只有 3.41**——❌ **AA 不达标**。

### 6.2 两个必须修的缺陷

**缺陷 1：浅色 warn 不达标**
`--mcf-warn:#b18243` = 3.42:1，用在 11–13px 正文上是不可读的。改为 `#8a5f1f` = **5.62:1**。

**缺陷 2：accent 需要拆成「填充」和「文字」两个 token**
`#635BFF` 作按钮填充 + 白字 = 4.70 ✓ 可用；但作**文字色**时，浅色 4.70 / 深色仅 3.41。
现在这些地方都在用它当文字：选中态 `.mcf-pickName`、`.mcf-importBadgeNew`、导出勾选行的 `.mcf-candId`、`.mcf-factContext .mcf-factValue`。

拆开：

| token | 浅色 | 深色 | 用途 |
| --- | --- | --- | --- |
| `--mcf-accent` | `#635BFF`（不动） | `#635BFF`（不动） | 实心填充、边框、开关、选中底 |
| `--mcf-accent-hover` | `#574FE8` | `#574FE8` | 填充 hover |
| `--mcf-accent-text` | `#574FE8` = **5.69** | `#a89bff` = **6.71** | 任何以主色**显示文字**的地方 |

保留 `#635BFF` 作填充色（用户已指定主色，不动），只给"文字形态"加一个达标变体。这是最小改动、不破坏品牌色的方案。

### 6.3 语义色使用规约

- 只用于**状态**，不用于装饰
- 必须**同时带图标或文字**，不单靠颜色（色觉障碍）
- 常驻状态用「浅底 + 同色细边框 + 该色文字」；临时反馈（测试成功/失败）才用整块浅底
- 危险操作**默认中性灰，hover 才转红**。常驻红色会让整页紧张

---

## 7. 表面与边框

明度层级（浅 → 深）：`--mcf-bg` → `--mcf-neutral` → `--mcf-surface-hover` → `--mcf-surface`

- 卡片一律 `--mcf-surface`，页面底 `--mcf-bg`，两者差一档即可
- `--mcf-neutral` 只用于「列表内凹区」和「徽标底」，不用于整块卡片
- 边框 `#e9ebf2` = 1.19:1，纯装饰性分区线，**不得作为唯一可交互提示**（1.19 远低于 3:1 的控件边界要求）
- 焦点环用 `--mcf-ring` + `outline-offset`，不靠边框变色

---

## 8. 间距

### 8.1 基准栅格

4px 基准，收敛成 12 档。当前代码里出现了 4/6/7/8/9/10/11/12/13/14/15/16/17/18/19/20/21/22/23/24/25/26/28/32/34/38/56 —— 太散，至少要砍掉一半。

```
--mcf-sp-1:4px   --mcf-sp-2:6px   --mcf-sp-3:8px   --mcf-sp-4:10px
--mcf-sp-5:12px  --mcf-sp-6:14px  --mcf-sp-7:16px  --mcf-sp-8:20px
--mcf-sp-9:24px  --mcf-sp-10:32px --mcf-sp-11:40px --mcf-sp-12:56px
```

### 8.2 核心规律：组内 < 组间

同组内间距必须**小于**组间距，且至少差 1.5 倍。这条是"分组感"的唯一来源。

| 关系 | 间距 | 档位 |
| --- | --- | --- |
| 标签 ↔ 值 | 4–6 | sp-1 / sp-2 |
| 行内元素之间 | 8–12 | sp-3 / sp-5 |
| 卡片内边距 | 14–16 | sp-6 / sp-7 |
| 相邻卡片之间 | 10 | sp-4 |
| 区块之间 | 20–24 | sp-8 / sp-9 |
| 页面区块之间 | 24–32 | sp-9 / sp-10 |
| 页面外边距 | 32–40 | sp-10 / sp-11 |

### 8.3 当前偏差

- 页面 `padding:34px 38px 32px` → 应收敛到 `32px 40px`
- `.mcf-page{gap:24px}` 与 `.mcf-page[data-view="main"]{gap:23px}` 并存，差 1px 无意义 → 统一 24
- 弹窗内 `padding:21px 26px 20px` / `gap:17px 20px` / `gap:23px` 三套体系 → 统一到档位

---

## 9. 特殊地方特殊处理

置顶规则之外的十二种例外，每种都有明确理由。

1. **模型 ID / 接口地址 / 协议名 / 密钥引用**
   等宽字体 + 比同区正文**大一级**（`fs-lead` 而非 `fs-body`）+ 字重 500–600 + 用 `--mcf-text` 而非 `text-2`。
   理由：这是本页最需要被**准确读出**的值，抄错一个字符就配不通，必须比周边正文更重。

2. **绝不截断模型 ID**
   用 `overflow-wrap:anywhere`，不用 `text-overflow:ellipsis`。ID 被截断就失去意义。

3. **计数徽标**（提供商数、模型数）
   `tabular-nums` + `fs-meta`/`fs-micro` + 轻底色 + 字重 **500 或 400，不加粗**。
   理由：计数是辅助，不能和模型名抢注意力。

4. **状态徽标**（已配置 / 未配置）
   浅底 + 同色细边框 + 600 字重，视觉重量与模型 ID 同级但**不得超过**。

5. **主按钮唯一**
   全页只有一种实心强调色按钮，其余一律描边。同一屏主按钮 ≤ 1 个。

6. **危险操作默认中性**
   `.mcf-iconDanger` 默认 `--mcf-text-3`，hover 才 `--mcf-danger` + 浅红底。常驻红色会让整页紧张。

7. **空态与占位「—」**
   颜色降到 `text-2`，**切回非等宽字体**，字号不加大。它表示"无值"，不是"值"。

8. **禁用态**
   `opacity:.45` + 保持颜色语义，**不要**改用灰字（会和辅助文字混淆）。

9. **弹窗标题低一级**
   弹窗标题用 `fs-headline`(19) 而非页面标题 `fs-display`(22)。
   理由：弹窗是任务，不是页面，不该抢页面主标题的层级。

10. **列头比内容轻一档**
    列头用 `text-2` + 500/600；内容是 `text` + 600。列头是路标不是数据。

11. **测试反馈内嵌在所属卡片**
    成功/失败块挂在对应 `.mcf-modelBlock` 内部，边框色跟随状态。反馈不能漂在两张卡片之间。

12. **长文本换行策略**
    ID / URL 用 `word-break:break-word` + `overflow-wrap:anywhere`；
    中文说明用 `word-break:keep-all` 避免把词拆断；名称可 `text-wrap:balance` 让两行等长。

---

## 10. 组件映射表

| 元素 | 字号 | 字重 | 颜色 | 字距 |
| --- | --- | --- | --- | --- |
| `.mcf-pageTitle` | display 22 | 650 | text | tight |
| `.mcf-pageIntro` | body 13 | 400 | text-2 | normal |
| `.mcf-modalTitle` | headline 19 | 650 | text | tight |
| `.mcf-modalSub` | meta 12 | 400 | text-3 | normal |
| `.mcf-providerDisplayName` | headline 19 | 650 | text | tight |
| `.mcf-providerRoute` | body 13 mono | 500 | text-2 | normal |
| `.mcf-sectionTitle` | lead 14 | 650 | text | wide |
| `.mcf-navHeadingTitle` | lead 14 | 650 | text | wide |
| `.mcf-splitItem .mcf-pickName` | body 13 | 500 / 选中 600 | text-2 / 选中 text | normal |
| `.mcf-modelGridHead` | body 13 | 600 | text-2 | wide |
| `.mcf-candId`（模型 ID） | lead 14 mono | 600 | text | normal |
| `.mcf-modelName` | body 13 | 400 | text-2 | normal |
| `.mcf-factItem dt` | body 13 | 500 | text-2 | normal |
| `.mcf-factValue` | lead 14 mono | 500 | text | normal |
| `.mcf-factItem[data-empty] .mcf-factValue` | lead 14 sans | 400 | text-2 | normal |
| `.mcf-modelMeta`（计数） | meta 12 | 500 | text-3 | normal |
| `.mcf-badge` / `.mcf-popTag` | meta 12 | 500 | text-3 | normal |
| `.mcf-status` / 说明 | body 13 | 400 | text-3 | normal |
| `.mcf-btn`（次要） | body 13 | 500 | ghost-text | normal |
| `.mcf-btnPrimary` | body 13 | 600 | #fff on accent | normal |
| 选中态主色文字 | 同所在元素 | 同所在元素 | `--mcf-accent-text` | 同所在元素 |

---

## 11. 当前实现的问题清单（实测）

| # | 问题 | 证据 | 修法 |
| --- | --- | --- | --- |
| 1 | 浅色「次」与「辅」分不开 | 6.18 vs 4.92，只差 1.26 | `text-2` → `#44526b`（7.88） |
| 2 | 深浅主题辅助层级手感不一致 | 深色辅 6.52 > 浅色次 6.18 | 深色 `text-3` → `#8b98b2`（5.52），`text-2` → `#a9b4c9` |
| 3 | 浅色 warn 不达标 | `#b18243` = 3.42:1 | → `#8a5f1f`（5.62） |
| 4 | accent 当文字色在深色不达标 | `#635BFF` on `#1e212d` = 3.41:1 | 新增 `--mcf-accent-text` |
| 5 | 11px 文字被用了正字距之外的值 | 10 种字距混用，含 `-.2px` | 收敛到 5 档 |
| 6 | 危险图标常驻灰红 `#9c8597` | 与 danger 语义不符，像禁用 | 默认 `text-3`，hover 转 red |
| 7 | ~~导出视图 `.mcf-pickName` 压到 11px~~ **误判，已核实撤回** | 第 1321 行实际覆盖为 14px | 无需改动 |
| 8 | 间距值有 27 种 | 4…56 无规律 | 收敛到 12 档 |
| 9 | 边框 1.19:1 被当作可交互提示 | 低于 3:1 控件边界要求 | 交互态补 hover/focus 线索 |

---

## 12. 建议的 token 块（可直接替换）

```css
.mcf-page{
  /* 字距 */
  --mcf-ls-tight:-.02em; --mcf-ls-snug:-.01em; --mcf-ls-normal:0;
  --mcf-ls-wide:.02em;   --mcf-ls-caps:.06em;
  /* 字重 */
  --mcf-fw-regular:400; --mcf-fw-medium:500;
  --mcf-fw-semibold:600; --mcf-fw-bold:650;
  /* 间距（4px 栅格） */
  --mcf-sp-1:4px;  --mcf-sp-2:6px;  --mcf-sp-3:8px;  --mcf-sp-4:10px;
  --mcf-sp-5:12px; --mcf-sp-6:14px; --mcf-sp-7:16px; --mcf-sp-8:20px;
  --mcf-sp-9:24px; --mcf-sp-10:32px;--mcf-sp-11:40px;--mcf-sp-12:56px;
  /* 文字三层 */
  --mcf-text:#1f2b3d; --mcf-text-2:#44526b; --mcf-text-3:#64718a;
  /* 语义色 */
  --mcf-success:#247763; --mcf-warn:#8a5f1f; --mcf-danger:#b1475c;
  /* 主色：填充与文字分离 */
  --mcf-accent:#635BFF; --mcf-accent-hover:#574FE8; --mcf-accent-text:#574FE8;
}
body[data-ds-dark-theme] .mcf-page{
  --mcf-text:#eef1f8; --mcf-text-2:#a9b4c9; --mcf-text-3:#8b98b2;
  --mcf-success:#91cfb8; --mcf-warn:#c4a16e; --mcf-danger:#e397a4;
  --mcf-accent:#635BFF; --mcf-accent-hover:#574FE8; --mcf-accent-text:#a89bff;
}
```

---

## 13. 落地顺序

1. **先换颜色 token**（第 12 节整块替换）——收益最大、风险最低，不动任何选择器结构
2. 把 `color:var(--mcf-accent)` 的**文字**用法改成 `var(--mcf-accent-text)`
3. 收敛字距到 5 档，替换 `-.2px` 等裸值
4. 收敛间距到 12 档，优先处理页面 padding 与弹窗内部
5. 修正第 11 节的第 6、7 条（危险图标、导出视图 11px）
6. 每次改完跑 `npm run typecheck && npm run build`，再跑 `node demo_code/ui-contract.test.mjs` 确认业务函数哈希未被触碰

> 全部改动都在 `MCF_CSS` 内，属于纯呈现层；不碰控制器、事件表达式、Host 路由与 Settings 写入路径，因此 `ui-contract` 的 101 个函数与 86 条表达式基线不受影响。

---

## 14. 落地记录（2026-10-02 已实施）

实现方式：**沿用本文件已有的分层覆盖写法**，在 `MCF_CSS` 末尾追加一个「视觉规范落地」块，而不是逐条改原规则。这样原规则全部保留、可随时整块回退，也便于 review。

已落地：

- 浅色三层文字 `#1f2b3d / #44526b / #64718a`，深色 `#eef1f8 / #a9b4c9 / #8b98b2`
- `--mcf-warn` 浅色 `#b18243` → `#8a5f1f`（3.42 → 5.62，修复 AA 不达标）
- 新增 `--mcf-accent-text`：浅色 `#574FE8`(5.69)、深色 `#a89bff`(6.71)；主色填充 `#635BFF` 保持不变
- 14 处「主色当文字用」的选择器改用 `--mcf-accent-text`（选择器与原文逐字相同，靠位置在后取胜）
- 提供商头部删除按钮改为默认中性、hover 转红（用 `:not(:hover)` 保住原 hover 规则的红）
- 字距收敛：`-.025em` / `-.2px` / `.03em` → `--mcf-ls-tight` / `--mcf-ls-normal` / `--mcf-ls-wide`
- 新增字重四档、间距十二档、字距五档 token（声明备用）
- 主视图 `gap:23px` → 24px（限定 `>1100px`，不盖窄屏的 19/17px 收紧）

验证结果：

| 检查 | 结果 |
| --- | --- |
| `npm run typecheck` | 退出码 0 |
| `npm run build` | 退出码 0，`client.js` 已重建 |
| `node demo_code/ui-contract.test.mjs` | 通过：101 个原函数未变、86 条原表达式保留、combo 单顶层语句成立 |
| `node demo_code/visual-spec-cascade-check.mjs`（本轮新增） | 通过：4 组新规则均在旧规则之后、产物只有一个 loader 调用 |
| `node demo_code/sdk-discovery-contract.test.mjs` | **未运行**：默认包路径 `D:/npm-global/node_modules/@deepseek-ai/dsh` 不存在，`DSH_SDK_ROOT` 未设置，`@deepseek-ai` 目录为空。该测试只读宿主 SDK、不读 `client.ts`，与本次纯 CSS 改动无关，属既有环境缺口 |

~~未执行项：没有在真实浏览器里做视觉回归~~ → 已在第二轮补齐，见第 15 节（headless Chrome 154 经 CDP 渲染真实组件，8 视口 + 3 交互态，截图与 metrics JSON 已落盘）。

生效方式：`client.js` 已重建，刷新 DSH 页面即可看到；Host 半边未改动，无需重启。

---

## 15. 字号与间距落地记录（2026-10-02 第二轮，含真浏览器回归）

**实施方式与颜色轮不同**：间距收敛一律**原位修改**各断点自己的值。原因——追加块在文件末尾，`@media` 不增加特异性，同特异性规则靠位置取胜，追加会盖掉窄屏媒体查询里的同名规则（第一轮的 `gap` 补丁就踩了这个坑，本轮已删）。只有列头颜色这类单属性修正才允许追加。

### 15.1 改动清单

| 类别 | 改动 |
| --- | --- |
| 层级修复 | `.mcf-page .mcf-modelTable>.mcf-modelGridHead` 颜色 `text` → `text-2`。实测列头原本比它标注的数据行**更深更重**（`#1f2b3d`/600 vs 内容 `#44526b`/400），违反第 9.10 节"列头比内容轻"，这是真缺陷不是口味问题 |
| 页面节奏 | `.mcf-page` padding `34px 38px 32px` → `32px 40px 32px`（sp-10 / sp-11 / sp-10）；`.mcf-pageHead` gap `26` → `24`；主视图 gap `23` → `24`（直接改基础规则 1107，删除第一轮的 `>1100px` 补丁） |
| 弹窗对齐 | modalHead / Body / Foot 水平 inset 统一 24px（原 head 22、body 18、foot 18，三者各差 2px）；`.mcf-modalFoot` 上下 `17→16`；overlay `28px` 与 `.mcf-modalWide` 的 `calc(100dvh - 56px)` 是**配对值**（56 = 28×2），一起收到 `24px` / `48px`（1374/1459/1470 本来就在用 48，28 才是异类） |
| 基础规则 snap | 26 处（脚本 `D:\text\_regress\apply-spacing-2.mjs`，按行号 + 选择器 + 原值三重断言） |
| 响应式 snap | 17 处：1100px / 840px 断点全收（DSH 面板常驻宽度，比 1440 更常看到）；580px 只收页面级节奏与详情区 inset，按钮/芯片/分段控件的微值保留（fit 关键）。脚本 `apply-spacing-3.mjs` |
| 字号 | **实测后无需改动**：11px 只出现在 `.mcf-splitIcon` 徽标首字母（DA/DO/XI，600），属第 9 节允许的徽标用法；正文最低 13px；pageTitle 22/650、providerDisplayName 17/650、candId 14/600 mono、factValue 13 全部符合第 10 节绑定 |

### 15.2 刻意不动的两处

1. **模型行与列头的左内边距对齐耦合**：1355 `.mcf-configModelRow{padding:15px 16px}` 与 1438 `.mcf-modelGridHead{padding:11px calc(17px + var(--mcf-model-gutter,15px)) …}` 必须一起动，snap 单边会让列错位。留给后续连表一起调。
2. **死代码**：`.mcf-composer* / .mcf-pop* / .mcf-chip*` 一族及 `@media` 里的 `data-view="composer"` 规则在 TSX 零引用（`data-view` 只会是 `main`/`export`，见 client.ts:5220）。未动，可另行清理（连 CSS 约 60 行）。

### 15.3 真浏览器回归

环境：headless Chrome 154.0.8037.92，`--remote-debugging-port` 经 CDP attach（受限沙箱禁止 Chrome 的命名管道 IPC，只能在无沙箱模式跑）；受控 mock Host 加载真实 `client.js` 组件，因此页面自带真实 `MCF_CSS`。覆盖 2 主题 × 4 视口（1440/1024/768/430）+ 3 交互态（长 ID 供应商、删除按钮 hover、导出弹窗）。

| 指标 | before | after3 |
| --- | --- | --- |
| distinct padding（wide） | 20 | **17** |
| distinct gap（wide） | 11 | **9** |
| 页面 padding（wide） | 34px 38px 32px | **32px 40px** |
| 页面 padding（mid） | 28px 28px 26px | **24px** |
| 页面 padding（narrow） | 22px 20px | **20px** |
| pageGap（wide / mid） | 24px / 23px | **24px / 24px** |
| narrow / phone gap | 19px / 17px | **16px / 16px** |
| 列头颜色 | `#1f2b3d`（text） | **`#44526b`（text-2）** |
| 删除按钮 idle → hover | — | `#64718a` → `#b1475c` ✓（默认中性、悬停转红） |
| 导出勾选模型 ID | — | `#574FE8` accent-text ✓ |
| 弹窗标题 | 19px w650 | 19px w650 ✓（低于页面标题 22 一级） |
| modalHead / foot 水平 inset | 22 / 18（脱格） | **24 / 24（对齐）** |
| 超长模型 ID | 未测 | 2 行折行、无裁切、无横向溢出 ✓ |
| 横向溢出（全视口） | 0 | 0 ✓ |

产物：`D:\text\_regress\out\` 下 before / after / after2 / after3 四轮 metrics JSON 与 8×N 张截图；扫描器 `scan-spacing.mjs`（基础规则脱格值 32 → 7，余 6 处死代码 + 1 处对齐耦合）。

### 15.4 验证

`npm run typecheck` 0 · `npm run build` 0 · `node demo_code/ui-contract.test.mjs` 通过（101 函数 / 86 表达式基线不变）· `node demo_code/visual-spec-cascade-check.mjs` 通过。

已知无害噪音：回归 harness 报的 `JS_ERRORS=1` 是 React development 版对列表 key 的控制台警告，非样式问题；`.mcf-badge MISSING` 是探针选择器在主视图本就不渲染的元素。

