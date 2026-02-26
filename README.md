# bazirili

命运日历静态演示站（多页面），包含首页、功能页、分析仪表盘、关于、帮助、博客。

## 页面
- `index.html`：首页（非对称首屏 + 每日运势卡 + 可信度说明）
- `analysis.html`：分析页（三栏仪表盘 + 解释依据 + 可下载日报）
- `features.html`：功能页（核心能力 + 六维评分 + 趋势图 + 方法链路）
- `about.html`：关于页（品牌故事 + 价值观）
- `help.html`：帮助中心（FAQ 折叠 + 免责声明）
- `blog.html`：博客页（文章卡片 + 打赏区）

## 主要功能
- 六维评分与雷达图展示
- 真太阳时修正展示（按城市经度）
- 流年趋势图（滚动触发动画）
- 解释依据与可信度展示
- 全站入场动效（可感知降级）

## 本地运行
```powershell
cd D:\hjw\codex\bazirili
python -m http.server 8080 --bind 127.0.0.1
```

访问：`http://127.0.0.1:8080`

## 线上预览
GitHub Pages：`https://smhjw.github.io/bazirili/`
