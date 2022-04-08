import { type IpcTransport } from "../types";

export default (namespace: string) : IpcTransport | void => {
    if (window == null) {
        return;
    }
    const transport : IpcTransport | undefined = (window as any)[namespace];
    if (
        transport == null ||
        transport.isAecIpcTransport !== true
    ) {
        return;
    }
    return transport;
};