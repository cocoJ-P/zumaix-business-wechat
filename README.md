# 筑脉查查

「筑脉企服」企业侧轻量入口。微信原生小程序前端。

当前阶段：

```text
D4.2 Mini Program Discovery Feed Integration
```

「查一个机会」通过 UserSubmission 写入筑脉企服 Backend。首页「为你发现」读取 Backend active DiscoveryItem。机会 Tab 仍基于 Mock Data。

用微信开发者工具打开本目录即可编译预览。AppID 已保留在 `project.config.json`。

## API Development

小程序通过统一 API Client 连接筑脉企服 Backend，页面不直接 `wx.request`。

本地 Backend 默认：

```text
http://127.0.0.1:8000
```

配置入口：

```text
miniprogram/api/config.ts
```

```ts
API_ENV = 'development' | 'staging' | 'production'
API_BASE_URL
DEV_USER_ID
REQUEST_TIMEOUT_MS
CREATE_SUBMISSION_TIMEOUT_MS
PROCESS_SUBMISSION_TIMEOUT_MS
```

切换环境时只改 `API_ENV`（以及对应环境的 Base URL），不要改页面代码。

## Development Identity

Development Identity 仅用于本地 / 开发联调，不是正式认证，不能当作生产安全机制。

```text
DEV_USER_ID
↓
API Client
↓
X-Dev-User-Id
↓
GET /api/me
```

开发默认：

```text
DEV_USER_ID=2d7c1f4a-8b3e-4a91-9c2d-6e5f4a3b2c10
```

`DEV_USER_ID` 不是 Access Token、Secret、Password 或 openid。未配置时不发送 `X-Dev-User-Id`，也不会 fallback 到 Demo User。正式身份将由微信登录 / OnePass 替换。

不要使用：

```http
Authorization: Bearer <user-id>
```

## 微信开发者工具

模拟器联调本地 HTTP Backend 时，需要在开发者工具中：

```text
详情 → 本地设置 → 不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书
```

`project.private.config.json` 当前已设置 `urlCheck: false`，仅用于本机开发者工具。

这不是生产方案。正式版本必须使用 HTTPS Backend 域名，并在小程序后台配置服务器合法域名。

## Production

未来正式部署：

```text
https://api.xxx.com
```

将 `API_ENV` 设为 `production`，并配置小程序服务器合法域名。D1.1 不执行正式部署。

## 真机调试

模拟器里的 `127.0.0.1` 是电脑自己；手机上的 `127.0.0.1` 是手机自己。真机必须访问电脑的局域网 IP。

当前开发机 WLAN：

```text
http://192.168.112.90:8000
```

小程序会按运行环境自动选地址：

```text
开发者工具模拟器  →  http://127.0.0.1:8000
真机调试          →  http://192.168.112.90:8000
```

换网络后，改 `miniprogram/api/config.ts` 里的 `DEV_LAN_HOST`。

Backend 必须监听所有网卡，不能只绑 `127.0.0.1`：

```bash
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

同时确认：

```text
手机和电脑在同一 Wi-Fi（避免访客网络隔离）
开发者工具已勾选「不校验合法域名」
Windows 防火墙放行 8000 端口
改完代码后重新编译，再点真机调试
```

这不是生产方案。正式版使用 HTTPS 合法域名。

## Security

```text
DEV_USER_ID
```

只是开发测试身份 UUID。不要把 LLM API Key、数据库密码、JWT secret、OnePass Secret 写入小程序代码或配置。

## Intelligence Integration

「查一个机会」通过 UserSubmission 写入筑脉企服 Backend：

```text
URL / Text
↓
POST /api/user-submissions
↓
POST /api/user-submissions/{id}/process
↓
Backend internally: Content Ingestion + Opportunity Intelligence
↓
UserSubmissionDetail
↓
Result
```

小程序不再编排 Content / Intelligence。唯一业务入口是 Backend 的 UserSubmission Orchestrator。

当前结果是对输入内容的结构化理解，不代表机会真实性已经完成验证。

Retry：

```text
Create fail → 重新 POST /api/user-submissions
Process fail → 同一 submission_id 再 POST /process
Process timeout / 网络不确定 → 先 GET /api/user-submissions/{id}
仍在 ingesting / analyzing → 只检查结果，不再次 process
```

## Discovery Feed

```text
筑脉企服 Frontend
↓
POST /api/discoveries
↓
DiscoveryItem
↓
筑脉企服 Backend
↓
筑脉查查
↓
GET /api/discoveries
↓
首页「为你发现」
```

当前 Discovery Feed = Backend `status=active` 的 DiscoveryItem。首页 Runtime 不再使用 Mock Featured。

加载方式：

```text
首次进入首页
+
下拉刷新
```

没有 Polling、WebSocket、Notification。

翻面 / 左右滑只改变当前页面 Session Deck，不写 Backend，也不写入待处理或本地 Storage。下拉刷新会按 Backend 重新建 Deck，因此滑走的 active 卡可以再次出现。这是 D4.2 的正确行为；D5 才会持久化 seen / saved / dismissed / deprioritized。

尚未实现：

```text
D5 User Feedback
Submission History
首页待处理真实化
Push / Notification
Matching
Lead
Verification
Opportunity Resolution
正式 Auth / OnePass
```

机会 Tab、「我的」线索仍是 Mock。首页待处理仍保持当前实现。

下一阶段：

```text
D4.3 E2E Service Push Acceptance
```
