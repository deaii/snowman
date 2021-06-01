const ejs = require('ejs');
const fs = require('fs/promises');
const path = require('path');
const pkg = require('../package.json');
const { minify } = require('html-minifier');
const { JSDOM } = require('jsdom');

const encoding = 'utf-8';

const root = path.join(__dirname, '..');
const buildPath = path.join(root, 'build');
const srcPath = path.join(root, 'lib', 'src');

const indexPath = path.join(buildPath, 'index.html');
const indexFullPath = path.join(buildPath, 'index.full.html');

const svgPath = path.join(srcPath, 'icon.svg');

async function doStuff() {
  await Promise.all([
    [indexPath, 'Pierogi'], 
    [indexFullPath, 'FatPierogi'],
    [indexPath, 'PierogiTest', true],
    [indexFullPath, 'FatPierogiTest', true],
  ].map(
    async ([htmlPath, name, skipEmbed]) => {
      const html = await fs.readFile(htmlPath, encoding);

      const dom = new JSDOM(html);

      /** @type HTMLScriptElement */
      const scriptEl = dom.window.document.head.querySelector('script');

      /** @type HTMLLinkElement */
      const linkEl = dom.window.document.head.querySelector('link');

      if (!skipEmbed) {
        const scriptPath = path.join(buildPath, scriptEl.src.substr(0, scriptEl.src.indexOf('?')));
        const stylePath = path.join(buildPath, linkEl.href.substr(0, linkEl.href.indexOf('?')));

        const [script, style] = await Promise.all([
          fs.readFile(scriptPath, encoding),
          fs.readFile(stylePath, encoding)
        ]);

        // We can replace the script inline...
        scriptEl.src = null;
        scriptEl.text = script;

        // But we have to replace the link with a Style element
        /** @type HTMLStyleElement */
        const styleEl = dom.window.document.createElement('style');
        styleEl.innerHTML = style;
        dom.window.document.head.removeChild(linkEl);
        dom.window.document.head.appendChild(styleEl);
      }

      const formatData = {
        author: pkg.author.replace(/ <.*>/, ''),
        description: pkg.description,
        image: 'icon.svg',
        name: pkg.name,
        proofing: false,
        source: dom.serialize(),
        url: pkg.repository,
        version: pkg.version,
      };

      const distPath = path.join(root, 'dist', `${name.toLowerCase()}-${pkg.version}`);
      const formatPath = path.join(distPath, 'format.js');
      const svgOutPath = path.join(distPath, 'icon.svg');

      try {
        await fs.mkdir(distPath)
      }
      catch {
      }


      await Promise.all([
        fs.writeFile(formatPath, `window.storyFormat(${JSON.stringify(formatData)});`),
        fs.copyFile(svgPath, svgOutPath),
      ]);
    }),
  );
}

doStuff();
