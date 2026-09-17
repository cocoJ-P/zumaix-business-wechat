# 「筑脉查查」视觉语言复刻 Prompts（Web）

把小程序的**视觉语言**套到已有 Web 页面上。只改颜色、字体、字号、字重、字距、行高、圆角、描边、阴影、表面质感。不改结构、不改文案、不改交互。

用法：先贴 **Prompt 0（硬约束）**，再贴 **Prompt 1（主 prompt）**。若某屏还不像，再按需补 Prompt 2–6。文末是可落地的 token 表，可直接做成 CSS 变量。

字号换算：小程序 750 设计稿，`2rpx ≈ 1px`（375 宽）。Web 按这套 px 落地，不要擅自放大成 16px 默认体。

---

## Prompt 0 · 硬约束（每次必贴）

```text
你正在把「北辰云空间 · 查查」小程序的视觉语言复刻到现有 Web 页面。

只改视觉语言：颜色、字体栈、字号、字重、字距、行高、圆角、边框、阴影、表面材质、插画装饰色。

禁止：
- 改 DOM / 布局网格 / 信息层级 / 组件结构
- 增删文案、改措辞、改数据展示逻辑
- 改交互、动效流程、手势、路由、表单行为
- 引入新组件、新图标体系、暗色模式
- 用 Tailwind / Material / Ant Design / shadcn 默认色和默认字号覆盖本规范
- 把政务蓝和松柏绿混用成「一个主色」
- 大圆角、厚投影、霓虹渐变、玻璃拟态作为默认表面

原则：安静、密、可信、纸质编辑风 + 政务身份。像一本暖色纸上的公务工具，不是消费级花哨 App。
```

---

## Prompt 1 · 主视觉语言（先贴这个）

```text
用下面这套「筑脉查查」视觉语言，只重绘现有 Web 页面的外观。结构、文案、交互一律不动。

# 气质
暖纸公务工具。画布是米纸，字是暖黑墨，身份是北辰政务蓝，内容里的行动/判断是松柏绿。几何插画只出现在发现卡右下角，正文区永远留白。不要科技蓝黑、不要青绿渐变仪表盘、不要圆润消费风。

# 双主色（必须分开用）
1) 政务蓝 Civic Blue —— 身份与顶栏，不是内容里的默认按钮色
   - Hero / 导航底 / 刷新条：#015DDE
   - Tab 选中 / 页内文字 Tab 下划线 / 服务页勾选标记：#0B66E4
   - 发现卡「北辰」主色：#0061ED
   - 首页搜索条内「查查」、服务页主 CTA：实心 #015DDE + 白字 + 全圆胶囊
2) 松柏绿 Forest Teal —— 内容画布上的品牌行动色
   - 主色：#1F6B5C
   - 浅底：#E8F2EF
   - 深墨绿（强调句）：#16382F
   用于：内容区主按钮、链接、重试、分数、进行中状态、选中胶囊、加载转圈、未读圆点。

# 画布与墨色
- 页面底：#F4F1EB（米纸）
- 卡片/面板：#FFFFFF
- 次级底/输入底：#EFEEEA 或页面同色米纸
- 纸感卡片（发现默认、推荐架、对话框）：#F7F4EE
- 收件条：#FFFDF9
- 主文字：#1C1C1A
- 次文字：#6B6A66
- 辅文字/占位：#9A9994
- 快捷入口标签：#5F666C
- 未选 Tab：#9199A2
- 等待圆点：#C4C1B8
- 发丝分割：rgba(28,28,26,0.05) ~ 0.07；实线边：#E6E4DE
- 禁用：opacity 0.45；按压缩：opacity 0.88~0.90 或底变成 #FBFBFA / #FBFAF7

# 首页特殊表面（有则套，无则不要发明）
- 顶 Hero 带：#015DDE，白字品牌
- 中段仍是米纸 #F4F1EB（搜索胶囊、快捷入口）
- 下内容带：#4F739F，上圆角 10px，这是反相表面
  反相文字：标题 rgba(255,255,255,0.94)；次级/操作 rgba(255,255,255,0.76)；分割 rgba(255,255,255,0.10)
  反相表面上不要再用松柏绿当链接色。
- 底部 Tab：底 #F7F8FA，未选 #9199A2，选中 #0B66E4

# 字体
font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", sans-serif;
不要用 Inter / Roboto / Arial 当中文主字体。数字与中文同一套系统字体，不要等宽。

字号（Web px，禁止改成 16px 默认体）：
- 11px  标签、环境信息、列表元信息、组标题
- 12px  次级说明、kicker、状态、截止、摘要、辅助操作
- 14px  正文、按钮、输入、列表标题、搜索
- 16px  区块标题、白卡片标题、身份名
- 17px  首页区块标题（「待处理」「为您推送」）
- 18px  撰写器标题
- 20px  页标题/发现卡标题/资料数字
- 22px  判断页、服务页大标题
- 32px  匹配分数（仅此一处）

字重：400 正文；500 按钮、状态、列表强调、Tab；600 标题、选中 Tab、分数。不要 700 Bold，不要全大写英文。

字距：
- 标题/按钮 0.02em
- kicker、种类、状态标签 0.04em
- 加载眉题 0.06em
- 分组标题 0.08em（可配 11px 辅色）

行高：
- 标题 1.28~1.35
- 列表标题 1.4~1.45
- 正文 1.5~1.55
- 说明/阅读 1.6~1.65
- 加载长句 1.7
- 分数 1.0

# 圆角（偏克制，不要 16px 通用大圆）
- 标签：3px
- 控件/白卡片/输入：6px
- 撰写器面板：8px
- 快捷格按下底：8px
- 内容带顶、瓷砖、服务块、收件条、推荐架：10px
- 对话框：12px
- 发现大卡：14px
- 筛选胶囊：999px 高的一半（胶囊）
- 搜索条、首页/服务主 CTA：全圆 999px

# 阴影（极轻，纸面浮起而不是投影舞台）
- 默认卡片：0 1px 4px rgba(28,28,26,0.04)
- 抬起：0 5px 20px rgba(28,28,26,0.06)
- 推荐架：0 4px 12px rgba(28,28,26,0.04)
- 决策中：0 9px 24px rgba(28,28,26,0.10)
- 完成态圆点光晕：0 0 0 2px rgba(31,107,92,0.12)
不要 0 20px 60px 大阴影。

# 边框
Web 用 1px（原 1rpx 发丝）。颜色用 rgba(28,28,26,0.06) 或 #E6E4DE。
白卡片：#FFFFFF + 1px #E6E4DE。
纸感卡：#F7F4EE + 1px rgba(28,28,26,0.07)。
推荐架可加 1px rgba(31,107,92,0.10)。

# 按钮
- 内容区主按钮：高 44px，#1F6B5C 底，#FFFFFF 字，14px/500，圆角 6px，字距 0.02em
- 次按钮：#FFFFFF 底，#1C1C1A 字，1px #E6E4DE，同样尺寸；hover #EFEEEA
- 身份 CTA（搜索内「查查」、服务页提交）：#015DDE 底，白字，14px/500，全圆胶囊
- 文字链：14px 或 12px，#1F6B5C，500；反相表面则用白 76%

# 标签 / 胶囊
标签高 20px，左右垫 6px，11px/500，圆角 3px：
- 中性 底 #EFEEEA 字 #6B6A66
- 品牌 底 #E8F2EF 字 #1F6B5C
- 信息 底 #EAF1F5 字 #3D6B8A
- 成功 底 #E8F3EF 字 #2A7A68
- 警告 底 #F5F0E4 字 #8A6A24

筛选胶囊高 28px，圆角全圆，12px：
- 默认 底 #EFEEEA 字 #6B6A66
- 选中 底 #E8F2EF 字 #1F6B5C / 500

# 状态色（只用于语义，不当装饰）
成功 #2A7A68 / 警告 #8A6A24 / 危险 #B54A3C / 信息 #3D6B8A
进行中、待办跟松柏绿走；关闭/弱化跟辅文字走；失败跟危险走。

# 排版节奏（只调 CSS，不改结构）
页面左右垫 16~18px。区块上间距约 20px，首块约 12px。
标题下 6~10px 出正文。卡片内垫约 14px。
Kicker（12px 辅色 + 0.04em）永远在大标题之上。
种类与状态一行：12px，中间「·」辅色。

# 不要做
不要把整站主按钮改成蓝。蓝只给身份和首页/服务胶囊 CTA。
不要在米纸上用纯黑 #000 或冷灰 #333。
不要把发现卡做成四边都有插画的满幅海报；装饰只在右下，文字在左上 68% 宽。
不要给普通列表卡加渐变底。
```

---

## Prompt 2 · 只校正字体与字号

```text
只改字体相关 CSS。不要改颜色、布局、交互。

字体栈：-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", sans-serif
基础字号 14px，行高 1.5，字色保持原 token。

映射：
- 标签/元信息/组名 → 11px / 400 或 500
- 说明、kicker、状态、摘要、辅助操作 → 12px
- 正文、按钮、输入、列表主句 → 14px
- 区块标题、白卡标题 → 16px / 600 或 500
- 首页 section 标题 → 17px / 600 / 字距 0.02em
- 页英雄标题、发现卡标题、资料数字 → 20px / 600 / 行高 1.28~1.32
- 判断/服务大标题 → 22px / 600
- 匹配分数 → 32px / 600 / 行高 1

字重只用 400/500/600。kicker 和种类加 letter-spacing: 0.04em。
按钮与标题 letter-spacing: 0.02em。
单行省略保持原样，不要为了好看改成多行。
```

---

## Prompt 3 · 只校正颜色（含双主色分工）

```text
只替换颜色 token。不要改字号、圆角、布局、交互。

CSS 变量按这个对照：
--bg-primary: #F4F1EB;
--bg-secondary: #FFFFFF;
--bg-tertiary: #EFEEEA;
--bg-paper: #F7F4EE;
--bg-sheet: #FFFDF9;
--bg-tab: #F7F8FA;
--bg-slate: #4F739F;
--brand-hero: #015DDE;
--brand-tab: #0B66E4;
--brand-beichen: #0061ED;
--brand-primary: #1F6B5C;
--brand-light: #E8F2EF;
--ink-green: #16382F;
--text-primary: #1C1C1A;
--text-secondary: #6B6A66;
--text-tertiary: #9A9994;
--text-tab-muted: #9199A2;
--text-quick: #5F666C;
--border-light: #E6E4DE;
--status-success: #2A7A68;
--status-warning: #8A6A24;
--status-danger: #B54A3C;
--status-info: #3D6B8A;

分工：
- 顶栏、Hero、身份 CTA、选中 Tab → 政务蓝系列
- 内容区按钮、链接、分数、进行中 → 松柏绿
- 页面底一定是米纸，不要白底整页，也不要冷灰底
- 反相条（石板蓝 #4F739F）上的字只用白色透明度，不要绿、不要蓝字

发现卡四套主色（背面纯色，正面可铺图）：
- 北辰 beichen  #0061ED  白字
- 金融 finance  #BB426B  白字
- 政策 policy   #DAE4F1  深字
- 场景 scenario #DEFAE5  深字
```

---

## Prompt 4 · 表面、圆角、边、影

```text
只改表面材质。结构与交互不动。

- 页面：#F4F1EB
- 白卡片/列表面板：#FFF + 1px #E6E4DE + 圆角 6px + 阴影 0 1px 4px rgba(28,28,26,0.04)
- 瓷砖/服务块：#FFF，圆角 10px，无描边或极淡，按下 #FBFAF7
- 纸感卡/对话框：#F7F4EE，对话框圆角 12px，发现卡 14px
- 搜索条：白底、全圆、1px rgba(28,28,26,0.06)，内右侧蓝胶囊按钮
- 首页下半内容带：#4F739F，顶圆角 10px 10px 0 0
- 输入框：底用米纸 #F4F1EB，边 #E6E4DE，圆角 6px，内垫 10px，字 14px/1.6

阴影不超过 0 5px 20px rgba(28,28,26,0.06)。
不要 blur 玻璃（决策边缘霜化除外，且那是手势反馈，Web 若无此交互就不要加）。
```

---

## Prompt 5 · 发现卡（为您推送）

```text
只改发现卡视觉，不改翻面、滑动、数据结构。

卡片：宽 100%，高 240px（原 480rpx），圆角 14px，内垫 16px 16px 14px，抬起阴影 0 5px 20px rgba(28,28,26,0.06)。

四套主题（opportunity_type）：
- beichen  主色 #0061ED  白字  装饰：右下长城+星，几何块面，纯色蓝
- finance  主色 #BB426B  白字  装饰：右下两道圆弧，品红到浅粉
- policy   主色 #DAE4F1  深字  装饰：右下抽象立柱/城市剪影，冷灰蓝
- scenario 主色 #DEFAE5  深字  装饰：右下丘陵+小路+叶片，叶绿

正面：背景图 cover，装饰只占右下；文字锁在左上约 68% 宽。
用主色做从左、从下的遮罩，避免字叠到装饰上：
linear-gradient(90deg, solid 0%, solid 30%, 86%透明 50%, 全透明 72%),
linear-gradient(0deg, solid 0%, solid 18%, 全透明 48%)

背面：不要图，铺该套主色纯色。
白字套：#FFF；次级 rgba(255,255,255,0.78)；字影 0 1px 6px rgba(0,24,72,0.28)
深字套：用默认墨色；若叠在浅图上，字影 0 1px 5px rgba(255,255,255,0.7)

无主题回退渐变（仅此时允许渐变）：
linear-gradient(158deg, #E6F0EA 0%, #E7EEF6 36%, #ECE8F3 70%, #F5F0E6 100%)
降权/普通纸卡：#F7F4EE + 1px rgba(28,28,26,0.07)

字：
- 种类 12px / 400 / #6B6A66 / 0.04em
- 间隔点 辅色
- 状态 12px / 500 / 主文字
- 标题 20px / 600 / 主文字 / 1.28 / 最多 3 行（背面 2 行）
- 理由 14px / 次文字 / 1.55 / 最多 3 行
- 备注与事实 12px / 辅色或次文字
```

---

## Prompt 6 · 组件速查（对照现有 Web 组件名套色，不改结构）

```text
按组件只改外观：

导航/顶栏：底 #015DDE，白字，不要毛玻璃。
Tab Bar：底 #F7F8FA，未选 #9199A2 12~11px，选中 #0B66E4。
页内 Tab：高 44px，未选 #9199A2 / 14px / 500；选中 #0B66E4 / 600；底线 2px #0B66E4，左右缩进约 14px。

搜索胶囊：白、全圆；输入 14px 主色；占位 14px #9A9994；右侧「查查」#015DDE 白字全圆。
快捷入口文字：14px / 500 / #5F666C；按下 rgba(0,91,172,0.06)。

Section 头：标题 17px/600 主色（反相则白 94%）；操作 12px/500 松柏绿（反相则白 76%）。

列表卡（机会）：白底、6px 圆、细边；标题 16px/600；摘要 12px/1.5 次色；分数 14px/500 松柏绿。
推荐列表（米纸上）：透明底 + 底部分割发丝；标题 14px/600；状态 12px 松柏绿 + 0.04em。
推荐列表（石板蓝上）：同样结构，全部改白透明度，分割 rgba(255,255,255,0.10)。

主按钮组件：44px 高，#1F6B5C，白字，6px 圆。
空状态：标题 14px 主色，说明 12px 辅色，行高 1.5~1.6，不要插大图。
加载：14px 次色；转圈 20px，轨 #E6E4DE，头 #1F6B5C。
对话框遮罩：rgba(28,28,26,0.32)；盒 #F7F4EE 圆 12px；标题 16px/600；正文 14px 次色/1.65。

Kicker 模式（资料/详情/核对）：12px 辅色 + 0.04em → 20px/600 标题 → 14px 次色说明。
核对页事实：标签 11px 辅色，值 14px 主色。
免责/弱说明：12px 辅色；警示用 #8A6A24，不要大红。
```

---

## Token 对照表（给人看 / 可直接做 CSS）

原单位为 rpx。Web 列按 `2rpx = 1px`。

### 色

| Token | 值 | 用途 |
| --- | --- | --- |
| `--bg-primary` | `#F4F1EB` | 页面米纸 |
| `--bg-secondary` | `#FFFFFF` | 白卡片 |
| `--bg-tertiary` | `#EFEEEA` | 次底、胶囊默认 |
| `--bg-paper` | `#F7F4EE` | 纸感卡、对话框 |
| `--bg-slate` | `#4F739F` | 首页内容反相带 |
| `--brand-hero` | `#015DDE` | 顶栏、Hero、身份 CTA |
| `--brand-tab` | `#0B66E4` | 选中 Tab |
| `--brand-primary` | `#1F6B5C` | 内容行动绿 |
| `--brand-light` | `#E8F2EF` | 绿浅底 |
| `--text-primary` | `#1C1C1A` | 主墨 |
| `--text-secondary` | `#6B6A66` | 次墨 |
| `--text-tertiary` | `#9A9994` | 辅墨 |
| `--border-light` | `#E6E4DE` | 实线边 |
| `--status-success` | `#2A7A68` | 成功 |
| `--status-warning` | `#8A6A24` | 警告 |
| `--status-danger` | `#B54A3C` | 危险 |
| `--status-info` | `#3D6B8A` | 信息 |

### 字号

| Token | rpx | Web | 典型 |
| --- | --- | --- | --- |
| `--font-xs` | 22 | 11px | 标签、元信息 |
| `--font-sm` | 24 | 12px | 说明、kicker |
| `--font-md` | 28 | 14px | 正文、按钮 |
| `--font-lg` | 32 | 16px | 区块/卡片标题 |
| section | 34 | 17px | 首页区块标题 |
| composer | 36 | 18px | 撰写器标题 |
| `--font-xl` / 标题 | 40 | 20px | 页标题、发现卡标题 |
| hero | 44 | 22px | 判断/服务大标题 |
| `--font-xxl` | 48 | 24px | 预留 |
| score | 64 | 32px | 匹配分数 |

字重：`--font-regular: 400` / `--font-medium: 500` / `--font-semibold: 600`。

### 圆角与间距

| Token | rpx | Web |
| --- | --- | --- |
| `--radius-sm` | 8 | 4px |
| 标签 | 6 | 3px |
| `--radius-md` | 12 | 6px |
| `--radius-lg` | 16 | 8px |
| 瓷砖/内容带 | 20 | 10px |
| 对话框 | 24 | 12px |
| `--radius-xl` | 28 | 14px |
| 胶囊/搜索 | 999 | 999px |
| `--space-1` ~ `--space-8` | 8~64 | 4 / 8 / 12 / 16 / 20 / 24 / 32px |
| 主按钮高 | 88 | 44px |
| 搜索输入高 | 56 | 28px（条总高约 40px） |
| 发现大卡高 | 480 | 240px |

### 发现卡主题

| key | 主色 | 字 |
| --- | --- | --- |
| `beichen` | `#0061ED` | 白 |
| `finance` | `#BB426B` | 白 |
| `policy` | `#DAE4F1` | 深 |
| `scenario` | `#DEFAE5` | 深 |

---

## 可粘贴的 Web CSS 变量

```css
:root {
  --bg-primary: #f4f1eb;
  --bg-secondary: #ffffff;
  --bg-tertiary: #efeeea;
  --bg-paper: #f7f4ee;
  --bg-sheet: #fffdf9;
  --bg-tab: #f7f8fa;
  --bg-slate: #4f739f;

  --brand-hero: #015dde;
  --brand-tab: #0b66e4;
  --brand-beichen: #0061ed;
  --brand-primary: #1f6b5c;
  --brand-light: #e8f2ef;
  --ink-green: #16382f;

  --text-primary: #1c1c1a;
  --text-secondary: #6b6a66;
  --text-tertiary: #9a9994;
  --text-tab-muted: #9199a2;
  --text-quick: #5f666c;

  --status-success: #2a7a68;
  --status-warning: #8a6a24;
  --status-danger: #b54a3c;
  --status-info: #3d6b8a;

  --border-light: #e6e4de;
  --hairline: rgba(28, 28, 26, 0.06);

  --tag-neutral-bg: #efeeea;
  --tag-neutral-text: #6b6a66;
  --tag-brand-bg: #e8f2ef;
  --tag-brand-text: #1f6b5c;
  --tag-info-bg: #eaf1f5;
  --tag-info-text: #3d6b8a;
  --tag-success-bg: #e8f3ef;
  --tag-success-text: #2a7a68;
  --tag-warning-bg: #f5f0e4;
  --tag-warning-text: #8a6a24;

  --theme-beichen: #0061ed;
  --theme-finance: #bb426b;
  --theme-policy: #dae4f1;
  --theme-scenario: #defae5;

  --radius-tag: 3px;
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-tile: 10px;
  --radius-dialog: 12px;
  --radius-xl: 14px;
  --radius-pill: 999px;

  --shadow-card: 0 1px 4px rgba(28, 28, 26, 0.04);
  --shadow-lift: 0 5px 20px rgba(28, 28, 26, 0.06);

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;

  --font-xs: 11px;
  --font-sm: 12px;
  --font-md: 14px;
  --font-lg: 16px;
  --font-section: 17px;
  --font-xl: 20px;
  --font-hero: 22px;
  --font-score: 32px;

  --font-regular: 400;
  --font-medium: 500;
  --font-semibold: 600;

  --font-sans: -apple-system, BlinkMacSystemFont, "PingFang SC",
    "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", sans-serif;
}

html,
body {
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: var(--font-md);
  line-height: 1.5;
}
```

---

## 给执行者的最短口令

```text
套「筑脉查查」视觉：米纸底 #F4F1EB + 暖墨 #1C1C1A。身份用蓝 #015DDE，内容行动用绿 #1F6B5C，两套不要混成一个主色。中文系统字体，正文 14px，标题 20/22px，不要 16px 默认体，不要 700 字重。圆角 6/10/14，阴影极轻。只改 CSS 外观，结构、文案、交互全部不动。
```
