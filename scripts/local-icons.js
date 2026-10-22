// Fluid 的基础图标地址写在模板中，在生成阶段映射到随站发布的同版本文件。
hexo.extend.filter.register('after_render:html', html => html.replaceAll(
  '//at.alicdn.com/t/c/font_1749284_5i9bdhy70f8.css', '/vendor/icons/theme.css'
));
