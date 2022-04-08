export default interface Transport {
    aecDisconnection: (handler : () => void) => void;
    aecMessage: (handler : (message: string) => void) => void;
    aecReady: () => Promise<void>;
    aecSend: (data: string) => Promise<void>;
    aecDisconnect: () => void;
}

export interface IpcTransport extends Transport {
    isAecIpcTransport: boolean;
}