import { type Transport, type AECMessage } from './types';
export { Transport, AECMessage };
import { $listeners, $methods, $transport, $messageId, $options, $pending, $send } from './symbols';
interface CommunicatorOptions {
    sendTimeout?: number;
    invokeTimeout?: number;
}
export default class Communicator {
    private [$transport];
    private [$listeners];
    private [$methods];
    private [$options];
    private [$pending];
    private [$messageId];
    constructor(transport: Transport, options?: CommunicatorOptions);
    ready(): Promise<void>;
    on(event: string, handler: () => void, once?: boolean): void;
    off(event: string, handler: () => void, once?: boolean): void;
    offAll(event?: string): void;
    invoke(method: string, ...args: any[]): Promise<any>;
    emit(event: string, ...data: any[]): Promise<void>;
    register(method: string, handler: (...args: any[]) => Promise<any>): void;
    unregister(method: string, handler: (...args: any[]) => Promise<any>): void;
    getRemoteMethods(): Promise<any>;
    [$send](data: any): Promise<void>;
}
