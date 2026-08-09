# 北美一体式洗衣中心品类与 GE GUD27ESSMWW 市场分析

麦肯锡式调研报告：以 GE GUD27ESSMWW（27" Unitized Spacemaker，3.8 cu.ft. 洗 + 5.9 cu.ft. 电烘）为锚点的
北美 Laundry Center 品类全景 + 单品深挖。

- **成稿与数据抓取日**：2026-08-07（单日快照）
- **报告本体**：`index.html`（自包含网页，16 张图表，中文正文；无外部资源依赖，可直接用浏览器打开，
  亦已发布为 Claude Artifact 分享链接）
- **数据纪律**：仅收录抓取时直接观测到的硬数据，逐条标注来源 URL / 抓取方式 / 日期；
  快照冲突双记不择优；缺口不以估算填充，改为给出付费数据采购路径与必要性分析（报告第 11 章）

## 目录结构

| 文件 | 内容 |
|---|---|
| `index.html` | 报告本体（12 章 / 16 图表） |
| `data/channel_data.json` | 14 个零售渠道价格/促销/评分/评论量原始记录（含燃气版对照） |
| `data/sku_matrix.json` | 全美在售一体机 SKU 普查 + 相邻形态 + 10 个缺席品牌证据 |
| `data/market_macro_data.md` | AHAM 出货、住房/Census、DOE 新规、232 关税、公司硬事实、CPI/PPI |
| `data/paid_data_catalog.json` | 11 家付费数据供应商：产品、已公布价格、可靠性层级、入口 |
| `data/review_mining.json` | 六平台评分/评论量与好评/差评主题（附原文引语与出处） |

## 重要方法论披露

研究环境的出口代理拦截了零售/政府域名的直接页面抓取，全部数字取自搜索引擎结果快照
（provenance = search_snippet），个别快照存在最长约两周时滞。详见报告第 02 章
"研究方法与数据可信度声明"与各文件 `_meta` 字段。
