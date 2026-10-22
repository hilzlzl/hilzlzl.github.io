import { readdir, readFile, stat } from 'node:fs/promises';
import { resolve, join, relative, dirname } from 'node:path';
import assert from 'node:assert/strict';

const root = resolve('public');
const files = [];
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await walk(path);
    else files.push(path);
  }
}
await walk(root);
const missing = [];
let checked = 0;
for (const path of files.filter(p => /\.(html|css)$/.test(p))) {
  const text = await readFile(path, 'utf8');
  const refs = path.endsWith('.html')
    ? [...text.matchAll(/(?:href|src)=["']([^"']+)["']/g)].map(m => m[1])
    : [...text.matchAll(/url\(["']?([^\s)"']+)["']?\)/g)].map(m => m[1]);
  for (const ref of refs) {
    if (/^(?:[a-z]+:|\/\/|#)/i.test(ref)) continue;
    const clean = decodeURIComponent(ref.split(/[?#]/)[0]);
    if (!clean) continue;
    let target = ref.startsWith('/') ? join(root, clean) : resolve(dirname(path), clean);
    try {
      if ((await stat(target)).isDirectory()) target = join(target, 'index.html');
      await stat(target);
      checked++;
    } catch { missing.push(`${relative(root, path)} → ${ref}`); }
  }
  if (path.endsWith('.html')) {
    assert(!text.includes('http://example.com'), `默认网址未替换: ${path}`);
    assert(!text.includes('Please enable JavaScript to view the comments'), `残留评论: ${path}`);
    assert(!/(?:src|href)=["'](?:https?:)?\/\/(?:lib\.baomitu\.com|at\.alicdn\.com)/.test(text), `基础依赖未本地化: ${path}`);
  }
}
assert.equal(missing.length, 0, `站内链接或资源不存在:\n${missing.join('\n')}`);
for (const path of ['index.html', 'projects/index.html', 'about/index.html', 'archives/index.html', 'categories/index.html', 'tags/index.html', 'local-search.xml', '.nojekyll', 'downloads/reliable-deep-research.zip']) {
  await stat(join(root, path));
}
const index = await readFile(join(root, 'local-search.xml'), 'utf8');
assert(index.includes('Reliable Deep Research'), '缺少项目文章的搜索索引');
console.log(`检查通过：${files.filter(p => p.endsWith('.html')).length} 个页面，${checked} 条本地资源/链接，搜索索引与源码下载完整。`);
