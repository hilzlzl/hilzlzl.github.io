#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
repo='hilzlzl/hilzlzl.github.io'
test "$(git branch --show-current)" = source || { echo '请先切换到 source 分支。'; exit 1; }
command -v gh >/dev/null || { echo '请先安装 GitHub CLI: https://cli.github.com/'; exit 1; }
gh auth status --hostname github.com
test -z "$(git status --porcelain)" || { echo '请先审查并提交源码修改，再运行发布脚本。'; exit 1; }
npm ci
npm run build
npm run check
gh auth setup-git --hostname github.com
git fetch origin gh-pages
git push origin refs/remotes/origin/gh-pages:refs/heads/backup/site-before-20261022
# 旧站可能只允许 gh-pages 部署；只新增 source，不移除原来的限制。
environment="repos/$repo/environments/github-pages"
if test "$(gh api "$environment" --jq '.deployment_branch_policy.custom_branch_policies')" = true; then
  if test -z "$(gh api "$environment/deployment-branch-policies" --jq '.branch_policies[] | select(.name == "source") | .id')"; then
    gh api --method POST "$environment/deployment-branch-policies" -f name=source -f type=branch --silent
  fi
fi
git push -u origin source
gh api --method PATCH "repos/$repo" -f default_branch=source --silent
gh api --method PUT "repos/$repo/pages" -f build_type=workflow --silent
gh workflow run deploy.yml --repo "$repo" --ref source
echo '部署已触发；请检查以下 Actions 结果，成功后访问原博客网址。'
gh run list --repo "$repo" --workflow deploy.yml --limit 3
