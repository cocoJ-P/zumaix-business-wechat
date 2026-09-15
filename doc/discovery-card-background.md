# 「为您推送」卡片背景映射

按内容种类为首页「为您推送」卡片配置不同背景图。

## 图片放哪里

把背景图放到：

```text
miniprogram/images/discovery-bg/
```

微信开发者工具里对应的访问路径是：

```text
/images/discovery-bg/
```

建议使用 **png**。如果要用 jpg / webp，需要同步改映射表里的文件后缀。

推荐尺寸：宽 750px 以上、接近卡片比例的竖图或方图均可；卡片会按 `aspectFill` 裁切铺满。

## 映射表在哪里

代码映射表：

```text
miniprogram/utils/discoveryBackground.ts
```

卡片会按下面顺序取图：

1. 后端字段 `opportunity_type`（英文 key，最稳定）
2. 卡片上展示的种类文案（如「政策」「创赛」）
3. 都匹配不到时，使用 `default.png`

某个图片文件缺失时，该卡片会自动回退到原来的渐变背景，不影响其它卡片。

## 种类 → 文件名

把图片按这个文件名放进 `miniprogram/images/discovery-bg/`：

| 卡片种类 | 后端类型 `opportunity_type` | 文件名 |
| --- | --- | --- |
| 政策 | `policy` | `policy.png` |
| 创赛 | `competition` | `competition.png` |
| 金融服务 | `financial_service` | `financial-service.png` |
| 股权融资 / 融资 | `equity_funding` | `equity-funding.png` |
| 园区服务 | `park_service` | `park-service.png` |
| 场景机会 / 场景 | `scenario` | `scenario.png` |
| 其他 | `other` | `other.png` |
| 内容 | （来源内容，无 opportunity_type） | `content.png` |
| 推荐 | （人工推荐，无 opportunity_type） | `recommend.png` |
| 缺省 | 未匹配到以上任何种类 | `default.png` |

## 操作步骤

1. 准备好对应种类的背景图。
2. 按上表文件名，复制到 `miniprogram/images/discovery-bg/`。
3. 重新编译小程序预览。首页「为您推送」当前卡片和下方预览条都会换成对应背景。
4. 如果某种类暂时没有图，可以先不放；该种类会继续用渐变底。
5. 如果要新增一种类：
   - 先在 `miniprogram/utils/discoveryBackground.ts` 的 `DISCOVERY_BACKGROUND_BY_TYPE` 或 `DISCOVERY_BACKGROUND_BY_KIND` 里加一行
   - 再把同名图片放到 `miniprogram/images/discovery-bg/`

## 改后缀或路径

默认按 png 读取。如果改成 jpg，例如政策图要用 `policy.jpg`，在 `discoveryBackground.ts` 里把对应路径改成：

```ts
policy: `${BG_DIR}/policy.jpg`
```

不要改页面组件代码，只改这一张映射表即可。
