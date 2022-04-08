"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
exports.default = (window) => {
    const win = window.webContents;
    let messageHandler;
    const processMessage = (event, message) => {
        if (messageHandler != null &&
            event.sender === win) {
            messageHandler(message);
        }
    };
    electron_1.ipcMain.on('AgnosticElectronCommunicator', processMessage);
    const transport = Object.create(null, {
        // nothing to do
        aecDisconnection: { value: () => { } },
        aecReady: { value: () => Promise.resolve() },
        // indicate this is an AEC IPC transport
        isAecIpcTransport: { value: true },
        // sends data through IPC
        aecSend: {
            value: (data) => {
                win.send('AgnosticElectronCommunicator', data);
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
                electron_1.ipcMain.off('AgnosticElectronCommunicator', processMessage);
                messageHandler = undefined;
            }
        }
    });
    return transport;
};
//# sourceMappingURL=main.js.map