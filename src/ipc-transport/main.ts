import { type IpcTransport } from '../types';

import { type BrowserWindow, ipcMain } from 'electron';

export default (window : BrowserWindow) : IpcTransport => {
    const win = window.webContents;

    let messageHandler : ((message: string) => void) | undefined;

    const processMessage = (event: Electron.IpcMainEvent, message: string) : void => {
        if (
            messageHandler != null &&
            event.sender === win
        ) {
            messageHandler(message);
        }
    };

    ipcMain.on('AgnosticElectronCommunicator', processMessage);

    const transport : IpcTransport = Object.create(null, {

        // nothing to do
        aecDisconnection: { value: () => {} },
        aecReady: { value: () => Promise.resolve() },

        // indicate this is an AEC IPC transport
        isAecIpcTransport: { value: true },

        // sends data through IPC
        aecSend: {
            value: (data : any) => {
                win.send('AgnosticElectronCommunicator', data);
            }
        },

        // adds a listener for data from IPC
        aecMessage: {
            value: (handler: (message: string) => void) : void => {
                if (messageHandler != null) {
                    throw new Error('message handler already assigned');
                }
                messageHandler = handler;
            }
        },

        aecDisconnect: {
            value: () => {
                ipcMain.off('AgnosticElectronCommunicator', processMessage);
                messageHandler = undefined;
            }
        }
    });

    return transport;
};