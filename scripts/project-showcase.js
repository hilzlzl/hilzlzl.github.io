const { readFileSync } = require('node:fs');
const { join } = require('node:path');

// 本地模板覆盖在构建时注册，保留 Fluid 的文章列表、分页和升级路径。
hexo.extend.filter.register('before_generate', () => {
  const template = name => readFileSync(join(hexo.base_dir, 'views', name), 'utf8');
  hexo.theme.setView('_partials/project-showcase.ejs', template('project-showcase.ejs'));
  hexo.theme.setView('projects.ejs', template('projects.ejs'));
  const index = readFileSync(join(hexo.theme_dir, 'layout/index.ejs'), 'utf8');
  const showcase = `<% if (page.current === 1) { %>
    <section class="home-projects" aria-labelledby="featured-projects-title">
      <div class="section-heading">
        <div><p class="project-label">SELECTED PROJECTS</p><h2 id="featured-projects-title">把想法做成可以运行的项目</h2></div>
        <a class="section-more" href="<%= url_for('/projects/') %>">全部项目 <span aria-hidden="true">↗</span></a>
      </div>
      <%- partial('_partials/project-showcase', { compact: true }) %>
    </section>
  <% } %>
  <div class="section-heading writing-heading"><div><p class="project-label">FIELD NOTES</p><h2>项目与随笔</h2></div><a class="section-more" href="<%= url_for('/archives/') %>">文章归档 <span aria-hidden="true">↗</span></a></div>`;
  hexo.theme.setView('index.ejs', index.replace('<% page.posts.each', `${showcase}\n<% page.posts.each`));
});
