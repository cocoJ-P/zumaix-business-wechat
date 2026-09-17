# 「为您推送」卡片背景映射

首页「为您推送」只使用四套卡片视觉。后端传 `opportunity_type` 时，按下面的 key **直接落到对应卡片**。

## 四套卡片

| 卡片 | 后端 `opportunity_type` | 正面 | 背面（正面主色纯色） | 文字 |
| --- | --- | --- | --- | --- |
| 北辰 | `beichen` | `beichen.png` | `#0061ED` | 白字 |
| 金融 | `finance` | `finance.png` | `#BB426B` | 白字 |
| 政策 | `policy` | `policy.png` | `#DAE4F1` | 深色字 |
| 场景 | `scenario` | `scenario.png` | `#DEFAE5` | 深色字 |

图片放在：

```text
miniprogram/images/discovery-bg/
```

微信开发者工具访问路径：

```text
/images/discovery-bg/beichen.png
/images/discovery-bg/finance.png
/images/discovery-bg/policy.png
/images/discovery-bg/scenario.png
```

正面铺背景图（`aspectFill`），背面不再铺图，只用该套卡片的主色纯色底。

## 映射表在哪里

```text
miniprogram/utils/discoveryBackground.ts
```

取图顺序：

1. 后端字段 `opportunity_type`（优先，四个英文 key 最稳定）
2. 卡片上展示的种类文案（如「政策」「创赛」）
3. 都匹配不到时，使用北辰卡 `beichen`

图片加载失败时，正面会回退成同一套主色纯色底，不影响其它卡片。

## 后端怎么传

推荐直接传这四个值之一：

```json
{ "opportunity_type": "policy" }
```

```json
{ "opportunity_type": "finance" }
```

```json
{ "opportunity_type": "scenario" }
```

```json
{ "opportunity_type": "beichen" }
```

旧类型会兼容映射到这四套，不必立刻改后端：

| 旧 `opportunity_type` / 种类 | 落到哪套卡 |
| --- | --- |
| `policy` / 政策 | 政策 `policy` |
| `finance` / `financial_service` / `equity_funding` / 金融服务 / 股权融资 / 融资 | 金融 `finance` |
| `scenario` / 场景机会 / 场景 | 场景 `scenario` |
| `beichen` / `competition` / `park_service` / `other` / 创赛 / 园区服务 / 其他 / 内容 / 推荐 | 北辰 `beichen` |

## 操作步骤

1. 确认四张 png 已在 `miniprogram/images/discovery-bg/`。
2. 后端按 `beichen` / `finance` / `policy` / `scenario` 传 `opportunity_type`。
3. 重新编译小程序预览。首页当前卡片、翻面后的背面、下方预览条都会换成对应主题。
4. 若要改某套卡的主色或文件名，只改 `discoveryBackground.ts` 里的 `DISCOVERY_CARD_THEMES`。
