import { type IpcTransport } from '../types';
import { ipcRenderer as renderer, contextBridge } from 'electron';

export default (name: string) : void => {

    let messageHandler : ((message: string) => void) | undefined;

    const processMessage = (event: Electron.IpcRendererEvent, message: string) : void => {
        if (messageHandler != null) {
            messageHandler(message);
        }
    };

    renderer.on('AgnosticElectronCommunicator', processMessage);

    const transport : IpcTransport = Object.create(null, {

        // nothing to do
        aecDisconnection: { value: () => {} },
        aecReady: { value: () => Promise.resolve() },

        // indicate this is an AEC IPC transport
        isAecIpcTransport: { value: true },

        // sends data through IPC
        aecSend: {
            value: (data : any) => {
                renderer.send('AgnosticElectronCommunicator', data);
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

        aecDestroy: {
            value: () => {
                renderer.off('AgnosticElectronCommunicator', processMessage);
                messageHandler = undefined;
            }
        }
    });

    contextBridge.exposeInMainWorld(name, transport);
};