$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..')
function Run-Native {
  param([string]$Command, [string[]]$Arguments)
  & $Command @Arguments
  if ($LASTEXITCODE -ne 0) { throw "$Command failed with exit code $LASTEXITCODE" }
}
if ((git branch --show-current).Trim() -ne 'source') { throw 'Switch to the source branch first.' }
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) { throw 'Install GitHub CLI first: https://cli.github.com/' }
Run-Native gh @('auth', 'status', '--hostname', 'github.com')
if (git status --porcelain) { throw 'Review and commit source changes before publishing.' }
Run-Native npm.cmd @('ci')
Run-Native npm.cmd @('run', 'build')
Run-Native npm.cmd @('run', 'check')
Run-Native gh @('auth', 'setup-git', '--hostname', 'github.com')
Run-Native git @('fetch', 'origin', 'gh-pages')
Run-Native git @('push', 'origin', 'refs/remotes/origin/gh-pages:refs/heads/backup/site-before-20261022')
Run-Native git @('push', '-u', 'origin', 'source')
Run-Native gh @('api', '--method', 'PATCH', 'repos/hilzlzl/hilzlzl.github.io', '-f', 'default_branch=source', '--silent')
Run-Native gh @('api', '--method', 'PUT', 'repos/hilzlzl/hilzlzl.github.io/pages', '-f', 'build_type=workflow', '--silent')
Run-Native gh @('workflow', 'run', 'deploy.yml', '--repo', 'hilzlzl/hilzlzl.github.io', '--ref', 'source')
Run-Native gh @('run', 'list', '--repo', 'hilzlzl/hilzlzl.github.io', '--workflow', 'deploy.yml', '--limit', '3')
Write-Host 'Deployment requested. Check Actions before visiting https://hilzlzl.github.io/.'
