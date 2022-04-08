"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
exports.default = (name) => {
    let messageHandler;
    const processMessage = (event, message) => {
        if (messageHandler != null) {
            messageHandler(message);
        }
    };
    electron_1.ipcRenderer.on('AgnosticElectronCommunicator', processMessage);
    const transport = Object.create(null, {
        // nothing to do
        aecDisconnection: { value: () => { } },
        aecReady: { value: () => Promise.resolve() },
        // indicate this is an AEC IPC transport
        isAecIpcTransport: { value: true },
        // sends data through IPC
        aecSend: {
            value: (data) => {
                electron_1.ipcRenderer.send('AgnosticElectronCommunicator', data);
            }
        },
        // adds a listener for data from IPC
        aecMessage: {
            value: (handler) => {
                if (messageHandler != null) {
                    throw new Error('message handler already assigned');
                }
                messageHandler = handler;
            }
        },
        aecDisconnect: {
            value: () => {
                electron_1.ipcRenderer.off('AgnosticElectronCommunicator', processMessage);
                messageHandler = undefined;
            }
        }
    });
    electron_1.contextBridge.exposeInMainWorld(name, transport);
};
//# sourceMappingURL=preload.js.map