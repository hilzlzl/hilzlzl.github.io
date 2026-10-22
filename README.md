# hilzl · 研究与工程

完整博客源码，使用 Hexo 7.3.0 + Fluid 1.9.8，沿用旧站的导航、归档、分类、标签、文章目录和明暗模式。

- 线上网址：https://hilzlzl.github.io/
- 源码分支：`source`，以后都在这个分支写文章、改配置。
- 发布方式：GitHub Actions 构建并部署 GitHub Pages。
- `public/` 是构建产物，不需要提交。

## 本地预览

安装 Node.js 22 LTS 或更新版本后，在本目录执行：

```bash
npm ci
npm start
```

浏览器打开 http://localhost:4000/ 。修改 Markdown 或配置后，如页面未更新，重启 `npm start`。

检查正式产物：

```bash
npm run build
npm run check
```

## 第一次替换旧站

旧站已保存在本目录旁的 `blog-before-20261022.bundle`（包含所有原分支历史）和 `blog-before-20261022.zip`（旧站网页快照）中。新源码分支继承原仓库历史，替换上线无需删除 GitHub 仓库。

已准备 `tools/publish.sh` 与 `tools/publish.ps1`。脚本会先构建并校验，确认 GitHub CLI 登录，然后备份远程旧站、推送源码、将默认分支改为 `source`，并将 Pages 切换为 GitHub Actions，最后触发部署。不会强制推送或删除分支。

Linux / WSL：

```bash
gh auth login --hostname github.com --git-protocol https --web
bash tools/publish.sh
```

Windows PowerShell（先安装 Node.js、Git 和 [GitHub CLI](https://cli.github.com/)）：

```powershell
gh auth login --hostname github.com --git-protocol https --web
powershell -ExecutionPolicy Bypass -File .\tools\publish.ps1
```

也可以手动发布：提交并推送 `source` 分支，在仓库 `Settings → Pages → Build and deployment → Source` 选择 **GitHub Actions**，然后到 `Actions → Build and deploy blog → Run workflow`，选择 `source` 运行。建议把仓库默认分支改为 `source`，避免以后在旧网页分支里误修改。

发布脚本会为原有 `github-pages` 环境新增 `source` 部署权限。手动发布时，如果环境限制了部署分支，在 `Settings → Environments → github-pages` 中允许 `source`。部署成功前，旧站仍是线上版本；以 Actions 成功状态和实际网页为准。

## 后续更新

```bash
git switch source
git pull --ff-only
# 修改文章或配置后：
npm run build
npm run check
git add .
git commit -m "Update blog"
git push origin source
```

推送后 Actions 自动更新线上网站。不要手动编辑构建出来的 HTML。

常用操作见 [博客维护说明](维护说明.md)。
