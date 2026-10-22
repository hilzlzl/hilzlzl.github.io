// Fluid 自定义 page 需要 markdown-body 包裹，才会加载 Markdown 排版与插件。
hexo.extend.filter.register('after_post_render', data => {
  if (data.layout === 'page') data.content = `<div class="markdown-body">${data.content}</div>`;
  return data;
});
