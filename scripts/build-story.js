
const { exec } = require ("child_process");
const path = require("path");

const tweego_root = path.join(__dirname, '..', 'tweego');
const story_root = path.join(__dirname, '..', 'sample_story');

function buildStoryWin32() {
    const execPath = path.join(tweego_root, 'win', 'tweego.exe');
    exec(`${execPath}`)
}

switch(process.platform){
    case 'win32':
}