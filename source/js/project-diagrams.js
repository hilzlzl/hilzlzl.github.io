// 保存 Mermaid 源码，切换明暗模式后按当前主题重新渲染。
(function () {
  const diagrams = Array.from(document.querySelectorAll('.project-diagram .mermaid'), (node, index) => ({
    node, source: node.textContent, id: `project-diagram-${index}`
  }));
  if (!diagrams.length || !window.mermaid) return;

  let rendering = false;
  let pending = false;
  async function render() {
    pending = true;
    if (rendering) return;
    rendering = true;
    try {
      while (pending) {
        pending = false;
        const dark = document.documentElement.dataset.userColorScheme === 'dark';
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: dark ? 'dark' : 'neutral',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif',
          flowchart: { htmlLabels: false, curve: 'linear', useMaxWidth: true }
        });
        for (const diagram of diagrams) {
          const { svg } = await mermaid.render(diagram.id, diagram.source);
          diagram.node.innerHTML = svg;
        }
      }
    } catch (error) {
      // 加载或渲染失败时保留可读的流程源码。
      for (const diagram of diagrams) diagram.node.textContent = diagram.source;
      console.error('Mermaid render failed:', error);
    } finally {
      rendering = false;
    }
  }
  new MutationObserver(render).observe(document.documentElement, {
    attributes: true, attributeFilter: ['data-user-color-scheme']
  });
  render();
})();
