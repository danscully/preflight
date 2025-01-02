import {mediaInfoFactory} from 'mediainfo.js'
const miopts = { chunkSize: 256 * 1024, coverData: false, format: 'object', full: false }

import {compileExpression, useDotAccessOperator} from './filtrex.js'

export async function checkFile(rules, filename, filesize, fileChunkFunc, getFileKey, getVersionTag, getUserData) {

    var mediaInfo = {}
    var userData = {}
    var fileKey = filename
    var version = ""
    var type = ""

    var errorList = []
   
 
    try {
        type = filename.split(".")[1].toUpperCase()
    } catch (e) {
        errorList.push({severity: "Warning", message:'Error getting file extension for file: ' + filename})
    }

    try {
        version = getVersionTag(filename)
    } catch (err) {
        errorList.push({severity: "Warning", message:'Error calling user "getVersionTag" function: ' + err.toString()})
    }

    try {
        mediaInfo = await getMediaInfo(filesize, fileChunkFunc)
    } catch (err) {
        const noMIError = [{severity: "Error", message: "Could not get MediaInfo: " + err.toString()}]
        return {filename: filename, userData: {}, mediaInfo: {}, errorList: noMIError}
    }

    try {
        userData = getUserData(filename, mediaInfo, version)
    } catch (err) {
        const noUDError = [{severity: "Error", message: 'Error calling user "getUserData" function: ' + err.toString()}]
        return {filename: filename, userData: {}, mediaInfo: mediaInfo, errorList: noUDError}
    }
    

    try {
        fileKey = getFileKey(filename, mediaInfo, version, userData)
    } catch (err) {
        errorList.push({severity: "Warning", message:'Error calling user "getFileKey" function: ' + err.toString()})
    }

    const results = runRules(rules, filename, mediaInfo, version, userData, type)

    return {filename: filename, userData: userData, mediaInfo: mediaInfo, errorList:errorList.concat(results)}
}


async function getMediaInfo(fileSize,fileChunkFunc) {
    try {
        var mediainfo = await mediaInfoFactory()
        if (mediainfo === undefined) {
            throw new Error('Failed to initialize MediaInfo')
        }

        var miresult = await mediainfo.analyzeData(() => fileSize, fileChunkFunc)
    } finally {
        mediainfo && mediainfo.close()
        mediainfo = null
        //This is to deal with a process limit issue
        process.removeAllListeners('uncaughtException')
        process.removeAllListeners('unhandledRejection')
    }

    return miresult
}


function runRules(rules, filename, mediaInfo, version, userData, type) {
    {
        var errorMessages = []
        var testExp
        var preExp

        for (const rule of rules) {

            try {

                preExp = compileExpression(rule.precondition, {
                    customProp: useDotAccessOperator
                })

                testExp = compileExpression(rule.test, {
                    customProp: useDotAccessOperator
                })


            } catch (err) {
                //console.log("Rule Compilation error: " + err.toString())
                errorMessages.push({ severity: "Warning", message: "Precondition/Test Compilation error: " + err.toString() })
                continue
            }

            if (preExp({ filename: filename, userData: userData, version: version, mediaInfo: mediaInfo, type: type })) {
                const result = testExp({ filename: filename, userData: userData, version: version, mediaInfo: mediaInfo, type: type })


                if (result != true) {
                    if (result != false) {
                        errorMessages.push({ severity: "Warning", message: "Rule Runtime error: " + result.toString() })
                    } else {
                        errorMessages.push({ severity: rule.severity, message: rule.message })
                    }
                }
            }
        }

        return errorMessages
    }
}
