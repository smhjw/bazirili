# bazirili-clone

根据截图优化后的多页面深色科技风命理网站原型。

## 页面
- `index.html`：首页（Hero + 每日运势卡 + 分析演示）
- `features.html`：功能页（核心能力 + 六维评分 + 趋势图）
- `about.html`：关于页（品牌故事 + 价值观）
- `help.html`：帮助中心（FAQ 折叠 + 免责声明）
- `blog.html`：博客页（文章卡片 + 页脚 + 微信打赏）

## 功能
- 每日运势卡（雷达图、六维评分、主题）
- 八字分析演示（输入信息后生成评分、AI 解读、流年条形趋势）
- FAQ 可展开折叠交互
- 微信收款码上传替换（仅博客页底部）

## 运行
```powershell
cd D:\hjw\codex\bazirili-clone
python -m http.server 8080 --bind 127.0.0.1
```
访问：`http://127.0.0.1:8080`
