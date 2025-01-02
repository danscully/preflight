import { app, BrowserWindow, ipcMain } from 'electron'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { join, dirname } from 'path'
import { checkFile } from "./checker.js"
import { open } from "node:fs/promises"
import { readFile } from "fs/promises";
import path from 'node:path'
import defaultFunctions from "./showspecific.mjs"
import defaultRules from "./rules.json" 
import url from 'node:url'
import Store from 'electron-store';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const store = new Store()

var rules = []
var getFileKey, getVersionTag, getUserData

async function runChecks(filepath) {
    const fileHandle = await open(filepath, "r")
    async function readChunk(size, offset) {
        var buffer = new Uint8Array(size)
        await fileHandle.read(buffer, 0, size, offset)
        return buffer
    }
    
    const filename = path.basename(filepath)
    var fileSize = (await fileHandle.stat()).size
    const results = await checkFile(rules, filename, fileSize, readChunk, getFileKey, getVersionTag, getUserData)
    await fileHandle.close()
    return results
}

async function setFunctions(gfk,gvt,gud) {
    getFileKey = gfk
    getVersionTag = gvt
    getUserData = gud

    try {
        var result
        store.set('gfkt',gfk.toString())
        store.set('gvtt',gvt.toString())
        store.set('gudt',gud.toString())
    } catch (e) {
        console.log("Error while trying to set user functions: " + e.toString())
    }
    console.log("Functions Stored")
}

async function setFunctionsFromFile(filepath) {
    try {
        const fileUrl = url.pathToFileURL(filepath)
        const {getFileKey, getVersionTag, getUserData } = await import(fileUrl)
        setFunctions(getFileKey, getVersionTag, getUserData)
        return true
    } catch (e) {
        console.log("Error setting User Functions From File: " + filepath)
        console.log(e.toString())
        return e.toString()
    }

}


async function setFunctionsFromText(getFileKeyText, getVersionTagText, getUserDataText) {
    try {
        const gfk = eval('(' + getFileKeyText + ')')
        const gvt = eval('(' + getVersionTagText + ')')
        const gud = eval('(' + getUserDataText + ')')
        
        const result = await setFunctions(gfk,gvt,gud)
        return result
    } catch (e) {
        console.log("Error setting User Functions From Text: " + getFileKeyText + '\n' + getVersionTagText + '\n' + getUserDataText)
        console.log(e.toString())
        return e.toString()
    }


}

async function getFunctions() {
    const gfkt = store.get("gfkt")
    const gvtt = store.get("gvtt")
    const gudt = store.get("gudt")

    return {
        gfkt: gfkt,
        gvtt: gvtt,
        gudt: gudt
    }
}

async function setRules(passedRules) {
    console.log('Setting Rules: ' + passedRules)
    rules = passedRules
    store.set("rules",rules)

}

async function setRulesFromFile(filepath) {
    try {
        const fileUrl = url.pathToFileURL(filepath)
        console.log("loading rules from file: " + filepath)
        const rulesText = await readFile(filepath, "utf8");
        setRules(JSON.parse(rulesText))
        return true
    } catch (e) {
        console.log('Error loading rules from file: ' + filepath)
        console.log('Error: ' + e.toString())
        return e.toString()
    }


}

function getRules() {
    return store.get('rules')
}


process.on('warning', e => console.warn(e.stack));
var mywin

const createWindow = () => {
    mywin = new BrowserWindow({
        width: 800,
        height: 900,
        minWidth: 700,
        minHeight: 700,
        title: 'Preflight Checker',
        //autoHideMenuBar: true,
        webPreferences: {
            preload: join(__dirname, '../preload/index.mjs'),
            nodeIntegration: true
        }
    })

    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    //if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    //    mywin.loadURL(process.env['ELECTRON_RENDERER_URL'])
    //} else {
        mywin.loadFile(join(__dirname, '../renderer/index.html'))
    //}
}

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
    app.quit()
} else {
    app.on('second-instance', (event, argv, workingDirectory) => {
        // Someone tried to run a second instance
        // Handle argv here
        if (process.argv.length >= 2) {
            mywin.webContents.send('cmdArgs', process.argv.slice(1));
        }
    })
}

//Menu.setApplicationMenu(false)
app.whenReady().then(() => {
    // Set app user model id for windows
    electronApp.setAppUserModelId('com.electron')

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })
  
    ipcMain.handle('run-checks', async (event, filepath) => {
        const mi = await runChecks(filepath)
        return mi
    })

    ipcMain.handle('load-rules-file', async (event, filepath) => {
        const result = await setRulesFromFile(filepath)
        return result
    })

    ipcMain.handle('load-user-functions-file', async (event, filepath) => {
        const result = await setFunctionsFromFile(filepath)
        return result
    })

    ipcMain.handle('get-rules', async (event) => {
        return await getRules()
    })

    ipcMain.handle('get-functions', async (event) => {
        return await getFunctions()
    })

    createWindow()

    mywin.webContents.on('did-finish-load', async function () {
        console.log('Initializing rules')
        //try to load localStorage to get rules
        const ruleText = await getRules()
        if (ruleText) {
            try {
                await setRules(JSON.parse(ruleText))
            } catch (e) {
                console.log("Error loading store rules.  Resetting to stock rules")
                await setRules(defaultRules)
            }
        } else {
            await setRules(defaultRules)
        }

        console.log('Initializing functions')
        const funcTexts = await getFunctions()

        if ((!funcTexts.gfkt) || (!funcTexts.gvtt) || (!funcTexts.gudt)) {
            console.log('User Function definition missing. Resetting from stock')
            await setFunctions(defaultFunctions.getFileKey,defaultFunctions.getVersionTag,defaultFunctions.getUserData)
        } else {
            console.log('Loading stored user functions')
            await setFunctionsFromText(funcTexts.gfkt, funcTexts.gvtt, funcTexts.gudt)
            
        }

        //process any command line files
        if ((process.argv.length >= 2) && (process.argv[1] != '.')) {
            console.log('start cmds: ' + process.argv)
            mywin.webContents.send('cmdArgs', process.argv.slice(1));
        }
    });
})


     