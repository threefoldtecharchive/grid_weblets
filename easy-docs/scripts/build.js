const { readdirSync, copyFile, rmdir, mkdirSync } = require('fs')
const { promisify } = require('util');
const { join } = require('path')
const { exec } = require('child_process')
const PREFIX = "tf"

const asyncExec = promisify(exec);
const asyncCopyFile = promisify(copyFile);
const asyncRmdir = promisify(rmdir);

const dir = join(__dirname, '..', 'src', 'wc')
const dist = join(__dirname, '..', 'dist', 'elements')
const files = readdirSync(dir)

/**
 * 
 * @param { string } filename
 */
function buildElement(filename) {
    const name = filename.replace(".vue", "")
    const wc = `${PREFIX}-${name}`
    const buildDir = `.build-${name}`
    const outDir = join(__dirname, '..', buildDir);

    /* Build elements */
    asyncExec(`yarn vue-cli-service build --target wc ./src/wc/${filename} --dest ${buildDir} --name ${wc}`)
        .then(() => {
            /* On build move wc to dist */
            const fileDir = join(__dirname, '..', buildDir, `${wc}.min.js`)
            return asyncCopyFile(fileDir, join(dist, `${wc}.min.js`))
        })
        .then(() => {
            /* Remove no longer needed build folder */
            return asyncRmdir(outDir, { recursive: true })
        })
}

const builds = Promise.all(files.map(buildElement))


/* Build */
mkdirSync(dist)
builds.then()