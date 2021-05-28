const ejs = require('ejs');
const fs = require('fs/promises');
const path = require('path');
const pkg = require('../package.json');
const { minify } = require('html-minifier');

const encoding = 'utf-8';

const root = path.join(__dirname, '..');
const buildPath = path.join(root, 'build');
const srcPath = path.join(root, 'lib', 'src');

const jsPath = path.join(buildPath, 'engine.js');
const cssPath = path.join(buildPath, 'main.css');
const distPath = path.join(root, 'dist', `${pkg.name.toLowerCase()}-${pkg.version}`);

const ejsPath = path.join(srcPath, 'index.ejs');
const svgPath = path.join(srcPath, 'icon.svg');
const templatePath = path.join(srcPath, 'templates');

const formatPath = path.join(distPath, 'format.js');
const formatLightPath = path.join(distPath, 'format_light.js');

const svgOutPath = path.join(distPath, 'icon.svg');

const node_modules = path.join(root, 'node_modules');

async function loadTemplates() {
  try {
    let promises = (await fs.readdir(templatePath)).map((fileName) => {
      if (!!fileName.match(/\.html/)) {
        const fullPath = path.join(templatePath, fileName);
        return fs.readFile(fullPath, "utf-8");
      } else {
        return Promise.resolve('');
      }
    });

    return (await Promise.all(promises)).filter(t => !!t);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/**
 * 
 * @param {object} template
 * @returns {string}
 */
function formatData(htmlTemplate, templateParams) {
  return {
    author: pkg.author.replace(/ <.*>/, ''),
    description: pkg.description,
    image: 'icon.svg',
    name: pkg.name,
    proofing: false,
    source: minify(htmlTemplate(templateParams)),
    url: pkg.repository,
    version: pkg.version 
  }
}

async function doStuff() {
  const [script, style, ejsFile, templates] = await Promise.all([
    fs.readFile(jsPath, encoding),
    fs.readFile(cssPath, encoding),
    fs.readFile(ejsPath, encoding),
    loadTemplates()
  ]);

  const [bootstrap, bootstrap_css, jquery, lodash, marked] = await Promise.all([
    fs.readFile(path.join(node_modules, 'bootstrap', 'dist', 'js', 'bootstrap.bundle.min.js')),
    fs.readFile(path.join(node_modules, 'bootstrap', 'dist', 'css', 'bootstrap.min.css')),
    fs.readFile(path.join(node_modules, 'jquery', 'dist', 'jquery.slim.min.js')),
    fs.readFile(path.join(node_modules, 'lodash', 'lodash.min.js')),
    fs.readFile(path.join(node_modules, 'marked', 'marked.min.js'))
  ]);

  var htmlTemplate = ejs.compile(ejsFile);

  var formatData_full = formatData(htmlTemplate, {
    style: /*html*/`<style>${style}</style>`,
    script: /*html*/`<script>${script}</script>`,
    templates: templates,

    bootstrap_css: /*html*/`<style>${bootstrap_css}</script>`,
    bootstrap: /*html*/`<script async>${bootstrap}</script>`,
    jquery: /*html*/`<script async>${jquery}</script>`,
    lodash: /*html*/`<script async>${lodash}</script>`,
    marked: /*html*/`<script async>${marked}</script>`
  });

  var formatData_light = formatData(htmlTemplate, {
    style: /*html*/`<style>${style}</style>`,
    script: /*html*/`<script>${script}</script>`,
    templates: templates,

    bootstrap_css: /*html*/`<link 
      rel="stylesheet" 
      type="text/css" 
      href="${pkg.ext.bootstrap_css.url}"
      anonymous
      integrity="${pkg.ext.bootstrap_css.sri}">`,

    bootstrap: /*html*/`<script 
      href="${pkg.ext.bootstrap.url}"
      integrity="${pkg.ext.bootstrap.sri}"
      anonymous
      async></script>`,

    jquery: /*html*/`<script 
      href="${pkg.ext.jquery.url}"
      integrity="${pkg.ext.jquery.sri}"
      anonymous
      async></script>`,

    lodash: /*html*/`<script 
      href="${pkg.ext.lodash.url}"
      integrity="${pkg.ext.lodash.sri}"
      anonymous
      async></script>`,

    marked: /*html*/`<script 
      href="${pkg.ext.marked.url}"
      integrity="${pkg.ext.marked.sri}"
      anonymous
      async></script>`
  });

  try {
    await fs.mkdir()
  }
  catch {
  }

  await Promise.all([
    fs.writeFile(formatPath, `window.storyFormat(${JSON.stringify(formatData_full)});`),
    fs.writeFile(formatLightPath, `window.storyFormat(${JSON.stringify(formatData_light)});`),
    fs.copyFile(svgPath, svgOutPath),
  ]);
}

doStuff();
