var ejs = require('ejs');
var fs = require('fs/promises');
var path = require('path');
var pkg = require('../package.json');

var encoding = { encoding: 'utf8' };

const root = path.join(__dirname, '..');
const buildPath = path.join(root, 'build');
const srcPath = path.join(root, 'lib', 'src');

const jsPath = path.join(buildPath, 'engine.js');
const cssPath = path.join(buildPath, 'main.css');
const distPath = path.join(root, 'dist', `${pkg.name.toLowerCase()}-${pkg.version}`);

const ejsPath = path.join(srcPath, 'index.ejs');
const svgPath = path.join(srcPath, 'icon.svg');

const formatPath = path.join(distPath, 'format.js');
const svgOutPath = path.join(distPath, 'icon.svg');

async function doStuff() {
  const [script, style, ejsFile] = await Promise.all([
    fs.readFile(jsPath, encoding),
    fs.readFile(cssPath, encoding),
    fs.readFile(ejsPath, encoding),
  ]);


  var htmlTemplate = ejs.compile(ejsFile);

  var formatData = {
    author: pkg.author.replace(/ <.*>/, ''),
    description: pkg.description,
    image: 'icon.svg',
    name: pkg.name,
    proofing: false,
    source: htmlTemplate({
      style: style,
      script: script,
    }),
    url: pkg.repository,
    version: pkg.version
  };

  try {
    await fs.mkdir()
  }
  catch {
  }

  await Promise.all([
    fs.writeFile(formatPath, `window.storyFormat(${JSON.stringify(formatData)});`),
    fs.copyFile(svgPath, svgOutPath),
  ]);
}

doStuff();
