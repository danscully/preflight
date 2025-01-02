import  { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('myAPI', {
    invoke: ipcRenderer.invoke,
    cmdArgSetup: (callback) => ipcRenderer.on('cmdArgs', callback)
  })
