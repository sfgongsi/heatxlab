# heatxlab

Cloudflare Pages 项目 `heatxlab` 的源代码备份。

## 项目结构

```
.
├── _worker.js            # Cloudflare Pages Functions（Worker 脚本）
├── site/                 # 静态站点资源（部署到 Pages 的产物）
│   ├── index.html
│   ├── products.html / product.html
│   ├── cart.html / checkout.html
│   ├── order-tracking.html
│   ├── about.html / contact.html / blog.html / policies.html
│   ├── assets/           # 图片资源（jpg / png）
│   ├── css/  js/
│   └── en/  cs/  ja/     # 多语言页面
├── manifest.json         # 部署清单（文件 hash + size）
├── crawl.py / crawl2.py  # 站点抓取脚本
├── deploy.py             # 部署脚本：先上传 assets 再创建 deployment
├── deploy2.py            # 部署脚本：文件内容内联在请求中
└── deploy3.py            # 部署脚本：使用前导斜杠字段名 + _routes.json
```

## 技术说明

### `_worker.js`

Pages Functions 脚本，承担两部分职责：

1. **电商 API**：订单创建、Stripe PaymentIntent、订单查询与确认。
   商品价格由服务端从 `PRODUCTS` 商品表重新计算，不信任客户端传入的金额。
2. **兜底路由**：为售后政策页面提供 fallback，避免 404。

worker 通过 Pages 环境变量读取配置，代码中不包含任何密钥：

| 变量 | 用途 |
| --- | --- |
| `STRIPE_SECRET_KEY` | Stripe 服务端密钥（未配置时跳过在线支付） |
| `ORDERS_KV` | 订单存储 KV |
| `ASSETS` | 静态资源绑定 |

### 部署

部署脚本依赖以下环境变量，**请勿将密钥写入代码**：

```bash
export CLOUDFLARE_ACCOUNT_ID="<account-id>"
export CLOUDFLARE_API_TOKEN="<api-token>"
python3 deploy3.py
```

或直接使用官方 CLI：

```bash
npx wrangler pages deploy site --project-name heatxlab
```

`_routes.json` 配置为仅将 `/api/*` 交给 Functions 处理：

```json
{
  "version": 1,
  "include": ["/api/*"],
  "exclude": []
}
```
