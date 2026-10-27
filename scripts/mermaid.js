// Hexo 先提取围栏代码，Fluid 再跳过 Mermaid 高亮；最后补上图表容器。
hexo.extend.filter.register('after_post_render', data => {
  data.content = data.content.replace(
    /<pre\b[^>]*>\s*<code\b[^>]*class="[^"]*\bmermaid\b[^"]*"[^>]*>[\s\S]*?<\/code>\s*<\/pre>/g,
    block => `<figure class="content-diagram">${block}</figure>`
  );
  if (data.content.includes('class="content-diagram"')) data.mermaid = true;
  return data;
}, 20);

// 项目页和包含 Mermaid 的文章使用同一份本地脚本。
hexo.extend.filter.register('theme_inject', injects => {
  injects.bodyEnd.raw('local-mermaid', `<% if (page.mermaid || page.layout === 'projects') { %>
    <script defer src="<%= url_for('/vendor/mermaid/mermaid.tiny.min.js') %>"></script>
    <script defer src="<%= url_for('/js/project-diagrams.js') %>"></script>
  <% } %>`);
});
