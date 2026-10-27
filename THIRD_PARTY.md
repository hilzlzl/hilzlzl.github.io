# Third-party assets

The site uses Hexo 7.3.0 and Fluid 1.9.8 under their respective licenses, distributed through npm and locked in `package-lock.json`.

Browser assets are stored locally to make rendering independent of third-party CDN availability. Original copyright headers and license files are preserved where supplied by the packages.

| Asset | Version | Upstream | License |
| --- | --- | --- | --- |
| jQuery | 3.6.4 | https://github.com/jquery/jquery | MIT |
| Bootstrap | 4.6.1 | https://github.com/twbs/bootstrap | MIT |
| AnchorJS | 5.0.0 | https://github.com/bryanbraun/anchorjs | MIT |
| Clipboard.js | 2.0.11 | https://github.com/zenorocha/clipboard.js | MIT |
| Hint.css | 2.7.0 | https://github.com/chinchang/hint.css | MIT |
| Tocbot | 4.20.1 | https://github.com/tscanlin/tocbot | MIT |
| Mermaid Tiny | 12.2.0 | https://github.com/mermaid-js/mermaid | MIT |
| github-markdown-css | 4.0.0 | https://github.com/sindresorhus/github-markdown-css | MIT |
| Fluid theme icons | font_1749284_5i9bdhy70f8 | https://github.com/fluid-dev/hexo-theme-fluid | As distributed by Fluid; original glyphs and declarations retained |
| Fluid social icons | font_1736178_k526ubmyhba | https://github.com/fluid-dev/hexo-theme-fluid | As distributed by Fluid; original glyphs and declarations retained |

JavaScript/CSS files were retrieved from the versioned npm packages via unpkg. Icon CSS/font files were retrieved from the exact iconfont URLs referenced by Fluid 1.9.8; only URL paths were rewritten to local equivalents.

Mermaid Tiny was retrieved from the versioned `@mermaid-js/tiny` npm tarball. Its standalone bundle and license are stored in `source/vendor/mermaid/`; it loads on the projects page and articles containing Mermaid diagrams.

The downloadable Reliable Deep Research source snapshot retains its own MIT license and upstream attribution in the ZIP.
