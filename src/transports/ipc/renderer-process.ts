import { IpcTransport } from "../../typings/transport";

export default (namespace: string) : IpcTransport | void => {
    if (window == null) {
        return;
    }
    const transport : IpcTransport | void = (window as any)[namespace];
    if (
        transport == null ||
        transport.isAecIpcTransport !== true
    ) {
        return;
    }
    return transport;
};