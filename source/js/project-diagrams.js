// 保存 Mermaid 源码，切换明暗模式后按当前主题重新渲染。
(function () {
  const diagrams = Array.from(document.querySelectorAll('.project-diagram .mermaid, .content-diagram .mermaid'), (node, index) => ({
    node, source: node.textContent, id: `project-diagram-${index}`
  }));
  if (!diagrams.length || !window.mermaid) return;

  // 大图放入原生对话框，关闭后把节点放回文章，避免复制 SVG 中的 ID。
  const articleDiagrams = diagrams.filter(diagram => diagram.node.closest('.content-diagram'));
  if (articleDiagrams.length) {
    const dialog = document.createElement('dialog');
    dialog.className = 'diagram-dialog';
    dialog.setAttribute('aria-label', '流程图大图');
    const close = document.createElement('button');
    close.type = 'button';
    close.textContent = '关闭大图';
    const size = document.createElement('button');
    size.type = 'button';
    size.textContent = '原始大小';
    const toolbar = document.createElement('div');
    toolbar.className = 'diagram-dialog-toolbar';
    toolbar.append(size, close);
    const viewport = document.createElement('div');
    viewport.className = 'diagram-dialog-viewport';
    dialog.append(toolbar, viewport);
    document.body.append(dialog);
    let active;
    function setSize(fit) {
      if (!active) return;
      const graph = active.node.querySelector('svg');
      const box = graph.viewBox.baseVal;
      const scale = fit ? Math.min(viewport.clientWidth / box.width, viewport.clientHeight / box.height, 1) : 1;
      graph.style.setProperty('--viewer-width', `${box.width * scale}px`);
      active.fit = fit;
      size.textContent = fit ? '原始大小' : '适应窗口';
      viewport.scrollTo(Math.max(0, (box.width * scale - viewport.clientWidth) / 2), 0);
    }
    size.addEventListener('click', () => setSize(!active.fit));
    close.addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => {
      if (!active) return;
      active.node.querySelector('svg').style.removeProperty('--viewer-width');
      active.parent.append(active.node);
      active.button.focus();
      active = undefined;
    });
    for (const diagram of articleDiagrams) {
      const figure = diagram.node.closest('.content-diagram');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'diagram-expand';
      button.textContent = '查看大图';
      button.addEventListener('click', () => {
        if (!diagram.node.querySelector('svg')) return;
        active = { parent: diagram.node.parentElement, node: diagram.node, button };
        viewport.append(diagram.node);
        dialog.showModal();
        setSize(true);
      });
      figure.prepend(button);
    }
    window.addEventListener('resize', () => { if (active?.fit) setSize(true); });
  }

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
          const graph = diagram.node.querySelector('svg');
          graph.style.setProperty('--diagram-width', `${graph.viewBox.baseVal.width}px`);
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
