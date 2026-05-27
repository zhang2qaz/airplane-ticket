# 个人机票与报销台账系统

一个**仅供个人使用**的机票订单、发票、报销和资金差额管理 MVP。

> 仅用于个人记账、凭证管理和报销对账，**不要**用来伪造发票或规避税务合规。
> 当发票金额或报销金额高于真实付款金额时，系统会自动标记为「关注」或「异常」，方便自己识别风险。

---

## 技术栈

- Next.js 16 (App Router) · TypeScript
- TailwindCSS v4
- Prisma 7 + SQLite（`@prisma/adapter-better-sqlite3`）
- Vitest 4

页面语言为简体中文，整体走桌面端简洁后台风格。

---

## 已实现功能

### 1. 仪表盘 `/`
- 核心 KPI：总订单数、总真实付款、总发票金额、总已报销
- 总报销差额（正数显示「结余」，负数显示「未覆盖成本」）
- 未报销订单数 · 异常订单数 · 关注订单数
- 最近 10 条订单（含订单/报销/风险标签）

### 2. 机票订单 `/orders`
- 表格字段：订单号、出行人、航线、出发日期、代理、真实付款、发票金额、已报销、报销差额、实际结余、报销状态、风险等级
- 搜索（订单号 / 出行人 / 航线 / PNR / 票号 / 航司 / 代理）
- 按订单状态、报销状态筛选
- 新增、编辑、详情、删除
- **表单实时计算**：税点成本、报销差额、实际结余、风险等级；选代理后自动带出默认服务费
- **详情页摘要卡**：付款 / 发票 / 报销 / 差额 / 税点 / 结余 / 风险，一眼看全
- **附件管理**：MVP 用 URL 或路径记录，可选类型（电子客票/行程单/发票/付款凭证/报销凭证/代理报价/其他）

### 3. 代理管理 `/agents`
- 新增、编辑、删除、启用/停用
- 详情面板：订单数、累计付款、累计服务费、最近 5 条订单
- 有关联订单时禁止删除（避免误删导致数据丢失）

### 4. 报销记录 `/reimbursements`
- 按报销状态筛选（全部 / 未报销 / 已提交 / 已报销 / 被退回）
- 顶部统计卡片

### 5. 数据导出 `/export`
CSV 格式，带 UTF-8 BOM，Excel 可直接打开中文：
- 全部订单（含所有字段，包括派生金额和风险等级）
- 报销记录
- 代理统计（含每个代理累计金额）

### 6. 设置 `/settings`
- 默认税点（新增订单时自动填入）
- 货币代码

### 7. 风险提醒
风险判断函数 (`src/lib/risk.ts`) 实现以下规则：

| 规则                                     | 触发后等级     |
| ---------------------------------------- | -------------- |
| `invoice > actualPaid`                   | 至少 **关注**  |
| `reimbursed > actualPaid`                | 至少 **关注**  |
| `reimbursed > invoice`                   | **异常**       |
| `netBalance < 0`                         | 至少 **关注**  |
| 发票/付款/报销 任一缺失                  | 至少 **关注**  |

订单列表、详情、编辑表单都会以彩色 chip 显示风险，并在详情和表单顶部展示触发原因。

---

## 本地运行

### 准备环境

要求 Node.js ≥ 20。建议 Node 22+。

```bash
git clone https://github.com/zhang2qaz/airplane-ticket.git
cd airplane-ticket
npm install
```

### 数据库初始化

```bash
# 1. 复制 env 模板（首次）
cp .env.example .env

# 2. 推送 schema 到 SQLite（会生成 prisma/dev.db）
npm run db:push

# 3.（可选）灌入示例数据
npm run seed

# 4. 启动开发服务器（默认 http://localhost:3000）
npm run dev
```

### 数据库重置

```bash
npm run db:reset   # 清空并重建 + 重新 seed
```

### Prisma Studio（可视化查看数据）

```bash
npm run db:studio
```

---

## 测试

```bash
npm test           # 一次性跑全部
npm run test:watch # 监听模式
```

测试覆盖：

- 税点成本计算
- 报销差额计算
- 实际结余计算
- 风险判定（5 条规则全覆盖）
- 金额为空 / 0 / NaN 时不报错

总计 17 条用例，覆盖 `src/lib/money.ts` 和 `src/lib/risk.ts`。

---

## 校验

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # ESLint
npm run build       # next build
```

---

## 目录结构

```
src/
  app/
    page.tsx                   # 仪表盘
    layout.tsx                 # 含左侧导航
    orders/
      page.tsx                 # 列表
      new/page.tsx             # 新增
      [id]/page.tsx            # 详情
      [id]/edit/page.tsx       # 编辑
    agents/page.tsx            # 代理管理
    reimbursements/page.tsx    # 报销记录
    export/page.tsx            # 数据导出
    settings/page.tsx          # 设置
    api/
      orders/                  # 订单 CRUD
      agents/                  # 代理 CRUD
      attachments/             # 附件
      export/{orders,reimbursements,agents}/route.ts   # CSV 导出
      settings/route.ts
  components/
    Sidebar.tsx
    PageHeader.tsx
    OrderForm.tsx              # 含实时计算 + 风险评估
    Chips.tsx                  # 风险/状态标签
    Money.tsx
  lib/
    prisma.ts                  # PrismaClient + better-sqlite3 adapter
    money.ts                   # 金额纯函数
    risk.ts                    # 风险评估纯函数
    enums.ts                   # 中文标签映射
    dates.ts                   # 日期工具
    csv.ts                     # CSV 输出（含 UTF-8 BOM）
    orderUtils.ts              # 写入前的字段规整
prisma/
  schema.prisma                # 数据模型
  seed.ts                      # 示例数据
tests/
  money.test.ts
  risk.test.ts
```

---

## 后续可加功能（已有意识控制范围，故未实现）

- **真实附件上传**：当前用 URL/路径记录，没做文件二进制上传/存储
- **导入 CSV**：从 Excel 批量导入历史订单
- **按月/季度的汇总**：分时间段查看现金流和报销节奏
- **多币种**：当前金额一律 CNY；如有外币订单可加 currency + 汇率字段
- **轻量备份/还原**：直接复制 `prisma/dev.db` 即可，但可以加一键导入/导出 JSON
- **多人/多账号**：本系统不打算做，要做就推荐另一套

---

## 不会做的事

- ❌ 任何「帮忙伪造发票 / 虚开发票 / 凑差额」的功能
- ❌ 复杂权限 / 审批流 / 多租户 / 企业级财务模块
- ❌ 离线打包给非自用场景使用

发票金额或报销金额高于真实付款金额时，系统**只会**自动提醒「请自行确认合规性 / 保留完整说明与凭证」，不会自动修改或隐藏数据。
