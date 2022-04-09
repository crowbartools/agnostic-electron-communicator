export interface Transport {
    aecDisconnection: (handler : () => void) => void;
    aecMessage: (handler : (message: string) => void) => void;
    aecReady: () => Promise<void>;
    aecSend: (data: string) => Promise<void>;
    aecDestroy: () => void;
}

export interface IpcTransport extends Transport {
    isAecIpcTransport: boolean;
}

export interface AECMessage {
    id: number | string;
    type: "invoke" | "result" | "event" | "state";
    name: string;
    status?: 'ok' | 'error';
    data: any
}